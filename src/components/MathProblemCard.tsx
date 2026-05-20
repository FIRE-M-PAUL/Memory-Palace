"use client";

import { useState } from "react";
import type { MathProblem } from "@/lib/mathEngine";
import { checkMathAnswer, getMathHint, getStepByStepSolution } from "@/lib/mathEngine";
import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MathProblemCardProps {
  problem: MathProblem;
  onNext: () => void;
}

export function MathProblemCard({ problem, onNext }: MathProblemCardProps) {
  const t = useAppStore((s) => s.t);
  const [answer, setAnswer] = useState("");
  const [hintIdx, setHintIdx] = useState(0);
  const [showSteps, setShowSteps] = useState(false);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);

  return (
    <div className="glass rounded-2xl p-6 space-y-4 max-w-xl mx-auto border border-amber-500/20">
      <p className="text-xs text-amber-400 uppercase tracking-wider">{t.features.math}</p>
      <h3 className="text-xl font-semibold text-slate-100">{problem.question}</h3>
      <Input
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder={t.mathEnterAnswer}
      />
      {result && (
        <p className={result === "correct" ? "text-emerald-400" : "text-red-400"}>
          {result === "correct" ? t.correct : t.incorrect}
        </p>
      )}
      {showSteps && (
        <ol className="list-decimal list-inside text-sm text-slate-400 space-y-1">
          {getStepByStepSolution(problem).map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            const ok = checkMathAnswer(problem, answer);
            setResult(ok ? "correct" : "incorrect");
          }}
        >
          {t.submit}
        </Button>
        <Button variant="outline" onClick={() => setHintIdx((h) => h + 1)}>
          {t.hint}: {getMathHint(problem, hintIdx)}
        </Button>
        <Button variant="ghost" onClick={() => setShowSteps(true)}>
          {t.explanation}
        </Button>
        {result && <Button onClick={onNext}>{t.next}</Button>}
      </div>
    </div>
  );
}
