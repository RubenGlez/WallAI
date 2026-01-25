import { ColorWithTranslations } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CartState {
  colors: ColorWithTranslations[];
  addColor: (color: ColorWithTranslations) => void;
  removeColor: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      colors: [],
      addColor: (color) =>
        set((state) => {
          // Prevent duplicates
          if (state.colors.some((c) => c.id === color.id)) {
            return state;
          }
          return {
            colors: [...state.colors, color],
          };
        }),
      removeColor: (id) =>
        set((state) => ({
          colors: state.colors.filter((color) => color.id !== id),
        })),
      clearCart: () => set({ colors: [] }),
      isInCart: (id: string) => {
        return get().colors.some((color) => color.id === id);
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
