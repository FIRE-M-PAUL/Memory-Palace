"use client";

import { BookOpen, HelpCircle, ListChecks } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { KnowledgeRoom } from "@/types/memory-palace";
import { resolveText } from "@/lib/multilingual";
import { useAppStore } from "@/store/appStore";

export function StudyGuidePanel({ room }: { room: KnowledgeRoom }) {
  const { language, t } = useAppStore();
  const { studyGuide } = room;

  return (
    <div className="space-y-6">
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 gradient-text">
            <BookOpen className="h-5 w-5" />
            {t.overview}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 leading-relaxed">{resolveText(studyGuide.overview, language)}</p>
        </CardContent>
      </Card>
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-300">
            <ListChecks className="h-5 w-5" />
            {t.keyPoints}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {studyGuide.keyPoints.map((point, i) => (
              <li key={i} className="text-sm text-slate-300 flex gap-2">
                <span className="text-cyan-400">{i + 1}.</span>
                {resolveText(point, language)}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-violet-300">
            <HelpCircle className="h-5 w-5" />
            {t.practiceQuestions}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300">
            {studyGuide.questions.map((q, i) => (
              <li key={i}>{resolveText(q, language)}</li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
