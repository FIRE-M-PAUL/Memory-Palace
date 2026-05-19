"use client";

import { useEffect, useState } from "react";
import {
  getPerformanceProfile,
  invalidatePerformanceProfileCache,
  type ViewportTier,
} from "@/lib/performanceProfile";

export function useViewport() {
  const [tier, setTier] = useState<ViewportTier>("desktop");

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const next: ViewportTier =
        w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop";
      setTier((prev) => {
        if (prev !== next) invalidatePerformanceProfileCache();
        return next;
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const profile = getPerformanceProfile(tier);

  return {
    tier,
    isMobile: tier === "mobile",
    isTablet: tier === "tablet",
    isDesktop: tier === "desktop",
    profile,
  };
}
