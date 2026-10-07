import Link from "next/link";

import { TemporaryApexMark } from "@/components/brand/TemporaryApexMark";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * Functional, neutral navigation. Glass treatment, hide-on-scroll and the
 * magnetic CTA wait for the approved design (docs/PHASE3_PLAN.md).
 */
export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 h-(--nav-height) border-b border-steel-800 bg-void">
      <div className="container-site flex h-full items-center justify-between gap-6">
        <Link
          href="/"
          className="flex items-center gap-3 font-display text-lg font-semibold tracking-tight text-silver-100"
        >
          <TemporaryApexMark className="w-9" />
          <span>{site.name}</span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-steel-300 transition-colors hover:text-silver-100"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={site.cta.href}
            className={cn(
              buttonVariants({ size: "lg" }),
              "hidden rounded-full px-5 md:inline-flex",
            )}
          >
            {site.cta.label}
          </Link>
          <MobileMenu
            links={site.nav}
            cta={site.cta}
            labels={{ openMenu: site.labels.openMenu, menuTitle: site.labels.menuTitle }}
          />
        </div>
      </div>
    </header>
  );
}
