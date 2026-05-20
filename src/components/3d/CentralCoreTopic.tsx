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
  const maxLen = profile.isMobile ? 28 : 42;
  const label = title.length > maxLen ? `${title.slice(0, maxLen - 1)}…` : title;
  const segments = profile.sphereSegments;

  const core = (
    <group position={[0, 0, 0]}>
      <mesh frustumCulled>
        <icosahedronGeometry args={[profile.coreWireScale, 0]} />
        <meshStandardMaterial
          color="#a78bfa"
          emissive="#a78bfa"
          emissiveIntensity={pulse ? (profile.isMobile ? 1.1 : 1.5) : 1}
          metalness={0.85}
          roughness={0.15}
          wireframe
        />
      </mesh>
      <mesh frustumCulled>
        <sphereGeometry args={[profile.coreInnerScale, segments, segments]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={profile.isMobile ? 1.4 : 1.8}
          transparent
          opacity={0.85}
        />
      </mesh>
      <Html
        position={[0, profile.coreInnerScale + (profile.isMobile ? 0.42 : 0.55), 0]}
        center
        distanceFactor={profile.coreLabelDistance}
        style={{ pointerEvents: "none" }}
      >
        <div
          className={`text-center font-semibold bg-violet-500/20 border border-violet-400/40 text-violet-100 backdrop-blur-md rounded-lg ${
            profile.isMobile
              ? "px-2 py-1 text-[10px] leading-tight max-w-[88px]"
              : "px-3 py-1.5 text-xs sm:text-sm font-bold max-w-[200px]"
          }`}
        >
          {label}
        </div>
      </Html>
    </group>
  );

  if (!profile.enableNodeFloat) {
    return core;
  }

  return (
    <Float
      speed={profile.isMobile ? 1.05 : 0.8}
      rotationIntensity={profile.isMobile ? 0.12 : 0.08}
      floatIntensity={profile.isMobile ? 0.32 : 0.25}
    >
      {core}
    </Float>
  );
}

export const CentralCoreTopic = memo(CentralCoreTopicInner);
