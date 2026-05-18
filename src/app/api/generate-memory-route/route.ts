import { NextRequest, NextResponse } from "next/server";
import type { KnowledgeRoomData } from "@/types/knowledge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { room } = body as { room: KnowledgeRoomData };

    if (!room?.memoryRoute) {
      return NextResponse.json({ error: "Room data is required" }, { status: 400 });
    }

    return NextResponse.json({ memoryRoute: room.memoryRoute });
  } catch (error) {
    console.error("generate-memory-route error:", error);
    return NextResponse.json(
      { error: "Failed to generate memory route" },
      { status: 500 }
    );
  }
}
