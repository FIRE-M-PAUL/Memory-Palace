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
import {
  loadTranslations,
  primeTranslationCache,
  invalidateTranslationCache,
  type TranslationKeys,
} from "@/lib/i18n";
import { en } from "@/lib/i18n/en";
import { clearRoomComputeCache } from "@/lib/roomComputeCache";

interface AppState {
  language: LanguageCode;
  languageLoading: boolean;
  difficulty?: DifficultyLevel;
  studyStyle?: StudyStyle;
  hydrated: boolean;
  t: TranslationKeys;
  setLanguage: (lang: LanguageCode) => void;
  setDifficulty: (difficulty: DifficultyLevel) => void;
  setStudyStyle: (style: StudyStyle) => void;
  hydrate: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  language: "en",
  languageLoading: false,
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
    if (lang === get().language && get().hydrated) return;
    persistLanguage(lang);
    set({ languageLoading: true, language: lang });
    clearRoomComputeCache();
    invalidateTranslationCache(lang);
    void loadTranslations(lang).then((t) => {
      primeTranslationCache(lang, t);
      set({ language: lang, t, languageLoading: false });
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
