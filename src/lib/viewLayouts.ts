import type { Concept } from "@/types/learning";
import type { LearningViewMode } from "@/types/learning-views";
import type { GuidedLayout, MapDisplayMode } from "@/lib/guidedRoomLayout";
import { getConceptPosition } from "@/lib/guidedRoomLayout";
import type { KnowledgeRoom } from "@/types/memory-palace";
import { buildRoomRenderPlan } from "@/lib/roomRenderPlan";
import { getPerformanceProfile } from "@/lib/performanceProfile";


export function getMapModeForView(
  view: LearningViewMode,
  revealSupporting: boolean,
  selectedId: string | null
): MapDisplayMode {
  if (view === "explore") {
    return getExploreMapMode(revealSupporting, selectedId);
  }
  return "simple";
}

/** Explore uses progressive lines like other views; full graph only when expanded */
export function getExploreMapMode(
  revealSupporting: boolean,
  selectedId: string | null
): MapDisplayMode {
  return revealSupporting || selectedId ? "explore" : "simple";
}

export function getConceptPositionForView(
  concept: Concept,
  view: LearningViewMode,
  layout: GuidedLayout,
  profile = getPerformanceProfile()
): { x: number; y: number; z: number } {
  const creativeRadius = profile.creativeRadius;
  const roomRadius = profile.roomRadius;
  if (view === "explore") {
    return getConceptPosition(concept, "explore", layout);
  }

  const ringPos = layout.simplePositions.get(concept.id);
  if (!ringPos && view !== "creative" && view !== "room") {
    return concept.position;
  }

  if (view === "focus") {
    return ringPos ?? concept.position;
  }

  if (view === "creative") {
    const idx = layout.mainIdeas.findIndex((c) => c.id === concept.id);
    if (idx < 0) return concept.position;
    const count = layout.mainIdeas.length;
    const angle = (idx / Math.max(count, 1)) * Math.PI * 2 - Math.PI / 2;
    const lift = 0.8 + (concept.importance === "high" ? 0.6 : 0.3);
    return {
      x: Math.cos(angle) * creativeRadius,
      y: lift + Math.sin(angle * 3) * 0.25,
      z: Math.sin(angle) * creativeRadius,
    };
  }

  if (view === "room") {
    const idx = layout.mainIdeas.findIndex((c) => c.id === concept.id);
    if (idx < 0) return concept.position;
    const count = layout.mainIdeas.length;
    const angle = (idx / Math.max(count, 1)) * Math.PI * 2;
    return {
      x: Math.cos(angle) * roomRadius,
      y: 0.55,
      z: Math.sin(angle) * roomRadius,
    };
  }

  return ringPos ?? concept.position;
}

/** @deprecated Use buildRoomRenderPlan — kept for 2D graph */
export function getConceptsForView(
  room: KnowledgeRoom,
  view: LearningViewMode,
  layout: GuidedLayout,
  selectedId: string | null,
  revealSupporting: boolean
): Concept[] {
  const profile = getPerformanceProfile();
  const exploreMode =
    view === "explore" ? getExploreMapMode(revealSupporting, selectedId) : "simple";
  const plan = buildRoomRenderPlan(
    room,
    view,
    layout,
    selectedId,
    revealSupporting || exploreMode === "explore",
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
