import { createContext, useContext, useState } from "react";
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
  const newStore = {
    states: new Map([
      ...parentStore.states,
      [(state as StateWithInternal<T>)._internal.factory, state],
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
  return store.states.get(stateFactory) ?? stateFactory();
}
