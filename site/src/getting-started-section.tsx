import { CodeExample } from "./code-example";
import {
  COUNTER_STATE_HIGHLIGHTS,
  CountersExample,
} from "./examples/counters-example";

export function GettingStartedSection() {
  return (
    <>
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
        components. To use it, we can create an <i>instance</i> as local state
        in a component.
      </p>
      <CodeExample
        highlights={COUNTER_STATE_HIGHLIGHTS}
        source={`
function CounterView() {
  // Each CounterView gets its own copy of the state
  const counter = useLocalState(CounterState);
  return <div>{counter.count}</div>;
}
      `}
      />
      <p>
        Or, we can create a shared instance as context for a portion of your
        component tree.
      </p>
      <CodeExample
        highlights={COUNTER_STATE_HIGHLIGHTS}
        source={`
function App() {
  return (
    <CounterState.Provider>
      {/* The following components will share the same state */}
      <CounterView />
      <CounterView />
    </CounterState.Provider>
  );
}

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
    a: 0,
    b: 0,
    c: 0,
  },
});

function CounterView({ id }: { id: "a" | "b" | "c" }) {
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
        Here's an example of how we can take advantage of this combined, shared
        state:
      </p>
      <CountersExample />
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
    </>
  );
}
