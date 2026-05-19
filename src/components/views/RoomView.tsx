"use client";

import { KnowledgeCanvas } from "@/components/3d/SharedKnowledgeScene";
import type { KnowledgeViewProps } from "@/components/3d/types";
import { useAppStore } from "@/store/appStore";

export function RoomView(props: KnowledgeViewProps) {
  const t = useAppStore((s) => s.t);

  return (
    <KnowledgeCanvas
      {...props}
      view="room"
      hint={t.roomViewHint}
      onReset={() => props.onSelectConcept(null)}
    />
  );
}
