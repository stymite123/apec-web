"use client";

import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { whenIdle } from "@/lib/idle";
import { gsapEase } from "@/lib/motion";

export type ServiceRow = {
  slug: string;
  number: string;
  title: string;
  summary?: string;
  lead?: { name: string; href: string };
};

/**
 * The services index. On entering view each row draws its hairline, its title rises
 * out of a mask and the details fade in (once, transform/opacity). Hover: the row
 * fills with blackish red from the bottom and the title steps right.
 */
export function ServiceRows({ rows, ledBy }: { rows: ServiceRow[]; ledBy: string }) {
  const root = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      const cancel = whenIdle(() => {
        mm.add(MOTION_OK, () => {
          const items = gsap.utils.toArray<HTMLElement>("[data-service-row]", el);
          gsap.set(items, { "--line": 0 });
          gsap.set(gsap.utils.toArray("[data-row-title]", el), { yPercent: 110 });
          gsap.set(gsap.utils.toArray("[data-row-fade]", el), { opacity: 0, y: 14 });
          const batch = ScrollTrigger.batch(items, {
            start: "top 88%",
            once: true,
            onEnter: (entered) =>
              entered.forEach((item, i) => {
                const delay = i * 0.09;
                gsap.to(item, { "--line": 1, duration: 1.1, ease: gsapEase.outExpo, delay });
                gsap.to(item.querySelector("[data-row-title]"), {
                  yPercent: 0,
                  duration: 1,
                  ease: gsapEase.outExpo,
                  delay: delay + 0.08,
                });
                gsap.to(item.querySelectorAll("[data-row-fade]"), {
                  opacity: 1,
                  y: 0,
                  duration: 0.8,
                  ease: "power2.out",
                  stagger: 0.06,
                  delay: delay + 0.2,
                });
              }),
          });
          return () => batch.forEach((trigger) => trigger.kill());
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
    <ol ref={root} className="mt-16 border-b border-grey-800 md:mt-24">
      {rows.map((row) => {
        const content = (
          <>
            {/* Hairline drawn on entry (scaleX via --line, transform only). */}
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-px origin-left scale-x-[var(--line,1)] bg-grey-700"
            />
            {/* Hover fill. */}
            <span
              aria-hidden
              className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-oxblood-900 transition-transform duration-700 ease-out-expo group-hover:scale-y-100 group-focus-visible:scale-y-100"
            />
            <span
              data-row-fade
              className="label-mono text-[11px] text-rose-400 md:col-span-1 md:self-center"
            >
              {row.number}
            </span>
            <span className="block overflow-hidden pb-1 md:col-span-5">
              <span
                data-row-title
                className="text-grad block font-field text-[clamp(1.9rem,3.6vw,3.4rem)] leading-[1.02] tracking-[-0.03em] transition-transform duration-700 ease-out-expo [--g-from:#ffffff] [--g-to:#a9abb2] [font-variation-settings:'opsz'_72] group-hover:translate-x-3"
              >
                {row.title}
              </span>
            </span>
            {row.summary && (
              <span data-row-fade className="max-w-md text-[15px] text-grey-400 md:col-span-4">
                {row.summary}
              </span>
            )}
            {row.lead && (
              <span
                data-row-fade
                className="flex items-center gap-3 md:col-span-2 md:justify-end md:self-center"
              >
                <span className="label-mono text-[11px] text-grey-300">
                  <span className="sr-only">{ledBy} </span>
                  {row.lead.name}
                </span>
                <ArrowUpRightIcon
                  aria-hidden
                  className="size-4 shrink-0 text-rose-400 transition-transform duration-500 ease-out-expo group-hover:rotate-45"
                />
              </span>
            )}
          </>
        );
        const rowClass =
          "group relative isolate grid gap-3 py-8 md:grid-cols-12 md:items-baseline md:gap-6 md:px-4 md:py-10";
        return (
          <li key={row.slug} data-service-row className="relative">
            {row.lead ? (
              <Link href={row.lead.href} className={rowClass}>
                {content}
              </Link>
            ) : (
              <div className={rowClass}>{content}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
