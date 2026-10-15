"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { whenIdle } from "@/lib/idle";
import { cn } from "@/lib/utils";

type NavLink = { label: string; href: string };

const sectionId = (href: string) => href.replace("/#", "");

/**
 * Floating island (Climb) with a stable pill shape: only its surface and text colours
 * follow the section underneath (`data-theme` on sections → on the header). An
 * indicator slides to the section you are reading (≈250 ms) and the island tightens
 * slightly after the hero. Entrance is CSS (`.nav-in`), so links work immediately.
 */
export function NavIsland({
  brand,
  mark,
  links,
  cta,
  menu,
}: {
  brand: string;
  mark: ReactNode;
  links: NavLink[];
  cta: NavLink;
  menu: ReactNode;
}) {
  const header = useRef<HTMLElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const linkRow = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState("night");
  const [active, setActive] = useState<string | null>(null);
  const [compact, setCompact] = useState(false);

  // Section positions are measured once (and again whenever the page changes size);
  // each scroll frame then only compares numbers — no layout reads while scrolling.
  useEffect(() => {
    type Span = { top: number; bottom: number };
    const span = (el: Element): Span => {
      const box = el.getBoundingClientRect();
      return { top: box.top + window.scrollY, bottom: box.bottom + window.scrollY };
    };
    let themed: { theme: string; span: Span }[] = [];
    let sections: { id: string; span: Span }[] = [];
    const measure = () => {
      themed = [...document.querySelectorAll<HTMLElement>("main [data-theme]")].map((el) => ({
        theme: el.dataset.theme ?? "night",
        span: span(el),
      }));
      sections = links.flatMap((link) => {
        const el = document.getElementById(sectionId(link.href));
        return el ? [{ id: sectionId(link.href), span: span(el) }] : [];
      });
    };
    const within = (s: Span, y: number) => s.top <= y && s.bottom > y;
    let last = { theme: "", active: "", compact: false };
    let frame = 0;
    const read = () => {
      frame = 0;
      const y = window.scrollY;
      let theme = "night";
      for (const t of themed) if (within(t.span, y + 36)) theme = t.theme;
      let reading = "";
      const middle = y + window.innerHeight * 0.55;
      for (const s of sections) if (within(s.span, middle)) reading = s.id;
      const compactNow = y > 48;
      if (theme !== last.theme) setTheme(theme);
      if (reading !== last.active) setActive(reading || null);
      if (compactNow !== last.compact) setCompact(compactNow);
      last = { theme, active: reading, compact: compactNow };
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    const remeasure = () => {
      measure();
      schedule();
    };
    const resize = new ResizeObserver(remeasure);
    const cancel = whenIdle(() => {
      remeasure();
      resize.observe(document.body);
    });
    // Pin spacers and late fonts move sections without resizing the window.
    ScrollTrigger.addEventListener("refresh", remeasure);
    document.fonts?.ready.then(remeasure);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure);
    return () => {
      cancel();
      resize.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
      ScrollTrigger.removeEventListener("refresh", remeasure);
    };
  }, [links]);

  // Slide the indicator under the active link (positions are relative to the row).
  useGSAP(
    () => {
      const row = linkRow.current;
      const dot = indicator.current;
      if (!row || !dot) return;
      const target = active ? row.querySelector<HTMLElement>(`[data-nav-id="${active}"]`) : null;
      if (!target) {
        gsap.to(dot, { opacity: 0, duration: 0.25, overwrite: true });
        return;
      }
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const wasHidden = Number(gsap.getProperty(dot, "opacity")) < 0.05;
      gsap.to(dot, {
        x: target.offsetLeft,
        width: target.offsetWidth,
        opacity: 1,
        duration: reduce || wasHidden ? 0 : 0.25,
        ease: "expo.out",
        overwrite: true,
      });
    },
    { dependencies: [active] },
  );

  // The contact section has no link of its own: the CTA is the way there.
  const sectionLinks = links.filter((link) => link.href !== cta.href);
  const ctaCurrent = active === sectionId(cta.href);

  return (
    <header
      ref={header}
      id="site-header"
      data-theme={theme}
      className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-3 md:pt-4"
    >
      <div
        className={cn(
          "nav-in pointer-events-auto relative flex w-full items-center gap-1 pr-1.5 pl-4 transition-[height,gap] duration-300 ease-out-expo md:w-auto",
          compact ? "h-12 md:gap-2" : "h-13 md:gap-4",
        )}
      >
        <span aria-hidden className="nav-shape" />

        <Link href="/" className="nav-text relative flex items-center gap-2.5 py-2 pr-2">
          {mark}
          <span className="type-ui text-[15px] whitespace-nowrap">{brand}</span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <div ref={linkRow} className="relative">
            <span
              ref={indicator}
              aria-hidden
              className="nav-indicator opacity-0"
              style={{ width: 0 }}
            />
            <ul className="flex items-center">
              {sectionLinks.map((link) => {
                const id = sectionId(link.href);
                const current = id === active;
                return (
                  <li key={link.href} data-nav-id={id} className="relative">
                    <Link
                      href={link.href}
                      aria-current={current ? "location" : undefined}
                      className="relative flex h-10 items-center px-4 type-ui text-[14px] transition-colors duration-300"
                      style={{ color: current ? "var(--nav-active-fg)" : "var(--nav-fg)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        <Link
          href={cta.href}
          aria-current={ctaCurrent ? "location" : undefined}
          className="group relative ml-auto hidden h-10 items-center px-5 md:ml-2 md:flex"
        >
          <span
            aria-hidden
            className={cn(
              "nav-cta-shape rounded-full transition-[background-color,box-shadow] duration-200 group-hover:bg-action-700",
              ctaCurrent && "shadow-[0_0_0_2px_var(--nav-bg),0_0_0_3.5px_var(--nav-cta)]",
            )}
          />
          <span className="relative type-ui text-[14px]" style={{ color: "var(--nav-cta-fg)" }}>
            {cta.label}
          </span>
        </Link>

        <div className="relative ml-auto md:hidden">{menu}</div>
      </div>
    </header>
  );
}
