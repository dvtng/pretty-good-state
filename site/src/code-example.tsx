import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import duotoneCustom from "./duotone-custom";

export function CodeExample({
  source,
  children,
}: {
  source: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.1)]">
      <div className="p-4 bg-white border-b border-black/10">{children}</div>

      <SyntaxHighlighter
        language="tsx"
        style={duotoneCustom}
        customStyle={{
          padding: "1rem",
          margin: 0,
          borderRadius: 0,
        }}
      >
        {source}
      </SyntaxHighlighter>
    </div>
  );
}
