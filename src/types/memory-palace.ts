import type {
  Concept,
  EducationLevel,
  Flashcard,
  MemoryRouteStep,
  MultilingualText,
  PracticeQuestion,
  Relationship,
  StudyGuide,
  Subject,
} from "./learning";

export interface KnowledgeRoom {
  id: string;
  title: MultilingualText;
  summary: MultilingualText;
  rawContent?: string;
  subject?: Subject;
  level?: EducationLevel;
  lessonId?: string;
  concepts: Concept[];
  relationships: Relationship[];
  studyGuide: StudyGuide;
  flashcards: Flashcard[];
  practiceQuestions: PracticeQuestion[];
  memoryRoute: MemoryRouteStep[];
  createdAt: string;
  isDemo?: boolean;
}

export const CLUSTER_COLORS: Record<string, string> = {
  "Core Concepts": "#22d3ee",
  Fundamentals: "#34d399",
  Process: "#fb923c",
  Applications: "#3b82f6",
  "Machine Learning": "#a78bfa",
  "Ethics & Society": "#f472b6",
  Biology: "#4ade80",
  Physics: "#60a5fa",
  Chemistry: "#a78bfa",
  Mathematics: "#fbbf24",
  Programming: "#22d3ee",
  Technology: "#fbbf24",
  default: "#64748b",
};

export function getClusterColor(cluster: string): string {
  return CLUSTER_COLORS[cluster] ?? CLUSTER_COLORS.default;
}
