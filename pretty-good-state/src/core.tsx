import { createContext, useContext, useRef } from "react";
import { useSnapshot } from "valtio";
import { unstable_deepProxy } from "valtio/utils";
import { patchValtio } from "./patch-valtio";

patchValtio();

export type State<T extends object> = {
  [K in keyof T]: T[K] extends Ignored
    ? T[K]
    : T[K] extends object
    ? State<T[K]>
    : T[K];
} & Pointer<T>;

export type Snapshot<T extends object> = {
  readonly [K in keyof T]: T[K] extends Ignored
    ? T[K]
    : T[K] extends object
    ? Snapshot<T[K]>
    : T[K];
} & Pointer<T>;

export type Pointer<T extends object> = {
  $: (fn?: (state: State<T>) => void) => State<T>;
};

export type Shape<T extends StateConstructor<any>> = T extends StateConstructor<
  infer U
>
  ? U
  : never;

export type StateConstructor<T extends object> = ((
  setInitial?: StateSetter<T>
) => State<T>) & {
  readonly Provider: React.ComponentType<{
    children?: React.ReactNode;
    state?: Pointer<T>;
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

function getMeta<T extends object>(pointer: Pointer<T>) {
  const stateMeta = meta.get(pointer.$());
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

    return state as State<T>;
  } as StateConstructor<T>;

  Object.assign(constructor, {
    Provider: function StateProvider({
      children,
      state,
    }: {
      children?: React.ReactNode;
      state?: Pointer<T>;
    }) {
      const stateRef = useRef<State<T>>(undefined);
      if (stateRef.current === undefined || stateRef.current !== state?.$()) {
        stateRef.current = state?.$() ?? constructor();
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
  const state = useRef<State<T>>(undefined);

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
  return useSnapshot(state.current, snapshotOptions) as Snapshot<T>;
}

export class Store {
  private states: Map<StateConstructor<any>, State<any>> = new Map();

  constructor(private parent?: Store) {}

  setState<T extends object>(state: Pointer<T>): void {
    this.states.set(getMeta(state).constructor, state.$());
  }

  getState<T extends object>(constructor: StateConstructor<T>): State<T> {
    let state =
      this.states.get(constructor) ?? this.parent?.getState(constructor);
    if (!state) {
      state = constructor();
      this.setState(state);
    }
    return state as State<T>;
  }
}

export const globalStore = new Store();

const StoreContext = createContext<Store>(globalStore);

export function Provider<T extends object>({
  state,
  children,
}: {
  state: Pointer<T>;
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
  return useSnapshot(state, snapshotOptions) as Snapshot<T>;
}

export function usePassedState<T extends object>(
  state: Pointer<T>,
  snapshotOptions?: SnapshotOptions
) {
  return useSnapshot(state.$(), snapshotOptions) as Snapshot<T>;
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
