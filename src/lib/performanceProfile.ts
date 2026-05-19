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
  /** Wider orbit ring spacing multiplier */
  ringScale: number;
  /** Invisible touch hit area multiplier */
  nodeHitScale: number;
  /** Single tap selects only; double tap dives (mobile) */
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
  creativeRadius: number;
  roomRadius: number;
  fogFar: number;
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
  const isTablet = tier === "tablet";

  if (isMobile) {
    return {
      viewport: "mobile",
      isMobile: true,
      isReducedMotion,
      maxMainIdeas: 5,
      maxExpandedConcepts: 5,
      maxRelationshipLines: 4,
      sphereSegments: 8,
      starCount: 60,
      sparkleCount: 0,
      enableSparkles: false,
      enableOrbitSpin: false,
      enableNodeFloat: false,
      enableInfiniteGrid: false,
      labelMode: "active-only",
      dpr: [1, 1],
      floorSegments: 16,
      ringScale: 1.28,
      nodeHitScale: 1.85,
      mobileTouchSelectOnly: true,
      cameraDefault: [0, 3.2, 9.5],
      cameraFov: 48,
      orbitMinDistance: 4,
      orbitMaxDistance: 14,
      orbitMaxDistanceFocused: 11,
      orbitDamping: 0.14,
      rotateSpeed: 0.45,
      enablePan: false,
      showPedestals: false,
      showDecorFloor: false,
      floorRadius: 5.5,
      creativeRadius: 5.2,
      roomRadius: 4.8,
      fogFar: 22,
    };
  }

  if (isTablet) {
    return {
      viewport: "tablet",
      isMobile: false,
      isReducedMotion,
      maxMainIdeas: 7,
      maxExpandedConcepts: 7,
      maxRelationshipLines: 6,
      sphereSegments: 12,
      starCount: 120,
      sparkleCount: 0,
      enableSparkles: false,
      enableOrbitSpin: false,
      enableNodeFloat: !isReducedMotion,
      enableInfiniteGrid: false,
      labelMode: "active-only",
      dpr: [1, 1.25],
      floorSegments: 24,
      ringScale: 1.12,
      nodeHitScale: 1.35,
      mobileTouchSelectOnly: false,
      cameraDefault: [0, 3.8, 10.5],
      cameraFov: 50,
      orbitMinDistance: 4.5,
      orbitMaxDistance: 17,
      orbitMaxDistanceFocused: 13,
      orbitDamping: 0.1,
      rotateSpeed: 0.65,
      enablePan: true,
      showPedestals: true,
      showDecorFloor: true,
      floorRadius: 7.5,
      creativeRadius: 5.8,
      roomRadius: 5.2,
      fogFar: 28,
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
    creativeRadius: 6.2,
    roomRadius: 5.5,
    fogFar: 30,
  };
}

export function invalidatePerformanceProfileCache(): void {
  cachedProfile = null;
  cacheKey = "";
}
