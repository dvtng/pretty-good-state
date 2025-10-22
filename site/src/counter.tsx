import {
  defineState,
  useLocalState,
  useProvidedState,
} from "pretty-good-state";
import { ToggleState } from "./toggle";

export const CounterState = defineState({
  count: 0,
  increment() {
    if (this.useIsDisabled()) return;
    this.count++;
  },
  decrement() {
    if (this.useIsDisabled()) return;
    if (this.count === 0) return;
    this.count--;
  },
  useIsDisabled() {
    return useProvidedState(ToggleState).isOff;
  },
});

export function Counter({ initialCount = 0 }: { initialCount?: number }) {
  const state = useLocalState(CounterState, (state) => {
    state.count = initialCount;
  });
  return (
    <div>
      <div className="text-base">Counter</div>
      <div
        className="flex items-center gap-2"
        style={{
          opacity: state.useIsDisabled() ? 0.5 : 1,
        }}
      >
        <button onClick={state.decrement}>-</button>
        <div>{state.count}</div>
        <button onClick={state.increment}>+</button>
        <button
          onClick={() => {
            if (state.useIsDisabled()) return;
            state.count = initialCount;
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
