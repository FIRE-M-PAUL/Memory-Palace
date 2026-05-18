"use client";

import { LanguageSelector } from "@/components/LanguageSelector";
import { LevelSelector } from "@/components/LevelSelector";
import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SettingsPage() {
  const t = useAppStore((s) => s.t);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 grid-bg">
      <div className="mx-auto max-w-lg glass-strong rounded-2xl p-8 space-y-8">
        <h1 className="text-2xl font-bold gradient-text">{t.settings}</h1>

        <div className="space-y-3">
          <label className="text-sm text-slate-400">{t.selectLanguage}</label>
          <LanguageSelector className="w-full" />
        </div>

        <div className="space-y-3">
          <label className="text-sm text-slate-400">{t.selectLevel}</label>
          <LevelSelector className="w-full" />
        </div>

        <Button asChild className="w-full">
          <Link href="/dashboard">{t.dashboard}</Link>
        </Button>
      </div>
    </div>
  );
}
