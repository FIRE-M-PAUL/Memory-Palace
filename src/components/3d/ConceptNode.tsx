"use client";

import { memo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { Concept } from "@/types/learning";
import { getClusterColor } from "@/types/memory-palace";
import { resolveText } from "@/lib/multilingual";
import { useAppStore } from "@/store/appStore";
import type { PerformanceProfile } from "@/lib/performanceProfile";

interface ConceptNodeProps {
  concept: Concept;
  position: { x: number; y: number; z: number };
  selected: boolean;
  hovered: boolean;
  highlighted: boolean;
  dimmed: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
  profile: PerformanceProfile;
}

function ConceptNodeInner({
  concept,
  position,
  selected,
  hovered,
  highlighted,
  dimmed,
  onClick,
  onHover,
  profile,
}: ConceptNodeProps) {
  const language = useAppStore((s) => s.language);
  const meshRef = useRef<THREE.Mesh>(null);
  const color = getClusterColor(concept.cluster);
  const segments = profile.sphereSegments;
  const scale =
    concept.importance === "high" ? 0.38 : concept.importance === "medium" ? 0.3 : 0.24;
  const active = selected || hovered || highlighted;
  const showLabel = profile.labelMode === "all" || active;
  const shouldFloat = profile.enableNodeFloat && (active || selected) && !dimmed;

  useFrame((state) => {
    if (!shouldFloat || !meshRef.current) return;
    meshRef.current.position.y =
      position.y + Math.sin(state.clock.elapsedTime * 0.45 + concept.id.length) * 0.035;
  });

  const opacity = dimmed ? 0.1 : active ? 0.92 : 0.72;
  const emissive = dimmed ? 0.08 : active ? 1.1 : 0.5;

  return (
    <group position={[position.x, position.y, position.z]}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          if (!dimmed) onClick();
        }}
        onPointerOver={(e) => {
          if (dimmed) return;
          e.stopPropagation();
          onHover(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onHover(false);
          document.body.style.cursor = "auto";
        }}
        scale={active ? scale * 1.28 : scale}
        frustumCulled
      >
        <sphereGeometry args={[1, segments, segments]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissive}
          metalness={0.75}
          roughness={0.25}
          transparent={dimmed}
          opacity={opacity}
        />
      </mesh>
      {active && !dimmed && (
        <mesh scale={scale * 1.65} frustumCulled>
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial color={color} transparent opacity={0.12} />
        </mesh>
      )}
      {showLabel && !dimmed && (
        <Html
          position={[0, scale + 0.4, 0]}
          center
          distanceFactor={14}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          <div
            className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap backdrop-blur-sm border ${
              selected
                ? "bg-cyan-500/30 border-cyan-400/60 text-cyan-50"
                : highlighted
                  ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-100"
                  : "bg-slate-900/85 border-slate-600/50 text-slate-300"
            }`}
          >
            {resolveText(concept.title, language)}
          </div>
        </Html>
      )}
    </group>
  );
}

export const ConceptNode = memo(ConceptNodeInner);
