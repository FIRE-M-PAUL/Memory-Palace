import type { LanguageCode } from "@/types/learning";
import {
  getLearningProfile,
  saveLearningProfile,
} from "@/lib/ai/aiMemoryStorage";
import type { StudyInteraction } from "@/types/ai-memory";

export function recordStudyInteraction(
  roomId: string,
  conceptId: string,
  type: StudyInteraction["type"]
): void {
  const profile = getLearningProfile();
  profile.interactions.push({
    roomId,
    conceptId,
    type,
    at: new Date().toISOString(),
  });
  if (profile.interactions.length > 800) {
    profile.interactions = profile.interactions.slice(-600);
  }
  profile.updatedAt = new Date().toISOString();
  saveLearningProfile(profile);
}

export function getStrugglingConceptIds(roomId: string): Set<string> {
  const profile = getLearningProfile();
  const counts = new Map<string, number>();
  for (const i of profile.interactions) {
    if (i.roomId !== roomId || i.type !== "quiz_miss") continue;
    counts.set(i.conceptId, (counts.get(i.conceptId) ?? 0) + 1);
  }
  return new Set([...counts.entries()].filter(([, n]) => n >= 2).map(([id]) => id));
}

export function getFamiliarConceptIds(roomId: string): Set<string> {
  const profile = getLearningProfile();
  const counts = new Map<string, number>();
  for (const i of profile.interactions) {
    if (i.roomId !== roomId) continue;
    if (i.type === "view" || i.type === "select" || i.type === "dive") {
      counts.set(i.conceptId, (counts.get(i.conceptId) ?? 0) + 1);
    }
  }
  return new Set([...counts.entries()].filter(([, n]) => n >= 3).map(([id]) => id));
}

export function adaptationHint(lang: LanguageCode, roomId: string): string | null {
  const struggling = getStrugglingConceptIds(roomId).size;
  const familiar = getFamiliarConceptIds(roomId).size;
  if (struggling >= 2) {
    return lang === "en"
      ? "Tip: Focus on one idea at a time — your study path is ordered for you."
      : null;
  }
  if (familiar >= 4) {
    return lang === "en"
      ? "You are building strong familiarity with several ideas in this palace."
      : null;
  }
  return null;
}
