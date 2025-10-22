import {
  defineState,
  useLocalState,
  useProvidedState,
} from "pretty-good-state";
import {
  CodeExample,
  HIGHLIGHT_EMERALD,
  HIGHLIGHT_PURPLE,
} from "../code-example";

export const COUNTER_STATE_HIGHLIGHTS = [
  { pattern: /\bCounter(s?)State\b/g, className: HIGHLIGHT_PURPLE },
  { pattern: /\bcounter(s?)\b/g, className: HIGHLIGHT_EMERALD },
];

export function CountersExample() {
  return (
    <CodeExample
      source={`
function Counters() {
  const counters = useLocalState(CountersState);
  return (
    <CountersState.Provider state={counters}>
      <CounterView id="a" />
      <CounterView id="b" />
      <CounterView id="c" />
      <TotalCount />
      <button
        onClick={() => {
          // Triggers a re-render for all CounterView components
          counters.counts = {
            a: 0,
            b: 0,
            c: 0,
          };
        }}
      >
        Reset all
      </button>
    </CountersState.Provider>
  );
}

function TotalCount() {
  const counters = useProvidedState(CountersState);
  const total = Object.values(counters.counts).reduce((sum, count) => sum + count);
  return <div>Total: {total}</div>;
}
`}
      highlights={COUNTER_STATE_HIGHLIGHTS}
    >
      <Counters />
    </CodeExample>
  );
}

const CountersState = defineState({
  counts: {
    a: 0,
    b: 0,
    c: 0,
  },
});

function CounterView({ id }: { id: "a" | "b" | "c" }) {
  const counters = useProvidedState(CountersState);
  return (
    <div className="flex gap-2 items-center">
      <span className="text-black/50">{id}:</span> {counters.counts[id]}
      <button onClick={() => counters.counts[id]++}>+</button>
    </div>
  );
}

function Counters() {
  const counters = useLocalState(CountersState);
  return (
    <div className="flex gap-4 flex-wrap tabular-nums items-center">
      <CountersState.Provider state={counters}>
        <CounterView id="a" />
        <CounterView id="b" />
        <CounterView id="c" />
        <TotalCount />
        <button
          onClick={() => {
            // Triggers a re-render for all CounterView components
            counters.counts = {
              a: 0,
              b: 0,
              c: 0,
            };
          }}
        >
          Reset all
        </button>
      </CountersState.Provider>
    </div>
  );
}

function TotalCount() {
  const counters = useProvidedState(CountersState);
  const total = Object.values(counters.counts).reduce(
    (sum, count) => sum + count
  );
  return (
    <div>
      <span className="text-black/50">Total:</span> {total}
    </div>
  );
}
