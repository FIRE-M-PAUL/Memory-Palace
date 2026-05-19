"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { KnowledgeRoom } from "@/types/memory-palace";
import type { LanguageCode } from "@/types/learning";
import type { LayerStack } from "@/types/nested-worlds";
import {
  buildLayerStackKey,
  canDiveDeeper,
  createRootLayerFrame,
  enterLayer,
  getLayerDepth,
  goToRootLayer,
  leaveLayer,
} from "@/lib/layerNavigation";

const TRANSITION_MS = 320;

export function useLearningLayers(
  room: KnowledgeRoom | null,
  language: LanguageCode
) {
  const [layerStack, setLayerStack] = useState<LayerStack>([]);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (room) {
      setLayerStack([createRootLayerFrame(room, language)]);
    } else {
      setLayerStack([]);
    }
    // Reset stack only when switching rooms or language — not on in-place room edits
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id, language]);

  const layerKey = useMemo(() => buildLayerStackKey(layerStack), [layerStack]);
  const depth = getLayerDepth(layerStack);
  const currentFrame = layerStack[layerStack.length - 1];

  const runTransition = useCallback((update: () => void) => {
    setTransitioning(true);
    window.setTimeout(() => {
      update();
      setTransitioning(false);
    }, TRANSITION_MS);
  }, []);

  const diveInto = useCallback(
    (conceptId: string) => {
      if (!room) return false;
      if (!canDiveDeeper(room, conceptId, layerStack)) return false;
      runTransition(() => {
        setLayerStack((prev) => enterLayer(prev, room, conceptId, language));
      });
      return true;
    },
    [room, layerStack, language, runTransition]
  );

  const goBack = useCallback(() => {
    if (layerStack.length <= 1) return;
    runTransition(() => setLayerStack((prev) => leaveLayer(prev)));
  }, [layerStack.length, runTransition]);

  const goToRoot = useCallback(() => {
    if (!room || layerStack.length <= 1) return;
    runTransition(() => setLayerStack(goToRootLayer(room, language)));
  }, [room, layerStack.length, language, runTransition]);

  const canGoBack = layerStack.length > 1;

  const canDiveIntoConcept = useCallback(
    (conceptId: string) => (room ? canDiveDeeper(room, conceptId, layerStack) : false),
    [room, layerStack]
  );

  const navigateToLayer = useCallback(
    (index: number) => {
      if (index < 0 || index >= layerStack.length - 1) return;
      runTransition(() => setLayerStack((prev) => prev.slice(0, index + 1)));
    },
    [layerStack.length, runTransition]
  );

  return {
    layerStack,
    layerKey,
    depth,
    currentFrame,
    transitioning,
    transitionMs: TRANSITION_MS,
    diveInto,
    goBack,
    goToRoot,
    canGoBack,
    canDiveIntoConcept,
    navigateToLayer,
  };
}
