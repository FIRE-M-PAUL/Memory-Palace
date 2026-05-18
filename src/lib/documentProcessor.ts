import { cleanDocumentText } from "@/lib/documentCleaner";
import { chunkLearningContent } from "@/lib/contentChunker";
import { detectContentStart, removeFrontMatter } from "@/lib/frontMatterDetector";
import {
  extractLearningConcepts,
  extractionToRoom,
} from "@/lib/localKnowledgeEngine";
import type {
  DocumentProcessingResult,
  DocumentProcessingSummary,
} from "@/types/document-processing";
import { DocumentProcessingError } from "@/types/document-processing";
import type { KnowledgeRoom } from "@/types/memory-palace";

const MIN_LEARNING_CHARS = 280;
const MIN_CHUNKS = 1;
const MIN_CONCEPTS = 3;

function buildSummary(
  removedFrontMatter: boolean,
  sectionsFound: number,
  conceptsExtracted: number
): DocumentProcessingSummary {
  const messages = [
    "Cover pages and extra details removed",
    "Lesson content found",
    `${sectionsFound} learning section${sectionsFound === 1 ? "" : "s"} found`,
    `${conceptsExtracted} important idea${conceptsExtracted === 1 ? "" : "s"} found`,
    "Your Memory Room is ready from your real notes",
  ];
  return {
    coverAndMetadataRemoved: removedFrontMatter,
    learningContentDetected: sectionsFound > 0,
    sectionsFound,
    conceptsExtracted,
    messages,
  };
}

function assertEnoughContent(
  bodyText: string,
  chunkCount: number,
  conceptCount: number
): void {
  if (bodyText.length < MIN_LEARNING_CHARS) {
    throw new DocumentProcessingError(
      "We could not find enough lesson content. Try uploading notes with explanations, examples, or chapters."
    );
  }
  if (chunkCount < MIN_CHUNKS) {
    throw new DocumentProcessingError(
      "We could not find enough lesson content. Try uploading notes with explanations, examples, or chapters."
    );
  }
  if (conceptCount < MIN_CONCEPTS) {
    throw new DocumentProcessingError(
      "We could not find enough lesson content. Try uploading notes with explanations, examples, or chapters."
    );
  }
}

/**
 * Full pipeline: raw text → clean → strip front matter → chunk → concepts → KnowledgeRoom.
 */
export function processUploadedDocument(rawText: string): DocumentProcessingResult {
  const originalTextLength = rawText.length;
  const cleaned = cleanDocumentText(rawText);
  const { reason: detectedStartReason } = detectContentStart(cleaned);
  const { text: bodyText, removed: removedFrontMatter } = removeFrontMatter(cleaned);
  const chunks = chunkLearningContent(bodyText);
  const extraction = extractLearningConcepts(chunks, bodyText);

  assertEnoughContent(bodyText, chunks.length, extraction.concepts.length);

  const room: Omit<KnowledgeRoom, "id" | "createdAt"> = extractionToRoom(
    extraction,
    bodyText
  );

  const summary = buildSummary(
    removedFrontMatter,
    chunks.length,
    extraction.concepts.length
  );

  return {
    originalTextLength,
    cleanedTextLength: bodyText.length,
    removedFrontMatter,
    detectedStartReason,
    chunks,
    room,
    summary,
  };
}
