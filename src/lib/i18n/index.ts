import type { LanguageCode } from "@/types/learning";
import { en, type TranslationKeys } from "./en";
import { fr } from "./fr";
import { es } from "./es";
import { pt } from "./pt";
import { sw } from "./sw";
import { bem } from "./bem";
import { nya } from "./nya";

export const LANGUAGE_OPTIONS: { code: LanguageCode; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "fr", label: "French", native: "Français" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "pt", label: "Portuguese", native: "Português" },
  { code: "sw", label: "Swahili", native: "Kiswahili" },
  { code: "bem", label: "Bemba", native: "Ichibemba" },
  { code: "nya", label: "Nyanja", native: "Chichewa" },
];

const catalogs: Record<LanguageCode, Record<string, unknown>> = {
  en: {},
  fr,
  es,
  pt,
  sw,
  bem,
  nya,
};

function deepMerge<T extends Record<string, unknown>>(base: T, patch: Record<string, unknown>): T {
  const out = { ...base };
  for (const key of Object.keys(patch)) {
    const val = patch[key];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      out[key as keyof T] = deepMerge(
        (base[key as keyof T] ?? {}) as Record<string, unknown>,
        val as Record<string, unknown>
      ) as T[keyof T];
    } else if (val !== undefined) {
      out[key as keyof T] = val as T[keyof T];
    }
  }
  return out;
}

export function getTranslations(lang: LanguageCode): TranslationKeys {
  const patch = catalogs[lang] ?? {};
  return deepMerge(en as unknown as Record<string, unknown>, patch) as unknown as TranslationKeys;
}

export function t(lang: LanguageCode, key: keyof TranslationKeys): string {
  const dict = getTranslations(lang);
  const val = dict[key];
  return typeof val === "string" ? val : String((en as Record<string, unknown>)[key as string] ?? key);
}

export { en };
export type { TranslationKeys };
