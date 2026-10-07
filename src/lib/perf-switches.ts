/**
 * TEMPORARY profiling switches (branch perf/profile-reel01, docs/PERFORMANCE_REVIEW.md).
 * `?perf-off=3d,bloom,blob,env,mark,pin,dither` turns single effects off so each one's
 * cost can be measured in isolation. Client-only; no effect without the query param.
 */
export type PerfSwitch = "3d" | "bloom" | "blob" | "env" | "mark" | "pin" | "dither";

export function perfOff(name: PerfSwitch) {
  if (typeof window === "undefined") return false;
  const off = new URLSearchParams(window.location.search).get("perf-off");
  return off?.split(",").includes(name) ?? false;
}
