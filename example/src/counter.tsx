import { state, useLocalState } from "pretty-good-state";

export const Counter = state({
  count: 0,
});

export function CounterView({ initialCount }: { initialCount?: number }) {
  const counter = useLocalState(Counter, (state) => {
    if (initialCount != null) {
      state.count = initialCount;
    }
  });
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => counter.set((state) => state.count--)}>-</button>
      <div>{counter.count}</div>
      <button onClick={() => counter.set((state) => state.count++)}>+</button>
    </div>
  );
}
