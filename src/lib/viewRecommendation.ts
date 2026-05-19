import type { KnowledgeRoom } from "@/types/memory-palace";
import type { LearningViewMode } from "@/types/learning-views";
import type { StudyStyle } from "@/lib/difficulty";
import { DEFAULT_LEARNING_VIEW } from "@/types/learning-views";

export interface ViewRecommendation {
  view: LearningViewMode;
  reasonKey:
    | "recommendFocus"
    | "recommendExplore"
    | "recommendCreative"
    | "recommendRoom";
}

export function recommendLearningView(
  room: KnowledgeRoom,
  studyStyle?: StudyStyle
): ViewRecommendation {
  const count = room.concepts.length;

  if (studyStyle === "visual") {
    return { view: "creative", reasonKey: "recommendCreative" };
  }
  if (studyStyle === "deep") {
    return { view: "explore", reasonKey: "recommendExplore" };
  }
  if (studyStyle === "quick") {
    return { view: "focus", reasonKey: "recommendFocus" };
  }

  if (count > 14) {
    return { view: "room", reasonKey: "recommendRoom" };
  }
  if (count > 8) {
    return { view: "explore", reasonKey: "recommendExplore" };
  }

  return { view: DEFAULT_LEARNING_VIEW, reasonKey: "recommendFocus" };
}
