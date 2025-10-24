import { unstable_replaceInternalFunction } from "valtio";

export const PGS = Symbol("PGS");

export function patchValtio() {
  unstable_replaceInternalFunction("newProxy", (prev) => {
    return (target, handler) => {
      const proxy = prev(target, handler);
      if (!(PGS in target)) {
        Object.defineProperty(target, PGS, {
          value: (getTarget: boolean) => {
            return getTarget ? target : proxy;
          },
        });
      }
      return proxy;
    };
  });
}
