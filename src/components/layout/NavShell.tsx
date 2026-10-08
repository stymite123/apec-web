import type { ReactNode } from "react";

/**
 * Header frame. The boxed nav (GSAP Field rhythm) stays visible at all times: its
 * boxes carry their own backgrounds, so there is no glass bar and no hide-on-scroll.
 */
export function NavShell({ children }: { children: ReactNode }) {
  return (
    <header id="site-header" className="fixed inset-x-0 top-0 z-40">
      {children}
    </header>
  );
}
