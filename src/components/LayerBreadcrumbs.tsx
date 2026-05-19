"use client";

import { memo } from "react";
import { ChevronRight, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LayerStack } from "@/types/nested-worlds";
import { useAppStore } from "@/store/appStore";

interface LayerBreadcrumbsProps {
  stack: LayerStack;
  onNavigate: (index: number) => void;
  onBack: () => void;
  onRoot: () => void;
  canGoBack: boolean;
}

export const LayerBreadcrumbs = memo(function LayerBreadcrumbs({
  stack,
  onNavigate,
  onBack,
  onRoot,
  canGoBack,
}: LayerBreadcrumbsProps) {
  const t = useAppStore((s) => s.t);

  if (stack.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-cyan-500/15 bg-slate-950/60 px-3 py-2">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-8 gap-1 text-cyan-300"
        onClick={onRoot}
        disabled={stack.length <= 1}
      >
        <Home className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{t.backToMainTopic}</span>
      </Button>
      {canGoBack && (
        <Button type="button" size="sm" variant="outline" className="h-8 gap-1" onClick={onBack}>
          <ArrowLeft className="h-3.5 w-3.5" />
          {t.previousLayer}
        </Button>
      )}
      <nav
        className="flex flex-wrap items-center gap-1 text-xs sm:text-sm min-w-0"
        aria-label={t.learningLayerNav}
      >
        {stack.map((frame, index) => {
          const isLast = index === stack.length - 1;
          return (
            <span key={`${frame.focusConceptId ?? "root"}-${index}`} className="flex items-center gap-1 min-w-0">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />}
              <button
                type="button"
                disabled={isLast}
                onClick={() => onNavigate(index)}
                className={`truncate max-w-[140px] sm:max-w-[200px] rounded px-1.5 py-0.5 transition-colors ${
                  isLast
                    ? "text-cyan-200 font-medium cursor-default"
                    : "text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                }`}
              >
                {frame.title}
              </button>
            </span>
          );
        })}
      </nav>
    </div>
  );
});
