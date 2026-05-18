"use client";

import { useState } from "react";
import type { Flashcard } from "@/types/learning";
import { resolveText } from "@/lib/multilingual";
import { setFlashcardReview } from "@/lib/progressStorage";
import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FlashcardDeckProps {
  cards: Flashcard[];
}

export function FlashcardDeck({ cards }: FlashcardDeckProps) {
  const { language, t } = useAppStore();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (cards.length === 0) {
    return <p className="text-slate-500 text-center py-8">No flashcards available.</p>;
  }

  const card = cards[index];

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => {
          setFlipped(!flipped);
        }}
        className="w-full min-h-[180px] glass-strong rounded-2xl p-8 text-center hover:border-cyan-500/30 transition-all"
      >
        <p className="text-xs text-cyan-400 mb-3">
          {flipped ? "Answer" : `${t.flipCard} — tap to flip`}
        </p>
        <p className="text-lg text-slate-100">
          {resolveText(flipped ? card.back : card.front, language)}
        </p>
      </button>
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIndex((i) => Math.max(0, i - 1));
            setFlipped(false);
          }}
          disabled={index === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          {t.previous}
        </Button>
        <span className="text-sm text-slate-500">
          {index + 1} / {cards.length}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIndex((i) => Math.min(cards.length - 1, i + 1));
            setFlipped(false);
          }}
          disabled={index === cards.length - 1}
        >
          {t.nextCard}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex gap-2 justify-center">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setFlashcardReview(card.id, "remembered");
            setIndex((i) => Math.min(cards.length - 1, i + 1));
            setFlipped(false);
          }}
        >
          {t.remembered}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setFlashcardReview(card.id, "needs-review");
            setIndex((i) => Math.min(cards.length - 1, i + 1));
            setFlipped(false);
          }}
        >
          {t.needsReview}
        </Button>
      </div>
    </div>
  );
}
