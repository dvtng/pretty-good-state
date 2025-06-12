import { state, useProvidedState } from "pretty-good-state";

const ToggleState = state({
  isOn: true,
  toggle() {
    this.isOn = !this.isOn;
  },
});

export function GlobalToggle() {
  const toggleState = useProvidedState(ToggleState);
  return (
    <div>
      <div className="text-base">Global Toggle</div>
      <button onClick={toggleState.toggle}>
        {toggleState.isOn ? "On" : "Off"}
      </button>
    </div>
  );
}
