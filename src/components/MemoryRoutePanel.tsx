"use client";

import { Route, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { KnowledgeRoom } from "@/types/memory-palace";
import { getClusterColor } from "@/types/memory-palace";
import { resolveText } from "@/lib/multilingual";
import { useAppStore } from "@/store/appStore";

interface MemoryRoutePanelProps {
  room: KnowledgeRoom;
  currentStep?: number;
  onStepClick?: (step: number) => void;
}

const STEP_LABELS = [
  "studyPathStart",
  "studyPathNext",
  "studyPathThen",
  "studyPathReview",
  "studyPathTest",
] as const;

export function MemoryRoutePanel({
  room,
  currentStep = 0,
  onStepClick,
}: MemoryRoutePanelProps) {
  const { language, t } = useAppStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Route className="h-5 w-5 text-cyan-400" />
        <h3 className="font-semibold text-slate-100">{t.studyPath}</h3>
      </div>
      <p className="text-sm text-slate-500">
        Follow these steps in order. Tap a step to see that idea on your map.
      </p>
      <div className="space-y-3">
        {room.memoryRoute.map((step, i) => {
          const concept = room.concepts.find((c) => c.id === step.conceptId);
          const isActive = i === currentStep;
          const stepLabelKey = STEP_LABELS[Math.min(i, STEP_LABELS.length - 1)];
          const stepLabel = t[stepLabelKey];

          return (
            <button
              key={step.step}
              type="button"
              onClick={() => onStepClick?.(i)}
              className={`w-full text-left glass rounded-xl p-4 border transition-all min-h-[44px] ${
                isActive ? "border-cyan-500/50 glow-cyan" : "border-transparent hover:border-slate-600"
              }`}
            >
              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-200 text-sm font-bold">
                  {step.step}
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-amber-400/90 mb-0.5">{stepLabel}</p>
                  <p className="font-medium text-slate-100">
                    {resolveText(step.title, language)}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    {resolveText(step.reason, language)}
                  </p>
                  {concept?.studyTip && (
                    <p className="flex items-start gap-1 text-xs text-slate-500 mt-2">
                      <Lightbulb className="h-3.5 w-3.5 shrink-0 text-amber-400/80 mt-0.5" />
                      {resolveText(concept.studyTip, language)}
                    </p>
                  )}
                  {concept && (
                    <Badge
                      variant="outline"
                      className="mt-2"
                      style={{ color: getClusterColor(concept.cluster) }}
                    >
                      {concept.cluster}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
