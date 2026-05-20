"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { LanguageSync } from "@/components/providers/LanguageSync";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useAppStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return (
    <>
      <LanguageSync />
      {children}
    </>
  );
}
