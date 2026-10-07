"use client";

import { useEffect, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Header behaviour (brief §8.1 #1): transparent over the hero, glass bar after
 * scrolling, hides on scroll down and returns on scroll up. Never hides while
 * something inside it has focus.
 */
export function NavShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      const header = document.getElementById("site-header");
      const hasFocus = header?.contains(document.activeElement) ?? false;
      setHidden(!hasFocus && y > 480 && y > last);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      id="site-header"
      className={cn(
        "fixed inset-x-0 top-0 z-40 h-(--nav-height) border-b transition-[background-color,border-color,transform] duration-500 ease-out-expo",
        scrolled
          ? "border-steel-800/60 bg-void/70 backdrop-blur-md"
          : "border-transparent bg-transparent",
        hidden && "-translate-y-full",
      )}
    >
      {children}
    </header>
  );
}
