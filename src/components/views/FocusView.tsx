"use client";

import { KnowledgeCanvas } from "@/components/3d/SharedKnowledgeScene";
import type { KnowledgeViewProps } from "@/components/3d/types";
import { useAppStore } from "@/store/appStore";

export function FocusView({
  room,
  selectedId,
  onSelectConcept,
  onSelectConnection,
  layerStack,
  layerKey,
  transitioning,
  onConceptActivate,
}: KnowledgeViewProps) {
  const t = useAppStore((s) => s.t);

  return (
    <KnowledgeCanvas
      room={room}
      selectedId={selectedId}
      onSelectConcept={onSelectConcept}
      onConceptActivate={onConceptActivate}
      onSelectConnection={onSelectConnection}
      view="focus"
      layerStack={layerStack}
      layerKey={layerKey}
      transitioning={transitioning}
      hint={t.focusViewHint}
      onReset={() => onSelectConcept(null)}
    />
  );
}
