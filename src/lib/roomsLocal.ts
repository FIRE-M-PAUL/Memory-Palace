import type { KnowledgeRoom } from "@/types/memory-palace";

const ROOMS_KEY = "memory-palace-rooms";

/** Local room list — no demo room dependency (keeps dashboard bundle lean) */
export function getRooms(): KnowledgeRoom[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ROOMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function writeRooms(rooms: KnowledgeRoom[]): void {
  localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
}

export function persistRoom(room: KnowledgeRoom): void {
  const rooms = getRooms().filter((r) => r.id !== room.id);
  rooms.unshift(room);
  writeRooms(rooms);
}
