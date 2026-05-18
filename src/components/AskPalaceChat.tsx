"use client";

import { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { KnowledgeRoom } from "@/types/memory-palace";
import { getChatMessages, saveChatMessage } from "@/lib/roomStorage";
import { searchPalace } from "@/lib/localSearch";
import { useAppStore } from "@/store/appStore";
import { v4 as uuidv4 } from "uuid";

interface AskPalaceChatProps {
  roomId: string;
  room: KnowledgeRoom;
}

export function AskPalaceChat({ roomId, room }: AskPalaceChatProps) {
  const { language, t } = useAppStore();
  const [messages, setMessages] = useState(getChatMessages(roomId));
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    saveChatMessage(roomId, {
      id: uuidv4(),
      role: "user",
      content: input.trim(),
      createdAt: new Date().toISOString(),
    });
    saveChatMessage(roomId, {
      id: uuidv4(),
      role: "assistant",
      content: searchPalace(input.trim(), room, language),
      createdAt: new Date().toISOString(),
    });
    setMessages([...getChatMessages(roomId)]);
    setInput("");
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
      </div>
      <ScrollArea className="flex-1 p-4 max-h-[240px]">
        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl p-3 text-sm ${
                m.role === "user"
                  ? "bg-cyan-500/10 border border-cyan-500/20 ml-4"
                  : "bg-slate-800/50 mr-4"
              }`}
            >
              <p className="whitespace-pre-wrap text-slate-300">{m.content}</p>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-slate-700/50 flex gap-2">
        <Input
          placeholder={t.askPlaceholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <Button onClick={send} size="icon" disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
