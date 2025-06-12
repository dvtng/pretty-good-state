import { createContext, useContext, useRef } from "react";
import { proxy, useSnapshot } from "valtio";
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
      _internal: {
        factory,
        getProxy() {
          return state;
        },
      },
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

type Store = {
  states: Map<StateFactory<any>, State<any>>;
};

const StoreContext = createContext<Store>({ states: new Map() });

export function Provider<T extends object>({
  state,
  children,
}: {
  state: State<T>;
  children?: React.ReactNode;
}) {
  // Merge store with parent store
  const parentStore = useContext(StoreContext);
  const internal = (state as StateWithInternal<T>)._internal;
  const newStore = {
    states: new Map([
      ...parentStore.states,
      [internal.factory, internal.getProxy()],
    ]),
  };
  return (
    <StoreContext.Provider value={newStore}>{children}</StoreContext.Provider>
  );
}

export function useProvidedState<T extends object>(
  stateFactory: StateFactory<T>
): State<T> {
  const store = useContext(StoreContext);
  const state = store.states.get(stateFactory);
  if (!state) {
    throw new Error(`Can't call useProvidedState() without a Provider`);
  }
  return useSnapshot(state);
}
