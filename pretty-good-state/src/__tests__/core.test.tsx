import { expect, test, mock } from "bun:test";
import {
  defineState,
  runInComponent,
  useLocalState,
  type Infer,
} from "../core.js";
import { createContext, useContext } from "react";
import { render } from "@testing-library/react";

test("PROXY_REFs are not enumerable", () => {
  const State = defineState({} as Record<string, number>);

  const state = State((state) => {
    state.a = 1;
    state.b = 2;
    state.c = 3;
  });

  const sum = Object.entries(state).reduce((acc, [_, value]) => acc + value, 0);
  expect(sum).toBe(6);
  expect(Object.keys(state)).toEqual(["a", "b", "c"]);
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

test("replacing runInComponent functions in tests", () => {
  const AnalyticsContext = createContext({ track: (event: string) => {} });
  const State = defineState({
    getAnalytics: runInComponent(() => {
      return useContext(AnalyticsContext);
    }),
    submit() {
      this.getAnalytics().track("submit");
    },
  });

  const trackMock = mock(() => {});
  const state = State((state) => {
    state.getAnalytics = () => {
      return { track: trackMock };
    };
  });

  state.submit();
  expect(trackMock).toHaveBeenCalledWith("submit");
});

test("runInComponent has access to `this`", () => {
  const trackMock = mock((source: string, event: string) => {});
  const AnalyticsContext = createContext({
    track: trackMock,
  });

  const State = defineState({
    id: "abc",
    getAnalytics: runInComponent(function (this: Infer<typeof State>) {
      const analytics = useContext(AnalyticsContext);
      return {
        track: (event: string) => {
          analytics.track(this.id, event);
        },
      };
    }),
    submit() {
      this.getAnalytics().track("submit");
    },
  });

  function TestComponent() {
    const state = useLocalState(State);
    // Call submit when component renders
    state.submit();
    return null;
  }

  render(<TestComponent />);

  expect(trackMock).toHaveBeenCalledWith("abc", "submit");
});
