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
  onUnmarkEaten: (dayKey: string) => Promise<void>;
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
  onUnmarkEaten,
  onPushDay,
  onPreviewRecipe,
  onRemoveMeal,
}: DayCardProps) {
  const dayKey = format(day, "yyyy-MM-dd");
  const firstPlanned = activeMeals[0];
  const isCurrentDay = isToday(day);
  const isCompleted = Boolean(eaten);

  return (
    <div
      className={`min-h-24 rounded-xl p-3 text-sm ${
        isCompleted && isCurrentDay
          ? "border border-emerald-300/30 bg-emerald-500/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          : isCompleted
            ? "border border-emerald-400/20 bg-emerald-500/10"
            : isCurrentDay
              ? "border border-white/20 bg-white/[0.09] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
              : "border border-white/10 bg-[#161618]"
      }`}
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
            aria-label={
              isCompleted
                ? `Unmark ${format(day, "EEEE d MMMM")} as eaten`
                : `Mark ${firstPlanned.recipe.name} as eaten`
            }
            onClick={() =>
              isCompleted
                ? onUnmarkEaten(dayKey)
                : onMarkEaten(dayKey, firstPlanned)
            }
          >
            {isCompleted ? (
              <X className="size-4" aria-hidden />
            ) : (
              <Check className="size-4" aria-hidden />
            )}
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
      <div className="mt-3 space-y-2">
        {activeMeals.length === 0 ? (
          <span className="text-zinc-500">No meal</span>
        ) : (
          activeMeals.map((meal) => (
            <div
              key={meal.id}
              className="flex w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/10 px-2 py-1"
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto min-w-0 flex-1 justify-start px-0 text-left text-zinc-100 transition duration-200 ease-out hover:text-white"
                onClick={() => onPreviewRecipe(meal.recipe)}
              >
                {meal.recipe.name}
                {meal.recipe.parentRecipe
                  ? ` (${meal.recipe.parentRecipe.name} variation)`
                  : ""}
              </Button>
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
