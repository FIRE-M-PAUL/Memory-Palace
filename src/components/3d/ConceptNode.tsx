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
  selected: boolean;
  hovered: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
}

export function ConceptNode({
  concept,
  selected,
  hovered,
  onClick,
  onHover,
}: ConceptNodeProps) {
  const language = useAppStore((s) => s.language);
  const meshRef = useRef<THREE.Mesh>(null);
  const [pulse, setPulse] = useState(0);
  const color = getClusterColor(concept.cluster);
  const scale =
    concept.importance === "high" ? 0.35 : concept.importance === "medium" ? 0.28 : 0.22;
  const active = selected || hovered;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y =
        concept.position.y + Math.sin(state.clock.elapsedTime + concept.id.length) * 0.08;
      setPulse(Math.sin(state.clock.elapsedTime * 2) * 0.5 + 0.5);
    }
  });

  return (
    <group position={[concept.position.x, concept.position.y, concept.position.z]}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onHover(false);
          document.body.style.cursor = "auto";
        }}
        scale={active ? scale * 1.3 : scale}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active ? 1.2 + pulse * 0.3 : 0.6 + pulse * 0.2}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>
      {active && (
        <mesh scale={scale * 1.8}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.15} />
        </mesh>
      )}
      <Html
        position={[0, scale + 0.4, 0]}
        center
        distanceFactor={12}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <div
          className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap backdrop-blur-sm border transition-all ${
            active
              ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-100"
              : "bg-slate-900/80 border-slate-600/50 text-slate-300"
          }`}
        >
          {resolveText(concept.title, language)}
        </div>
      </Html>
    </group>
  );
}
