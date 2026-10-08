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

/**
 * Runs `tasks` in order, spread over idle periods: as many as fit in each idle slice
 * (at least one), so no single setup step turns into a long task. Returns a cancel function.
 */
export function whenIdleEach(tasks: (() => void)[], timeout = 2000): () => void {
  let next = 0;
  let cancel = () => {};
  const run = (deadline?: IdleDeadline) => {
    do {
      tasks[next++]?.();
    } while (next < tasks.length && deadline && deadline.timeRemaining() > 8);
    if (next < tasks.length) schedule();
  };
  const schedule = () => {
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout });
      cancel = () => window.cancelIdleCallback(id);
    } else {
      const id = window.setTimeout(() => run(), 50);
      cancel = () => window.clearTimeout(id);
    }
  };
  schedule();
  return () => cancel();
}
