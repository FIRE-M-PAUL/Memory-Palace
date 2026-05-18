import type { KnowledgeRoom } from "@/types/memory-palace";

export type ContentChunkType =
  | "chapter"
  | "section"
  | "definition"
  | "example"
  | "exercise"
  | "paragraph";

export interface ContentChunk {
  id: string;
  title: string;
  text: string;
  type: ContentChunkType;
  importance: "high" | "medium" | "low";
  keywords: string[];
}

export interface DocumentProcessingSummary {
  coverAndMetadataRemoved: boolean;
  learningContentDetected: boolean;
  sectionsFound: number;
  conceptsExtracted: number;
  messages: string[];
}

export interface DocumentProcessingResult {
  originalTextLength: number;
  cleanedTextLength: number;
  removedFrontMatter: boolean;
  detectedStartReason: string;
  chunks: ContentChunk[];
  room: Omit<KnowledgeRoom, "id" | "createdAt">;
  summary: DocumentProcessingSummary;
}

export class DocumentProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentProcessingError";
  }
}
