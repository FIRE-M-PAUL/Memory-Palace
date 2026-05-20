import { v4 as uuidv4 } from "uuid";
import { chunkLearningContent } from "@/lib/contentChunker";
import { resolveText } from "@/lib/multilingual";
import { embedTexts } from "@/lib/ai/embeddings";
import { cosineSimilarity, hashFingerprint, normalizeVector } from "@/lib/ai/vectorMath";
import type { KnowledgeRoom } from "@/types/memory-palace";
import type { LanguageCode } from "@/types/learning";
import type {
  MemoryChunk,
  MemoryChunkKind,
  RAGRetrievalHit,
  RoomKnowledgeIndex,
} from "@/types/ai-memory";

const INDEX_VERSION = 1;
const MIN_RETRIEVAL_SCORE = 0.12;

function chunkRecord(
  roomId: string,
  kind: MemoryChunkKind,
  title: string,
  text: string,
  vector: number[],
  opts: Partial<MemoryChunk> = {}
): MemoryChunk {
  return {
    id: opts.id ?? uuidv4(),
    roomId,
    conceptId: opts.conceptId,
    kind,
    title,
    text: text.trim(),
    vector,
    importance: opts.importance ?? "medium",
    confidence: opts.confidence ?? 0.72,
    keywords: opts.keywords ?? [],
    updatedAt: new Date().toISOString(),
  };
}

export async function buildRoomIndex(
  room: KnowledgeRoom,
  lang: LanguageCode = "en"
): Promise<RoomKnowledgeIndex> {
  const entries: { kind: MemoryChunkKind; title: string; text: string; conceptId?: string; importance?: MemoryChunk["importance"]; keywords?: string[] }[] = [];

  if (room.rawContent?.trim()) {
    for (const c of chunkLearningContent(room.rawContent)) {
      entries.push({
        kind: "raw",
        title: c.title,
        text: c.text,
        importance: c.importance,
        keywords: c.keywords,
      });
    }
  }

  for (const concept of room.concepts) {
    const title = resolveText(concept.title, lang);
    const summary = resolveText(concept.summary, lang);
    entries.push({
      kind: "concept-summary",
      title,
      text: summary,
      conceptId: concept.id,
      importance: concept.importance,
    });
    if (concept.whyItMatters) {
      entries.push({
        kind: "concept-why",
        title: `Importance of ${title}`,
        text: resolveText(concept.whyItMatters, lang),
        conceptId: concept.id,
        importance: "high",
      });
    }
    if (concept.sourceExcerpt) {
      entries.push({
        kind: "concept-excerpt",
        title,
        text: resolveText(concept.sourceExcerpt, lang),
        conceptId: concept.id,
        importance: concept.importance,
      });
    }
    if (concept.studyTip) {
      entries.push({
        kind: "study-tip",
        title,
        text: resolveText(concept.studyTip, lang),
        conceptId: concept.id,
        importance: "medium",
      });
    }
  }

  for (const rel of room.relationships) {
    const src = room.concepts.find((c) => c.id === rel.source);
    const tgt = room.concepts.find((c) => c.id === rel.target);
    if (!src || !tgt) continue;
    const text = rel.explanation
      ? resolveText(rel.explanation, lang)
      : `${resolveText(src.title, lang)} ${rel.label} ${resolveText(tgt.title, lang)}`;
    entries.push({
      kind: "relationship",
      title: `${resolveText(src.title, lang)} → ${resolveText(tgt.title, lang)}`,
      text,
      importance: "medium",
    });
  }

  const corpus = entries.map((e) => `${e.title}\n${e.text}`);
  const corpusOrSummary = corpus.length ? corpus : [resolveText(room.summary, lang)];
  const { vectors, provider, vocabulary } = await embedTexts(corpusOrSummary, corpusOrSummary);

  const chunks: MemoryChunk[] = entries.map((e, i) =>
    chunkRecord(room.id, e.kind, e.title, e.text, vectors[i] ?? [], {
      conceptId: e.conceptId,
      importance: e.importance,
      keywords: e.keywords,
    })
  );

  return {
    roomId: room.id,
    version: INDEX_VERSION,
    provider,
    vocabularySize: vectors[0]?.length ?? 0,
    vocabulary,
    chunks,
    conceptConfidence: room.concepts.map((c) => ({
      conceptId: c.id,
      score: c.importance === "high" ? 0.85 : c.importance === "medium" ? 0.72 : 0.58,
      positiveFeedback: 0,
      negativeFeedback: 0,
      views: 0,
    })),
    indexedAt: new Date().toISOString(),
    documentFingerprint: hashFingerprint(room.rawContent ?? resolveText(room.summary, lang)),
  };
}

export function retrieveFromIndex(
  index: RoomKnowledgeIndex,
  queryVector: number[],
  topK = 5
): RAGRetrievalHit[] {
  const hits: RAGRetrievalHit[] = [];
  for (const chunk of index.chunks) {
    if (chunk.vector.length !== queryVector.length) continue;
    let score = cosineSimilarity(queryVector, chunk.vector);
    score *= 0.85 + chunk.confidence * 0.15;
    if (chunk.importance === "high") score *= 1.08;
    const conf = index.conceptConfidence.find((c) => c.conceptId === chunk.conceptId);
    if (conf) score *= 0.9 + Math.min(conf.score, 1) * 0.1;
    hits.push({ chunk, score });
  }
  hits.sort((a, b) => b.score - a.score);
  return hits.filter((h) => h.score >= MIN_RETRIEVAL_SCORE).slice(0, topK);
}

export function mergeQueryVector(hits: RAGRetrievalHit[]): number[] | null {
  if (!hits.length) return null;
  const dim = hits[0].chunk.vector.length;
  const acc = new Array(dim).fill(0);
  let wSum = 0;
  for (const h of hits) {
    const w = h.score;
    wSum += w;
    for (let i = 0; i < dim; i++) acc[i] += h.chunk.vector[i] * w;
  }
  if (wSum === 0) return null;
  return normalizeVector(acc.map((x) => x / wSum));
}
