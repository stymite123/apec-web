"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

/**
 * Device scenes for "What we do", loaded only as the section approaches. They hold
 * ~210 pieces of text in ~29 font/size combinations; laying them out on first load cost
 * most of the first visit's main-thread time (measured 2026-10-15). The parent stage
 * has a fixed height, so mounting later moves nothing on the page.
 */
const SCENES = {
  seo: dynamic(() => import("./SearchStack").then((m) => m.SearchStack), { ssr: false }),
  "ai-agents": dynamic(() => import("./FlowCanvas").then((m) => m.FlowCanvas), { ssr: false }),
  web: dynamic(() => import("./Laptop").then((m) => m.Laptop), { ssr: false }),
  "mobile-apps": dynamic(() => import("./Phones").then((m) => m.Phones), { ssr: false }),
  "brand-design": dynamic(() => import("./Gallery").then((m) => m.Gallery), { ssr: false }),
} as const;

export function LazyScene({ slug }: { slug: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        setShow(true);
      },
      // Start a screen and a half early so the scene is ready when it scrolls in.
      { rootMargin: "150% 0px 150% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Scene = SCENES[slug as keyof typeof SCENES];
  return <div ref={ref}>{show && Scene ? <Scene /> : null}</div>;
}
