import { create } from 'zustand';
import { ColorWithTranslations } from '@/types';

interface CartState {
  colors: ColorWithTranslations[];
  addColor: (color: ColorWithTranslations) => void;
  removeColor: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  colors: [],
  addColor: (color) =>
    set((state) => ({
      colors: [...state.colors, color],
    })),
  removeColor: (id) =>
    set((state) => ({
      colors: state.colors.filter((color) => color.id !== id),
    })),
  clearCart: () => set({ colors: [] }),
}));
