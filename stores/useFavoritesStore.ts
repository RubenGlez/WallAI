import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type FavoritesState = {
  favoriteColorIds: string[];
  toggleFavorite: (colorId: string) => void;
  isFavorite: (colorId: string) => boolean;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteColorIds: [],
      toggleFavorite: (colorId: string) =>
        set((state) => ({
          favoriteColorIds: state.favoriteColorIds.includes(colorId)
            ? state.favoriteColorIds.filter((id) => id !== colorId)
            : [...state.favoriteColorIds, colorId],
        })),
      isFavorite: (colorId: string) =>
        get().favoriteColorIds.includes(colorId),
    }),
    {
      name: 'wallai-favorites',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
