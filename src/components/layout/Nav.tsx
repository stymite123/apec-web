import Link from "next/link";

import { TemporaryApexMark } from "@/components/brand/TemporaryApexMark";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { NavShell } from "@/components/layout/NavShell";
import { site } from "@/content/site";

/** Editorial nav: mark + name, mono links, outlined CTA. Behaviour lives in NavShell. */
export function Nav() {
  return (
    <NavShell>
      <div className="container-site flex h-full items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 text-silver-100">
          <TemporaryApexMark className="w-8" />
          <span className="label-mono text-silver-100">{site.name}</span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="label-mono text-steel-300 transition-colors hover:text-silver-100"
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
            className="hidden h-10 items-center rounded-full border border-steel-600 px-5 label-mono text-silver-100 transition-colors hover:border-silver-100 md:inline-flex"
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
    </NavShell>
  );
}
