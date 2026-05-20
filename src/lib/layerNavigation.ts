import type { Concept, Relationship } from "@/types/learning";
import type { KnowledgeRoom } from "@/types/memory-palace";
import type { GuidedLayout } from "@/lib/guidedRoomLayout";
import { buildGuidedLayout } from "@/lib/guidedRoomLayout";
import type { PerformanceProfile } from "@/lib/performanceProfile";
import { getConceptPositionForView } from "@/lib/viewLayouts";
import { resolveText } from "@/lib/multilingual";
import type { LanguageCode } from "@/types/learning";
import type { LayerStack, LearningLayerFrame } from "@/types/nested-worlds";
import { MAX_LAYER_DEPTH } from "@/types/nested-worlds";

export interface LayerRenderPlan {
  layerDepth: number;
  focusConceptId: string | null;
  layerCoreTitle: string;
  visibleConcepts: Concept[];
  visibleIds: Set<string>;
  positionCache: Map<string, { x: number; y: number; z: number }>;
  localRelationships: Relationship[];
}

function ringByDepth(profile: PerformanceProfile): number[] {
  const base = profile.isMobile
    ? [5.6, 4.6, 3.8, 3.2]
    : profile.viewport === "tablet"
      ? [5.2, 4.4, 3.6, 3]
      : [4.8, 4.2, 3.5, 3];
  return base;
}

function scalePosition(
  pos: { x: number; y: number; z: number },
  scale: number
): { x: number; y: number; z: number } {
  return { x: pos.x * scale, y: pos.y, z: pos.z * scale };
}

function importanceScore(c: Concept): number {
  return c.importance === "high" ? 2 : c.importance === "medium" ? 1 : 0;
}

function relationshipScore(rel: Relationship): number {
  if (rel.strength === "strong") return 3;
  if (rel.strength === "weak") return 0;
  return 2;
}

/** Concept limit per nested layer depth */
export function getConceptLimitForDepth(
  depth: number,
  profile: PerformanceProfile
): number {
  if (depth <= 0) return profile.maxMainIdeas;
  if (depth === 1) return profile.maxExpandedConcepts;
  return profile.isMobile ? 4 : 6;
}

export function createRootLayerFrame(
  room: KnowledgeRoom,
  language: LanguageCode
): LearningLayerFrame {
  return {
    focusConceptId: null,
    title: resolveText(room.title, language),
  };
}

export function getLayerDepth(stack: LayerStack): number {
  return Math.max(0, stack.length - 1);
}

export function getExcludedConceptIds(stack: LayerStack): Set<string> {
  const ids = new Set<string>();
  for (const frame of stack) {
    if (frame.focusConceptId) ids.add(frame.focusConceptId);
  }
  return ids;
}

/** Neighbor sub-ideas for nested world (lazy, graph-derived) */
export function getChildConcepts(
  room: KnowledgeRoom,
  parentId: string,
  excludeIds: Set<string>,
  limit: number
): Concept[] {
  const scored = new Map<string, { concept: Concept; score: number }>();

  for (const rel of room.relationships) {
    if (rel.strength === "weak") continue;
    let childId: string | null = null;
    if (rel.source === parentId) childId = rel.target;
    else if (rel.target === parentId) childId = rel.source;
    if (!childId || excludeIds.has(childId) || childId === parentId) continue;

    const concept = room.concepts.find((c) => c.id === childId);
    if (!concept) continue;

    const score = relationshipScore(rel) + importanceScore(concept);
    const prev = scored.get(childId);
    if (!prev || score > prev.score) {
      scored.set(childId, { concept, score });
    }
  }

  return [...scored.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.concept);
}

export function canDiveDeeper(
  room: KnowledgeRoom,
  conceptId: string,
  stack: LayerStack
): boolean {
  if (getLayerDepth(stack) >= MAX_LAYER_DEPTH - 1) return false;
  const exclude = getExcludedConceptIds(stack);
  exclude.add(conceptId);
  const children = getChildConcepts(room, conceptId, exclude, 1);
  return children.length > 0;
}

export function enterLayer(
  stack: LayerStack,
  room: KnowledgeRoom,
  conceptId: string,
  language: LanguageCode
): LayerStack {
  const concept = room.concepts.find((c) => c.id === conceptId);
  if (!concept || !canDiveDeeper(room, conceptId, stack)) return stack;
  return [
    ...stack,
    {
      focusConceptId: conceptId,
      title: resolveText(concept.title, language),
    },
  ];
}

export function leaveLayer(stack: LayerStack): LayerStack {
  if (stack.length <= 1) return stack;
  return stack.slice(0, -1);
}

export function goToRootLayer(
  room: KnowledgeRoom,
  language: LanguageCode
): LayerStack {
  return [createRootLayerFrame(room, language)];
}

function computeLayerPositions(
  concepts: Concept[],
  layout: GuidedLayout,
  depth: number,
  profile: PerformanceProfile
): Map<string, { x: number; y: number; z: number }> {
  const positions = new Map<string, { x: number; y: number; z: number }>();
  const rings = ringByDepth(profile);
  const radius = rings[Math.min(depth, rings.length - 1)];
  const count = concepts.length;

  concepts.forEach((concept, i) => {
    if (depth === 0) {
      const ring = layout.simplePositions.get(concept.id);
      const raw = ring ?? getConceptPositionForView(concept, layout);
      positions.set(concept.id, scalePosition(raw, profile.ringScale));
      return;
    }
    const angle = (i / Math.max(count, 1)) * Math.PI * 2 - Math.PI / 2;
    positions.set(concept.id, {
      x: Math.cos(angle) * radius,
      y: (concept.importance === "high" ? 0.25 : 0) + Math.sin(angle * 2) * 0.15,
      z: Math.sin(angle) * radius,
    });
  });

  return positions;
}

function filterLocalRelationships(
  relationships: Relationship[],
  visibleIds: Set<string>,
  focusId: string | null,
  maxLines: number
): Relationship[] {
  const local = relationships.filter((r) => {
    if (r.strength === "weak") return false;
    if (!visibleIds.has(r.source) || !visibleIds.has(r.target)) return false;
    if (focusId && r.source !== focusId && r.target !== focusId) {
      return r.strength === "strong";
    }
    return true;
  });

  const strong = local.filter((r) => r.strength === "strong" || !r.strength);
  const pool = strong.length > 0 ? strong : local;
  return pool.slice(0, maxLines);
}

/**
 * Render plan for ONE learning layer only — core performance optimization.
 */
export function buildLayerRenderPlan(
  room: KnowledgeRoom,
  stack: LayerStack,
  layout: GuidedLayout,
  profile: PerformanceProfile,
  language: LanguageCode
): LayerRenderPlan {
  const frame = stack[stack.length - 1];
  const depth = getLayerDepth(stack);
  const limit = getConceptLimitForDepth(depth, profile);
  const exclude = getExcludedConceptIds(stack);

  let visibleConcepts: Concept[];
  let layerCoreTitle: string;
  const focusConceptId = frame.focusConceptId;

  if (focusConceptId === null) {
    visibleConcepts = layout.mainIdeas.slice(0, limit);
    layerCoreTitle = layout.coreTitle;
  } else {
    const focus = room.concepts.find((c) => c.id === focusConceptId);
    layerCoreTitle = focus ? resolveText(focus.title, language) : frame.title;
    visibleConcepts = getChildConcepts(room, focusConceptId, exclude, limit);
  }

  const visibleIds = new Set(visibleConcepts.map((c) => c.id));
  const positionCache = computeLayerPositions(
    visibleConcepts,
    layout,
    depth,
    profile
  );

  const localRelationships = filterLocalRelationships(
    room.relationships,
    visibleIds,
    focusConceptId,
    profile.maxRelationshipLines
  );

  return {
    layerDepth: depth,
    focusConceptId,
    layerCoreTitle,
    visibleConcepts,
    visibleIds,
    positionCache,
    localRelationships,
  };
}

export function buildLayerStackKey(stack: LayerStack): string {
  return stack.map((f) => f.focusConceptId ?? "root").join("/");
}

export function attachChildrenMetadata(
  room: KnowledgeRoom,
  conceptId: string,
  excludeIds: Set<string>,
  limit: number
): Concept | undefined {
  const concept = room.concepts.find((c) => c.id === conceptId);
  if (!concept) return undefined;
  const children = getChildConcepts(room, conceptId, excludeIds, limit);
  return {
    ...concept,
    children,
  };
}

export function getLayoutForRoom(room: KnowledgeRoom, language: LanguageCode) {
  return buildGuidedLayout(room, language);
}
