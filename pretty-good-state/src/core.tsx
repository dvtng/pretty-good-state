import { createContext, useContext, useRef } from "react";
import { proxy, useSnapshot } from "valtio";
import { deepClone } from "valtio/utils";

export type State<T extends object> = T &
  StateIdentity<T> & {
    readonly set: (fn: StateSetter<T>) => void;
  };

export type StateIdentity<T extends object> = {
  readonly get: () => State<T>;
  readonly constructor: StateConstructor<T>;
};

export type StateConstructor<T extends object> = (
  setInitialValue?: StateSetter<T>
) => State<T>;

export type StateSetter<T extends object> = (state: T) => void;

export function defineState<T extends object>(
  initialValue: T
): StateConstructor<T>;

export function defineState<T extends object>(
  initialValue: () => T
): StateConstructor<T>;

export function defineState<T extends object>(
  initialValue: T | (() => T)
): StateConstructor<T> {
  return function constructor(setInitialValue?: StateSetter<T>) {
    const clonedInitialValue =
      typeof initialValue === "function"
        ? initialValue()
        : deepClone(initialValue);

    setInitialValue?.(clonedInitialValue);

    const state: State<T> = proxy({
      ...clonedInitialValue,
      set: (fn) => {
        fn(state);
      },
      get: () => state,
      constructor,
    });

    // Bind functions to the state object
    Object.getOwnPropertyNames(state).forEach((_key) => {
      const key = _key as keyof T;
      if (key === "set" || key === "get" || key === "constructor") {
        return;
      }
      if (typeof state[key] === "function") {
        state[key] = state[key].bind(state);
      }
    });

    return state;
  };
}

/**
 * @deprecated Use `defineState` instead.
 */
export const state = defineState;

export function useLocalState<T extends object>(
  constructor: StateConstructor<T>,
  setInitialValue?: StateSetter<T>
) {
  const state = useRef<State<T> | null>(null);

  if (state.current === null || state.current?.constructor !== constructor) {
    state.current = constructor(setInitialValue);
  }

  return useSnapshot(state.current);
}

export class Store {
  private states: Map<StateConstructor<any>, State<any>> = new Map();

  constructor(private parent?: Store) {}

  setState<T extends object>(state: StateIdentity<T>): void {
    this.states.set(state.constructor, state.get());
  }

  getState<T extends object>(constructor: StateConstructor<T>): State<T> {
    let state =
      this.states.get(constructor) ?? this.parent?.getState(constructor);
    if (!state) {
      state = constructor();
      this.setState(state);
    }
    return state;
  }
}

export const globalStore = new Store();

const StoreContext = createContext<Store>(globalStore);

export function Provider<T extends object>({
  state,
  children,
}: {
  state: StateIdentity<T>;
  children?: React.ReactNode;
}) {
  const parentStore = useContext(StoreContext);
  const storeRef = useRef<Store | null>(null);
  if (storeRef.current === null) {
    storeRef.current = new Store(parentStore);
  }
  storeRef.current.setState(state);

  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
}

export function useProvidedState<T extends object>(
  constructor: StateConstructor<T>
) {
  const store = useContext(StoreContext);
  const state = store.getState(constructor);
  return useSnapshot(state);
}
