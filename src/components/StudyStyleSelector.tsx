"use client";

import { STUDY_STYLES } from "@/lib/difficulty";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";

export function StudyStyleSelector({ className }: { className?: string }) {
  const studyStyle = useAppStore((s) => s.studyStyle);
  const setStudyStyle = useAppStore((s) => s.setStudyStyle);
  const t = useAppStore((s) => s.t);

  return (
    <select
      value={studyStyle ?? ""}
      onChange={(e) =>
        e.target.value && setStudyStyle(e.target.value as typeof studyStyle & string)
      }
      className={cn(
        "h-9 rounded-lg border border-cyan-500/20 bg-slate-900/80 px-3 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-400/40 outline-none",
        className
      )}
      aria-label={t.selectStudyStyle}
    >
      <option value="">{t.selectStudyStyle}...</option>
      {STUDY_STYLES.map((s) => (
        <option key={s} value={s}>
          {t.studyStyles[s]}
        </option>
      ))}
    </select>
  );
}
