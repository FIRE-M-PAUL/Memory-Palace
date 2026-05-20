"use client";

import { useAppStore } from "@/store/appStore";

export function HeroPreviewLoading() {
  const t = useAppStore((s) => s.t);
  return (
    <div className="w-full h-[400px] md:h-[500px] rounded-3xl glass flex items-center justify-center">
      <div className="text-cyan-400 animate-pulse">{t.loading3dPreview}</div>
    </div>
  );
}
