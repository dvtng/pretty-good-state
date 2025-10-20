import { CodeExample } from "../code-example";
import source from "./typography.tsx?raw";
import { Typography } from "./typography";
import { CheckIcon } from "lucide-react";

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
      <Typography>
        <div className="py-3 leading-relaxed">
          <p className="mb-2">Just-enough state management for React.</p>
          <p>
            <Tick /> Fine-grained reactivity
          </p>
          <p>
            <Tick /> Simple and intuitive mutations
          </p>
          <p>
            <Tick /> Unified API for local, global, and context state
          </p>
          <p>
            <Tick /> Full TypeScript support
          </p>
        </div>
      </Typography>
    </CodeExample>
  );
}

function Tick() {
  return <CheckIcon className="text-emerald-500 inline-block ml-4 mr-1" />;
}
