import type { Brand, LanguageCode } from "@/types";

/**
 * Returns the brand description in the given language.
 * Supports both localized object (Record<LanguageCode, string>) and legacy string.
 * Falls back to the first available translation, then to empty string.
 */
export function getBrandDescription(brand: Brand, language: string): string {
  const desc = brand.description;
  if (desc == null) return "";
  if (typeof desc === "string") return desc;
  const lang = language.split("-")[0] as LanguageCode;
  const forLang = desc[lang];
  if (forLang) return forLang;
  const first = Object.values(desc)[0];
  return typeof first === "string" ? first : "";
}
