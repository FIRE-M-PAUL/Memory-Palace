"use client";

import { X, Link2, Quote, Lightbulb, HelpCircle, Target, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Concept } from "@/types/learning";
import type { KnowledgeRoom } from "@/types/memory-palace";
import { getClusterColor } from "@/types/memory-palace";
import { resolveText } from "@/lib/multilingual";
import {
  getConnectionToCoreText,
  getSummarizedPointsForIdea,
} from "@/lib/guidedRoomLayout";
import { simplifyTextForDifficulty } from "@/lib/difficulty";
import { useAppStore } from "@/store/appStore";

interface ConceptDetailPanelProps {
  concept: Concept;
  room: KnowledgeRoom;
  coreTitle: string;
  onClose: () => void;
  onSelectConcept: (id: string) => void;
  onSelectConnection?: (sourceId: string, targetId: string) => void;
  /** Nested learning worlds — show “Explore this idea” when subtopics exist */
  canDiveDeeper?: boolean;
  onDiveDeeper?: () => void;
  layerDepth?: number;
}

export function ConceptDetailPanel({
  concept,
  room,
  coreTitle,
  onClose,
  onSelectConcept,
  onSelectConnection,
  canDiveDeeper = false,
  onDiveDeeper,
  layerDepth = 0,
}: ConceptDetailPanelProps) {
  const { language, difficulty, t } = useAppStore();

  const summary = simplifyTextForDifficulty(
    resolveText(concept.summary, language),
    difficulty
  );
  const why = concept.whyItMatters
    ? simplifyTextForDifficulty(resolveText(concept.whyItMatters, language), difficulty)
    : t.whyMatters;
  const tip = concept.studyTip
    ? simplifyTextForDifficulty(resolveText(concept.studyTip, language), difficulty)
    : undefined;

  const connectsToMain = simplifyTextForDifficulty(
    getConnectionToCoreText(room, concept, coreTitle, language),
    difficulty
  );

  const keyPoints = getSummarizedPointsForIdea(room, concept, language);

  const related = room.relationships
    .filter((r) => r.source === concept.id || r.target === concept.id)
    .map((r) => {
      const otherId = r.source === concept.id ? r.target : r.source;
      return { ...r, concept: room.concepts.find((c) => c.id === otherId) };
    })
    .filter((r) => r.concept);

  const practiceQ = room.practiceQuestions.find((q) =>
    resolveText(q.question, language).toLowerCase().includes(concept.title.en.toLowerCase())
  );

  const importanceLabel =
    concept.importance === "high"
      ? "Very important idea"
      : concept.importance === "medium"
        ? "Important idea"
        : "Supporting idea";

  return (
    <aside className="glass-strong w-full sm:w-96 border-l border-cyan-500/10 flex flex-col h-full max-h-[55vh] lg:max-h-none">
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <Badge
          style={{
            color: getClusterColor(concept.cluster),
            borderColor: getClusterColor(concept.cluster),
          }}
        >
          {concept.cluster}
        </Badge>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        <p className="text-xs text-cyan-400/80 mb-1">{importanceLabel}</p>
        <h2 className="text-xl font-bold mb-4">{resolveText(concept.title, language)}</h2>

        {canDiveDeeper && onDiveDeeper && (
          <Button
            className="w-full mb-5 gap-2"
            onClick={onDiveDeeper}
          >
            <Compass className="h-4 w-4" />
            {t.exploreThisIdea}
          </Button>
        )}

        {layerDepth > 0 && (
          <p className="text-xs text-violet-400/80 mb-4">
            {t.currentLearningLayer} · {t.diveDeeperHint}
          </p>
        )}

        <section className="mb-5">
          <h3 className="text-sm font-medium text-cyan-300 mb-2">{t.whatItMeans}</h3>
          <p className="text-slate-300 text-sm leading-relaxed">{summary}</p>
        </section>

        <section className="mb-5">
          <h3 className="text-sm font-medium text-cyan-300 mb-2">{t.whyMatters}</h3>
          <p className="text-slate-400 text-sm">{why}</p>
        </section>

        <section className="mb-5 glass rounded-xl p-3 border border-violet-500/15">
          <h3 className="flex items-center gap-2 text-sm font-medium text-violet-200 mb-2">
            <Target className="h-4 w-4" />
            {t.connectsToMain}
          </h3>
          <p className="text-slate-300 text-sm">{connectsToMain}</p>
          <p className="text-xs text-slate-500 mt-2">
            {t.coreTopic}: <span className="text-violet-300">{coreTitle}</span>
          </p>
        </section>

        {keyPoints.length > 0 && (
          <section className="mb-5">
            <h3 className="text-sm font-medium text-cyan-300 mb-2">{t.simplePoints}</h3>
            <ul className="space-y-2">
              {keyPoints.map((point) => (
                <li
                  key={point.slice(0, 40)}
                  className="text-sm text-slate-400 pl-3 border-l-2 border-cyan-500/20"
                >
                  {point}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mb-5">
          <h3 className="flex items-center gap-2 text-sm font-medium text-cyan-300 mb-3">
            <Link2 className="h-4 w-4" />
            {t.relatedConcepts}
          </h3>
          <div className="space-y-2">
            {related.map((r) => (
              <button
                key={r.source + r.target}
                type="button"
                onClick={() => {
                  if (r.concept) {
                    onSelectConcept(r.concept.id);
                    onSelectConnection?.(concept.id, r.concept.id);
                  }
                }}
                className="w-full text-left glass rounded-xl p-3 hover:border-cyan-500/30 min-h-[44px]"
              >
                <p className="text-sm font-medium">
                  {r.concept && resolveText(r.concept.title, language)}
                </p>
                <p className="text-xs text-slate-500 capitalize">{r.label}</p>
              </button>
            ))}
          </div>
        </section>

        {concept.sourceExcerpt && (
          <section className="mb-5">
            <h3 className="flex items-center gap-2 text-sm text-cyan-300 mb-2">
              <Quote className="h-4 w-4" />
              {t.sourceExcerpt}
            </h3>
            <blockquote className="text-sm text-slate-400 italic border-l-2 border-cyan-500/30 pl-3">
              {resolveText(concept.sourceExcerpt, language)}
            </blockquote>
          </section>
        )}

        {tip && (
          <section className="mb-5 glass rounded-xl p-3 border border-amber-500/15">
            <h3 className="flex items-center gap-2 text-sm text-amber-200 mb-2">
              <Lightbulb className="h-4 w-4" />
              {t.rememberThis}
            </h3>
            <p className="text-sm text-slate-300">{tip}</p>
          </section>
        )}

        {practiceQ && (
          <section>
            <h3 className="flex items-center gap-2 text-sm text-cyan-300 mb-2">
              <HelpCircle className="h-4 w-4" />
              {t.tryThisQuestion}
            </h3>
            <p className="text-sm text-slate-400">
              {resolveText(practiceQ.question, language)}
            </p>
          </section>
        )}
      </ScrollArea>
    </aside>
  );
}
