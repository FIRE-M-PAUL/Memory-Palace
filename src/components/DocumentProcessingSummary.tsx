"use client";

import { CheckCircle2 } from "lucide-react";
import type { DocumentProcessingSummary as Summary } from "@/types/document-processing";

interface DocumentProcessingSummaryProps {
  summary: Summary;
}

export function DocumentProcessingSummary({ summary }: DocumentProcessingSummaryProps) {
  return (
    <ul className="mt-4 space-y-2 text-left text-sm text-cyan-200/90">
      {summary.messages.map((msg) => (
        <li key={msg} className="flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>{msg}</span>
        </li>
      ))}
    </ul>
  );
}
