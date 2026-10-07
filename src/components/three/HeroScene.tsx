"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useRef } from "react";
import { MathUtils, type Group } from "three";

import { ApexMark3D } from "./ApexMark3D";
import { LiquidBlob } from "./LiquidBlob";

/** Fixed pose for the pre-rendered artwork: a slight three-quarter turn. */
const POSE = { rotationY: 0.32, rotationX: -0.06, scale: 1.02, blobScale: 1.6 };

function Mark() {
  const group = useRef<Group>(null);
  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
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
      <ApexMark3D />
    </group>
  );
}

/**
 * Offline renderer for the hero artwork (`pnpm render:mark`, `/?render-mark`).
 * Visitors never load this: the hero shows the pre-rendered image instead
 * (DECISIONS 2026-10-08 — no live 3D on initial load).
 * three.js can't read CSS variables, so brand colours appear as hex here.
 */
export default function HeroScene({ onReady }: { onReady?: () => void }) {
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

      <LiquidBlob animate scale={POSE.blobScale} />
      <Mark />

      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.6} luminanceThreshold={0.72} radius={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
