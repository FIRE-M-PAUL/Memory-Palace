/** Device-aware rendering limits — keeps visuals, reduces GPU load */

export type ViewportTier = "mobile" | "tablet" | "desktop";

export interface PerformanceProfile {
  viewport: ViewportTier;
  isMobile: boolean;
  isReducedMotion: boolean;
  maxMainIdeas: number;
  maxExpandedConcepts: number;
  maxRelationshipLines: number;
  sphereSegments: number;
  starCount: number;
  sparkleCount: number;
  enableSparkles: boolean;
  enableOrbitSpin: boolean;
  enableNodeFloat: boolean;
  enableInfiniteGrid: boolean;
  labelMode: "active-only" | "all";
  dpr: [number, number];
  floorSegments: number;
  ringScale: number;
  nodeHitScale: number;
  /** Scales concept sphere size */
  nodeScaleMultiplier: number;
  /** Central topic 3D scale */
  coreWireScale: number;
  coreInnerScale: number;
  coreLabelDistance: number;
  /** Lifts the whole learning cluster vertically in the scene */
  sceneLiftY: number;
  mobileTouchSelectOnly: boolean;
  cameraDefault: [number, number, number];
  cameraFov: number;
  orbitMinDistance: number;
  orbitMaxDistance: number;
  orbitMaxDistanceFocused: number;
  orbitDamping: number;
  rotateSpeed: number;
  enablePan: boolean;
  showPedestals: boolean;
  showDecorFloor: boolean;
  floorRadius: number;
  fogFar: number;
  /** Y rad/s for optional slow cluster orbit (Focus mode planets) */
  orbitRingSpeed: number;
}

let cachedProfile: PerformanceProfile | null = null;
let cacheKey = "";

function detectTier(): ViewportTier {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function detectReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function getPerformanceProfile(tier?: ViewportTier): PerformanceProfile {
  const resolved = tier ?? detectTier();
  const isReducedMotion = detectReducedMotion();
  const key = `${resolved}:${isReducedMotion}`;
  if (cachedProfile && cacheKey === key) return cachedProfile;

  cachedProfile = buildProfile(resolved, isReducedMotion);
  cacheKey = key;
  return cachedProfile;
}

function buildProfile(tier: ViewportTier, isReducedMotion: boolean): PerformanceProfile {
  const isMobile = tier === "mobile";

  if (isMobile) {
    return {
      viewport: "mobile",
      isMobile: true,
      isReducedMotion,
      maxMainIdeas: 4,
      maxExpandedConcepts: 4,
      maxRelationshipLines: 3,
      sphereSegments: 8,
      starCount: 72,
      sparkleCount: 28,
      enableSparkles: !isReducedMotion,
      enableOrbitSpin: !isReducedMotion,
      enableNodeFloat: !isReducedMotion,
      enableInfiniteGrid: false,
      labelMode: "active-only",
      dpr: [1, 1],
      floorSegments: 12,
      ringScale: 1.55,
      nodeHitScale: 2.2,
      nodeScaleMultiplier: 1.42,
      coreWireScale: 0.52,
      coreInnerScale: 0.3,
      coreLabelDistance: 16,
      sceneLiftY: 0.85,
      mobileTouchSelectOnly: true,
      cameraDefault: [0, 2.4, 8.2],
      cameraFov: 46,
      orbitMinDistance: 3.8,
      orbitMaxDistance: 12,
      orbitMaxDistanceFocused: 9.5,
      orbitDamping: 0.16,
      rotateSpeed: 0.38,
      enablePan: false,
      showPedestals: false,
      showDecorFloor: false,
      floorRadius: 4.5,
      fogFar: 22,
      orbitRingSpeed: !isReducedMotion ? 0.016 : 0,
    };
  }

  if (tier === "tablet") {
    return {
      viewport: "tablet",
      isMobile: false,
      isReducedMotion,
      maxMainIdeas: 6,
      maxExpandedConcepts: 6,
      maxRelationshipLines: 5,
      sphereSegments: 12,
      starCount: 100,
      sparkleCount: 0,
      enableSparkles: false,
      enableOrbitSpin: false,
      enableNodeFloat: !isReducedMotion,
      enableInfiniteGrid: false,
      labelMode: "active-only",
      dpr: [1, 1.25],
      floorSegments: 20,
      ringScale: 1.18,
      nodeHitScale: 1.4,
      nodeScaleMultiplier: 1.12,
      coreWireScale: 0.68,
      coreInnerScale: 0.4,
      coreLabelDistance: 13,
      sceneLiftY: 0.35,
      mobileTouchSelectOnly: false,
      cameraDefault: [0, 3.5, 10],
      cameraFov: 50,
      orbitMinDistance: 4.5,
      orbitMaxDistance: 16,
      orbitMaxDistanceFocused: 12,
      orbitDamping: 0.1,
      rotateSpeed: 0.6,
      enablePan: true,
      showPedestals: true,
      showDecorFloor: true,
      floorRadius: 7,
      fogFar: 26,
      orbitRingSpeed: !isReducedMotion ? 0.026 : 0,
    };
  }

  return {
    viewport: "desktop",
    isMobile: false,
    isReducedMotion,
    maxMainIdeas: 10,
    maxExpandedConcepts: 12,
    maxRelationshipLines: 10,
    sphereSegments: 14,
    starCount: 500,
    sparkleCount: 16,
    enableSparkles: !isReducedMotion,
    enableOrbitSpin: !isReducedMotion,
    enableNodeFloat: !isReducedMotion,
    enableInfiniteGrid: !isReducedMotion,
    labelMode: "active-only",
    dpr: [1, 1.5],
    floorSegments: 32,
    ringScale: 1,
    nodeHitScale: 1,
    nodeScaleMultiplier: 1,
    coreWireScale: 0.75,
    coreInnerScale: 0.45,
    coreLabelDistance: 12,
    sceneLiftY: 0,
    mobileTouchSelectOnly: false,
    cameraDefault: [0, 4, 11],
    cameraFov: 52,
    orbitMinDistance: 5,
    orbitMaxDistance: 20,
    orbitMaxDistanceFocused: 14,
    orbitDamping: 0.08,
    rotateSpeed: 1,
    enablePan: true,
    showPedestals: true,
    showDecorFloor: true,
    floorRadius: 9,
    fogFar: 30,
    orbitRingSpeed: !isReducedMotion ? 0.038 : 0,
  };
}

export function invalidatePerformanceProfileCache(): void {
  cachedProfile = null;
  cacheKey = "";
}
