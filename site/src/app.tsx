import { LeafIcon } from "lucide-react";
import { Benefits } from "./benefits";
import { TypographyExample } from "./examples/typography-example";
import {
  CodeExample,
  HIGHLIGHT_EMERALD,
  HIGHLIGHT_PURPLE,
} from "./code-example";

const COUNTER_STATE_HIGHLIGHTS = [
  { pattern: /\bCounter(s?)State\b/g, className: HIGHLIGHT_PURPLE },
  { pattern: /\bcounter(s?)\b/g, className: HIGHLIGHT_EMERALD },
];

export function App() {
  return (
    <div className="flex flex-col gap-8 px-6 py-16 max-w-[800px] mx-auto justify-center">
      <h1 className="text-6xl tracking-tighter font-medium">
        pretty good state
      </h1>
      <code className="font-mono tracking-tight flex items-center gap-1.5 px-3 py-1 bg-black/5">
        npm install pretty-good-state
        <div className="inline-block w-2 h-[1.2em] bg-black" />
      </code>
      <p>
        React state with <span className="branding">a sprig of magic</span>
        <LeafIcon className="size-5 inline-block -mt-0.5 ml-1 text-emerald-500" />
        . Built on top of{" "}
        <a href="https://valtio.dev/" target="_blank" rel="noopener noreferrer">
          valtio
        </a>
        .
      </p>
      <Benefits />
      <h2>getting started</h2>
      <h3>using state</h3>
      <p>
        In <span className="branding">pretty good state</span>, we start by
        creating a reusable state definition.
      </p>
      <CodeExample
        highlights={COUNTER_STATE_HIGHLIGHTS}
        source={`
const CounterState = defineState({
  count: 0,
});
      `}
      />
      <p>
        Unlike React's built-in state, this definition lives outside of your
        components. We can create instances of it – as local state in a
        component...
      </p>
      <CodeExample
        highlights={COUNTER_STATE_HIGHLIGHTS}
        source={`
const counter = useLocalState(CounterState);
      `}
      />
      <p>...or as context for a portion of your component tree.</p>
      <CodeExample
        highlights={COUNTER_STATE_HIGHLIGHTS}
        source={`
<CounterState.Provider>
  {/* The following components will share the same state */}
  <CounterView />
  <CounterView />
</CounterState.Provider>

function CounterView() {
  // Note the use of useProvidedState instead of useLocalState
  const counter = useProvidedState(CounterState);
  return <div>{counter.count}</div>;
}
      `}
      />
      <p>
        This flexibility is a key benefit of the library. There are many
        different ways to use state in a React application, and{" "}
        <span className="branding">pretty good state</span> makes it easy to
        support any kind of application architecture.
      </p>
      <h3>tracking changes</h3>
      <p>
        Here's where the magic happens. Any time you access a state property
        inside a component <i>while it's rendering</i>, that access is{" "}
        <i>tracked</i>. The component will automatically re-render whenever that
        property changes – but not when other properties change.
      </p>
      <p>
        To illustrate, let's turn our simple counter state into a collection of
        counters.
      </p>
      <CodeExample
        highlights={COUNTER_STATE_HIGHLIGHTS}
        source={`
const CountersState = defineState({
  counts: {
    counterA: 0,
    counterB: 0,
    counterC: 0,
  },
});

function CounterView({ id }: { id: string }) {
  const counters = useProvidedState(CountersState);
  return (
    <div>
      {/* The below property access is tracked */}
      <div>{counters.counts[id]}</div>
      <button
        onClick={() => {
          // Triggers a re-render for this CounterView only
          counters.counts[id]++;
        }}
      >
        Increment
      </button>
    </div>
  );
}
`}
      />
      <p>
        Since the component only accesses a single count value, it will only
        re-render when that particular count changes.
      </p>
      <p>
        This fine-grained reactivity let's us organize state in a way that's
        convenient for our application, without having to worry about whether
        our components will needlessly re-render.
      </p>
      <p>
        Here's an example of how we could take advantage of this combined,
        shared state:
      </p>
      <CodeExample
        highlights={COUNTER_STATE_HIGHLIGHTS}
        source={`
function Counters() {
  const counters = useLocalState(CountersState);
  return (
    <CountersState.Provider state={counters}>
      <CounterView id="counterA" />
      <CounterView id="counterB" />
      <CounterView id="counterC" />
      <TotalCount />
      <button
        onClick={() => {
          // Triggers a re-render for all CounterView components
          counters.counts = {
            counterA: 0,
            counterB: 0,
            counterC: 0,
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
      />
      <p>
        Under the hood, <span className="branding">pretty good state</span> uses
        a{" "}
        <a
          href="https://valtio.dev/docs/api/basic/proxy"
          target="_blank"
          rel="noopener noreferrer"
        >
          valtio proxy
        </a>{" "}
        to intercept property accesses (to track dependencies) and mutations (to
        trigger re-renders). It also detects whether a property access occurs
        during rendering (i.e. in the main component body), so that properties
        used only in callbacks or useEffects are not tracked.
      </p>
      <h2>examples</h2>
      <div className="mt-4">
        <TypographyExample />
      </div>
    </div>
  );
}
