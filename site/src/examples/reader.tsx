import { defineState, useLocalState } from "pretty-good-state";

const ReaderState = defineState({
  family: "sans-serif" as "sans-serif" | "serif",
  size: "medium" as "medium" | "large",
});

const fontSizeMap = {
  medium: "1.25rem",
  large: "1.5rem",
};

export function Reader({ children }: { children: React.ReactNode }) {
  const readerState = useLocalState(ReaderState);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="toolbar">
        <div className="button-group">
          <button
            aria-pressed={readerState.family === "sans-serif"}
            onClick={() => (readerState.family = "sans-serif")}
          >
            Sans
          </button>
          <button
            aria-pressed={readerState.family === "serif"}
            onClick={() => (readerState.family = "serif")}
          >
            Serif
          </button>
        </div>
        <div className="button-group">
          <button
            aria-pressed={readerState.size === "medium"}
            onClick={() => (readerState.size = "medium")}
          >
            Medium
          </button>
          <button
            aria-pressed={readerState.size === "large"}
            onClick={() => (readerState.size = "large")}
          >
            Large
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          fontFamily: readerState.family,
          fontSize: fontSizeMap[readerState.size],
        }}
      >
        {children}
      </div>
    </div>
  );
}
