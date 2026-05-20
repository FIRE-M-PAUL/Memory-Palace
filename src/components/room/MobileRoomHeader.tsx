"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Box,
  Brain,
  Map,
  MoreHorizontal,
  Presentation,
  Route,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";

interface MobileRoomHeaderProps {
  roomTitle: string;
  roomId: string;
  renderMode: "3d" | "2d";
  onRenderModeChange: (mode: "3d" | "2d") => void;
  showStudyPath: boolean;
  onToggleStudyPath: () => void;
}

export function MobileRoomHeader({
  roomTitle,
  roomId,
  renderMode,
  onRenderModeChange,
  showStudyPath,
  onToggleStudyPath,
}: MobileRoomHeaderProps) {
  const t = useAppStore((s) => s.t);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="md:hidden border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="flex items-center gap-2 px-3 py-2">
        <Button variant="ghost" size="icon" asChild className="h-10 w-10 shrink-0">
          <Link href="/dashboard" aria-label={t.backToDashboard}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="flex-1 min-w-0 font-semibold text-sm text-slate-100 truncate">
          {roomTitle}
        </h1>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label={t.mobileMoreActions}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <MoreHorizontal className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex items-center justify-end gap-2 px-3 pb-2">
        <div className="flex rounded-xl border border-slate-700/80 bg-slate-950/80 p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => onRenderModeChange("3d")}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg transition-colors touch-manipulation",
              renderMode === "3d"
                ? "bg-cyan-500/25 text-cyan-100"
                : "text-slate-500"
            )}
            aria-label={t.room3d}
          >
            <Box className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onRenderModeChange("2d")}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg transition-colors touch-manipulation",
              renderMode === "2d"
                ? "bg-violet-500/25 text-violet-100"
                : "text-slate-500"
            )}
            aria-label={t.switchTo2dShort}
          >
            <Map className="h-4 w-4" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="grid grid-cols-2 gap-2 px-3 pb-3 border-t border-slate-800/60 pt-2">
          <Button
            size="sm"
            variant={showStudyPath ? "default" : "outline"}
            className="min-h-[44px] justify-start gap-2"
            onClick={() => {
              onToggleStudyPath();
              setMenuOpen(false);
            }}
          >
            <Route className="h-4 w-4 shrink-0" />
            {t.showStudyPath}
          </Button>
          <Button size="sm" variant="outline" className="min-h-[44px] justify-start gap-2" asChild>
            <Link href={`/room/${roomId}/study`} onClick={() => setMenuOpen(false)}>
              <BookOpen className="h-4 w-4 shrink-0" />
              {t.studyGuide}
            </Link>
          </Button>
          <Button size="sm" variant="outline" className="min-h-[44px] justify-start gap-2" asChild>
            <Link href={`/room/${roomId}/practice`} onClick={() => setMenuOpen(false)}>
              <Brain className="h-4 w-4 shrink-0" />
              {t.practiceTime}
            </Link>
          </Button>
          <Button size="sm" variant="outline" className="min-h-[44px] justify-start gap-2" asChild>
            <Link href={`/room/${roomId}/present`} onClick={() => setMenuOpen(false)}>
              <Presentation className="h-4 w-4 shrink-0" />
              {t.guidedLesson}
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
