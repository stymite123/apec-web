import Link from "next/link";

import { TemporaryApexMark } from "@/components/brand/TemporaryApexMark";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { NavProgress } from "@/components/layout/NavProgress";
import { NavShell } from "@/components/layout/NavShell";
import { site } from "@/content/site";

/**
 * Boxed nav in the GSAP Field rhythm: six equal mono boxes (brand · four sections ·
 * CTA). Each section box fills from the left as you scroll through that section
 * (NavProgress, transform only). Phones: brand box + menu box.
 */
export function Nav() {
  return (
    <NavShell>
      <div className="grid grid-cols-[1fr_auto] gap-2 px-4 pt-4 md:grid-cols-6 md:px-6">
        <Link
          href="/"
          className="field-drop nav-box justify-start bg-ink/90 px-3 text-brand-300 [--i:0] md:justify-center"
        >
          <TemporaryApexMark className="w-5" />
          {site.name}
        </Link>

        <nav aria-label="Primary" className="hidden md:col-span-4 md:block">
          <ul className="grid grid-cols-4 gap-2">
            {site.nav.map((item, index) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  data-nav-box={item.href.replace("/#", "")}
                  className="field-drop group nav-box bg-steel-800/70 text-silver-100 transition-colors hover:bg-steel-600/80"
                  style={{ "--i": index + 1 } as React.CSSProperties}
                >
                  {item.label}
                  {/* Scroll-progress fill with a dark copy of the label riding inside it
                      (inline transforms: GSAP owns them; Tailwind translate-* is a separate property). */}
                  <span
                    aria-hidden
                    data-nav-fill
                    className="absolute inset-0 overflow-hidden bg-silver-100"
                    style={{ transform: "translateX(-100%)" }}
                  >
                    <span
                      data-nav-fill-label
                      className="absolute inset-0 flex items-center justify-center text-void"
                      style={{ transform: "translateX(100%)" }}
                    >
                      {item.label}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          href={site.cta.href}
          className="field-drop nav-box hidden bg-brand-500 font-medium text-void transition-colors [--i:5] hover:bg-brand-300 md:flex"
        >
          {site.cta.label}
        </Link>

        <MobileMenu
          links={site.nav}
          cta={site.cta}
          labels={{ openMenu: site.labels.openMenu, menuTitle: site.labels.menuTitle }}
        />
      </div>
      <NavProgress />
    </NavShell>
  );
}
