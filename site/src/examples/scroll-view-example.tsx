import { defineState, ref, useLocalState } from "pretty-good-state";

const ScrollState = defineState({
  top: 0,
  el: ref<Element | null>(null),
});

export function ScrollView() {
  const scroll = useLocalState(ScrollState);
  return (
    <>
      <div>Top: {scroll.top}</div>
      <div
        ref={(el) => {
          scroll.el = ref(el);
        }}
        onScroll={(e) => {
          scroll.top = e.currentTarget.scrollTop;
        }}
        className="h-[100px] overflow-y-auto outline"
      >
        <div className="h-[200px] p-3">Scroll Me! ⬇</div>
      </div>
    </>
  );
}
