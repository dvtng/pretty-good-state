import { IntroSection } from "./intro-section";
import { GettingStartedSection } from "./getting-started-section";
import { ComplexStatesSection } from "./complex-states-section";

export function App() {
  return (
    <div className="flex flex-col gap-8 px-6 py-16 max-w-[800px] mx-auto justify-center">
      <IntroSection />
      <GettingStartedSection />
      <ComplexStatesSection />
    </div>
  );
}
