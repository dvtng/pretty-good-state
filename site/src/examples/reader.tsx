import { defineState, useLocalState } from "pretty-good-state";

const ReaderState = defineState({
  fontFamily: "sans-serif" as "sans-serif" | "serif",
  fontSize: "medium" as "medium" | "large",
});

const fontSizeMap = {
  medium: "1.25rem",
  large: "1.5rem",
};

export function Reader({ children }: { children: React.ReactNode }) {
  const state = useLocalState(ReaderState);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="toolbar">
        <div className="button-group">
          <button
            aria-pressed={state.fontFamily === "sans-serif"}
            onClick={() => (state.fontFamily = "sans-serif")}
          >
            Sans
          </button>
          <button
            aria-pressed={state.fontFamily === "serif"}
            onClick={() => (state.fontFamily = "serif")}
          >
            Serif
          </button>
        </div>
        <div className="button-group">
          <button
            aria-pressed={state.fontSize === "medium"}
            onClick={() => (state.fontSize = "medium")}
          >
            Medium
          </button>
          <button
            aria-pressed={state.fontSize === "large"}
            onClick={() => (state.fontSize = "large")}
          >
            Large
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          fontFamily: state.fontFamily,
          fontSize: fontSizeMap[state.fontSize],
        }}
      >
        {children}
      </div>
    </div>
  );
}
