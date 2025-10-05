import { Counter } from "./counter";
import { Expandable } from "./expandable";
import { Toggle, ToggleState } from "./toggle";
import { ScrollPositionView, ScrollView } from "./scroll-view";

export function App() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex gap-8">
        <Toggle />
        <Toggle />
      </div>
      <Counter />
      <div className="flex flex-col gap-8 p-8 border">
        <ToggleState.Provider>
          <Toggle />
          <Counter initialCount={10} />
        </ToggleState.Provider>
      </div>
      <Expandable content="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." />
      <ScrollView className="h-[200px] bg-white p-6">
        <ScrollPositionView />
        <div className="h-[1000px]">Hello</div>
      </ScrollView>
    </div>
  );
}
