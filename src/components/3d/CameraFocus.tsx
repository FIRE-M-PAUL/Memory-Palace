"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import type { PerformanceProfile } from "@/lib/performanceProfile";

interface CameraFocusProps {
  focusPosition: THREE.Vector3 | null;
  active: boolean;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  profile: PerformanceProfile;
  forceFocus?: boolean;
}

export function CameraFocus({
  focusPosition,
  active,
  controlsRef,
  profile,
  forceFocus = false,
}: CameraFocusProps) {
  const { camera } = useThree();
  const desiredCamera = useRef(new THREE.Vector3());
  const desiredTarget = useRef(new THREE.Vector3());
  const defaultCamera = useRef(
    new THREE.Vector3(
      profile.cameraDefault[0],
      profile.cameraDefault[1],
      profile.cameraDefault[2]
    )
  );

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    if ((active || forceFocus) && focusPosition) {
      desiredTarget.current.copy(focusPosition);
      const offset = profile.isMobile ? 1.8 : 1.2;
      const lift = profile.isMobile ? 1.8 : 2.2;
      const back = profile.isMobile ? 4.2 : 5.5;
      desiredCamera.current.set(
        focusPosition.x + offset,
        focusPosition.y + lift,
        focusPosition.z + back
      );
    } else {
      desiredTarget.current.set(0, 0, 0);
      desiredCamera.current.copy(defaultCamera.current);
    }

    const lerp = profile.isMobile ? 0.1 : 0.06;
    camera.position.lerp(desiredCamera.current, lerp);
    controls.target.lerp(desiredTarget.current, profile.isMobile ? 0.12 : 0.08);
    controls.update();
  });

  return null;
}
