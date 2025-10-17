import { snapshot, subscribe } from "valtio";
import { expect, test, mock } from "bun:test";
import { defineState } from "../core";

const State = defineState({
  list: { items: [1, 2, 3] },
});

test("mutating from a snapshot", () => {
  const state = State();

  const subscriberMock = mock(() => {});
  subscribe(state, subscriberMock, true);

  expect(subscriberMock).toHaveBeenCalledTimes(0);
  snapshot(state).$().list.items.push(4);
  expect(subscriberMock).toHaveBeenCalledTimes(1);
  snapshot(state).list.items.$().push(5);
  expect(subscriberMock).toHaveBeenCalledTimes(2);
});
