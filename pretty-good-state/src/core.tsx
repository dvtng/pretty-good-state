import { createContext, useContext, useRef } from "react";
import { proxy, ref, useSnapshot } from "valtio";
import { deepClone } from "valtio/utils";

export type State<T extends object> = T & {
  readonly set: (fn: StateSetter<T>) => void;
};

export type StateSetter<T extends object> = (state: T) => void;

export type StateFactory<T extends object> = (
  setInitialValue?: StateSetter<T>
) => State<T>;

type StateWithInternal<T extends object> = State<T> & {
  _internal: {
    factory: StateFactory<T>;
    getProxy: () => State<T>;
  };
};

export function state<T extends object>(initialValue: T): StateFactory<T> {
  return function factory(setInitialValue) {
    const clonedInitialValue = deepClone(initialValue);
    setInitialValue?.(clonedInitialValue);

    const state = proxy({
      ...clonedInitialValue,
      set: (fn: StateSetter<T>) => {
        fn(state);
      },
      _internal: ref({
        factory,
        getProxy() {
          return state;
        },
      }),
    });

    // Bind functions to the state object
    Object.getOwnPropertyNames(state).forEach((_key) => {
      const key = _key as keyof T;
      if (typeof state[key] === "function") {
        state[key] = state[key].bind(state);
      }
    });

    return state;
  };
}

export function useLocalState<T extends object>(
  stateFactory: StateFactory<T>,
  setInitialValue?: StateSetter<T>
) {
  const state = useRef<State<T> | null>(null);

  if (
    state.current === null ||
    (state.current as StateWithInternal<T>)._internal.factory !== stateFactory
  ) {
    state.current = stateFactory(setInitialValue);
  }

  return useSnapshot(state.current);
}

export class Store {
  private states: Map<StateFactory<any>, State<any>> = new Map();

  constructor(private parent?: Store) {}

  setState<T extends object>(state: State<T>): void {
    const internal = (state as StateWithInternal<T>)._internal;
    this.states.set(internal.factory, internal.getProxy());
  }

  getState<T extends object>(stateFactory: StateFactory<T>): State<T> {
    let state =
      this.states.get(stateFactory) ?? this.parent?.getState(stateFactory);
    if (!state) {
      state = stateFactory();
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
  state: State<T>;
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
  stateFactory: StateFactory<T>
): State<T> {
  const store = useContext(StoreContext);
  const state = store.getState(stateFactory);
  return useSnapshot(state) as State<T>;
}
