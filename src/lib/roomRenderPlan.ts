import type { Concept, Relationship } from "@/types/learning";
import type { KnowledgeRoom } from "@/types/memory-palace";
import type { LearningViewMode } from "@/types/learning-views";
import type { GuidedLayout } from "@/lib/guidedRoomLayout";
import { getRelatedIdeaIds } from "@/lib/guidedRoomLayout";
import { getConceptPositionForView } from "@/lib/viewLayouts";
import type { PerformanceProfile } from "@/lib/performanceProfile";

export interface RoomRenderPlan {
  mainIdeas: Concept[];
  supportingIdeas: Concept[];
  visibleConcepts: Concept[];
  visibleIds: Set<string>;
  positionCache: Map<string, { x: number; y: number; z: number }>;
  primaryRelationships: Relationship[];
  expandedRelationships: Relationship[];
  showExpandedLines: boolean;
}

function sortByImportance(concepts: Concept[]): Concept[] {
  const order = { high: 0, medium: 1, low: 2 };
  return [...concepts].sort((a, b) => order[a.importance] - order[b.importance]);
}

function capMainIdeas(layout: GuidedLayout, max: number): Concept[] {
  return layout.mainIdeas.slice(0, max);
}

function isPrimaryRelationship(rel: Relationship): boolean {
  return rel.strength !== "weak";
}

function filterRelationshipsForVisible(
  relationships: Relationship[],
  visibleIds: Set<string>,
  mode: "primary" | "expanded",
  maxLines: number
): Relationship[] {
  const matched = relationships.filter(
    (r) => visibleIds.has(r.source) && visibleIds.has(r.target)
  );

  if (mode === "expanded") {
    return matched.slice(0, maxLines);
  }

  const primary = matched.filter(isPrimaryRelationship);
  const pool = primary.length > 0 ? primary : matched;
  return pool.slice(0, Math.min(maxLines, pool.length));
}

/** Single cached render plan — progressive concepts & relationship lines */
export function buildRoomRenderPlan(
  room: KnowledgeRoom,
  view: LearningViewMode,
  layout: GuidedLayout,
  selectedId: string | null,
  revealSupporting: boolean,
  profile: PerformanceProfile
): RoomRenderPlan {
  const mainIdeas = capMainIdeas(layout, profile.maxMainIdeas);
  const mainIds = new Set(mainIdeas.map((c) => c.id));

  const supportingIdeas = sortByImportance(
    room.concepts.filter((c) => !mainIds.has(c.id))
  );

  let visibleConcepts: Concept[] = mainIdeas;
  const showExpandedLines = Boolean(selectedId || revealSupporting);

  if (selectedId) {
    const related = getRelatedIdeaIds(room, selectedId);
    const ids = new Set(mainIds);
    for (const id of related) ids.add(id);
    visibleConcepts = sortByImportance(
      room.concepts.filter((c) => ids.has(c.id))
    ).slice(0, profile.maxExpandedConcepts);
  } else if (revealSupporting) {
    visibleConcepts = sortByImportance(room.concepts).slice(
      0,
      profile.maxExpandedConcepts
    );
  }

  const visibleIds = new Set(visibleConcepts.map((c) => c.id));

  const positionCache = new Map<string, { x: number; y: number; z: number }>();
  for (const concept of visibleConcepts) {
    positionCache.set(
      concept.id,
      getConceptPositionForView(concept, view, layout)
    );
  }

  const primaryRelationships = filterRelationshipsForVisible(
    room.relationships,
    visibleIds,
    "primary",
    profile.maxRelationshipLines
  );

  const expandedRelationships = showExpandedLines
    ? filterRelationshipsForVisible(
        room.relationships,
        visibleIds,
        "expanded",
        profile.maxRelationshipLines
      )
    : [];

  return {
    mainIdeas,
    supportingIdeas,
    visibleConcepts,
    visibleIds,
    positionCache,
    primaryRelationships,
    expandedRelationships,
    showExpandedLines,
  };
}
