"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Brain, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/appStore";
import { DocumentProcessingSummary } from "@/components/DocumentProcessingSummary";
import type { DocumentProcessingSummary as ProcessingSummary } from "@/types/document-processing";

interface ProcessingLoaderProps {
  active?: boolean;
  summary?: ProcessingSummary | null;
}

export function ProcessingLoader({ active = true, summary = null }: ProcessingLoaderProps) {
  const t = useAppStore((s) => s.t);
  const STEPS = [
    { id: 1, label: t.readingContent },
    { id: 2, label: t.cleaningDocument },
    { id: 3, label: t.detectingContent },
    { id: 4, label: t.chunkingContent },
    { id: 5, label: t.extractingConcepts },
    { id: 6, label: t.buildingGraph },
    { id: 7, label: t.creatingRoom },
    { id: 8, label: t.preparingStudy },
  ];
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) return;
    const stepInterval = setInterval(() => {
      setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 900);
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 4, 95));
    }, 200);
    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [active, STEPS.length]);

  return (
    <div className="glass-strong rounded-2xl p-8 max-w-lg mx-auto text-center">
      <div className="relative mx-auto mb-6 h-20 w-20">
        <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full glass glow-cyan">
          <Brain className="h-10 w-10 text-cyan-400 animate-pulse" />
        </div>
      </div>
      <h3 className="text-xl font-semibold gradient-text mb-2">{t.processing}</h3>
      <p className="text-slate-400 text-sm mb-6">
        We are turning your notes into an easy study map
      </p>
      <Progress value={progress} className="mb-6" />
      <ul className="space-y-3 text-left">
        {STEPS.map((step, i) => {
          const done = i < currentStep;
          const current = i === currentStep;
          return (
            <li
              key={step.id}
              className={cn(
                "flex items-center gap-3 text-sm transition-colors",
                done && "text-cyan-300",
                current && "text-slate-200",
                !done && !current && "text-slate-600"
              )}
            >
              {done ? (
                <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
              ) : current ? (
                <Loader2 className="h-4 w-4 text-cyan-400 animate-spin shrink-0" />
              ) : (
                <div className="h-4 w-4 rounded-full border border-slate-600 shrink-0" />
              )}
              {step.label}
            </li>
          );
        })}
      </ul>
      {summary && <DocumentProcessingSummary summary={summary} />}
    </div>
  );
}
