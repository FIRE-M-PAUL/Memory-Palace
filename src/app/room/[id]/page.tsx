"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Box,
  Map,
  BookOpen,
  Brain,
  Presentation,
  MessageSquare,
  ArrowLeft,
  Route,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConceptDetailPanel } from "@/components/ConceptDetailPanel";
import { ConnectionExplanationPanel } from "@/components/ConnectionExplanationPanel";
import { AskPalaceChat } from "@/components/AskPalaceChat";
import { MemoryRoutePanel } from "@/components/MemoryRoutePanel";
import { KnowledgeGraph2D } from "@/components/KnowledgeGraph2D";
import { getRoomOrFallback } from "@/lib/roomStorage";
import { buildGuidedLayout } from "@/lib/guidedRoomLayout";
import { getDefaultRoomView, setDefaultRoomView } from "@/lib/progressStorage";
import { resolveText } from "@/lib/multilingual";
import { useAppStore } from "@/store/appStore";
import type { KnowledgeRoom } from "@/types/memory-palace";

const KnowledgeRoom3D = dynamic(
  () => import("@/components/3d/KnowledgeRoom3D").then((m) => m.KnowledgeRoom3D),
  {
    ssr: false,
    loading: () => (
      <div className="h-[55vh] rounded-2xl glass flex items-center justify-center">
        <p className="text-cyan-400 animate-pulse">Loading your memory room...</p>
      </div>
    ),
  }
);

export default function RoomPage() {
  const params = useParams();
  const { language, t } = useAppStore();
  const id = params.id as string;

  const [room, setRoom] = useState<KnowledgeRoom | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [connectionPair, setConnectionPair] = useState<{
    a: string;
    b: string;
  } | null>(null);
  const [viewMode, setViewMode] = useState<"3d" | "2d">("3d");
  const [routeStep, setRouteStep] = useState(0);
  const [showStudyPath, setShowStudyPath] = useState(false);

  useEffect(() => {
    setRoom(getRoomOrFallback(id));
    setViewMode(getDefaultRoomView());
  }, [id]);

  const selectedConcept =
    selectedId && room ? room.concepts.find((c) => c.id === selectedId) ?? null : null;
  const routeConceptIds = room?.memoryRoute.map((s) => s.conceptId) ?? [];
  const coreTitle =
    room && language ? buildGuidedLayout(room, language).coreTitle : "";

  const setView = (mode: "3d" | "2d") => {
    setViewMode(mode);
    setDefaultRoomView(mode);
  };

  if (!room) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 flex flex-col bg-[#030712]">
      <div className="border-b border-slate-800 glass-strong px-4 py-3">
        <div className="mx-auto max-w-[1600px] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" asChild className="shrink-0">
              <Link href="/dashboard" aria-label="Back to dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="min-w-0">
              <h1 className="font-bold text-slate-100 truncate text-lg sm:text-xl">
                {resolveText(room.title, language)}
              </h1>
              <p className="text-xs text-slate-500 truncate">
                {resolveText(room.summary, language)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={viewMode === "3d" ? "default" : "outline"}
              onClick={() => setView("3d")}
              className="min-h-[40px]"
            >
              <Box className="h-4 w-4" />
              {t.room3d}
            </Button>
            <Button
              size="sm"
              variant={viewMode === "2d" ? "default" : "outline"}
              onClick={() => setView("2d")}
              className="min-h-[40px]"
            >
              <Map className="h-4 w-4" />
              {t.room2d}
            </Button>
            <Button
              size="sm"
              variant={showStudyPath ? "default" : "outline"}
              onClick={() => setShowStudyPath((v) => !v)}
              className="min-h-[40px]"
            >
              <Route className="h-4 w-4" />
              {t.showStudyPath}
            </Button>
            <Button size="sm" variant="outline" asChild className="min-h-[40px]">
              <Link href={`/room/${id}/study`}>
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">{t.studyGuide}</span>
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild className="min-h-[40px]">
              <Link href={`/room/${id}/practice`}>
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">{t.practiceTime}</span>
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild className="min-h-[40px]">
              <Link href={`/room/${id}/present`}>
                <Presentation className="h-4 w-4" />
                <span className="hidden sm:inline">{t.guidedLesson}</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {viewMode === "3d" && (
        <p className="text-center text-xs text-slate-500 py-1 px-4">
          {t.switchTo2dHelp}{" "}
          <button
            type="button"
            className="text-cyan-400 underline"
            onClick={() => setView("2d")}
          >
            {t.switchTo2d}
          </button>
        </p>
      )}

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="flex-1 p-4 min-h-[50vh]">
          {viewMode === "3d" ? (
            <KnowledgeRoom3D
              room={room}
              selectedId={selectedId}
              onSelectConcept={(cid) => {
                setSelectedId(cid);
                setConnectionPair(null);
              }}
              onSelectConnection={(a, b) => {
                setConnectionPair({ a, b });
                setSelectedId(null);
              }}
              showStudyPath={showStudyPath}
              routeConceptIds={routeConceptIds}
            />
          ) : (
            <KnowledgeGraph2D
              room={room}
              selectedId={selectedId}
              onSelectConcept={(cid) => {
                setSelectedId(cid);
                setConnectionPair(null);
              }}
              onSelectConnection={(a, b) => {
                setConnectionPair({ a, b });
                setSelectedId(null);
              }}
              showStudyPath={showStudyPath}
              routeConceptIds={routeConceptIds}
            />
          )}
        </div>
        {connectionPair && (
          <ConnectionExplanationPanel
            room={room}
            ideaAId={connectionPair.a}
            ideaBId={connectionPair.b}
            coreTitle={coreTitle}
            onClose={() => setConnectionPair(null)}
          />
        )}
        {selectedConcept && !connectionPair && (
          <ConceptDetailPanel
            concept={selectedConcept}
            room={room}
            coreTitle={coreTitle}
            onClose={() => setSelectedId(null)}
            onSelectConcept={setSelectedId}
            onSelectConnection={(a, b) => setConnectionPair({ a, b })}
          />
        )}
      </div>

      <div className="border-t border-slate-800 p-4">
        <Tabs defaultValue="ask" className="mx-auto max-w-[1600px]">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="ask" className="min-h-[40px]">
              <MessageSquare className="h-4 w-4 mr-1" />
              {t.askPalace}
            </TabsTrigger>
            <TabsTrigger value="route" className="min-h-[40px]">
              {t.studyPath}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ask" className="mt-4">
            <AskPalaceChat roomId={room.id} room={room} />
          </TabsContent>
          <TabsContent value="route" className="mt-4">
            <MemoryRoutePanel
              room={room}
              currentStep={routeStep}
              onStepClick={(step) => {
                setRouteStep(step);
                const s = room.memoryRoute[step];
                if (s) {
                  setSelectedId(s.conceptId);
                  setShowStudyPath(true);
                }
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
