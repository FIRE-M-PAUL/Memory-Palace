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
  /** Full-page layout (no height cap) for /room/[id]/path */
  variant?: "sidebar" | "page";
}

/** Step-by-step study path — guides the learner through ideas in order */
export function StudyPathPanel({
  room,
  currentStep = 0,
  onStepClick,
  className,
  variant = "sidebar",
}: StudyPathPanelProps) {
  const t = useAppStore((s) => s.t);
  const isPage = variant === "page";

  return (
    <aside
      className={`glass-strong rounded-2xl border border-cyan-500/10 p-4 flex flex-col ${
        isPage ? "" : "max-h-[50vh] lg:max-h-none"
      } ${className ?? ""}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Route className="h-5 w-5 text-cyan-400" />
        <h3 className="font-semibold text-slate-100">{t.studyPath}</h3>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        {isPage ? t.studyPathPageHelp : t.studyPathPanelHelp}
      </p>
      <MemoryRoutePanel
        room={room}
        currentStep={currentStep}
        onStepClick={onStepClick}
        showMapHint={!isPage}
      />
    </aside>
  );
}
