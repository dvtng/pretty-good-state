import { defineState, useProvidedState } from "pretty-good-state";

export const ToggleState = defineState({
  isOn: true,
  get isOff() {
    return !this.isOn;
  },
  toggle() {
    this.isOn = !this.isOn;
  },
});

export function Toggle() {
  const state = useProvidedState(ToggleState);
  return (
    <div>
      <div className="text-base">Enabled?</div>
      <button onClick={state.toggle}>{state.isOff ? "Off" : "On"}</button>
    </div>
  );
}
