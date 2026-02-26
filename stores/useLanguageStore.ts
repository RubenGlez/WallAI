import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { LanguageCode } from '@/types';

export const SUPPORTED_LANGUAGES: LanguageCode[] = ['es', 'en', 'de', 'fr', 'pt'];

type LanguageState = {
  /** User-selected language; null = use device default */
  language: LanguageCode | null;
  setLanguage: (code: LanguageCode | null) => void;
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: null,
      setLanguage: (code) => set({ language: code }),
    }),
    {
      name: 'wallai-language',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
