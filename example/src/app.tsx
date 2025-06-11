import { CounterView } from "./counter";

export function App() {
  return (
    <div className="space-y-4 p-8">
      <CounterView />
      <CounterView initialCount={10} />
    </div>
  );
}
