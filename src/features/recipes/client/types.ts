export type RecipeForForm = {
  id: string;
  parentRecipeId: string | null;
  name: string;
  description: string | null;
  ingredients: string[];
};

export type Recipe = RecipeForForm & {
  parentRecipe?: { id: string; name: string } | null;
  variations?: { id: string; name: string }[];
};

export type UpsertRecipeInput = {
  name: string;
  parentRecipeId: string | null;
  description?: string;
  ingredients: string[];
};
