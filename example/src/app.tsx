import { CounterView } from "./counter";
import { Expandable } from "./expandable";
import { GlobalToggle } from "./global-toggle";

export function App() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <GlobalToggle />
      <GlobalToggle />
      <CounterView />
      <CounterView initialCount={10} />
      <Expandable content="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." />
    </div>
  );
}
