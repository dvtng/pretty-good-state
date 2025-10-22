import { unstable_replaceInternalFunction } from "valtio";
import { isRunInComponent } from "./core.js";

const PROXY_REF = Symbol("$");

export function $<T extends object>(state: T): T {
  return (state as any)[PROXY_REF]();
}

export function patchValtio() {
  unstable_replaceInternalFunction("newProxy", (prev) => {
    return (object, handler) => {
      const proxy = prev(object, handler);
      if (!(PROXY_REF in object)) {
        // Bind functions to the proxy
        Object.getOwnPropertyNames(object).forEach((_prop) => {
          const prop = _prop as keyof typeof object;
          if (prop === "constructor") return;
          if (typeof object[prop] === "function") {
            if (isRunInComponent(object[prop])) return;
            object[prop] = object[prop].bind(proxy);
          }
        });

        Object.defineProperties(object, {
          [PROXY_REF]: {
            value: () => {
              return proxy;
            },
          },
        });
      }
      return proxy;
    };
  });
}
