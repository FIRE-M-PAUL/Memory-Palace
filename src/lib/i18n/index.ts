import type { LanguageCode } from "@/types/learning";
import { en, type TranslationKeys } from "./en";
import {
  getTranslationsSync,
  loadTranslations,
  primeTranslationCache,
} from "./loadTranslations";

primeTranslationCache("en", en as unknown as TranslationKeys);

export const LANGUAGE_OPTIONS: { code: LanguageCode; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "fr", label: "French", native: "Français" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "pt", label: "Portuguese", native: "Português" },
  { code: "sw", label: "Swahili", native: "Kiswahili" },
  { code: "bem", label: "Bemba", native: "Ichibemba" },
  { code: "nya", label: "Nyanja", native: "Chichewa" },
];

/** @deprecated Prefer loadTranslations — sync read uses cache (English until loaded) */
export function getTranslations(lang: LanguageCode): TranslationKeys {
  return getTranslationsSync(lang);
}

export { loadTranslations, getTranslationsSync, primeTranslationCache };

export function t(lang: LanguageCode, key: keyof TranslationKeys): string {
  const dict = getTranslationsSync(lang);
  const val = dict[key];
  return typeof val === "string" ? val : String((en as Record<string, unknown>)[key as string] ?? key);
}

export { en };
export type { TranslationKeys };
