import {
  ref,
  defineState,
  useLocalState,
  useProvidedState,
  $,
} from "pretty-good-state";
import { ReactNode, useEffect } from "react";
import { twMerge } from "tailwind-merge";

export const ScrollState = defineState(() => ({
  top: 0,
  left: 0,
  width: 0,
  height: 0,
  el: ref<HTMLDivElement | null>(null),
  scrollTo(scrollTopOptions: ScrollToOptions) {
    this.el?.scrollTo(scrollTopOptions);
  },
}));

export function ScrollView({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  const state = useLocalState(ScrollState);

  useEffect(() => {
    const element = state.el;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        state.width = width;
        state.height = height;
      }
    });

    resizeObserver.observe(element);

    // Set initial dimensions
    state.width = element.clientWidth;
    state.height = element.clientHeight;

    return () => {
      resizeObserver.disconnect();
    };
  }, [state]);

  return (
    <div
      ref={(el) => {
        $(state).el = ref(el);
      }}
      className={twMerge("relative overflow-y-auto", className)}
      onScroll={(e) => {
        state.top = e.currentTarget.scrollTop;
        state.left = e.currentTarget.scrollLeft;
      }}
    >
      <ScrollState.Provider state={state}>{children}</ScrollState.Provider>
    </div>
  );
}

export function ScrollPositionView() {
  const state = useProvidedState(ScrollState);
  return (
    <div className="sticky top-0 left-0 right-0 bg-white flex gap-6">
      <div>Top: {state.top}</div>
      <div>Left: {state.left}</div>
    </div>
  );
}
