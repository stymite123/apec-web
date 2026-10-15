import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Call-to-action pills, shared by every section (combined system, DECISIONS 2026-10-15):
 * "solid" is the blue action, "outline" the quiet second choice. Small feedback only
 * (colour and a slight lift, ≈200 ms); nothing moves away from the pointer.
 * `fill` / `ink` let a section adapt the outline to its surface.
 */
const shapes = {
  solid: {
    shape: "bg-action-600 group-hover:bg-action-700",
    text: "text-white",
  },
  outline: {
    shape: "border-[1.5px] border-(color:--fill) group-hover:bg-(color:--fill)/10",
    text: "text-(color:--fill)",
  },
} as const;

export function ShapeLink({
  href,
  children,
  variant = "solid",
  fill = "var(--color-star)",
  ink,
  className,
  external,
}: {
  href: string;
  children: ReactNode;
  /** "slant" is accepted for older call sites and renders as "solid". */
  variant?: keyof typeof shapes | "slant";
  fill?: string;
  ink?: string;
  className?: string;
  external?: boolean;
}) {
  const kind = variant === "slant" ? "solid" : variant;
  const inner = (
    <>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 rounded-full transition-[background-color,translate] duration-200 group-hover:-translate-y-px",
          shapes[kind].shape,
        )}
      />
      <span className="relative flex items-center gap-2">{children}</span>
    </>
  );
  const classes = cn(
    "group relative inline-flex h-12 items-center justify-center px-7 type-ui text-[16px]",
    shapes[kind].text,
    className,
  );
  const style = { "--fill": fill, ...(ink && { color: ink }) } as React.CSSProperties;

  if (external || !href.startsWith("/")) {
    return (
      <a
        href={href}
        className={classes}
        style={style}
        {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} style={style}>
      {inner}
    </Link>
  );
}
