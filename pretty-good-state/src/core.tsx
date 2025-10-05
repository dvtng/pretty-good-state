import { createContext, useContext, useRef } from "react";
import { proxy, ref, useSnapshot, type Snapshot } from "valtio";
import { deepClone } from "valtio/utils";

export type State<T extends object> = T & StateX<T>;

export type StateSnapshot<T extends object> = Snapshot<T> & StateX<T>;

export type StateX<T extends object> = {
  readonly $: State<T>;
  readonly set: (fn: StateSetter<T>) => void;
  readonly constructor: StateConstructor<T>;
  [INJECTABLES]: { fn: Function; result: unknown }[];
};

export type StateConstructor<T extends object> = (() => State<T>) & {
  readonly Type: State<T>;
  readonly Provider: React.ComponentType<{
    children?: React.ReactNode;
    state?: StateX<T>;
  }>;
};

export type StateSetter<T extends object> = (state: T) => void;

const INJECTABLES = Symbol("INJECTABLES");
const INJECTABLE_FN = Symbol("INJECTABLE_FN");
const NOT_INJECTED = Symbol("NOT_INJECTED");

export function defineState<T extends object>(
  initialValue: () => T
): StateConstructor<T>;

export function defineState<T extends object>(
  initialValue: T
): StateConstructor<T>;

export function defineState<T extends object>(
  initialValue: T | (() => T)
): StateConstructor<T> {
  const constructor = function () {
    const clonedInitialValue =
      typeof initialValue === "function"
        ? initialValue()
        : deepClone(initialValue);

    const state = proxy(clonedInitialValue as State<T>);

    const injectables: { fn: Function; result: unknown }[] = [];

    // Bind functions to the state object
    Object.getOwnPropertyNames(state).forEach((_key) => {
      const key = _key as keyof T;
      if (typeof state[key] === "function") {
        if (INJECTABLE_FN in state[key]) {
          let index = injectables.length;
          injectables.push({
            fn: state[key].bind(state),
            result: NOT_INJECTED,
          });
          state[key] = (() => {
            const result = injectables[index].result;
            if (result === NOT_INJECTED) {
              throw new Error(
                "Result of the runInComponent function has not been injected yet."
              );
            }
            return result;
          }) as State<T>[keyof T];
        } else {
          state[key] = state[key].bind(state);
        }
      }
    });

    // Add StateX properties
    Object.defineProperties(state, {
      constructor: {
        value: constructor,
      },
      set: {
        value: (fn: StateSetter<T>) => {
          fn(state);
        },
      },
      $: {
        get: () => ref(state),
      },
      [INJECTABLES]: {
        value: injectables,
      },
    });

    return state;
  } as StateConstructor<T>;

  Object.assign(constructor, {
    Provider: function StateProvider({
      children,
      state,
    }: {
      children?: React.ReactNode;
      state?: StateX<T>;
    }) {
      const stateRef = useRef<StateX<T>>(undefined);
      if (stateRef.current === undefined || stateRef.current.$ !== state?.$) {
        stateRef.current = state ?? constructor();
      }
      return <Provider state={stateRef.current}>{children}</Provider>;
    },
  });

  return constructor;
}

/**
 * @deprecated Use `defineState` instead.
 */
export const state = defineState;

export function useLocalState<T extends object>(
  constructor: StateConstructor<T>,
  setInitialValue?: StateSetter<T>
) {
  const state = useRef<State<T>>(undefined);

  if (
    state.current === undefined ||
    state.current?.constructor !== constructor
  ) {
    state.current = constructor();
    setInitialValue?.(state.current);
  }

  state.current[INJECTABLES].forEach((injectable) => {
    injectable.result = injectable.fn();
  });

  return useSnapshot(state.current) as StateSnapshot<T>;
}

export class Store {
  private states: Map<StateConstructor<any>, State<any>> = new Map();

  constructor(private parent?: Store) {}

  setState<T extends object>(state: StateX<T>): void {
    this.states.set(state.constructor, state.$);
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
  state: StateX<T>;
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
  return useSnapshot(state) as StateSnapshot<T>;
}

export function runInComponent<T>(fn: () => T): () => T {
  Object.defineProperty(fn, INJECTABLE_FN, { value: true });
  return fn;
}
