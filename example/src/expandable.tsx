import {
  Provider,
  state,
  useLocalState,
  useProvidedState,
} from "pretty-good-state";

const ExpandableState = state({
  isExpanded: false,
  toggle() {
    this.isExpanded = !this.isExpanded;
  },
});

export function Expandable({ content }: { content: string }) {
  const state = useLocalState(ExpandableState);
  return (
    <div>
      <Provider state={state}>
        <div className="text-base">Expandable</div>
        <div className="flex gap-2 items-start">
          <ExpandableContent content={content} />
          <ExpandButton />
        </div>
      </Provider>
    </div>
  );
}

function ExpandButton() {
  const state = useProvidedState(ExpandableState);
  return (
    <button onClick={() => state.toggle()}>
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
