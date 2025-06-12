import { state, useProvidedState } from "pretty-good-state";

const ToggleState = state({
  toggle: true,
});

export function GlobalToggle() {
  const globalToggle = useProvidedState(ToggleState);
  return (
    <div>
      <div className="text-base">Global Toggle</div>
      <button
        onClick={() =>
          globalToggle.set((state) => (state.toggle = !state.toggle))
        }
      >
        {globalToggle.toggle ? "On" : "Off"}
      </button>
    </div>
  );
}
