import type { LanguageCode } from "@/types/learning";
import type { KnowledgeRoom } from "@/types/memory-palace";
import type { LearningViewMode } from "@/types/learning-views";
import type { LayerStack } from "@/types/nested-worlds";
import {
  buildGuidedLayout,
  type GuidedLayout,
} from "@/lib/guidedRoomLayout";
import {
  buildLayerRenderPlan,
  buildLayerStackKey,
  type LayerRenderPlan,
} from "@/lib/layerNavigation";
import type { PerformanceProfile } from "@/lib/performanceProfile";

const layoutCache = new Map<string, GuidedLayout>();
const layerPlanCache = new Map<string, LayerRenderPlan>();

function roomRevision(room: KnowledgeRoom): string {
  return `${room.concepts.length}:${room.relationships.length}`;
}

export function getCachedGuidedLayout(
  room: KnowledgeRoom,
  language: LanguageCode
): GuidedLayout {
  const key = `${room.id}:${language}:${roomRevision(room)}`;
  let layout = layoutCache.get(key);
  if (!layout) {
    layout = buildGuidedLayout(room, language);
    layoutCache.set(key, layout);
  }
  return layout;
}

export function getCachedLayerRenderPlan(
  room: KnowledgeRoom,
  stack: LayerStack,
  view: LearningViewMode,
  layout: GuidedLayout,
  profile: PerformanceProfile,
  language: LanguageCode
): LayerRenderPlan {
  const key = `${room.id}:${buildLayerStackKey(stack)}:${view}:${language}:${roomRevision(room)}:${profile.maxMainIdeas}`;
  let plan = layerPlanCache.get(key);
  if (!plan) {
    plan = buildLayerRenderPlan(room, stack, view, layout, profile, language);
    layerPlanCache.set(key, plan);
  }
  return plan;
}

export function clearRoomComputeCache(roomId?: string): void {
  if (!roomId) {
    layoutCache.clear();
    layerPlanCache.clear();
    return;
  }
  for (const key of layoutCache.keys()) {
    if (key.startsWith(`${roomId}:`)) layoutCache.delete(key);
  }
  for (const key of layerPlanCache.keys()) {
    if (key.startsWith(`${roomId}:`)) layerPlanCache.delete(key);
  }
}
