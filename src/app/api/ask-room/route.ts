import { NextRequest, NextResponse } from "next/server";
import { answerWithRAG } from "@/lib/ai/ragAnswer";
import type { KnowledgeRoom } from "@/types/memory-palace";
import type { LanguageCode } from "@/types/learning";
import type { RoomKnowledgeIndex } from "@/types/ai-memory";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, room, language = "en", index = null } = body as {
      question: string;
      room: KnowledgeRoom;
      language?: LanguageCode;
      index?: RoomKnowledgeIndex | null;
    };

    if (!question?.trim()) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    if (!room?.concepts?.length) {
      return NextResponse.json({ error: "Room data is required" }, { status: 400 });
    }

    const result = await answerWithRAG(question.trim(), room, language, index);

    return NextResponse.json({
      answer: result.answer,
      meta: result.meta,
      grounded: result.grounded,
      refused: result.refused ?? !result.grounded,
      usedMock: false,
      engine: result.grounded ? "rag-strict" : "rag-refused",
    });
  } catch (error) {
    console.error("ask-room error:", error);
    return NextResponse.json({ error: "Failed to answer question" }, { status: 500 });
  }
}
