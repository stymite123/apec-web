/**
 * Runs `fn` when the main thread is idle (or after `timeout` ms at the latest).
 * Used to set up below-the-fold scroll animations in their own tasks, so the first
 * load only pays for the hero (docs/PERFORMANCE_REVIEW.md budgets).
 * Returns a cancel function.
 */
export function whenIdle(fn: () => void, timeout = 1500): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(fn, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(fn, 200);
  return () => window.clearTimeout(id);
}
