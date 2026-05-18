"use client";

import { create } from "zustand";
import type { EducationLevel, LanguageCode } from "@/types/learning";
import {
  getLanguage,
  getLevel,
  setLanguage as persistLanguage,
  setLevel as persistLevel,
} from "@/lib/progressStorage";
import { getTranslations, type TranslationKeys } from "@/lib/i18n";

interface AppState {
  language: LanguageCode;
  level?: EducationLevel;
  hydrated: boolean;
  t: TranslationKeys;
  setLanguage: (lang: LanguageCode) => void;
  setLevel: (level: EducationLevel) => void;
  hydrate: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: "en",
  level: undefined,
  hydrated: false,
  t: getTranslations("en"),
  hydrate: () => {
    const lang = getLanguage();
    const level = getLevel();
    set({ language: lang, level, hydrated: true, t: getTranslations(lang) });
  },
  setLanguage: (lang) => {
    persistLanguage(lang);
    set({ language: lang, t: getTranslations(lang) });
  },
  setLevel: (level) => {
    persistLevel(level);
    set({ level });
  },
}));
