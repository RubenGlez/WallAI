import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ColorSchemeOverride = 'light' | 'dark' | null;

type ThemeState = {
  colorSchemeOverride: ColorSchemeOverride;
  setColorSchemeOverride: (value: ColorSchemeOverride) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      colorSchemeOverride: null,
      setColorSchemeOverride: (value) => set({ colorSchemeOverride: value }),
    }),
    {
      name: 'wallai-theme',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
