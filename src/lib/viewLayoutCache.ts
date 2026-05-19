import type { Concept } from "@/types/learning";
import type { LearningViewMode } from "@/types/learning-views";
import type { GuidedLayout } from "@/lib/guidedRoomLayout";
import { getConceptPositionForView } from "@/lib/viewLayouts";

const cache = new Map<string, Map<string, { x: number; y: number; z: number }>>();

function cacheKey(roomId: string, view: LearningViewMode, layout: GuidedLayout): string {
  return `${roomId}:${view}:${layout.mainIdeas.map((c) => c.id).join(",")}`;
}

/** Reuse computed positions per room + view (avoids trig every frame) */
export function getCachedPositions(
  roomId: string,
  view: LearningViewMode,
  layout: GuidedLayout,
  concepts: Concept[]
): Map<string, { x: number; y: number; z: number }> {
  const key = cacheKey(roomId, view, layout);
  let positions = cache.get(key);
  if (!positions) {
    positions = new Map();
    for (const c of layout.mainIdeas) {
      positions.set(c.id, getConceptPositionForView(c, view, layout));
    }
    cache.set(key, positions);
  }

  const out = new Map<string, { x: number; y: number; z: number }>();
  for (const c of concepts) {
    out.set(
      c.id,
      positions.get(c.id) ?? getConceptPositionForView(c, view, layout)
    );
  }
  return out;
}

export function clearLayoutCache(roomId?: string): void {
  if (!roomId) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.startsWith(`${roomId}:`)) cache.delete(key);
  }
}
