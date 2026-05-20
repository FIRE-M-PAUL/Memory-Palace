import type { KnowledgeRoom } from "@/types/memory-palace";
import type { LayerStack } from "@/types/nested-worlds";

export interface KnowledgeViewProps {
  room: KnowledgeRoom;
  selectedId: string | null;
  onSelectConcept: (id: string | null) => void;
  onSelectConnection?: (sourceId: string, targetId: string) => void;
  showStudyPath?: boolean;
  routeConceptIds?: string[];
  layerStack: LayerStack;
  layerKey: string;
  transitioning?: boolean;
  onConceptActivate: (conceptId: string) => void;
  onConceptDive?: (conceptId: string) => void;
  onSwitch2d?: () => void;
}
