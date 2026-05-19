"use client";

import { memo, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

interface InstancedPedestalsProps {
  positions: { x: number; y: number; z: number }[];
}

const dummy = new THREE.Object3D();

export const InstancedPedestals = memo(function InstancedPedestals({
  positions,
}: InstancedPedestalsProps) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(
    () => new THREE.CylinderGeometry(0.35, 0.45, 0.5, 8),
    []
  );
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1e293b",
        emissive: "#334155",
        emissiveIntensity: 0.25,
        metalness: 0.5,
        roughness: 0.8,
      }),
    []
  );

  useLayoutEffect(() => {
    if (!ref.current) return;
    positions.forEach((p, i) => {
      dummy.position.set(p.x, p.y - 0.35, p.z);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [positions]);

  useLayoutEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  if (positions.length === 0) return null;

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, positions.length]}
      frustumCulled
    />
  );
});
