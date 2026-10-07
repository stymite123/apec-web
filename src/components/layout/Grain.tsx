/**
 * Fixed film-grain overlay (brief §6.4), never intercepts input.
 * Plain low opacity — no mix-blend-mode: blending a full-screen layer over the
 * animated 3D canvas forced the whole page to re-composite every frame.
 */
export function Grain() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[70] grain opacity-[0.03]" />
  );
}
