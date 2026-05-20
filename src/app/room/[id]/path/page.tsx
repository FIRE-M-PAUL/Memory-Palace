"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudyPathPanel } from "@/components/StudyPathPanel";
import { getRoomOrFallback } from "@/lib/roomStorage";
import { useAppStore } from "@/store/appStore";
import { resolveText } from "@/lib/multilingual";

/** Dedicated study path view — same flow as Guided Lesson, without the 3D room. */
export default function RoomStudyPathPage() {
  const params = useParams();
  const room = getRoomOrFallback(params.id as string);
  const { language, t } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 grid-bg">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/room/${room.id}`} aria-label={t.backToRoom}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold gradient-text">{t.studyPath}</h1>
            <p className="text-sm text-slate-500">{resolveText(room.title, language)}</p>
          </div>
        </div>
        <StudyPathPanel
          room={room}
          variant="page"
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />
      </div>
    </div>
  );
}
