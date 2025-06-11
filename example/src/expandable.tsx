import {
  Provider,
  state,
  useLocalState,
  useProvidedState,
} from "pretty-good-state";

const ExpandableState = state({
  isExpanded: false,
});

export function Expandable({ content }: { content: string }) {
  const state = useLocalState(ExpandableState);
  return (
    <Provider state={state}>
      <div className="flex gap-2 items-start">
        <ExpandableContent content={content} />
        <ExpandButton />
      </div>
    </Provider>
  );
}

function ExpandButton() {
  const state = useProvidedState(ExpandableState);
  return (
    <button
      onClick={() =>
        state.set((state) => {
          state.isExpanded = !state.isExpanded;
        })
      }
    >
      {state.isExpanded ? "-" : "+"}
    </button>
  );
}

function ExpandableContent({ content }: { content: string }) {
  const state = useProvidedState(ExpandableState);
  return (
    <div className="py-2">
      <div className={state.isExpanded ? "line-clamp-none" : "line-clamp-1"}>
        {content}
      </div>
    </div>
  );
}
