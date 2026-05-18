"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getLessonById, lessonToRoom } from "@/lib/curriculum";
import { createRoom } from "@/lib/roomStorage";
import { resolveText } from "@/lib/multilingual";
import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles } from "lucide-react";
import { markTopicComplete } from "@/lib/progressStorage";

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language, t } = useAppStore();
  const lesson = getLessonById(params.lessonId as string);

  if (!lesson) {
    return (
      <div className="min-h-screen pt-24 text-center text-slate-500">
        Lesson not found.{" "}
        <Link href="/library" className="text-cyan-400">
          Back to library
        </Link>
      </div>
    );
  }

  const generatePalace = () => {
    const data = lessonToRoom(lesson);
    const room = createRoom(data);
    markTopicComplete(lesson.id);
    router.push(`/room/${room.id}`);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 grid-bg">
      <div className="mx-auto max-w-3xl">
        <Button variant="ghost" size="icon" asChild className="mb-6">
          <Link href="/library">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold gradient-text mb-3">
          {resolveText(lesson.title, language)}
        </h1>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge>{t.subjects[lesson.subject]}</Badge>
          <Badge variant="secondary">{t.levels[lesson.level]}</Badge>
          <Badge variant="outline">{lesson.concepts.length} concepts</Badge>
        </div>
        <p className="text-slate-300 leading-relaxed mb-6">
          {resolveText(lesson.overview, language)}
        </p>
        <ul className="space-y-2 mb-8">
          {lesson.concepts.slice(0, 6).map((c) => (
            <li key={c.id} className="text-sm text-slate-400 glass rounded-lg px-3 py-2">
              <span className="text-cyan-300">{resolveText(c.title, language)}</span>
              {" — "}
              {resolveText(c.summary, language)}
            </li>
          ))}
        </ul>
        <Button size="lg" onClick={generatePalace} className="w-full sm:w-auto">
          <Sparkles className="h-5 w-5" />
          {t.generatePalace}
        </Button>
      </div>
    </div>
  );
}
