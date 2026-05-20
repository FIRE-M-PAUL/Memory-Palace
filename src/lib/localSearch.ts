import type { LanguageCode } from "@/types/learning";
import type { KnowledgeRoom } from "@/types/memory-palace";
import { resolveText } from "@/lib/multilingual";
import { getTranslationsSync } from "@/lib/i18n";

function scoreText(haystack: string, terms: string[]): number {
  const lower = haystack.toLowerCase();
  let score = 0;
  for (const t of terms) {
    if (t.length < 3) continue;
    if (lower.includes(t)) score += t.length;
  }
  return score;
}

export function searchPalace(
  question: string,
  room: KnowledgeRoom,
  lang: LanguageCode
): string {
  const terms = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const t = getTranslationsSync(lang);

  if (terms.length === 0) {
    return t.searchAskAbout.replace("{title}", resolveText(room.title, lang));
  }

  type Hit = { score: number; title: string; body: string; excerpt?: string };
  const hits: Hit[] = [];

  for (const c of room.concepts) {
    const title = resolveText(c.title, lang);
    const summary = resolveText(c.summary, lang);
    const excerpt = c.sourceExcerpt ? resolveText(c.sourceExcerpt, lang) : "";
    const blob = `${title} ${summary} ${excerpt}`;
    const score = scoreText(blob, terms);
    if (score > 0) hits.push({ score, title, body: summary, excerpt });
  }

  if (room.rawContent) {
    const score = scoreText(room.rawContent, terms);
    if (score > 0) {
      hits.push({
        score: score * 0.5,
        title: resolveText(room.title, lang),
        body: resolveText(room.summary, lang),
      });
    }
  }

  hits.sort((a, b) => b.score - a.score);

  if (hits.length === 0) {
    const suggestions = room.concepts
      .slice(0, 4)
      .map((c) => resolveText(c.title, lang))
      .join(", ");
    return t.searchNotFound.replace("{suggestions}", suggestions);
  }

  const best = hits[0];
  const related = room.relationships
    .filter((r) => {
      const concept = room.concepts.find(
        (c) => resolveText(c.title, lang) === best.title
      );
      return concept && (r.source === concept.id || r.target === concept.id);
    })
    .slice(0, 3)
    .map((r) => {
      const otherId = r.source === room.concepts.find((c) => resolveText(c.title, lang) === best.title)?.id
        ? r.target
        : r.source;
      const other = room.concepts.find((c) => c.id === otherId);
      return other ? resolveText(other.title, lang) : null;
    })
    .filter(Boolean);

  let answer = `**${best.title}**\n\n${best.body}`;
  if (best.excerpt) {
    answer += `\n\n${t.searchFromMaterial.replace("{excerpt}", best.excerpt)}`;
  }
  if (related.length) {
    answer += `\n\n${t.searchRelated.replace("{related}", related.join(", "))}`;
  }
  return answer;
}
