"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Float } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

const DEMO_NODES = [
  { pos: [-2, 1, -1] as [number, number, number], color: "#22d3ee" },
  { pos: [2, 0.5, 1] as [number, number, number], color: "#a78bfa" },
  { pos: [-1, -0.5, 2] as [number, number, number], color: "#3b82f6" },
  { pos: [1.5, 1.5, -2] as [number, number, number], color: "#f472b6" },
  { pos: [0, 2, 0] as [number, number, number], color: "#34d399" },
  { pos: [-2.5, 0, 1] as [number, number, number], color: "#fbbf24" },
];

function AnimatedNode({ pos, color }: { pos: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = pos[1] + Math.sin(state.clock.elapsedTime + pos[0]) * 0.1;
    }
  });
  return (
    <Float speed={2} floatIntensity={0.3}>
      <mesh ref={ref} position={pos}>
        <sphereGeometry args={[0.25, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </Float>
  );
}

function PreviewScene() {
  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#22d3ee" />
      <pointLight position={[-5, -3, -5]} intensity={0.5} color="#a78bfa" />
      <Stars radius={50} count={2000} factor={3} fade />
      <mesh>
        <icosahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial
          color="#a78bfa"
          emissive="#a78bfa"
          emissiveIntensity={1.5}
          wireframe
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2} />
      </mesh>
      {DEMO_NODES.map((node, i) => (
        <AnimatedNode key={i} pos={node.pos} color={node.color} />
      ))}
      <OrbitControls
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 1.5}
      />
    </>
  );
}

export default function HeroPreviewCanvas() {
  return (
    <div className="w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden border border-cyan-500/20 glow-cyan">
      <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
        <PreviewScene />
      </Canvas>
    </div>
  );
}
