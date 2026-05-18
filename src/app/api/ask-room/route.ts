import { NextRequest, NextResponse } from "next/server";
import { searchPalace } from "@/lib/localSearch";
import type { KnowledgeRoom } from "@/types/memory-palace";
import type { LanguageCode } from "@/types/learning";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, room, language = "en" } = body as {
      question: string;
      room: KnowledgeRoom;
      language?: LanguageCode;
    };

    if (!question?.trim()) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    if (!room?.concepts?.length) {
      return NextResponse.json({ error: "Room data is required" }, { status: 400 });
    }

    const answer = searchPalace(question.trim(), room, language);

    return NextResponse.json({ answer, usedMock: false, engine: "local" });
  } catch (error) {
    console.error("ask-room error:", error);
    return NextResponse.json({ error: "Failed to answer question" }, { status: 500 });
  }
}
