"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { KnowledgeRoom } from "@/types/memory-palace";
import { getClusterColor } from "@/types/memory-palace";
import { resolveText } from "@/lib/multilingual";
import { useAppStore } from "@/store/appStore";

export function PresentationMode({ room }: { room: KnowledgeRoom }) {
  const { language, t } = useAppStore();
  const slides = room.concepts.filter((c) => c.importance !== "low");
  const list = slides.length ? slides : room.concepts;
  const [index, setIndex] = useState(0);
  const current = list[index];

  const related = room.relationships
    .filter((r) => r.source === current.id || r.target === current.id)
    .map((r) => {
      const oid = r.source === current.id ? r.target : r.source;
      return room.concepts.find((c) => c.id === oid);
    })
    .filter(Boolean);

  return (
    <div className="min-h-[70vh] flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-violet-400" />
          <h2 className="text-2xl font-bold gradient-text">{t.guidedLesson}</h2>
        </div>
        <span className="text-sm text-slate-500">
          {t.ideaOf} {index + 1} {t.of} {list.length} · {t.youAreLearning}
        </span>
      </div>
      <div className="flex-1 glass-strong rounded-3xl p-6 md:p-10 max-w-3xl mx-auto w-full glow-purple">
        <Badge className="mb-4" style={{ color: getClusterColor(current.cluster) }}>
          {current.cluster}
        </Badge>
        <h3 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-4">
          {resolveText(current.title, language)}
        </h3>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-6">
          {resolveText(current.summary, language)}
        </p>
        {related.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-slate-500 mb-2">{t.relatedConcepts}</p>
            <div className="flex flex-wrap gap-2">
              {related.map((c) =>
                c ? (
                  <Badge key={c.id} variant="secondary">
                    {resolveText(c.title, language)}
                  </Badge>
                ) : null
              )}
            </div>
          </div>
        )}
        {current.sourceExcerpt && (
          <blockquote className="text-sm text-slate-500 italic border-l-2 border-violet-500/30 pl-4">
            <span className="text-violet-300/80 not-italic text-xs block mb-1">
              {t.sourceExcerpt}
            </span>
            {resolveText(current.sourceExcerpt, language)}
          </blockquote>
        )}
      </div>
      <div className="flex justify-center gap-4 mt-8 flex-wrap">
        <Button
          variant="outline"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
          className="min-h-[44px]"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t.prevIdea}
        </Button>
        <Button
          disabled={index >= list.length - 1}
          onClick={() => setIndex((i) => i + 1)}
          className="min-h-[44px]"
        >
          {index >= list.length - 1 ? t.finishLesson : t.nextIdea}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
