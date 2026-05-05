import { requestJson } from "@/lib/client-api";
import type { Recipe, UpsertRecipeInput } from "./types";

export async function listRecipes() {
  return requestJson<Recipe[]>("/api/recipes");
}

export async function createRecipe(input: UpsertRecipeInput) {
  return requestJson<Recipe>("/api/recipes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function updateRecipe(recipeId: string, input: UpsertRecipeInput) {
  return requestJson<Recipe>(`/api/recipes/${recipeId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function deleteRecipe(recipeId: string) {
  return requestJson<{ ok: true }>(`/api/recipes/${recipeId}`, {
    method: "DELETE",
  });
}
