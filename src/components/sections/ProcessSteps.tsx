"use client";

import { useRef } from "react";

import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { whenIdle } from "@/lib/idle";

export type ProcessStep = { number: string; title: string; summary?: string };

/**
 * "How we work" as a sequence on one rail (horizontal on desktop, vertical on phones).
 * Scrolling through the section fills the rail in rose; each step lights up when the
 * fill reaches its node (transform/opacity only, no continuous rendering).
 * Without JS or with reduced motion every step is shown, rail full; reduced motion
 * gets a one-time fade instead of the scroll fill.
 */
export function ProcessSteps({ steps }: { steps: ProcessStep[] }) {
  const root = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const fill = el.querySelector<HTMLElement>("[data-process-fill]");
      const items = gsap.utils.toArray<HTMLElement>("[data-step]", el);
      const mm = gsap.matchMedia();

      const cancel = whenIdle(() => {
        mm.add(MOTION_OK, () => {
          const render = (progress: number) => {
            fill?.style.setProperty("--p", String(progress));
            items.forEach((item, i) => {
              // A step is reached once the fill passes its node (nodes sit at i / n).
              item.toggleAttribute("data-pending", progress < i / items.length + 0.04);
            });
          };
          const trigger = ScrollTrigger.create({
            trigger: el,
            start: "top 78%",
            end: "bottom 55%",
            onUpdate: (self) => render(self.progress),
            onRefresh: (self) => render(self.progress),
          });
          render(trigger.progress);
          return () => {
            fill?.style.removeProperty("--p");
            items.forEach((item) => item.removeAttribute("data-pending"));
          };
        });

        // Reduced motion: a one-time fade when the list comes into view. Plain
        // IntersectionObserver (no scroll positions to go stale); hidden only once observed.
        mm.add("(prefers-reduced-motion: reduce)", () => {
          gsap.set(items, { opacity: 0 });
          const observer = new IntersectionObserver(
            ([entry]) => {
              if (!entry?.isIntersecting) return;
              observer.disconnect();
              gsap.to(items, { opacity: 1, duration: 1, stagger: 0.2 });
            },
            { rootMargin: "0px 0px -15% 0px" },
          );
          observer.observe(el);
          return () => observer.disconnect();
        });
      });

      return () => {
        cancel();
        mm.revert();
      };
    },
    { scope: root },
  );

  return (
    <ol
      ref={root}
      className="relative mt-16 grid gap-12 pl-11 md:mt-24 md:grid-cols-4 md:gap-8 md:pt-16 md:pl-0"
    >
      {/* Rail + its scroll-driven fill (scale only). */}
      <span
        aria-hidden
        className="absolute top-1.5 bottom-1.5 left-[11px] w-px bg-grey-800 md:top-[5px] md:right-0 md:bottom-auto md:left-0 md:h-px md:w-auto"
      />
      <span
        aria-hidden
        data-process-fill
        className="absolute top-1.5 bottom-1.5 left-[11px] w-px origin-top scale-y-[var(--p,1)] bg-linear-to-b from-rose-300 to-rose-600 md:top-[5px] md:right-0 md:bottom-auto md:left-0 md:h-px md:w-auto md:origin-left md:scale-x-[var(--p,1)] md:scale-y-100 md:bg-linear-to-r"
      />

      {steps.map((step) => (
        <li
          key={step.title}
          data-step
          className="group/step relative transition-[opacity,translate] duration-700 ease-out-expo data-pending:translate-y-3 data-pending:opacity-30"
        >
          {/* Node on the rail. */}
          <span
            aria-hidden
            className="absolute top-1 -left-[38px] size-3 rounded-full border-2 border-rose-400 bg-rose-400 shadow-[0_0_0_5px_rgb(229_87_122/0.15)] transition-colors duration-500 group-data-pending/step:border-grey-700 group-data-pending/step:bg-void group-data-pending/step:shadow-none md:-top-[67px] md:left-0"
          />
          <p className="label-mono text-[11px] text-rose-400 transition-colors duration-500 group-data-pending/step:text-grey-500">
            {step.number}
          </p>
          <h3 className="text-grad mt-4 font-field text-[clamp(1.9rem,2.8vw,2.75rem)] leading-[1.02] tracking-[-0.03em] [--g-from:#ffffff] [--g-to:#a9abb2] [font-variation-settings:'opsz'_72]">
            {step.title}
          </h3>
          {step.summary && (
            <p className="mt-4 max-w-xs text-[15px] text-grey-400">{step.summary}</p>
          )}
        </li>
      ))}
    </ol>
  );
}
