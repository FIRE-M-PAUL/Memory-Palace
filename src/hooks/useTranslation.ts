"use client";

import { useAppStore } from "@/store/appStore";
import type { LanguageCode } from "@/types/learning";
import type { TranslationKeys } from "@/lib/i18n";

export function useTranslation(): {
  t: TranslationKeys;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  languageLoading: boolean;
} {
  const language = useAppStore((s) => s.language);
  const t = useAppStore((s) => s.t);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const languageLoading = useAppStore((s) => s.languageLoading);
  return { t, language, setLanguage, languageLoading };
}
