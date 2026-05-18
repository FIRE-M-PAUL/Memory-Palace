export type LanguageCode = "en" | "fr" | "es" | "pt" | "sw" | "bem" | "nya";

export type MultilingualText = {
  en: string;
  fr?: string;
  es?: string;
  pt?: string;
  sw?: string;
  bem?: string;
  nya?: string;
};

export type Importance = "high" | "medium" | "low";

export type EducationLevel =
  | "grade-1"
  | "grade-2"
  | "grade-3"
  | "grade-4"
  | "grade-5"
  | "grade-6"
  | "grade-7"
  | "grade-8"
  | "grade-9"
  | "grade-10"
  | "grade-11"
  | "grade-12"
  | "university-year-1"
  | "university-year-2"
  | "university-year-3"
  | "university-year-4";

export type Subject =
  | "mathematics"
  | "english"
  | "science"
  | "computer-studies"
  | "social-studies"
  | "business-studies"
  | "biology"
  | "chemistry"
  | "physics"
  | "geography"
  | "history"
  | "civic-education"
  | "agriculture"
  | "ict"
  | "programming"
  | "economics"
  | "accounting"
  | "statistics"
  | "data-structures"
  | "database-systems"
  | "software-engineering";

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Concept {
  id: string;
  title: MultilingualText;
  summary: MultilingualText;
  importance: Importance;
  cluster: string;
  sourceExcerpt?: MultilingualText;
  whyItMatters?: MultilingualText;
  studyTip?: MultilingualText;
  position: Position3D;
}

export type RelationshipStrength = "strong" | "medium" | "weak";

export interface Relationship {
  source: string;
  target: string;
  label: string;
  explanation?: MultilingualText;
  sourceExcerpt?: MultilingualText;
  studyTip?: MultilingualText;
  strength?: RelationshipStrength;
}

export type QuestionType = "multiple-choice" | "short-answer" | "math-input";

export interface PracticeQuestion {
  id: string;
  type: QuestionType;
  question: MultilingualText;
  options?: MultilingualText[];
  answer: string;
  explanation: MultilingualText;
  difficulty: "easy" | "medium" | "hard";
  hints: MultilingualText[];
}

export interface Flashcard {
  id: string;
  front: MultilingualText;
  back: MultilingualText;
  conceptId?: string;
}

export interface MemoryRouteStep {
  step: number;
  conceptId: string;
  title: MultilingualText;
  explanation: MultilingualText;
  reason: MultilingualText;
}

export interface StudyGuide {
  overview: MultilingualText;
  keyPoints: MultilingualText[];
  questions: MultilingualText[];
  flashcards: Flashcard[];
}

export interface LearnerProgress {
  selectedLanguage: LanguageCode;
  selectedLevel?: EducationLevel;
  completedTopics: string[];
  weakConcepts: string[];
  strongConcepts: string[];
  quizScores: {
    topicId: string;
    score: number;
    total: number;
    date: string;
  }[];
  flashcardReviews: Record<string, "remembered" | "needs-review">;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}
