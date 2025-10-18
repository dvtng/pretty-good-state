import { defineState, useLocalState, usePassedState } from "pretty-good-state";

export type Todo = {
  id: string;
  text: string;
  done: boolean;
  toggleDone: () => void;
  remove: () => void;
};

export const TodoListState = defineState({
  todos: [] as Todo[],
  input: "",
  addTodo(text: string) {
    if (!text) return;
    const todos = this.todos;
    todos.push({
      id: crypto.randomUUID(),
      text,
      done: false,
      toggleDone() {
        this.done = !this.done;
      },
      remove() {
        const index = todos.indexOf(this);
        todos.splice(index, 1);
      },
    });
  },
});

export function TodoList() {
  const state = useLocalState(TodoListState, (state) => {
    state.addTodo("Use pretty-good-state");
    state.addTodo("???");
    state.addTodo("Profit");
  });
  const syncState = usePassedState(state, { sync: true });
  const { todos } = state;

  return (
    <div className="flex flex-col gap-4">
      <div className="text-base">Todo List ({todos.length})</div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          state.addTodo(state.input);
          state.input = "";
        }}
      >
        <input
          className="flex-1"
          placeholder="Add a todo"
          value={syncState.input}
          onChange={(e) => {
            state.input = e.target.value;
          }}
        />
        <button type="submit">+</button>
      </form>
      <div>
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </div>
      <button
        onClick={() => {
          todos.length = 0;
        }}
      >
        Clear
      </button>
    </div>
  );
}

function TodoItem({ todo: _todo }: { todo: Todo }) {
  const todo = usePassedState(_todo);
  return (
    <label className="flex gap-2 items-center border-t py-2">
      <input type="checkbox" checked={todo.done} onChange={todo.toggleDone} />
      <div className="flex-1">{todo.text}</div>
      <button onClick={todo.remove}>&times;</button>
    </label>
  );
}
