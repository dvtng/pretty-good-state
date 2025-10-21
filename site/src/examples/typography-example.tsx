import { CodeExample, HIGHLIGHT_EMERALD } from "../code-example";
import source from "./typography.tsx?raw";
import { Typography } from "./typography";

export function TypographyExample() {
  return (
    <CodeExample
      source={source}
      highlights={[
        {
          pattern: "TypographyState",
          className: HIGHLIGHT_EMERALD,
        },
        { pattern: /\btypography\b/g, className: HIGHLIGHT_EMERALD },
        {
          pattern: /\b(size|family)\b/g,
          className: HIGHLIGHT_EMERALD,
        },
      ]}
    >
      <Typography>The quick brown fox jumps over the lazy dog.</Typography>
    </CodeExample>
  );
}
