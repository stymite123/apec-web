import Link from "next/link";

import { TemporaryApexMark } from "@/components/brand/TemporaryApexMark";
import { Copy, Todo } from "@/components/dev/Todo";
import { FooterWordmark } from "@/components/layout/FooterWordmark";
import { site } from "@/content/site";
import { shouldRender } from "@/lib/todo";

/**
 * Plain footer structure. The giant animated "APEC" wordmark waits for the
 * approved design (docs/PHASE3_PLAN.md).
 */
export function Footer() {
  const { email, phone, whatsapp } = site.contact;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-steel-800 bg-ink">
      <div className="container-site grid gap-12 py-16 md:grid-cols-12">
        <div className="space-y-4 md:col-span-6">
          <Link
            href="/"
            className="inline-flex items-center gap-3 font-display text-xl font-semibold tracking-tight text-silver-100"
          >
            <TemporaryApexMark className="w-10" />
            <span>{site.name}</span>
          </Link>
          {shouldRender(site.expansion) && (
            <p className="max-w-sm text-steel-400">
              <Copy value={site.expansion} />
            </p>
          )}
          {shouldRender(site.tagline) && (
            <p className="label-mono text-steel-400">
              <Copy value={site.tagline} />
            </p>
          )}
        </div>

        <nav aria-labelledby="footer-explore" className="md:col-span-3">
          <h2 id="footer-explore" className="label-mono text-steel-400">
            {site.labels.footerExplore}
          </h2>
          <ul className="mt-4 space-y-2">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-steel-300 transition-colors hover:text-silver-100"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-3">
          <h2 className="label-mono text-steel-400">{site.labels.footerContact}</h2>
          <ul className="mt-4 space-y-2 text-steel-300">
            <li>
              <a
                href={`mailto:${email}`}
                className="break-all transition-colors hover:text-silver-100"
              >
                {email}
              </a>
            </li>
            <li>
              <a href={`tel:+${whatsapp}`} className="transition-colors hover:text-silver-100">
                {phone}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-silver-100"
              >
                {site.labels.whatsapp}
              </a>
            </li>
            {site.socials.length === 0 && (
              <li>
                <Todo>TODO: social links</Todo>
              </li>
            )}
          </ul>
        </div>
      </div>

      <FooterWordmark text={site.shortName} />

      <div className="border-t border-steel-800">
        <div className="container-site flex flex-col gap-2 py-6 text-sm text-steel-400 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {site.name}
          </p>
          {shouldRender(site.location) && (
            <p>
              <Copy value={site.location} />
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
