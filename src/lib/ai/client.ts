"use client";

import { saveRoomIndex, getRoomIndex } from "@/lib/ai/aiMemoryStorage";
import { saveFeedbackEvent } from "@/lib/ai/aiMemoryStorage";
import { needsReindex } from "@/lib/ai/ingestPipeline";
import { saveRoom } from "@/lib/roomStorage";
import type { KnowledgeRoom } from "@/types/memory-palace";
import type { LanguageCode } from "@/types/learning";
import type {
  FeedbackRating,
  RoomKnowledgeIndex,
  RAGAnswerMeta,
} from "@/types/ai-memory";

export async function indexRoomOnClient(
  room: KnowledgeRoom,
  language: LanguageCode
): Promise<RoomKnowledgeIndex | null> {
  const existing = getRoomIndex(room.id);
  if (existing && !needsReindex(room, existing)) return existing;

  try {
    const res = await fetch("/api/ai/index-room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room, language }),
    });
    if (!res.ok) return existing;
    const data = await res.json();
    if (data.index) saveRoomIndex(data.index as RoomKnowledgeIndex);
    if (data.room) saveRoom(data.room as KnowledgeRoom);
    return data.index as RoomKnowledgeIndex;
  } catch {
    return existing;
  }
}

export async function askRoomWithRAG(
  question: string,
  room: KnowledgeRoom,
  language: LanguageCode,
  index: RoomKnowledgeIndex | null
): Promise<{
  answer: string;
  meta?: RAGAnswerMeta;
  grounded?: boolean;
  refused?: boolean;
}> {
  const res = await fetch("/api/ask-room", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, room, language, index }),
  });
  if (!res.ok) {
    throw new Error("Ask failed");
  }
  return res.json();
}

export async function sendAnswerFeedback(input: {
  roomId: string;
  rating: FeedbackRating;
  index: RoomKnowledgeIndex;
  messageId?: string;
  conceptId?: string;
  chunkId?: string;
  correctionText?: string;
  question?: string;
  answer?: string;
}): Promise<RoomKnowledgeIndex> {
  const res = await fetch("/api/ai/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) return input.index;
  const data = await res.json();
  if (data.event) saveFeedbackEvent(data.event);
  if (data.index) {
    saveRoomIndex(data.index);
    return data.index as RoomKnowledgeIndex;
  }
  return input.index;
}
