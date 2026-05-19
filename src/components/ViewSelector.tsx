"use client";

import { memo } from "react";
import { Focus, Compass, Sparkles, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { LEARNING_VIEW_MODES, type LearningViewMode } from "@/types/learning-views";
import { useAppStore } from "@/store/appStore";

const VIEW_ICONS: Record<LearningViewMode, typeof Focus> = {
  focus: Focus,
  explore: Compass,
  creative: Sparkles,
  room: LayoutGrid,
};

interface ViewSelectorProps {
  value: LearningViewMode;
  onChange: (view: LearningViewMode) => void;
  className?: string;
  compact?: boolean;
}

export const ViewSelector = memo(function ViewSelector({
  value,
  onChange,
  className,
  compact,
}: ViewSelectorProps) {
  const t = useAppStore((s) => s.t);

  if (compact) {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as LearningViewMode)}
        className={cn(
          "h-9 rounded-lg border border-cyan-500/20 bg-slate-900/80 px-3 text-sm text-slate-200",
          className
        )}
        aria-label={t.learningViewLabel}
      >
        {LEARNING_VIEW_MODES.map((mode) => (
          <option key={mode} value={mode}>
            {t.learningViews[mode]}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap gap-1 rounded-xl border border-slate-700/80 bg-slate-950/60 p-1",
        className
      )}
      role="tablist"
      aria-label={t.learningViewLabel}
    >
      {LEARNING_VIEW_MODES.map((mode) => {
        const Icon = VIEW_ICONS[mode];
        const active = value === mode;
        return (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(mode)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs sm:text-sm font-medium transition-all min-h-[40px]",
              active
                ? "bg-cyan-500/20 text-cyan-100 border border-cyan-500/40 shadow-[0_0_12px_rgba(34,211,238,0.15)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{t.learningViews[mode]}</span>
          </button>
        );
      })}
    </div>
  );
});
