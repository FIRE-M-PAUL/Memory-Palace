"use client";

import { KnowledgeCanvas } from "@/components/3d/SharedKnowledgeScene";
import type { KnowledgeViewProps } from "@/components/3d/types";
import { useAppStore } from "@/store/appStore";

export function ExploreView(props: KnowledgeViewProps) {
  const t = useAppStore((s) => s.t);

  return (
    <KnowledgeCanvas
      {...props}
      view="explore"
      hint={t.exploreViewHint}
      onReset={() => props.onSelectConcept(null)}
    />
  );
}
