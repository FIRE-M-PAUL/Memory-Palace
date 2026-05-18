/** Front-matter line patterns (usually skip unless clearly educational body) */
const FRONT_MATTER_LINE = new RegExp(
  [
    "^\\s*cover\\s*$",
    "^\\s*title\\s*page\\s*$",
    "^\\s*copyright\\s*$",
    "^\\s*dedication\\s*$",
    "^\\s*acknowledg(e)?ments?\\s*$",
    "^\\s*preface\\s*$",
    "^\\s*foreword\\s*$",
    "^\\s*table\\s+of\\s+contents\\s*$",
    "^\\s*contents\\s*$",
    "^\\s*list\\s+of\\s+figures\\s*$",
    "^\\s*list\\s+of\\s+tables\\s*$",
    "^\\s*submitted\\s+by\\s*$",
    "^\\s*submitted\\s+to\\s*$",
    "all rights reserved",
    "^\\s*edition\\s*[:\\d]",
    "^\\s*published\\s+by\\b",
    "^\\s*printed\\s+by\\b",
    "\\buniversity\\s+press\\b",
    "^\\s*department\\s+of\\b",
    "^\\s*faculty\\s+of\\b",
    "^\\s*school\\s+of\\b",
    "^\\s*lecturer\\s*:",
    "^\\s*student\\s+name\\s*:",
    "^\\s*date\\s+submitted\\s*:",
  ].join("|"),
  "i"
);

/** Strong learning-content start signals */
const CONTENT_START_PATTERNS: { pattern: RegExp; reason: string; score: number }[] = [
  { pattern: /^chapter\s+(\d+|[ivxlcdm]+)\b/i, reason: "Chapter heading detected", score: 100 },
  { pattern: /^unit\s+\d+\b/i, reason: "Unit heading detected", score: 95 },
  { pattern: /^lesson\s+\d+\b/i, reason: "Lesson heading detected", score: 95 },
  { pattern: /^module\s+\d+\b/i, reason: "Module heading detected", score: 95 },
  { pattern: /^topic\s+\d+\b/i, reason: "Topic heading detected", score: 90 },
  { pattern: /^section\s+\d+\b/i, reason: "Section heading detected", score: 85 },
  { pattern: /^part\s+[ivx\d]+\b/i, reason: "Part heading detected", score: 85 },
  { pattern: /^learning\s+objectives?\b/i, reason: "Learning objectives section", score: 80 },
  { pattern: /^introduction\b/i, reason: "Introduction with body content", score: 70 },
  { pattern: /^overview\b/i, reason: "Overview section", score: 65 },
  { pattern: /^background\b/i, reason: "Background section", score: 65 },
  { pattern: /^definition[s]?\b/i, reason: "Definitions section", score: 75 },
  { pattern: /^what\s+is\b/i, reason: "Explanatory heading", score: 72 },
  { pattern: /^types\s+of\b/i, reason: "Types section", score: 72 },
  { pattern: /^importance\s+of\b/i, reason: "Importance section", score: 72 },
  { pattern: /^functions?\s+of\b/i, reason: "Functions section", score: 72 },
  { pattern: /^characteristics\s+of\b/i, reason: "Characteristics section", score: 72 },
  { pattern: /^process\s+of\b/i, reason: "Process section", score: 72 },
  { pattern: /^steps\s+in\b/i, reason: "Steps section", score: 72 },
  { pattern: /^example[s]?\b/i, reason: "Examples section", score: 68 },
  { pattern: /^exercise[s]?\b/i, reason: "Exercises section", score: 68 },
];

const TOC_DOT_LEADER = /\.{2,}\s*\d+\s*$/;
const TOC_ONLY_LINE = /^[\d.]+\s+[\w\s]{3,50}\s+\d{1,4}$/;

function isTocLine(line: string): boolean {
  const t = line.trim();
  if (TOC_DOT_LEADER.test(t)) return true;
  if (TOC_ONLY_LINE.test(t)) return true;
  if (/^contents$/i.test(t)) return true;
  return false;
}

function isFrontMatterLine(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  if (FRONT_MATTER_LINE.test(t)) return true;
  if (isTocLine(t)) return true;
  if (/^by\s+[A-Z][a-z]+(\s+[A-Z][a-z]+){0,3}$/.test(t) && t.length < 60) return true;
  return false;
}

function paragraphFollows(lines: string[], fromIndex: number): boolean {
  let chars = 0;
  for (let i = fromIndex + 1; i < Math.min(fromIndex + 6, lines.length); i++) {
    const t = lines[i]?.trim() ?? "";
    if (!t || isFrontMatterLine(t) || isTocLine(t)) continue;
    chars += t.length;
    if (chars > 120) return true;
  }
  return false;
}

/**
 * Find character index where real learning content likely begins.
 */
export function detectContentStart(text: string): { index: number; reason: string } {
  const lines = text.split("\n");
  let charIndex = 0;
  let bestIndex = 0;
  let bestScore = 0;
  let bestReason = "Start of cleaned document";

  const scanLimit = Math.min(lines.length, Math.max(80, Math.floor(lines.length * 0.35)));

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim() ?? "";
    if (i < scanLimit) {
      for (const { pattern, reason, score } of CONTENT_START_PATTERNS) {
        if (pattern.test(line)) {
          const needsBody =
            /^introduction\b/i.test(line) ||
            /^overview\b/i.test(line) ||
            /^learning\s+objectives?\b/i.test(line);
          const effectiveScore = needsBody && !paragraphFollows(lines, i) ? score - 40 : score;
          if (effectiveScore > bestScore) {
            bestScore = effectiveScore;
            bestIndex = charIndex;
            bestReason = reason;
          }
        }
      }
    }
    charIndex += (lines[i]?.length ?? 0) + 1;
  }

  if (bestScore >= 65) {
    return { index: bestIndex, reason: bestReason };
  }

  // Fallback: skip leading front-matter lines
  charIndex = 0;
  for (let i = 0; i < Math.min(lines.length, 120); i++) {
    const line = lines[i]?.trim() ?? "";
    if (!line) {
      charIndex += (lines[i]?.length ?? 0) + 1;
      continue;
    }
    if (isFrontMatterLine(line) || isTocLine(line)) {
      charIndex += (lines[i]?.length ?? 0) + 1;
      continue;
    }
    if (line.length < 80 && !paragraphFollows(lines, i) && i < 40) {
      charIndex += (lines[i]?.length ?? 0) + 1;
      continue;
    }
    return {
      index: charIndex,
      reason: "Skipped cover and metadata; body content begins here",
    };
  }

  return { index: bestIndex, reason: bestReason };
}

/**
 * Remove cover, TOC, copyright, and similar front matter from the start of the document.
 */
export function removeFrontMatter(text: string): { text: string; removed: boolean } {
  const { index } = detectContentStart(text);
  if (index <= 0) {
    return { text, removed: false };
  }
  const sliced = text.slice(index).trim();
  return {
    text: sliced.length > 100 ? sliced : text,
    removed: index > 0 && sliced.length > 100,
  };
}

export function getContentStartReason(text: string): string {
  return detectContentStart(text).reason;
}
