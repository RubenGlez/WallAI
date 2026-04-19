import type { TFunction } from "i18next";

import type { ColorDetailParams } from "@/components/color-detail-bottom-sheet";
import { getColorDisplayName } from "@/lib/color";
import { getBrandById, getSeriesById } from "@/stores/useCatalogStore";
import type { Color } from "@/types";

/**
 * Assembles the ColorDetailParams object needed to open the detail sheet
 * for a given color. Resolves the series and brand names from the store.
 */
export function buildColorDetailParams(
  color: Color,
  language: string,
  t: TFunction,
): ColorDetailParams {
  const series = getSeriesById(color.seriesId);
  const brand = series ? getBrandById(series.brandId) : undefined;
  return {
    color,
    displayName: getColorDisplayName(color, language),
    brandName: brand?.name ?? t("common.notAvailable"),
    seriesName: series?.name ?? t("common.notAvailable"),
  };
}
