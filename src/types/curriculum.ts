import type {
  Concept,
  EducationLevel,
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
  level: EducationLevel;
  overview: MultilingualText;
  concepts: Concept[];
  relationships: Relationship[];
  examples: MultilingualText[];
  practiceQuestions: PracticeQuestion[];
  flashcards: Flashcard[];
  memoryRoute: MemoryRouteStep[];
}

export const EDUCATION_LEVELS: EducationLevel[] = [
  "grade-1",
  "grade-2",
  "grade-3",
  "grade-4",
  "grade-5",
  "grade-6",
  "grade-7",
  "grade-8",
  "grade-9",
  "grade-10",
  "grade-11",
  "grade-12",
  "university-year-1",
  "university-year-2",
  "university-year-3",
  "university-year-4",
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
