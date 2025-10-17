import { createContext, useContext, useLayoutEffect, useRef } from "react";
import { useSnapshot, type Snapshot } from "valtio";
import { unstable_deepProxy } from "valtio/utils";
import { patchValtio, $ } from "./patch-valtio";

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

const INJECTABLE_FN = Symbol("INJECTABLE_FN");
const NOT_INJECTED = Symbol("NOT_INJECTED");

const meta = new WeakMap<
  object,
  {
    constructor: StateConstructor<any>;
    injectables: { fn: Function; result: unknown }[];
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

    setInitialValue?.(state);

    const injectables: { fn: Function; result: unknown }[] = [];

    meta.set(state, { constructor, injectables });

    // Bind runInComponent functions
    Object.getOwnPropertyNames(state).forEach((_key) => {
      const key = _key as keyof T;
      if (typeof state[key] === "function" && INJECTABLE_FN in state[key]) {
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
        }) as T[keyof T];
      }
    });

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

  getMeta(state.current).injectables.forEach((injectable) => {
    injectable.result = injectable.fn();
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

export function runInComponent<T>(fn: () => T): () => T {
  Object.defineProperty(fn, INJECTABLE_FN, { value: true });
  return fn;
}

export function isRunInComponent(value: unknown): boolean {
  return typeof value === "function" && INJECTABLE_FN in value;
}

/** Function type for any kind of function */
type AnyFunction = (...args: any[]) => any;

/** JavaScript primitive types */
type Primitive = string | number | boolean | null | undefined | symbol | bigint;

/** Types that should not be proxied */
type Ignored =
  | Date
  | Map<any, any>
  | Set<any>
  | WeakMap<any, any>
  | WeakSet<any>
  | Error
  | RegExp
  | AnyFunction
  | Primitive
  | { $$valtioSnapshot: any };
