import { requestJson } from "@/lib/client-api";
import type {
  MealHistory,
  Recipe,
  ScheduledMeal,
} from "@/app/(app)/timeline/types";

type ScheduleMealInput = {
  recipeId: string;
  startDate: string;
  durationDays: number;
};

type PushMealInput = {
  mealId: string;
  days: number;
};

type MoveMealInput = {
  mealId: string;
  targetDate: string;
  targetOrderIndex?: number;
};

type MoveDayMealsInput = {
  sourceDate: string;
  targetDate: string;
};

type UpsertHistoryInput = {
  date: string;
  plannedScheduledMealId: string;
  plannedRecipeId: string;
  actualMealName: string;
};

export async function listTimelineRecipes() {
  return requestJson<Recipe[]>("/api/recipes");
}

export async function listScheduledMeals() {
  return requestJson<ScheduledMeal[]>("/api/schedule");
}

export async function listMealHistory() {
  return requestJson<MealHistory[]>("/api/history");
}

export async function scheduleMeal(input: ScheduleMealInput) {
  return requestJson<ScheduledMeal>("/api/schedule", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function upsertHistory(input: UpsertHistoryInput) {
  return requestJson<MealHistory>("/api/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function pushMeal(input: PushMealInput) {
  return requestJson<ScheduledMeal[]>("/api/schedule/push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function moveMeal(input: MoveMealInput) {
  return requestJson<ScheduledMeal[]>("/api/schedule/move", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function moveDayMeals(input: MoveDayMealsInput) {
  return requestJson<ScheduledMeal[]>("/api/schedule/move-day", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function removeMeal(mealId: string) {
  return requestJson<{ ok: true }>(`/api/schedule/${mealId}`, {
    method: "DELETE",
  });
}

export async function removeHistoryByDate(date: string) {
  return requestJson<{ ok: true }>(
    `/api/history?date=${encodeURIComponent(date)}`,
    {
      method: "DELETE",
    },
  );
}
