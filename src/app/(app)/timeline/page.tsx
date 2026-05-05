"use client";

import {
  eachDayOfInterval,
  addWeeks,
  endOfWeek,
  format,
  startOfWeek,
} from "date-fns";
import { useMemo } from "react";
import { RecipeFormModal } from "@/app/(app)/recipes/recipe-form-modal";
import {
  useMarkMealEatenMutation,
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
import type { RecipeForForm } from "@/features/recipes/client/types";
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
  } = useTimelineUiStore();

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

  const handleSchedule = async (recipeId: string) => {
    if (!selectedDay || !recipeId) return;
    await scheduleMealMutation.mutateAsync({
      recipeId,
      startDate: selectedDay,
      durationDays: 1,
    });
  };

  const handleMarkEaten = async (dayKey: string, meal: ScheduledMeal) => {
    await markMealEatenMutation.mutateAsync({
      date: dayKey,
      plannedScheduledMealId: meal.id,
      plannedRecipeId: meal.recipe.id,
      actualMealName: meal.recipe.name,
    });
  };

  const handleUnmarkEaten = async (dayKey: string) => {
    await unmarkMealEatenMutation.mutateAsync(dayKey);
  };

  const handlePushDay = async (mealId: string) => {
    await pushMealMutation.mutateAsync({ mealId, days: 1 });
  };

  const handleRemoveMeal = async (mealId: string) => {
    await removeMealMutation.mutateAsync(mealId);
  };

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
      {hasLoadError ? (
        <p className="text-sm text-red-300">
          Could not load timeline data. Try refreshing the page.
        </p>
      ) : null}
      {isInitialLoading ? (
        <p className="text-sm text-zinc-400">Loading timeline...</p>
      ) : null}
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
          />
        ))}
      </div>
    </div>
  );
}
