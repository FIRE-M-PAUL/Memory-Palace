"use client";

import { Info } from "lucide-react";
import { useAppStore } from "@/store/appStore";

export function MapLegendPanel({ compact = false }: { compact?: boolean }) {
  const t = useAppStore((s) => s.t);
  const items = [
    { symbol: "●", desc: t.legendBigIdea },
    { symbol: "○", desc: t.legendSmallIdea },
    { symbol: "—", desc: t.legendLine },
    { symbol: "◆", desc: t.legendColor },
    { symbol: "✦", desc: t.legendGlow },
    { symbol: "①", desc: t.legendPath },
  ];

  return (
    <div
      className={`glass rounded-xl border border-cyan-500/15 ${
        compact ? "p-3 text-xs" : "p-4 text-sm"
      }`}
    >
      <h4 className="flex items-center gap-2 font-medium text-cyan-200 mb-2">
        <Info className="h-4 w-4 shrink-0" />
        {t.legendTitle}
      </h4>
      <ul className="space-y-1.5 text-slate-400">
        {items.map((item) => (
          <li key={item.desc} className="flex gap-2">
            <span className="text-cyan-400 w-4 shrink-0 text-center">{item.symbol}</span>
            <span>{item.desc}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
