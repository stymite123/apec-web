"use client";

import {
  AppWindowIcon,
  PenToolIcon,
  SearchIcon,
  SmartphoneIcon,
  WorkflowIcon,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

import { gsap, MOTION_OK, SplitText, useGSAP } from "@/lib/gsap";
import { whenIdleEach } from "@/lib/idle";
import { scrub } from "@/lib/motion";

/** Card silhouettes (viewBox units). Each discipline gets its own shape. */
const SHAPES = [
  { box: [230, 200], d: "M58 4H172L226 100L172 196H58L4 100Z", w: 1.1 },
  { box: [270, 140], d: "M44 4H266L226 136H4Z", w: 1.3 },
  {
    box: [260, 150],
    d: "M18 4H242a14 14 0 0 1 14 14V59a16 16 0 0 0 0 32V132a14 14 0 0 1-14 14H18a14 14 0 0 1-14-14V91a16 16 0 0 0 0-32V18A14 14 0 0 1 18 4Z",
    w: 1.25,
  },
  {
    box: [200, 200],
    d: "M58 4H142C174 4 196 26 196 58V142C196 174 174 196 142 196H58C26 196 4 174 4 142V58C4 26 26 4 58 4Z",
    w: 0.92,
  },
  { box: [220, 220], d: "M110 4L216 110L110 216L4 110Z", w: 1.05 },
] as const;

const ICONS: Record<string, LucideIcon> = {
  seo: SearchIcon,
  "ai-agents": WorkflowIcon,
  web: AppWindowIcon,
  "mobile-apps": SmartphoneIcon,
  "brand-design": PenToolIcon,
};

/** Scattered positions (fractions of the viewport) and tilt. */
const SCATTER = {
  wide: [
    { x: 0.12, y: 0.22, r: -9 },
    { x: 0.8, y: 0.2, r: 7 },
    { x: 0.2, y: 0.66, r: 6 },
    { x: 0.84, y: 0.62, r: -8 },
    { x: 0.55, y: 0.74, r: 11 },
  ],
  narrow: [
    { x: 0.24, y: 0.2, r: -9 },
    { x: 0.76, y: 0.15, r: 7 },
    { x: 0.22, y: 0.68, r: 6 },
    { x: 0.78, y: 0.62, r: -8 },
    { x: 0.52, y: 0.8, r: 11 },
  ],
};

const isNarrow = () => window.innerWidth < 768;

/** Formation for "Specialists make it right": one straight row (two rows on phones). */
function formation(i: number) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (isNarrow()) {
    const row = i < 3 ? 0 : 1;
    const col = row === 0 ? i - 1 : i - 3.5;
    return { x: col * vw * 0.31, y: vh * (0.2 + row * 0.15), s: 0.82 };
  }
  return { x: (i - 2) * Math.min(vw * 0.175, 300), y: vh * 0.24, s: 1 };
}

function scatter(i: number) {
  const p = (isNarrow() ? SCATTER.narrow : SCATTER.wide)[i % 5]!;
  return {
    x: (p.x - 0.5) * window.innerWidth,
    y: (p.y - 0.5) * window.innerHeight,
    r: p.r,
  };
}

/** Grab a card and throw it; it springs back to its place. Mouse and pen only. */
function makeDraggable(el: HTMLElement) {
  let startX = 0;
  let startY = 0;
  let dragging = false;
  const toX = gsap.quickTo(el, "x", { duration: 0.25, ease: "power3.out" });
  const toY = gsap.quickTo(el, "y", { duration: 0.25, ease: "power3.out" });
  const down = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    dragging = true;
    el.setPointerCapture(event.pointerId);
    startX = event.clientX - Number(gsap.getProperty(el, "x"));
    startY = event.clientY - Number(gsap.getProperty(el, "y"));
    el.dataset.dragging = "";
    gsap.to(el, { scale: 1.08, rotation: -4, duration: 0.3, ease: "power3.out" });
  };
  const move = (event: PointerEvent) => {
    if (!dragging) return;
    toX(event.clientX - startX);
    toY(event.clientY - startY);
  };
  const up = () => {
    if (!dragging) return;
    dragging = false;
    delete el.dataset.dragging;
    gsap.to(el, { x: 0, y: 0, scale: 1, rotation: 0, duration: 1.2, ease: "elastic.out(1, 0.42)" });
  };
  el.addEventListener("pointerdown", down);
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerup", up);
  el.addEventListener("pointercancel", up);
  return () => {
    el.removeEventListener("pointerdown", down);
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerup", up);
    el.removeEventListener("pointercancel", up);
  };
}

/**
 * Dawn: the panel that slides over the night hero. A pinned anime sky (CSS sticky,
 * native scroll) where the three manifesto lines play out:
 *   "AI makes us fast."          → wind and speed streaks, the cards race left
 *   "Specialists make it right." → the five discipline cards snap into formation
 *   "You get both."              → formation and speed together, then a diagonal
 *                                  wipe in the team colour hands over to the five.
 * Transform/opacity only. Cards can be grabbed and thrown (mouse/pen).
 */
export function SkyStage({
  phrases,
  cards,
  wipe,
}: {
  phrases: string[];
  cards: { slug: string; label: string }[];
  /** Colour the stage wipes to (the team section background). */
  wipe: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const cardEls = q<HTMLElement>("[data-card]");
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const contexts: gsap.Context[] = [];
        const cancel = whenIdleEach([
          () =>
            contexts.push(
              gsap.context(() => {
                const phraseEls = q<HTMLElement>("[data-phrase]");
                // Phones: whole lines move (letter-by-letter is too much work per frame
                // on a slow CPU) and the speed streaks stay off.
                const light = isNarrow();
                const parts = phraseEls.map((p) => {
                  const text = p.querySelector<HTMLElement>("[data-phrase-text]")!;
                  return light ? [text] : SplitText.create(text, { type: "chars" }).chars;
                });
                const tl = gsap.timeline({
                  defaults: { ease: "none" },
                  scrollTrigger: {
                    trigger: q("[data-track]")[0],
                    start: "top top",
                    end: "bottom bottom",
                    scrub,
                    invalidateOnRefresh: true,
                  },
                });

                // Wind: cloud layers drift at their depth for the whole stage.
                tl.to(q("[data-layer='mid']"), { xPercent: -7, duration: 3 }, 0)
                  .to(q("[data-layer='front']"), { xPercent: -12, yPercent: 12, duration: 3 }, 0)
                  .to(q("[data-layer='pole']"), { xPercent: -4, duration: 3 }, 0);

                // Phrase swaps, character by character.
                phraseEls.forEach((phrase, i) => {
                  const chars = parts[i]!;
                  if (i > 0) {
                    tl.set(phrase, { autoAlpha: 1 }, i - 0.08).fromTo(
                      chars,
                      { yPercent: 110, opacity: 0 },
                      { yPercent: 0, opacity: 1, stagger: 0.008, duration: 0.2 },
                      i - 0.05,
                    );
                  }
                  if (i < phraseEls.length - 1) {
                    tl.to(
                      chars,
                      { yPercent: -110, opacity: 0, stagger: 0.008, duration: 0.2 },
                      i + 0.72,
                    ).set(phrase, { autoAlpha: 0 }, i + 0.95);
                  }
                });

                // 1 · fast: streaks race across, cards are pushed by the wind.
                if (!light) {
                  const streaks = q("[data-streaks]");
                  tl.fromTo(
                    streaks,
                    { xPercent: 40, opacity: 0 },
                    { xPercent: -10, opacity: 0.85, duration: 0.45 },
                    0.05,
                  )
                    .to(streaks, { xPercent: -45, opacity: 0, duration: 0.4 }, 0.5)
                    .fromTo(
                      streaks,
                      { xPercent: 40, opacity: 0 },
                      { xPercent: -10, opacity: 0.85, duration: 0.45, immediateRender: false },
                      2.05,
                    )
                    .to(streaks, { xPercent: -45, opacity: 0, duration: 0.45 }, 2.5);
                }

                cardEls.forEach((card, i) => {
                  tl.fromTo(
                    card,
                    {
                      x: () => scatter(i).x,
                      y: () => scatter(i).y,
                      rotation: () => scatter(i).r,
                      scale: 1,
                    },
                    {
                      x: () => scatter(i).x - window.innerWidth * 0.06,
                      y: () => scatter(i).y + (i % 2 ? -1 : 1) * window.innerHeight * 0.03,
                      rotation: () => scatter(i).r * 1.6,
                      duration: 0.9,
                    },
                    0,
                  )
                    // 2 · right: into formation.
                    .to(
                      card,
                      {
                        x: () => formation(i).x,
                        y: () => formation(i).y,
                        rotation: 0,
                        scale: () => formation(i).s,
                        duration: 0.7,
                        ease: "power3.inOut",
                      },
                      1.05 + i * 0.04,
                    )
                    // 3 · both: the formation lifts and races, still in line.
                    .to(
                      card,
                      {
                        x: () => formation(i).x - window.innerWidth * 0.04,
                        y: () => formation(i).y - window.innerHeight * 0.06,
                        duration: 0.9,
                      },
                      2.05,
                    );
                });

                // Hand-over: a diagonal wipe in the team colour.
                tl.set(q("[data-wipe]"), { autoAlpha: 1 }, 3.04)
                  .fromTo(
                    q("[data-wipe]"),
                    { yPercent: 105 },
                    { yPercent: 0, duration: 0.55 },
                    3.05,
                  )
                  .to(phraseEls.at(-1) ?? [], { yPercent: -30, duration: 0.55 }, 3.05);
              }),
            ),
          () => {
            const off = cardEls.map((card) =>
              makeDraggable(card.querySelector<HTMLElement>("[data-card-grab]")!),
            );
            contexts.push(gsap.context(() => () => off.forEach((fn) => fn())));
          },
        ]);
        return () => {
          cancel();
          contexts.forEach((context) => context.revert());
        };
      });

      // Reduced motion: no pin, no movement — cards rest in formation, lines fade in.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        cardEls.forEach((card, i) => {
          const f = formation(i);
          gsap.set(card, { x: f.x, y: f.y * 0.4, rotation: 0, scale: f.s });
        });
        for (const phrase of q<HTMLElement>("[data-phrase]")) {
          gsap.from(phrase, {
            opacity: 0,
            duration: 1.2,
            scrollTrigger: { trigger: phrase, start: "top 85%", once: true },
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
      data-theme="dawn"
      className="relative z-10 -mb-[60svh] overflow-x-clip motion-reduce:mb-0"
    >
      {/* Slanted leading edge: a small cap above the panel (a clip-path on the whole
          4,000px panel would make the browser mask one giant layer). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-[7vw] h-[calc(7vw+1px)] bg-[#1e2f66] [clip-path:polygon(0_100%,100%_0,100%_100%)]"
      />
      <div data-track className="relative h-[420svh] motion-reduce:h-auto">
        {/* Once the wipe has covered the stage, the nav already belongs to the team. */}
        <div
          aria-hidden
          data-theme="mono"
          className="absolute inset-x-0 bottom-0 h-[118svh] motion-reduce:hidden"
        />
        <div className="sticky top-0 h-svh min-h-[560px] overflow-hidden [--u:clamp(92px,11vw,190px)] motion-reduce:relative motion-reduce:h-auto motion-reduce:min-h-svh motion-reduce:py-[16svh]">
          {/* Sky, far clouds and hills: one opaque bitmap (they barely move). */}
          <div aria-hidden className="absolute inset-0">
            <Image src="/art/dawn-sky.webp" alt="" fill sizes="100vw" className="object-cover" />
          </div>
          <Layer name="mid" src="/art/dawn-clouds-mid.webp" />
          <Layer name="pole" src="/art/dawn-pole.webp" />
          <div
            aria-hidden
            data-streaks
            className="pointer-events-none absolute -inset-x-1/4 inset-y-0 opacity-0"
          >
            <Image src="/art/streaks.webp" alt="" fill className="object-fill" />
          </div>

          {/* The five discipline cards, between the cloud layers. */}
          <div
            aria-hidden
            className="absolute inset-0 motion-reduce:relative motion-reduce:h-[40svh]"
          >
            {cards.map((card, i) => {
              const shape = SHAPES[i % SHAPES.length]!;
              const Icon = ICONS[card.slug] ?? SearchIcon;
              const [bw, bh] = shape.box;
              const p = SCATTER.wide[i % 5]!;
              return (
                <div
                  key={card.slug}
                  data-card
                  className="absolute top-1/2 left-1/2 will-change-transform"
                  style={{
                    width: `calc(var(--u) * ${shape.w})`,
                    aspectRatio: `${bw} / ${bh}`,
                    translate: "-50% -50%",
                    transform: `translate(${(p.x - 0.5) * 100}vw, ${(p.y - 0.5) * 100}vh) rotate(${p.r}deg)`,
                  }}
                >
                  <div
                    data-card-grab
                    className="group relative size-full cursor-grab select-none data-dragging:cursor-grabbing"
                  >
                    <div className="relative size-full transition-transform duration-300 ease-out-expo group-hover:-translate-y-1.5">
                      <svg
                        viewBox={`0 0 ${bw} ${bh}`}
                        className="absolute inset-0 size-full overflow-visible"
                      >
                        <path d={shape.d} transform="translate(9 11)" fill="rgb(23 37 90 / 0.3)" />
                        <path
                          d={shape.d}
                          fill="#f8f9fc"
                          stroke="#17255a"
                          strokeWidth={3.5}
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="relative flex size-full flex-col items-center justify-center gap-[0.35em] text-[clamp(11px,1.05vw,16px)] text-dawn-950">
                        <Icon aria-hidden className="size-[1.9em]" strokeWidth={2.1} />
                        <span className="type-ui whitespace-nowrap">{card.label}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Layer name="front" src="/art/dawn-clouds-front.webp" />

          {/* The manifesto lines. */}
          {phrases.map((phrase, i) => (
            <div
              key={phrase}
              data-phrase
              className={`pointer-events-none absolute inset-x-0 top-[38%] -translate-y-1/2 px-4 text-center motion-reduce:visible motion-reduce:static motion-reduce:mb-[6svh] motion-reduce:translate-y-0 motion-reduce:opacity-100 ${i === 0 ? "" : "invisible opacity-0"}`}
            >
              <p
                data-phrase-text
                className="type-display text-[clamp(3rem,8.4vw,8.5rem)] leading-[0.86] text-balance text-dawn-950"
              >
                {phrase}
              </p>
            </div>
          ))}

          {/* Hand-over wipe: a slanted panel in the team colour. */}
          <div
            aria-hidden
            data-wipe
            className="invisible absolute -inset-x-2 -top-[8vw] -bottom-2 [clip-path:polygon(0_8vw,100%_0,100%_100%,0_100%)] motion-reduce:hidden"
            style={{ background: wipe }}
          />
        </div>
      </div>
    </div>
  );
}

const LAYER_BOX: Record<string, string> = {
  mid: "-inset-x-[8%] inset-y-0",
  front: "-inset-x-[8%] top-[12%] -bottom-[12%]",
  // Phones: keep the pole at the right edge instead of mid-screen.
  pole: "inset-y-0 -right-[22%] aspect-[16/10] md:-inset-x-[8%] md:aspect-auto",
};

function Layer({ name, src }: { name: string; src: string }) {
  return (
    <div
      aria-hidden
      data-layer={name}
      className={`pointer-events-none absolute ${LAYER_BOX[name]}`}
    >
      <Image src={src} alt="" fill sizes="116vw" className="object-cover object-right" />
    </div>
  );
}
