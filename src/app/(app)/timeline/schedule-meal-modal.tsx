"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type RecipeOption = {
  id: string;
  name: string;
};

type ScheduleMealModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipes: RecipeOption[];
  selectedRecipeId: string;
  onSelectedRecipeIdChange: (recipeId: string) => void;
  dayLabel: string;
  onSchedule: (recipeId: string) => Promise<void>;
  onCreateRecipe: () => void;
};

export function ScheduleMealModal({
  open,
  onOpenChange,
  recipes,
  selectedRecipeId,
  onSelectedRecipeIdChange,
  dayLabel,
  onSchedule,
  onCreateRecipe,
}: ScheduleMealModalProps) {
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const filteredRecipes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recipes;
    return recipes.filter((recipe) => recipe.name.toLowerCase().includes(q));
  }, [recipes, query]);

  const canSubmit = !saving && selectedRecipeId.length > 0;

  const handleSchedule = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setSubmitError(null);
    try {
      await onSchedule(selectedRecipeId);
      onOpenChange(false);
      setQuery("");
    } catch {
      setSubmitError("Could not schedule meal. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          setQuery("");
          setSubmitError(null);
        }
      }}
      title={`Schedule meal for ${dayLabel}`}
      description="Pick a recipe or create one without leaving the timeline."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button type="button" variant="secondary" onClick={onCreateRecipe} disabled={saving}>
            Create recipe
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSchedule} disabled={!canSubmit}>
              {saving ? "Scheduling..." : "Add to day"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-3 px-2">
        {submitError ? (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {submitError}
          </p>
        ) : null}
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
            aria-hidden
          />
          <Input
            placeholder="Search recipes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="max-h-72 space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-[#161618] p-2">
          {filteredRecipes.map((recipe) => (
            <button
              key={recipe.id}
              type="button"
              onClick={() => onSelectedRecipeIdChange(recipe.id)}
              className={cn(
                "w-full rounded-lg px-3 py-2 text-left text-sm transition",
                selectedRecipeId === recipe.id
                  ? "bg-white/15 text-white"
                  : "text-zinc-300 hover:bg-white/10",
              )}
            >
              {recipe.name}
            </button>
          ))}
          {filteredRecipes.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-zinc-500">No recipes found.</p>
          ) : null}
        </div>
      </div>
    </Dialog>
  );
}
