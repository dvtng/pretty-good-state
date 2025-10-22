import { createContext, useContext, useLayoutEffect, useRef } from "react";
import { useSnapshot, type Snapshot } from "valtio";
import { unstable_deepProxy } from "valtio/utils";
import { patchValtio, $ } from "./patch-valtio.js";

patchValtio();

export type Infer<T extends StateConstructor<any>> = T extends StateConstructor<
  infer U
>
  ? U
  : never;

export type StateConstructor<T extends object> = ((
  setInitial?: StateSetter<T>
) => T) & {
  readonly Provider: React.ComponentType<{
    children?: React.ReactNode;
    state?: T;
  }>;
};

export type StateSetter<T extends object> = (state: T) => void;

export type SnapshotOptions = { sync?: boolean };

const HOOK_KEY_REGEX = /^use[^a-z]/;
const NOT_INJECTED = Symbol("NOT_INJECTED");

const meta = new WeakMap<
  object,
  {
    constructor: StateConstructor<any>;
    hooks: { fn: Function; result: unknown }[];
  }
>();

function getMeta<T extends object>(state: T) {
  const stateMeta = meta.get($(state));
  if (!stateMeta) {
    throw new Error("State metadata not found");
  }
  return stateMeta;
}

export function defineState<T extends object>(
  initialValue: () => T
): StateConstructor<T>;

export function defineState<T extends object>(
  initialValue: T
): StateConstructor<T>;

export function defineState<T extends object>(
  initialValue: T | (() => T)
): StateConstructor<T> {
  const constructor = function (setInitialValue?: StateSetter<T>) {
    const state = unstable_deepProxy(
      typeof initialValue === "function" ? initialValue() : initialValue
    );

    const hooks: { fn: Function; result: unknown }[] = [];

    meta.set(state, { constructor, hooks });

    // Bind hook functions
    Object.getOwnPropertyNames(state).forEach((_key) => {
      const key = _key as keyof T;
      if (
        typeof state[key] === "function" &&
        state[key].length === 0 &&
        typeof key === "string" &&
        HOOK_KEY_REGEX.test(key)
      ) {
        let index = hooks.length;
        hooks.push({
          fn: state[key].bind(state),
          result: NOT_INJECTED,
        });
        state[key] = (() => {
          const result = hooks[index].result;
          if (result === NOT_INJECTED) {
            throw new Error("Result of the hook has not been injected yet.");
          }
          return result;
        }) as T[keyof T & string];
      }
    });

    setInitialValue?.(state);

    return state;
  } as StateConstructor<T>;

  Object.assign(constructor, {
    Provider: function StateProvider({
      children,
      state,
    }: {
      children?: React.ReactNode;
      state?: T;
    }) {
      const stateRef = useRef<T>(undefined);
      if (
        stateRef.current === undefined ||
        stateRef.current !== (state ? $(state) : undefined)
      ) {
        stateRef.current = (state ? $(state) : undefined) ?? constructor();
      }
      return <Provider state={stateRef.current}>{children}</Provider>;
    },
  });

  return constructor;
}

export function useLocalState<T extends object>(
  constructor: StateConstructor<T>,
  options?:
    | StateSetter<T>
    | (SnapshotOptions & { setInitialValue?: StateSetter<T> })
) {
  const state = useRef<T>(undefined);

  if (
    state.current === undefined ||
    getMeta(state.current).constructor !== constructor
  ) {
    const setInitialValue =
      typeof options === "function" ? options : options?.setInitialValue;
    state.current = constructor(setInitialValue);
  }

  getMeta(state.current).hooks.forEach((hook) => {
    hook.result = hook.fn();
  });

  const snapshotOptions = typeof options === "function" ? undefined : options;
  return usePassedState(state.current, snapshotOptions);
}

export class Store {
  private states: Map<StateConstructor<any>, any> = new Map();

  constructor(private parent?: Store) {}

  setState<T extends object>(state: T): void {
    this.states.set(getMeta(state).constructor, $(state));
  }

  getState<T extends object>(constructor: StateConstructor<T>): T {
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
  state: T;
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
  constructor: StateConstructor<T>,
  snapshotOptions?: SnapshotOptions
) {
  const store = useContext(StoreContext);
  const state = store.getState(constructor);
  return usePassedState(state, snapshotOptions);
}

const DUMMY_PROP = Symbol("DUMMY_PROP");

export function usePassedState<T extends object>(
  state: T,
  snapshotOptions?: SnapshotOptions
) {
  const proxy = $(state);
  const snapshot = useSnapshot(proxy, snapshotOptions);

  // touch dummy prop so that it doesn't trigger re-renders when no props are touched.
  (snapshot as any)[DUMMY_PROP];

  let isRendering = true;
  useLayoutEffect(() => {
    isRendering = false;
  });

  function makeProxy<T extends object>(proxy: T, snapshot: Snapshot<T>) {
    return new Proxy(proxy, {
      get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);
        if (!isRendering) {
          return value;
        }
        const snapshotValue = (snapshot as any)[prop];
        if (typeof value === "object" && value !== null) {
          return makeProxy(value, snapshotValue);
        }
        return snapshotValue;
      },
    });
  }

  return makeProxy(proxy, snapshot);
}
