import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  pushMeal,
  removeHistoryByDate,
  removeMeal,
  scheduleMeal,
  upsertHistory,
} from "./api";
import { timelineQueryKeys } from "./query-keys";

export function useScheduleMealMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: scheduleMeal,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: timelineQueryKeys.schedule,
      });
    },
  });
}

export function useMarkMealEatenMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upsertHistory,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: timelineQueryKeys.history }),
        queryClient.invalidateQueries({ queryKey: timelineQueryKeys.schedule }),
      ]);
    },
  });
}

export function useUnmarkMealEatenMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeHistoryByDate,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: timelineQueryKeys.history }),
        queryClient.invalidateQueries({ queryKey: timelineQueryKeys.schedule }),
      ]);
    },
  });
}

export function usePushMealMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pushMeal,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: timelineQueryKeys.schedule }),
        queryClient.invalidateQueries({ queryKey: timelineQueryKeys.history }),
      ]);
    },
  });
}

export function useRemoveMealMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeMeal,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: timelineQueryKeys.schedule,
      });
    },
  });
}
