import { expect, test, mock } from "bun:test";
import {
  defineState,
  globalStore,
  targetOf,
  useLocalState,
  usePassedState,
  useProvidedState,
  type Infer,
} from "../core.js";
import { createContext, useContext, useLayoutEffect } from "react";
import { act, render } from "@testing-library/react";
import { deepClone } from "../index.js";

test("state should equal target", () => {
  const target = [{ user: { name: "John" } }, { user: { name: "Jane" } }];
  const State = defineState(target);
  const state = State();
  expect(state).not.toBe(target);
  expect(targetOf(state)).not.toBe(state);
  expect(targetOf(state)).not.toBe(target);
  expect(state).toEqual(target);
  expect(targetOf(state)).toEqual(target);
  expect(deepClone(state)).toEqual(target);
  expect(deepClone(state[0])).toEqual(state[0]);
  expect(targetOf(state[0])).not.toBe(state[0]);
  expect(structuredClone(targetOf(state[0].user))).toEqual(state[0].user);
});

test("constructor makes deep copies of state objects", () => {
  const State = defineState({
    outer: { inner: { value: 0 } },
    array: [] as number[],
    get value() {
      return this.outer.inner.value;
    },
    get sortedArray() {
      return this.array.sort((a, b) => a - b);
    },
  });
  const state1 = State();
  const state2 = State();

  state1.outer.inner.value = 1;
  state1.array.push(2);
  state1.array.push(1);
  expect(state1.value).toBe(1);
  expect(state1.sortedArray).toEqual([1, 2]);

  expect(state2.outer.inner.value).toBe(0);
  expect(state2.value).toBe(0);
  expect(state2.sortedArray).toEqual([]);
});

test("Provider", () => {
  const State = defineState({ count: 0 });

  function TestComponent() {
    const state = useProvidedState(State, { sync: true });
    return <div data-testid="result">{state.count}</div>;
  }

  const { getByTestId } = render(
    <State.Provider>
      <TestComponent />
    </State.Provider>
  );

  expect(getByTestId("result").textContent).toBe("0");
});

test("passing state from one component to another", () => {
  const State = defineState({ count: 0 });

  function ParentComponent() {
    const state = useLocalState(State, { sync: true });
    return <ChildComponent state={state} />;
  }

  function ChildComponent({ state: _state }: { state: Infer<typeof State> }) {
    const state = usePassedState(_state);
    return <div data-testid="result">{state.count}</div>;
  }

  const { getByTestId } = render(<ParentComponent />);
  expect(getByTestId("result").textContent).toBe("0");
});

test("hooks have access to `this`", () => {
  const trackMock = mock((source: string, event: string) => {});
  const AnalyticsContext = createContext({
    track: trackMock,
  });

  const State = defineState({
    id: "",
    useAnalytics() {
      const analytics = useContext(AnalyticsContext);
      return {
        track: (event: string) => {
          analytics.track(this.id, event);
        },
      };
    },
    track(event: string) {
      this.useAnalytics().track(event);
    },
  });

  function TestComponent() {
    const state = useLocalState(State, (state) => {
      state.id = "abc";
    });
    useLayoutEffect(() => {
      state.track("render");
    }, []);
    return <div data-testid="result">{state.id}</div>;
  }

  const { getByTestId } = render(<TestComponent />);

  expect(trackMock).toHaveBeenCalledWith("abc", "render");
  expect(getByTestId("result").textContent).toBe("abc");
});

test("hooks can be overridden in tests", () => {
  const AnalyticsContext = createContext({ track: (event: string) => {} });
  const State = defineState({
    useAnalytics() {
      return useContext(AnalyticsContext);
    },
    submit() {
      this.useAnalytics().track("submit");
    },
  });

  const trackMock = mock(() => {});
  const state = State((state) => {
    state.useAnalytics = () => {
      return { track: trackMock };
    };
  });

  state.submit();
  expect(trackMock).toHaveBeenCalledWith("submit");
});

test("components that don't access state properties do not re-render", () => {
  const State = defineState({
    count: 0,
    increment() {
      this.count++;
    },
  });

  const countRenderMock = mock(() => {});
  const incrementRenderMock = mock(() => {});

  function Count() {
    const state = useProvidedState(State, { sync: true });
    countRenderMock();
    return <div>{state.count}</div>;
  }

  function Increment() {
    const state = useProvidedState(State, { sync: true });
    incrementRenderMock();
    return <button onClick={state.increment}>Increment</button>;
  }

  const { getByText } = render(
    <>
      <Count />
      <Increment />
    </>
  );

  expect(countRenderMock).toHaveBeenCalledTimes(1);
  expect(incrementRenderMock).toHaveBeenCalledTimes(1);

  act(() => {
    getByText("Increment").click();
  });

  expect(countRenderMock).toHaveBeenCalledTimes(2);
  expect(incrementRenderMock).toHaveBeenCalledTimes(1);
});

test("dependencies in functions are still tracked", () => {
  const State = defineState({
    count: 0,
    isModulo(modulo: number) {
      return this.count % modulo === 0;
    },
    increment() {
      this.count++;
    },
  });

  function TestComponent() {
    const state = useLocalState(State, { sync: true });
    return (
      <>
        <div data-testid="result">{state.isModulo(2) ? "even" : "odd"}</div>
        <button onClick={state.increment}>Increment</button>
      </>
    );
  }

  const { getByTestId, getByText } = render(<TestComponent />);
  expect(getByTestId("result").textContent).toBe("even");
  act(() => {
    getByText("Increment").click();
  });
  expect(getByTestId("result").textContent).toBe("odd");
});

test("arrays mutations are reactive", () => {
  const State = defineState({
    array: [2, 1, 3],
  });

  function TestComponent() {
    const state = useProvidedState(State, { sync: true });
    return <div data-testid="result">{state.array.join(", ")}</div>;
  }

  const { getByTestId } = render(<TestComponent />);
  act(() => {
    globalStore.getState(State).array.sort((a, b) => a - b);
  });
  expect(getByTestId("result").textContent).toBe("1, 2, 3");
});
