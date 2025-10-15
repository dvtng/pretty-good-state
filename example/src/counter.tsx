import {
  defineState,
  runInComponent,
  useLocalState,
  useProvidedState,
} from "pretty-good-state";
import { ToggleState } from "./toggle";

export const CounterState = defineState({
  count: 0,
  increment() {
    if (this.getIsDisabled()) return;
    this.count++;
  },
  decrement() {
    if (this.getIsDisabled()) return;
    if (this.count === 0) return;
    this.count--;
  },
  getIsDisabled: runInComponent(() => {
    return useProvidedState(ToggleState).isOff;
  }),
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
          opacity: state.getIsDisabled() ? 0.5 : 1,
        }}
      >
        <button onClick={state.decrement}>-</button>
        <div>{state.count}</div>
        <button onClick={state.increment}>+</button>
        <button
          onClick={() => {
            if (state.getIsDisabled()) return;
            state.$().count = initialCount;
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
