"use client";

import dynamic from "next/dynamic";
import type { KnowledgeRoom } from "@/types/memory-palace";
import type { LearningViewMode } from "@/types/learning-views";
import type { LayerStack } from "@/types/nested-worlds";

export interface KnowledgeRoom3DProps {
  room: KnowledgeRoom;
  selectedId: string | null;
  onSelectConcept: (id: string | null) => void;
  onConceptActivate: (conceptId: string) => void;
  onConceptDive?: (conceptId: string) => void;
  onSwitch2d?: () => void;
  onSelectConnection?: (sourceId: string, targetId: string) => void;
  showStudyPath?: boolean;
  routeConceptIds?: string[];
  learningView?: LearningViewMode;
  layerStack: LayerStack;
  layerKey: string;
  transitioning?: boolean;
}

import { SceneLoadingView } from "@/components/3d/SceneLoadingView";

const FocusView = dynamic(
  () => import("@/components/views/FocusView").then((m) => m.FocusView),
  { ssr: false, loading: () => <SceneLoadingView /> }
);
const ExploreView = dynamic(
  () => import("@/components/views/ExploreView").then((m) => m.ExploreView),
  { ssr: false, loading: () => <SceneLoadingView /> }
);
const CreativeView = dynamic(
  () => import("@/components/views/CreativeView").then((m) => m.CreativeView),
  { ssr: false, loading: () => <SceneLoadingView /> }
);
const RoomView = dynamic(
  () => import("@/components/views/RoomView").then((m) => m.RoomView),
  { ssr: false, loading: () => <SceneLoadingView /> }
);

const VIEW_COMPONENTS = {
  focus: FocusView,
  explore: ExploreView,
  creative: CreativeView,
  room: RoomView,
} as const;

export function KnowledgeRoom3D({
  learningView = "focus",
  ...props
}: KnowledgeRoom3DProps) {
  const View = VIEW_COMPONENTS[learningView];

  return (
    <div className="w-full h-full transition-opacity duration-300">
      <View {...props} view={learningView} />
    </div>
  );
}
