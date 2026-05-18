"use client";

import { useEffect, useState } from "react";
import { getProgress } from "@/lib/progressStorage";
import type { LearnerProgress } from "@/types/learning";
import { useAppStore } from "@/store/appStore";
import { Trophy, Target, AlertCircle } from "lucide-react";

const EMPTY_PROGRESS: LearnerProgress = {
  selectedLanguage: "en",
  completedTopics: [],
  weakConcepts: [],
  strongConcepts: [],
  quizScores: [],
  flashcardReviews: {},
};

export function ProgressSummary() {
  const t = useAppStore((s) => s.t);
  const [progress, setProgress] = useState<LearnerProgress>(EMPTY_PROGRESS);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <h3 className="font-semibold text-cyan-300 flex items-center gap-2">
        <Trophy className="h-5 w-5" />
        {t.progressSummary}
      </h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-slate-800/50 p-3">
          <p className="text-slate-500">{t.completed}</p>
          <p className="text-2xl font-bold text-emerald-400">{progress.completedTopics.length}</p>
        </div>
        <div className="rounded-xl bg-slate-800/50 p-3">
          <p className="text-slate-500">{t.score}</p>
          <p className="text-2xl font-bold text-cyan-400">{progress.quizScores.length}</p>
        </div>
      </div>
      {progress.weakConcepts.length > 0 && (
        <p className="text-xs text-amber-400 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {t.weakAreas}: {progress.weakConcepts.length}
        </p>
      )}
      {progress.strongConcepts.length > 0 && (
        <p className="text-xs text-emerald-400 flex items-center gap-1">
          <Target className="h-3 w-3" />
          {t.strongAreas}: {progress.strongConcepts.length}
        </p>
      )}
    </div>
  );
}
