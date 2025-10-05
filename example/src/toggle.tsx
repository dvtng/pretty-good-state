import { defineState, useProvidedState } from "pretty-good-state";

export const ToggleState = defineState({
  isOn: true,
  toggle() {
    this.isOn = !this.isOn;
  },
});

export function Toggle() {
  const state = useProvidedState(ToggleState);
  return (
    <div>
      <div className="text-base">Enabled?</div>
      <button onClick={state.toggle}>{state.isOn ? "On" : "Off"}</button>
    </div>
  );
}
