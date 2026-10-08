"use client";

import { Fragment, useRef } from "react";

import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import { whenIdle } from "@/lib/idle";

/** Repeats per row: enough to cover the widest screen while the row slides 25%. */
const REPEAT = 4;

/**
 * Interlude between services and process (replaces the "Combined" packages, Mustafa
 * 2026-10-08): the agency tagline in giant serif on blackish red. A filled row slides
 * left and an outlined grey row slides right as you scroll (scrubbed, transform only).
 */
export function TaglineBand({ words, label }: { words: string[]; label: string }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      const cancel = whenIdle(() => {
        mm.add(MOTION_OK, () => {
          const scroll = { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 };
          gsap.fromTo(
            el.querySelector("[data-band-a]"),
            { xPercent: 0 },
            { xPercent: -25, ease: "none", scrollTrigger: scroll },
          );
          gsap.fromTo(
            el.querySelector("[data-band-b]"),
            { xPercent: -25 },
            { xPercent: 0, ease: "none", scrollTrigger: scroll },
          );
        });
      });
      return () => {
        cancel();
        mm.revert();
      };
    },
    { scope: root },
  );

  const row = (outlined: boolean) =>
    Array.from({ length: REPEAT }, (_, r) => (
      <Fragment key={r}>
        {words.map((word, i) => (
          <Fragment key={word}>
            <span
              className={
                outlined
                  ? "text-transparent [-webkit-text-stroke:1px_var(--color-grey-500)]"
                  : i % 2
                    ? "text-grad italic [--g-from:#f8b4c4] [--g-to:#c8325a]"
                    : "text-grad [--g-from:#ffffff] [--g-to:#a9abb2]"
              }
            >
              {word}
            </span>
            <span
              aria-hidden
              className="text-grad mx-[0.35em] inline-block align-middle text-[0.4em] [--g-from:#f8b4c4] [--g-to:#c8325a]"
            >
              ✦
            </span>
          </Fragment>
        ))}
      </Fragment>
    ));

  return (
    <section
      ref={root}
      aria-label={label}
      className="relative overflow-hidden border-t border-oxblood-800 bg-oxblood-950 py-16 md:py-24"
    >
      <p className="sr-only">{words.join(", ")}</p>
      <div
        aria-hidden
        className="font-field text-[clamp(3.5rem,11vw,11rem)] leading-[1.02] tracking-[-0.035em] whitespace-nowrap [font-variation-settings:'opsz'_72]"
      >
        <div data-band-a className="w-max">
          {row(false)}
        </div>
        <div data-band-b className="w-max" style={{ transform: "translateX(-25%)" }}>
          {row(true)}
        </div>
      </div>
    </section>
  );
}
