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

          // The blade sweeps in from the left, as if the swoosh carried on from the hero,
          // then drifts slowly for the rest of the stage.
          tl.fromTo(
            q("[data-blade]"),
            { xPercent: -42, scaleX: 0.7, opacity: 0 },
            { xPercent: 0, scaleX: 1, opacity: 1, duration: 0.8, ease: "power2.out" },
            0,
          ).to(q("[data-blade]"), { xPercent: 7, yPercent: -4, duration: 2.2 }, 0.8);

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

          // The star arrives with the last line and drops away towards the five.
          tl.fromTo(
            q("[data-star]"),
            { opacity: 0, y: -40, scale: 0.4 },
            { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power2.out" },
            2.05,
          ).to(q("[data-star]"), { y: () => window.innerHeight * 0.42, duration: 0.7 }, 2.4);

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
    <div ref={root} data-cover data-theme="mono" className="relative z-10 mt-[7vw]">
      {/* Slanted leading edge: a small cap above the panel (cheaper than clipping the
          whole panel), in the stage's own dark. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-[7vw] h-[calc(7vw+1px)] bg-studio-950 [clip-path:polygon(0_100%,100%_0,100%_100%)]"
      />
      {/* Signature A, part 1: the orbit continues across the boundary. */}
      <OrbitArc
        variant="edge"
        className="pointer-events-none absolute -top-[11vw] right-[4%] z-10 w-[min(70vw,980px)]"
      />

      <div data-track className="relative md:motion-safe:h-[220svh]">
        <div className="relative overflow-hidden md:motion-safe:sticky md:motion-safe:top-0 md:motion-safe:h-svh md:motion-safe:min-h-[600px]">
          {/* Dark stage: the swoosh from the logo sweeps across it like a blade, and
              the light it leaves behind is the only colour (Mustafa 2026-10-29). */}
          <div aria-hidden className="absolute inset-0 bg-studio-950">
            <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_42%,rgb(31_123_255/0.16),transparent_62%)]" />
            <div data-blade className="absolute inset-[-18%] origin-left will-change-transform">
              <Image
                src="/brand/part-swoosh.png"
                alt=""
                fill
                sizes="128vw"
                className="scale-[1.45] object-contain opacity-90"
              />
            </div>
            {/* The star the blue stroke became; it drops to the line under "The Five". */}
            <div
              data-star
              className="absolute top-[34%] left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-star opacity-0 shadow-[0_0_14px_6px_rgb(140_200_255/0.55),0_0_42px_18px_rgb(31_123_255/0.35)] will-change-transform"
            />
          </div>

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
                    // Solid, not a gradient: splitting the line into letters leaves a gradient with
                    // no text of its own to paint (fixed 2026-10-29).
                    className="mx-auto max-w-[16ch] type-serif text-[clamp(2.75rem,6.6vw,7rem)] leading-[1] text-balance text-star"
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
                          className="flex items-center gap-2 rounded-full border border-white/12 bg-white/8 py-2.5 pr-5 pl-3.5 type-ui text-[15px] text-grey-300 shadow-[0_12px_28px_-14px_rgb(0_0_0/0.8)] backdrop-saturate-150 md:motion-safe:absolute md:motion-safe:top-1/2 md:motion-safe:left-1/2 md:motion-safe:[translate:-50%_-50%] md:motion-safe:[transform:translate(var(--sx),var(--sy))_rotate(var(--sr))]"
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
                            className="size-[18px] text-action-300"
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
