import { en, type TranslationKeys } from "./en";

type PlainObject = Record<string, unknown>;

function deepMerge<T extends PlainObject>(base: T, patch: PlainObject): T {
  const out = { ...base };
  for (const key of Object.keys(patch)) {
    const val = patch[key];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      out[key as keyof T] = deepMerge(
        (base[key as keyof T] ?? {}) as PlainObject,
        val as PlainObject
      ) as T[keyof T];
    } else if (val !== undefined) {
      out[key as keyof T] = val as T[keyof T];
    }
  }
  return out;
}

/** Build a full locale catalog from English + translated overrides */
export function defineLocale(patch: PlainObject): TranslationKeys {
  return deepMerge(en as unknown as PlainObject, patch) as TranslationKeys;
}
