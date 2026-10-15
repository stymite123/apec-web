"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Client half of the team section.
 * - Formation entrance (signature B): holds the cards and the heading's orbit line in
 *   their pending state until the row comes into view, then flips once to "done"
 *   (globals.css: centre-out rise + dither → photo crossfade). Never replays.
 * - Phones: the row is a native swipe row; small previous/next buttons and a position
 *   indicator scroll it by one card. Touch scrolling is never intercepted.
 * Without JS nothing is held back and the row simply scrolls.
 */
export function TeamReveal({
  heading,
  count,
  labels,
  children,
}: {
  heading: ReactNode;
  count: number;
  labels: { previous: string; next: string };
  children: ReactNode;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLOListElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = wrap.current;
    const list = row.current;
    if (!el || !list) return;
    el.dataset.teamReveal = "pending";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        el.dataset.teamReveal = "done";
      },
      { rootMargin: "0px 0px -18% 0px" },
    );
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  // Which card is at the start of the swipe row (phones only; cheap: one read per frame).
  useEffect(() => {
    const list = row.current;
    if (!list) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      const first = list.children[0] as HTMLElement | undefined;
      if (!first) return;
      const step = first.offsetWidth + parseFloat(getComputedStyle(list).columnGap || "0");
      setIndex(Math.max(0, Math.min(count - 1, Math.round(list.scrollLeft / step))));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    list.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      list.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [count]);

  const go = (to: number) => {
    const list = row.current;
    const card = list?.children[Math.max(0, Math.min(count - 1, to))] as HTMLElement | undefined;
    if (!list || !card) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollTo({
      left: card.offsetLeft - list.offsetLeft - parseFloat(getComputedStyle(list).paddingLeft),
      behavior: reduce ? "auto" : "smooth",
    });
  };

  return (
    <div ref={wrap}>
      {heading}
      <ol ref={row} className="team-row mt-9 md:mt-12">
        {children}
      </ol>
      <div className="container-site mt-5 flex items-center justify-between md:hidden">
        <p aria-hidden className="type-ui text-[14px] text-grey-400 tabular-nums">
          {index + 1} / {count}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            aria-label={labels.previous}
            className="grid size-11 place-items-center rounded-full border border-white/20 text-white transition-colors duration-200 hover:bg-white/10 disabled:opacity-35"
          >
            <ChevronLeftIcon aria-hidden className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index === count - 1}
            aria-label={labels.next}
            className="grid size-11 place-items-center rounded-full border border-white/20 text-white transition-colors duration-200 hover:bg-white/10 disabled:opacity-35"
          >
            <ChevronRightIcon aria-hidden className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
