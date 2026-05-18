import type {
  Concept,
  EducationLevel,
  Flashcard,
  MemoryRouteStep,
  MultilingualText,
  PracticeQuestion,
  Relationship,
  Subject,
} from "@/types/learning";
import type { Lesson } from "@/types/curriculum";
import type { KnowledgeRoom } from "@/types/memory-palace";
import type { StudyGuide } from "@/types/learning";
import { mt } from "@/lib/multilingual";

export function positionsFor(count: number) {
  const positions: { x: number; y: number; z: number }[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(count - 1, 1)) * 2;
    const theta = golden * i;
    positions.push({
      x: Math.cos(theta) * 3,
      y: y * 1.5,
      z: Math.sin(theta) * 3,
    });
  }
  return positions;
}

export function buildLesson(params: {
  id: string;
  title: MultilingualText;
  subject: Subject;
  level: EducationLevel;
  overview: MultilingualText;
  conceptData: {
    title: MultilingualText;
    summary: MultilingualText;
    cluster: string;
    importance?: "high" | "medium" | "low";
    excerpt?: MultilingualText;
  }[];
  relationshipPairs: [number, number, string][];
  examples: MultilingualText[];
  practiceQuestions: PracticeQuestion[];
  flashcards: Flashcard[];
}): Lesson {
  const pos = positionsFor(params.conceptData.length);
  const concepts: Concept[] = params.conceptData.map((c, i) => ({
    id: `concept-${i + 1}`,
    title: c.title,
    summary: c.summary,
    importance: c.importance ?? (i < 2 ? "high" : i < 5 ? "medium" : "low"),
    cluster: c.cluster,
    sourceExcerpt: c.excerpt,
    position: pos[i],
  }));

  const relationships: Relationship[] = params.relationshipPairs.map(([a, b, label]) => ({
    source: concepts[a].id,
    target: concepts[b].id,
    label,
  }));

  const memoryRoute: MemoryRouteStep[] = concepts
    .filter((c) => c.importance !== "low")
    .map((c, i) => ({
      step: i + 1,
      conceptId: c.id,
      title: c.title,
      explanation: c.summary,
      reason: mt(`Step ${i + 1}: ${c.title.en} builds your foundation for this topic.`),
    }));

  return {
    id: params.id,
    title: params.title,
    subject: params.subject,
    level: params.level,
    overview: params.overview,
    concepts,
    relationships,
    examples: params.examples,
    practiceQuestions: params.practiceQuestions,
    flashcards: params.flashcards,
    memoryRoute,
  };
}

export function lessonToRoom(lesson: Lesson, rawContent?: string): Omit<KnowledgeRoom, "id" | "createdAt"> {
  const studyGuide: StudyGuide = {
    overview: lesson.overview,
    keyPoints: lesson.concepts.slice(0, 6).map((c) => mt(`${c.title.en}: ${c.summary.en}`)),
    questions: lesson.practiceQuestions.map((q) => q.question),
    flashcards: lesson.flashcards,
  };

  return {
    title: lesson.title,
    summary: lesson.overview,
    rawContent: rawContent ?? lesson.overview.en,
    subject: lesson.subject,
    level: lesson.level,
    lessonId: lesson.id,
    concepts: lesson.concepts,
    relationships: lesson.relationships,
    studyGuide,
    flashcards: lesson.flashcards,
    practiceQuestions: lesson.practiceQuestions,
    memoryRoute: lesson.memoryRoute,
  };
}
