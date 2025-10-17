# pretty-good-state

A just-enough state management library for React. Built on top of `valtio`.

✅ Fine-grained reactivity

✅ Simple and intuitive mutations

✅ Full TypeScript support

✅ Unified API for component-local and context-provided state

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
    // `this` is bound to the state
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
import { useLocalState } from "pretty-good-state";

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
properties are used in rendering the component. Use the `$` function to access
the "live", mutable state.

```tsx
import { useLocalState } from "pretty-good-state";

const counter = useLocalState(CounterState);

function handleReset() {
  counter.$((counter) => {
    counter.count = 0;
  });
}
```

This can also be useful when you read the updated state after a mutation:

```tsx
import { useLocalState } from "pretty-good-state";

const counter = useLocalState(CounterState);

function handleIncrement() {
  counter.increment();
  console.log(counter.$().count);
}
```

### Accessing Global State Outside of a Component

The `globalStore` object lets you access global state outside of a component:

```tsx
import { globalStore } from "pretty-good-state";

const counter = globalStore.getState(CounterState);
counter.increment();
```

### Accessing Hooks in State

There may be cases where you want to have access to hooks from within a state.
The `runInComponent()` function lets you do this.

```tsx
import { defineState, runInComponent } from "pretty-good-state";

const EmailFormState = defineState({
  getIntl: runInComponent(() => {
    return useIntl();
  }),
  email: "",
  errorMessage: "",
  validate() {
    if (!this.email) {
      this.errorMessage = this.getIntl().format("Email is required");
      return false;
    }
    this.errorMessage = "";
    return true;
  },
});
```

These `runInComponent()` functions are called in the component where the local
state is created – i.e. when `useLocalState()` is called or when a Provider is
rendered.

Note that since `runInComponent()` requires a component context, it cannot be
used in global state (i.e.
`globalStore.getState(EmailFormState).validate()` will throw an error).

### TypeScript Types

You can infer the types of the state and its snapshot from the constructor:

```tsx
import { defineState, Shape, State, Snapshot } from "pretty-good-state";

const CounterState = defineState({
  count: 0,
});

type CounterShape = Shape<typeof CounterState>; // { count: number }
type CounterState = State<CounterShape>; // { count: number } & Pointer<{ count: number }>
type CounterSnapshot = Snapshot<CounterShape>; // { readonly count: number } & Pointer<{ count: number }>
```

### Passing State to Child Components

You can directly pass state to child components:

```tsx
import { defineState, useLocalState, Snapshot } from "pretty-good-state";

const TodoListState = defineState({
  todos: [] as Todo[],
});

type Todo = {
  id: string;
  text: string;
  done: boolean;
};

function TodoList() {
  const todos = useLocalState(TodoListState);
  return (
    <div>
      {todos.todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
}

function TodoItem({ todo }: { todo: Snapshot<Todo> }) {
  return (
    <div>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() =>
          todo.$((todo) => {
            todo.done = !todo.done;
          })
        }
      />
      <span>{todo.text}</span>
    </div>
  );
}
```

Note that in this case the hook `useLocalState()` is in the parent component,
and as a result the parent is tracking changes to all state properties accessed
in the child. The parent re-renders unnecessarily when, for example, `todo.done`
is toggled.

To optimize this, we can use the `usePassedState()` hook to allow the child
component to track its own state:

```tsx
import { usePassedState } from "pretty-good-state";

function TodoItem({ todoPointer }: { todoPointer: Pointer<Todo> }) {
  const todo = usePassedState(todoPointer);
  return (
    <div>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() =>
          todo.$((todo) => {
            todo.done = !todo.done;
          })
        }
      />
      <span>{todo.text}</span>
    </div>
  );
}
```

Notice the use of the `Pointer<Todo>` type. This is a narrower type than
`Snapshot<Todo>` that doesn't expose any of the actual state properties. This
forces the child to only access the state through the `usePassedState()` hook,
preventing accidental reads from the parent's copy.
