import { useQuery } from "@tanstack/react-query";
import { listMealHistory, listScheduledMeals, listTimelineRecipes } from "./api";
import { timelineQueryKeys } from "./query-keys";

export function useTimelineRecipesQuery() {
  return useQuery({
    queryKey: timelineQueryKeys.recipes,
    queryFn: listTimelineRecipes,
    staleTime: 5 * 60_000,
  });
}

export function useScheduledMealsQuery() {
  return useQuery({
    queryKey: timelineQueryKeys.schedule,
    queryFn: listScheduledMeals,
    staleTime: 60_000,
  });
}

export function useMealHistoryQuery() {
  return useQuery({
    queryKey: timelineQueryKeys.history,
    queryFn: listMealHistory,
    staleTime: 60_000,
  });
}
