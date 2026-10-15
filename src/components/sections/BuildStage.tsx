"use client";

import { useRef, type CSSProperties } from "react";

import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import { whenIdle } from "@/lib/idle";
import { scrub } from "@/lib/motion";

export type BuildStep = { title: string; summary?: string };

/** Cube edge in px (design size; the stage scales per breakpoint with --z). */
const S = 70;
/** Stepped pyramid: layer → inclusive cell range on both axes. */
const LAYERS = [
  [0, 4],
  [1, 3],
  [2, 2],
] as const;

type Cell = { x: number; y: number; z: number };
const CELLS: Cell[] = LAYERS.flatMap(([a, b], z) => {
  const out: Cell[] = [];
  for (let y = a; y <= b; y++) for (let x = a; x <= b; x++) out.push({ x, y, z });
  return out;
});
const has = (x: number, y: number, z: number) =>
  CELLS.some((c) => c.x === x && c.y === y && c.z === z);
const APEX = CELLS[CELLS.length - 1]!;

const PALETTE = {
  top: "#eceef1",
  left: "#c4c8cf",
  front: "#959ba4",
  apexTop: "#f6cda3",
  apexLeft: "#f3a86b",
  apexFront: "#c9744a",
};

const face = (style: CSSProperties) => (
  <div className="absolute top-0 left-0" style={{ width: S, height: S, ...style }} />
);

/** One block. Only faces that can be seen (no neighbour in front / left / above) are drawn. */
function Cube({ cell }: { cell: Cell }) {
  const apex = cell === APEX;
  const { x, y, z } = cell;
  return (
    <div
      data-cube
      data-layer={z}
      className="absolute top-0 left-0 [transform-style:preserve-3d]"
      style={{ transform: `translate3d(${x * S}px, ${y * S}px, ${z * S}px)` }}
    >
      {!has(x, y, z + 1) &&
        face({
          transform: `translateZ(${S}px)`,
          background: apex ? PALETTE.apexTop : PALETTE.top,
          boxShadow: "inset 0 0 0 1px rgb(0 0 0 / 0.06)",
        })}
      {!has(x - 1, y, z) &&
        face({
          transformOrigin: "0 0",
          transform: "rotateY(-90deg)",
          background: apex ? PALETTE.apexLeft : PALETTE.left,
          boxShadow: "inset 0 0 0 1px rgb(0 0 0 / 0.07)",
        })}
      {!has(x, y + 1, z) &&
        face({
          transformOrigin: "0 100%",
          transform: "rotateX(-90deg)",
          background: apex ? PALETTE.apexFront : PALETTE.front,
          boxShadow: "inset 0 0 0 1px rgb(0 0 0 / 0.08)",
        })}
    </div>
  );
}

/** Dashed outline of a layer (the plan, before anything is built). */
function Wire({ z, a, b }: { z: number; a: number; b: number }) {
  const w = (b - a + 1) * S;
  const line = "1.5px dashed rgb(243 168 107 / 0.9)";
  return (
    <div
      className="absolute top-0 left-0 [transform-style:preserve-3d]"
      style={{ transform: `translate3d(${a * S}px, ${a * S}px, ${z * S}px)` }}
    >
      <div
        data-wire
        className="absolute opacity-20"
        style={{ width: w, height: w, border: line, transform: `translateZ(${S}px)` }}
      />
      <div
        data-wire
        className="absolute opacity-20"
        style={{
          width: w,
          height: S,
          top: w - S,
          border: line,
          transformOrigin: "0 100%",
          transform: "rotateX(-90deg)",
        }}
      />
      <div
        data-wire
        className="absolute opacity-20"
        style={{
          width: S,
          height: w,
          border: line,
          transformOrigin: "0 0",
          transform: "rotateY(-90deg)",
        }}
      />
    </div>
  );
}

/**
 * "How we work" as a build: a graphite drafting stage where an isometric structure
 * goes up as you scroll — the site is surveyed (Discover), drawn in dashed wire
 * (Design), filled with blocks layer by layer (Build) and crowned with the apex
 * block and a flag (Launch & Grow). Pinned with CSS sticky; transform/opacity only.
 * Without JS or with reduced motion the finished structure and every step show.
 */
export function BuildStage({
  id,
  title,
  steps,
}: {
  id: string;
  title: string;
  steps: BuildStep[];
}) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();
      const cancel = whenIdle(() => {
        mm.add(MOTION_OK, () => {
          const items = q<HTMLElement>("[data-step]");
          const setStep = (p: number) => {
            const current = Math.min(items.length - 1, Math.floor(p * items.length));
            items.forEach((item, i) => {
              item.dataset.state = i < current ? "done" : i === current ? "current" : "upcoming";
            });
          };
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: q("[data-track]")[0],
              start: "top top",
              end: "bottom bottom",
              scrub,
              onUpdate: (self) => setStep(self.progress),
              onRefresh: (self) => setStep(self.progress),
            },
          });

          // 1 · Discover: the ground is surveyed.
          tl.fromTo(q("[data-ground]"), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0)
            .fromTo(q("[data-footprint]"), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.3)
            .fromTo(
              q("[data-scan]"),
              { x: -S, opacity: 0 },
              { x: S * 5, opacity: 1, duration: 0.6 },
              0.35,
            )
            .to(q("[data-scan]"), { opacity: 0, duration: 0.1 }, 0.95);

          // 2 · Design: the plan in dashed wire, layer by layer.
          q("[data-wire-layer]").forEach((layer, i) => {
            tl.fromTo(
              layer.querySelectorAll("[data-wire]"),
              { opacity: 0 },
              { opacity: 1, duration: 0.25 },
              1 + i * 0.25,
            );
          });

          // 3 · Build: blocks drop into the plan.
          const cubes = q<HTMLElement>("[data-cube]");
          cubes.forEach((cube, i) => {
            const layer = Number(cube.dataset.layer);
            const z = layer * S;
            const at = 2 + layer * 0.42 + (i % 25) * 0.014;
            tl.fromTo(
              cube,
              { z: z + S * 2, autoAlpha: 0 },
              { z, autoAlpha: 1, duration: 0.22, ease: "power2.out", immediateRender: true },
              at,
            );
          });
          tl.to(q("[data-wire]"), { opacity: 0.18, duration: 0.3 }, 2.9);

          // 4 · Launch: the flag goes up and the structure turns to face you.
          tl.fromTo(q("[data-flag]"), { scaleY: 0 }, { scaleY: 1, duration: 0.3 }, 3.25)
            .fromTo(q("[data-world]"), { rotationZ: -45 }, { rotationZ: -33, duration: 0.75 }, 3.25)
            .to({}, { duration: 0.2 });

          setStep(0);
          return () => items.forEach((item) => delete item.dataset.state);
        });
      });
      return () => {
        cancel();
        mm.revert();
      };
    },
    { scope: root },
  );

  const half = (S * 5) / 2;

  return (
    <section
      ref={root}
      id={id}
      data-theme="graphite"
      aria-labelledby={`${id}-title`}
      className="defer-render relative overflow-x-clip bg-graphite-950 text-graphite-100 [--defer-h:440svh]"
    >
      <div data-track className="relative h-[440svh] motion-reduce:h-auto">
        <div className="sticky top-0 grid h-svh min-h-[640px] grid-rows-[auto_1fr_auto] overflow-hidden pt-[calc(var(--nav-height)+1.5rem)] motion-reduce:relative motion-reduce:h-auto md:grid-cols-12 md:grid-rows-1 md:items-start">
          {/* Drafting grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.035)_1px,transparent_1px)] [mask-image:radial-gradient(80%_70%_at_60%_50%,black,transparent)] bg-size-[44px_44px]"
          />

          <div className="relative z-10 px-5 md:col-span-5 md:col-start-1 md:row-start-1 md:self-start md:pt-[min(1.5rem,2svh)] md:pl-10 lg:pl-14">
            <h2
              id={`${id}-title`}
              className="type-display text-[clamp(2.5rem,min(6vw,9svh),6.5rem)] leading-[0.84]"
            >
              {title}
            </h2>
            <ol className="mt-5 grid md:mt-[min(1.75rem,3svh)] md:gap-[min(1.5rem,2.6svh)]">
              {steps.map((step, i) => (
                <li
                  key={step.title}
                  data-step
                  className="group relative flex gap-4 transition-opacity duration-500 data-[state=done]:opacity-55 data-[state=upcoming]:opacity-25 max-md:data-[state=done]:opacity-0 max-md:data-[state=upcoming]:opacity-0 motion-safe:max-md:col-start-1 motion-safe:max-md:row-start-1"
                >
                  <span className="flex size-[clamp(36px,5.4svh,48px)] shrink-0 items-center justify-center bg-graphite-100 type-display text-[clamp(16px,2.4svh,20px)] text-graphite-950 transition-colors duration-500 clip-hex group-data-[state=current]:bg-apricot">
                    {i + 1}
                  </span>
                  <div>
                    <p className="type-display text-[clamp(1.4rem,min(2.7vw,4.8svh),3rem)] leading-none">
                      {step.title}
                    </p>
                    {step.summary && (
                      <p className="mt-[min(0.5rem,0.9svh)] max-w-[42ch] text-[clamp(0.95rem,2.3svh,1.25rem)] leading-snug text-graphite-100/65">
                        {step.summary}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Isometric stage */}
          <div
            aria-hidden
            className="relative row-start-2 flex items-center justify-center [--z:0.5] [--zh:1.04] sm:[--z:0.7] md:col-span-7 md:col-start-6 md:row-start-1 md:h-full md:self-center md:[--z:0.72] lg:[--z:0.9] xl:[--z:1.04] [@media(max-height:680px)]:[--zh:0.64] [@media(min-height:681px)_and_(max-height:780px)]:[--zh:0.76] [@media(min-height:781px)_and_(max-height:900px)]:[--zh:0.9]"
          >
            <div className="relative h-[580px] w-[720px] [zoom:min(var(--z),var(--zh))]">
              {/* Tilt (static) and turn (animated) on separate elements: GSAP writes
                  rotateZ before rotateX, which would change the projection. */}
              <div
                className="absolute top-1/2 left-1/2 [transform-style:preserve-3d]"
                style={{
                  width: S * 5,
                  height: S * 5,
                  marginLeft: -half,
                  marginTop: -half + 50,
                  transform: "rotateX(58deg)",
                }}
              >
                <div
                  data-world
                  className="absolute inset-0 [transform-style:preserve-3d]"
                  style={{ transform: "rotateZ(-33deg)" }}
                >
                  {/* Ground: drafting plate, footprint, survey scan */}
                  <div
                    data-ground
                    className="absolute -inset-[62px] border border-white/10 bg-graphite-900 bg-[linear-gradient(rgb(255_255_255/0.07)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.07)_1px,transparent_1px)]"
                    style={{ backgroundSize: `${S}px ${S}px`, backgroundPosition: "-1px -1px" }}
                  />
                  <div
                    data-footprint
                    className="absolute inset-0 border-2 border-dashed border-apricot/70"
                  />
                  <div
                    data-scan
                    className="absolute top-[-62px] bottom-[-62px] left-0 w-[3px] bg-apricot opacity-0 shadow-[0_0_0_6px_rgb(243_168_107/0.18)]"
                  />

                  {LAYERS.map(([a, b], z) => (
                    <div key={z} data-wire-layer className="[transform-style:preserve-3d]">
                      <Wire z={z} a={a} b={b} />
                    </div>
                  ))}

                  {CELLS.map((cell) => (
                    <Cube key={`${cell.x}-${cell.y}-${cell.z}`} cell={cell} />
                  ))}

                  {/* Flag on the apex block */}
                  <div
                    className="absolute top-0 left-0 [transform-style:preserve-3d]"
                    style={{
                      transform: `translate3d(${APEX.x * S + S / 2}px, ${APEX.y * S + S / 2}px, ${(APEX.z + 1) * S}px)`,
                    }}
                  >
                    <div
                      className="absolute bottom-0 left-0 h-[110px] w-[48px] [transform-style:preserve-3d]"
                      style={{ transform: "rotateX(-90deg)", transformOrigin: "0 100%" }}
                    >
                      <div data-flag className="absolute inset-0 origin-bottom">
                        <span className="absolute bottom-0 left-0 h-full w-[3px] bg-graphite-100" />
                        <span className="absolute top-0 left-[3px] h-[30px] w-[44px] bg-apricot [clip-path:polygon(0_0,100%_50%,0_100%)]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
