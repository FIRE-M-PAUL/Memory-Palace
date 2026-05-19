"use client";

import { Crosshair, Map, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/appStore";

interface MobileSceneToolbarProps {
  hasSelection: boolean;
  onResetView: () => void;
  onFocusSelected: () => void;
  onSwitch2d: () => void;
}

export function MobileSceneToolbar({
  hasSelection,
  onResetView,
  onFocusSelected,
  onSwitch2d,
}: MobileSceneToolbarProps) {
  const t = useAppStore((s) => s.t);

  return (
    <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap gap-2 justify-center pointer-events-none md:hidden">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="pointer-events-auto min-h-[44px] shadow-lg bg-slate-900/90 border border-slate-700"
        onClick={onResetView}
      >
        <RotateCcw className="h-4 w-4" />
        {t.resetView}
      </Button>
      {hasSelection && (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="pointer-events-auto min-h-[44px] shadow-lg bg-cyan-950/90 border border-cyan-500/40"
          onClick={onFocusSelected}
        >
          <Crosshair className="h-4 w-4" />
          {t.focusSelectedIdea}
        </Button>
      )}
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="pointer-events-auto min-h-[44px] shadow-lg bg-slate-900/90"
        onClick={onSwitch2d}
      >
        <Map className="h-4 w-4" />
        {t.switchTo2dShort}
      </Button>
    </div>
  );
}
