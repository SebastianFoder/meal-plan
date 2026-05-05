"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type ParentRecipeOption = { id: string; name: string };

type ParentRecipePickerProps = {
  mainRecipes: ParentRecipeOption[];
  value: string;
  onChange: (parentId: string) => void;
  disabled?: boolean;
};

export function ParentRecipePicker({
  mainRecipes,
  value,
  onChange,
  disabled,
}: ParentRecipePickerProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedName = useMemo(() => {
    if (!value) return null;
    return mainRecipes.find((r) => r.id === value)?.name ?? null;
  }, [value, mainRecipes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mainRecipes;
    return mainRecipes.filter((r) => r.name.toLowerCase().includes(q));
  }, [mainRecipes, query]);

  const closePanel = () => {
    setPanelOpen(false);
    setQuery("");
  };

  const selectMain = () => {
    onChange("");
    closePanel();
  };

  const selectRecipe = (id: string) => {
    onChange(id);
    closePanel();
  };

  return (
    <div className="relative space-y-2">
      <span className="text-sm font-medium text-zinc-200">Variation of</span>
      <Button
        type="button"
        variant="secondary"
        disabled={disabled}
        onClick={() => setPanelOpen(true)}
        className="flex h-auto min-h-10 w-full justify-between gap-2 py-2 text-left font-normal hover:scale-100 active:scale-100"
      >
        <span className="min-w-0 truncate text-zinc-200">
          {selectedName ? (
            selectedName
          ) : (
            <span className="text-zinc-500">Main recipe (no variation)</span>
          )}
        </span>
        <ChevronDown className="size-4 shrink-0 opacity-60" aria-hidden />
      </Button>

      {panelOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition duration-200 ease-out"
            aria-label="Close parent recipe picker"
            onClick={closePanel}
          />
          <div
            className={cn(
              "relative z-[61] flex max-h-[min(70vh,22rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#161618] shadow-2xl",
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="parent-picker-title"
          >
            <div className="shrink-0 space-y-3 border-b border-white/10 p-4">
              <h3 id="parent-picker-title" className="text-sm font-semibold text-white">
                Select parent recipe
              </h3>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
                  aria-hidden
                />
                <Input
                  placeholder="Search recipes…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>
            </div>
            <ul className="min-h-0 flex-1 overflow-y-auto p-2">
              <li>
                <button
                  type="button"
                  onClick={selectMain}
                  className={cn(
                    "w-full rounded-xl px-3 py-2.5 text-left text-sm transition duration-200 ease-out",
                    !value
                      ? "bg-white/15 text-white"
                      : "text-zinc-300 hover:bg-white/10",
                  )}
                >
                  Main recipe (no variation)
                </button>
              </li>
              {filtered.map((recipe) => (
                <li key={recipe.id}>
                  <button
                    type="button"
                    onClick={() => selectRecipe(recipe.id)}
                    className={cn(
                      "w-full rounded-xl px-3 py-2.5 text-left text-sm transition duration-200 ease-out",
                      value === recipe.id
                        ? "bg-white/15 text-white"
                        : "text-zinc-300 hover:bg-white/10",
                    )}
                  >
                    {recipe.name}
                  </button>
                </li>
              ))}
              {filtered.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-zinc-500">
                  No recipes match your search.
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
