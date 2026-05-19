"use client";

import { DIFFICULTY_LEVELS } from "@/types/curriculum";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";

export function DifficultySelector({ className }: { className?: string }) {
  const difficulty = useAppStore((s) => s.difficulty);
  const setDifficulty = useAppStore((s) => s.setDifficulty);
  const t = useAppStore((s) => s.t);

  return (
    <select
      value={difficulty ?? ""}
      onChange={(e) =>
        e.target.value && setDifficulty(e.target.value as typeof difficulty & string)
      }
      className={cn(
        "h-9 rounded-lg border border-cyan-500/20 bg-slate-900/80 px-3 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-400/40 outline-none",
        className
      )}
      aria-label={t.selectDifficulty}
    >
      <option value="">{t.selectDifficulty}...</option>
      {DIFFICULTY_LEVELS.map((d) => (
        <option key={d} value={d}>
          {t.difficulties[d]}
        </option>
      ))}
    </select>
  );
}
