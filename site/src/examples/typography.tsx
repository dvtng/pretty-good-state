import { defineState, useLocalState } from "pretty-good-state";

const TypographyState = defineState({
  family: "sans-serif" as "sans-serif" | "serif",
  size: "medium" as "medium" | "large",
});

const fontSizeMap = {
  medium: "1.25rem",
  large: "1.5rem",
};

export function Typography({ children }: { children: React.ReactNode }) {
  const typography = useLocalState(TypographyState);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="toolbar">
        <div className="button-group">
          <button
            aria-pressed={typography.family === "sans-serif"}
            onClick={() => (typography.family = "sans-serif")}
          >
            Sans
          </button>
          <button
            aria-pressed={typography.family === "serif"}
            onClick={() => (typography.family = "serif")}
          >
            Serif
          </button>
        </div>
        <div className="button-group">
          <button
            aria-pressed={typography.size === "medium"}
            onClick={() => (typography.size = "medium")}
          >
            Medium
          </button>
          <button
            aria-pressed={typography.size === "large"}
            onClick={() => (typography.size = "large")}
          >
            Large
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          fontFamily: typography.family,
          fontSize: fontSizeMap[typography.size],
        }}
      >
        {children}
      </div>
    </div>
  );
}
