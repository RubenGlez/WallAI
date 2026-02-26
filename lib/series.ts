import type { LanguageCode, Series } from "@/types";

/**
 * Returns the series description in the given language.
 * Supports both localized object (Record<LanguageCode, string>) and legacy string.
 * Falls back to the first available translation, then to empty string.
 */
export function getSeriesDescription(
  series: Series,
  language: string
): string {
  const desc = series.description;
  if (desc == null) return "";
  if (typeof desc === "string") return desc;
  const lang = language.split("-")[0] as LanguageCode;
  const forLang = desc[lang];
  if (forLang) return forLang;
  const first = Object.values(desc)[0];
  return typeof first === "string" ? first : "";
}
