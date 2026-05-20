"use client";

import { Crosshair, Layers, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/appStore";

interface MobileControlsProps {
  hasSelection: boolean;
  onResetView: () => void;
  onFocusSelected: () => void;
  onSwitch2d: () => void;
  className?: string;
}

const fabBtn =
  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border backdrop-blur-xl touch-manipulation " +
  "border-cyan-400/25 bg-slate-950/80 text-cyan-100 shadow-[0_8px_28px_rgba(0,0,0,0.5)] " +
  "active:scale-[0.94] transition-transform hover:border-cyan-300/35";

export function MobileControls({
  hasSelection,
  onResetView,
  onFocusSelected,
  onSwitch2d,
  className,
}: MobileControlsProps) {
  const t = useAppStore((s) => s.t);

  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 right-0 z-20 flex items-end justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none md:hidden",
        className
      )}
    >
      <div className="pointer-events-auto mb-2 flex items-center gap-3 rounded-full border border-cyan-500/15 bg-slate-950/55 backdrop-blur-2xl px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
        <button
          type="button"
          onClick={onResetView}
          className={fabBtn}
          aria-label={t.resetView}
          title={t.resetView}
        >
          <RotateCcw className="h-[18px] w-[18px] text-cyan-300" />
        </button>
        {hasSelection && (
          <button
            type="button"
            onClick={onFocusSelected}
            className={cn(
              fabBtn,
              "border-fuchsia-400/30 bg-gradient-to-br from-cyan-500/20 to-violet-600/20 text-cyan-50 ring-1 ring-cyan-400/20"
            )}
            aria-label={t.focusSelectedIdea}
            title={t.focusSelectedIdea}
          >
            <Crosshair className="h-[18px] w-[18px]" />
          </button>
        )}
        <button
          type="button"
          onClick={onSwitch2d}
          className={fabBtn}
          aria-label={t.switchTo2dShort}
          title={t.switchTo2dShort}
        >
          <Layers className="h-[18px] w-[18px] text-violet-300" />
        </button>
      </div>
    </div>
  );
}
