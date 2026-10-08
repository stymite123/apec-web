"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type NavLink = { label: string; href: string };

/**
 * Small-screen navigation. The trigger is a nav box (GSAP Field rhythm); the sheet
 * itself is unchanged until the preview is approved.
 */
type MobileMenuProps = {
  links: NavLink[];
  cta: NavLink;
  labels: { openMenu: string; menuTitle: string };
};

export function MobileMenu({ links, cta, labels }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={labels.openMenu}
          className="field-drop nav-box bg-grey-800 px-3 text-silver-100 [--i:1] md:hidden"
        >
          {labels.menuTitle}
          <MenuIcon aria-hidden className="size-3.5" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full border-grey-800 bg-oxblood-950 sm:max-w-sm"
        aria-describedby={undefined}
      >
        <SheetTitle className="sr-only">{labels.menuTitle}</SheetTitle>
        <nav aria-label="Mobile" className="flex flex-1 flex-col justify-between px-6 pt-20 pb-10">
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={close}
                  className="block py-2 font-display text-h3 font-semibold text-silver-100"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={cta.href}
            onClick={close}
            className={cn(buttonVariants({ size: "lg" }), "h-12 rounded-full text-base")}
          >
            {cta.label}
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
