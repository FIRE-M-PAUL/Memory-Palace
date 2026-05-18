import type { KnowledgeRoom } from "@/types/memory-palace";
import { getDemoRoom } from "@/lib/demoRoom";
import { enrichRoom } from "@/lib/relationshipHelpers";
import { v4 as uuidv4 } from "uuid";

const ROOMS_KEY = "memory-palace-rooms";
const CHAT_KEY = "memory-palace-chat";
export const DEMO_ROOM_ID = "demo-ai";

export function getRooms(): KnowledgeRoom[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ROOMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getRoom(id: string): KnowledgeRoom | undefined {
  if (id === DEMO_ROOM_ID) {
    const saved = getRooms().find((r) => r.id === DEMO_ROOM_ID);
    return saved ?? getDemoRoom();
  }
  return getRooms().find((r) => r.id === id);
}

export function getRoomOrFallback(id: string): KnowledgeRoom {
  return enrichRoom(getRoom(id) ?? getDemoRoom());
}

export function saveRoom(room: KnowledgeRoom): void {
  const rooms = getRooms().filter((r) => r.id !== room.id);
  rooms.unshift(room);
  localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
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
  const demo = getDemoRoom();
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
