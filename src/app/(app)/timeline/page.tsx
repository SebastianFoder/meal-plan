"use client";

import {
  eachDayOfInterval,
  addWeeks,
  endOfWeek,
  format,
  startOfWeek,
} from "date-fns";
import { useEffect, useMemo, useState } from "react";
import {
  RecipeFormModal,
  type RecipeForForm,
} from "@/app/(app)/recipes/recipe-form-modal";
import { RecipePreviewDialog } from "./recipe-preview-dialog";
import { ScheduleMealModal } from "./schedule-meal-modal";
import type { MealHistory, Recipe, ScheduledMeal, TimelineWeek } from "./types";
import { WeekSection } from "./week-section";

export default function TimelinePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [scheduledMeals, setScheduledMeals] = useState<ScheduledMeal[]>([]);
  const [history, setHistory] = useState<MealHistory[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState("");
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [createRecipeModalOpen, setCreateRecipeModalOpen] = useState(false);
  const [createRecipeModalKey, setCreateRecipeModalKey] = useState(0);
  const [resumeScheduleAfterCreate, setResumeScheduleAfterCreate] =
    useState(false);
  const [recipePreviewOpen, setRecipePreviewOpen] = useState(false);
  const [previewRecipe, setPreviewRecipe] = useState<ScheduledMeal["recipe"] | null>(null);

  const load = async () => {
    try {
      const [tRes, sRes, hRes] = await Promise.all([
        fetch("/api/recipes"),
        fetch("/api/schedule"),
        fetch("/api/history"),
      ]);

      if (!tRes.ok || !sRes.ok || !hRes.ok) {
        throw new Error("Failed to load timeline data.");
      }

      setRecipes((await tRes.json()) as Recipe[]);
      setScheduledMeals((await sRes.json()) as ScheduledMeal[]);
      setHistory((await hRes.json()) as MealHistory[]);
      setLoadError(null);
    } catch {
      setLoadError("Could not load timeline data. Try refreshing the page.");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

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

  const openScheduleForDay = (dayKey: string) => {
    setSelectedDay(dayKey);
    setScheduleModalOpen(true);
  };

  const handleSchedule = async (recipeId: string) => {
    if (!selectedDay || !recipeId) return;
    const res = await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipeId,
        startDate: selectedDay,
        durationDays: 1,
      }),
    });
    if (!res.ok) {
      throw new Error("Could not schedule recipe");
    }
    await load();
  };

  const openCreateRecipe = () => {
    setResumeScheduleAfterCreate(true);
    setScheduleModalOpen(false);
    setCreateRecipeModalKey((k) => k + 1);
    setCreateRecipeModalOpen(true);
  };

  const handleMarkEaten = async (dayKey: string, meal: ScheduledMeal) => {
    const actualMealName = window.prompt("What did you actually eat?") ?? "";
    await fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: dayKey,
        plannedScheduledMealId: meal.id,
        plannedRecipeId: meal.recipe.id,
        actualMealName: actualMealName || meal.recipe.name,
      }),
    });
    await load();
  };

  const handlePushDay = async (mealId: string) => {
    await fetch("/api/schedule/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mealId, days: 1 }),
    });
    await load();
  };

  const handleRemoveMeal = async (mealId: string) => {
    await fetch(`/api/schedule/${mealId}`, { method: "DELETE" });
    await load();
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
        onCreateRecipe={openCreateRecipe}
      />
      <RecipeFormModal
        key={createRecipeModalKey}
        open={createRecipeModalOpen}
        onOpenChange={(open) => {
          setCreateRecipeModalOpen(open);
          if (!open && resumeScheduleAfterCreate) {
            setScheduleModalOpen(true);
            setResumeScheduleAfterCreate(false);
          }
        }}
        allRecipes={recipeFormItems}
        editingRecipe={null}
        onCreated={(recipe) => setSelectedRecipeId(recipe.id)}
        onSaved={load}
      />
      <RecipePreviewDialog
        open={recipePreviewOpen}
        onOpenChange={setRecipePreviewOpen}
        recipe={previewRecipe}
      />

      <h2 className="text-lg font-semibold">Three-week timeline</h2>
      {loadError ? <p className="text-sm text-red-300">{loadError}</p> : null}
      <div className="space-y-4">
        {weeks.map((week) => (
          <WeekSection
            key={week.key}
            week={week}
            scheduledMeals={scheduledMeals}
            history={history}
            onOpenScheduleForDay={openScheduleForDay}
            onMarkEaten={handleMarkEaten}
            onPushDay={handlePushDay}
            onPreviewRecipe={(recipe) => {
              setPreviewRecipe(recipe);
              setRecipePreviewOpen(true);
            }}
            onRemoveMeal={handleRemoveMeal}
          />
        ))}
      </div>
    </div>
  );
}
