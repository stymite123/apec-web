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
              "relative rounded-card border border-grey-800 bg-grey-900 p-6",
              climb[index],
            )}
          >
            <span
              aria-hidden
              className="absolute inset-x-6 top-0 h-px bg-linear-to-r from-rose-400 via-rose-600 to-transparent"
            />
            <p className="label-mono text-rose-400">{pad(index + 1)}</p>
            <h3 className="text-grad mt-6 font-field text-3xl tracking-[-0.02em] [--g-from:#ffffff] [--g-to:#a9abb2] [font-variation-settings:'opsz'_72]">
              {step.title}
            </h3>
            {shouldRender(step.summary) && (
              <p className="mt-3 text-grey-300">
                <Copy value={step.summary} />
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
