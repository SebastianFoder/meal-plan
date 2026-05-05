import { create } from "zustand";
import type { RecipeForForm } from "./types";

type RecipesUiState = {
  modalOpen: boolean;
  modalKey: number;
  editingRecipe: RecipeForForm | null;
  openCreate: () => void;
  openEdit: (recipe: RecipeForForm) => void;
  setModalOpen: (open: boolean) => void;
};

export const useRecipesUiStore = create<RecipesUiState>((set) => ({
  modalOpen: false,
  modalKey: 0,
  editingRecipe: null,
  openCreate: () =>
    set((state) => ({
      modalOpen: true,
      modalKey: state.modalKey + 1,
      editingRecipe: null,
    })),
  openEdit: (recipe) =>
    set((state) => ({
      modalOpen: true,
      modalKey: state.modalKey + 1,
      editingRecipe: recipe,
    })),
  setModalOpen: (open) =>
    set((state) => ({
      modalOpen: open,
      editingRecipe: open ? state.editingRecipe : null,
    })),
}));
