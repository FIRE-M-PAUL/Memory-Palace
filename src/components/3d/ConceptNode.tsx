"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { Concept } from "@/types/learning";
import { getClusterColor } from "@/types/memory-palace";
import { resolveText } from "@/lib/multilingual";
import { useAppStore } from "@/store/appStore";

interface ConceptNodeProps {
  concept: Concept;
  position: { x: number; y: number; z: number };
  selected: boolean;
  hovered: boolean;
  highlighted: boolean;
  dimmed: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
}

export function ConceptNode({
  concept,
  position,
  selected,
  hovered,
  highlighted,
  dimmed,
  onClick,
  onHover,
}: ConceptNodeProps) {
  const language = useAppStore((s) => s.language);
  const meshRef = useRef<THREE.Mesh>(null);
  const [pulse, setPulse] = useState(0);
  const color = getClusterColor(concept.cluster);
  const scale =
    concept.importance === "high" ? 0.38 : concept.importance === "medium" ? 0.3 : 0.24;
  const active = selected || hovered || highlighted;

  useFrame((state) => {
    if (meshRef.current && !dimmed) {
      meshRef.current.position.y =
        position.y + Math.sin(state.clock.elapsedTime + concept.id.length) * 0.06;
      setPulse(Math.sin(state.clock.elapsedTime * 2) * 0.5 + 0.5);
    }
  });

  const opacity = dimmed ? 0.12 : active ? 0.95 : 0.75;
  const emissive = dimmed ? 0.1 : active ? 1.2 + pulse * 0.3 : 0.55;

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
        scale={active ? scale * 1.35 : scale}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissive}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={opacity}
        />
      </mesh>
      {active && !dimmed && (
        <mesh scale={scale * 1.9}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.18} />
        </mesh>
      )}
      {!dimmed && (
        <Html
          position={[0, scale + 0.45, 0]}
          center
          distanceFactor={12}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          <div
            className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap backdrop-blur-sm border transition-all ${
              selected
                ? "bg-cyan-500/30 border-cyan-400/60 text-cyan-50 shadow-[0_0_12px_rgba(34,211,238,0.4)]"
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
