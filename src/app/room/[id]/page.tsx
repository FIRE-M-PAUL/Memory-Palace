"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IdeaDetailPanel } from "@/components/IdeaDetailPanel";
import { StudyPathPanel } from "@/components/StudyPathPanel";
import { ViewSelector } from "@/components/ViewSelector";
import { LayerBreadcrumbs } from "@/components/LayerBreadcrumbs";
import { useLearningLayers } from "@/hooks/useLearningLayers";
import { getRoomOrFallback } from "@/lib/roomStorage";
import {
  getDefaultRoomView,
  setDefaultRoomView,
  getSelectedLearningView,
  setSelectedLearningView,
} from "@/lib/progressStorage";
import { recommendLearningView } from "@/lib/viewRecommendation";
import { resolveText } from "@/lib/multilingual";
import { useAppStore } from "@/store/appStore";
import type { KnowledgeRoom } from "@/types/memory-palace";
import type { LearningViewMode } from "@/types/learning-views";

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
  const { language, t, studyStyle } = useAppStore();
  const id = params.id as string;

  const [room, setRoom] = useState<KnowledgeRoom | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [connectionPair, setConnectionPair] = useState<{
    a: string;
    b: string;
  } | null>(null);
  const [renderMode, setRenderMode] = useState<"3d" | "2d">("3d");
  const [learningView, setLearningView] = useState<LearningViewMode>("focus");
  const [routeStep, setRouteStep] = useState(0);
  const [showStudyPath, setShowStudyPath] = useState(false);
  const [showPathPanel, setShowPathPanel] = useState(false);
  const [dismissedRecommendation, setDismissedRecommendation] = useState(false);

  useEffect(() => {
    setRoom(getRoomOrFallback(id));
    setRenderMode(getDefaultRoomView());
    setLearningView(getSelectedLearningView());
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

  const recommendation = useMemo(
    () => (room ? recommendLearningView(room, studyStyle) : null),
    [room, studyStyle]
  );

  const selectedConcept =
    selectedId && room ? room.concepts.find((c) => c.id === selectedId) ?? null : null;
  const routeConceptIds = room?.memoryRoute.map((s) => s.conceptId) ?? [];
  const coreTitle = currentFrame?.title ?? "";

  const handleConceptActivate = useCallback(
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

  const changeLearningView = (view: LearningViewMode) => {
    setLearningView(view);
    setSelectedLearningView(view);
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
          <div className="flex flex-wrap items-center gap-2">
            <ViewSelector
              value={learningView}
              onChange={changeLearningView}
              className="hidden sm:flex"
            />
            <ViewSelector
              value={learningView}
              onChange={changeLearningView}
              compact
              className="sm:hidden"
            />
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

        {recommendation && !dismissedRecommendation && (
          <div className="mx-auto max-w-[1600px] mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm">
            <span className="text-cyan-100">
              {t.recommendedView}:{" "}
              <strong>{t.learningViews[recommendation.view]}</strong>
              <span className="text-slate-400 ml-2 hidden md:inline">
                — {t[recommendation.reasonKey]}
              </span>
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => changeLearningView(recommendation.view)}
            >
              {t.learningViews[recommendation.view]}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="ml-auto h-8 w-8"
              onClick={() => setDismissedRecommendation(true)}
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-[1600px] w-full px-4 pb-2">
        <LayerBreadcrumbs
          stack={layerStack}
          canGoBack={canGoBack}
          onBack={goBack}
          onRoot={handleResetLayers}
          onNavigate={navigateToLayer}
        />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="flex-1 p-4 min-h-[50vh] flex flex-col gap-4">
          {layerStack.length > 0 && renderMode === "3d" ? (
            <KnowledgeRoom3D
              room={room}
              selectedId={selectedId}
              learningView={learningView}
              layerStack={layerStack}
              layerKey={layerKey}
              transitioning={layerTransitioning}
              onConceptActivate={handleConceptActivate}
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
              learningView={learningView}
              layerStack={layerStack}
              transitioning={layerTransitioning}
              onConceptActivate={handleConceptActivate}
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

        {showPathPanel && (
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
          <ConnectionExplanationPanel
            room={room}
            ideaAId={connectionPair.a}
            ideaBId={connectionPair.b}
            coreTitle={coreTitle}
            onClose={() => setConnectionPair(null)}
          />
        )}
        {selectedConcept && !connectionPair && (
          <IdeaDetailPanel
            concept={selectedConcept}
            room={room}
            coreTitle={coreTitle}
            layerDepth={layerDepth}
            canDiveDeeper={canDiveIntoConcept(selectedConcept.id)}
            onDiveDeeper={() => handleConceptActivate(selectedConcept.id)}
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
    </div>
  );
}
