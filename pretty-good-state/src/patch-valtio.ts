import { unstable_replaceInternalFunction } from "valtio";

export const PGS = Symbol("PGS");

export function getPGS(proxy: object) {
  return (proxy as any)[PGS];
}

export function patchValtio() {
  unstable_replaceInternalFunction("newProxy", (prev) => {
    return (target, handler) => {
      const proxy = prev(target, {
        ...handler,
        get(target, prop, receiver) {
          if (prop === PGS) {
            return (getTarget: boolean) => {
              return getTarget ? target : proxy;
            };
          }
          return Reflect.get(target, prop, receiver);
        },
      });
      return proxy;
    };
  });
}
