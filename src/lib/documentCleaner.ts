/** Patterns for lines to drop entirely */
const NOISE_LINE_PATTERNS: RegExp[] = [
  /^page\s+\d+$/i,
  /^\d+\s*$/,
  /^-{3,}$/,
  /^_{3,}$/,
  /^={3,}$/,
  /^\*+$/,
  /^\.{3,}$/,
  /^©/i,
  /copyright/i,
  /all rights reserved/i,
  /\bisbn\b/i,
  /^\s*isbn[\s:-]*[\d-]+/i,
  /published by/i,
  /printed by/i,
  /publisher:/i,
  /^https?:\/\//i,
  /^www\./i,
  /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i,
  /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/,
  /^\d{4}-\d{2}-\d{2}$/,
];

const URL_INLINE = /https?:\/\/\S+/gi;
const EMAIL_INLINE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const ISBN_INLINE = /\bISBN[\s:-]*[\d-]{10,17}\b/gi;

/** Remove repeated header/footer lines that appear many times */
function dropRepeatedLines(lines: string[]): string[] {
  const counts = new Map<string, number>();
  for (const line of lines) {
    const key = line.trim().toLowerCase();
    if (key.length > 4 && key.length < 120) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  const threshold = Math.max(3, Math.floor(lines.length * 0.08));
  return lines.filter((line) => {
    const key = line.trim().toLowerCase();
    if (key.length <= 4 || key.length >= 120) return true;
    return (counts.get(key) ?? 0) < threshold;
  });
}

function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ \u00a0]+/g, " ")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

/**
 * Remove page numbers, headers/footers, URLs, ISBN, copyright, and other noise.
 */
export function cleanDocumentText(rawText: string): string {
  let text = normalizeWhitespace(rawText);

  text = text.replace(URL_INLINE, " ");
  text = text.replace(EMAIL_INLINE, " ");
  text = text.replace(ISBN_INLINE, " ");

  let lines = text.split("\n").map((l) => l.trimEnd());

  lines = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return true;
    if (trimmed.length <= 2) return false;
    if (/^[\d\s.\-–—|]+$/.test(trimmed)) return false;
    return !NOISE_LINE_PATTERNS.some((p) => p.test(trimmed));
  });

  lines = dropRepeatedLines(lines);

  return lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
