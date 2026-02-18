import { useMemo } from 'react';
import type { Brand, BrandWithCount, Series, SeriesWithCount } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const brandsData = require('@/assets/data/brands.json') as Brand[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const seriesData = require('@/assets/data/series.json') as Series[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const colorsData = require('@/assets/data/colors.json') as { id: string; seriesId: string }[];

/** Count colors per series (seriesId -> count) */
const colorCountBySeriesId: Record<string, number> = {};
for (const c of colorsData) {
  colorCountBySeriesId[c.seriesId] = (colorCountBySeriesId[c.seriesId] ?? 0) + 1;
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
 * Hook: brands with count.
 */
export function useBrandsWithCount(): BrandWithCount[] {
  return useMemo(() => getBrandsWithCount(), []);
}
