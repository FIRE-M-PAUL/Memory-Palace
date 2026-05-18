import { parseOfficeAsync } from "officeparser";
import {
  getFileExtension,
  isLegacyOfficeExtension,
  isPlainTextExtension,
  SUPPORTED_EXTENSIONS,
} from "@/lib/file-types";

const LEGACY_HINT: Record<string, string> = {
  doc: "docx",
  ppt: "pptx",
  xls: "xlsx",
};

const OFFICE_EXTENSIONS = new Set(
  SUPPORTED_EXTENSIONS.filter((e) => !isPlainTextExtension(e))
);

export async function extractTextFromBuffer(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const ext = getFileExtension(fileName);

  if (isLegacyOfficeExtension(ext)) {
    const modern = LEGACY_HINT[ext] ?? "docx";
    throw new Error(
      `Legacy .${ext} files are not supported. Please save as .${modern} in Word/PowerPoint/Excel and upload again.`
    );
  }

  if (isPlainTextExtension(ext)) {
    return buffer.toString("utf-8");
  }

  if (!(OFFICE_EXTENSIONS as Set<string>).has(ext)) {
    throw new Error(
      `Unsupported file type ".${ext || "unknown"}". Use PDF, DOCX, PPTX, XLSX, or paste text instead.`
    );
  }

  const text = (await parseOfficeAsync(buffer, { ignoreNotes: false })).trim();

  if (text.length < 20) {
    throw new Error(
      "Could not extract enough text from this file. The file may be scanned/images-only, empty, or password-protected. Try pasting the content manually."
    );
  }

  return text;
}
