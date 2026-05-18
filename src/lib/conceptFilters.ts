/** Terms that should never become memory-palace concepts (metadata / front matter) */
export const METADATA_BLOCKLIST = new Set([
  "isbn",
  "copyright",
  "publisher",
  "published",
  "edition",
  "acknowledgement",
  "acknowledgements",
  "preface",
  "foreword",
  "dedication",
  "contents",
  "university",
  "college",
  "department",
  "faculty",
  "submitted",
  "lecturer",
  "student",
  "assignment",
  "cover",
  "title",
  "author",
  "authors",
  "press",
  "printed",
  "reserved",
  "rights",
  "www",
  "http",
  "https",
  "email",
  "school",
  "institution",
  "date",
  "semester",
  "year",
]);

export function isMetadataTerm(term: string): boolean {
  const t = term.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (t.length < 3) return true;
  if (METADATA_BLOCKLIST.has(t)) return true;
  if (/^\d+$/.test(t)) return true;
  if (t.length <= 2) return true;
  return false;
}

export function isMetadataPhrase(phrase: string): boolean {
  const lower = phrase.toLowerCase();
  const blocked = [
    "all rights reserved",
    "table of contents",
    "list of figures",
    "list of tables",
    "submitted by",
    "submitted to",
    "date submitted",
    "student name",
    "cover page",
    "title page",
    "copyright notice",
  ];
  return blocked.some((b) => lower.includes(b));
}
