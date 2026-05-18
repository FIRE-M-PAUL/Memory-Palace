"use client";

import Link from "next/link";
import { formatDistanceToNow } from "@/lib/date";
import type { KnowledgeRoom } from "@/types/memory-palace";
import { resolveText } from "@/lib/multilingual";
import { useAppStore } from "@/store/appStore";
import { Badge } from "@/components/ui/badge";
import { Brain, ChevronRight, Sparkles } from "lucide-react";

interface RoomCardProps {
  room: KnowledgeRoom;
}

export function RoomCard({ room }: RoomCardProps) {
  const language = useAppStore((s) => s.language);
  return (
    <Link
      href={`/room/${room.id}`}
      className="group glass rounded-2xl p-5 hover:border-cyan-500/30 transition-all hover:glow-cyan block"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/20">
          <Brain className="h-6 w-6 text-cyan-400" />
        </div>
        <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0 mt-1" />
      </div>
      <h3 className="mt-4 font-semibold text-slate-100 group-hover:text-cyan-100 transition-colors line-clamp-1">
        {resolveText(room.title, language)}
      </h3>
      <p className="mt-2 text-sm text-slate-400 line-clamp-2">{resolveText(room.summary, language)}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{room.concepts.length} concepts</Badge>
        {room.isDemo && (
          <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-300">
            <Sparkles className="h-3 w-3 mr-1" />
            Demo
          </Badge>
        )}
        <span className="text-xs text-slate-500 ml-auto">
          {formatDistanceToNow(room.createdAt)}
        </span>
      </div>
    </Link>
  );
}
