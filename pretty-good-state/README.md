# pretty-good-state

A just-enough state management library for React. Built on top of `valtio`.

## Installation

```bash
npm install pretty-good-state
```

## Basic Usage

### Creating State

Use the `state()` function to create reusable state:

```tsx
import { state } from "pretty-good-state";

const CounterState = state({
  count: 0,
});
```

### Local State

Use `useLocalState()` to initialize component-local state:

```tsx
import { useLocalState } from "pretty-good-state";

function Counter() {
  const counter = useLocalState(CounterState);

  return (
    <div>
      <p>Count: {counter.count}</p>
      <button
        onClick={() =>
          counter.set((state) => {
            state.count++;
          })
        }
      >
        Increment
      </button>
    </div>
  );
}
```

### Shared State

Use `Provider` and `useProvidedState()` to share state for a portion
of your React tree:

```tsx
import { Provider, useProvidedState } from "pretty-good-state";

const CounterState = state({
  count: 0,
});

function Page() {
  const counter = useLocalState(CounterState);

  return (
    <Provider state={counter}>
      {/* The following counters will share the same state */}
      <Counter />
      <Counter />
    </Provider>
  );
}

function Counter() {
  const counter = useProvidedState(CounterState);

  return (
    <div>
      <p>Count: {counter.count}</p>
      <button
        onClick={() =>
          counter.set((state) => {
            state.count++;
          })
        }
      >
        Increment
      </button>
    </div>
  );
}
```
