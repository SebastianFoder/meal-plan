import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MealHistory, ScheduledMeal } from "@/app/(app)/timeline/types";
import {
  moveDayMeals,
  moveMeal,
  pushMeal,
  removeHistoryByDate,
  removeMeal,
  scheduleMeal,
  upsertHistory,
} from "./api";
import { timelineQueryKeys } from "./query-keys";

function upsertScheduleEntry(
  current: ScheduledMeal[] | undefined,
  created: ScheduledMeal,
): ScheduledMeal[] {
  if (!current) {
    return [created];
  }

  return [...current.filter((meal) => meal.id !== created.id), created];
}

function upsertHistoryEntry(
  current: MealHistory[] | undefined,
  entry: MealHistory,
): MealHistory[] {
  if (!current) {
    return [entry];
  }

  return [...current.filter((item) => item.date !== entry.date), entry];
}

export function useScheduleMealMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: scheduleMeal,
    onSuccess: (createdMeal) => {
      queryClient.setQueryData<ScheduledMeal[]>(
        timelineQueryKeys.schedule,
        (current) => upsertScheduleEntry(current, createdMeal),
      );
    },
  });
}

export function useMarkMealEatenMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upsertHistory,
    onSuccess: (entry) => {
      queryClient.setQueryData<MealHistory[]>(
        timelineQueryKeys.history,
        (current) => upsertHistoryEntry(current, entry),
      );
    },
  });
}

export function useUnmarkMealEatenMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeHistoryByDate,
    onSuccess: (_, date) => {
      queryClient.setQueryData<MealHistory[]>(
        timelineQueryKeys.history,
        (current) => current?.filter((entry) => entry.date !== date) ?? [],
      );
    },
  });
}

export function usePushMealMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pushMeal,
    onSuccess: (updatedMeals) => {
      queryClient.setQueryData(timelineQueryKeys.schedule, updatedMeals);
      queryClient.invalidateQueries({ queryKey: timelineQueryKeys.history });
    },
  });
}

export function useRemoveMealMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeMeal,
    onSuccess: (_, mealId) => {
      queryClient.setQueryData<ScheduledMeal[]>(
        timelineQueryKeys.schedule,
        (current) => current?.filter((meal) => meal.id !== mealId) ?? [],
      );
    },
  });
}

export function useMoveMealMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: moveMeal,
    onSuccess: (updatedMeals) => {
      queryClient.setQueryData(timelineQueryKeys.schedule, updatedMeals);
      queryClient.invalidateQueries({ queryKey: timelineQueryKeys.history });
    },
  });
}

export function useMoveDayMealsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: moveDayMeals,
    onSuccess: (updatedMeals) => {
      queryClient.setQueryData(timelineQueryKeys.schedule, updatedMeals);
      queryClient.invalidateQueries({ queryKey: timelineQueryKeys.history });
    },
  });
}
