"use client";

import { useMemo } from "react";
import { ExtrudeGeometry, type Shape } from "three";

import { apexShapes } from "./apex-shapes";

const extrude = (shape: Shape, depth: number) => {
  const geometry = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.018,
    bevelSegments: 4,
    curveSegments: 48,
  });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
};

/** Extruded APEC mark: brushed-silver left stroke, glossy blue right stroke, emissive bars + swoosh. */
/** Which pieces to draw. The offline renderer captures them one at a time. */
export type MarkPart = "white" | "blue" | "bars" | "swoosh";

export function ApexMark3D({ parts }: { parts?: MarkPart[] }) {
  const shows = (part: MarkPart) => !parts || parts.includes(part);
  const geometries = useMemo(
    () => ({
      left: extrude(apexShapes.leftStroke, 0.22),
      right: extrude(apexShapes.rightStroke, 0.22),
      bars: apexShapes.bars.map((bar) => extrude(bar, 0.12)),
      swoosh: extrude(apexShapes.swoosh, 0.08),
    }),
    [],
  );

  return (
    <group>
      {shows("white") && (
        <mesh geometry={geometries.left}>
          {/* Standard (not Physical) materials: much cheaper shaders to compile on first visit. */}
          <meshStandardMaterial
            color="#F1F4F8"
            metalness={0.85}
            roughness={0.24}
            envMapIntensity={1.7}
          />
        </mesh>
      )}
      {shows("blue") && (
        <mesh geometry={geometries.right}>
          <meshStandardMaterial
            color="#1F7BFF"
            metalness={0.35}
            roughness={0.16}
            envMapIntensity={1.3}
            emissive="#0B3FA8"
            emissiveIntensity={0.35}
          />
        </mesh>
      )}
      {shows("bars") &&
        geometries.bars.map((geometry, index) => (
          <mesh key={index} geometry={geometry} position={[0, 0, 0.02 * index]}>
            <meshStandardMaterial
              color="#5CC2FF"
              emissive="#1F7BFF"
              emissiveIntensity={0.9 + index * 0.35}
              toneMapped={false}
            />
          </mesh>
        ))}
      {shows("swoosh") && (
        <mesh geometry={geometries.swoosh} position={[0, 0, 0.18]}>
          <meshStandardMaterial
            color="#5CC2FF"
            emissive="#5CC2FF"
            emissiveIntensity={1.8}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  );
}
