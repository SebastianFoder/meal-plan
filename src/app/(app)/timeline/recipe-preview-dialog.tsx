"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { ScheduledMeal } from "./types";

type RecipePreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe: ScheduledMeal["recipe"] | null;
};

export function RecipePreviewDialog({
  open,
  onOpenChange,
  recipe,
}: RecipePreviewDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={recipe?.name ?? "Recipe"}
      className="h-auto max-h-[80vh] w-[min(95vw,72rem)]"
      contentClassName="max-h-[80vh] p-5"
      footer={
        <div className="flex justify-end">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      }
    >
      <div className="grid items-stretch grid-cols-[minmax(0,2.2fr)_minmax(16rem,1fr)] gap-0">
        <section className="flex h-full flex-col gap-3 border-r border-white/10 pr-4">
          <h3 className="text-sm font-medium text-zinc-300">Description / instructions</h3>
          <div className="h-full rounded-xl border border-white/10 bg-[#161618] p-3 text-sm text-zinc-200">
            {recipe?.description?.trim().length ? (
              <p className="whitespace-pre-wrap">{recipe.description}</p>
            ) : (
              <span className="text-zinc-500">No description or instructions added yet.</span>
            )}
          </div>
        </section>
        <section className="flex h-full flex-col gap-3 pl-4">
          <h3 className="text-sm font-medium text-zinc-300">Ingredients</h3>
          <div className="h-full rounded-xl border border-white/10 bg-[#161618] p-3">
            {recipe?.ingredients?.length ? (
              <ul className="space-y-1.5 text-sm text-zinc-200">
                {recipe.ingredients.map((ingredient) => (
                  <li key={ingredient} className="list-inside list-disc truncate">
                    {ingredient}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-500">No ingredients yet.</p>
            )}
          </div>
        </section>
      </div>
    </Dialog>
  );
}
