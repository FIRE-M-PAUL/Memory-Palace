import type {
  Concept,
  DifficultyLevel,
  Flashcard,
  MemoryRouteStep,
  MultilingualText,
  PracticeQuestion,
  Relationship,
  Subject,
} from "./learning";

export interface Lesson {
  id: string;
  title: MultilingualText;
  subject: Subject;
  difficulty: DifficultyLevel;
  overview: MultilingualText;
  concepts: Concept[];
  relationships: Relationship[];
  examples: MultilingualText[];
  practiceQuestions: PracticeQuestion[];
  flashcards: Flashcard[];
  memoryRoute: MemoryRouteStep[];
}

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  "beginner",
  "basic",
  "intermediate",
  "advanced",
  "expert",
];

export const SUBJECTS: Subject[] = [
  "mathematics",
  "english",
  "science",
  "computer-studies",
  "social-studies",
  "business-studies",
  "biology",
  "chemistry",
  "physics",
  "geography",
  "history",
  "civic-education",
  "agriculture",
  "ict",
  "programming",
  "economics",
  "accounting",
  "statistics",
  "data-structures",
  "database-systems",
  "software-engineering",
];
