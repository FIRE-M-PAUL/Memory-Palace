"use client";

import { useRef, useEffect } from "react";
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
  const persp = camera instanceof THREE.PerspectiveCamera ? camera : null;
  const desiredCamera = useRef(new THREE.Vector3());
  const desiredTarget = useRef(new THREE.Vector3());
  const restTarget = useRef(new THREE.Vector3());
  const defaultCamera = useRef(
    new THREE.Vector3(
      profile.cameraDefault[0],
      profile.cameraDefault[1],
      profile.cameraDefault[2]
    )
  );
  const idlePhase = useRef(0);
  const baseFov = useRef(profile.cameraFov);

  useEffect(() => {
    defaultCamera.current.set(
      profile.cameraDefault[0],
      profile.cameraDefault[1],
      profile.cameraDefault[2]
    );
    baseFov.current = profile.cameraFov;
    if (persp) persp.fov = profile.cameraFov;
  }, [profile.cameraDefault, profile.cameraFov, persp]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    const baseY = profile.sceneLiftY * 0.35;
    const baseTarget = restTarget.current.set(0, baseY, 0);
    const focusing = (active || forceFocus) && !!focusPosition;

    if (focusing && focusPosition) {
      desiredTarget.current.copy(focusPosition);
      const offset = profile.isMobile ? 1.2 : 1.2;
      const lift = profile.isMobile ? 1.35 : 2.2;
      const back = profile.isMobile ? 4.65 : 5.5;
      desiredCamera.current.set(
        focusPosition.x + offset,
        focusPosition.y + lift,
        focusPosition.z + back
      );

      const arrive = profile.isMobile ? 9.5 : 7.2;
      camera.position.x = THREE.MathUtils.damp(
        camera.position.x,
        desiredCamera.current.x,
        arrive,
        delta
      );
      camera.position.y = THREE.MathUtils.damp(
        camera.position.y,
        desiredCamera.current.y,
        arrive,
        delta
      );
      camera.position.z = THREE.MathUtils.damp(
        camera.position.z,
        desiredCamera.current.z,
        arrive,
        delta
      );

      const tgtLambda = profile.isMobile ? 11 : 8;
      controls.target.x = THREE.MathUtils.damp(
        controls.target.x,
        desiredTarget.current.x,
        tgtLambda,
        delta
      );
      controls.target.y = THREE.MathUtils.damp(
        controls.target.y,
        desiredTarget.current.y,
        tgtLambda,
        delta
      );
      controls.target.z = THREE.MathUtils.damp(
        controls.target.z,
        desiredTarget.current.z,
        tgtLambda,
        delta
      );

      if (persp && !profile.isReducedMotion) {
        const narrow = profile.isMobile ? 47 : profile.cameraFov - 1;
        persp.fov = THREE.MathUtils.damp(persp.fov, narrow, 6, delta);
        persp.updateProjectionMatrix();
      }
    } else {
      if (profile.isMobile && !profile.isReducedMotion) {
        idlePhase.current += delta * 0.042;
        const R = Math.max(
          Math.hypot(profile.cameraDefault[0], profile.cameraDefault[2]),
          7.2
        );
        const bob = Math.sin(idlePhase.current * 2.15) * 0.22;
        desiredCamera.current.set(
          Math.sin(idlePhase.current) * R * 0.84,
          profile.cameraDefault[1] + bob * 0.72,
          Math.cos(idlePhase.current) * R * 0.88
        );
        desiredTarget.current.copy(baseTarget);
      } else {
        desiredCamera.current.copy(defaultCamera.current);
        desiredTarget.current.copy(baseTarget);
      }

      const wanderLambda = profile.isMobile ? 3.1 : 2.4;
      camera.position.x = THREE.MathUtils.damp(
        camera.position.x,
        desiredCamera.current.x,
        wanderLambda,
        delta
      );
      camera.position.y = THREE.MathUtils.damp(
        camera.position.y,
        desiredCamera.current.y,
        wanderLambda,
        delta
      );
      camera.position.z = THREE.MathUtils.damp(
        camera.position.z,
        desiredCamera.current.z,
        wanderLambda,
        delta
      );

      const tg = profile.isMobile ? 3.6 : 2.8;
      controls.target.x = THREE.MathUtils.damp(controls.target.x, baseTarget.x, tg, delta);
      controls.target.y = THREE.MathUtils.damp(controls.target.y, baseTarget.y, tg, delta);
      controls.target.z = THREE.MathUtils.damp(controls.target.z, baseTarget.z, tg, delta);

      if (persp && !profile.isReducedMotion) {
        persp.fov = THREE.MathUtils.damp(persp.fov, baseFov.current, 4.5, delta);
        persp.updateProjectionMatrix();
      }
    }

    controls.update();
  });

  return null;
}
