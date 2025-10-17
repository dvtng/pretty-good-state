import { snapshot, subscribe } from "valtio";
import { expect, test, mock } from "bun:test";
import { defineState, runInComponent } from "../core";
import { createContext, useContext } from "react";

test("mutating from a snapshot pointer", () => {
  const State = defineState({
    list: { items: [1, 2, 3] },
  });

  const state = State();

  const subscriberMock = mock(() => {});
  subscribe(state, subscriberMock, true);

  expect(subscriberMock).toHaveBeenCalledTimes(0);
  snapshot(state).$().list.items.push(4);
  expect(subscriberMock).toHaveBeenCalledTimes(1);
  snapshot(state).list.items.$().push(5);
  expect(subscriberMock).toHaveBeenCalledTimes(2);
});

test("replacing runInComponent functions in tests", () => {
  const AnalyticsContext = createContext({ track: () => {} });
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
