import type { Concept, Relationship } from "@/types/learning";

/** One level in the nested learning world stack */
export interface LearningLayerFrame {
  /** null = main topic world */
  focusConceptId: string | null;
  title: string;
}

export type LayerStack = LearningLayerFrame[];

export const MAX_LAYER_DEPTH = 4;

export interface ConceptWithLayerMeta extends Concept {
  parentId?: string;
  layerDepth?: number;
  /** Populated lazily from graph neighbors */
  childIds?: string[];
  localRelationships?: Relationship[];
}
