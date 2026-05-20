"use client";

import { useAppStore } from "@/store/appStore";

export function SiteFooter() {
  const t = useAppStore((s) => s.t);
  return (
    <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
      MEMORY PALACE — {t.footerTagline}
    </footer>
  );
}
