import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Color, Palette } from '@/types';

type PalettesState = {
  palettes: Palette[];
  addPalette: (palette: Omit<Palette, 'id' | 'createdAt'>) => string;
  removePalette: (id: string) => void;
  updatePalette: (id: string, updates: Partial<Pick<Palette, 'name' | 'colors'>>) => void;
  getPalette: (id: string) => Palette | undefined;
};

function generateId(): string {
  return `palette-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const usePalettesStore = create<PalettesState>()(
  persist(
    (set, get) => ({
      palettes: [],
      addPalette: (palette) => {
        const id = generateId();
        const createdAt = new Date().toISOString();
        const newPalette: Palette = { ...palette, id, createdAt };
        set((state) => ({
          palettes: [newPalette, ...state.palettes],
        }));
        return id;
      },
      removePalette: (id) =>
        set((state) => ({
          palettes: state.palettes.filter((p) => p.id !== id),
        })),
      updatePalette: (id, updates) =>
        set((state) => ({
          palettes: state.palettes.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      getPalette: (id) => get().palettes.find((p) => p.id === id),
    }),
    {
      name: 'wallai-palettes',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
