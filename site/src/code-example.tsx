import React from "react";
import { defineState, useLocalState } from "pretty-good-state";
import { CodeIcon } from "lucide-react";
import { PatternHighlight, PatternHighlighter } from "./pattern-highlighter";
import duotoneCustom from "./duotone-custom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

export function CodeExample({
  source,
  children,
  highlights,
}: {
  source: string;
  children?: React.ReactNode;
  highlights?: Array<PatternHighlight>;
}) {
  return (
    <div className="flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.1)] bg-white -mx-6">
      {children ? (
        <>
          <div className="p-6 border-b border-black/10">{children}</div>
          <CodeExpander>
            <CodeBlock source={source} language="tsx" highlights={highlights} />
          </CodeExpander>
        </>
      ) : (
        <CodeBlock source={source} language="tsx" highlights={highlights} />
      )}
    </div>
  );
}

const CodeExpanderState = defineState({
  isExpanded: false,
  toggle() {
    this.isExpanded = !this.isExpanded;
  },
});

function CodeExpander({ children }: { children: React.ReactNode }) {
  const state = useLocalState(CodeExpanderState);

  return (
    <div style={{ background: "#faf8f5" }}>
      <div className="px-6 py-4">
        <a
          onClick={state.toggle}
          className="cursor-pointer text-black/50 hover:text-black transition text-sm flex items-center gap-2"
        >
          <CodeIcon className="w-4 h-4" />
          {state.isExpanded ? "Hide code" : "Show code"}
        </a>
      </div>
      <div
        className="grid transition-all duration-300 ease-in-out"
        style={{
          gridTemplateRows: state.isExpanded ? "1fr" : "0fr",
        }}
      >
        <div className="overflow-hidden min-h-0">{children}</div>
      </div>
    </div>
  );
}

function CodeBlock({
  source,
  language,
  highlights,
}: {
  source: string;
  language: string;
  highlights?: Array<PatternHighlight>;
}) {
  // Trim empty lines from the start and end of the source
  source = source.trim().replace(/^[\r\n]+|[\r\n]+$/g, "");
  return (
    <PatternHighlighter highlights={highlights} trigger={source}>
      <SyntaxHighlighter
        language={language}
        style={duotoneCustom}
        customStyle={{
          padding: "1.5rem",
          margin: 0,
          borderRadius: 0,
        }}
      >
        {source}
      </SyntaxHighlighter>
    </PatternHighlighter>
  );
}
