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
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [showSteps, setShowSteps] = useState(false);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);

  const hintText =
    hintsRevealed > 0 ? getMathHint(problem, hintsRevealed - 1) : null;
  const canRevealMoreHint = hintsRevealed < problem.hints.length;

  return (
    <div className="glass rounded-2xl p-4 sm:p-6 space-y-4 max-w-xl mx-auto w-full min-w-0 overflow-hidden border border-amber-500/20">
      <p className="text-xs text-amber-400 uppercase tracking-wider">{t.features.math}</p>
      <h3 className="text-lg sm:text-xl font-semibold text-slate-100 leading-snug break-words whitespace-normal">
        {problem.question}
      </h3>
      <Input
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder={t.mathEnterAnswer}
        className="max-w-full"
      />
      {result && (
        <p
          className={`text-sm sm:text-base break-words ${
            result === "correct" ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {result === "correct" ? t.correct : t.incorrect}
        </p>
      )}
      {showSteps && (
        <ol className="list-decimal list-inside text-xs sm:text-sm text-slate-400 space-y-1.5 min-w-0 max-w-full break-words">
          {getStepByStepSolution(problem).map((s, i) => (
            <li key={i} className="break-words whitespace-normal leading-relaxed">
              {s}
            </li>
          ))}
        </ol>
      )}
      {!result && hintText && (
        <div className="w-full max-w-full min-w-0 overflow-hidden rounded-xl border border-amber-500/25 bg-amber-500/5 px-3 py-2.5 sm:px-4 sm:py-3">
          <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-amber-300/90 mb-1.5">
            {t.hint}
          </p>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed break-words whitespace-normal">
            {hintText}
          </p>
        </div>
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
        <Button
          variant="outline"
          disabled={!canRevealMoreHint}
          onClick={() => setHintsRevealed((h) => Math.min(h + 1, problem.hints.length))}
        >
          {hintsRevealed === 0 ? t.hint : canRevealMoreHint ? t.nextHint : t.hint}
        </Button>
        <Button variant="ghost" onClick={() => setShowSteps(true)}>
          {t.explanation}
        </Button>
        {result && <Button onClick={onNext}>{t.next}</Button>}
      </div>
    </div>
  );
}
