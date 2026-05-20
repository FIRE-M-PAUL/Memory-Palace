import type { Concept } from "@/types/learning";
import type { GuidedLayout, MapDisplayMode } from "@/lib/guidedRoomLayout";
import { getConceptPosition } from "@/lib/guidedRoomLayout";
import type { KnowledgeRoom } from "@/types/memory-palace";
import { buildRoomRenderPlan } from "@/lib/roomRenderPlan";
import { getPerformanceProfile } from "@/lib/performanceProfile";
export function getMapModeForView(): MapDisplayMode {
  return "simple";
}

export function getConceptPositionForView(
  concept: Concept,
  layout: GuidedLayout
): { x: number; y: number; z: number } {
  const ringPos = layout.simplePositions.get(concept.id);
  const raw = ringPos ?? getConceptPosition(concept, "explore", layout);
  return raw;
}

/** @deprecated Use buildRoomRenderPlan — kept for 2D graph */
export function getConceptsForView(
  room: KnowledgeRoom,
  layout: GuidedLayout,
  selectedId: string | null,
  revealSupporting: boolean
): Concept[] {
  const profile = getPerformanceProfile();
  const plan = buildRoomRenderPlan(
    room,
    layout,
    selectedId,
    revealSupporting,
    profile
  );
  return plan.visibleConcepts;
}

export function getStudyPathIndex(
  conceptId: string,
  routeConceptIds: string[]
): number | null {
  const idx = routeConceptIds.indexOf(conceptId);
  return idx >= 0 ? idx + 1 : null;
}
