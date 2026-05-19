import type {
  Concept,
  Flashcard,
  MemoryRouteStep,
  MultilingualText,
  PracticeQuestion,
  Relationship,
  StudyGuide,
} from "@/types/learning";
import type { KnowledgeRoom } from "@/types/memory-palace";
import type { ContentChunk } from "@/types/document-processing";
import { mt } from "@/lib/multilingual";
import { getDemoRoom } from "@/lib/demoRoom";
import { isMetadataPhrase, isMetadataTerm } from "@/lib/conceptFilters";
import { enrichRelationship } from "@/lib/relationshipHelpers";
import { cleanDocumentText } from "@/lib/documentCleaner";
import { removeFrontMatter } from "@/lib/frontMatterDetector";
import { chunkLearningContent } from "@/lib/contentChunker";
import { DocumentProcessingError } from "@/types/document-processing";

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "is", "are",
  "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "could", "should", "may", "might", "must", "shall", "can", "this", "that", "these",
  "those", "it", "its", "they", "them", "their", "we", "our", "you", "your", "he", "she",
  "his", "her", "with", "from", "by", "as", "not", "no", "if", "then", "than", "when",
  "what", "which", "who", "how", "all", "each", "every", "both", "few", "more", "most",
  "other", "some", "such", "only", "own", "same", "so", "also", "just", "about", "into",
  "through", "during", "before", "after", "above", "below", "between", "under", "again",
]);

const CLUSTERS = ["Core Concepts", "Fundamentals", "Applications", "Process", "Examples"];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w));
}

function topKeywords(counts: Map<string, number>, n: number): string[] {
  return [...counts.entries()]
    .filter(([w]) => !isMetadataTerm(w))
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([w]) => w);
}

function countTermsWeighted(chunks: ContentChunk[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const chunk of chunks) {
    let weight =
      chunk.importance === "high" ? 3 : chunk.importance === "medium" ? 2 : 1;
    if (chunk.type === "definition" || chunk.type === "example") weight += 2;
    if (chunk.type === "chapter" || chunk.type === "section") weight += 1;

    for (const w of tokenize(chunk.text)) {
      if (!isMetadataTerm(w)) {
        counts.set(w, (counts.get(w) ?? 0) + weight);
      }
    }
    for (const kw of chunk.keywords) {
      if (!isMetadataTerm(kw)) {
        counts.set(kw, (counts.get(kw) ?? 0) + weight + 1);
      }
    }
  }
  return counts;
}

function excerptFromChunk(chunk: ContentChunk, keyword?: string): string {
  const sentences = chunk.text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  if (keyword) {
    const match = sentences.find((s) => s.toLowerCase().includes(keyword.toLowerCase()));
    if (match) return match.slice(0, 220);
  }
  const first = sentences[0];
  return (first ?? chunk.text).slice(0, 220);
}

function deriveRoomTitle(chunks: ContentChunk[]): string {
  const chapter = chunks.find(
    (c) =>
      (c.type === "chapter" || c.type === "section") &&
      c.importance !== "low" &&
      !isMetadataPhrase(c.title) &&
      c.title.length > 4
  );
  if (chapter) return chapter.title.slice(0, 80);
  const first = chunks.find((c) => c.text.length > 80 && !isMetadataPhrase(c.title));
  if (first) return first.title.slice(0, 80);
  return "Your Knowledge Palace";
}

function generatePositions(count: number): { x: number; y: number; z: number }[] {
  const positions: { x: number; y: number; z: number }[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(count - 1, 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const radius = 2.5 + (i % 3) * 0.8;
    positions.push({
      x: Math.cos(theta) * r * radius,
      y: y * 1.8,
      z: Math.sin(theta) * r * radius,
    });
  }
  return positions;
}

function titleCase(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function importanceFromRank(rank: number, total: number): "high" | "medium" | "low" {
  if (rank < total * 0.3) return "high";
  if (rank < total * 0.7) return "medium";
  return "low";
}

export interface LocalExtractionResult {
  title: MultilingualText;
  summary: MultilingualText;
  concepts: Concept[];
  relationships: Relationship[];
  studyGuide: StudyGuide;
  flashcards: Flashcard[];
  practiceQuestions: PracticeQuestion[];
  memoryRoute: MemoryRouteStep[];
}

/**
 * Extract concepts only from meaningful learning chunks (post front-matter removal).
 */
export function extractLearningConcepts(
  chunks: ContentChunk[],
  cleanedBodyText: string
): LocalExtractionResult {
  const learningChunks = chunks.filter(
    (c) => c.text.length > 40 && !isMetadataPhrase(c.title) && !isMetadataPhrase(c.text)
  );

  const bodyText =
    learningChunks.map((c) => c.text).join("\n\n") || cleanedBodyText.trim();

  if (bodyText.length < 40) {
    throw new DocumentProcessingError(
      "We could not find enough learning content in this document. Try uploading a document with chapters, sections, explanations, or paste the main content directly."
    );
  }

  const counts = countTermsWeighted(learningChunks.length > 0 ? learningChunks : chunks);
  const keywords = topKeywords(counts, 14);

  const headingConcepts: { title: string; excerpt: string; importance: Concept["importance"]; cluster: string }[] = [];
  for (const chunk of learningChunks) {
    if (
      (chunk.type === "chapter" ||
        chunk.type === "section" ||
        chunk.type === "definition") &&
      chunk.title.length > 5 &&
      chunk.title.length < 100 &&
      !isMetadataPhrase(chunk.title)
    ) {
      const titleWords = tokenize(chunk.title);
      if (titleWords.every(isMetadataTerm)) continue;
      headingConcepts.push({
        title: chunk.title,
        excerpt: excerptFromChunk(chunk),
        importance: chunk.importance === "low" ? "medium" : chunk.importance,
        cluster:
          chunk.type === "chapter"
            ? "Core Concepts"
            : chunk.type === "definition"
              ? "Fundamentals"
              : CLUSTERS[headingConcepts.length % CLUSTERS.length],
      });
    }
  }

  const seenTitles = new Set<string>();
  const conceptSeeds: {
    title: string;
    keyword?: string;
    excerpt: string;
    importance: Concept["importance"];
    cluster: string;
  }[] = [];

  for (const h of headingConcepts.slice(0, 6)) {
    const key = h.title.toLowerCase();
    if (!seenTitles.has(key)) {
      seenTitles.add(key);
      conceptSeeds.push({ title: h.title, excerpt: h.excerpt, importance: h.importance, cluster: h.cluster });
    }
  }

  for (const kw of keywords) {
    if (conceptSeeds.length >= 12) break;
    const key = kw.toLowerCase();
    if (seenTitles.has(key)) continue;
    const host =
      learningChunks.find((c) => c.text.toLowerCase().includes(kw)) ??
      chunks.find((c) => c.text.toLowerCase().includes(kw));
    if (!host) continue;
    const excerpt = excerptFromChunk(host, kw);
    if (excerpt.length < 25) continue;
    seenTitles.add(key);
    conceptSeeds.push({
      title: titleCase(kw),
      keyword: kw,
      excerpt,
      importance: host.importance,
      cluster: CLUSTERS[conceptSeeds.length % CLUSTERS.length],
    });
  }

  if (conceptSeeds.length < 3) {
    throw new DocumentProcessingError(
      "We could not find enough learning content in this document. Try uploading a document with chapters, sections, explanations, or paste the main content directly."
    );
  }

  const positions = generatePositions(conceptSeeds.length);
  const concepts: Concept[] = conceptSeeds.slice(0, 12).map((seed, i) => ({
    id: `concept-${i + 1}`,
    title: mt(seed.title.length > 50 ? seed.title.slice(0, 50) : seed.title),
    summary: mt(
      seed.excerpt.length > 80
        ? seed.excerpt
        : `Key idea: ${seed.title} from your learning material.`
    ),
    importance: seed.importance ?? importanceFromRank(i, conceptSeeds.length),
    cluster: seed.cluster,
    sourceExcerpt: mt(seed.excerpt),
    position: positions[i],
  }));

  const relationships = buildRelationships(concepts, conceptSeeds, learningChunks, bodyText);

  const primaryChunk =
    learningChunks.find((c) => c.importance === "high") ?? learningChunks[0];
  const overviewSource = primaryChunk?.text ?? bodyText;
  const overview = overviewSource.slice(0, 320) + (overviewSource.length > 320 ? "..." : "");

  const studyGuide: StudyGuide = {
    overview: mt(overview),
    keyPoints: concepts.slice(0, 6).map((c) => mt(`${c.title.en}: ${c.summary.en}`)),
    questions: concepts.slice(0, 5).map((c) => mt(`What is ${c.title.en}?`)),
    flashcards: concepts.slice(0, 6).map((c, i) => ({
      id: `fc-${i}`,
      front: c.title,
      back: c.summary,
      conceptId: c.id,
    })),
  };

  const flashcards = studyGuide.flashcards;
  const practiceQuestions: PracticeQuestion[] = concepts.slice(0, 5).map((c, i) => ({
    id: `q-${i}`,
    type: "short-answer" as const,
    question: mt(`Explain ${c.title.en} in your own words.`),
    answer: c.summary.en.toLowerCase(),
    explanation: c.summary,
    difficulty: c.importance === "high" ? "medium" : "easy",
    hints: [mt(`Think about: ${c.sourceExcerpt?.en ?? c.summary.en}`)],
  }));

  const memoryRoute: MemoryRouteStep[] = concepts
    .filter((c) => c.importance !== "low")
    .slice(0, 8)
    .map((c, i) => ({
      step: i + 1,
      conceptId: c.id,
      title: c.title,
      explanation: c.summary,
      reason: mt(
        i === 0
          ? `Start here because ${c.title.en} is one of the main ideas.`
          : `Study this next to build on what you learned before.`
      ),
    }));

  const roomTitle = deriveRoomTitle(learningChunks.length > 0 ? learningChunks : chunks);
  return {
    title: mt(roomTitle),
    summary: mt(overview),
    concepts,
    relationships,
    studyGuide,
    flashcards,
    practiceQuestions,
    memoryRoute,
  };
}

function buildRelationships(
  concepts: Concept[],
  seeds: { keyword?: string; title: string }[],
  chunks: ContentChunk[],
  bodyText: string
): Relationship[] {
  const relationships: Relationship[] = [];
  const keywords = seeds.map((s) => s.keyword ?? s.title.toLowerCase()).filter(Boolean);
  const paragraphs = bodyText.split(/\n\n+/).filter(Boolean);

  for (let i = 0; i < concepts.length; i++) {
    for (let j = i + 1; j < concepts.length; j++) {
      const kwA = keywords[i];
      const kwB = keywords[j];
      if (!kwA || !kwB) continue;
      const sameChunk = chunks.some(
        (c) =>
          c.text.toLowerCase().includes(kwA) && c.text.toLowerCase().includes(kwB)
      );
      const sharedPara = paragraphs.some(
        (p) => p.toLowerCase().includes(kwA) && p.toLowerCase().includes(kwB)
      );
      if (sameChunk) {
        relationships.push(
          enrichRelationship(
            {
              source: concepts[i].id,
              target: concepts[j].id,
              label: "is part of",
              strength: "medium",
            },
            concepts
          )
        );
      } else if (sharedPara) {
        relationships.push(
          enrichRelationship(
            {
              source: concepts[i].id,
              target: concepts[j].id,
              label: "is similar to",
              strength: "weak",
            },
            concepts
          )
        );
      }
    }
  }

  for (let i = 0; i < chunks.length - 1; i++) {
    const idsInChunk = concepts
      .map((c, idx) => ({ c, kw: keywords[idx] }))
      .filter(({ kw }) => kw && chunks[i].text.toLowerCase().includes(kw))
      .map(({ c }) => c.id);
    for (let a = 0; a < idsInChunk.length; a++) {
      for (let b = a + 1; b < idsInChunk.length; b++) {
        if (
          !relationships.some(
            (r) =>
              (r.source === idsInChunk[a] && r.target === idsInChunk[b]) ||
              (r.source === idsInChunk[b] && r.target === idsInChunk[a])
          )
        ) {
          relationships.push(
            enrichRelationship(
              {
                source: idsInChunk[a],
                target: idsInChunk[b],
                label: "is part of",
                strength: "strong",
              },
              concepts
            )
          );
        }
      }
    }
  }

  if (relationships.length === 0 && concepts.length > 1) {
    for (let i = 0; i < concepts.length - 1; i++) {
      relationships.push(
        enrichRelationship(
          {
            source: concepts[i].id,
            target: concepts[i + 1].id,
            label: "leads to",
            strength: "strong",
          },
          concepts
        )
      );
    }
  }
  return relationships;
}

/** Legacy entry — runs cleaning pipeline; throws if content is insufficient. */
export function extractKnowledgeFromText(rawContent: string): LocalExtractionResult {
  const text = rawContent.trim();
  if (text.length < 40) {
    return roomToExtraction(getDemoRoom());
  }

  try {
    const cleaned = cleanDocumentText(text);
    const { text: body } = removeFrontMatter(cleaned);
    const chunks = chunkLearningContent(body);
    return extractLearningConcepts(chunks, body);
  } catch (e) {
    if (e instanceof DocumentProcessingError) throw e;
    return roomToExtraction(getDemoRoom());
  }
}

function roomToExtraction(room: KnowledgeRoom): LocalExtractionResult {
  return {
    title: room.title,
    summary: room.summary,
    concepts: room.concepts,
    relationships: room.relationships,
    studyGuide: room.studyGuide,
    flashcards: room.flashcards,
    practiceQuestions: room.practiceQuestions,
    memoryRoute: room.memoryRoute,
  };
}

export function extractionToRoom(
  extraction: LocalExtractionResult,
  rawContent?: string,
  meta?: {
    subject?: KnowledgeRoom["subject"];
    difficulty?: KnowledgeRoom["difficulty"];
    lessonId?: string;
  }
): Omit<KnowledgeRoom, "id" | "createdAt"> {
  return {
    title: extraction.title,
    summary: extraction.summary,
    rawContent,
    subject: meta?.subject,
    difficulty: meta?.difficulty,
    lessonId: meta?.lessonId,
    concepts: extraction.concepts,
    relationships: extraction.relationships,
    studyGuide: extraction.studyGuide,
    flashcards: extraction.flashcards,
    practiceQuestions: extraction.practiceQuestions,
    memoryRoute: extraction.memoryRoute,
  };
}
