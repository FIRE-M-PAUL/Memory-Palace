import { tokenize } from "@/lib/ai/vectorMath";
import { getTranslationsSync } from "@/lib/i18n";
import type { LanguageCode } from "@/types/learning";
import type { EmbeddingProvider, MemoryChunk, RAGRefusalReason } from "@/types/ai-memory";

/** Document-grounded assistant — no general-knowledge answers. */
export const RAG_SYSTEM_DIRECTIVE =
  "You are a document-grounded study assistant for MEMORY PALACE. " +
  "You may ONLY answer using retrieved content from the user's uploaded notes for this memory room. " +
  "If the answer is not supported by retrieved note chunks, refuse politely. " +
  "Never use outside knowledge, pretrained facts, or general chatbot behavior.";

const STOP_WORDS = new Set([
  "what",
  "whats",
  "the",
  "is",
  "are",
  "was",
  "were",
  "of",
  "a",
  "an",
  "and",
  "or",
  "in",
  "on",
  "to",
  "for",
  "why",
  "how",
  "does",
  "do",
  "did",
  "can",
  "could",
  "would",
  "should",
  "about",
  "explain",
  "define",
  "meaning",
  "importance",
  "important",
  "tell",
  "me",
  "please",
  "describe",
  "who",
  "when",
  "where",
  "which",
]);

export function getMinRetrievalScore(provider: EmbeddingProvider): number {
  return provider === "openai" ? 0.28 : 0.17;
}

export function getMinTopScoreToAnswer(provider: EmbeddingProvider): number {
  return provider === "openai" ? 0.34 : 0.22;
}

export function getHighSemanticBypass(provider: EmbeddingProvider): number {
  return provider === "openai" ? 0.44 : 0.32;
}

export function extractSignificantTerms(question: string): string[] {
  return tokenize(question).filter((w) => !STOP_WORDS.has(w));
}

/** Obvious general-knowledge / calculator-style prompts. */
export function isOffTopicQuestion(question: string): boolean {
  const q = question.trim().toLowerCase();
  if (!q) return true;

  if (
    /what\s+is\s+\d+\s*(\+|plus|minus|times|multiplied|divided|×|÷|\*|-)\s*\d+/i.test(q) ||
    /how\s+(much|many)\s+is\s+\d+\s*(\+|plus|-|\*|×|÷)/i.test(q) ||
    /^\s*\d+\s*(\+|plus|-|\*|×|÷)\s*\d+\s*\??\s*$/i.test(q) ||
    /^(solve|calculate|compute)\s+\d/i.test(q)
  ) {
    return true;
  }

  if (
    /^(who|when|where)\s+(is|was|are|were)\s+(the\s+)?(president|weather|time|date|capital)/i.test(
      q
    )
  ) {
    return true;
  }

  return false;
}

export function queryTermOverlapRatio(question: string, material: string): number {
  const terms = extractSignificantTerms(question);
  if (!terms.length) return 0;
  const hay = material.toLowerCase();
  let hits = 0;
  for (const term of terms) {
    if (hay.includes(term)) hits += 1;
  }
  return hits / terms.length;
}

export function passesLexicalGrounding(
  question: string,
  chunk: MemoryChunk,
  topScore: number,
  provider: EmbeddingProvider
): boolean {
  const material = `${chunk.title}\n${chunk.text}`;
  const overlap = queryTermOverlapRatio(question, material);
  const terms = extractSignificantTerms(question);

  if (overlap >= 0.25) return true;
  if (terms.length === 1 && overlap >= 1) return true;

  const highSemantic = topScore >= getHighSemanticBypass(provider);
  if (highSemantic && overlap > 0) return true;

  if (terms.length === 0 && highSemantic) return true;

  return false;
}

export function evaluateRetrieval(
  question: string,
  hits: { chunk: MemoryChunk; score: number }[],
  provider: EmbeddingProvider
): {
  ok: boolean;
  reason?: RAGRefusalReason;
  top?: { chunk: MemoryChunk; score: number };
} {
  if (isOffTopicQuestion(question)) {
    return { ok: false, reason: "off-topic" };
  }

  const top = hits[0];
  if (!top) {
    return { ok: false, reason: "no-retrieval" };
  }

  const minTop = getMinTopScoreToAnswer(provider);
  if (top.score < minTop) {
    return { ok: false, reason: "low-confidence", top };
  }

  const gap = hits.length > 1 ? top.score - hits[1].score : top.score;
  if (top.score < minTop + 0.04 && gap < 0.03) {
    return { ok: false, reason: "low-confidence", top };
  }

  if (!passesLexicalGrounding(question, top.chunk, top.score, provider)) {
    return { ok: false, reason: "no-lexical-match", top };
  }

  return { ok: true, top };
}

export function buildStrictRefusal(
  lang: LanguageCode,
  reason: RAGRefusalReason,
  roomTitle?: string
): string {
  const t = getTranslationsSync(lang);

  switch (reason) {
    case "off-topic":
      return t.ragRefusalOffTopic;
    case "empty-index":
      return t.ragRefusalNoIndex;
    case "room-mismatch":
      return t.ragRefusalRoomMismatch;
    case "no-lexical-match":
      return roomTitle
        ? t.ragRefusalLowMatch.replace("{room}", roomTitle)
        : t.askNotFound;
    case "no-retrieval":
    case "low-confidence":
    default:
      return roomTitle
        ? t.ragRefusalNoMatch.replace("{room}", roomTitle)
        : t.askNotFound;
  }
}
