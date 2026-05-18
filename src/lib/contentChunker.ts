import type { ContentChunk, ContentChunkType } from "@/types/document-processing";

const CHAPTER_HEADING =
  /^(chapter|unit|lesson|module|topic|part|section)\s+(\d+|[ivxlcdm]+)\b[:\s—-]*(.*)$/i;
const MARKDOWN_HEADING = /^(#{1,3})\s+(.+)$/;
const NUMBERED_HEADING = /^(\d+(\.\d+)*)\s+([A-Z][\w\s,'()-]{4,80})$/;
const DEFINITION_LINE = /^(definition|define|meaning)\s*[:—-]/i;
const EXAMPLE_LINE = /^(example|worked example|sample)\s*[:—-]/i;
const EXERCISE_LINE = /^(exercise|activity|practice|question)\s*[:—-]/i;

const STOP_WORDS = new Set([
  "the", "and", "for", "that", "this", "with", "from", "are", "was", "were", "have",
  "has", "been", "will", "would", "their", "they", "which", "when", "what", "about",
]);

function extractKeywords(text: string, max = 8): string[] {
  const counts = new Map<string, number>();
  for (const w of text.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/)) {
    if (w.length > 3 && !STOP_WORDS.has(w)) {
      counts.set(w, (counts.get(w) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([w]) => w);
}

function classifyChunk(title: string, body: string): ContentChunkType {
  const sample = `${title}\n${body}`.slice(0, 500);
  if (DEFINITION_LINE.test(sample) || /\bis defined as\b/i.test(sample)) return "definition";
  if (EXAMPLE_LINE.test(sample)) return "example";
  if (EXERCISE_LINE.test(sample)) return "exercise";
  if (CHAPTER_HEADING.test(title)) return "chapter";
  if (title.length < 80 && body.length > 200) return "section";
  return "paragraph";
}

function scoreImportance(type: ContentChunkType, body: string): "high" | "medium" | "low" {
  if (type === "chapter" || type === "section") return "high";
  if (type === "definition" || type === "example") return "high";
  if (body.length < 80) return "low";
  if (body.length > 400) return "high";
  return "medium";
}

function parseSections(text: string): { title: string; body: string }[] {
  const lines = text.split("\n");
  const sections: { title: string; body: string }[] = [];
  let currentTitle = "Introduction";
  let bodyLines: string[] = [];

  const flush = () => {
    const body = bodyLines.join("\n").trim();
    if (body.length > 40) {
      sections.push({ title: currentTitle, body });
    }
    bodyLines = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      bodyLines.push("");
      continue;
    }

    let heading: string | null = null;

    const ch = trimmed.match(CHAPTER_HEADING);
    if (ch) {
      heading = ch[3]?.trim() || trimmed;
    } else {
      const md = trimmed.match(MARKDOWN_HEADING);
      if (md && md[1].length <= 2) heading = md[2].trim();
    }
    if (!heading) {
      const num = trimmed.match(NUMBERED_HEADING);
      if (num && trimmed.length < 100) heading = num[3].trim();
    }
    if (!heading && trimmed.length < 70 && trimmed.length > 4 && /^[A-Z]/.test(trimmed)) {
      if (!paragraphFollowsInline(lines, line)) {
        heading = trimmed;
      }
    }

    if (heading) {
      flush();
      currentTitle = heading;
      continue;
    }

    bodyLines.push(trimmed);
  }

  flush();
  return sections;
}

function paragraphFollowsInline(lines: string[], line: string): boolean {
  const idx = lines.indexOf(line);
  if (idx < 0) return false;
  let len = 0;
  for (let i = idx + 1; i < Math.min(idx + 4, lines.length); i++) {
    len += (lines[i]?.trim().length ?? 0);
    if (len > 100) return true;
  }
  return false;
}

/**
 * Split cleaned learning text into meaningful chunks.
 */
export function chunkLearningContent(cleanedText: string): ContentChunk[] {
  const text = cleanedText.trim();
  if (!text) return [];

  let sections = parseSections(text);

  if (sections.length < 2) {
    const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 60);
    sections = paragraphs.map((p, i) => {
      const firstLine = p.split("\n")[0]?.trim() ?? `Section ${i + 1}`;
      const title =
        firstLine.length < 80 ? firstLine : `Section ${i + 1}`;
      return { title, body: p };
    });
  }

  return sections.map((sec, i) => {
    const type = classifyChunk(sec.title, sec.body);
    const importance = scoreImportance(type, sec.body);
    return {
      id: `chunk-${i + 1}`,
      title: sec.title.slice(0, 120),
      text: sec.body,
      type,
      importance,
      keywords: extractKeywords(`${sec.title} ${sec.body}`),
    };
  });
}
