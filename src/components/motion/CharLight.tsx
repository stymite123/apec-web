import { Fragment } from "react";

import { cn } from "@/lib/utils";

/**
 * Server-rendered characters that light up one after another (GSAP Field load move).
 * Pure CSS (`.field-char` in globals.css): opacity only, runs before hydration, so the
 * entrance never waits on JavaScript. Screen readers get the plain text via `label`.
 */
export function CharLight({
  lines,
  label,
  start = 0,
  className,
}: {
  /** Each line is a list of runs; `em` runs render in italic. */
  lines: { text: string; em?: boolean; className?: string }[][];
  label: string;
  /** Index offset, so several blocks can share one stagger. */
  start?: number;
  className?: string;
}) {
  let index = start;

  return (
    <>
      <span className="sr-only">{label}</span>
      <span aria-hidden className={className}>
        {lines.map((runs, lineIndex) => (
          <span key={lineIndex} className="block whitespace-nowrap">
            {runs.map((run, runIndex) => (
              <span key={runIndex} className={cn(run.em && "italic", run.className)}>
                {[...run.text].map((char, charIndex) => (
                  <Fragment key={charIndex}>
                    {char === " " ? (
                      " "
                    ) : (
                      <span
                        className="field-char"
                        style={{ "--i": index++ } as React.CSSProperties}
                      >
                        {char}
                      </span>
                    )}
                  </Fragment>
                ))}
              </span>
            ))}
          </span>
        ))}
      </span>
    </>
  );
}
