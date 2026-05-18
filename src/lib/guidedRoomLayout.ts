import type { Concept, Relationship } from "@/types/learning";
import type { KnowledgeRoom } from "@/types/memory-palace";
import { resolveText } from "@/lib/multilingual";
import type { LanguageCode } from "@/types/learning";
import { findRelationship } from "@/lib/relationshipHelpers";

/** Virtual id for the central core topic (room title), not a concept node */
export const CORE_TOPIC_ID = "__core_topic__";

const MAIN_IDEA_LIMIT = 8;
const RING_RADIUS = 4.8;

export type MapDisplayMode = "simple" | "explore";

export interface GuidedLayout {
  coreTitle: string;
  mainIdeaIds: Set<string>;
  mainIdeas: Concept[];
  simplePositions: Map<string, { x: number; y: number; z: number }>;
}

export function buildGuidedLayout(room: KnowledgeRoom, language: LanguageCode): GuidedLayout {
  const coreTitle = resolveText(room.title, language);
  const sorted = [...room.concepts].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.importance] - order[b.importance];
  });

  let mainIdeas = sorted.filter((c) => c.importance === "high");
  if (mainIdeas.length < 3) {
    mainIdeas = sorted.slice(0, Math.min(MAIN_IDEA_LIMIT, sorted.length));
  } else {
    mainIdeas = mainIdeas.slice(0, MAIN_IDEA_LIMIT);
  }

  const simplePositions = new Map<string, { x: number; y: number; z: number }>();
  const count = mainIdeas.length;
  mainIdeas.forEach((concept, i) => {
    const angle = (i / Math.max(count, 1)) * Math.PI * 2 - Math.PI / 2;
    simplePositions.set(concept.id, {
      x: Math.cos(angle) * RING_RADIUS,
      y: (concept.importance === "high" ? 0.3 : 0) + Math.sin(angle * 2) * 0.2,
      z: Math.sin(angle) * RING_RADIUS,
    });
  });

  return {
    coreTitle,
    mainIdeaIds: new Set(mainIdeas.map((c) => c.id)),
    mainIdeas,
    simplePositions,
  };
}

/** Primary connections: core topic ↔ each main idea only */
export function getPrimaryConnections(
  layout: GuidedLayout
): { source: string; target: string }[] {
  return layout.mainIdeas.map((c) => ({
    source: CORE_TOPIC_ID,
    target: c.id,
  }));
}

/** All idea-to-idea connections (secondary) — hidden in Simple View */
export function getSecondaryRelationships(room: KnowledgeRoom): Relationship[] {
  return room.relationships;
}

export function getRelatedIdeaIds(room: KnowledgeRoom, conceptId: string): Set<string> {
  const ids = new Set<string>([conceptId]);
  for (const r of room.relationships) {
    if (r.source === conceptId) ids.add(r.target);
    if (r.target === conceptId) ids.add(r.source);
  }
  return ids;
}

export function getConceptPosition(
  concept: Concept,
  mode: MapDisplayMode,
  layout: GuidedLayout
): { x: number; y: number; z: number } {
  if (mode === "simple") {
    return layout.simplePositions.get(concept.id) ?? concept.position;
  }
  return concept.position;
}

export function getVisibleConcepts(
  room: KnowledgeRoom,
  mode: MapDisplayMode,
  layout: GuidedLayout
): Concept[] {
  if (mode === "explore") return room.concepts;
  return layout.mainIdeas;
}

export function getVisibleRelationships(
  room: KnowledgeRoom,
  mode: MapDisplayMode,
  layout: GuidedLayout
): Relationship[] {
  if (mode === "explore") return room.relationships;
  return layout.mainIdeas.map((c) => {
    const existing = room.relationships.find(
      (r) =>
        (r.source === c.id || r.target === c.id) &&
        layout.mainIdeaIds.has(r.source) &&
        layout.mainIdeaIds.has(r.target)
    );
    return (
      existing ?? {
        source: CORE_TOPIC_ID,
        target: c.id,
        label: "is part of",
      }
    );
  });
}

/** Key points from study guide that mention this idea */
export function getSummarizedPointsForIdea(
  room: KnowledgeRoom,
  concept: Concept,
  language: LanguageCode
): string[] {
  const title = resolveText(concept.title, language).toLowerCase();
  const points: string[] = [];

  for (const kp of room.studyGuide.keyPoints) {
    const text = resolveText(kp, language);
    if (text.toLowerCase().includes(title) || title.split(/\s+/).some((w) => w.length > 4 && text.toLowerCase().includes(w))) {
      points.push(text);
    }
  }

  if (points.length === 0 && concept.summary) {
    const sentences = resolveText(concept.summary, language)
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20);
    points.push(...sentences.slice(0, 3));
  }

  return points.slice(0, 4);
}

export function getConnectionToCoreText(
  room: KnowledgeRoom,
  concept: Concept,
  coreTitle: string,
  language: LanguageCode
): string {
  const rel = room.relationships.find(
    (r) => r.source === concept.id || r.target === concept.id
  );
  if (rel?.explanation) {
    return resolveText(rel.explanation, language);
  }
  return `${resolveText(concept.title, language)} is one of the main ideas in "${coreTitle}". Learning it helps you understand the whole topic.`;
}

export function resolveConnectionParties(
  room: KnowledgeRoom,
  idA: string,
  idB: string,
  coreTitle: string,
  language: LanguageCode
): { titleA: string; titleB: string; isCoreLink: boolean } {
  if (idA === CORE_TOPIC_ID || idB === CORE_TOPIC_ID) {
    const ideaId = idA === CORE_TOPIC_ID ? idB : idA;
    const idea = room.concepts.find((c) => c.id === ideaId);
    return {
      titleA: coreTitle,
      titleB: idea ? resolveText(idea.title, language) : "Idea",
      isCoreLink: true,
    };
  }
  const a = room.concepts.find((c) => c.id === idA);
  const b = room.concepts.find((c) => c.id === idB);
  return {
    titleA: a ? resolveText(a.title, language) : "Idea A",
    titleB: b ? resolveText(b.title, language) : "Idea B",
    isCoreLink: false,
  };
}

export function getCoreLinkRelationship(
  room: KnowledgeRoom,
  mainIdeaId: string,
  coreTitle: string
): Relationship {
  const concept = room.concepts.find((c) => c.id === mainIdeaId);
  const rel = concept
    ? findRelationship(room, mainIdeaId, room.concepts[0]?.id ?? mainIdeaId)
    : undefined;
  return {
    source: CORE_TOPIC_ID,
    target: mainIdeaId,
    label: "is part of",
    explanation: rel?.explanation,
    sourceExcerpt: concept?.sourceExcerpt,
    studyTip: rel?.studyTip,
    strength: "strong",
  };
}
