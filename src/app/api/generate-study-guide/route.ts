import { NextRequest, NextResponse } from "next/server";
import type { KnowledgeRoomData } from "@/types/knowledge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { room } = body as { room: KnowledgeRoomData };

    if (!room?.studyGuide) {
      return NextResponse.json({ error: "Room data is required" }, { status: 400 });
    }

    return NextResponse.json({
      studyGuide: room.studyGuide,
      concepts: room.concepts.map((c) => ({
        title: c.title,
        summary: c.summary,
        importance: c.importance,
      })),
      memoryRoute: room.memoryRoute,
    });
  } catch (error) {
    console.error("generate-study-guide error:", error);
    return NextResponse.json(
      { error: "Failed to generate study guide" },
      { status: 500 }
    );
  }
}
