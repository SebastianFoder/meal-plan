import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRecipe, deleteRecipe, updateRecipe } from "./api";
import { recipesQueryKeys } from "./query-keys";
import type { Recipe, UpsertRecipeInput } from "./types";

type UpdateRecipeVariables = {
  recipeId: string;
  input: UpsertRecipeInput;
};

export function useCreateRecipeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRecipe,
    onSuccess: (created) => {
      queryClient.setQueryData<Recipe[]>(recipesQueryKeys.all, (current) =>
        current ? [created, ...current] : [created],
      );
    },
  });
}

export function useUpdateRecipeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recipeId, input }: UpdateRecipeVariables) => updateRecipe(recipeId, input),
    onSuccess: (updated) => {
      queryClient.setQueryData<Recipe[]>(recipesQueryKeys.all, (current) =>
        current
          ? current.map((recipe) => (recipe.id === updated.id ? { ...recipe, ...updated } : recipe))
          : [updated],
      );
    },
  });
}

export function useDeleteRecipeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRecipe,
    onSuccess: (_, recipeId) => {
      queryClient.setQueryData<Recipe[]>(recipesQueryKeys.all, (current) =>
        current ? current.filter((recipe) => recipe.id !== recipeId) : [],
      );
    },
  });
}
