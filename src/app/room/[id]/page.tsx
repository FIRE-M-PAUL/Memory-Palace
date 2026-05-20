"use client";

import { useCallback, useEffect, useState } from "react";
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
import { IdeaDetailPanel } from "@/components/IdeaDetailPanel";
import { StudyPathPanel } from "@/components/StudyPathPanel";
import { LayerBreadcrumbs } from "@/components/LayerBreadcrumbs";
import { MobileBottomSheet } from "@/components/mobile/MobileBottomSheet";
import { MobileRoomHeader } from "@/components/room/MobileRoomHeader";
import { useLearningLayers } from "@/hooks/useLearningLayers";
import { useViewport } from "@/hooks/useViewport";
import { getRoomOrFallback } from "@/lib/roomStorage";
import {
  getDefaultRoomView,
  setDefaultRoomView,
} from "@/lib/progressStorage";
import { resolveText } from "@/lib/multilingual";
import { useAppStore } from "@/store/appStore";
import { RoomPageLoader } from "@/components/RoomPageLoader";
import type { KnowledgeRoom } from "@/types/memory-palace";

const KnowledgeRoom3D = dynamic(
  () => import("@/components/3d/KnowledgeRoom3D").then((m) => m.KnowledgeRoom3D),
  {
    ssr: false,
    loading: () => <RoomPageLoader />,
  }
);

const KnowledgeGraph2D = dynamic(
  () => import("@/components/KnowledgeGraph2D").then((m) => m.KnowledgeGraph2D),
  { ssr: false, loading: () => <div className="h-[55vh] rounded-2xl glass animate-pulse" /> }
);

const AskPalaceChat = dynamic(
  () => import("@/components/AskPalaceChat").then((m) => m.AskPalaceChat),
  { ssr: false, loading: () => <div className="h-32 rounded-xl glass animate-pulse" /> }
);

const ConnectionExplanationPanel = dynamic(
  () =>
    import("@/components/ConnectionExplanationPanel").then(
      (m) => m.ConnectionExplanationPanel
    ),
  { ssr: false }
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
  const [renderMode, setRenderMode] = useState<"3d" | "2d">("3d");
  const [routeStep, setRouteStep] = useState(0);
  const [showStudyPath, setShowStudyPath] = useState(false);
  const [showPathPanel, setShowPathPanel] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  useEffect(() => {
    setRoom(getRoomOrFallback(id));
    setRenderMode(getDefaultRoomView());
  }, [id]);

  const {
    layerStack,
    layerKey,
    depth: layerDepth,
    currentFrame,
    transitioning: layerTransitioning,
    diveInto,
    goBack,
    goToRoot,
    canGoBack,
    canDiveIntoConcept,
    navigateToLayer,
  } = useLearningLayers(room, language);

  const { isMobile } = useViewport();

  const selectedConcept =
    selectedId && room ? room.concepts.find((c) => c.id === selectedId) ?? null : null;
  const routeConceptIds = room?.memoryRoute.map((s) => s.conceptId) ?? [];
  const coreTitle = currentFrame?.title ?? "";

  const handleConceptSelect = useCallback((conceptId: string) => {
    setSelectedId(conceptId);
    setConnectionPair(null);
  }, []);

  const handleConceptDive = useCallback(
    (conceptId: string) => {
      setSelectedId(conceptId);
      setConnectionPair(null);
      diveInto(conceptId);
    },
    [diveInto]
  );

  const handleResetLayers = useCallback(() => {
    setSelectedId(null);
    setConnectionPair(null);
    goToRoot();
  }, [goToRoot]);

  const setRender = (mode: "3d" | "2d") => {
    setRenderMode(mode);
    setDefaultRoomView(mode);
  };

  if (!room) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center text-slate-500">
        {t.loading}
      </div>
    );
  }

  return (
    <div className="room-page min-h-[100dvh] pt-14 md:pt-16 flex flex-col bg-[#030712] overflow-x-hidden">
      {isMobile && (
        <MobileRoomHeader
          roomTitle={resolveText(room.title, language)}
          roomId={id}
          renderMode={renderMode}
          onRenderModeChange={setRender}
          showStudyPath={showStudyPath}
          onToggleStudyPath={() => {
            setShowStudyPath((v) => !v);
            setShowPathPanel((v) => !v);
          }}
        />
      )}

      <div className="hidden md:block border-b border-slate-800 glass-strong px-4 py-3">
        <div className="mx-auto max-w-[1600px] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" asChild className="shrink-0">
              <Link href="/dashboard" aria-label={t.backToDashboard}>
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
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={renderMode === "3d" ? "default" : "outline"}
              onClick={() => setRender("3d")}
              className="min-h-[40px]"
            >
              <Box className="h-4 w-4" />
              <span className="hidden sm:inline">{t.room3d}</span>
            </Button>
            <Button
              size="sm"
              variant={renderMode === "2d" ? "default" : "outline"}
              onClick={() => setRender("2d")}
              className="min-h-[40px]"
            >
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">{t.switchTo2dShort}</span>
            </Button>
            <Button
              size="sm"
              variant={showStudyPath ? "default" : "outline"}
              onClick={() => {
                setShowStudyPath((v) => !v);
                setShowPathPanel((v) => !v);
              }}
              className="min-h-[40px]"
            >
              <Route className="h-4 w-4" />
              <span className="hidden sm:inline">{t.showStudyPath}</span>
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

      <div className="mx-auto max-w-[1600px] w-full px-2 md:px-4 pb-1 md:pb-2">
        <LayerBreadcrumbs
          stack={layerStack}
          canGoBack={canGoBack}
          onBack={goBack}
          onRoot={handleResetLayers}
          onNavigate={navigateToLayer}
        />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="flex-1 p-1 sm:p-4 min-h-0 flex flex-col gap-1 sm:gap-4">
          {layerStack.length > 0 && renderMode === "3d" ? (
            <KnowledgeRoom3D
              room={room}
              selectedId={selectedId}
              layerStack={layerStack}
              layerKey={layerKey}
              transitioning={layerTransitioning}
              onConceptActivate={handleConceptSelect}
              onConceptDive={handleConceptDive}
              onSwitch2d={() => setRender("2d")}
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
          ) : layerStack.length > 0 ? (
            <KnowledgeGraph2D
              room={room}
              selectedId={selectedId}
              layerStack={layerStack}
              transitioning={layerTransitioning}
              onConceptActivate={handleConceptSelect}
              onConceptDive={handleConceptDive}
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
          ) : null}
        </div>

        {showPathPanel && !isMobile && (
          <StudyPathPanel
            className="w-full lg:w-72 shrink-0 m-4 mt-0 lg:mt-4 lg:mr-0"
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
        )}

        {connectionPair && (
          <div className="hidden lg:block">
            <ConnectionExplanationPanel
              room={room}
              ideaAId={connectionPair.a}
              ideaBId={connectionPair.b}
              coreTitle={coreTitle}
              onClose={() => setConnectionPair(null)}
            />
          </div>
        )}
        {selectedConcept && !connectionPair && (
          <div className="hidden lg:block">
            <IdeaDetailPanel
              concept={selectedConcept}
              room={room}
              coreTitle={coreTitle}
              layerDepth={layerDepth}
              canDiveDeeper={canDiveIntoConcept(selectedConcept.id)}
              onDiveDeeper={() => handleConceptDive(selectedConcept.id)}
              onClose={() => setSelectedId(null)}
              onSelectConcept={setSelectedId}
              onSelectConnection={(a, b) => setConnectionPair({ a, b })}
            />
          </div>
        )}
      </div>

      {isMobile && connectionPair && (
        <MobileBottomSheet
          open
          onClose={() => setConnectionPair(null)}
          title={t.connectionType}
        >
          <ConnectionExplanationPanel
            room={room}
            ideaAId={connectionPair.a}
            ideaBId={connectionPair.b}
            coreTitle={coreTitle}
            onClose={() => setConnectionPair(null)}
          />
        </MobileBottomSheet>
      )}

      {isMobile && selectedConcept && !connectionPair && (
        <MobileBottomSheet
          open
          onClose={() => setSelectedId(null)}
          title={resolveText(selectedConcept.title, language)}
        >
          <IdeaDetailPanel
            embedded
            concept={selectedConcept}
            room={room}
            coreTitle={coreTitle}
            layerDepth={layerDepth}
            canDiveDeeper={canDiveIntoConcept(selectedConcept.id)}
            onDiveDeeper={() => handleConceptDive(selectedConcept.id)}
            onClose={() => setSelectedId(null)}
            onSelectConcept={setSelectedId}
            onSelectConnection={(a, b) => setConnectionPair({ a, b })}
          />
        </MobileBottomSheet>
      )}

      <div className="border-t border-slate-800/80 shrink-0">
        {isMobile ? (
          <div className="mx-auto max-w-[1600px] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={() => setMobileChatOpen((v) => !v)}
              className="flex w-full min-h-[48px] items-center justify-between rounded-xl border border-cyan-500/20 bg-slate-950/80 px-4 py-3 text-sm font-medium text-cyan-100 touch-manipulation"
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {t.askPalace}
              </span>
              <span className="text-xs text-slate-500">{mobileChatOpen ? "−" : "+"}</span>
            </button>
            {mobileChatOpen && (
              <div className="mt-2 max-h-[38dvh] overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/90 p-2">
                <AskPalaceChat roomId={room.id} room={room} />
              </div>
            )}
          </div>
        ) : (
        <div className="p-4">
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
            <StudyPathPanel
              room={room}
              currentStep={routeStep}
              onStepClick={(step) => {
                setRouteStep(step);
                const s = room.memoryRoute[step];
                if (s) {
                  setSelectedId(s.conceptId);
                  setShowStudyPath(true);
                  setShowPathPanel(true);
                }
              }}
            />
          </TabsContent>
        </Tabs>
        </div>
        )}
      </div>
    </div>
  );
}
