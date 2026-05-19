/** Visual learning style for the same KnowledgeRoom data */
export type LearningViewMode = "focus" | "explore" | "creative" | "room";

export const LEARNING_VIEW_MODES: LearningViewMode[] = [
  "focus",
  "explore",
  "creative",
  "room",
];

export const DEFAULT_LEARNING_VIEW: LearningViewMode = "focus";
