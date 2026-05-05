"use client";

import { format, isToday } from "date-fns";
import { Check, ChevronsRight, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MealHistory, ScheduledMeal } from "./types";

type DayCardProps = {
  day: Date;
  activeMeals: ScheduledMeal[];
  eaten: MealHistory | undefined;
  onOpenScheduleForDay: (dayKey: string) => void;
  onMarkEaten: (dayKey: string, meal: ScheduledMeal) => Promise<void>;
  onPushDay: (mealId: string) => Promise<void>;
  onPreviewRecipe: (recipe: ScheduledMeal["recipe"]) => void;
  onRemoveMeal: (mealId: string) => Promise<void>;
};

export function DayCard({
  day,
  activeMeals,
  eaten,
  onOpenScheduleForDay,
  onMarkEaten,
  onPushDay,
  onPreviewRecipe,
  onRemoveMeal,
}: DayCardProps) {
  const dayKey = format(day, "yyyy-MM-dd");
  const firstPlanned = activeMeals[0];
  const isCurrentDay = isToday(day);

  return (
    <div
      className={
        isCurrentDay
          ? "min-h-24 rounded-xl border border-white/20 bg-white/[0.09] p-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          : "min-h-24 rounded-xl border border-white/10 bg-[#161618] p-3 text-sm"
      }
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium">{format(day, "EEE d")}</p>
      </div>
      <div className="mt-2 flex w-full items-center gap-1.5">
        {firstPlanned ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 flex-1 px-0"
            aria-label={`Mark ${firstPlanned.recipe.name} as eaten`}
            onClick={() => onMarkEaten(dayKey, firstPlanned)}
          >
            <Check className="size-4" aria-hidden />
          </Button>
        ) : null}
        {firstPlanned ? (
          <Button
            variant="secondary"
            size="sm"
            className="h-8 flex-1 px-0"
            aria-label={`Push ${firstPlanned.recipe.name} by one day`}
            onClick={() => onPushDay(firstPlanned.id)}
          >
            <ChevronsRight className="size-4" aria-hidden />
          </Button>
        ) : null}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 flex-1 px-0"
          onClick={() => onOpenScheduleForDay(dayKey)}
          aria-label={`Add meal for ${format(day, "EEEE d MMMM")}`}
        >
          <Plus className="size-4" aria-hidden />
        </Button>
      </div>
      <div className="flex items-center justify-between gap-2">
        {eaten ? (
          <p className="text-xs text-zinc-300">
            Ate: {eaten.actualRecipe?.name ?? eaten.actualMealName ?? "Logged"}
          </p>
        ) : null}
      </div>
      <div className="mt-3 space-y-2">
        {activeMeals.length === 0 ? (
          <span className="text-zinc-500">No meal</span>
        ) : (
          activeMeals.map((meal) => (
            <div
              key={meal.id}
              className="flex w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/10 px-2 py-1"
            >
              <button
                type="button"
                className="min-w-0 truncate text-left text-zinc-100 transition duration-200 ease-out hover:text-white"
                onClick={() => onPreviewRecipe(meal.recipe)}
              >
                {meal.recipe.name}
                {meal.recipe.parentRecipe ? ` (${meal.recipe.parentRecipe.name} variation)` : ""}
              </button>
              <button
                type="button"
                aria-label={`Remove ${meal.recipe.name} from timeline`}
                className="rounded p-0.5 text-zinc-400 transition duration-200 ease-out hover:bg-white/10 hover:text-white"
                onClick={() => onRemoveMeal(meal.id)}
              >
                <X className="size-3" aria-hidden />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
