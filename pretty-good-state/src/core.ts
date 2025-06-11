import { useState } from "react";
import { proxy, useSnapshot } from "valtio";
import { deepClone } from "valtio/utils";

export type State<T extends object> = T & {
  readonly set: (fn: StateSetter<T>) => void;
};

export type StateSetter<T extends object> = (state: T) => void;

export type StateFactory<T extends object> = (
  setInitialValue?: StateSetter<T>
) => State<T>;

export function state<T extends object>(initialValue: T): StateFactory<T> {
  return function (setInitialValue) {
    const clonedInitialValue = deepClone(initialValue);
    setInitialValue?.(clonedInitialValue);

    const state = proxy({
      ...clonedInitialValue,
      set: (fn: StateSetter<T>) => {
        fn(state);
      },
    });

    return state;
  };
}

export function useLocalState<T extends object>(
  stateFactory: StateFactory<T>,
  setInitialValue?: StateSetter<T>
) {
  const [state] = useState(() => stateFactory(setInitialValue));

  return useSnapshot(state);
}
