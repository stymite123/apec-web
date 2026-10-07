"use client";

import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

import { DitherPortrait } from "@/components/team/DitherPortrait";
import type { Accent } from "@/content/schema";
import { accentStyles, pad } from "@/lib/accent";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export type ShowcaseMember = {
  slug: string;
  order: number;
  name: string;
  callName: string;
  role: string;
  accent: Accent;
  portrait?: string;
  skills: string[];
};

type TeamShowcaseProps = {
  members: ShowcaseMember[];
  eyebrow: string;
  title: string;
  intro?: string;
  viewProfile: string;
};

const setResolve = (el: Element | null, value: number) =>
  (el as HTMLElement | null)?.style.setProperty("--resolve", value.toFixed(3));

/**
 * The Five (brief §8.1 #5, reel-01 direction).
 * Desktop: pinned horizontal scroll, one full-screen slide per member; each
 * portrait resolves from dither to photo as its slide arrives.
 * Phones: vertical slides that resolve on scroll. Reduced motion: no pin, photos shown.
 * Slides stay in DOM order; focusing a link scrolls its slide into view.
 */
export function TeamShowcase({ members, eyebrow, title, intro, viewProfile }: TeamShowcaseProps) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const total = pad(members.length);

  useGSAP(
    () => {
      const section = root.current;
      const list = track.current;
      if (!section || !list) return;
      const slides = gsap.utils.toArray<HTMLElement>("[data-slide]", list);
      const portraits = slides.map((slide) => slide.querySelector(".dither-portrait"));
      const mm = gsap.matchMedia();

      // Desktop: pinned horizontal track.
      mm.add(`${MOTION_OK} and (min-width: 768px)`, () => {
        portraits.forEach((p) => setResolve(p, 0));
        const distance = () => list.scrollWidth - window.innerWidth;
        const horizontal = gsap.to(list, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: list,
            pin: true,
            scrub: 0.8,
            start: "top top",
            end: () => `+=${distance()}`,
            invalidateOnRefresh: true,
          },
        });

        // First portrait resolves as the section arrives; the rest as their slide slides in.
        ScrollTrigger.create({
          trigger: list,
          start: "top 85%",
          end: "top top",
          scrub: true,
          onUpdate: (self) => setResolve(portraits[0] ?? null, self.progress),
        });
        slides.slice(1).forEach((slide, index) => {
          ScrollTrigger.create({
            trigger: slide,
            containerAnimation: horizontal,
            start: "left 95%",
            end: "left 25%",
            scrub: true,
            onUpdate: (self) => setResolve(portraits[index + 1] ?? null, self.progress),
          });
        });

        // Parallax: giant names drift slower than the track.
        slides.forEach((slide) => {
          gsap.fromTo(
            slide.querySelector("[data-slide-name]"),
            { xPercent: 18 },
            {
              xPercent: -18,
              ease: "none",
              scrollTrigger: {
                trigger: slide,
                containerAnimation: horizontal,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
        });

        // Keyboard: focusing a link in an off-screen slide scrolls to that slide.
        const st = horizontal.scrollTrigger;
        const onFocus = (event: FocusEvent) => {
          const slide = (event.target as HTMLElement).closest<HTMLElement>("[data-slide]");
          if (!slide || !st) return;
          const index = slides.indexOf(slide);
          const y = st.start + (st.end - st.start) * (index / Math.max(1, slides.length - 1));
          window.scrollTo({ top: y, behavior: "instant" });
        };
        list.addEventListener("focusin", onFocus);
        return () => list.removeEventListener("focusin", onFocus);
      });

      // Phones: vertical slides resolve on scroll.
      mm.add(`${MOTION_OK} and (max-width: 767px)`, () => {
        slides.forEach((slide, index) => {
          setResolve(portraits[index] ?? null, 0);
          ScrollTrigger.create({
            trigger: slide,
            start: "top 85%",
            end: "top 25%",
            scrub: true,
            onUpdate: (self) => setResolve(portraits[index] ?? null, self.progress),
          });
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="team" aria-labelledby="team-title" className="relative bg-void">
      <div className="container-site flex flex-col gap-6 pt-28 pb-12 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label-mono text-steel-400">{eyebrow}</p>
          <h2
            id="team-title"
            className="mt-4 font-display text-h2 font-medium tracking-[-0.02em] text-silver-100"
          >
            {title}
          </h2>
        </div>
        {intro && <p className="max-w-sm text-steel-300">{intro}</p>}
      </div>

      <ol ref={track} className="flex flex-col md:h-svh md:w-max md:flex-row">
        {members.map((member, index) => (
          <li
            key={member.slug}
            data-slide
            className="relative flex min-h-svh w-full items-center overflow-hidden border-t border-steel-800 md:h-svh md:w-screen md:border-t-0 md:border-l"
          >
            {/* Giant call-name behind the portrait (meshwork "VANTA" move). */}
            <p
              data-slide-name
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-display text-[22vw] leading-none font-bold tracking-[-0.045em] whitespace-nowrap text-navy-800 uppercase select-none md:text-[19vw]"
            >
              {member.callName}
            </p>

            <div className="relative container-site grid w-full gap-8 py-20 md:grid-cols-12 md:items-center md:py-0">
              <div className="flex flex-col gap-3 md:col-span-3 md:self-start md:pt-28">
                <p className="label-mono text-steel-400">
                  {pad(member.order)} / {total}
                </p>
                <span aria-hidden className={cn("h-px w-16", accentStyles[member.accent].line)} />
              </div>

              <div className="relative mx-auto w-[min(78vw,26rem)] md:col-span-5 md:w-full md:max-w-[30rem]">
                {member.portrait && (
                  <DitherPortrait
                    src={member.portrait}
                    sizes="(min-width: 768px) 32vw, 78vw"
                    priority={index === 0}
                  />
                )}
              </div>

              <div className="flex flex-col gap-4 md:col-span-4 md:self-end md:pb-28 md:pl-8">
                <h3 className="font-display text-[clamp(2rem,3.4vw,3.25rem)] leading-none font-medium tracking-[-0.02em] text-silver-100">
                  {member.name}
                </h3>
                <p className="label-mono text-steel-300">{member.role}</p>
                {member.skills.length > 0 && (
                  <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-steel-400">
                    {member.skills.slice(0, 3).map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                )}
                <Link
                  href={`/team/${member.slug}`}
                  className="group mt-2 inline-flex w-fit items-center gap-2 border-b border-steel-600 pb-1 text-silver-100 transition-colors hover:border-silver-100"
                >
                  {viewProfile.replace("{name}", member.callName)}
                  <ArrowUpRightIcon
                    aria-hidden
                    className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
