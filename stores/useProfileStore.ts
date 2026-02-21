import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type ProfileState = {
  aka: string;
  setAka: (aka: string) => void;
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      aka: '',
      setAka: (aka) => set({ aka: aka ?? '' }),
    }),
    {
      name: 'wallai-profile',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
