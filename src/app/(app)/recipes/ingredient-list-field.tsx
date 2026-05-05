"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type IngredientListFieldProps = {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
};

export function IngredientListField({
  value,
  onChange,
  disabled,
}: IngredientListFieldProps) {
  const updateAt = (index: number, text: string) => {
    const next = [...value];
    next[index] = text;
    onChange(next);
  };

  const addRow = () => {
    onChange([...value, ""]);
  };

  const removeAt = (index: number) => {
    if (value.length <= 1) return;
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-zinc-200">Ingredients</span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled}
          onClick={addRow}
          className="gap-1.5"
        >
          <Plus className="size-4 shrink-0" aria-hidden />
          Add ingredient
        </Button>
      </div>
      <ul className="space-y-2">
        {value.map((line, index) => (
          <li key={index} className="flex min-w-0 gap-2">
            <Input
              placeholder={`Ingredient ${index + 1}`}
              value={line}
              disabled={disabled}
              onChange={(e) => updateAt(index, e.target.value)}
              className="min-w-0 flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={disabled || value.length <= 1}
              onClick={() => removeAt(index)}
              className="shrink-0 px-2"
              aria-label={`Remove ingredient ${index + 1}`}
            >
              <Minus className="size-4" aria-hidden />
            </Button>
          </li>
        ))}
      </ul>
      <p className="text-xs text-zinc-500">At least one ingredient is required.</p>
    </div>
  );
}
