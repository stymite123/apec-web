/** Feature flags (brief §11). Flip in code; no runtime toggles. */
export const SHOW_WORK = false;
export const SHOW_TESTIMONIALS = false;
/** No sound in v1 (DECISIONS 2026-10-07). */
export const ENABLE_SOUND = false;
/**
 * Live WebGL on page load. Off: the hero uses artwork pre-rendered from the 3D
 * scene (`pnpm render:layers`) — DECISIONS 2026-10-08, docs/PERFORMANCE_REVIEW.md.
 */
export const ENABLE_3D = false;
