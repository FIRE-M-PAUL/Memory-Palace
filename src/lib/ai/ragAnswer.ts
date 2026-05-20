import { embedQuery } from "@/lib/ai/embeddings";
import { searchPalace } from "@/lib/localSearch";
import { getTranslationsSync } from "@/lib/i18n";
import { resolveText } from "@/lib/multilingual";
import { buildRoomIndex, retrieveFromIndex } from "@/lib/ai/vectorIndex";
import type { KnowledgeRoom } from "@/types/memory-palace";
import type { LanguageCode } from "@/types/learning";
import type { MemoryChunk, RAGAnswerResult, RoomKnowledgeIndex } from "@/types/ai-memory";

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
    if (preferWhy && a.chunk.kind === "concept-why") sa += 0.15;
    if (preferWhy && b.chunk.kind === "concept-why") sb += 0.15;
    if (preferDef && a.chunk.kind === "concept-summary") sa += 0.1;
    if (preferDef && b.chunk.kind === "concept-summary") sb += 0.1;
    if (a.chunk.kind === "raw") sa += 0.04;
    if (b.chunk.kind === "raw") sb += 0.04;
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

  return {
    topic,
    answer,
    conceptId: best.chunk.conceptId,
    chunkId: best.chunk.id,
    confidence: Math.min(0.98, best.score * 1.15),
  };
}

export async function answerWithRAG(
  question: string,
  room: KnowledgeRoom,
  lang: LanguageCode,
  existingIndex?: RoomKnowledgeIndex | null
): Promise<RAGAnswerResult> {
  const intent = detectIntent(question);
  const index = existingIndex ?? (await buildRoomIndex(room, lang));

  const corpus = index.chunks.map((c) => `${c.title}\n${c.text}`);
  const queryVector = await embedQuery(question, {
    provider: index.provider,
    corpus,
    vocabulary: index.vocabulary,
    sampleVector: index.chunks[0]?.vector,
  });

  const hits = retrieveFromIndex(index, queryVector, 6);
  const picked = pickFromHits(hits, intent, room, lang);

  if (!picked || picked.confidence < 0.14) {
    const fallback = searchPalace(question, room, lang);
    return {
      answer: fallback,
      meta: {
        provider: index.provider,
        confidence: 0.35,
        chunkIds: [],
        intent,
      },
      grounded: false,
    };
  }

  let response = formatAnswer(intent, picked.topic, picked.answer, lang);
  const t = getTranslationsSync(lang);

  const second = hits.find((h) => h.chunk.id !== picked.chunkId && h.score > 0.2);
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
      chunkIds: hits.map((h) => h.chunk.id),
      conceptId: picked.conceptId,
      intent,
    },
    grounded: true,
  };
}
