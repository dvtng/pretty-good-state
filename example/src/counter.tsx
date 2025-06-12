import { state, useLocalState } from "pretty-good-state";

export const Counter = state({
  count: 0,
  increment() {
    this.count++;
  },
  decrement() {
    if (this.count === 0) return;
    this.count--;
  },
});

export function CounterView({ initialCount }: { initialCount?: number }) {
  const counter = useLocalState(Counter, (state) => {
    if (initialCount != null) {
      state.count = initialCount;
    }
  });
  return (
    <div>
      <div className="text-base">Counter</div>
      <div className="flex items-center gap-2">
        <button onClick={counter.decrement}>-</button>
        <div>{counter.count}</div>
        <button onClick={counter.increment}>+</button>
      </div>
    </div>
  );
}
