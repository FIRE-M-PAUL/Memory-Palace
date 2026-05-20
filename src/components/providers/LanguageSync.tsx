"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { clearRoomComputeCache } from "@/lib/roomComputeCache";
import { invalidatePerformanceProfileCache } from "@/lib/performanceProfile";

/** Keeps document language and caches aligned when the user switches locale */
export function LanguageSync() {
  const language = useAppStore((s) => s.language);

  useEffect(() => {
    document.documentElement.lang = language;
    clearRoomComputeCache();
    invalidatePerformanceProfileCache();
  }, [language]);

  return null;
}
