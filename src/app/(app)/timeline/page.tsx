"use client";

import {
  eachDayOfInterval,
  addWeeks,
  endOfWeek,
  format,
  startOfWeek,
} from "date-fns";
import { useCallback, useMemo } from "react";
import { RecipeFormModal } from "@/app/(app)/recipes/recipe-form-modal";
import {
  useMarkMealEatenMutation,
  useMoveDayMealsMutation,
  useMoveMealMutation,
  useUnmarkMealEatenMutation,
  usePushMealMutation,
  useRemoveMealMutation,
  useScheduleMealMutation,
} from "@/features/timeline/client/mutations";
import {
  useMealHistoryQuery,
  useScheduledMealsQuery,
  useTimelineRecipesQuery,
} from "@/features/timeline/client/queries";
import { useTimelineUiStore } from "@/features/timeline/client/timeline-ui-store";
import { useShallow } from "zustand/react/shallow";
import type { RecipeForForm } from "@/features/recipes/client/types";
import { TimelineSkeleton } from "@/components/ui/timeline-skeleton";
import { RecipePreviewDialog } from "./recipe-preview-dialog";
import { ScheduleMealModal } from "./schedule-meal-modal";
import type { MealHistory, Recipe, ScheduledMeal, TimelineWeek } from "./types";
import { WeekSection } from "./week-section";

const EMPTY_RECIPES: Recipe[] = [];
const EMPTY_SCHEDULED_MEALS: ScheduledMeal[] = [];
const EMPTY_HISTORY: MealHistory[] = [];

export default function TimelinePage() {
  const recipesQuery = useTimelineRecipesQuery();
  const scheduledMealsQuery = useScheduledMealsQuery();
  const historyQuery = useMealHistoryQuery();
  const scheduleMealMutation = useScheduleMealMutation();
  const markMealEatenMutation = useMarkMealEatenMutation();
  const unmarkMealEatenMutation = useUnmarkMealEatenMutation();
  const pushMealMutation = usePushMealMutation();
  const removeMealMutation = useRemoveMealMutation();
  const moveMealMutation = useMoveMealMutation();
  const moveDayMealsMutation = useMoveDayMealsMutation();
  const isMovePending = moveMealMutation.isPending || moveDayMealsMutation.isPending;
  const removingMealId =
    removeMealMutation.isPending && typeof removeMealMutation.variables === "string"
      ? removeMealMutation.variables
      : null;
  const {
    selectedDay,
    selectedRecipeId,
    scheduleModalOpen,
    createRecipeModalOpen,
    createRecipeModalKey,
    recipePreviewOpen,
    previewRecipe,
    openScheduleForDay,
    setScheduleModalOpen,
    setSelectedRecipeId,
    openCreateRecipeModal,
    setCreateRecipeModalOpen,
    setRecipePreviewOpen,
    openRecipePreview,
    dragState,
    hoverDate,
    hoverInsertionIndex,
    startDayDrag,
    startMealDrag,
    setDragHover,
    clearDragState,
  } = useTimelineUiStore(
    useShallow((state) => ({
      selectedDay: state.selectedDay,
      selectedRecipeId: state.selectedRecipeId,
      scheduleModalOpen: state.scheduleModalOpen,
      createRecipeModalOpen: state.createRecipeModalOpen,
      createRecipeModalKey: state.createRecipeModalKey,
      recipePreviewOpen: state.recipePreviewOpen,
      previewRecipe: state.previewRecipe,
      openScheduleForDay: state.openScheduleForDay,
      setScheduleModalOpen: state.setScheduleModalOpen,
      setSelectedRecipeId: state.setSelectedRecipeId,
      openCreateRecipeModal: state.openCreateRecipeModal,
      setCreateRecipeModalOpen: state.setCreateRecipeModalOpen,
      setRecipePreviewOpen: state.setRecipePreviewOpen,
      openRecipePreview: state.openRecipePreview,
      dragState: state.dragState,
      hoverDate: state.hoverDate,
      hoverInsertionIndex: state.hoverInsertionIndex,
      startDayDrag: state.startDayDrag,
      startMealDrag: state.startMealDrag,
      setDragHover: state.setDragHover,
      clearDragState: state.clearDragState,
    })),
  );

  const recipes = recipesQuery.data ?? EMPTY_RECIPES;
  const scheduledMeals = scheduledMealsQuery.data ?? EMPTY_SCHEDULED_MEALS;
  const history = historyQuery.data ?? EMPTY_HISTORY;
  const hasLoadError =
    recipesQuery.isError || scheduledMealsQuery.isError || historyQuery.isError;
  const isInitialLoading =
    recipesQuery.isLoading ||
    scheduledMealsQuery.isLoading ||
    historyQuery.isLoading;

  const weeks = useMemo<TimelineWeek[]>(() => {
    const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    return ([-1, 0, 1] as const).map((offset) => {
      const weekStart = addWeeks(currentWeekStart, offset);
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      return {
        key: offset,
        label:
          offset === -1
            ? "Previous week"
            : offset === 0
              ? "Current week"
              : "Next week",
        days: eachDayOfInterval({ start: weekStart, end: weekEnd }),
      };
    });
  }, []);

  const recipeFormItems = useMemo<RecipeForForm[]>(
    () =>
      recipes.map((recipe) => ({
        id: recipe.id,
        parentRecipeId: recipe.parentRecipe?.id ?? null,
        name: recipe.name,
        description: null,
        ingredients: [],
      })),
    [recipes],
  );

  const handleSchedule = useCallback(
    async (recipeId: string) => {
      if (!selectedDay || !recipeId) return;
      await scheduleMealMutation.mutateAsync({
        recipeId,
        startDate: selectedDay,
        durationDays: 1,
      });
    },
    [scheduleMealMutation, selectedDay],
  );

  const handleMarkEaten = useCallback(
    async (dayKey: string, meal: ScheduledMeal) => {
      await markMealEatenMutation.mutateAsync({
        date: dayKey,
        plannedScheduledMealId: meal.id,
        plannedRecipeId: meal.recipe.id,
        actualMealName: meal.recipe.name,
      });
    },
    [markMealEatenMutation],
  );

  const handleUnmarkEaten = useCallback(
    async (dayKey: string) => {
      await unmarkMealEatenMutation.mutateAsync(dayKey);
    },
    [unmarkMealEatenMutation],
  );

  const handlePushDay = useCallback(
    async (mealId: string) => {
      await pushMealMutation.mutateAsync({ mealId, days: 1 });
    },
    [pushMealMutation],
  );

  const handleRemoveMeal = useCallback(
    async (mealId: string) => {
      await removeMealMutation.mutateAsync(mealId);
    },
    [removeMealMutation],
  );

  const handleDrop = useCallback(
    async (targetDate: string) => {
      if (!dragState) return;
      const currentDragState = dragState;
      const currentHoverDate = hoverDate;
      const currentHoverInsertionIndex = hoverInsertionIndex;
      clearDragState();

      if (currentDragState.type === "day") {
        if (currentDragState.sourceDate === targetDate) {
          return;
        }
        await moveDayMealsMutation.mutateAsync({
          sourceDate: currentDragState.sourceDate,
          targetDate,
        });
        return;
      }

      const targetOrderIndex =
        currentHoverDate === targetDate && currentHoverInsertionIndex != null
          ? currentHoverInsertionIndex
          : undefined;
      await moveMealMutation.mutateAsync({
        mealId: currentDragState.mealId,
        targetDate,
        targetOrderIndex,
      });
    },
    [
      clearDragState,
      dragState,
      hoverDate,
      hoverInsertionIndex,
      moveDayMealsMutation,
      moveMealMutation,
    ],
  );

  const handleDragEnd = useCallback(() => {
    clearDragState();
  }, [clearDragState]);

  return (
    <div className="space-y-6">
      <ScheduleMealModal
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
        recipes={recipes}
        selectedRecipeId={selectedRecipeId}
        onSelectedRecipeIdChange={setSelectedRecipeId}
        dayLabel={
          selectedDay
            ? format(new Date(selectedDay), "EEE d MMM")
            : "selected day"
        }
        onSchedule={handleSchedule}
        onCreateRecipe={openCreateRecipeModal}
      />
      <RecipeFormModal
        key={createRecipeModalKey}
        open={createRecipeModalOpen}
        onOpenChange={setCreateRecipeModalOpen}
        allRecipes={recipeFormItems}
        editingRecipe={null}
        onCreated={(recipe) => setSelectedRecipeId(recipe.id)}
      />
      <RecipePreviewDialog
        open={recipePreviewOpen}
        onOpenChange={setRecipePreviewOpen}
        recipe={previewRecipe}
      />

      <h2 className="text-lg font-semibold">Three-week timeline</h2>
      {isMovePending ? (
        <p className="text-sm text-zinc-400">Moving meals...</p>
      ) : null}
      {hasLoadError ? (
        <p className="text-sm text-red-300">
          Could not load timeline data. Try refreshing the page.
        </p>
      ) : null}
      {hasLoadError ? null : isInitialLoading ? (
        <TimelineSkeleton />
      ) : (
        <div className="space-y-4">
          {weeks.map((week) => (
            <WeekSection
              key={week.key}
              week={week}
              scheduledMeals={scheduledMeals}
              history={history}
              onOpenScheduleForDay={openScheduleForDay}
              onMarkEaten={handleMarkEaten}
              onUnmarkEaten={handleUnmarkEaten}
              onPushDay={handlePushDay}
              onPreviewRecipe={openRecipePreview}
              onRemoveMeal={handleRemoveMeal}
              isMovePending={isMovePending}
              removingMealId={removingMealId}
              dragState={dragState}
              hoverDate={hoverDate}
              hoverInsertionIndex={hoverInsertionIndex}
              onDayDragStart={startDayDrag}
              onMealDragStart={startMealDrag}
              onDragEnd={handleDragEnd}
              onHoverChange={setDragHover}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
}
