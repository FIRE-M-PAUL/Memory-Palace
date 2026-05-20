"use client";

import dynamic from "next/dynamic";
import type { KnowledgeRoom } from "@/types/memory-palace";
import type { LayerStack } from "@/types/nested-worlds";
import { SceneLoadingView } from "@/components/3d/SceneLoadingView";

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
  layerStack: LayerStack;
  layerKey: string;
  transitioning?: boolean;
}

const FocusView = dynamic(
  () => import("@/components/views/FocusView").then((m) => m.FocusView),
  { ssr: false, loading: () => <SceneLoadingView /> }
);

export function KnowledgeRoom3D(props: KnowledgeRoom3DProps) {
  return (
    <div className="w-full h-full transition-opacity duration-300">
      <FocusView {...props} />
    </div>
  );
}
