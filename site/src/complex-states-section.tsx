import {
  CodeExample,
  HIGHLIGHT_EMERALD,
  HIGHLIGHT_PURPLE,
} from "./code-example";
import { COUNTER_STATE_HIGHLIGHTS } from "./examples/counters-example";
import { ScrollView } from "./examples/scroll-view-example";
import scrollViewSource from "./examples/scroll-view-example.tsx?raw";

export function ComplexStatesSection() {
  return (
    <>
      <h2>complex states</h2>
      <h3>functions</h3>
      <p>
        Functions are automatically bound to the state instance, and can freely
        use <code>this</code> to get or set other properties of the state.
      </p>
      <CodeExample
        highlights={COUNTER_STATE_HIGHLIGHTS}
        source={`
const CounterState = defineState({
  count: 0,
  increment() {
    this.count++;
  },
});

function CounterView() {
  const counter = useLocalState(CounterState);
  return <button onClick={counter.increment}>+</button>;
}
`}
      />

      <h3>hooks</h3>
      <p>
        Functions whose names start with <code>use</code> are <i>state hooks</i>
        . They are automatically run in the component where the state is
        instantiated (e.g. in a <code>useLocalState()</code> or a{" "}
        <code>Provider</code>). This allows them to call React hooks, giving us
        a simple way to integrate with other hook-based code.
      </p>
      <CodeExample
        highlights={COUNTER_STATE_HIGHLIGHTS}
        source={`
const CounterState = defineState({
  // This is a state hook, and it can call React hooks.
  useLogger() {
    return useContext(LoggerContext);
  },
  count: 0,
  increment() {
    this.count++;
    this.useLogger().log("increment");
  },
});
`}
      />
      <p>Some caveats to be aware of:</p>
      <ul>
        <li>
          State hooks can call any number of React hooks, but just as in a
          regular component, React hooks cannot be called conditionally or
          inside loops.
        </li>
        <li>
          State hooks are run once on every render, and their return values are
          cached. This means that state hooks <strong>can</strong> be called
          conditionally, inside loops, or in a callback.
        </li>
        <li>State hooks can't be defined in nested objects.</li>
        <li>
          Since React hooks must be called in the body of a component, state
          hooks cannot be used in global state.
        </li>
      </ul>

      <h3>refs</h3>
      <p>
        Some state values – such as DOM nodes – shouldn't be tracked by the
        library. Use the <code>ref()</code> function to disable tracking for a
        particular value.
      </p>
      <CodeExample
        highlights={[
          { pattern: /\bScrollState\b/g, className: HIGHLIGHT_PURPLE },
          { pattern: /\bscrollState\b/g, className: HIGHLIGHT_EMERALD },
        ]}
        source={scrollViewSource}
      >
        <ScrollView />
      </CodeExample>
      <h3>sub-states</h3>
      <p>Todo</p>
    </>
  );
}
