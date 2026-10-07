"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useRef, useState, type RefObject } from "react";
import { MathUtils, type Group } from "three";

import { perfOff } from "@/lib/perf-switches";

import { ApexMark3D } from "./ApexMark3D";
import { LiquidBlob } from "./LiquidBlob";

export type HeroInput = { pointerX: number; pointerY: number; scroll: number };

type HeroSceneProps = {
  input: RefObject<HeroInput>;
  active: boolean;
  animate: boolean;
  mobile: boolean;
  onReady?: () => void;
};

/** Where the mark sits: right of the headline on desktop, top half on phones. */
const LAYOUT = {
  desktop: { x: 1.45, y: 0.15, scale: 0.88, blobScale: 1.55 },
  mobile: { x: 0, y: 0.95, scale: 0.5, blobScale: 0.95 },
};

type Layout = (typeof LAYOUT)[keyof typeof LAYOUT];

function Rig({
  input,
  animate,
  layout,
}: {
  input: RefObject<HeroInput>;
  animate: boolean;
  layout: Layout;
}) {
  const group = useRef<Group>(null);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const { pointerX, pointerY, scroll } = input.current;
    const t = state.clock.elapsedTime;
    const idle = animate ? Math.sin(t * 0.35) * 0.18 : 0;
    const damp = 1 - Math.exp(-delta * 4);

    g.rotation.y = MathUtils.lerp(g.rotation.y, idle + pointerX * 0.4 + scroll * 1.4, damp);
    g.rotation.x = MathUtils.lerp(g.rotation.x, -pointerY * 0.18 + scroll * 0.25, damp);
    g.position.y = MathUtils.lerp(
      g.position.y,
      layout.y + (animate ? Math.sin(t * 0.6) * 0.05 : 0) + scroll * 1.6,
      damp,
    );
    g.scale.setScalar(MathUtils.lerp(g.scale.x, layout.scale * (1 - scroll * 0.25), damp));
  });

  return (
    <group ref={group} position={[layout.x, layout.y, 0]} scale={layout.scale}>
      <ApexMark3D />
    </group>
  );
}

/**
 * Hero 3D scene (brief §6.6 #2), lazy-loaded after the hero text paints.
 * Rendering pauses when the hero is off-screen (`active`); with reduced motion
 * it renders on demand and doesn't idle-animate.
 * three.js can't read CSS variables, so brand colours appear as hex here.
 */
export default function HeroScene({ input, active, animate, mobile, onReady }: HeroSceneProps) {
  const layout = mobile ? LAYOUT.mobile : LAYOUT.desktop;
  // Shaders compile in parallel (KHR_parallel_shader_compile) before the first frame,
  // so first visits don't freeze the main thread while the scene starts.
  const [compiled, setCompiled] = useState(false);
  const running = compiled && active;

  return (
    <Canvas
      dpr={mobile ? 1 : [1, 1.5]}
      camera={{ position: [0, 0, 6.2], fov: 35 }}
      gl={{ antialias: !mobile, alpha: true, powerPreference: "high-performance" }}
      frameloop={running ? (animate ? "always" : "demand") : "never"}
      onCreated={({ gl, scene, camera }) => {
        gl.compileAsync(scene, camera)
          .catch(() => undefined)
          .finally(() => {
            performance.mark("hero3d:compiled");
            setCompiled(true);
            onReady?.();
          });
      }}
      aria-hidden
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />

      {!perfOff("env") && (
        <Environment resolution={128}>
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
      )}

      {!perfOff("blob") && (
        <group position={[layout.x, layout.y, 0]}>
          <LiquidBlob animate={animate} scale={layout.blobScale} />
        </group>
      )}
      {!perfOff("mark") && <Rig input={input} animate={animate} layout={layout} />}

      {!perfOff("bloom") && (
        <EffectComposer multisampling={0}>
          <Bloom
            mipmapBlur
            intensity={mobile ? 0.45 : 0.6}
            luminanceThreshold={0.72}
            radius={0.6}
          />
        </EffectComposer>
      )}
    </Canvas>
  );
}
