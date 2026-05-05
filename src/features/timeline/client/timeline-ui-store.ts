import { create } from "zustand";
import type { ScheduledMeal } from "@/app/(app)/timeline/types";

type TimelineUiState = {
  selectedDay: string | null;
  selectedRecipeId: string;
  scheduleModalOpen: boolean;
  createRecipeModalOpen: boolean;
  createRecipeModalKey: number;
  resumeScheduleAfterCreate: boolean;
  recipePreviewOpen: boolean;
  previewRecipe: ScheduledMeal["recipe"] | null;
  openScheduleForDay: (dayKey: string) => void;
  setScheduleModalOpen: (open: boolean) => void;
  setSelectedRecipeId: (recipeId: string) => void;
  openCreateRecipeModal: () => void;
  setCreateRecipeModalOpen: (open: boolean) => void;
  setRecipePreviewOpen: (open: boolean) => void;
  openRecipePreview: (recipe: ScheduledMeal["recipe"]) => void;
};

export const useTimelineUiStore = create<TimelineUiState>((set, get) => ({
  selectedDay: null,
  selectedRecipeId: "",
  scheduleModalOpen: false,
  createRecipeModalOpen: false,
  createRecipeModalKey: 0,
  resumeScheduleAfterCreate: false,
  recipePreviewOpen: false,
  previewRecipe: null,
  openScheduleForDay: (dayKey) =>
    set({
      selectedDay: dayKey,
      scheduleModalOpen: true,
    }),
  setScheduleModalOpen: (open) => set({ scheduleModalOpen: open }),
  setSelectedRecipeId: (recipeId) => set({ selectedRecipeId: recipeId }),
  openCreateRecipeModal: () =>
    set((state) => ({
      resumeScheduleAfterCreate: true,
      scheduleModalOpen: false,
      createRecipeModalOpen: true,
      createRecipeModalKey: state.createRecipeModalKey + 1,
    })),
  setCreateRecipeModalOpen: (open) => {
    const state = get();
    if (!open && state.resumeScheduleAfterCreate) {
      set({
        createRecipeModalOpen: false,
        resumeScheduleAfterCreate: false,
        scheduleModalOpen: true,
      });
      return;
    }
    set({ createRecipeModalOpen: open });
  },
  setRecipePreviewOpen: (open) => set({ recipePreviewOpen: open }),
  openRecipePreview: (recipe) =>
    set({
      previewRecipe: recipe,
      recipePreviewOpen: true,
    }),
}));
