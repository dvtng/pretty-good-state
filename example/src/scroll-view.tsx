import {
  Provider,
  ref,
  defineState,
  useLocalState,
  useProvidedState,
} from "pretty-good-state";
import { ReactNode, useEffect } from "react";
import { twMerge } from "tailwind-merge";

export const ScrollState = defineState(() => ({
  top: 0,
  left: 0,
  width: 0,
  height: 0,
  el: ref<HTMLDivElement>(document.createElement("div")),
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
        state.set((s) => {
          s.width = width;
          s.height = height;
        });
      }
    });

    resizeObserver.observe(element);

    // Set initial dimensions
    state.set((s) => {
      s.width = element.clientWidth;
      s.height = element.clientHeight;
    });

    return () => {
      resizeObserver.disconnect();
    };
  }, [state]);

  return (
    <div
      ref={(el) => {
        if (el) {
          state.set((s) => {
            s.el = ref(el);
          });
        }
      }}
      className={twMerge("relative overflow-y-auto", className)}
      onScroll={(e) => {
        state.set((s) => {
          s.top = e.currentTarget.scrollTop;
          s.left = e.currentTarget.scrollLeft;
        });
      }}
    >
      <Provider state={state}>{children}</Provider>
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
