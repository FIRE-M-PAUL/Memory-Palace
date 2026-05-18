import { NextRequest, NextResponse } from "next/server";
import { extractTextFromBuffer } from "@/lib/extract-file-text";
import { MAX_UPLOAD_BYTES } from "@/lib/file-types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        {
          error: `File is too large. Maximum size is ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)}MB.`,
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromBuffer(buffer, file.name);

    return NextResponse.json({
      text,
      fileName: file.name,
      wordCount: text.split(/\s+/).filter(Boolean).length,
    });
  } catch (error) {
    console.error("extract-file error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to extract text from file";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
