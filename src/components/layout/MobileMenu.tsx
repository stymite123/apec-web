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

/** Small-screen navigation: a night sheet with the same section links and one Contact action. */
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
                  className="block py-2 type-ui text-[clamp(2rem,9vw,2.75rem)] leading-[1.1] tracking-[-0.02em] text-star transition-colors duration-200 hover:text-action-300"
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
            <span
              aria-hidden
              className="absolute inset-0 rounded-full bg-action-600 transition-colors duration-200 group-hover:bg-action-700"
            />
            <span className="relative type-ui text-base text-white">{cta.label}</span>
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
