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
    if (!this.getIsEnabled()) return;
    this.count++;
  },
  decrement() {
    if (!this.getIsEnabled()) return;
    if (this.count === 0) return;
    this.count--;
  },
  getIsEnabled: runInComponent(() => {
    return useProvidedState(ToggleState).isOn;
  }),
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
      <div
        className="flex items-center gap-2"
        style={{
          opacity: state.getIsEnabled() ? 1 : 0.5,
        }}
      >
        <button onClick={state.decrement}>-</button>
        <div>{state.count}</div>
        <button onClick={state.increment}>+</button>
      </div>
    </div>
  );
}
