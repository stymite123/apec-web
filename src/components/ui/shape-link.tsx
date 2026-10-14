import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Call-to-action shapes. "slant" is a parallelogram (motion, forward); "outline"
 * is the same parallelogram as a line. Colours come from the caller's tokens.
 */
const shapes = {
  slant: { shape: "bg-(color:--fill)", text: "text-(color:--ink)" },
  outline: { shape: "border-2 border-(color:--fill)", text: "text-(color:--fill)" },
} as const;

export function ShapeLink({
  href,
  children,
  variant = "slant",
  fill = "var(--color-apricot)",
  ink = "var(--color-night-950)",
  className,
  external,
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof shapes;
  fill?: string;
  ink?: string;
  className?: string;
  external?: boolean;
}) {
  const inner = (
    <>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 -skew-x-12 rounded-[3px] transition-transform duration-300 ease-out-expo group-hover:scale-x-[1.04] group-hover:-skew-x-[18deg]",
          shapes[variant].shape,
        )}
      />
      <span className="relative flex items-center gap-2">{children}</span>
    </>
  );
  const classes = cn(
    "group relative inline-flex h-13 items-center justify-center px-8 type-ui text-[15px]",
    shapes[variant].text,
    className,
  );
  const style = { "--fill": fill, "--ink": ink } as React.CSSProperties;

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
