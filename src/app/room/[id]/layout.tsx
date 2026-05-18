"use client";

import { AuthGate } from "@/components/auth/AuthGate";

export default function RoomLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate allowDemo>{children}</AuthGate>;
}
