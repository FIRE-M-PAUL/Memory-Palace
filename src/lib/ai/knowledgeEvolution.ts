import { cosineSimilarity } from "@/lib/ai/vectorMath";
import type { KnowledgeRoom } from "@/types/memory-palace";
import type { Relationship } from "@/types/learning";
import type { RoomKnowledgeIndex } from "@/types/ai-memory";

const SIMILARITY_MERGE_THRESHOLD = 0.82;

/**
 * Infer weak semantic links between concepts that co-occur in embedding space.
 */
export function strengthenRelationshipsFromChunks(
  room: KnowledgeRoom,
  index: RoomKnowledgeIndex
): { room: KnowledgeRoom; added: number } {
  const concepts = room.concepts;
  const existing = new Set(
    room.relationships.map((r) => `${r.source}|${r.target}|${r.target}|${r.source}`)
  );

  const conceptChunks = index.chunks.filter((c) => c.conceptId && c.vector.length > 0);
  const byConcept = new Map<string, typeof conceptChunks>();
  for (const ch of conceptChunks) {
    const list = byConcept.get(ch.conceptId!) ?? [];
    list.push(ch);
    byConcept.set(ch.conceptId!, list);
  }

  const newRels: Relationship[] = [];
  const ids = concepts.map((c) => c.id);

  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const a = ids[i];
      const b = ids[j];
      const key = `${a}|${b}`;
      if (existing.has(key)) continue;

      const ca = byConcept.get(a)?.[0];
      const cb = byConcept.get(b)?.[0];
      if (!ca || !cb) continue;

      const sim = cosineSimilarity(ca.vector, cb.vector);
      if (sim < SIMILARITY_MERGE_THRESHOLD) continue;

      newRels.push({
        source: a,
        target: b,
        label: "relates to",
        strength: sim > 0.9 ? "medium" : "weak",
        explanation: {
          en: "These ideas appear closely connected in your uploaded material.",
        },
      });
      existing.add(key);
    }
  }

  if (!newRels.length) return { room, added: 0 };

  return {
    room: {
      ...room,
      relationships: [...room.relationships, ...newRels],
    },
    added: newRels.length,
  };
}

export function mergeGlobalTopicInsight(
  roomTitle: string,
  conceptTitle: string,
  uploadCount: number
): string | null {
  if (uploadCount < 2) return null;
  return `This topic connects with ${uploadCount - 1} other memory palaces you have explored.`;
}
