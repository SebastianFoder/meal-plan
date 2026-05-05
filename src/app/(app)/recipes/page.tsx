"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Recipe = {
  id: string;
  parentRecipeId: string | null;
  parentRecipe?: { id: string; name: string } | null;
  variations?: { id: string; name: string }[];
  name: string;
  description: string | null;
  ingredients: string[];
};

export default function RecipesPage() {
  const [items, setItems] = useState<Recipe[]>([]);
  const [name, setName] = useState("");
  const [parentRecipeId, setParentRecipeId] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");

  const loadData = async () => {
    const res = await fetch("/api/recipes");
    const json = (await res.json()) as Recipe[];
    setItems(json);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, []);

  const create = async () => {
    await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        parentRecipeId: parentRecipeId || undefined,
        description: description || undefined,
        ingredients: ingredients
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
      }),
    });
    setName("");
    setParentRecipeId("");
    setDescription("");
    setIngredients("");
    await loadData();
  };

  return (
    <div className="space-y-6">
      <Card className="space-y-3">
        <h1 className="text-xl font-semibold">Recipies</h1>
        <p className="text-sm text-zinc-400">
          Create reusable recipies for your schedule.
        </p>
        <div className="grid gap-3 md:grid-cols-4">
          <Input
            placeholder="Meal name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select
            className="h-10 rounded-xl border border-white/10 bg-[#111113] px-3 text-sm text-white"
            value={parentRecipeId}
            onChange={(e) => setParentRecipeId(e.target.value)}
          >
            <option value="">Main recipie (no variation)</option>
            {items
              .filter((recipe) => !recipe.parentRecipeId)
              .map((recipe) => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.name}
                </option>
              ))}
          </select>
          <Input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            placeholder="Ingredients, comma-separated"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
          />
        </div>
        <Button onClick={create}>Create recipie</Button>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Card key={item.id} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">{item.name}</h2>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={async () => {
                    const updatedName =
                      window.prompt("Recipie name", item.name) ?? item.name;
                    const updatedDescription =
                      window.prompt("Description", item.description ?? "") ??
                      item.description ??
                      "";
                    const updatedIngredients =
                      window.prompt(
                        "Ingredients (comma-separated)",
                        item.ingredients.join(", "),
                      ) ?? item.ingredients.join(", ");

                    await fetch(`/api/recipes/${item.id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name: updatedName,
                        parentRecipeId: item.parentRecipeId ?? undefined,
                        description: updatedDescription || undefined,
                        ingredients: updatedIngredients
                          .split(",")
                          .map((v) => v.trim())
                          .filter(Boolean),
                      }),
                    });
                    await loadData();
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={async () => {
                    await fetch(`/api/recipes/${item.id}`, {
                      method: "DELETE",
                    });
                    await loadData();
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
            <p className="text-xs text-zinc-400">
              {item.ingredients.join(" • ")}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
