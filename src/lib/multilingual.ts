import type { LanguageCode, MultilingualText } from "@/types/learning";

export function mt(en: string, translations?: Partial<Omit<MultilingualText, "en">>): MultilingualText {
  return { en, ...translations };
}

export function resolveText(text: MultilingualText | string, lang: LanguageCode): string {
  if (typeof text === "string") return text;
  if (lang !== "en" && text[lang]) return text[lang] as string;
  return text.en;
}

export function resolveOptional(
  text: MultilingualText | undefined,
  lang: LanguageCode
): string | undefined {
  if (!text) return undefined;
  return resolveText(text, lang);
}
