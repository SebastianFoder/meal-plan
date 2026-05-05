"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/client-api";
import {
  useCreateRecipeMutation,
  useUpdateRecipeMutation,
} from "@/features/recipes/client/mutations";
import type {
  RecipeForForm,
  UpsertRecipeInput,
} from "@/features/recipes/client/types";
import { IngredientListField } from "./ingredient-list-field";
import { ParentRecipePicker } from "./parent-recipe-picker";

type RecipeFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allRecipes: RecipeForForm[];
  editingRecipe: RecipeForForm | null;
  onSaved?: () => void | Promise<void>;
  onCreated?: (recipe: RecipeForForm) => void;
};

export function RecipeFormModal({
  open,
  onOpenChange,
  allRecipes,
  editingRecipe,
  onSaved,
  onCreated,
}: RecipeFormModalProps) {
  const createRecipeMutation = useCreateRecipeMutation();
  const updateRecipeMutation = useUpdateRecipeMutation();
  const [name, setName] = useState(() => editingRecipe?.name ?? "");
  const [description, setDescription] = useState(
    () => editingRecipe?.description ?? "",
  );
  const [parentRecipeId, setParentRecipeId] = useState(
    () => editingRecipe?.parentRecipeId ?? "",
  );
  const [ingredientLines, setIngredientLines] = useState<string[]>(() =>
    editingRecipe && editingRecipe.ingredients.length > 0
      ? [...editingRecipe.ingredients]
      : [""],
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const mainRecipes = useMemo(() => {
    return allRecipes
      .filter((r) => !r.parentRecipeId)
      .filter((r) => (editingRecipe ? r.id !== editingRecipe.id : true))
      .map((r) => ({ id: r.id, name: r.name }));
  }, [allRecipes, editingRecipe]);

  const trimmedIngredients = useMemo(
    () => ingredientLines.map((s) => s.trim()).filter(Boolean),
    [ingredientLines],
  );

  const canSubmit =
    name.trim().length > 0 && trimmedIngredients.length > 0 && !saving;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmed = ingredientLines.map((s) => s.trim()).filter(Boolean);
    if (!trimmedName) {
      setSubmitError("Name is required.");
      return;
    }
    if (trimmed.length === 0) {
      setSubmitError("Add at least one ingredient.");
      return;
    }

    setSaving(true);
    setSubmitError(null);
    const body: UpsertRecipeInput = {
      name: trimmedName,
      parentRecipeId: parentRecipeId.length > 0 ? parentRecipeId : null,
      description: description.trim() || undefined,
      ingredients: trimmed,
    };

    try {
      const savedRecipe = editingRecipe
        ? await updateRecipeMutation.mutateAsync({
            recipeId: editingRecipe.id,
            input: body,
          })
        : await createRecipeMutation.mutateAsync(body);
      if (!editingRecipe) {
        onCreated?.(savedRecipe);
      }

      onOpenChange(false);
      await onSaved?.();
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : "Network error. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={editingRecipe ? "Edit recipe" : "New recipe"}
      description={
        editingRecipe
          ? "Update name, variation, description, and ingredients."
          : "Add a recipe you can reuse when planning meals."
      }
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="recipe-form-modal-fields"
            disabled={!canSubmit}
          >
            {saving ? "Saving…" : editingRecipe ? "Save" : "Create"}
          </Button>
        </div>
      }
    >
      <form
        id="recipe-form-modal-fields"
        className="space-y-5 px-2"
        onSubmit={handleSubmit}
      >
        {submitError ? (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {submitError}
          </p>
        ) : null}

        <div className="space-y-2">
          <label
            htmlFor="recipe-name"
            className="text-sm font-medium text-zinc-200"
          >
            Name
          </label>
          <Input
            id="recipe-name"
            placeholder="Meal name"
            value={name}
            disabled={saving}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="recipe-description"
            className="text-sm font-medium text-zinc-200"
          >
            Description{" "}
            <span className="font-normal text-zinc-500">(optional)</span>
          </label>
          <Input
            id="recipe-description"
            placeholder="Short note or instructions"
            value={description}
            disabled={saving}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <ParentRecipePicker
          mainRecipes={mainRecipes}
          value={parentRecipeId}
          onChange={setParentRecipeId}
          disabled={saving}
        />

        <IngredientListField
          value={ingredientLines}
          onChange={setIngredientLines}
          disabled={saving}
        />
      </form>
    </Dialog>
  );
}
