import type { LanguageCode } from "@/types/learning";

export type EmbeddingProvider = "openai" | "local-tfidf";

export type MemoryChunkKind =
  | "raw"
  | "concept-summary"
  | "concept-why"
  | "concept-excerpt"
  | "study-tip"
  | "relationship";

export interface MemoryChunk {
  id: string;
  roomId: string;
  conceptId?: string;
  kind: MemoryChunkKind;
  title: string;
  text: string;
  /** L2-normalized embedding vector */
  vector: number[];
  importance: "high" | "medium" | "low";
  confidence: number;
  keywords: string[];
  updatedAt: string;
}

export interface ConceptConfidenceRecord {
  conceptId: string;
  score: number;
  positiveFeedback: number;
  negativeFeedback: number;
  views: number;
  lastSeenAt?: string;
}

export interface RoomKnowledgeIndex {
  roomId: string;
  version: number;
  provider: EmbeddingProvider;
  vocabularySize: number;
  /** TF-IDF terms when provider is local-tfidf */
  vocabulary?: string[];
  chunks: MemoryChunk[];
  conceptConfidence: ConceptConfidenceRecord[];
  indexedAt: string;
  documentFingerprint: string;
}

export type FeedbackRating = "helpful" | "not_helpful" | "correction";

export interface FeedbackEvent {
  id: string;
  roomId: string;
  messageId?: string;
  conceptId?: string;
  chunkId?: string;
  rating: FeedbackRating;
  correctionText?: string;
  question?: string;
  answer?: string;
  createdAt: string;
}

export interface StudyInteraction {
  roomId: string;
  conceptId: string;
  type: "view" | "select" | "dive" | "study_path" | "quiz_miss";
  at: string;
}

export interface UserLearningProfile {
  userId: string;
  preferredDifficulty?: string;
  interactions: StudyInteraction[];
  globalPositiveFeedback: number;
  globalNegativeFeedback: number;
  updatedAt: string;
}

export interface RAGRetrievalHit {
  chunk: MemoryChunk;
  score: number;
}

export type RAGRefusalReason =
  | "off-topic"
  | "empty-index"
  | "no-retrieval"
  | "low-confidence"
  | "no-lexical-match"
  | "room-mismatch";

export interface RAGAnswerMeta {
  provider: EmbeddingProvider;
  confidence: number;
  chunkIds: string[];
  conceptId?: string;
  intent: string;
  /** Present when strict RAG refused to answer outside the notes */
  refusalReason?: RAGRefusalReason;
  strictMode?: boolean;
  systemDirective?: string;
}

export interface RAGAnswerResult {
  answer: string;
  meta: RAGAnswerMeta;
  grounded: boolean;
  refused?: boolean;
}

export interface IndexRoomRequest {
  room: import("@/types/memory-palace").KnowledgeRoom;
  language?: LanguageCode;
  force?: boolean;
}
