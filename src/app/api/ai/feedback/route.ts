import { NextRequest, NextResponse } from "next/server";
import { applyFeedbackToIndex, createFeedbackEvent } from "@/lib/ai/feedbackEngine";
import type { FeedbackRating, RoomKnowledgeIndex } from "@/types/ai-memory";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      roomId,
      rating,
      index,
      messageId,
      conceptId,
      chunkId,
      correctionText,
      question,
      answer,
    } = body as {
      roomId: string;
      rating: FeedbackRating;
      index: RoomKnowledgeIndex;
      messageId?: string;
      conceptId?: string;
      chunkId?: string;
      correctionText?: string;
      question?: string;
      answer?: string;
    };

    if (!roomId || !rating || !index) {
      return NextResponse.json({ error: "roomId, rating, and index required" }, { status: 400 });
    }

    const event = createFeedbackEvent({
      roomId,
      rating,
      messageId,
      conceptId,
      chunkId,
      correctionText,
      question,
      answer,
    });

    const updatedIndex = applyFeedbackToIndex(index, event);

    return NextResponse.json({
      ok: true,
      event,
      index: updatedIndex,
    });
  } catch (error) {
    console.error("ai feedback error:", error);
    return NextResponse.json({ error: "Failed to record feedback" }, { status: 500 });
  }
}
