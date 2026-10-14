"use client";

import Link from "next/link";
import { useState } from "react";

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type NavLink = { label: string; href: string };

type MobileMenuProps = {
  links: NavLink[];
  cta: NavLink;
  labels: { openMenu: string; menuTitle: string };
};

/** Small-screen navigation: a night sheet with title-card links. */
export function MobileMenu({ links, cta, labels }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={labels.openMenu}
          className="group relative flex h-10 items-center gap-2 px-4"
        >
          <span aria-hidden className="nav-cta-shape" />
          <span className="relative type-ui text-[14px]" style={{ color: "var(--nav-cta-fg)" }}>
            {labels.menuTitle}
          </span>
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full border-night-700 bg-night-950 sm:max-w-sm"
        aria-describedby={undefined}
      >
        <SheetTitle className="sr-only">{labels.menuTitle}</SheetTitle>
        <nav aria-label="Mobile" className="flex flex-1 flex-col justify-between px-6 pt-20 pb-10">
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={close}
                  className="block py-1 type-display text-[clamp(3.5rem,18vw,5rem)] leading-[0.95] text-star transition-colors hover:text-apricot"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={cta.href}
            onClick={close}
            className="group relative flex h-14 items-center justify-center"
          >
            <span aria-hidden className="absolute inset-0 -skew-x-12 rounded-[3px] bg-apricot" />
            <span className="relative type-ui text-base text-night-950">{cta.label}</span>
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
