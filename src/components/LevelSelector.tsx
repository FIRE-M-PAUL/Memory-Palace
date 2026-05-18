"use client";

import { EDUCATION_LEVELS } from "@/types/curriculum";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";

export function LevelSelector({ className }: { className?: string }) {
  const level = useAppStore((s) => s.level);
  const setLevel = useAppStore((s) => s.setLevel);
  const t = useAppStore((s) => s.t);

  return (
    <select
      value={level ?? ""}
      onChange={(e) => e.target.value && setLevel(e.target.value as typeof level & string)}
      className={cn(
        "h-9 rounded-lg border border-cyan-500/20 bg-slate-900/80 px-3 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-400/40 outline-none",
        className
      )}
      aria-label="Select education level"
    >
      <option value="">{t.level}...</option>
      {EDUCATION_LEVELS.map((l) => (
        <option key={l} value={l}>
          {t.levels[l]}
        </option>
      ))}
    </select>
  );
}
