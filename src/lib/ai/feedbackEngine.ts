import { v4 as uuidv4 } from "uuid";
import type {
  FeedbackEvent,
  FeedbackRating,
  RoomKnowledgeIndex,
} from "@/types/ai-memory";

export function applyFeedbackToIndex(
  index: RoomKnowledgeIndex,
  event: FeedbackEvent
): RoomKnowledgeIndex {
  const next = structuredClone(index);

  if (event.chunkId) {
    const chunk = next.chunks.find((c) => c.id === event.chunkId);
    if (chunk) {
      if (event.rating === "helpful") chunk.confidence = Math.min(1, chunk.confidence + 0.06);
      if (event.rating === "not_helpful") chunk.confidence = Math.max(0.2, chunk.confidence - 0.08);
      if (event.rating === "correction" && event.correctionText) {
        chunk.text = event.correctionText;
        chunk.confidence = Math.min(1, chunk.confidence + 0.1);
      }
    }
  }

  if (event.conceptId) {
    let rec = next.conceptConfidence.find((c) => c.conceptId === event.conceptId);
    if (!rec) {
      rec = {
        conceptId: event.conceptId,
        score: 0.7,
        positiveFeedback: 0,
        negativeFeedback: 0,
        views: 0,
      };
      next.conceptConfidence.push(rec);
    }
    if (event.rating === "helpful") {
      rec.positiveFeedback += 1;
      rec.score = Math.min(1, rec.score + 0.04);
    }
    if (event.rating === "not_helpful") {
      rec.negativeFeedback += 1;
      rec.score = Math.max(0.25, rec.score - 0.06);
    }
    if (event.rating === "correction") {
      rec.positiveFeedback += 1;
      rec.score = Math.min(1, rec.score + 0.08);
    }
  }

  return next;
}

export function createFeedbackEvent(input: {
  roomId: string;
  rating: FeedbackRating;
  messageId?: string;
  conceptId?: string;
  chunkId?: string;
  correctionText?: string;
  question?: string;
  answer?: string;
}): FeedbackEvent {
  return {
    id: uuidv4(),
    roomId: input.roomId,
    messageId: input.messageId,
    conceptId: input.conceptId,
    chunkId: input.chunkId,
    rating: input.rating,
    correctionText: input.correctionText,
    question: input.question,
    answer: input.answer,
    createdAt: new Date().toISOString(),
  };
}
