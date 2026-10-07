import { Copy } from "@/components/dev/Todo";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { processSteps } from "@/content/services";
import { site } from "@/content/site";
import { pad } from "@/lib/accent";
import { shouldRender } from "@/lib/todo";
import { cn } from "@/lib/utils";

/** Offsets that make the steps climb left → right on desktop ("The Ascent"). */
const climb = ["md:mt-36", "md:mt-24", "md:mt-12", "md:mt-0"];

/** Process (brief §8.1 #7). Static staircase in v1; the drawn line comes later. */
export function Process() {
  const copy = site.sections.process;

  return (
    <section id={copy.id} aria-labelledby={`${copy.id}-title`} className="container-site py-28">
      <SectionHeader id={copy.id} eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} />
      <ol className="mt-14 grid gap-6 md:grid-cols-4 md:items-start">
        {processSteps.map((step, index) => (
          <li
            key={step.title}
            className={cn(
              "relative rounded-card border border-steel-800 bg-navy-900 p-6",
              climb[index],
            )}
          >
            <span aria-hidden className="absolute inset-x-6 top-0 h-px bg-(image:--grad-brand)" />
            <p className="label-mono text-brand-300">{pad(index + 1)}</p>
            <h3 className="mt-6 font-display text-2xl font-semibold text-silver-100">
              {step.title}
            </h3>
            {shouldRender(step.summary) && (
              <p className="mt-3 text-steel-300">
                <Copy value={step.summary} />
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
