import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { processSteps } from "@/content/services";
import { site } from "@/content/site";
import { pad } from "@/lib/accent";
import { isTodo } from "@/lib/todo";

/**
 * Process (brief §8.1 #7): the steps in order on one rail that fills as you scroll,
 * matching "What we do" (serif titles, mono numbers, grey copy).
 */
export function Process() {
  const copy = site.sections.process;

  return (
    <section
      id={copy.id}
      aria-labelledby={`${copy.id}-title`}
      className="border-t border-grey-800 bg-void"
    >
      <div className="container-site py-28 md:py-36">
        <SectionHeader id={copy.id} eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} />
        <ProcessSteps
          steps={processSteps.map((step, index) => ({
            number: `${pad(index + 1)} / ${pad(processSteps.length)}`,
            title: step.title,
            summary: isTodo(step.summary) ? undefined : step.summary,
          }))}
        />
      </div>
    </section>
  );
}
