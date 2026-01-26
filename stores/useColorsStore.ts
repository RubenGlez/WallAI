import { create } from 'zustand';
import { Color, ColorTranslations, ColorWithTranslations, Series, Brand } from '@/types';
import colorsData from '@/assets/data/colors.json';
import colorsTranslationsData from '@/assets/data/colors-translations.json';
import seriesData from '@/assets/data/series.json';
import brandsData from '@/assets/data/brands.json';

interface ColorsState {
  colors: Color[];
  translations: ColorTranslations[];
  series: Series[];
  brands: Brand[];
  colorsWithTranslations: ColorWithTranslations[];
  isLoading: boolean;
  loadColors: () => void;
  getColorById: (id: string) => ColorWithTranslations | undefined;
  getColorsBySeriesId: (seriesId: string) => ColorWithTranslations[];
  getSeriesById: (id: string) => Series | undefined;
  getBrandById: (id: string) => Brand | undefined;
  getSeriesByBrandId: (brandId: string) => Series[];
  getColorsByBrandId: (brandId: string) => ColorWithTranslations[];
}

// Helper function to combine color with translations
const combineColorWithTranslations = (
  color: Color,
  translations: ColorTranslations[]
): ColorWithTranslations => {
  const translation = translations.find((t) => t.id === color.id);
  return {
    ...color,
    translations: translation?.translations,
  };
};

// Initialize data immediately
const initializeData = () => {
  try {
    const colors = (colorsData || []) as Color[];
    const translations = (colorsTranslationsData || []) as ColorTranslations[];
    const series = (seriesData || []) as Series[];
    const brands = (brandsData || []) as Brand[];

    const colorsWithTranslations = colors.map((color) =>
      combineColorWithTranslations(color, translations)
    );

    return {
      colors,
      translations,
      series,
      brands,
      colorsWithTranslations,
    };
  } catch (error) {
    console.error('Error initializing color data:', error);
    return {
      colors: [],
      translations: [],
      series: [],
      brands: [],
      colorsWithTranslations: [],
    };
  }
};

const initialData = initializeData();

export const useColorsStore = create<ColorsState>((set, get) => ({
  colors: initialData.colors,
  translations: initialData.translations,
  series: initialData.series,
  brands: initialData.brands,
  colorsWithTranslations: initialData.colorsWithTranslations,
  isLoading: false,

  loadColors: () => {
    const currentState = get();
    // Don't reload if already loaded
    if (currentState.colorsWithTranslations.length > 0) {
      return;
    }

    // Reload from source data
    const data = initializeData();
    set({
      colors: data.colors,
      translations: data.translations,
      series: data.series,
      brands: data.brands,
      colorsWithTranslations: data.colorsWithTranslations,
      isLoading: false,
    });
  },

  getColorById: (id: string) => {
    const { colors, translations } = get();
    const color = colors.find((c) => c.id === id);
    if (!color) return undefined;
    return combineColorWithTranslations(color, translations);
  },

  getColorsBySeriesId: (seriesId: string) => {
    const { colors, translations } = get();
    return colors
      .filter((c) => c.seriesId === seriesId)
      .map((color) => combineColorWithTranslations(color, translations));
  },

  getSeriesById: (id: string) => {
    return get().series.find((s) => s.id === id);
  },

  getBrandById: (id: string) => {
    return get().brands.find((b) => b.id === id);
  },

  getSeriesByBrandId: (brandId: string) => {
    return get().series.filter((s) => s.brandId === brandId);
  },

  getColorsByBrandId: (brandId: string) => {
    const { colors, translations, series } = get();
    const brandSeries = series.filter((s) => s.brandId === brandId);
    const seriesIds = brandSeries.map((s) => s.id);
    return colors
      .filter((c) => seriesIds.includes(c.seriesId))
      .map((color) => combineColorWithTranslations(color, translations));
  },
}));
