import React from "react";

export type PatternHighlight = {
  pattern: RegExp | string;
  className?: string;
  style?: React.CSSProperties;
};

export function PatternHighlighter({
  children,
  highlights,
  trigger,
}: {
  children: React.ReactNode;
  highlights?: Array<PatternHighlight>;
  trigger?: unknown;
}) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!rootRef.current || !highlights || highlights.length === 0) return;

    const root = rootRef.current;

    // Convert string patterns to global regexes and ensure global flag for regexes
    const compiled = highlights.map((h) => {
      if (typeof h.pattern === "string") {
        const escaped = h.pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return { ...h, pattern: new RegExp(escaped, "g") };
      }
      const flags = h.pattern.flags.includes("g")
        ? h.pattern.flags
        : h.pattern.flags + "g";
      return { ...h, pattern: new RegExp(h.pattern.source, flags) };
    });

    // Walk only text nodes under the syntax highlighter content
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    let current: Node | null = walker.nextNode();
    while (current) {
      const parentElement = current.parentElement;
      if (
        current.nodeType === Node.TEXT_NODE &&
        parentElement &&
        !parentElement.closest(".code-highlight") &&
        current.textContent &&
        current.textContent.trim() !== ""
      ) {
        textNodes.push(current as Text);
      }
      current = walker.nextNode();
    }

    for (const textNode of textNodes) {
      let node: Node = textNode;
      for (const h of compiled) {
        const className = h.className ?? "code-highlight";
        const style = h.style;
        if (!(node instanceof Text)) break;
        const content = node.textContent ?? "";
        h.pattern.lastIndex = 0;
        const matches = [...content.matchAll(h.pattern)];
        if (matches.length === 0) continue;

        const frag = document.createDocumentFragment();
        let lastIndex = 0;
        for (const m of matches) {
          const start = m.index ?? 0;
          const end = start + (m[0]?.length ?? 0);
          if (start > lastIndex) {
            frag.appendChild(
              document.createTextNode(content.slice(lastIndex, start))
            );
          }
          const span = document.createElement("span");
          span.className = className;
          if (style) Object.assign(span.style, style);
          span.textContent = content.slice(start, end);
          frag.appendChild(span);
          lastIndex = end;
        }
        if (lastIndex < content.length) {
          frag.appendChild(document.createTextNode(content.slice(lastIndex)));
        }

        // Replace the original text node with the fragment
        node.parentNode?.replaceChild(frag, node);
      }
    }
  }, [trigger, highlights]);

  return <div ref={rootRef}>{children}</div>;
}
