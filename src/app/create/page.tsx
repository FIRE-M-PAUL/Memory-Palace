"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Wand2, BookOpen, Map, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextInputPanel } from "@/components/TextInputPanel";
import { UploadBox } from "@/components/UploadBox";
import { ProcessingLoader } from "@/components/ProcessingLoader";
import { createRoom, saveDemoRoom, DEMO_ROOM_ID } from "@/lib/roomStorage";
import { processUploadedDocument } from "@/lib/documentProcessor";
import { DocumentProcessingError } from "@/types/document-processing";
import type { DocumentProcessingSummary } from "@/types/document-processing";
import { getLessonById, lessonToRoom } from "@/lib/curriculum";
import { BUILT_IN_LESSONS } from "@/lib/curriculum";
import { setDefaultRoomView, type DefaultRoomView } from "@/lib/progressStorage";
import { useAppStore } from "@/store/appStore";
import { CreatePageFallback } from "@/components/CreatePageFallback";
import { resolveText } from "@/lib/multilingual";

function CreatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";
  const t = useAppStore((s) => s.t);
  const language = useAppStore((s) => s.language);

  const [content, setContent] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");
  const [preferredView, setPreferredView] = useState<DefaultRoomView>("3d");
  const [processing, setProcessing] = useState(false);
  const [processingSummary, setProcessingSummary] = useState<DocumentProcessingSummary | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDemo) {
      const demo = saveDemoRoom();
      router.replace(`/room/${demo.id}`);
    }
  }, [isDemo, router]);

  const processContent = async () => {
    if (selectedLesson) {
      const lesson = getLessonById(selectedLesson);
      if (lesson) {
        setProcessing(true);
        setDefaultRoomView(preferredView);
        const room = createRoom(lessonToRoom(lesson));
        router.push(`/room/${room.id}`);
        return;
      }
    }

    const text = content.trim();
    if (text.length < 20) {
      setError("Please add at least a few lines of notes, or pick a lesson.");
      return;
    }

    setError(null);
    setProcessingSummary(null);
    setProcessing(true);
    setDefaultRoomView(preferredView);

    try {
      const result = processUploadedDocument(text);
      setProcessingSummary(result.summary);
      await new Promise((r) => setTimeout(r, 1800));
      const room = createRoom(result.room);
      router.push(`/room/${room.id}`);
    } catch (e) {
      if (e instanceof DocumentProcessingError) {
        setError(t.insufficientContent);
      } else {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
      setProcessing(false);
      setProcessingSummary(null);
    }
  };

  if (processing) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center grid-bg">
        <ProcessingLoader summary={processingSummary} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 grid-bg">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold gradient-text mb-2">{t.createNew}</h1>
          <p className="text-slate-400 max-w-lg mx-auto">{t.taglineSub}</p>
        </div>

        <div className="space-y-6">
          {/* Step 1 */}
          <section className="glass-strong rounded-2xl p-6 sm:p-8 space-y-4">
            <div>
              <p className="text-xs text-cyan-400 font-medium uppercase tracking-wider mb-1">
                Step 1
              </p>
              <h2 className="text-lg font-semibold text-slate-100">{t.createStep1Title}</h2>
              <p className="text-sm text-slate-500 mt-1">{t.createStep1Help}</p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-slate-300 mb-3">
                <BookOpen className="h-4 w-4 text-violet-400" />
                {t.selectLesson}
              </label>
              <select
                value={selectedLesson}
                onChange={(e) => {
                  setSelectedLesson(e.target.value);
                  setContent("");
                }}
                className="w-full h-11 rounded-xl border border-cyan-500/20 bg-slate-900/50 px-3 text-sm text-slate-200"
              >
                <option value="">— {t.builtInLessons} —</option>
                {BUILT_IN_LESSONS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {resolveText(l.title, language)} ({t.difficulties[l.difficulty]})
                  </option>
                ))}
              </select>
            </div>

            {!selectedLesson && (
              <>
                <UploadBox
                  onFileContent={(text) => {
                    setContent(text);
                    setError(null);
                  }}
                  onError={setError}
                  disabled={processing}
                />
                <p className="text-xs text-slate-500 text-center">{t.uploadContentNote}</p>
                <div className="relative flex items-center gap-4 py-1">
                  <div className="flex-1 h-px bg-slate-700" />
                  <span className="text-xs text-slate-500">or paste</span>
                  <div className="flex-1 h-px bg-slate-700" />
                </div>
                <TextInputPanel value={content} onChange={setContent} disabled={processing} />
              </>
            )}
          </section>

          {/* Step 2 */}
          <section className="glass-strong rounded-2xl p-6 sm:p-8 space-y-4">
            <div>
              <p className="text-xs text-cyan-400 font-medium uppercase tracking-wider mb-1">
                Step 2
              </p>
              <h2 className="text-lg font-semibold text-slate-100">{t.createStep2Title}</h2>
              <p className="text-sm text-slate-500 mt-1">{t.createStep2Help}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPreferredView("2d")}
                className={`glass rounded-xl p-4 text-left border min-h-[80px] transition-colors ${
                  preferredView === "2d"
                    ? "border-cyan-500/50 bg-cyan-500/5"
                    : "border-transparent hover:border-slate-600"
                }`}
              >
                <Map className="h-6 w-6 text-cyan-400 mb-2" />
                <p className="font-medium text-slate-100">{t.view2d}</p>
              </button>
              <button
                type="button"
                onClick={() => setPreferredView("3d")}
                className={`glass rounded-xl p-4 text-left border min-h-[80px] transition-colors ${
                  preferredView === "3d"
                    ? "border-cyan-500/50 bg-cyan-500/5"
                    : "border-transparent hover:border-slate-600"
                }`}
              >
                <Box className="h-6 w-6 text-violet-400 mb-2" />
                <p className="font-medium text-slate-100">{t.view3d}</p>
              </button>
            </div>
          </section>

          {/* Step 3 */}
          <section className="glass-strong rounded-2xl p-6 sm:p-8 space-y-4">
            <div>
              <p className="text-xs text-cyan-400 font-medium uppercase tracking-wider mb-1">
                Step 3
              </p>
              <h2 className="text-lg font-semibold text-slate-100">{t.createStep3Title}</h2>
              <p className="text-sm text-slate-500 mt-1">{t.createStep3Help}</p>
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <Button
              className="w-full min-h-[48px]"
              size="lg"
              onClick={processContent}
              disabled={!selectedLesson && content.trim().length < 20}
            >
              <Wand2 className="h-5 w-5" />
              {t.buildPalace}
            </Button>

            <Button
              variant="outline"
              className="w-full min-h-[44px]"
              onClick={() => {
                saveDemoRoom();
                router.push(`/room/${DEMO_ROOM_ID}`);
              }}
            >
              <Sparkles className="h-5 w-5" />
              {t.launchDemo}
            </Button>
            <p className="text-xs text-slate-500 text-center">{t.demoHelper}</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense
      fallback={<CreatePageFallback />}
    >
      <CreatePageContent />
    </Suspense>
  );
}
