import { Reader } from "./examples/reader";
import { CodeExample } from "./code-example";
import readerSource from "./examples/reader.tsx?raw";

export function App() {
  return (
    <div className="flex flex-col gap-8 px-6 py-16 max-w-[800px] mx-auto justify-center">
      <h1 className="text-6xl tracking-tighter font-medium">
        pretty good state
      </h1>
      <code className="font-mono tracking-tight flex items-center gap-1.5">
        npm install pretty-good-state
        <div className="inline-block w-2 h-[1.2em] bg-black" />
      </code>
      <div className="-mx-6">
        <CodeExample source={readerSource}>
          <Reader>
            <div className="py-3">
              <p className="mb-2">
                The just-enough state management library for React.
              </p>
              <p>✅ Fine-grained reactivity</p>
              <p>✅ Simple and intuitive mutations</p>
              <p>✅ Unified API for local, global, and context state</p>
              <p>✅ Full TypeScript support</p>
            </div>
          </Reader>
        </CodeExample>
      </div>
    </div>
  );
}
