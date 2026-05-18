import { NextRequest, NextResponse } from "next/server";
import { processUploadedDocument } from "@/lib/documentProcessor";
import { DocumentProcessingError } from "@/types/document-processing";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string" || content.trim().length < 20) {
      return NextResponse.json(
        { error: "Content must be at least 20 characters" },
        { status: 400 }
      );
    }

    const result = processUploadedDocument(content.trim());

    return NextResponse.json({
      ...result.room,
      processing: result.summary,
      usedMock: false,
      engine: "local",
    });
  } catch (error) {
    if (error instanceof DocumentProcessingError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    console.error("process-content error:", error);
    return NextResponse.json(
      { error: "Failed to process content" },
      { status: 500 }
    );
  }
}
