import Link from "next/link";

import { Copy, Todo } from "@/components/dev/Todo";
import { FooterWordmark } from "@/components/layout/FooterWordmark";
import { site } from "@/content/site";
import { shouldRender } from "@/lib/todo";

export function Footer() {
  const { email, phone, whatsapp } = site.contact;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-night-950 text-night-300">
      <FooterWordmark text={site.shortName} />

      <div className="container-site grid gap-10 py-14 md:grid-cols-12">
        <div className="space-y-2 md:col-span-6">
          {shouldRender(site.expansion) && (
            <p className="max-w-sm text-lead text-star">
              <Copy value={site.expansion} />
            </p>
          )}
          {shouldRender(site.tagline) && (
            <p className="type-ui text-[14px]">
              <Copy value={site.tagline} />
            </p>
          )}
        </div>

        <nav aria-labelledby="footer-explore" className="md:col-span-3">
          <h2 id="footer-explore" className="type-ui text-[13px] text-star">
            {site.labels.footerExplore}
          </h2>
          <ul className="mt-3 space-y-1.5">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-apricot">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-3">
          <h2 className="type-ui text-[13px] text-star">{site.labels.footerContact}</h2>
          <ul className="mt-3 space-y-1.5">
            <li>
              <a
                href={`mailto:${email}`}
                className="break-all transition-colors hover:text-apricot"
              >
                {email}
              </a>
            </li>
            <li>
              <a href={`tel:+${whatsapp}`} className="transition-colors hover:text-apricot">
                {phone}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-apricot"
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

      <div className="border-t border-night-800">
        <div className="container-site flex flex-col gap-1 py-6 text-sm md:flex-row md:items-center md:justify-between">
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
