/** File extensions users can upload */
export const SUPPORTED_EXTENSIONS = [
  "pdf",
  "docx",
  "pptx",
  "xlsx",
  "odt",
  "odp",
  "ods",
  "rtf",
  "txt",
  "md",
  "csv",
  "json",
  "html",
  "htm",
  "xml",
] as const;

/** Legacy Office formats — ask user to convert to Open XML */
export const LEGACY_EXTENSIONS = ["doc", "ppt", "xls"] as const;

/** Default 4MB — safe for Vercel serverless body limits; raise via MAX_UPLOAD_MB in .env */
function resolveMaxUploadMb(): number {
  const raw =
    process.env.MAX_UPLOAD_MB ?? process.env.NEXT_PUBLIC_MAX_UPLOAD_MB ?? "4";
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 4;
}

export const MAX_UPLOAD_MB = resolveMaxUploadMb();
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

export const ACCEPT_FILE_INPUT = [
  ...SUPPORTED_EXTENSIONS.map((ext) => `.${ext}`),
  ...LEGACY_EXTENSIONS.map((ext) => `.${ext}`),
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.ms-powerpoint",
  "application/vnd.ms-excel",
  "text/plain",
  "text/markdown",
  "text/csv",
  "text/html",
].join(",");

export const SUPPORTED_FORMATS_LABEL =
  "PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx), OpenDocument, RTF, and plain text (.txt, .md, .csv, .html)";

export function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? "") : "";
}

export function isPlainTextExtension(ext: string): boolean {
  return ["txt", "md", "csv", "json", "html", "htm", "xml", "log"].includes(ext);
}

export function isLegacyOfficeExtension(ext: string): boolean {
  return (LEGACY_EXTENSIONS as readonly string[]).includes(ext);
}
