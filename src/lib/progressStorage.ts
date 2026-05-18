import type { EducationLevel, LanguageCode, LearnerProgress } from "@/types/learning";

const KEYS = {
  language: "memory-palace-language",
  level: "memory-palace-level",
  progress: "memory-palace-progress",
  flashcards: "memory-palace-flashcards",
  onboardingDone: "memory-palace-onboarding-done",
  defaultView: "memory-palace-default-view",
} as const;

const DEFAULT_PROGRESS: LearnerProgress = {
  selectedLanguage: "en",
  completedTopics: [],
  weakConcepts: [],
  strongConcepts: [],
  quizScores: [],
  flashcardReviews: {},
};

export function getLanguage(): LanguageCode {
  if (typeof window === "undefined") return "en";
  const v = localStorage.getItem(KEYS.language);
  if (v && ["en", "fr", "es", "pt", "sw", "bem", "nya"].includes(v)) {
    return v as LanguageCode;
  }
  return "en";
}

export function setLanguage(lang: LanguageCode): void {
  localStorage.setItem(KEYS.language, lang);
  const p = getProgress();
  p.selectedLanguage = lang;
  saveProgress(p);
}

export function getLevel(): EducationLevel | undefined {
  if (typeof window === "undefined") return undefined;
  const v = localStorage.getItem(KEYS.level);
  return v as EducationLevel | undefined;
}

export function setLevel(level: EducationLevel): void {
  localStorage.setItem(KEYS.level, level);
  const p = getProgress();
  p.selectedLevel = level;
  saveProgress(p);
}

export function getProgress(): LearnerProgress {
  if (typeof window === "undefined") return { ...DEFAULT_PROGRESS };
  try {
    const raw = localStorage.getItem(KEYS.progress);
    if (!raw) return { ...DEFAULT_PROGRESS, selectedLanguage: getLanguage(), selectedLevel: getLevel() };
    const parsed = JSON.parse(raw) as Partial<LearnerProgress>;
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      flashcardReviews: parsed.flashcardReviews ?? {},
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(progress: LearnerProgress): void {
  localStorage.setItem(KEYS.progress, JSON.stringify(progress));
}

export function markTopicComplete(topicId: string): void {
  const p = getProgress();
  if (!p.completedTopics.includes(topicId)) {
    p.completedTopics.push(topicId);
    saveProgress(p);
  }
}

export function recordQuizScore(topicId: string, score: number, total: number): void {
  const p = getProgress();
  p.quizScores.unshift({ topicId, score, total, date: new Date().toISOString() });
  saveProgress(p);
}

export function updateConceptStrength(conceptId: string, correct: boolean): void {
  const p = getProgress();
  const weak = new Set(p.weakConcepts.filter((id) => id !== conceptId));
  const strong = new Set(p.strongConcepts.filter((id) => id !== conceptId));
  if (correct) strong.add(conceptId);
  else weak.add(conceptId);
  p.weakConcepts = [...weak];
  p.strongConcepts = [...strong];
  saveProgress(p);
}

export function setFlashcardReview(cardId: string, status: "remembered" | "needs-review"): void {
  const p = getProgress();
  p.flashcardReviews[cardId] = status;
  saveProgress(p);
}

export function hasCompletedOnboarding(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(KEYS.onboardingDone) === "true";
}

export function setOnboardingComplete(): void {
  localStorage.setItem(KEYS.onboardingDone, "true");
}

export type DefaultRoomView = "2d" | "3d";

export function getDefaultRoomView(): DefaultRoomView {
  if (typeof window === "undefined") return "3d";
  const v = localStorage.getItem(KEYS.defaultView);
  return v === "2d" ? "2d" : "3d";
}

export function setDefaultRoomView(view: DefaultRoomView): void {
  localStorage.setItem(KEYS.defaultView, view);
}
