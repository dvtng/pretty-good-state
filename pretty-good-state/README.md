# pretty-good-state

A just-enough state management library for React. Built on top of `valtio`.

## Installation

```bash
npm install pretty-good-state
```

## Basic Usage

### Creating State

Use the `defineState()` function to create reusable state:

```tsx
import { defineState } from "pretty-good-state";

const CounterState = defineState({
  count: 0,
});
```

You can also define methods on the state that directly mutate it:

```tsx
const CounterState = defineState({
  count: 0,
  increment(amount = 1) {
    this.count += amount;
  },
});
```

We use [valtio](https://github.com/pmndrs/valtio) under the hood to
track mutations and re-render the components that depend on those exact changes.

### Local State

Use `useLocalState()` to initialize component-local state:

```tsx
import { useLocalState } from "pretty-good-state";

function Counter() {
  const counter = useLocalState(CounterState);

  return (
    <div>
      <p>Count: {counter.count}</p>
      <button onClick={counter.increment}>Increment</button>
    </div>
  );
}
```

You can also configure the initial state:

```tsx
const counter = useLocalState(CounterState, (state) => {
  state.count = 10;
});
```

### Shared State

Use `useProvidedState()` with a `Provider` to share state for a portion
of your React tree:

```tsx
import { useProvidedState } from "pretty-good-state";

function Counter() {
  const counter = useProvidedState(CounterState);

  return (
    <div>
      <p>Count: {counter.count}</p>
      <button onClick={counter.increment}>Increment</button>
    </div>
  );
}

function Page() {
  return (
    <CounterState.Provider>
      {/* The following counters will share the same state */}
      <Counter />
      <Counter />
    </CounterState.Provider>
  );
}
```

You can also call `useProvidedState()` without a Provider, in which case it will
use a shared global state.

If you pass a state object to the Provider, it will use that state object
instead of creating a new one. This is useful when you want to access the state
in the same component that renders the Provider:

```tsx
function Page() {
  const counter = useLocalState(CounterState);

  return (
    <CounterState.Provider state={counter}>
      <Counter />
      <button onClick={() => counter.increment(10)}>Increment 10</button>
    </CounterState.Provider>
  );
}
```

### Accessing and Mutating the "Live" State

When calling `useLocalState()` or `useProvidedState()`, the returned object
is a read-only snapshot of the state. This is essential for tracking which
properties are used in rendering the component. However, you can also access the
"live", mutable state directly using the `$` property.

```tsx
const counter = useLocalState(CounterState);

function handleReset() {
  counter.$.count = 0;
}
```

This can also be useful when you read the updated state after a mutation:

```tsx
const counter = useLocalState(CounterState);

function handleIncrement() {
  counter.increment();
  console.log(counter.$.count);
}
```

Alternatively, you can use the `set` method to distinguish mutations from state
access:

```tsx
const counter = useLocalState(CounterState);

function handleIncrement() {
  counter.set((state) => {
    state.count++;
  });
}
```

### Accessing Global State Outside of a Component

The `globalStore` object lets you access global state outside of a component:

```tsx
import { globalStore } from "pretty-good-state";

const counter = globalStore.getState(CounterState);
counter.increment();
```
