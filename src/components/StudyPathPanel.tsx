"use client";

import { MemoryRoutePanel } from "@/components/MemoryRoutePanel";
import type { KnowledgeRoom } from "@/types/memory-palace";
import { useAppStore } from "@/store/appStore";
import { Route } from "lucide-react";

interface StudyPathPanelProps {
  room: KnowledgeRoom;
  currentStep?: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

/** Step-by-step study path — guides the learner through ideas in order */
export function StudyPathPanel({
  room,
  currentStep = 0,
  onStepClick,
  className,
}: StudyPathPanelProps) {
  const t = useAppStore((s) => s.t);

  return (
    <aside
      className={`glass-strong rounded-2xl border border-cyan-500/10 p-4 flex flex-col max-h-[50vh] lg:max-h-none ${className ?? ""}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Route className="h-5 w-5 text-cyan-400" />
        <h3 className="font-semibold text-slate-100">{t.studyPath}</h3>
      </div>
      <p className="text-xs text-slate-500 mb-4">{t.studyPathPanelHelp}</p>
      <MemoryRoutePanel
        room={room}
        currentStep={currentStep}
        onStepClick={onStepClick}
      />
    </aside>
  );
}
