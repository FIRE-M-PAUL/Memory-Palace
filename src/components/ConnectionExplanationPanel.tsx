"use client";

import { X, Lightbulb, Quote, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { KnowledgeRoom } from "@/types/memory-palace";
import { explainRelationship } from "@/lib/relationshipExplainer";
import { useAppStore } from "@/store/appStore";

interface ConnectionExplanationPanelProps {
  room: KnowledgeRoom;
  ideaAId: string;
  ideaBId: string;
  coreTitle?: string;
  onClose: () => void;
}

export function ConnectionExplanationPanel({
  room,
  ideaAId,
  ideaBId,
  coreTitle,
  onClose,
}: ConnectionExplanationPanelProps) {
  const { language, t } = useAppStore();
  const explained = explainRelationship(
    room,
    ideaAId,
    ideaBId,
    language,
    coreTitle
  );

  return (
    <aside className="glass-strong w-full sm:w-96 border-l border-violet-500/20 flex flex-col max-h-[55vh] lg:max-h-none">
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-violet-200">
          <Link2 className="h-4 w-4" />
          {t.connectionTitle}
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label={t.close}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4 space-y-4 overflow-y-auto text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="glass rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-1">{t.ideaA}</p>
            <p className="font-medium text-slate-100">{explained.titleA}</p>
          </div>
          <div className="glass rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-1">{t.ideaB}</p>
            <p className="font-medium text-slate-100">{explained.titleB}</p>
          </div>
        </div>
        <section>
          <h4 className="text-xs text-slate-500 mb-1">{t.connectionType}</h4>
          <p className="text-cyan-400/90 capitalize font-medium">
            {explained.connectionType}
          </p>
        </section>
        <section>
          <h4 className="text-cyan-300 mb-1">{t.whyConnected}</h4>
          <p className="text-slate-300 leading-relaxed">{explained.explanation}</p>
        </section>
        {explained.sourceExcerpt && (
          <section>
            <h4 className="flex items-center gap-1 text-cyan-300 mb-1">
              <Quote className="h-3.5 w-3.5" />
              {t.sourceExcerpt}
            </h4>
            <blockquote className="text-slate-400 italic border-l-2 border-cyan-500/30 pl-3">
              {explained.sourceExcerpt}
            </blockquote>
          </section>
        )}
        {explained.studyTip && (
          <section className="glass rounded-xl p-3 border border-amber-500/20">
            <h4 className="flex items-center gap-1 text-amber-200 mb-1">
              <Lightbulb className="h-3.5 w-3.5" />
              {t.studyTip}
            </h4>
            <p className="text-slate-300">{explained.studyTip}</p>
          </section>
        )}
      </div>
    </aside>
  );
}
