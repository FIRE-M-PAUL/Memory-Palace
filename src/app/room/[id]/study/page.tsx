"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudyGuidePanel } from "@/components/StudyGuidePanel";
import { FlashcardDeck } from "@/components/FlashcardDeck";
import { getRoomOrFallback } from "@/lib/roomStorage";
import { useAppStore } from "@/store/appStore";
import { resolveText } from "@/lib/multilingual";

export default function RoomStudyPage() {
  const params = useParams();
  const room = getRoomOrFallback(params.id as string);
  const { language, t } = useAppStore();

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 grid-bg">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/room/${room.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold gradient-text">{t.studyGuide}</h1>
            <p className="text-sm text-slate-500">{resolveText(room.title, language)}</p>
          </div>
        </div>
        <StudyGuidePanel room={room} />
        <section>
          <h2 className="text-lg font-semibold text-violet-300 mb-4">{t.flashcards}</h2>
          <FlashcardDeck cards={room.flashcards} />
        </section>
      </div>
    </div>
  );
}
