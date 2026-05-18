"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";

interface CameraFocusProps {
  focusPosition: THREE.Vector3 | null;
  active: boolean;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

const DEFAULT_CAMERA = new THREE.Vector3(0, 4, 12);
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);

export function CameraFocus({ focusPosition, active, controlsRef }: CameraFocusProps) {
  const { camera } = useThree();
  const desiredCamera = useRef(new THREE.Vector3());
  const desiredTarget = useRef(new THREE.Vector3());

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (active && focusPosition) {
      desiredTarget.current.copy(focusPosition);
      desiredCamera.current.set(
        focusPosition.x + 1.2,
        focusPosition.y + 2.2,
        focusPosition.z + 5.5
      );
    } else {
      desiredTarget.current.copy(DEFAULT_TARGET);
      desiredCamera.current.copy(DEFAULT_CAMERA);
    }

    camera.position.lerp(desiredCamera.current, 0.06);
    controls.target.lerp(desiredTarget.current, 0.08);
    controls.update();
  });

  return null;
}
