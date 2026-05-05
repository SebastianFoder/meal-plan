"use client";

import {
  addDays,
  eachDayOfInterval,
  addWeeks,
  endOfWeek,
  format,
  isToday,
  startOfWeek,
} from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsRight, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import {
  RecipeFormModal,
  type RecipeForForm,
} from "@/app/(app)/recipes/recipe-form-modal";
import { ScheduleMealModal } from "./schedule-meal-modal";

type Recipe = {
  id: string;
  name: string;
  parentRecipe?: { id: string; name: string } | null;
};

type ScheduledMeal = {
  id: string;
  startDate: string;
  durationDays: number;
  recipe: {
    id: string;
    name: string;
    description?: string | null;
    ingredients?: string[];
    parentRecipe?: { id: string; name: string } | null;
  };
};

type MealHistory = {
  id: string;
  date: string;
  actualMealName: string | null;
  actualRecipe: { name: string } | null;
};

function toDateKey(value: string) {
  return value.length >= 10
    ? value.slice(0, 10)
    : format(new Date(value), "yyyy-MM-dd");
}

function isMealActiveOnDay(meal: ScheduledMeal, dayKey: string) {
  const startKey = toDateKey(meal.startDate);
  const endKey = format(
    addDays(
      new Date(`${startKey}T00:00:00`),
      Math.max(0, meal.durationDays - 1),
    ),
    "yyyy-MM-dd",
  );
  return dayKey >= startKey && dayKey <= endKey;
}

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

  const weeks = useMemo(() => {
    const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    return [-1, 0, 1].map((offset) => {
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
      <Dialog
        open={recipePreviewOpen}
        onOpenChange={setRecipePreviewOpen}
        title={previewRecipe?.name ?? "Recipe"}
        className="h-auto max-h-[80vh] w-[min(95vw,72rem)]"
        contentClassName="max-h-[80vh] p-5"
        footer={
          <div className="flex justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setRecipePreviewOpen(false)}
            >
              Close
            </Button>
          </div>
        }
      >
        <div className="grid items-stretch grid-cols-[minmax(0,2.2fr)_minmax(16rem,1fr)] gap-0">
          <section className="flex h-full flex-col gap-3 border-r border-white/10 pr-4">
            <h3 className="text-sm font-medium text-zinc-300">
              Description / instructions
            </h3>
            <div className="h-full rounded-xl border border-white/10 bg-[#161618] p-3 text-sm text-zinc-200">
              {previewRecipe?.description?.trim().length ? (
                <p className="whitespace-pre-wrap">{previewRecipe.description}</p>
              ) : (
                <span className="text-zinc-500">No description or instructions added yet.</span>
              )}
            </div>
          </section>
          <section className="flex h-full flex-col gap-3 pl-4">
            <h3 className="text-sm font-medium text-zinc-300">Ingredients</h3>
            <div className="h-full rounded-xl border border-white/10 bg-[#161618] p-3">
              {previewRecipe?.ingredients?.length ? (
                <ul className="space-y-1.5 text-sm text-zinc-200">
                  {previewRecipe.ingredients.map((ingredient) => (
                    <li key={ingredient} className="list-inside list-disc truncate">
                      {ingredient}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500">No ingredients yet.</p>
              )}
            </div>
          </section>
        </div>
      </Dialog>

      <h2 className="text-lg font-semibold">Three-week timeline</h2>
      {loadError ? <p className="text-sm text-red-300">{loadError}</p> : null}
      <div className="space-y-4">
        {weeks.map((week) => (
          <div
            key={week.key}
            className={
              week.key === 0
                ? "space-y-3 rounded-2xl border border-white/15 bg-white/[0.06] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]"
                : week.key === -1
                  ? "space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3 opacity-70"
                  : "space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 opacity-85"
            }
          >
            <p className="text-sm font-medium text-zinc-300">{week.label}</p>
            <div className="grid gap-3 md:grid-cols-7">
              {week.days.map((day) => {
                const dayKey = format(day, "yyyy-MM-dd");
                const isCurrentDay = isToday(day);
                const activeMeals = scheduledMeals.filter((meal) =>
                  isMealActiveOnDay(meal, dayKey),
                );
                const eaten = history.find(
                  (entry) =>
                    format(new Date(entry.date), "yyyy-MM-dd") === dayKey,
                );

                return (
                  <div
                    key={dayKey}
                    className={
                      isCurrentDay
                        ? "min-h-24 rounded-xl border border-white/20 bg-white/[0.09] p-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                        : "min-h-24 rounded-xl border border-white/10 bg-[#161618] p-3 text-sm"
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{format(day, "EEE d")}</p>
                    </div>
                    <div className="mt-2 flex w-full items-center gap-1.5">
                      {activeMeals[0] ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 flex-1 px-0"
                          aria-label={`Mark ${activeMeals[0].recipe.name} as eaten`}
                          onClick={async () => {
                            const actualMealName =
                              window.prompt("What did you actually eat?") ?? "";
                            const firstPlanned = activeMeals[0];
                            await fetch("/api/history", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                date: dayKey,
                                plannedScheduledMealId: firstPlanned?.id,
                                plannedRecipeId: firstPlanned?.recipe.id,
                                actualMealName:
                                  actualMealName || firstPlanned?.recipe.name,
                              }),
                            });
                            await load();
                          }}
                        >
                          <Check className="size-4" aria-hidden />
                        </Button>
                      ) : null}
                      {activeMeals[0] ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 flex-1 px-0"
                          aria-label={`Push ${activeMeals[0].recipe.name} by one day`}
                          onClick={async () => {
                            await fetch("/api/schedule/push", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                mealId: activeMeals[0].id,
                                days: 1,
                              }),
                            });
                            await load();
                          }}
                        >
                          <ChevronsRight className="size-4" aria-hidden />
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 flex-1 px-0"
                        onClick={() => openScheduleForDay(dayKey)}
                        aria-label={`Add meal for ${format(day, "EEEE d MMMM")}`}
                      >
                        <Plus className="size-4" aria-hidden />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      {eaten ? (
                        <p className="text-xs text-zinc-300">
                          Ate:{" "}
                          {eaten.actualRecipe?.name ??
                            eaten.actualMealName ??
                            "Logged"}
                        </p>
                      ) : null}
                    </div>
                    <div className="mt-3 space-y-2">
                      {activeMeals.length === 0 ? (
                        <span className="text-zinc-500">No meal</span>
                      ) : (
                        activeMeals.map((meal) => (
                          <div
                            key={meal.id}
                            className="flex w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/10 px-2 py-1"
                          >
                            <button
                              type="button"
                              className="min-w-0 truncate text-left text-zinc-100 transition duration-200 ease-out hover:text-white"
                              onClick={() => {
                                setPreviewRecipe(meal.recipe);
                                setRecipePreviewOpen(true);
                              }}
                            >
                              {meal.recipe.name}
                              {meal.recipe.parentRecipe
                                ? ` (${meal.recipe.parentRecipe.name} variation)`
                                : ""}
                            </button>
                            <button
                              type="button"
                              aria-label={`Remove ${meal.recipe.name} from timeline`}
                              className="rounded p-0.5 text-zinc-400 transition duration-200 ease-out hover:bg-white/10 hover:text-white"
                              onClick={async () => {
                                await fetch(`/api/schedule/${meal.id}`, {
                                  method: "DELETE",
                                });
                                await load();
                              }}
                            >
                              <X className="size-3" aria-hidden />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
