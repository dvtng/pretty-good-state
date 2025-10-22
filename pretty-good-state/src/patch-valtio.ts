import { unstable_replaceInternalFunction } from "valtio";

export const PROXY_REF = Symbol("$");

export function $<T extends object>(state: T): T {
  return (state as any)[PROXY_REF]();
}

export function patchValtio() {
  unstable_replaceInternalFunction("newProxy", (prev) => {
    return (object, handler) => {
      const proxy = prev(object, handler);
      if (!(PROXY_REF in object)) {
        Object.defineProperty(object, PROXY_REF, {
          value: () => proxy,
        });
      }
      return proxy;
    };
  });
}
