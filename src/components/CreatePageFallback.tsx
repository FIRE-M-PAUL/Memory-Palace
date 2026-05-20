"use client";

import { useAppStore } from "@/store/appStore";

export function CreatePageFallback() {
  const t = useAppStore((s) => s.t);
  return (
    <div className="min-h-screen pt-24 text-center text-slate-500">{t.loading}</div>
  );
}
