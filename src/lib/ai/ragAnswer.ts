import { embedQuery } from "@/lib/ai/embeddings";
import { getTranslationsSync } from "@/lib/i18n";
import { resolveText } from "@/lib/multilingual";
import { buildRoomIndex, retrieveFromIndex } from "@/lib/ai/vectorIndex";
import {
  buildStrictRefusal,
  evaluateRetrieval,
  getMinRetrievalScore,
  RAG_SYSTEM_DIRECTIVE,
} from "@/lib/ai/ragPolicy";
import type { KnowledgeRoom } from "@/types/memory-palace";
import type { LanguageCode } from "@/types/learning";
import type {
  MemoryChunk,
  RAGAnswerResult,
  RAGRefusalReason,
  RoomKnowledgeIndex,
} from "@/types/ai-memory";

type QuestionIntent = "importance" | "definition" | "why" | "how" | "general";

function detectIntent(question: string): QuestionIntent {
  const q = question.toLowerCase();
  if (
    /\b(importance of|important|significance of|why (is|are) .+ important|why does .+ matter)\b/.test(
      q
    )
  ) {
    return "importance";
  }
  if (/\b(what is|what are|define|definition of|meaning of)\b/.test(q)) return "definition";
  if (/\bwhy\b/.test(q)) return "why";
  if (/\bhow (to|does|do|is|are)\b/.test(q)) return "how";
  return "general";
}

function formatAnswer(
  intent: QuestionIntent,
  topic: string,
  answer: string,
  lang: LanguageCode
): string {
  const t = getTranslationsSync(lang);
  const clean = answer.trim();
  if (!clean) return "";
  switch (intent) {
    case "importance":
      return t.answerImportance.replace("{topic}", topic).replace("{answer}", clean);
    case "definition":
      return t.answerWhatIs.replace("{topic}", topic).replace("{answer}", clean);
    case "why":
      return t.answerWhy.replace("{topic}", topic).replace("{answer}", clean);
    case "how":
      return t.answerHow.replace("{topic}", topic).replace("{answer}", clean);
    default:
      return t.answerGeneral.replace("{topic}", topic).replace("{answer}", clean);
  }
}

function pickFromHits(
  hits: { chunk: MemoryChunk; score: number }[],
  intent: QuestionIntent,
  room: KnowledgeRoom,
  lang: LanguageCode
): { topic: string; answer: string; conceptId?: string; chunkId: string; confidence: number } | null {
  if (!hits.length) return null;

  const preferWhy = intent === "importance" || intent === "why";
  const preferDef = intent === "definition";

  const ranked = [...hits].sort((a, b) => {
    let sa = a.score;
    let sb = b.score;
    if (preferWhy && a.chunk.kind === "concept-why") sa += 0.08;
    if (preferWhy && b.chunk.kind === "concept-why") sb += 0.08;
    if (preferDef && a.chunk.kind === "concept-summary") sa += 0.05;
    if (preferDef && b.chunk.kind === "concept-summary") sb += 0.05;
    return sb - sa;
  });

  const best = ranked[0];
  const concept = best.chunk.conceptId
    ? room.concepts.find((c) => c.id === best.chunk.conceptId)
    : undefined;
  const topic = concept ? resolveText(concept.title, lang) : best.chunk.title;

  let answer = best.chunk.text;
  if (preferWhy && concept?.whyItMatters) {
    answer = resolveText(concept.whyItMatters, lang);
  } else if (preferDef && concept) {
    answer = resolveText(concept.summary, lang);
  }

  if (!answer.trim()) return null;

  return {
    topic,
    answer,
    conceptId: best.chunk.conceptId,
    chunkId: best.chunk.id,
    confidence: Math.min(0.98, best.score),
  };
}

function refuse(
  reason: RAGRefusalReason,
  room: KnowledgeRoom,
  lang: LanguageCode,
  provider: RoomKnowledgeIndex["provider"],
  intent: QuestionIntent
): RAGAnswerResult {
  const roomTitle = resolveText(room.title, lang);
  return {
    answer: buildStrictRefusal(lang, reason, roomTitle),
    meta: {
      provider,
      confidence: 0,
      chunkIds: [],
      intent,
      refusalReason: reason,
      strictMode: true,
    },
    grounded: false,
    refused: true,
  };
}

/** Strict document-only RAG — never falls back to general knowledge or lexical guessing. */
export async function answerWithRAG(
  question: string,
  room: KnowledgeRoom,
  lang: LanguageCode,
  existingIndex?: RoomKnowledgeIndex | null
): Promise<RAGAnswerResult> {
  const intent = detectIntent(question);
  const trimmed = question.trim();

  let index = existingIndex ?? null;
  if (index && index.roomId !== room.id) {
    index = null;
  }

  index = index ?? (await buildRoomIndex(room, lang));

  if (!index.chunks.length) {
    return refuse("empty-index", room, lang, index.provider, intent);
  }

  const corpus = index.chunks.map((c) => `${c.title}\n${c.text}`);
  const queryVector = await embedQuery(trimmed, {
    provider: index.provider,
    corpus,
    vocabulary: index.vocabulary,
    sampleVector: index.chunks[0]?.vector,
  });

  const minScore = getMinRetrievalScore(index.provider);
  const hits = retrieveFromIndex(index, queryVector, 8, minScore);
  const evaluation = evaluateRetrieval(trimmed, hits, index.provider);

  if (!evaluation.ok || !evaluation.top) {
    return refuse(
      evaluation.reason ?? "no-retrieval",
      room,
      lang,
      index.provider,
      intent
    );
  }

  const picked = pickFromHits(hits, intent, room, lang);
  if (!picked || !picked.answer.trim()) {
    return refuse("no-retrieval", room, lang, index.provider, intent);
  }

  let response = formatAnswer(intent, picked.topic, picked.answer, lang);
  const t = getTranslationsSync(lang);

  const second = hits.find(
    (h) =>
      h.chunk.id !== picked.chunkId &&
      h.score >= minScore &&
      evaluateRetrieval(trimmed, [h], index.provider).ok
  );
  if (
    second &&
    second.chunk.text.trim() &&
    !picked.answer.includes(second.chunk.text.slice(0, 50))
  ) {
    response += `\n\n${t.answerAlsoInMaterial.replace("{excerpt}", second.chunk.text.slice(0, 280))}`;
  }

  return {
    answer: response,
    meta: {
      provider: index.provider,
      confidence: picked.confidence,
      chunkIds: hits.slice(0, 4).map((h) => h.chunk.id),
      conceptId: picked.conceptId,
      intent,
      strictMode: true,
      systemDirective: RAG_SYSTEM_DIRECTIVE,
    },
    grounded: true,
    refused: false,
  };
}

export { RAG_SYSTEM_DIRECTIVE };
