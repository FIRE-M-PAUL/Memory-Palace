import type { Concept, LanguageCode } from "@/types/learning";
import type { KnowledgeRoom } from "@/types/memory-palace";
import { resolveText } from "@/lib/multilingual";
import { getTranslationsSync } from "@/lib/i18n";

/** Minimum relevance score to treat a question as answerable from uploaded material */
const MIN_MATCH_SCORE = 6;

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
  "significance",
  "tell",
  "me",
  "please",
  "describe",
]);

type QuestionIntent = "importance" | "definition" | "why" | "how" | "general";

interface ConceptHit {
  concept: Concept;
  score: number;
}

function extractTerms(question: string): string[] {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function detectIntent(question: string): QuestionIntent {
  const q = question.toLowerCase();
  if (
    /\b(importance of|important|significance of|why (is|are) .+ important|why does .+ matter|what makes .+ important)\b/.test(
      q
    )
  ) {
    return "importance";
  }
  if (/\b(what is|what are|whats|define|definition of|meaning of|explain what)\b/.test(q)) {
    return "definition";
  }
  if (/\bwhy\b/.test(q)) return "why";
  if (/\bhow (to|does|do|is|are|can)\b/.test(q)) return "how";
  return "general";
}

function scoreText(haystack: string, terms: string[]): number {
  const lower = haystack.toLowerCase();
  let score = 0;
  for (const term of terms) {
    if (lower.includes(term)) score += term.length;
  }
  return score;
}

function notInDocumentMessage(
  room: KnowledgeRoom,
  lang: LanguageCode,
  terms: string[]
): string {
  const t = getTranslationsSync(lang);
  if (terms.length === 0) {
    return t.searchAskAbout.replace("{title}", resolveText(room.title, lang));
  }
  const suggestions = room.concepts
    .slice(0, 4)
    .map((c) => resolveText(c.title, lang))
    .join(", ");
  return t.searchNotFound.replace("{suggestions}", suggestions);
}

function bestSentenceFromRaw(raw: string, terms: string[]): string | null {
  if (!raw.trim() || terms.length === 0) return null;
  const sentences = raw
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
  let best: { score: number; text: string } | null = null;
  for (const sentence of sentences) {
    const score = scoreText(sentence, terms);
    if (!best || score > best.score) best = { score, text: sentence };
  }
  if (!best || best.score < MIN_MATCH_SCORE) return null;
  return best.text.length > 320 ? `${best.text.slice(0, 317).trim()}…` : best.text;
}

function pickMaterialAnswer(
  concept: Concept,
  intent: QuestionIntent,
  lang: LanguageCode
): { topic: string; answer: string; excerpt?: string } {
  const topic = resolveText(concept.title, lang);
  const summary = resolveText(concept.summary, lang).trim();
  const why = concept.whyItMatters ? resolveText(concept.whyItMatters, lang).trim() : "";
  const excerpt = concept.sourceExcerpt
    ? resolveText(concept.sourceExcerpt, lang).trim()
    : "";
  const tip = concept.studyTip ? resolveText(concept.studyTip, lang).trim() : "";

  switch (intent) {
    case "importance":
      if (why) return { topic, answer: why, excerpt: excerpt || undefined };
      if (excerpt) return { topic, answer: excerpt };
      if (summary) return { topic, answer: summary };
      break;
    case "why":
      if (why) return { topic, answer: why, excerpt: excerpt || undefined };
      if (summary) return { topic, answer: summary, excerpt: excerpt || undefined };
      break;
    case "definition":
      if (summary) return { topic, answer: summary, excerpt: excerpt || undefined };
      if (excerpt) return { topic, answer: excerpt };
      break;
    case "how":
      if (tip) return { topic, answer: tip, excerpt: excerpt || undefined };
      if (summary) return { topic, answer: summary, excerpt: excerpt || undefined };
      break;
    default:
      if (summary) return { topic, answer: summary, excerpt: excerpt || undefined };
      if (why) return { topic, answer: why, excerpt: excerpt || undefined };
      if (excerpt) return { topic, answer: excerpt };
  }

  if (tip) return { topic, answer: tip };
  return { topic, answer: summary || excerpt || "" };
}

function formatDirectAnswer(
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

function findBestConcept(room: KnowledgeRoom, terms: string[], lang: LanguageCode): ConceptHit | null {
  let best: ConceptHit | null = null;

  for (const concept of room.concepts) {
    const title = resolveText(concept.title, lang);
    const summary = resolveText(concept.summary, lang);
    const why = concept.whyItMatters ? resolveText(concept.whyItMatters, lang) : "";
    const excerpt = concept.sourceExcerpt ? resolveText(concept.sourceExcerpt, lang) : "";
    const tip = concept.studyTip ? resolveText(concept.studyTip, lang) : "";
    const blob = `${title} ${summary} ${why} ${excerpt} ${tip}`;
    const score = scoreText(blob, terms) + scoreText(title, terms) * 1.8;

    if (!best || score > best.score) {
      best = { concept, score };
    }
  }

  return best;
}

export function searchPalace(
  question: string,
  room: KnowledgeRoom,
  lang: LanguageCode
): string {
  const terms = extractTerms(question);
  const t = getTranslationsSync(lang);
  const intent = detectIntent(question);

  if (terms.length === 0) {
    return notInDocumentMessage(room, lang, terms);
  }

  const hit = findBestConcept(room, terms, lang);

  if (!hit || hit.score < MIN_MATCH_SCORE) {
    const rawSnippet = room.rawContent ? bestSentenceFromRaw(room.rawContent, terms) : null;
    if (rawSnippet) {
      return t.answerFromDocument.replace("{answer}", rawSnippet);
    }
    return notInDocumentMessage(room, lang, terms);
  }

  const { topic, answer, excerpt } = pickMaterialAnswer(hit.concept, intent, lang);

  if (!answer.trim()) {
    const rawSnippet = room.rawContent ? bestSentenceFromRaw(room.rawContent, terms) : null;
    if (rawSnippet) return t.answerFromDocument.replace("{answer}", rawSnippet);
    return notInDocumentMessage(room, lang, terms);
  }

  let response = formatDirectAnswer(intent, topic, answer, lang);

  if (
    excerpt &&
    excerpt.trim() &&
    excerpt.trim().toLowerCase() !== answer.trim().toLowerCase() &&
    !answer.includes(excerpt.slice(0, 40))
  ) {
    response += `\n\n${t.answerAlsoInMaterial.replace("{excerpt}", excerpt)}`;
  }

  const related = room.relationships
    .filter((r) => r.source === hit.concept.id || r.target === hit.concept.id)
    .slice(0, 3)
    .map((r) => {
      const otherId = r.source === hit.concept.id ? r.target : r.source;
      const other = room.concepts.find((c) => c.id === otherId);
      return other ? resolveText(other.title, lang) : null;
    })
    .filter(Boolean);

  if (related.length) {
    response += `\n\n${t.searchRelated.replace("{related}", related.join(", "))}`;
  }

  return response;
}
