import type { DifficultyLevel } from "@/types/learning";

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  "beginner",
  "basic",
  "intermediate",
  "advanced",
  "expert",
];

export type StudyStyle = "quick" | "deep" | "visual";

export const STUDY_STYLES: StudyStyle[] = ["quick", "deep", "visual"];

/** Map legacy grade/university keys from older saved data */
const LEGACY_LEVEL_MAP: Record<string, DifficultyLevel> = {
  "grade-1": "beginner",
  "grade-2": "beginner",
  "grade-3": "beginner",
  "grade-4": "basic",
  "grade-5": "basic",
  "grade-6": "basic",
  "grade-7": "intermediate",
  "grade-8": "intermediate",
  "grade-9": "intermediate",
  "grade-10": "advanced",
  "grade-11": "advanced",
  "grade-12": "advanced",
  "university-year-1": "advanced",
  "university-year-2": "advanced",
  "university-year-3": "expert",
  "university-year-4": "expert",
};

export function migrateLegacyLevel(value: string | undefined): DifficultyLevel | undefined {
  if (!value) return undefined;
  if (DIFFICULTY_LEVELS.includes(value as DifficultyLevel)) {
    return value as DifficultyLevel;
  }
  return LEGACY_LEVEL_MAP[value];
}

export function isValidDifficulty(value: string): value is DifficultyLevel {
  return DIFFICULTY_LEVELS.includes(value as DifficultyLevel);
}

/** Adjust explanation wording by learner difficulty preference */
export function simplifyTextForDifficulty(
  text: string,
  difficulty?: DifficultyLevel
): string {
  if (!difficulty) return text;

  if (difficulty === "beginner") {
    return text
      .replace(/ furthermore| moreover| therefore| consequently/gi, "")
      .replace(/\b(utilize|demonstrate|facilitate|hypothesis|synthesize)\b/gi, (m) => {
        const l = m.toLowerCase();
        if (l === "utilize") return "use";
        if (l === "demonstrate") return "show";
        if (l === "facilitate") return "help";
        if (l === "hypothesis") return "idea";
        return "combine";
      });
  }

  if (difficulty === "basic") {
    return text.replace(/\b(utilize|facilitate)\b/gi, (m) =>
      m.toLowerCase() === "utilize" ? "use" : "help"
    );
  }

  return text;
}

export function practiceDifficultyForLevel(
  difficulty?: DifficultyLevel
): "easy" | "medium" | "hard" {
  switch (difficulty) {
    case "beginner":
    case "basic":
      return "easy";
    case "intermediate":
      return "medium";
    case "advanced":
    case "expert":
      return "hard";
    default:
      return "medium";
  }
}
