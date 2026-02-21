import type { Color } from "@/types";

/**
 * Returns the display name for a color in the given language.
 * Falls back to the first available name or the color code.
 */
export function getColorDisplayName(color: Color, language: string): string {
  const lang = language.split("-")[0];
  const names = color.name;
  if (!names || typeof names !== "object") return color.code;
  const forLang = names[lang as keyof typeof names];
  if (forLang) return forLang;
  const first = Object.values(names)[0];
  return typeof first === "string" ? first : color.code;
}

/**
 * Returns colors for the given series IDs using the provided fetcher.
 */
export function getColorsForSeriesIds(
  seriesIds: string[],
  getColorsBySeriesId: (seriesId: string) => Color[]
): Color[] {
  const out: Color[] = [];
  for (const sid of seriesIds) {
    out.push(...getColorsBySeriesId(sid));
  }
  return out;
}

/**
 * Filters colors by search query (matches code and display name).
 */
export function filterColorsBySearch(
  colors: Color[],
  query: string,
  language: string
): Color[] {
  if (!query.trim()) return colors;
  const q = query.trim().toLowerCase();
  return colors.filter((c) => {
    const name = getColorDisplayName(c, language);
    return c.code.toLowerCase().includes(q) || name.toLowerCase().includes(q);
  });
}
