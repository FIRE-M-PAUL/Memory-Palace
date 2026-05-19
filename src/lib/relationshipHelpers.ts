import type { Concept, DifficultyLevel, Relationship } from "@/types/learning";
import { simplifyTextForDifficulty } from "@/lib/difficulty";
import type { KnowledgeRoom } from "@/types/memory-palace";
import { mt } from "@/lib/multilingual";
import { resolveText } from "@/lib/multilingual";

const LABEL_MAP: Record<string, string> = {
  "same section": "is part of",
  "same chapter": "is part of",
  "discussed together": "is similar to",
  includes: "is part of",
  uses: "needs",
  "built on": "depends on",
  enables: "helps",
  requires: "needs",
  related: "is similar to",
  "related to": "is similar to",
};

export function normalizeRelationshipLabel(label: string): string {
  const lower = label.toLowerCase().trim();
  return LABEL_MAP[lower] ?? lower;
}

function pickExcerpt(a: Concept, b: Concept): string | undefined {
  const aEx = a.sourceExcerpt?.en;
  const bEx = b.sourceExcerpt?.en;
  if (aEx && aEx.length > 20) return aEx;
  if (bEx && bEx.length > 20) return bEx;
  return undefined;
}

function buildExplanation(
  source: Concept,
  target: Concept,
  label: string
): string {
  const a = source.title.en;
  const b = target.title.en;
  const simple = normalizeRelationshipLabel(label);

  const templates: Record<string, string> = {
    "is part of": `${a} is part of the bigger topic ${b}, or they belong together in your notes.`,
    helps: `${a} helps ${b} work better in what you are learning.`,
    causes: `${a} can cause or lead to ${b} in this topic.`,
    needs: `${a} needs ${b} to make sense in this lesson.`,
    "leads to": `Learning ${a} first helps you understand ${b} next.`,
    "is an example of": `${a} is an example that shows how ${b} works.`,
    "is similar to": `${a} and ${b} are similar ideas you can compare and remember together.`,
    "is different from": `${a} is different from ${b}, but both are important to know.`,
    "comes before": `Study ${a} before ${b} because it comes first in the topic.`,
    supports: `${a} supports ${b} in your notes.`,
    explains: `${a} helps explain ${b} in simple terms.`,
    "depends on": `${a} depends on ${b} in this lesson.`,
  };

  return (
    templates[simple] ??
    `${a} and ${b} are connected (${simple}) in your study map.`
  );
}

function buildStudyTip(source: Concept, target: Concept, label: string): string {
  const simple = normalizeRelationshipLabel(label);
  if (simple === "needs" || simple === "depends on") {
    return `Remember: ${source.title.en} needs ${target.title.en} to work.`;
  }
  if (simple === "leads to" || simple === "comes before") {
    return `Study ${source.title.en} first, then ${target.title.en}.`;
  }
  if (simple === "is similar to") {
    return `Compare ${source.title.en} and ${target.title.en} side by side.`;
  }
  return `Link ${source.title.en} and ${target.title.en} in your mind as a pair.`;
}

export function enrichRelationship(
  rel: Relationship,
  concepts: Concept[]
): Relationship {
  const source = concepts.find((c) => c.id === rel.source);
  const target = concepts.find((c) => c.id === rel.target);
  if (!source || !target) return rel;

  const label = normalizeRelationshipLabel(rel.label);
  const excerpt = pickExcerpt(source, target);
  const strength: Relationship["strength"] =
    rel.strength ??
    (label === "leads to" || label === "needs" || label === "depends on"
      ? "strong"
      : label === "is similar to"
        ? "medium"
        : "weak");

  return {
    ...rel,
    label,
    strength,
    explanation:
      rel.explanation ??
      mt(buildExplanation(source, target, label)),
    sourceExcerpt: rel.sourceExcerpt ?? (excerpt ? mt(excerpt) : undefined),
    studyTip:
      rel.studyTip ?? mt(buildStudyTip(source, target, label)),
  };
}

export function enrichRoom(room: KnowledgeRoom): KnowledgeRoom {
  const relationships = room.relationships.map((r) =>
    enrichRelationship(r, room.concepts)
  );
  const concepts = room.concepts.map((c) => ({
    ...c,
    whyItMatters:
      c.whyItMatters ??
      mt(`This idea is ${c.importance === "high" ? "very important" : "helpful"} for understanding your lesson.`),
    studyTip:
      c.studyTip ??
      mt(
        c.sourceExcerpt?.en
          ? `Remember: ${c.sourceExcerpt.en.slice(0, 100)}`
          : `Say ${c.title.en} in your own words to lock it in.`
      ),
  }));
  return { ...room, concepts, relationships };
}

export function relationshipKey(source: string, target: string): string {
  return [source, target].sort().join("--");
}

export function findRelationship(
  room: KnowledgeRoom,
  idA: string,
  idB: string
): Relationship | undefined {
  return room.relationships.find(
    (r) =>
      (r.source === idA && r.target === idB) ||
      (r.source === idB && r.target === idA)
  );
}

/** Simpler wording based on preferred learning difficulty */
export function simplifyTextForLevel(text: string, difficulty?: DifficultyLevel): string {
  return simplifyTextForDifficulty(text, difficulty);
}

export function resolveRelationshipText(
  rel: Relationship,
  field: "explanation" | "studyTip" | "sourceExcerpt",
  lang: Parameters<typeof resolveText>[1]
): string {
  const val = rel[field];
  return val ? resolveText(val, lang) : "";
}
