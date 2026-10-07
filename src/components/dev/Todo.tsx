import type { ReactNode } from "react";

import { isProduction, isTodo } from "@/lib/todo";
import { cn } from "@/lib/utils";

/**
 * Visible placeholder for missing content (brief §11).
 * Dev: dashed wine outline + the TODO text. Production: renders nothing.
 */
export function Todo({ children, className }: { children: ReactNode; className?: string }) {
  if (isProduction) return null;
  return (
    <span
      data-todo=""
      className={cn(
        "inline-block rounded-md px-2 py-1 font-mono text-xs leading-snug text-steel-300 outline-1 outline-wine-400 outline-dashed",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Renders real copy as-is and TODO strings through <Todo>. */
export function Copy({ value }: { value: string }) {
  return isTodo(value) ? <Todo>{value}</Todo> : <>{value}</>;
}
