import { hashFingerprint } from "@/lib/ai/vectorMath";
import { buildRoomIndex } from "@/lib/ai/vectorIndex";
import { strengthenRelationshipsFromChunks } from "@/lib/ai/knowledgeEvolution";
import type { KnowledgeRoom } from "@/types/memory-palace";
import type { LanguageCode } from "@/types/learning";
import type { RoomKnowledgeIndex } from "@/types/ai-memory";

export interface IngestResult {
  index: RoomKnowledgeIndex;
  room: KnowledgeRoom;
  newRelationships: number;
}

/**
 * Full learning loop step 1: index upload → embeddings → memory chunks → graph hints.
 */
export async function ingestRoomKnowledge(
  room: KnowledgeRoom,
  lang: LanguageCode = "en"
): Promise<IngestResult> {
  const index = await buildRoomIndex(room, lang);
  const { room: evolved, added } = strengthenRelationshipsFromChunks(room, index);
  return {
    index,
    room: evolved,
    newRelationships: added,
  };
}

export function needsReindex(
  room: KnowledgeRoom,
  existing: RoomKnowledgeIndex | null
): boolean {
  if (!existing) return true;
  const fp = hashFingerprint(room.rawContent ?? "");
  return existing.documentFingerprint !== fp || existing.version < 1;
}
