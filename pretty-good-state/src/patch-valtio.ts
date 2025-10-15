import { unstable_replaceInternalFunction } from "valtio";
import { isRunInComponent, type State } from "./core";

export function patchValtio() {
  unstable_replaceInternalFunction("newProxy", (prev) => {
    return (object, handler) => {
      const proxy = prev(object, handler);
      if (!("$" in object)) {
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
          $: {
            value: (fn?: (state: State<typeof object>) => void) => {
              fn?.(proxy as State<typeof object>);
              return proxy;
            },
          },
        });
      }
      return proxy;
    };
  });
}
