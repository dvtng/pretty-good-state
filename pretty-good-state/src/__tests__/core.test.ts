import { expect, test, mock } from "bun:test";
import { defineState, runInComponent } from "../core";
import { createContext, useContext } from "react";

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
  const State = defineState({ outer: { inner: { value: 0 } } });
  const state1 = State();
  const state2 = State();

  state1.outer.inner.value = 1;
  expect(state2.outer.inner.value).toBe(0);
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
