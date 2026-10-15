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
import { useEffect, useRef, type CSSProperties } from "react";

import { OrbitArc } from "@/components/motion/OrbitArc";
import { gsap, MOTION_OK, SplitText, useGSAP } from "@/lib/gsap";
import { whenIdle } from "@/lib/idle";
import { scrub } from "@/lib/motion";

const ICONS: Record<string, LucideIcon> = {
  seo: SearchIcon,
  "ai-agents": WorkflowIcon,
  web: AppWindowIcon,
  "mobile-apps": SmartphoneIcon,
  "brand-design": PenToolIcon,
};

/** Desktop only: where each label drifts while "AI makes us fast." is read (vw / vh / deg). */
const SCATTER = [
  { x: -30, y: -20, r: -7 },
  { x: 29, y: -23, r: 6 },
  { x: -25, y: 23, r: 5 },
  { x: 31, y: 19, r: -6 },
  { x: 4, y: 31, r: 4 },
];

/** The pinned (desktop, motion) layout. Everything else reads as a normal column. */
const PINNED = `${MOTION_OK} and (min-width: 768px)`;

/**
 * Dawn (manifesto). Field's words on Climb's sky: the three Newsreader statements over
 * a restrained dawn scene, with the five discipline labels as one consistent family.
 *   "AI makes us fast."          → the labels and clouds drift laterally (pace)
 *   "Specialists make it right." → the labels settle into one row under the line
 *   "You get both."              → the row holds; the orbit arc underlines the line
 * Desktop: a compact pin (≈2 viewport heights including the stage), CSS sticky on
 * native scroll. Phones and reduced motion: no pin, the statements simply arrive.
 * The orbit arc (signature A) continues the logo's orbit across the panel's edge.
 */
export function SkyStage({
  phrases,
  cards,
}: {
  phrases: string[];
  cards: { slug: string; label: string }[];
}) {
  const root = useRef<HTMLDivElement>(null);

  // Phones / reduced motion: each block fades in once as it arrives (no scroll math).
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia(PINNED).matches) return;
    const items = el.querySelectorAll<HTMLElement>("[data-arrive]");
    el.setAttribute("data-arrive-ready", "");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-arrived", "");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    items.forEach((item) => observer.observe(item));
    return () => {
      observer.disconnect();
      el.removeAttribute("data-arrive-ready");
    };
  }, []);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      // Signature A, part 1: as the panel rises over the hero, the arc draws across
      // its edge in the direction of the logo's orbit. Cheap: one small SVG path.
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          q("[data-arc='edge'] path"),
          { strokeDashoffset: 1 },
          {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "top 25%", scrub },
          },
        );
      });

      mm.add(PINNED, () => {
        let split: SplitText[] = [];
        const cancel = whenIdle(() => {
          const phraseEls = q<HTMLElement>("[data-phrase]");
          const chips = q<HTMLElement>("[data-chip]");
          split = phraseEls.map((p) =>
            SplitText.create(p.querySelector("[data-phrase-text]"), {
              type: "words,chars",
              charsClass: "will-change-transform",
            }),
          );
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

          // Background pace: the cloud layers drift across the whole stage.
          tl.to(q("[data-layer='mid']"), { xPercent: -6, duration: 3 }, 0).to(
            q("[data-layer='front']"),
            { xPercent: -10, yPercent: 8, duration: 3 },
            0,
          );

          // Statement swaps, letter by letter.
          phraseEls.forEach((phrase, i) => {
            const chars = split[i]!.chars;
            if (i > 0) {
              tl.set(phrase, { autoAlpha: 1 }, i - 0.06).fromTo(
                chars,
                { yPercent: 100, opacity: 0 },
                { yPercent: 0, opacity: 1, stagger: 0.008, duration: 0.22 },
                i - 0.04,
              );
            }
            if (i < phraseEls.length - 1) {
              tl.to(
                chars,
                { yPercent: -100, opacity: 0, stagger: 0.008, duration: 0.2 },
                i + 0.7,
              ).set(phrase, { autoAlpha: 0 }, i + 0.94);
            }
          });

          // 1 · fast: labels pushed sideways by the pace (controlled, readable).
          chips.forEach((chip, i) => {
            const s = SCATTER[i % SCATTER.length]!;
            const vw = () => window.innerWidth / 100;
            const vh = () => window.innerHeight / 100;
            const rowX = () => (i - 2) * Math.min(window.innerWidth * 0.16, 230);
            tl.fromTo(
              chip,
              { x: () => s.x * vw(), y: () => s.y * vh(), rotation: s.r },
              {
                x: () => (s.x - 7) * vw(),
                y: () => s.y * vh() + (i % 2 ? -1.5 : 1.5) * vh(),
                rotation: s.r * 1.3,
                duration: 0.95,
              },
              0,
            )
              // 2 · right: into one row under the statement.
              .to(
                chip,
                {
                  x: rowX,
                  y: () => 16 * vh(),
                  rotation: 0,
                  duration: 0.6,
                  ease: "power3.inOut",
                },
                1.05 + i * 0.05,
              )
              // 3 · both: the row settles a touch higher and holds.
              .to(chip, { y: () => 14 * vh(), duration: 0.4, ease: "power2.out" }, 2.1);
          });

          // Signature A, part 2: the arc underlines the resolution.
          tl.fromTo(
            q("[data-arc='under'] path"),
            { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 0.45, ease: "power1.inOut" },
            2.2,
          ).to({}, { duration: 0.35 }, 2.65);
        });
        return () => {
          cancel();
          split.forEach((s) => s.revert());
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    // mt = the slanted cap height, so the cap starts exactly at the hero's bottom edge
    // and nothing of the next panel shows at rest.
    <div ref={root} data-cover data-theme="dawn" className="relative z-10 mt-[7vw]">
      {/* Slanted leading edge: a small cap above the panel (cheaper than clipping the
          whole panel). Its colour matches the pale wash at the top of the sky. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-[7vw] h-[calc(7vw+1px)] bg-dawn-300 [clip-path:polygon(0_100%,100%_0,100%_100%)]"
      />
      {/* Signature A, part 1: the orbit continues across the boundary. */}
      <OrbitArc
        variant="edge"
        className="pointer-events-none absolute -top-[11vw] right-[4%] z-10 w-[min(70vw,980px)]"
      />

      <div data-track className="relative md:motion-safe:h-[220svh]">
        <div className="relative overflow-hidden md:motion-safe:sticky md:motion-safe:top-0 md:motion-safe:h-svh md:motion-safe:min-h-[600px]">
          {/* Sky with a pale wash over its top band: muted sky blue, cool clouds. */}
          <div aria-hidden className="absolute inset-0">
            <Image src="/art/dawn-sky.webp" alt="" fill sizes="100vw" className="object-cover" />
            <div className="absolute inset-x-0 top-0 h-[55%] bg-linear-to-b from-dawn-300 via-dawn-300/70 to-transparent" />
          </div>
          <Layer name="mid" src="/art/dawn-clouds-mid.webp" />
          <Layer name="front" src="/art/dawn-clouds-front.webp" />

          <div className="relative px-5 py-[18svh] md:motion-safe:absolute md:motion-safe:inset-0 md:motion-safe:p-0">
            {phrases.map((phrase, i) => (
              <div key={phrase} className="contents">
                <div
                  data-phrase
                  data-arrive
                  className={`arrive relative text-center md:motion-safe:absolute md:motion-safe:inset-x-0 md:motion-safe:top-[36%] md:motion-safe:-translate-y-1/2 ${
                    i === 0 ? "" : "md:motion-safe:invisible md:motion-safe:opacity-0"
                  } ${i > 0 ? "mt-[16svh] md:motion-safe:mt-0" : ""}`}
                >
                  <p
                    data-phrase-text
                    className="mx-auto max-w-[16ch] type-serif text-[clamp(2.75rem,6.6vw,7rem)] leading-[1] text-balance text-dawn-950"
                  >
                    {phrase}
                  </p>
                  {i === phrases.length - 1 && (
                    <OrbitArc
                      variant="under"
                      className="mx-auto mt-1 w-[min(78vw,560px)] md:motion-safe:mt-2"
                    />
                  )}
                </div>

                {/* The five labels sit after the second statement in the reading order. */}
                {i === 1 && (
                  <ul
                    aria-label="Our disciplines"
                    data-arrive
                    className="arrive mx-auto mt-8 flex max-w-xl flex-wrap justify-center gap-2.5 md:motion-safe:pointer-events-none md:motion-safe:absolute md:motion-safe:inset-0 md:motion-safe:m-0 md:motion-safe:block md:motion-safe:max-w-none"
                  >
                    {cards.map((card, n) => {
                      const Icon = ICONS[card.slug] ?? SearchIcon;
                      const s = SCATTER[n % SCATTER.length]!;
                      return (
                        <li
                          key={card.slug}
                          data-chip
                          className="flex items-center gap-2 rounded-full border border-dawn-950/10 bg-white/90 py-2.5 pr-5 pl-3.5 type-ui text-[15px] text-dawn-950 shadow-[0_12px_28px_-14px_rgb(23_37_90/0.55)] md:motion-safe:absolute md:motion-safe:top-1/2 md:motion-safe:left-1/2 md:motion-safe:[translate:-50%_-50%] md:motion-safe:[transform:translate(var(--sx),var(--sy))_rotate(var(--sr))]"
                          style={
                            {
                              "--sx": `${s.x}vw`,
                              "--sy": `${s.y}vh`,
                              "--sr": `${s.r}deg`,
                            } as CSSProperties
                          }
                        >
                          <Icon
                            aria-hidden
                            className="size-[18px] text-action-600"
                            strokeWidth={2.1}
                          />
                          {card.label}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const LAYER_BOX: Record<string, string> = {
  mid: "-inset-x-[8%] inset-y-0",
  front: "-inset-x-[8%] top-[18%] -bottom-[12%]",
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
