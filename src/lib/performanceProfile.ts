/** Device-aware rendering limits — keeps visuals, reduces GPU load */

export interface PerformanceProfile {
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
}

let cachedProfile: PerformanceProfile | null = null;
let cacheKey = "";

function detectMobile(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(max-width: 768px)").matches ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
  );
}

function detectReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function getPerformanceProfile(): PerformanceProfile {
  if (typeof window === "undefined") {
    return buildProfile(false, false);
  }

  const isMobile = detectMobile();
  const isReducedMotion = detectReducedMotion();
  const key = `${isMobile}:${isReducedMotion}`;
  if (cachedProfile && cacheKey === key) return cachedProfile;

  cachedProfile = buildProfile(isMobile, isReducedMotion);
  cacheKey = key;
  return cachedProfile;
}

function buildProfile(isMobile: boolean, isReducedMotion: boolean): PerformanceProfile {
  if (isMobile) {
    return {
      isMobile: true,
      isReducedMotion,
      maxMainIdeas: 8,
      maxExpandedConcepts: 10,
      maxRelationshipLines: 6,
      sphereSegments: 10,
      starCount: 180,
      sparkleCount: 0,
      enableSparkles: false,
      enableOrbitSpin: false,
      enableNodeFloat: false,
      enableInfiniteGrid: false,
      labelMode: "active-only",
      dpr: [1, 1.25],
      floorSegments: 24,
    };
  }

  return {
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
  };
}

export function invalidatePerformanceProfileCache(): void {
  cachedProfile = null;
  cacheKey = "";
}
