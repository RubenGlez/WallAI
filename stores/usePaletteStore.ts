import { ColorWithTranslations } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface Palette {
  id: string;
  name: string;
  colors: ColorWithTranslations[];
  createdAt: Date;
  updatedAt: Date;
}

interface PaletteState {
  palettes: Palette[];
  activePaletteId: string | null;
  // Palette management
  createPalette: (name: string) => string;
  deletePalette: (id: string) => void;
  setActivePalette: (id: string) => void;
  clearActivePalette: () => void;
  updatePaletteName: (id: string, name: string) => void;
  // Color management (operates on active palette)
  addColor: (color: ColorWithTranslations) => void;
  removeColor: (id: string) => void;
  clearPalette: () => void;
  isInPalette: (id: string) => boolean;
  // Getters
  getActivePalette: () => Palette | null;
  getPalette: (id: string) => Palette | undefined;
}

// Helper to convert stored palette (with string dates) back to Palette (with Date objects)
const convertStoredPalette = (stored: any): Palette => {
  if (stored && typeof stored.createdAt === 'string') {
    return {
      ...stored,
      createdAt: new Date(stored.createdAt),
      updatedAt: new Date(stored.updatedAt),
    };
  }
  return stored;
};

export const usePaletteStore = create<PaletteState>()(
  persist(
    (set, get) => ({
      palettes: [],
      activePaletteId: null,

      createPalette: (name: string) => {
        const newPalette: Palette = {
          id: `palette-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name,
          colors: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => {
          const newPalettes = [...state.palettes, newPalette];
          // If this is the first palette, make it active
          const newActiveId =
            state.activePaletteId === null
              ? newPalette.id
              : state.activePaletteId;

          return {
            palettes: newPalettes,
            activePaletteId: newActiveId,
          };
        });

        return newPalette.id;
      },

      deletePalette: (id: string) => {
        set((state) => {
          const newPalettes = state.palettes.filter((p) => p.id !== id);
          let newActiveId = state.activePaletteId;

          // If we deleted the active palette, set a new active one
          if (id === state.activePaletteId) {
            newActiveId =
              newPalettes.length > 0 ? newPalettes[0].id : null;
          }

          return {
            palettes: newPalettes,
            activePaletteId: newActiveId,
          };
        });
      },

      setActivePalette: (id: string) => {
        set({ activePaletteId: id });
      },

      clearActivePalette: () => {
        set({ activePaletteId: null });
      },

      updatePaletteName: (id: string, name: string) => {
        set((state) => ({
          palettes: state.palettes.map((p) =>
            p.id === id
              ? { ...p, name, updatedAt: new Date() }
              : p,
          ),
        }));
      },

      addColor: (color: ColorWithTranslations) => {
        const state = get();
        const activePalette = state.getActivePalette();

        if (!activePalette) {
          // Create a default palette if none exists
          const defaultId = state.createPalette("My Palette");
          set((s) => {
            const palette = s.palettes.find((p) => p.id === defaultId);
            if (palette && !palette.colors.some((c) => c.id === color.id)) {
              return {
                palettes: s.palettes.map((p) =>
                  p.id === defaultId
                    ? {
                        ...p,
                        colors: [...p.colors, color],
                        updatedAt: new Date(),
                      }
                    : p,
                ),
              };
            }
            return s;
          });
          return;
        }

        set((s) => {
          const palette = s.palettes.find((p) => p.id === s.activePaletteId);
          if (!palette) return s;

          // Prevent duplicates
          if (palette.colors.some((c) => c.id === color.id)) {
            return s;
          }

          return {
            palettes: s.palettes.map((p) =>
              p.id === s.activePaletteId
                ? {
                    ...p,
                    colors: [...p.colors, color],
                    updatedAt: new Date(),
                  }
                : p,
            ),
          };
        });
      },

      removeColor: (id: string) => {
        set((state) => {
          if (!state.activePaletteId) return state;

          return {
            palettes: state.palettes.map((p) =>
              p.id === state.activePaletteId
                ? {
                    ...p,
                    colors: p.colors.filter((color) => color.id !== id),
                    updatedAt: new Date(),
                  }
                : p,
            ),
          };
        });
      },

      clearPalette: () => {
        set((state) => {
          if (!state.activePaletteId) return state;

          return {
            palettes: state.palettes.map((p) =>
              p.id === state.activePaletteId
                ? {
                    ...p,
                    colors: [],
                    updatedAt: new Date(),
                  }
                : p,
            ),
          };
        });
      },

      isInPalette: (id: string) => {
        const activePalette = get().getActivePalette();
        if (!activePalette) return false;
        return activePalette.colors.some((color) => color.id === id);
      },

      getActivePalette: () => {
        const state = get();
        if (!state.activePaletteId) return null;
        return state.palettes.find((p) => p.id === state.activePaletteId) || null;
      },

      getPalette: (id: string) => {
        return get().palettes.find((p) => p.id === id);
      },
    }),
    {
      name: "palette-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // Convert date strings back to Date objects after rehydration
        if (state?.palettes) {
          state.palettes = state.palettes.map(convertStoredPalette);
        }
      },
    },
  ),
);
