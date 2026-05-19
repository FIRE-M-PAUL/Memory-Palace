"use client";

import { KnowledgeCanvas } from "@/components/3d/SharedKnowledgeScene";
import type { KnowledgeViewProps } from "@/components/3d/types";
import { useAppStore } from "@/store/appStore";

export function CreativeView(props: KnowledgeViewProps) {
  const t = useAppStore((s) => s.t);

  return (
    <KnowledgeCanvas
      {...props}
      view="creative"
      hint={t.creativeViewHint}
      onReset={() => props.onSelectConcept(null)}
    />
  );
}
