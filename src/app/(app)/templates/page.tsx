"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type MealTemplate = {
  id: string;
  name: string;
  description: string | null;
  ingredients: string[];
};

export default function TemplatesPage() {
  const [items, setItems] = useState<MealTemplate[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");

  const loadData = async () => {
    const res = await fetch("/api/templates");
    const json = (await res.json()) as MealTemplate[];
    setItems(json);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, []);

  const create = async () => {
    await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description: description || undefined,
        ingredients: ingredients
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
      }),
    });
    setName("");
    setDescription("");
    setIngredients("");
    await loadData();
  };

  return (
    <div className="space-y-6">
      <Card className="space-y-3">
        <h1 className="text-xl font-semibold">Meal Templates</h1>
        <p className="text-sm text-zinc-400">Create reusable meal ideas for scheduling.</p>
        <div className="grid gap-3 md:grid-cols-3">
          <Input placeholder="Meal name" value={name} onChange={(e) => setName(e.target.value)} />
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
        <Button onClick={create}>Create template</Button>
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
                    const updatedName = window.prompt("Template name", item.name) ?? item.name;
                    const updatedDescription =
                      window.prompt("Description", item.description ?? "") ?? item.description ?? "";
                    const updatedIngredients =
                      window.prompt("Ingredients (comma-separated)", item.ingredients.join(", ")) ??
                      item.ingredients.join(", ");

                    await fetch(`/api/templates/${item.id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name: updatedName,
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
                    await fetch(`/api/templates/${item.id}`, { method: "DELETE" });
                    await loadData();
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
            {item.description ? <p className="text-sm text-zinc-300">{item.description}</p> : null}
            <p className="text-xs text-zinc-400">{item.ingredients.join(" • ")}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
