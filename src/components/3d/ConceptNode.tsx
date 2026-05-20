"use client";

import { memo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { Concept } from "@/types/learning";
import { getClusterColor } from "@/types/memory-palace";
import { resolveText } from "@/lib/multilingual";
import { useAppStore } from "@/store/appStore";
import type { PerformanceProfile } from "@/lib/performanceProfile";

const DOUBLE_TAP_MS = 380;

interface ConceptNodeProps {
  concept: Concept;
  position: { x: number; y: number; z: number };
  selected: boolean;
  hovered: boolean;
  highlighted: boolean;
  dimmed: boolean;
  onSelect: () => void;
  onDive?: () => void;
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
  onSelect,
  onDive,
  onHover,
  profile,
}: ConceptNodeProps) {
  const language = useAppStore((s) => s.language);
  const t = useAppStore((s) => s.t);
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const lastTapRef = useRef(0);
  const touchPulse = useRef(0);
  const color = getClusterColor(concept.cluster);
  const segments = profile.sphereSegments;
  const baseScale =
    concept.importance === "high" ? 0.38 : concept.importance === "medium" ? 0.3 : 0.24;
  const scale = baseScale * profile.nodeScaleMultiplier;
  const active = selected || hovered || highlighted;
  const showLabel = profile.labelMode === "all" || (profile.isMobile ? selected : active);
  const hitScale = scale * profile.nodeHitScale;
  const mobileAlive = profile.isMobile && !profile.isReducedMotion;

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    const glow = glowRef.current;
    if (!mesh) return;

    touchPulse.current = THREE.MathUtils.damp(touchPulse.current, 0, 14, delta);

    const tClock = state.clock.elapsedTime;
    const phase = concept.id.length * 0.17;
    let floatAmp = 0;
    if (profile.enableNodeFloat && !profile.isReducedMotion) {
      if (profile.isMobile) {
        floatAmp = dimmed ? 0.01 : active || selected ? 0.03 : 0.018;
      } else {
        floatAmp = (active || selected) && !dimmed ? 0.035 : 0;
      }
    }
    mesh.position.y =
      floatAmp > 0 ? Math.sin(tClock * 0.52 + phase) * floatAmp : 0;
    if (glow && mobileAlive) {
      glow.position.y = mesh.position.y;
    }

    const pulseBoost = touchPulse.current * 0.14;
    const breath =
      mobileAlive || (!profile.isMobile && profile.enableNodeFloat && !profile.isReducedMotion)
        ? Math.sin(tClock * 1.25 + phase) * (dimmed ? 0.04 : 0.12)
        : 0;

    const targetScale =
      scale *
      (active ? (profile.isMobile ? 1.1 : 1.2) : 1) *
      (1 + pulseBoost + (selected ? (profile.isMobile ? 0.035 : 0.06) : 0) + (dimmed ? 0 : breath * 0.04));

    mesh.scale.setScalar(targetScale);

    if (glow && mobileAlive) {
      const glowPulse = 1 + Math.sin(tClock * 0.9 + phase) * 0.06 + touchPulse.current * 0.14;
      glow.scale.setScalar(targetScale * 1.3 * glowPulse);
    }
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!dimmed) touchPulse.current = 1;
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (dimmed) return;

    const now = Date.now();
    if (profile.mobileTouchSelectOnly && onDive) {
      if (now - lastTapRef.current < DOUBLE_TAP_MS) {
        onDive();
        lastTapRef.current = 0;
      } else {
        onSelect();
        lastTapRef.current = now;
      }
      return;
    }

    onSelect();
    onDive?.();
    lastTapRef.current = now;
  };

  const opacity = dimmed ? 0.12 : active ? 0.9 : 0.72;
  const emissiveBase = dimmed ? 0.1 : active ? 1 : 0.46;
  const emissive = emissiveBase + (mobileAlive && !dimmed ? 0.08 : 0);

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Large invisible hit target for touch */}
      <mesh
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOver={(e) => {
          if (dimmed) return;
          e.stopPropagation();
          onHover(true);
          if (!profile.isMobile) document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onHover(false);
          document.body.style.cursor = "auto";
        }}
        scale={hitScale}
        frustumCulled
      >
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {mobileAlive && !dimmed && (
        <mesh ref={glowRef} scale={scale * 1.24} frustumCulled>
          <sphereGeometry args={[1, Math.max(segments, 10), Math.max(segments, 10)]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.08}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      <mesh ref={meshRef} frustumCulled>
        <sphereGeometry args={[1, segments, segments]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissive}
          metalness={profile.isMobile ? 0.35 : 0.75}
          roughness={profile.isMobile ? 0.38 : 0.25}
          transparent={dimmed}
          opacity={opacity}
        />
      </mesh>

      {active && !dimmed && (
        <mesh scale={scale * (profile.isMobile ? 1.5 : 1.72)} frustumCulled renderOrder={-1}>
          <sphereGeometry args={[1, Math.min(segments + 4, 16), Math.min(segments + 4, 16)]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={profile.isMobile ? 0.12 : 0.12}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {showLabel && !dimmed && (
        <Html
          position={[0, scale + (profile.isMobile ? 0.42 : 0.4), 0]}
          center
          distanceFactor={profile.isMobile ? 12 : 14}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          <div
            className={`rounded-xl font-medium backdrop-blur-md border max-w-[min(92vw,200px)] text-center leading-snug ${
              profile.isMobile
                ? "px-2 py-1 text-[11px] max-w-[min(72vw,148px)]"
                : "px-2 py-1 text-xs whitespace-nowrap"
            } ${
              selected
                ? "bg-cyan-500/35 border-cyan-400/60 text-cyan-50 shadow-lg shadow-cyan-500/25"
                : highlighted
                  ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-100"
                  : "bg-slate-900/90 border-slate-600/50 text-slate-300"
            }`}
          >
            {resolveText(concept.title, language)}
            {profile.isMobile && selected && onDive && (
              <p className="text-[9px] text-cyan-200/75 mt-0.5 font-normal">
                {t.doubleTapExplore}
              </p>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

export const ConceptNode = memo(ConceptNodeInner);
