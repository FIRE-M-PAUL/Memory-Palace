import { NextRequest, NextResponse } from "next/server";
import { ingestRoomKnowledge } from "@/lib/ai/ingestPipeline";
import type { KnowledgeRoom } from "@/types/memory-palace";
import type { LanguageCode } from "@/types/learning";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { room, language = "en" } = body as {
      room: KnowledgeRoom;
      language?: LanguageCode;
    };

    if (!room?.id || !room.concepts?.length) {
      return NextResponse.json({ error: "Valid room required" }, { status: 400 });
    }

    const result = await ingestRoomKnowledge(room, language);

    return NextResponse.json({
      index: result.index,
      room: result.room,
      newRelationships: result.newRelationships,
      provider: result.index.provider,
      chunkCount: result.index.chunks.length,
    });
  } catch (error) {
    console.error("index-room error:", error);
    return NextResponse.json({ error: "Failed to index knowledge" }, { status: 500 });
  }
}
