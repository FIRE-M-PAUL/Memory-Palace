"use client";

import { useMemo, useState } from "react";
import type { Concept } from "@/types/learning";
import type { KnowledgeRoom } from "@/types/memory-palace";
import { getClusterColor } from "@/types/memory-palace";
import { resolveText } from "@/lib/multilingual";
import { useAppStore } from "@/store/appStore";
import { MapLegendPanel } from "@/components/MapLegendPanel";

const VISIBLE_DEFAULT = 16;

interface KnowledgeGraph2DProps {
  room: KnowledgeRoom;
  selectedId: string | null;
  onSelectConcept: (id: string) => void;
  onSelectConnection?: (sourceId: string, targetId: string) => void;
  showStudyPath?: boolean;
  routeConceptIds?: string[];
}

function layoutConcepts(concepts: Concept[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const clusters = [...new Set(concepts.map((c) => c.cluster))];
  const centerX = 400;
  const centerY = 280;

  concepts.forEach((concept, i) => {
    const clusterIndex = clusters.indexOf(concept.cluster);
    const angle =
      (clusterIndex / Math.max(clusters.length, 1)) * Math.PI * 2 +
      (i / concepts.length) * Math.PI * 0.5;
    const radius = 100 + clusterIndex * 45;
    positions.set(concept.id, {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    });
  });
  return positions;
}

function radiusForImportance(importance: Concept["importance"]): number {
  if (importance === "high") return 28;
  if (importance === "medium") return 22;
  return 16;
}

export function KnowledgeGraph2D({
  room,
  selectedId,
  onSelectConcept,
  onSelectConnection,
  showStudyPath = false,
  routeConceptIds = [],
}: KnowledgeGraph2DProps) {
  const { language, t } = useAppStore();
  const [showAll, setShowAll] = useState(false);

  const sorted = useMemo(() => {
    const order = { high: 0, medium: 1, low: 2 };
    return [...room.concepts].sort(
      (a, b) => order[a.importance] - order[b.importance]
    );
  }, [room.concepts]);

  const visible = showAll ? sorted : sorted.slice(0, VISIBLE_DEFAULT);
  const positions = useMemo(() => layoutConcepts(visible), [visible]);
  const visibleIds = new Set(visible.map((c) => c.id));

  const visibleRels = room.relationships.filter(
    (r) => visibleIds.has(r.source) && visibleIds.has(r.target)
  );

  const routeIndex = (id: string) => routeConceptIds.indexOf(id);

  return (
    <div className="w-full h-full min-h-[420px] glass rounded-2xl overflow-hidden relative flex flex-col">
      <div className="absolute top-3 left-3 z-10 max-w-[200px] hidden sm:block">
        <MapLegendPanel compact />
      </div>
      {sorted.length > VISIBLE_DEFAULT && (
        <div className="absolute top-3 right-3 z-10">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="text-xs glass px-3 py-2 rounded-lg text-cyan-300 hover:border-cyan-500/30 min-h-[36px]"
          >
            {showAll ? t.showFewerIdeas : t.showMoreIdeas}
          </button>
        </div>
      )}
      <svg viewBox="0 0 800 560" className="w-full flex-1 min-h-[360px]">
        <defs>
          <filter id="glow2d">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {visibleRels.map((rel) => {
          const from = positions.get(rel.source);
          const to = positions.get(rel.target);
          if (!from || !to) return null;
          const highlighted =
            selectedId === rel.source || selectedId === rel.target;
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;
          return (
            <g key={`${rel.source}-${rel.target}`}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="transparent"
                strokeWidth={16}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectConnection?.(rel.source, rel.target);
                }}
              />
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={highlighted ? "#22d3ee" : "#4f46e5"}
                strokeWidth={highlighted ? 2.5 : 1.2}
                strokeOpacity={highlighted ? 0.9 : 0.4}
                pointerEvents="none"
              />
              {highlighted && (
                <text
                  x={midX}
                  y={midY - 6}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9"
                  className="pointer-events-none capitalize"
                >
                  {rel.label}
                </text>
              )}
            </g>
          );
        })}

        {visible.map((concept) => {
          const pos = positions.get(concept.id);
          if (!pos) return null;
          const color = getClusterColor(concept.cluster);
          const selected = selectedId === concept.id;
          const r = radiusForImportance(concept.importance);
          const step = routeIndex(concept.id);
          const onPath = showStudyPath && step >= 0;

          return (
            <g
              key={concept.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              onClick={() => onSelectConcept(concept.id)}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onSelectConcept(concept.id)}
            >
              <circle
                r={selected ? r + 4 : r}
                fill={`${color}33`}
                stroke={color}
                strokeWidth={selected ? 3 : 2}
                filter={selected ? "url(#glow2d)" : undefined}
              />
              {onPath && (
                <text
                  textAnchor="middle"
                  y={-r - 6}
                  fill="#fbbf24"
                  fontSize="11"
                  fontWeight="bold"
                >
                  {step + 1}
                </text>
              )}
              <text
                textAnchor="middle"
                y={r + 14}
                fill="#e2e8f0"
                fontSize="11"
                fontWeight={selected ? "bold" : "normal"}
              >
                {(() => {
                  const label = resolveText(concept.title, language);
                  return label.length > 20 ? label.slice(0, 18) + "…" : label;
                })()}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="text-center text-xs text-slate-500 px-4 pb-3">
        {t.mapClickHint}. {t.clickConnection}
      </p>
    </div>
  );
}
