"use client";

import { useId, useRef } from "react";

import { gsap, MOTION_OK, SplitText, useGSAP } from "@/lib/gsap";
import { whenIdleEach } from "@/lib/idle";
import { scrub } from "@/lib/motion";

/**
 * Hand-drawn strokes (GSAP Field scribbles), drawn on scroll. Original paths.
 * Scaled uniformly, so `stroke` is in viewBox units (tuned per rendered size).
 */
const SCRIBBLES = {
  arrow: {
    viewBox: "0 0 210 150",
    stroke: 7,
    d: "M190 22C150-4 92 14 98 60c4 40 52 50 52 20 0-30-60-34-90 2-16 18-21 38-22 58M22 122l16 20 16-18",
  },
  zigzag: {
    viewBox: "0 0 140 90",
    stroke: 5,
    d: "M5 62 25 18l15 54L58 12l14 66L90 8l15 64 17-48 13 34",
  },
  ring: {
    viewBox: "0 0 600 150",
    stroke: 6.5,
    d: "M40 70C22 24 300 6 520 22c80 6 72 66 18 88-110 44-400 40-480 6C14 96 30 56 120 40",
  },
  loop: {
    viewBox: "0 0 200 100",
    stroke: 6.5,
    d: "M20 50C20 10 80 10 100 50s80 40 80 0-60-40-80 0-80 40-80 0Z",
  },
} as const;

type ScribbleName = keyof typeof SCRIBBLES;

function Scribble({ name, className }: { name: ScribbleName; className?: string }) {
  const { viewBox, d, stroke } = SCRIBBLES[name];
  const gradient = `scribble-${useId().replace(/:/g, "")}`;
  return (
    <svg aria-hidden viewBox={viewBox} fill="none" className={className} data-scribble>
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f8b4c4" />
          <stop offset="55%" stopColor="#e5577a" />
          <stop offset="100%" stopColor="#b8304f" />
        </linearGradient>
      </defs>
      <path
        d={d}
        pathLength={1}
        stroke={`url(#${gradient})`}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="[stroke-dasharray:1] [stroke-dashoffset:0]"
      />
    </svg>
  );
}

/** Each phrase gets a scribble, placed relative to the phrase. */
const PHRASE_SCRIBBLES: { name: ScribbleName; className: string }[] = [
  { name: "zigzag", className: "-top-[45%] left-[38%] w-[34%]" },
  { name: "ring", className: "-top-[38%] -left-[6%] w-[112%]" },
  { name: "loop", className: "-top-[30%] left-[52%] w-[34%]" },
];

/** Floating discipline tags (text only: Mustafa 2026-10-08, no repeated photos). */
const FLOATS: { side: "left" | "right"; offset: string; at: number }[] = [
  { side: "left", offset: "6%", at: 0 },
  { side: "right", offset: "7%", at: 0.4 },
  { side: "left", offset: "22%", at: 0.95 },
  { side: "right", offset: "12%", at: 1.4 },
  { side: "left", offset: "9%", at: 1.65 },
];

/**
 * The panel that slides over the sticky hero (GSAP Field "base" section), adapted to
 * APEC's dark theme: intro paragraph whose words light up + drawn arrow, then
 * a pinned stage (CSS sticky, native scroll) where the manifesto phrases swap
 * character by character, each with its scribble, while the five disciplines float past
 * as tags. It ends in void, handing over to the team cards.
 * Motion: transform/opacity, plus stroke drawing on the small scribble paths.
 */
export function FieldIntro({
  label,
  intro,
  phrases,
  tags,
}: {
  label: [string, string];
  intro: string;
  phrases: string[];
  /** One tag per discipline: a number and a name. */
  tags: { number: string; label: string }[];
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // Below the fold: intro and phrases are set up in separate idle slices.
        const contexts: gsap.Context[] = [];
        const cancel = whenIdleEach([
          () =>
            contexts.push(
              gsap.context(() => {
                // 1. Intro: words light up, arrow draws.
                const words = SplitText.create(q("[data-intro]")[0], { type: "words" });
                gsap
                  .timeline({
                    scrollTrigger: {
                      trigger: q("[data-intro-block]")[0],
                      start: "top 85%",
                      end: "bottom 35%",
                      scrub,
                    },
                  })
                  .fromTo(
                    words.words,
                    { opacity: 0.16 },
                    { opacity: 1, stagger: 0.08, ease: "none" },
                    0,
                  )
                  .fromTo(
                    q("[data-intro-block] [data-scribble] path"),
                    { strokeDashoffset: 1 },
                    {
                      strokeDashoffset: 0,
                      ease: "none",
                      duration: 0.6 * words.words.length * 0.08,
                    },
                    0.25 * words.words.length * 0.08,
                  );
              }),
            ),
          () =>
            contexts.push(
              gsap.context(() => {
                // 2. Pinned phrases: chars out/in, scribbles draw, cards float, then fade to void.
                const phraseEls = q<HTMLElement>("[data-phrase]");
                const splits = phraseEls.map((p) =>
                  SplitText.create(p.querySelector("[data-phrase-text]"), {
                    type: "words,chars",
                    charsClass: "text-grad",
                  }),
                );
                // The letters paint the gradient now; the phrase itself must not (ghost copy).
                const texts = phraseEls.map((p) => p.querySelector("[data-phrase-text]"));
                texts.forEach((text) => text?.classList.add("text-grad-split"));
                const tl = gsap.timeline({
                  defaults: { ease: "none" },
                  scrollTrigger: {
                    trigger: q("[data-phrases]")[0],
                    start: "top top",
                    end: "bottom bottom",
                    scrub,
                    invalidateOnRefresh: true,
                  },
                });
                phraseEls.forEach((phrase, i) => {
                  const chars = splits[i].chars;
                  const path = phrase.querySelector("[data-scribble] path");
                  const kicker = phrase.querySelector("[data-phrase-kicker]");
                  tl.set(phrase, { autoAlpha: 1 }, i);
                  if (i > 0) {
                    tl.fromTo(
                      chars,
                      { yPercent: 70, opacity: 0 },
                      { yPercent: 0, opacity: 1, stagger: 0.012, duration: 0.25 },
                      i,
                    ).fromTo(kicker, { opacity: 0 }, { opacity: 1, duration: 0.2 }, i);
                  }
                  tl.fromTo(
                    path,
                    { strokeDashoffset: 1 },
                    { strokeDashoffset: 0, duration: 0.35 },
                    i + 0.2,
                  );
                  if (i < phraseEls.length - 1) {
                    tl.to(
                      chars,
                      { yPercent: -70, opacity: 0, stagger: 0.012, duration: 0.25 },
                      i + 0.72,
                    )
                      .to([kicker, path], { opacity: 0, duration: 0.2 }, i + 0.72)
                      .set(phrase, { autoAlpha: 0 }, i + 1);
                  }
                });
                const span = phraseEls.length;
                q<HTMLElement>("[data-float]").forEach((card, i) => {
                  const at = FLOATS[i]?.at ?? i * 0.5;
                  tl.fromTo(
                    card,
                    { y: () => window.innerHeight * 1.05, rotation: i % 2 ? 4 : -4 },
                    { y: () => -card.offsetHeight * 1.2, rotation: i % 2 ? -3 : 3, duration: 1.3 },
                    at,
                  );
                });
                tl.to(q("[data-to-void]"), { opacity: 1, duration: 0.2 }, span - 0.2);
                return () => texts.forEach((text) => text?.classList.remove("text-grad-split"));
              }),
            ),
        ]);
        return () => {
          cancel();
          contexts.forEach((context) => context.revert());
        };
      });

      // Reduced motion: no movement; phrases fade in once as they arrive.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        for (const phrase of q<HTMLElement>("[data-phrase]")) {
          gsap.from(phrase, {
            opacity: 0,
            duration: 1.2,
            scrollTrigger: { trigger: phrase, start: "top 80%", once: true },
          });
        }
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      data-cover
      className="relative z-10 rounded-t-[14px] bg-oxblood-900 shadow-[0_-40px_90px_rgb(0_0_0/0.65)]"
    >
      {/* Burgundy hairline along the panel's leading edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[10%] top-0 h-px bg-linear-to-r from-transparent via-rose-400/80 to-transparent"
      />
      {/* Intro: mono label left, paragraph right (reference "Somewhere between the code…"). */}
      <div
        data-intro-block
        className="relative grid min-h-[70svh] content-start gap-10 px-4 pt-14 pb-24 md:grid-cols-2 md:px-6 md:pt-14"
      >
        <p className="label-mono text-[11px] text-grey-400">
          {label[0]}
          <br />
          {label[1]}
        </p>
        <div className="relative md:justify-self-end">
          <p
            data-intro
            className="max-w-[24ch] text-[clamp(1.7rem,3vw,2.85rem)] leading-[1.06] font-medium tracking-[-0.025em] text-silver-100 md:text-right"
          >
            {intro}
          </p>
          <Scribble
            name="arrow"
            className="pointer-events-none absolute top-[62%] right-[8%] w-[clamp(120px,15vw,220px)] text-rose-400"
          />
        </div>
      </div>

      {/* Pinned phrase stage. Tall track + sticky viewport = native scroll, no pin-spacer. */}
      <div
        data-phrases
        className="relative h-[380svh] motion-reduce:h-auto motion-reduce:py-[20svh]"
      >
        <div className="sticky top-0 h-svh overflow-hidden motion-reduce:static motion-reduce:h-auto motion-reduce:space-y-[30svh] motion-reduce:overflow-visible">
          <div aria-hidden className="absolute inset-0 motion-reduce:hidden">
            {tags.map((tag, i) => {
              const place = FLOATS[i % FLOATS.length];
              return (
                <div
                  key={tag.label}
                  data-float
                  className="absolute top-0 flex items-baseline gap-3 rounded-md border border-grey-700 bg-grey-900/90 px-4 py-3 whitespace-nowrap shadow-[0_20px_40px_rgb(0_0_0/0.35)] md:px-5 md:py-4"
                  style={{ [place.side]: place.offset, transform: "translateY(110vh)" }}
                >
                  <span className="label-mono text-[11px] text-rose-400">{tag.number}</span>
                  <span className="font-field text-[clamp(1.05rem,1.9vw,1.75rem)] text-grey-300 [font-variation-settings:'opsz'_72]">
                    {tag.label}
                  </span>
                </div>
              );
            })}
          </div>

          {phrases.map((phrase, i) => (
            <div
              key={phrase}
              data-phrase
              className={`absolute inset-0 grid place-items-center px-4 motion-reduce:visible motion-reduce:static motion-reduce:opacity-100 ${i === 0 ? "" : "invisible opacity-0"}`}
            >
              <div className="relative text-center">
                <p data-phrase-kicker className="mb-3 label-mono text-[11px] text-rose-300">
                  {String(i + 1).padStart(2, "0")} / {String(phrases.length).padStart(2, "0")}
                </p>
                <p
                  data-phrase-text
                  className="text-grad font-field text-[clamp(2.4rem,5vw,4.75rem)] leading-[1] tracking-[-0.03em] text-balance [--g-from:#ffffff] [--g-to:#a9abb2] [font-variation-settings:'opsz'_72] md:whitespace-nowrap"
                >
                  {phrase}
                </p>
                <Scribble
                  name={PHRASE_SCRIBBLES[i % PHRASE_SCRIBBLES.length].name}
                  className={`pointer-events-none absolute text-rose-400 ${PHRASE_SCRIBBLES[i % PHRASE_SCRIBBLES.length].className}`}
                />
              </div>
            </div>
          ))}

          {/* Fades the stage to void so the team cards start on black. */}
          <div
            aria-hidden
            data-to-void
            className="pointer-events-none absolute inset-0 bg-void opacity-0 motion-reduce:hidden"
          />
        </div>
      </div>
    </div>
  );
}
