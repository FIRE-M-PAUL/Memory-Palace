"use client";

import { Float, Html } from "@react-three/drei";

interface CentralCoreTopicProps {
  title: string;
  pulse?: boolean;
}

export function CentralCoreTopic({ title, pulse = true }: CentralCoreTopicProps) {
  const label = title.length > 42 ? `${title.slice(0, 40)}…` : title;

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
      <group position={[0, 0, 0]}>
        <mesh>
          <icosahedronGeometry args={[0.75, 1]} />
          <meshStandardMaterial
            color="#a78bfa"
            emissive="#a78bfa"
            emissiveIntensity={pulse ? 1.8 : 1.2}
            metalness={0.9}
            roughness={0.1}
            wireframe
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.45, 32, 32]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={2.2}
            transparent
            opacity={0.85}
          />
        </mesh>
        <Html position={[0, 1.15, 0]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div className="px-3 py-1.5 rounded-xl text-center text-xs sm:text-sm font-bold bg-violet-500/25 border border-violet-400/50 text-violet-100 backdrop-blur-md max-w-[200px] shadow-lg">
            {label}
          </div>
        </Html>
      </group>
    </Float>
  );
}
