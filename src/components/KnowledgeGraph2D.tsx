"use client";

import { useMemo, useRef, useCallback } from "react";
import type { Concept } from "@/types/learning";
import type { KnowledgeRoom } from "@/types/memory-palace";
import { getClusterColor } from "@/types/memory-palace";
import { resolveText } from "@/lib/multilingual";
import { useAppStore } from "@/store/appStore";
import { MapLegendPanel } from "@/components/MapLegendPanel";
import {
  getCachedGuidedLayout,
  getCachedLayerRenderPlan,
} from "@/lib/roomComputeCache";
import { useViewport } from "@/hooks/useViewport";
import type { LearningViewMode } from "@/types/learning-views";
import type { LayerStack } from "@/types/nested-worlds";

interface KnowledgeGraph2DProps {
  room: KnowledgeRoom;
  selectedId: string | null;
  onSelectConcept: (id: string) => void;
  onConceptActivate: (conceptId: string) => void;
  onConceptDive?: (conceptId: string) => void;
  onSelectConnection?: (sourceId: string, targetId: string) => void;
  showStudyPath?: boolean;
  routeConceptIds?: string[];
  learningView?: LearningViewMode;
  layerStack: LayerStack;
  transitioning?: boolean;
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
  onConceptActivate,
  onConceptDive,
  onSelectConnection,
  showStudyPath = false,
  routeConceptIds = [],
  learningView = "focus",
  layerStack,
  transitioning = false,
}: KnowledgeGraph2DProps) {
  const { language, t } = useAppStore();
  const { profile } = useViewport();
  const lastTapRef = useRef<{ id: string; t: number } | null>(null);

  const handleNodeTap = useCallback(
    (conceptId: string) => {
      const now = Date.now();
      if (profile.mobileTouchSelectOnly && onConceptDive) {
        if (
          lastTapRef.current?.id === conceptId &&
          now - lastTapRef.current.t < 380
        ) {
          onSelectConcept(conceptId);
          onConceptDive(conceptId);
          lastTapRef.current = null;
        } else {
          onSelectConcept(conceptId);
          onConceptActivate(conceptId);
          lastTapRef.current = { id: conceptId, t: now };
        }
        return;
      }
      onSelectConcept(conceptId);
      onConceptActivate(conceptId);
      onConceptDive?.(conceptId);
    },
    [profile.mobileTouchSelectOnly, onConceptDive, onSelectConcept, onConceptActivate]
  );

  const layout = useMemo(
    () => getCachedGuidedLayout(room, language),
    [room, language]
  );

  const layerPlan = useMemo(
    () =>
      getCachedLayerRenderPlan(
        room,
        layerStack,
        learningView,
        layout,
        profile,
        language
      ),
    [room, layerStack, learningView, layout, profile, language]
  );

  const visible = layerPlan.visibleConcepts;
  const positions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    const centerX = 400;
    const centerY = 280;
    const count = visible.length;
    visible.forEach((concept, i) => {
      const p = layerPlan.positionCache.get(concept.id);
      if (p) {
        map.set(concept.id, {
          x: centerX + p.x * 55,
          y: centerY + p.z * 55,
        });
      } else {
        const angle = (i / Math.max(count, 1)) * Math.PI * 2;
        map.set(concept.id, {
          x: centerX + Math.cos(angle) * 120,
          y: centerY + Math.sin(angle) * 120,
        });
      }
    });
    return map;
  }, [visible, layerPlan.positionCache]);

  const visibleRels =
    layerPlan.layerDepth > 0 ? layerPlan.localRelationships : [];

  const routeIndex = (id: string) => routeConceptIds.indexOf(id);

  return (
    <div
      className={`w-full h-full min-h-[420px] glass rounded-2xl overflow-hidden relative flex flex-col transition-opacity duration-300 ${
        transitioning ? "opacity-40" : "opacity-100"
      }`}
    >
      <div className="absolute top-3 left-3 z-10 max-w-[200px] hidden sm:block">
        <MapLegendPanel compact />
      </div>
      <p className="text-center text-xs text-violet-300/90 pt-3 px-4">
        {layerPlan.layerCoreTitle}
      </p>
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
              onClick={() => handleNodeTap(concept.id)}
              className="cursor-pointer touch-manipulation"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleNodeTap(concept.id);
              }}
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
