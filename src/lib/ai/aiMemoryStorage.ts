import type {
  FeedbackEvent,
  RoomKnowledgeIndex,
  UserLearningProfile,
} from "@/types/ai-memory";

const INDEX_PREFIX = "memory-palace-ai-index-";
const FEEDBACK_KEY = "memory-palace-ai-feedback";
const PROFILE_KEY = "memory-palace-ai-profile";

export function getRoomIndex(roomId: string): RoomKnowledgeIndex | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${INDEX_PREFIX}${roomId}`);
    return raw ? (JSON.parse(raw) as RoomKnowledgeIndex) : null;
  } catch {
    return null;
  }
}

export function saveRoomIndex(index: RoomKnowledgeIndex): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${INDEX_PREFIX}${index.roomId}`, JSON.stringify(index));
}

export function getAllFeedback(): FeedbackEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    return raw ? (JSON.parse(raw) as FeedbackEvent[]) : [];
  } catch {
    return [];
  }
}

export function saveFeedbackEvent(event: FeedbackEvent): void {
  const all = [...getAllFeedback(), event];
  if (typeof window !== "undefined") {
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(all.slice(-500)));
  }
}

export function getFeedbackForRoom(roomId: string): FeedbackEvent[] {
  return getAllFeedback().filter((f) => f.roomId === roomId);
}

export function getLearningProfile(userId = "local-user"): UserLearningProfile {
  if (typeof window === "undefined") {
    return {
      userId,
      interactions: [],
      globalPositiveFeedback: 0,
      globalNegativeFeedback: 0,
      updatedAt: new Date().toISOString(),
    };
  }
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw) as UserLearningProfile;
  } catch {
    /* empty */
  }
  return {
    userId,
    interactions: [],
    globalPositiveFeedback: 0,
    globalNegativeFeedback: 0,
    updatedAt: new Date().toISOString(),
  };
}

export function saveLearningProfile(profile: UserLearningProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}
