import type { LanguageCode } from "@/types/learning";
import { en, type TranslationKeys } from "./en";

type CatalogPatch = Record<string, unknown>;

const loaders: Partial<
  Record<LanguageCode, () => Promise<CatalogPatch>>
> = {
  fr: () => import("./locales/fr").then((m) => m.fr as CatalogPatch),
  es: () => import("./locales/es").then((m) => m.es as CatalogPatch),
  pt: () => import("./locales/pt").then((m) => m.pt as CatalogPatch),
  sw: () => import("./locales/sw").then((m) => m.sw as CatalogPatch),
  bem: () => import("./locales/bem").then((m) => m.bem as CatalogPatch),
  nya: () => import("./locales/nya").then((m) => m.nya as CatalogPatch),
};

const cache = new Map<LanguageCode, TranslationKeys>();

function deepMerge<T extends Record<string, unknown>>(
  base: T,
  patch: Record<string, unknown>
): T {
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

/** Load translations for one language (cached). English is synchronous. */
export async function loadTranslations(lang: LanguageCode): Promise<TranslationKeys> {
  if (lang === "en") {
    const dict = en as unknown as TranslationKeys;
    cache.set("en", dict);
    return dict;
  }
  const cached = cache.get(lang);
  if (cached) return cached;

  const loader = loaders[lang];
  if (!loader) return en as unknown as TranslationKeys;

  const patch = await loader();
  const merged = deepMerge(
    en as unknown as Record<string, unknown>,
    patch
  ) as unknown as TranslationKeys;
  cache.set(lang, merged);
  return merged;
}

/** Sync path — uses cache; falls back to English until async load completes */
export function getTranslationsSync(lang: LanguageCode): TranslationKeys {
  return cache.get(lang) ?? (en as unknown as TranslationKeys);
}

export function primeTranslationCache(lang: LanguageCode, dict: TranslationKeys): void {
  cache.set(lang, dict);
}

export function invalidateTranslationCache(lang?: LanguageCode): void {
  if (lang) cache.delete(lang);
  else cache.clear();
}
