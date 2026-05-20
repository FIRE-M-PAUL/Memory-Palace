"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DEMO_CONTENT } from "@/lib/mock-data";
import { useAppStore } from "@/store/appStore";

interface TextInputPanelProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function TextInputPanel({ value, onChange, disabled }: TextInputPanelProps) {
  const t = useAppStore((s) => s.t);
  const wordCount = value.split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="content" className="text-slate-300">
          {t.pasteKnowledge}
        </Label>
        <button
          type="button"
          onClick={() => onChange(DEMO_CONTENT)}
          disabled={disabled}
          className="text-xs text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
        >
          {t.loadDemoContent}
        </button>
      </div>
      <Textarea
        id="content"
        placeholder={t.pastePlaceholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="min-h-[200px] font-mono text-sm"
      />
      <p className="text-xs text-slate-500">
        {value.length > 0 ? t.wordCount.replace("{count}", String(wordCount)) : t.noContentYet}
      </p>
    </div>
  );
}
