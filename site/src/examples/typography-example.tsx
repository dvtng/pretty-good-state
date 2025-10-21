import { CodeExample } from "../code-example";
import source from "./typography.tsx?raw";
import { Typography } from "./typography";

const highlightClass = "border-b-2 border-emerald-500 bg-emerald-50";

export function TypographyExample() {
  return (
    <CodeExample
      source={source}
      highlights={[
        {
          pattern: "TypographyState",
          className: highlightClass,
        },
        { pattern: /\btypography\b/g, className: highlightClass },
        {
          pattern: /\b(size|family)\b/g,
          className: highlightClass,
        },
      ]}
    >
      <Typography>The quick brown fox jumps over the lazy dog.</Typography>
    </CodeExample>
  );
}
