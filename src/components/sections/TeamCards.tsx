"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { gsap, MOTION_OK, SplitText, useGSAP } from "@/lib/gsap";
import { whenIdleEach } from "@/lib/idle";
import { scrub } from "@/lib/motion";

export type CardMember = {
  slug: string;
  name: string;
  role: string;
  /** Person cut out at build time (scripts/cutout-portraits.py); falls back to the photo. */
  figure: string;
  /** Dither levels of `figure` (pnpm dither). */
  dither: [string, string, string];
  /** Blurred, darkened backdrop made from the photo at build time (pnpm dither). */
  backdrop: string;
  cutout: boolean;
  /** Moves the person down (% of their height) when the photo frames them higher. */
  figureOffset?: number;
};

/**
 * One card's scroll motion. Arrival: the card slides up natively and its contents settle
 * as it lands (name rises by letter, person settles, dither resolves to photo).
 * Covered by the next card: it shrinks back and dims.
 */
function setUpCard(item: HTMLElement, next: HTMLElement | undefined, first: boolean) {
  const card = item.querySelector<HTMLElement>("[data-card]");
  const name = item.querySelector<HTMLElement>("[data-card-name]");
  const figure = item.querySelector<HTMLElement>("[data-card-figure]");
  const portrait = item.querySelector<HTMLElement>(".dither-portrait");
  if (!card || !name || !figure || !portrait) return;
  const split = SplitText.create(name, { type: "chars", charsClass: "text-grad" });
  // The letters paint the gradient now; the word spans must not (ghost copy).
  const words = [...name.children];
  words.forEach((word) => word.classList.add("text-grad-split"));

  gsap
    .timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: item,
        start: first ? "top 90%" : "top bottom",
        end: "top top",
        scrub,
      },
    })
    .fromTo(
      split.chars,
      { yPercent: 55, opacity: 0 },
      { yPercent: 0, opacity: 1, stagger: 0.04, duration: 0.5 },
      0.3,
    )
    .fromTo(figure, { yPercent: 10, scale: 1.06 }, { yPercent: 0, scale: 1, duration: 1 }, 0)
    .fromTo(portrait, { "--resolve": 0 }, { "--resolve": 1, duration: 0.75 }, 0.25);

  if (next) {
    gsap
      .timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: next, start: "top bottom", end: "top top", scrub },
      })
      .to(card, { scale: 0.92, yPercent: -2 }, 0)
      .to(item.querySelector("[data-card-dim]"), { opacity: 0.7 }, 0);
  }

  // Runs on context revert, after the split is undone.
  return () => words.forEach((word) => word.classList.remove("text-grad-split"));
}

/**
 * The five as stacked full-screen cards (GSAP Field "characters" panels): caption on
 * top, giant serif name, the person standing in front of it, pill + mono line below.
 * Cards are CSS-sticky (native scroll); each new card slides over the last, which
 * shrinks back and dims. On arrival the name rises in by character and the
 * portrait resolves from dither to photo. Transform/opacity only.
 */
export function TeamCards({
  members,
  title,
  caption,
  viewProfile,
}: {
  members: CardMember[];
  title: string;
  caption: string;
  viewProfile: string;
}) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      const items = gsap.utils.toArray<HTMLElement>("[data-card-item]", el);

      mm.add(MOTION_OK, () => {
        // Below the fold: one card per idle slice, so no setup step becomes a long task.
        const contexts: gsap.Context[] = [];
        const cancel = whenIdleEach(
          items.map((item, i) => () => {
            contexts.push(gsap.context(() => setUpCard(item, items[i + 1], i === 0)));
          }),
        );
        return () => {
          cancel();
          contexts.forEach((context) => context.revert());
        };
      });

      // Reduced motion: no movement; portraits dissolve once when in view.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        for (const portrait of el.querySelectorAll<HTMLElement>(".dither-portrait")) {
          gsap.set(portrait, { "--resolve": 0 });
          gsap.to(portrait, {
            "--resolve": 1,
            duration: 1.6,
            ease: "none",
            scrollTrigger: { trigger: portrait, start: "top 75%", once: true },
          });
        }
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="team" aria-labelledby="team-title" className="relative bg-void">
      <h2 id="team-title" className="sr-only">
        {title}
      </h2>
      <ol>
        {members.map((member, i) => (
          <li
            key={member.slug}
            data-card-item
            className="sticky top-0 h-svh min-h-[560px] px-3 pt-[calc(var(--nav-height)-0.5rem)] pb-3 md:px-6 md:pb-6"
            style={{ zIndex: i + 1 }}
          >
            <article
              data-card
              aria-labelledby={`card-${member.slug}`}
              className="relative isolate h-full overflow-hidden rounded-[10px] bg-grey-900 will-change-transform"
            >
              {/* Backdrop: the photo, blurred and darkened at build time. */}
              <Image
                src={member.backdrop}
                alt=""
                fill
                unoptimized
                sizes="100vw"
                className="-z-20 object-cover opacity-90"
              />
              <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-[radial-gradient(50%_45%_at_0%_100%,rgb(150_32_62/0.45),transparent),radial-gradient(40%_35%_at_100%_0%,rgb(150_32_62/0.22),transparent),radial-gradient(90%_75%_at_50%_70%,rgb(58_15_27/0.3),rgb(5_6_10/0.88)_80%)]"
              />

              {/* Caption (reference "FIELD CHARACTERS 01 / 03"). */}
              <p className="absolute inset-x-0 top-[7%] z-30 text-center label-mono text-[11px] text-grey-400">
                {caption}
                <br />
                <span className="text-rose-300">
                  {String(i + 1).padStart(2, "0")} / {String(members.length).padStart(2, "0")}
                </span>
              </p>

              {/* Giant full name behind the person: one line on desktop, first/last on phones. */}
              <h3
                id={`card-${member.slug}`}
                className="absolute inset-x-0 top-[24%] z-10 text-center font-field text-[17vw] leading-[0.85] tracking-[-0.04em] [--g-from:#ffffff] [--g-to:#e88aa1] [font-variation-settings:'opsz'_72] md:top-[19%] md:text-[8.4vw]"
              >
                <span className="sr-only">{member.name}</span>
                <span aria-hidden data-card-name className="inline-block">
                  {member.name.split(" ").map((part, index) => (
                    // Word gap as margin: the per-letter split drops space-only text.
                    <span
                      key={index}
                      className={
                        index > 0
                          ? "text-grad block md:ml-[0.28em] md:inline-block"
                          : "text-grad block md:inline-block"
                      }
                    >
                      {part}
                    </span>
                  ))}
                </span>
              </h3>

              {/* The person, standing in front of the name. */}
              <div
                data-card-figure
                className="absolute bottom-0 left-1/2 z-20 aspect-[4/5] h-[78%] -translate-x-1/2 md:h-[93%]"
              >
                <div
                  className="dither-portrait absolute inset-0"
                  style={
                    member.cutout
                      ? { translate: `0 ${member.figureOffset ?? 0}%` }
                      : {
                          translate: `0 ${member.figureOffset ?? 0}%`,
                          maskImage:
                            "radial-gradient(70% 80% at 50% 45%, black 55%, transparent 100%)",
                        }
                  }
                >
                  <Image
                    src={member.figure}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 60vh, 70vw"
                    priority={i === 0}
                    className="dither-photo"
                    style={{ objectFit: "contain", objectPosition: "bottom" }}
                  />
                  {member.dither.map((src, level) => (
                    <Image
                      key={src}
                      src={src}
                      alt=""
                      aria-hidden
                      fill
                      unoptimized
                      data-level={level}
                      className="dither-layer"
                      style={{ objectFit: "contain", objectPosition: "bottom" }}
                    />
                  ))}
                </div>
              </div>

              {/* Pill + mono line over the lower body (reference "MAKE IT FUN"). */}
              <div className="absolute inset-x-0 bottom-[7%] z-30 flex flex-col items-center gap-4 px-4 text-center">
                <Link
                  href={`/team/${member.slug}`}
                  className="group inline-flex h-12 items-center gap-3 rounded-full bg-void/80 py-1.5 pr-5 pl-1.5 label-mono text-[11px] text-rose-300 ring-1 ring-grey-700 transition-colors hover:bg-grey-800"
                >
                  <span
                    aria-hidden
                    className="size-9 rounded-full bg-linear-to-br from-rose-300 via-rose-400 to-rose-600 transition-transform duration-500 ease-out-expo group-hover:scale-90"
                  />
                  {viewProfile.replace("{name}", member.name)}
                </Link>
                <p className="max-w-[46ch] label-mono text-[11px] text-grey-300">{member.role}</p>
              </div>

              <div
                aria-hidden
                data-card-dim
                className="pointer-events-none absolute inset-0 z-40 bg-void opacity-0"
              />
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
