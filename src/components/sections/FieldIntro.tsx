"use client";

import Image from "next/image";
import { useRef } from "react";

import { gsap, MOTION_OK, SplitText, useGSAP } from "@/lib/gsap";
import { whenIdle } from "@/lib/idle";
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
  return (
    <svg aria-hidden viewBox={viewBox} fill="none" className={className} data-scribble>
      <path
        d={d}
        pathLength={1}
        stroke="currentColor"
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

/** Floating portrait cards (whole portraits, never cropped to fragments). */
const FLOATS = [
  { left: "5%", width: "w-[clamp(130px,19vw,280px)]", at: 0 },
  { left: "73%", width: "w-[clamp(120px,17vw,250px)]", at: 0.4 },
  { left: "26%", width: "w-[clamp(100px,13vw,190px)]", at: 0.95 },
  { left: "79%", width: "w-[clamp(130px,20vw,290px)]", at: 1.4 },
  { left: "9%", width: "w-[clamp(120px,16vw,240px)]", at: 1.65 },
];

/**
 * The panel that slides over the sticky hero (GSAP Field "base" section), adapted to
 * APEC's dark theme: intro paragraph whose words light up + drawn arrow, then
 * a pinned stage (CSS sticky, native scroll) where the manifesto phrases swap
 * character by character, each with its scribble, while the five float past. It ends in void, handing over to the team cards.
 * Motion: transform/opacity, plus stroke drawing on the small scribble paths.
 */
export function FieldIntro({
  label,
  intro,
  phrases,
  floats,
}: {
  label: [string, string];
  intro: string;
  phrases: string[];
  /** Portrait per member, in team order. */
  floats: string[];
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();
      // Below the fold: set up in its own idle-time task, not during hydration.
      const cancel = whenIdle(() => {
        mm.add(MOTION_OK, () => {
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
            .fromTo(words.words, { opacity: 0.16 }, { opacity: 1, stagger: 0.08, ease: "none" }, 0)
            .fromTo(
              q("[data-intro-block] [data-scribble] path"),
              { strokeDashoffset: 1 },
              { strokeDashoffset: 0, ease: "none", duration: 0.6 * words.words.length * 0.08 },
              0.25 * words.words.length * 0.08,
            );

          // 2. Pinned phrases: chars out/in, scribbles draw, cards float, then fade to void.
          const phraseEls = q<HTMLElement>("[data-phrase]");
          const splits = phraseEls.map((p) =>
            SplitText.create(p.querySelector("[data-phrase-text]"), { type: "words,chars" }),
          );
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
              tl.to(chars, { yPercent: -70, opacity: 0, stagger: 0.012, duration: 0.25 }, i + 0.72)
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

          return () => {
            words.revert();
            splits.forEach((s) => s.revert());
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
      });
      return () => {
        cancel();
        mm.revert();
      };
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      data-cover
      className="relative z-10 rounded-t-[14px] bg-navy-900 shadow-[0_-40px_90px_rgb(0_0_0/0.65)]"
    >
      {/* Burgundy hairline along the panel's leading edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[10%] top-0 h-px bg-linear-to-r from-transparent via-wine-300/80 to-transparent"
      />
      {/* Intro: mono label left, paragraph right (reference "Somewhere between the code…"). */}
      <div
        data-intro-block
        className="relative grid min-h-[70svh] content-start gap-10 px-4 pt-14 pb-24 md:grid-cols-2 md:px-6 md:pt-14"
      >
        <p className="label-mono text-[11px] text-steel-400">
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
            className="pointer-events-none absolute top-[62%] right-[8%] w-[clamp(120px,15vw,220px)] text-brand-300"
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
            {floats.map((src, i) => (
              <div
                key={src}
                data-float
                className={`absolute top-0 ${FLOATS[i]?.width ?? "w-40"} aspect-[4/5] overflow-hidden rounded-md bg-navy-800 ring-1 ring-steel-800`}
                style={{ left: FLOATS[i]?.left ?? "50%", transform: "translateY(110vh)" }}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 20vw, 34vw"
                  className="object-cover object-top"
                />
              </div>
            ))}
          </div>

          {phrases.map((phrase, i) => (
            <div
              key={phrase}
              data-phrase
              className={`absolute inset-0 grid place-items-center px-4 motion-reduce:visible motion-reduce:static motion-reduce:opacity-100 ${i === 0 ? "" : "invisible opacity-0"}`}
            >
              <div className="relative text-center">
                <p data-phrase-kicker className="mb-3 label-mono text-[11px] text-wine-200">
                  {String(i + 1).padStart(2, "0")} / {String(phrases.length).padStart(2, "0")}
                </p>
                <p
                  data-phrase-text
                  className="font-field text-[clamp(2.4rem,5vw,4.75rem)] leading-[1] tracking-[-0.03em] text-balance text-silver-100 [font-variation-settings:'opsz'_72] md:whitespace-nowrap"
                >
                  {phrase}
                </p>
                <Scribble
                  name={PHRASE_SCRIBBLES[i % PHRASE_SCRIBBLES.length].name}
                  className={`pointer-events-none absolute text-brand-300 ${PHRASE_SCRIBBLES[i % PHRASE_SCRIBBLES.length].className}`}
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
