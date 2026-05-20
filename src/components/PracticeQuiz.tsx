"use client";

import { useState } from "react";
import type { KnowledgeRoom } from "@/types/memory-palace";
import type { DifficultyLevel } from "@/types/learning";
import { resolveText } from "@/lib/multilingual";
import { useAppStore } from "@/store/appStore";
import {
  checkMathAnswer,
  generateMathProblem,
  topicForDifficulty,
} from "@/lib/mathEngine";
import {
  recordQuizScore,
  updateConceptStrength,
} from "@/lib/progressStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MathProblemCard } from "@/components/MathProblemCard";

interface PracticeQuizProps {
  room: KnowledgeRoom;
  roomId: string;
}

const DEFAULT_DIFFICULTY: DifficultyLevel = "intermediate";

export function PracticeQuiz({ room, roomId }: PracticeQuizProps) {
  const { language, t, difficulty } = useAppStore();
  const activeDifficulty = difficulty ?? DEFAULT_DIFFICULTY;
  const questions = room.practiceQuestions;
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [mathMode, setMathMode] = useState(false);
  const [mathProblem, setMathProblem] = useState(() =>
    generateMathProblem(activeDifficulty, topicForDifficulty(activeDifficulty))
  );

  if (mathMode && mathProblem && room.subject === "mathematics") {
    return (
      <MathProblemCard
        problem={mathProblem}
        onNext={() =>
          setMathProblem(
            generateMathProblem(activeDifficulty, topicForDifficulty(activeDifficulty))
          )
        }
      />
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-slate-500">No practice questions in this room.</p>
        {room.subject === "mathematics" && (
          <Button onClick={() => setMathMode(true)}>Start Math Practice</Button>
        )}
      </div>
    );
  }

  if (done) {
    recordQuizScore(roomId, score, questions.length);
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-2xl font-bold gradient-text mb-2">
          {t.score}: {score}/{questions.length}
        </p>
        <Button className="mt-4" onClick={() => { setIndex(0); setScore(0); setDone(false); setFeedback(null); }}>
          {t.tryAgain}
        </Button>
      </div>
    );
  }

  const q = questions[index];

  const check = () => {
    let correct = false;
    if (q.type === "math-input") {
      correct = checkMathAnswer(
        {
          id: q.id,
          difficultyLevel: activeDifficulty,
          topic: topicForDifficulty(activeDifficulty),
          difficulty: q.difficulty,
          question: resolveText(q.question, language),
          answer: q.answer,
          hints: q.hints.map((h) => resolveText(h, language)),
          steps: [resolveText(q.explanation, language)],
        },
        answer
      );
    } else {
      correct = answer.trim().toLowerCase().includes(q.answer.toLowerCase());
    }
    setFeedback(correct ? "correct" : "incorrect");
    if (correct) {
      setScore((s) => s + 1);
      if (q.id.startsWith("q") || q.id.includes("concept")) {
        updateConceptStrength(q.id, true);
      }
    }
  };

  const activeHintIndex = hintsRevealed > 0 ? hintsRevealed - 1 : -1;
  const activeHintText =
    activeHintIndex >= 0 && q.hints[activeHintIndex]
      ? resolveText(q.hints[activeHintIndex], language)
      : null;
  const canRevealMoreHint = hintsRevealed < q.hints.length;

  return (
    <div className="glass rounded-2xl p-4 sm:p-6 space-y-4 max-w-xl mx-auto w-full min-w-0 overflow-hidden">
      <h2 className="text-lg font-semibold text-cyan-200">{t.practiceTime}</h2>
      <p className="text-xs sm:text-sm text-slate-500 break-words">
        Question {index + 1} / {questions.length} · {t.score}: {score}
      </p>
      <h3 className="text-base sm:text-lg font-medium text-slate-100 leading-snug break-words whitespace-normal">
        {resolveText(q.question, language)}
      </h3>
      {q.options && (
        <div className="space-y-2 min-w-0">
          {q.options.map((opt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setAnswer(resolveText(opt, language))}
              className="w-full max-w-full min-w-0 text-left glass rounded-xl p-3 hover:border-cyan-500/30 text-xs sm:text-sm break-words whitespace-normal"
            >
              {resolveText(opt, language)}
            </button>
          ))}
        </div>
      )}
      <Input
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder={t.practiceAnswerPlaceholder}
        disabled={feedback === "correct"}
        className="max-w-full"
      />
      {feedback && (
        <p
          className={`text-sm sm:text-base break-words ${
            feedback === "correct" ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {feedback === "correct" ? t.correct : t.incorrect}
        </p>
      )}
      {feedback && (
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed break-words whitespace-normal max-w-full">
          {resolveText(q.explanation, language)}
        </p>
      )}
      {!feedback && activeHintText && (
        <div
          className="w-full max-w-full min-w-0 overflow-hidden rounded-xl border border-cyan-500/25 bg-cyan-500/5 px-3 py-2.5 sm:px-4 sm:py-3"
          role="region"
          aria-label={t.hint}
        >
          <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-cyan-300/90 mb-1.5">
            {t.hint}
            {q.hints.length > 1 && (
              <span className="text-cyan-400/60 font-normal normal-case ml-1">
                ({hintsRevealed}/{q.hints.length})
              </span>
            )}
          </p>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed break-words whitespace-normal">
            {activeHintText}
          </p>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {!feedback && (
          <>
            <Button onClick={check}>{t.submit}</Button>
            {q.hints.length > 0 && (
              <Button
                variant="outline"
                disabled={!canRevealMoreHint}
                onClick={() => setHintsRevealed((h) => Math.min(h + 1, q.hints.length))}
              >
                {hintsRevealed === 0 ? t.hint : canRevealMoreHint ? t.nextHint : t.hint}
              </Button>
            )}
          </>
        )}
        {feedback && (
          <Button
            onClick={() => {
              if (index >= questions.length - 1) setDone(true);
              else {
                setIndex((i) => i + 1);
                setAnswer("");
                setFeedback(null);
                setHintsRevealed(0);
              }
            }}
          >
            {index >= questions.length - 1 ? t.finishLesson : t.next}
          </Button>
        )}
      </div>
      {room.subject === "mathematics" && (
        <Button variant="ghost" size="sm" onClick={() => setMathMode(true)}>
          Math practice
        </Button>
      )}
    </div>
  );
}
