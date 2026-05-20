"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, MessageCircle, AlertTriangle, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { KnowledgeRoom } from "@/types/memory-palace";
import { getChatMessages, saveChatMessage } from "@/lib/roomStorage";
import { getRoomIndex, saveRoomIndex } from "@/lib/ai/aiMemoryStorage";
import {
  askRoomWithRAG,
  indexRoomOnClient,
  sendAnswerFeedback,
} from "@/lib/ai/client";
import { useAppStore } from "@/store/appStore";
import { v4 as uuidv4 } from "uuid";
import type { RoomKnowledgeIndex } from "@/types/ai-memory";

interface AskPalaceChatProps {
  roomId: string;
  room: KnowledgeRoom;
}

type AssistantMeta = {
  confidence?: number;
  chunkIds?: string[];
  conceptId?: string;
  grounded?: boolean;
};

export function AskPalaceChat({ roomId, room }: AskPalaceChatProps) {
  const { language, t } = useAppStore();
  const [messages, setMessages] = useState(getChatMessages(roomId));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState<RoomKnowledgeIndex | null>(null);
  const [indexing, setIndexing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const refreshMessages = useCallback(() => {
    setMessages(getChatMessages(roomId));
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    let cancelled = false;
    const cached = getRoomIndex(roomId);
    if (cached) setIndex(cached);

    (async () => {
      setIndexing(true);
      const built = await indexRoomOnClient(room, language);
      if (!cancelled && built) setIndex(built);
      setIndexing(false);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-index when room id or language changes
  }, [roomId, room.id, language]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");
    setLoading(true);

    const userMsg = {
      id: uuidv4(),
      role: "user" as const,
      content: question,
      createdAt: new Date().toISOString(),
    };
    saveChatMessage(roomId, userMsg);

    try {
      let activeIndex = index ?? getRoomIndex(roomId);
      if (!activeIndex) {
        activeIndex = await indexRoomOnClient(room, language);
        if (activeIndex) setIndex(activeIndex);
      }

      const { answer, meta, grounded, refused } = await askRoomWithRAG(
        question,
        room,
        language,
        activeIndex
      );

      const isGrounded = grounded === true && refused !== true;

      saveChatMessage(roomId, {
        id: uuidv4(),
        role: "assistant",
        content: answer,
        createdAt: new Date().toISOString(),
        meta: meta
          ? {
              confidence: meta.confidence,
              chunkIds: meta.chunkIds,
              conceptId: meta.conceptId,
              grounded: isGrounded,
              engine: meta.provider,
            }
          : { grounded: isGrounded },
      });
    } catch {
      saveChatMessage(roomId, {
        id: uuidv4(),
        role: "assistant",
        content: t.searchNotFoundShort,
        createdAt: new Date().toISOString(),
      });
    }

    setLoading(false);
    refreshMessages();
  };

  const handleFeedback = async (
    messageId: string,
    rating: "helpful" | "not_helpful",
    meta?: AssistantMeta
  ) => {
    const activeIndex = index ?? getRoomIndex(roomId);
    if (!activeIndex) return;

    const idx = messages.findIndex((m) => m.id === messageId);
    let question = "";
    for (let i = idx - 1; i >= 0; i--) {
      if (messages[i]?.role === "user") {
        question = messages[i].content;
        break;
      }
    }

    const updated = await sendAnswerFeedback({
      roomId,
      rating,
      index: activeIndex,
      messageId,
      conceptId: meta?.conceptId,
      chunkId: meta?.chunkIds?.[0],
      question,
      answer: messages.find((m) => m.id === messageId)?.content,
    });
    setIndex(updated);
    saveRoomIndex(updated);
  };

  return (
    <div className="glass rounded-2xl flex flex-col min-h-[280px]">
      <div className="p-4 border-b border-slate-700/50">
        <h3 className="flex items-center gap-2 font-semibold">
          <MessageCircle className="h-5 w-5 text-cyan-400" />
          {t.askPalace}
        </h3>
        <p className="flex items-start gap-2 mt-2 text-xs text-amber-400/90">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {t.askWarning}
        </p>
        {indexing && (
          <p className="text-[10px] text-cyan-400/70 mt-1">{t.aiIndexingNotes}</p>
        )}
      </div>
      <ScrollArea className="flex-1 p-4 max-h-[240px]">
        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl p-3 text-sm ${
                m.role === "user"
                  ? "bg-cyan-500/10 border border-cyan-500/20 ml-4"
                  : m.meta?.grounded === false
                    ? "bg-amber-500/5 border border-amber-500/20 mr-4"
                    : "bg-slate-800/50 mr-4"
              }`}
            >
              <p className="whitespace-pre-wrap text-slate-300 break-words">{m.content}</p>
              {m.role === "assistant" && m.meta?.grounded === true && (
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    className="p-1.5 rounded-lg border border-slate-600/50 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 touch-manipulation"
                    aria-label={t.feedbackHelpful}
                    onClick={() => handleFeedback(m.id, "helpful", m.meta)}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 rounded-lg border border-slate-600/50 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 touch-manipulation"
                    aria-label={t.feedbackNotHelpful}
                    onClick={() => handleFeedback(m.id, "not_helpful", m.meta)}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                  </button>
                  {m.meta?.confidence != null && (
                    <span className="text-[10px] text-slate-500 ml-auto">
                      {Math.round(m.meta.confidence * 100)}% {t.matchConfidence}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <p className="text-xs text-cyan-400/80 mr-4 animate-pulse">{t.aiThinking}</p>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-slate-700/50 flex gap-2">
        <Input
          placeholder={t.askPlaceholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          disabled={loading || indexing}
        />
        <Button onClick={send} size="icon" disabled={!input.trim() || loading || indexing}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
