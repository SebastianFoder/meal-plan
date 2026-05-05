"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDeleteRecipeMutation } from "@/features/recipes/client/mutations";
import { useRecipesQuery } from "@/features/recipes/client/queries";
import { useRecipesUiStore } from "@/features/recipes/client/recipes-ui-store";
import type { Recipe } from "@/features/recipes/client/types";
import { RecipeFormModal } from "./recipe-form-modal";

export default function RecipesPage() {
  const items = useRecipesQuery();
  const deleteRecipeMutation = useDeleteRecipeMutation();
  const {
    modalOpen,
    modalKey,
    editingRecipe,
    openCreate,
    openEdit,
    setModalOpen,
  } = useRecipesUiStore();

  const recipeItems = items.data ?? [];

  const handleOpenEdit = (recipe: Recipe) => {
    openEdit({
      id: recipe.id,
      parentRecipeId: recipe.parentRecipeId,
      name: recipe.name,
      description: recipe.description,
      ingredients: recipe.ingredients,
    });
  };

  return (
    <div className="space-y-6">
      <RecipeFormModal
        key={modalKey}
        open={modalOpen}
        onOpenChange={setModalOpen}
        allRecipes={recipeItems}
        editingRecipe={editingRecipe}
      />

      <Card className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Recipes</h1>
            <p className="text-sm text-zinc-400">
              Create reusable recipes for your schedule.
            </p>
          </div>
          <Button type="button" onClick={openCreate}>
            Add recipe
          </Button>
        </div>
      </Card>

      {items.isError ? (
        <Card>
          <p className="text-sm text-red-300">Could not load recipes. Try refreshing.</p>
        </Card>
      ) : null}

      {items.isLoading ? (
        <Card>
          <p className="text-sm text-zinc-400">Loading recipes...</p>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {recipeItems.map((item) => (
          <Card key={item.id} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">{item.name}</h2>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" type="button" onClick={() => handleOpenEdit(item)}>
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  disabled={deleteRecipeMutation.isPending}
                  onClick={async () => {
                    await deleteRecipeMutation.mutateAsync(item.id);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
            {item.description ? (
              <p className="text-sm text-zinc-300">{item.description}</p>
            ) : null}
            {item.parentRecipe ? (
              <p className="text-xs text-zinc-400">
                Variation of: {item.parentRecipe.name}
              </p>
            ) : null}
            {item.variations && item.variations.length > 0 ? (
              <p className="text-xs text-zinc-400">
                Variations:{" "}
                {item.variations.map((variation) => variation.name).join(" • ")}
              </p>
            ) : null}
            <p className="text-xs text-zinc-400">{item.ingredients.join(" • ")}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
