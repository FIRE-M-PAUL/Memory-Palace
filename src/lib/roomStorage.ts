import type { KnowledgeRoom } from "@/types/memory-palace";
import { DEMO_ROOM_ID } from "@/lib/constants";
import { enrichRoom } from "@/lib/relationshipHelpers";
import { getRooms, persistRoom } from "@/lib/roomsLocal";
import { v4 as uuidv4 } from "uuid";

export { DEMO_ROOM_ID } from "@/lib/constants";
export { getRooms } from "@/lib/roomsLocal";

const CHAT_KEY = "memory-palace-chat";

import { getDemoRoom } from "@/lib/demoRoom";

let demoRoomCache: KnowledgeRoom | null = null;

function getDemoRoomCached(): KnowledgeRoom {
  if (!demoRoomCache) demoRoomCache = getDemoRoom();
  return demoRoomCache;
}

export function getRoom(id: string): KnowledgeRoom | undefined {
  if (id === DEMO_ROOM_ID) {
    const saved = getRooms().find((r) => r.id === DEMO_ROOM_ID);
    return saved ?? getDemoRoomCached();
  }
  return getRooms().find((r) => r.id === id);
}

export function getRoomOrFallback(id: string): KnowledgeRoom {
  return enrichRoom(getRoom(id) ?? getDemoRoomCached());
}

export function saveRoom(room: KnowledgeRoom): void {
  persistRoom(room);
}

export function createRoom(data: Omit<KnowledgeRoom, "id" | "createdAt">): KnowledgeRoom {
  const room: KnowledgeRoom = enrichRoom({
    ...data,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  });
  saveRoom(room);
  return room;
}

export function saveDemoRoom(): KnowledgeRoom {
  const demo = getDemoRoomCached();
  saveRoom(demo);
  return demo;
}

export interface StoredChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export function getChatMessages(roomId: string): StoredChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${CHAT_KEY}-${roomId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveChatMessage(roomId: string, message: StoredChatMessage): void {
  const messages = [...getChatMessages(roomId), message];
  localStorage.setItem(`${CHAT_KEY}-${roomId}`, JSON.stringify(messages));
}
