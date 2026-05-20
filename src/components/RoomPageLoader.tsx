"use client";

import { useAppStore } from "@/store/appStore";

export function RoomPageLoader() {
  const t = useAppStore((s) => s.t);
  return (
    <div className="h-[55vh] rounded-2xl glass flex items-center justify-center">
      <p className="text-cyan-400 animate-pulse">{t.loading3d}</p>
    </div>
  );
}
