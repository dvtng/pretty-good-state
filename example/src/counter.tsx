import { defineState, useLocalState } from "pretty-good-state";

export const CounterState = defineState({
  count: 0,
  increment() {
    this.count++;
  },
  decrement() {
    if (this.count === 0) return;
    this.count--;
  },
});

export function Counter({ initialCount }: { initialCount?: number }) {
  const state = useLocalState(CounterState, (state) => {
    if (initialCount != null) {
      state.count = initialCount;
    }
  });
  return (
    <div>
      <div className="text-base">Counter</div>
      <div className="flex items-center gap-2">
        <button onClick={state.decrement}>-</button>
        <div>{state.count}</div>
        <button onClick={state.increment}>+</button>
      </div>
    </div>
  );
}
