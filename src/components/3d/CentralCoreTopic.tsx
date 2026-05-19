"use client";

import { memo } from "react";
import { Float, Html } from "@react-three/drei";
import type { PerformanceProfile } from "@/lib/performanceProfile";

interface CentralCoreTopicProps {
  title: string;
  pulse?: boolean;
  profile: PerformanceProfile;
}

function CentralCoreTopicInner({ title, pulse = true, profile }: CentralCoreTopicProps) {
  const label = title.length > 42 ? `${title.slice(0, 40)}…` : title;
  const segments = profile.sphereSegments;

  const core = (
    <group position={[0, 0, 0]}>
      <mesh frustumCulled>
        <icosahedronGeometry args={[0.75, 0]} />
        <meshStandardMaterial
          color="#a78bfa"
          emissive="#a78bfa"
          emissiveIntensity={pulse ? 1.5 : 1}
          metalness={0.85}
          roughness={0.15}
          wireframe
        />
      </mesh>
      <mesh frustumCulled>
        <sphereGeometry args={[0.45, segments, segments]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={1.8}
          transparent
          opacity={0.85}
        />
      </mesh>
      <Html position={[0, 1.1, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
        <div className="px-3 py-1.5 rounded-xl text-center text-xs sm:text-sm font-bold bg-violet-500/25 border border-violet-400/50 text-violet-100 backdrop-blur-md max-w-[200px]">
          {label}
        </div>
      </Html>
    </group>
  );

  if (!profile.enableNodeFloat) {
    return core;
  }

  return (
    <Float speed={0.8} rotationIntensity={0.08} floatIntensity={0.25}>
      {core}
    </Float>
  );
}

export const CentralCoreTopic = memo(CentralCoreTopicInner);
