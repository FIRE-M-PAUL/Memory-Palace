"use client";

import { memo } from "react";
import { ChevronRight, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LayerStack } from "@/types/nested-worlds";
import { useAppStore } from "@/store/appStore";
import { useViewport } from "@/hooks/useViewport";
import { cn } from "@/lib/utils";

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
  const { isMobile } = useViewport();

  if (stack.length === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full border border-cyan-400/15 bg-slate-950/50 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-md",
        isMobile ? "px-2.5 py-1.5 overflow-x-auto scrollbar-none" : "flex-wrap px-3 py-2 gap-2 rounded-xl"
      )}
    >
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className={cn(
          "shrink-0 text-cyan-300",
          isMobile ? "h-9 w-9" : "h-10 min-h-[44px] w-auto px-2 gap-1"
        )}
        onClick={onRoot}
        disabled={stack.length <= 1}
        aria-label={t.backToMainTopic}
      >
        <Home className="h-4 w-4" />
        {!isMobile && <span>{t.backToMainTopic}</span>}
      </Button>
      {canGoBack && (
        <Button
          type="button"
          size="icon"
          variant="outline"
          className={cn("shrink-0", isMobile ? "h-9 w-9" : "h-10 min-h-[44px] w-auto px-2 gap-1")}
          onClick={onBack}
          aria-label={t.previousLayer}
        >
          <ArrowLeft className="h-4 w-4" />
          {!isMobile && t.previousLayer}
        </Button>
      )}
      <nav
        className={cn(
          "flex items-center gap-0.5 min-w-0 flex-1",
          isMobile ? "text-[11px]" : "text-xs sm:text-sm flex-wrap"
        )}
        aria-label={t.learningLayerNav}
      >
        {stack.map((frame, index) => {
          const isLast = index === stack.length - 1;
          return (
            <span
              key={`${frame.focusConceptId ?? "root"}-${index}`}
              className="flex items-center gap-0.5 min-w-0 shrink-0"
            >
              {index > 0 && (
                <ChevronRight className="h-3 w-3 text-slate-600 shrink-0" />
              )}
              <button
                type="button"
                disabled={isLast}
                onClick={() => onNavigate(index)}
                className={cn(
                  "truncate rounded px-1 py-0.5 transition-colors touch-manipulation",
                  isMobile ? "max-w-[72px]" : "max-w-[140px] sm:max-w-[200px]",
                  isLast
                    ? "text-cyan-200 font-medium cursor-default"
                    : "text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                )}
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
