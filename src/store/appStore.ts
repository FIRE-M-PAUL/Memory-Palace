"use client";

import { create } from "zustand";
import type { DifficultyLevel, LanguageCode } from "@/types/learning";
import type { StudyStyle } from "@/lib/difficulty";
import {
  getLanguage,
  getDifficulty,
  getStudyStyle,
  setLanguage as persistLanguage,
  setDifficulty as persistDifficulty,
  setStudyStyle as persistStudyStyle,
} from "@/lib/progressStorage";
import { loadTranslations, primeTranslationCache, type TranslationKeys } from "@/lib/i18n";
import { en } from "@/lib/i18n/en";

interface AppState {
  language: LanguageCode;
  difficulty?: DifficultyLevel;
  studyStyle?: StudyStyle;
  hydrated: boolean;
  t: TranslationKeys;
  setLanguage: (lang: LanguageCode) => void;
  setDifficulty: (difficulty: DifficultyLevel) => void;
  setStudyStyle: (style: StudyStyle) => void;
  hydrate: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: "en",
  difficulty: undefined,
  studyStyle: undefined,
  hydrated: false,
  t: en as unknown as TranslationKeys,
  hydrate: () => {
    const lang = getLanguage();
    const difficulty = getDifficulty();
    const studyStyle = getStudyStyle();
    void loadTranslations(lang).then((t) => {
      primeTranslationCache(lang, t);
      set({
        language: lang,
        difficulty,
        studyStyle,
        hydrated: true,
        t,
      });
    });
  },
  setLanguage: (lang) => {
    persistLanguage(lang);
    void loadTranslations(lang).then((t) => {
      primeTranslationCache(lang, t);
      set({ language: lang, t });
    });
  },
  setDifficulty: (difficulty) => {
    persistDifficulty(difficulty);
    set({ difficulty });
  },
  setStudyStyle: (style) => {
    persistStudyStyle(style);
    set({ studyStyle: style });
  },
}));
