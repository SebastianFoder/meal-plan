"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RecipeFormModal, type RecipeForForm } from "./recipe-form-modal";

type Recipe = RecipeForForm & {
  parentRecipe?: { id: string; name: string } | null;
  variations?: { id: string; name: string }[];
};

export default function RecipesPage() {
  const [items, setItems] = useState<Recipe[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [editingRecipe, setEditingRecipe] = useState<RecipeForForm | null>(null);

  const loadData = async () => {
    const res = await fetch("/api/recipes");
    if (!res.ok) return;
    const json = (await res.json()) as Recipe[];
    setItems(json);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, []);

  const openCreate = () => {
    setEditingRecipe(null);
    setModalKey((k) => k + 1);
    setModalOpen(true);
  };

  const openEdit = (recipe: Recipe) => {
    setEditingRecipe({
      id: recipe.id,
      parentRecipeId: recipe.parentRecipeId,
      name: recipe.name,
      description: recipe.description,
      ingredients: recipe.ingredients,
    });
    setModalKey((k) => k + 1);
    setModalOpen(true);
  };

  const handleModalOpenChange = (open: boolean) => {
    setModalOpen(open);
    if (!open) setEditingRecipe(null);
  };

  return (
    <div className="space-y-6">
      <RecipeFormModal
        key={modalKey}
        open={modalOpen}
        onOpenChange={handleModalOpenChange}
        allRecipes={items}
        editingRecipe={editingRecipe}
        onSaved={loadData}
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

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Card key={item.id} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">{item.name}</h2>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" type="button" onClick={() => openEdit(item)}>
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={async () => {
                    const res = await fetch(`/api/recipes/${item.id}`, { method: "DELETE" });
                    if (res.ok) await loadData();
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
