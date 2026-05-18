"use client";

import { AuthGate } from "@/components/auth/AuthGate";

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
