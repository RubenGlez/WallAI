import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { generateId } from '@/lib/id';
import type { Doodle } from '@/types';

type DoodlesState = {
  doodles: Doodle[];
  addDoodle: (doodle: Omit<Doodle, 'id' | 'createdAt' | 'updatedAt'>) => string;
  removeDoodle: (id: string) => void;
  updateDoodle: (
    id: string,
    updates: Partial<Pick<Doodle, 'name' | 'wallImageUri' | 'sketchImageUri' | 'thumbnailUri' | 'transformData' | 'exportImageUri'>>
  ) => void;
  getDoodle: (id: string) => Doodle | undefined;
};

export const useDoodlesStore = create<DoodlesState>()(
  persist(
    (set, get) => ({
      doodles: [],
      addDoodle: (doodle) => {
        const id = generateId('doodle');
        const now = new Date().toISOString();
        const newDoodle: Doodle = {
          ...doodle,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          doodles: [newDoodle, ...state.doodles],
        }));
        return id;
      },
      removeDoodle: (id) =>
        set((state) => ({
          doodles: state.doodles.filter((d) => d.id !== id),
        })),
      updateDoodle: (id, updates) =>
        set((state) => ({
          doodles: state.doodles.map((d) =>
            d.id === id
              ? { ...d, ...updates, updatedAt: new Date().toISOString() }
              : d
          ),
        })),
      getDoodle: (id) => get().doodles.find((d) => d.id === id),
    }),
    {
      name: 'wallai-doodles',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
