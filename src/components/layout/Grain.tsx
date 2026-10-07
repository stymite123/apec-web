/** Fixed film-grain overlay (brief §6.4): ~3.5 % opacity, never intercepts input. */
export function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[70] grain opacity-[0.035] mix-blend-overlay"
    />
  );
}
