"use client";

import { LANGUAGE_OPTIONS } from "@/lib/i18n";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";

export function LanguageSelector({ className }: { className?: string }) {
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as typeof language)}
      className={cn(
        "h-9 rounded-lg border border-cyan-500/20 bg-slate-900/80 px-3 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-400/40 outline-none",
        className
      )}
      aria-label="Select language"
    >
      {LANGUAGE_OPTIONS.map((opt) => (
        <option key={opt.code} value={opt.code}>
          {opt.native}
        </option>
      ))}
    </select>
  );
}
