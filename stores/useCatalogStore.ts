import { useMemo } from 'react';
import type {
  Brand,
  BrandWithCount,
  Color,
  Series,
  SeriesWithCount,
  SeriesWithCountAndBrand,
} from '@/types';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const brandsData = require('@/assets/data/brands.json') as Brand[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const seriesData = require('@/assets/data/series.json') as Series[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const colorsData = require('@/assets/data/colors.json') as Color[];

/** Count colors per series (seriesId -> count) */
const colorCountBySeriesId: Record<string, number> = {};
for (const c of colorsData) {
  colorCountBySeriesId[c.seriesId] = (colorCountBySeriesId[c.seriesId] ?? 0) + 1;
}

/**
 * Returns colors for a series. lab is null until we have a generator script.
 */
export function getColorsBySeriesId(seriesId: string): Color[] {
  return colorsData
    .filter((c) => c.seriesId === seriesId)
    .map((c) => ({ ...c, lab: c.lab ?? null }));
}

/** Count colors per brand (brandId -> count) */
const colorCountByBrand: Record<string, number> = {};
for (const s of seriesData) {
  const count = colorCountBySeriesId[s.id] ?? 0;
  colorCountByBrand[s.brandId] = (colorCountByBrand[s.brandId] ?? 0) + count;
}

/**
 * Returns brands with computed color count.
 */
export function getBrandsWithCount(): BrandWithCount[] {
  return brandsData.map((b) => ({
    ...b,
    colorCount: colorCountByBrand[b.id] ?? 0,
  }));
}

/**
 * Returns a brand by id.
 */
export function getBrandById(brandId: string): Brand | undefined {
  return brandsData.find((b) => b.id === brandId);
}

/**
 * Returns a series by id.
 */
export function getSeriesById(seriesId: string): Series | undefined {
  return seriesData.find((s) => s.id === seriesId);
}

/**
 * Returns series for a given brand.
 */
export function getSeriesByBrandId(brandId: string): Series[] {
  return seriesData.filter((s) => s.brandId === brandId);
}

/**
 * Returns all colors from all series of a brand (for "closest match" search).
 */
export function getColorsByBrandId(brandId: string): Color[] {
  const seriesIds = seriesData.filter((s) => s.brandId === brandId).map((s) => s.id);
  return colorsData.filter((c) => seriesIds.includes(c.seriesId));
}

/**
 * Returns series for a given brand with color count.
 */
export function getSeriesWithCountByBrandId(brandId: string): SeriesWithCount[] {
  return seriesData
    .filter((s) => s.brandId === brandId)
    .map((s) => ({
      ...s,
      colorCount: colorCountBySeriesId[s.id] ?? 0,
    }));
}

/**
 * Returns all series with color count and brand name (for "all series" list).
 */
export function getAllSeriesWithCount(): SeriesWithCountAndBrand[] {
  const result: SeriesWithCountAndBrand[] = [];
  for (const brand of brandsData) {
    const seriesList = getSeriesWithCountByBrandId(brand.id);
    for (const s of seriesList) {
      result.push({ ...s, brandName: brand.name });
    }
  }
  return result;
}

/**
 * Hook: brands with count.
 */
export function useBrandsWithCount(): BrandWithCount[] {
  return useMemo(() => getBrandsWithCount(), []);
}
