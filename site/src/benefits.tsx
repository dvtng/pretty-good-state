import { ArrowRight, CheckIcon } from "lucide-react";

export function Benefits() {
  return (
    <div className="leading-relaxed text-xl">
      <ul className="[&>li]:flex [&>li]:gap-2 flex flex-col gap-1">
        <li>
          <Tick />
          <div>
            <div>Directly mutate state</div>
            <div>
              <Code>state.count++</Code>
            </div>
          </div>
        </li>
        <li>
          <Tick />
          <div>
            <div>Get fine-grained reactivity</div>
            <Code>{"<div>{state.count}</div>"}</Code>
          </div>
        </li>
        <li>
          <Tick />
          <div>
            <div>Switch between local, global, or context state</div>
            <div>
              <Code>useLocalState</Code>
              <ArrowRight className="size-4 text-black/30 inline-block mx-2" />
              <Code>useProvidedState</Code>
            </div>
          </div>
        </li>
        <li>
          <Tick />
          <div>
            <div>Made for TypeScript</div>
            <div>
              <Code>{"Infer<typeof MyState>"}</Code>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
}

function Tick() {
  return (
    <CheckIcon className="text-emerald-500 mr-1 mt-[0.33em] shrink-0 size-[1em]" />
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="text-sm bg-black/5 px-2 inline-block text-black/50">
      {children}
    </code>
  );
}
