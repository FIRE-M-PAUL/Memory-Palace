"use client";

import { AuthGate } from "@/components/auth/AuthGate";

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
