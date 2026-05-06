import { create } from "zustand";
import type { ScheduledMeal } from "@/app/(app)/timeline/types";

type TimelineDragState =
  | {
      type: "day";
      sourceDate: string;
    }
  | {
      type: "meal";
      mealId: string;
      sourceDate: string;
    }
  | null;

type TimelineUiState = {
  selectedDay: string | null;
  selectedRecipeId: string;
  scheduleModalOpen: boolean;
  createRecipeModalOpen: boolean;
  createRecipeModalKey: number;
  resumeScheduleAfterCreate: boolean;
  recipePreviewOpen: boolean;
  previewRecipe: ScheduledMeal["recipe"] | null;
  dragState: TimelineDragState;
  hoverDate: string | null;
  hoverInsertionIndex: number | null;
  openScheduleForDay: (dayKey: string) => void;
  setScheduleModalOpen: (open: boolean) => void;
  setSelectedRecipeId: (recipeId: string) => void;
  openCreateRecipeModal: () => void;
  setCreateRecipeModalOpen: (open: boolean) => void;
  setRecipePreviewOpen: (open: boolean) => void;
  openRecipePreview: (recipe: ScheduledMeal["recipe"]) => void;
  startDayDrag: (sourceDate: string) => void;
  startMealDrag: (mealId: string, sourceDate: string) => void;
  setDragHover: (hoverDate: string | null, hoverInsertionIndex?: number | null) => void;
  clearDragState: () => void;
};

type HoverPayload = {
  hoverDate: string | null;
  hoverInsertionIndex: number | null;
};

let hoverFrameId: number | null = null;
let pendingHover: HoverPayload | null = null;

function clearPendingHoverFrame() {
  if (typeof window !== "undefined" && hoverFrameId != null) {
    window.cancelAnimationFrame(hoverFrameId);
  }
  hoverFrameId = null;
  pendingHover = null;
}

function commitHover(
  set: (partial: Pick<TimelineUiState, "hoverDate" | "hoverInsertionIndex">) => void,
  get: () => TimelineUiState,
  nextHover: HoverPayload,
) {
  const state = get();
  if (
    state.hoverDate === nextHover.hoverDate &&
    state.hoverInsertionIndex === nextHover.hoverInsertionIndex
  ) {
    return;
  }

  set({
    hoverDate: nextHover.hoverDate,
    hoverInsertionIndex: nextHover.hoverInsertionIndex,
  });
}

export const useTimelineUiStore = create<TimelineUiState>((set, get) => ({
  selectedDay: null,
  selectedRecipeId: "",
  scheduleModalOpen: false,
  createRecipeModalOpen: false,
  createRecipeModalKey: 0,
  resumeScheduleAfterCreate: false,
  recipePreviewOpen: false,
  previewRecipe: null,
  dragState: null,
  hoverDate: null,
  hoverInsertionIndex: null,
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
  startDayDrag: (sourceDate) =>
    {
      clearPendingHoverFrame();
      set({
        dragState: {
          type: "day",
          sourceDate,
        },
        hoverDate: null,
        hoverInsertionIndex: null,
      });
    },
  startMealDrag: (mealId, sourceDate) =>
    {
      clearPendingHoverFrame();
      set({
        dragState: {
          type: "meal",
          mealId,
          sourceDate,
        },
        hoverDate: null,
        hoverInsertionIndex: null,
      });
    },
  setDragHover: (hoverDate, hoverInsertionIndex = null) => {
    const nextHover: HoverPayload = { hoverDate, hoverInsertionIndex };
    pendingHover = nextHover;

    if (
      typeof window === "undefined" ||
      typeof window.requestAnimationFrame !== "function"
    ) {
      if (pendingHover) {
        commitHover(set, get, pendingHover);
      }
      pendingHover = null;
      return;
    }

    if (hoverFrameId != null) return;
    hoverFrameId = window.requestAnimationFrame(() => {
      hoverFrameId = null;
      if (!pendingHover) return;
      const latestHover = pendingHover;
      pendingHover = null;
      commitHover(set, get, latestHover);
    });
  },
  clearDragState: () =>
    {
      clearPendingHoverFrame();
      set({
        dragState: null,
        hoverDate: null,
        hoverInsertionIndex: null,
      });
    },
}));
