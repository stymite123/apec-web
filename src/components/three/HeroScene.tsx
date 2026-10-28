"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useEffect, useRef, useState } from "react";
import { MathUtils, type Group } from "three";

import { ApexMark3D, type MarkPart } from "./ApexMark3D";
import { LiquidBlob, type BlobClock } from "./LiquidBlob";

/** Fixed pose for the pre-rendered artwork: a slight three-quarter turn. */
const POSE = { rotationY: 0.32, rotationX: -0.06, scale: 1.02, blobScale: 1.6 };

/** `all` = the original single image; `mark` / `aura` = separate layers for the hero. */
export type RenderLayer = "all" | "mark" | "aura" | "white" | "blue" | "bars" | "swoosh";

/** The single-piece layers, used to split the mark for the scroll sequence. */
const PARTS = ["white", "blue", "bars", "swoosh"] as const;
const isPart = (layer: RenderLayer): layer is (typeof PARTS)[number] =>
  (PARTS as readonly string[]).includes(layer);

declare global {
  interface Window {
    /** Set by layered render mode: jump the aura to time `t` (s) and draw one frame. */
    __renderMarkAt?: (t: number) => Promise<void>;
  }
}

function Mark({ still, parts }: { still: boolean; parts?: MarkPart[] }) {
  const group = useRef<Group>(null);
  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    if (still) {
      g.rotation.set(POSE.rotationX, POSE.rotationY, 0);
      return;
    }
    const damp = 1 - Math.exp(-delta * 4);
    g.rotation.y = MathUtils.lerp(
      g.rotation.y,
      POSE.rotationY + Math.sin(state.clock.elapsedTime * 0.35) * 0.05,
      damp,
    );
    g.rotation.x = MathUtils.lerp(g.rotation.x, POSE.rotationX, damp);
  });
  return (
    <group ref={group} scale={POSE.scale}>
      <ApexMark3D parts={parts} />
    </group>
  );
}

/** Layered mode: the script sets the aura time per frame (even spacing, deterministic). */
function FrameDriver({ clock }: { clock: BlobClock }) {
  const { invalidate } = useThree();
  useEffect(() => {
    window.__renderMarkAt = (t) =>
      new Promise((resolve) => {
        clock.time = t;
        invalidate();
        // Two frames: one to render, one to be sure it reached the screen.
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
    return () => {
      delete window.__renderMarkAt;
    };
  }, [clock, invalidate]);
  return null;
}

/**
 * Offline renderer for the hero artwork (`pnpm render:layers`, `/?render-mark=mark|aura`).
 * Visitors never load this: the hero shows pre-rendered media instead
 * (DECISIONS 2026-10-08 — no live 3D on initial load).
 * three.js can't read CSS variables, so brand colours appear as hex here.
 */
export default function HeroScene({
  onReady,
  layer = "all",
}: {
  onReady?: () => void;
  layer?: RenderLayer;
}) {
  const layered = layer !== "all";
  const [clock] = useState<BlobClock>(() => ({ time: 0 }));

  return (
    <Canvas
      dpr={2}
      camera={{ position: [0, 0, 6.2], fov: 35 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      onCreated={() => onReady?.()}
      aria-hidden
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />

      <Environment resolution={256}>
        {/* Front key light so the metal stroke reads silver, not grey. */}
        <Lightformer intensity={3} position={[1, 2, 6]} target={[0, 0, 0]} scale={[8, 5, 1]} />
        <Lightformer intensity={2} position={[0, 5, -2]} target={[0, 0, 0]} scale={[10, 2, 1]} />
        <Lightformer
          intensity={1.6}
          color="#5CC2FF"
          position={[-5, 0, 1]}
          target={[0, 0, 0]}
          scale={[3, 8, 1]}
        />
        <Lightformer
          intensity={1.2}
          color="#1F7BFF"
          position={[5, -1, 1]}
          target={[0, 0, 0]}
          scale={[3, 8, 1]}
        />
      </Environment>

      {/* The aura is additive: on a transparent canvas its result depends on how the
          browser composites alpha, so the video layer renders on an opaque page colour. */}
      {layer === "aura" && <color attach="background" args={["#05060A"]} />}
      {layer !== "mark" && !isPart(layer) && (
        <LiquidBlob animate scale={POSE.blobScale} clock={layered ? clock : undefined} />
      )}
      {layer !== "aura" && <Mark still={layered} parts={isPart(layer) ? [layer] : undefined} />}
      {layered && <FrameDriver clock={clock} />}

      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.6} luminanceThreshold={0.72} radius={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
