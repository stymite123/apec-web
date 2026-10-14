import { BuildStage } from "@/components/sections/BuildStage";
import { processSteps } from "@/content/services";
import { site } from "@/content/site";
import { isTodo } from "@/lib/todo";

/** Process (brief §8.1 #7): the steps as stages of a build that ends at the apex. */
export function Process() {
  const copy = site.sections.process;
  return (
    <BuildStage
      id={copy.id}
      title={copy.title}
      steps={processSteps.map((step) => ({
        title: step.title,
        summary: isTodo(step.summary) ? undefined : step.summary,
      }))}
    />
  );
}
