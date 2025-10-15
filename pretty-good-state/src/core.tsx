import { createContext, useContext, useRef } from "react";
import { ref, useSnapshot } from "valtio";
import { unstable_deepProxy } from "valtio/utils";
import { patchValtio } from "./patch-valtio";

patchValtio();

export type State<T extends object, C extends boolean = false> = Pointer<
  T,
  C
> & {
  [K in keyof T]: T[K] extends Ignored
    ? T[K]
    : T[K] extends object
    ? State<T[K], false>
    : T[K];
};

export type Pointer<T extends object, C extends boolean = false> = {
  $: (fn?: (state: State<T, C>) => void) => State<T, C>;
} & (C extends true
  ? {
      constructor: StateConstructor<T>;
      [INJECTABLES]: { fn: Function; result: unknown }[];
    }
  : {});

export type Snapshot<T extends object, C extends boolean = false> = Pointer<
  T,
  C
> & {
  readonly [K in keyof T]: T[K] extends Ignored
    ? T[K]
    : T[K] extends object
    ? Snapshot<T[K], false>
    : T[K];
};

export type StateConstructor<T extends object> = ((
  setInitial?: StateSetter<T>
) => State<T, true>) & {
  readonly State: State<T, true>;
  readonly Snapshot: Snapshot<T, true>;
  readonly Provider: React.ComponentType<{
    children?: React.ReactNode;
    state?: Pointer<T, true>;
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
  const constructor = function (setInitialValue?: StateSetter<T>) {
    const state = unstable_deepProxy(
      typeof initialValue === "function" ? initialValue() : initialValue
    );

    setInitialValue?.(state);

    const injectables: { fn: Function; result: unknown }[] = [];

    Object.defineProperties(state, {
      constructor: {
        value: constructor,
      },
      [INJECTABLES]: ref({
        value: injectables,
      }),
    });

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
      state?: Pointer<T, true>;
    }) {
      const stateRef = useRef<State<T, true>>(undefined);
      if (stateRef.current === undefined || stateRef.current !== state?.$()) {
        stateRef.current = state?.$() ?? constructor();
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
  const state = useRef<State<T, true>>(undefined);

  if (
    state.current === undefined ||
    state.current?.constructor !== constructor
  ) {
    state.current = constructor(setInitialValue);
  }

  state.current[INJECTABLES].forEach((injectable) => {
    injectable.result = injectable.fn();
  });

  return useSnapshot(state.current) as Snapshot<T, true>;
}

export class Store {
  private states: Map<StateConstructor<any>, State<any>> = new Map();

  constructor(private parent?: Store) {}

  setState<T extends object>(state: Pointer<T>): void {
    this.states.set(state.constructor as StateConstructor<any>, state.$());
  }

  getState<T extends object>(constructor: StateConstructor<T>): State<T> {
    let state =
      this.states.get(constructor as StateConstructor<any>) ??
      this.parent?.getState(constructor);
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
  state: Pointer<T, true>;
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

export function useProvidedState<T extends object, C extends boolean = false>(
  constructorOrPointer: StateConstructor<T> | Pointer<T, C>
) {
  const store = useContext(StoreContext);
  const state =
    typeof constructorOrPointer === "function"
      ? store.getState(constructorOrPointer)
      : constructorOrPointer.$();
  return useSnapshot(state) as Snapshot<T, C>;
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
