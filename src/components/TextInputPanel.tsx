"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DEMO_CONTENT } from "@/lib/mock-data";

interface TextInputPanelProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function TextInputPanel({ value, onChange, disabled }: TextInputPanelProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="content" className="text-slate-300">
          Paste your knowledge
        </Label>
        <button
          type="button"
          onClick={() => onChange(DEMO_CONTENT)}
          disabled={disabled}
          className="text-xs text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
        >
          Load demo content
        </button>
      </div>
      <Textarea
        id="content"
        placeholder="Paste notes, research, lecture content, or any text you want to transform into a 3D memory palace..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="min-h-[200px] font-mono text-sm"
      />
      <p className="text-xs text-slate-500">
        {value.length > 0 ? `${value.split(/\s+/).filter(Boolean).length} words` : "No content yet"}
      </p>
    </div>
  );
}
