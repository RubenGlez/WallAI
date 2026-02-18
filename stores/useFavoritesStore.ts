import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type FavoritesState = {
  favoriteColorIds: string[];
  favoriteBrandIds: string[];
  favoriteSeriesIds: string[];
  toggleFavorite: (colorId: string) => void;
  toggleFavoriteColor: (colorId: string) => void;
  toggleFavoriteBrand: (brandId: string) => void;
  toggleFavoriteSeries: (seriesId: string) => void;
  isFavorite: (colorId: string) => boolean;
  isFavoriteColor: (colorId: string) => boolean;
  isFavoriteBrand: (brandId: string) => boolean;
  isFavoriteSeries: (seriesId: string) => boolean;
};

const toggleInList = (list: string[], id: string) =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteColorIds: [],
      favoriteBrandIds: [],
      favoriteSeriesIds: [],
      toggleFavorite: (colorId: string) =>
        set((state) => ({
          favoriteColorIds: toggleInList(state.favoriteColorIds, colorId),
        })),
      toggleFavoriteColor: (colorId: string) =>
        set((state) => ({
          favoriteColorIds: toggleInList(state.favoriteColorIds, colorId),
        })),
      toggleFavoriteBrand: (brandId: string) =>
        set((state) => ({
          favoriteBrandIds: toggleInList(state.favoriteBrandIds, brandId),
        })),
      toggleFavoriteSeries: (seriesId: string) =>
        set((state) => ({
          favoriteSeriesIds: toggleInList(state.favoriteSeriesIds, seriesId),
        })),
      isFavorite: (colorId: string) =>
        get().favoriteColorIds.includes(colorId),
      isFavoriteColor: (colorId: string) =>
        get().favoriteColorIds.includes(colorId),
      isFavoriteBrand: (brandId: string) =>
        get().favoriteBrandIds.includes(brandId),
      isFavoriteSeries: (seriesId: string) =>
        get().favoriteSeriesIds.includes(seriesId),
    }),
    {
      name: 'wallai-favorites',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

