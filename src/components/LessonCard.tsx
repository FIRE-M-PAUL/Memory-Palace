"use client";

import Link from "next/link";
import type { Lesson } from "@/types/curriculum";
import { resolveText } from "@/lib/multilingual";
import { useAppStore } from "@/store/appStore";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronRight } from "lucide-react";

export function LessonCard({ lesson }: { lesson: Lesson }) {
  const { language, t } = useAppStore();

  return (
    <Link
      href={`/library/${lesson.id}`}
      className="group glass rounded-2xl p-5 hover:border-violet-500/30 transition-all block"
    >
      <div className="flex justify-between items-start gap-2">
        <BookOpen className="h-8 w-8 text-violet-400 shrink-0" />
        <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-cyan-400" />
      </div>
      <h3 className="mt-3 font-semibold text-slate-100 line-clamp-1">
        {resolveText(lesson.title, language)}
      </h3>
      <p className="text-sm text-slate-400 mt-1 line-clamp-2">
        {resolveText(lesson.overview, language)}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="secondary">{t.subjects[lesson.subject]}</Badge>
        <Badge variant="outline">{t.difficulties[lesson.difficulty]}</Badge>
        <Badge>{lesson.concepts.length} {t.ideasCount}</Badge>
      </div>
    </Link>
  );
}
