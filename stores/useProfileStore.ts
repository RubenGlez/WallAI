import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type ProfileState = {
  aka: string;
  setAka: (aka: string) => void;
  hasRequestedReview: boolean;
  setHasRequestedReview: (v: boolean) => void;
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      aka: '',
      setAka: (aka) => set({ aka: aka ?? '' }),
      hasRequestedReview: false,
      setHasRequestedReview: (v) => set({ hasRequestedReview: v }),
    }),
    {
      name: 'spraydeck-profile',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
