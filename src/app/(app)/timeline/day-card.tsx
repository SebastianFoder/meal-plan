"use client";

import { format, isToday } from "date-fns";
import { Check, ChevronsRight, GripVertical, Plus, X } from "lucide-react";
import type { DragEventHandler } from "react";
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
  dragState:
    | { type: "day"; sourceDate: string }
    | { type: "meal"; mealId: string; sourceDate: string }
    | null;
  hoverDate: string | null;
  hoverInsertionIndex: number | null;
  onDayDragStart: (dayKey: string) => void;
  onMealDragStart: (mealId: string, dayKey: string) => void;
  onDragEnd: () => void;
  onHoverChange: (dayKey: string, insertionIndex?: number | null) => void;
  onDrop: (targetDate: string) => Promise<void>;
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
  dragState,
  hoverDate,
  hoverInsertionIndex,
  onDayDragStart,
  onMealDragStart,
  onDragEnd,
  onHoverChange,
  onDrop,
}: DayCardProps) {
  const dayKey = format(day, "yyyy-MM-dd");
  const firstPlanned = activeMeals[0];
  const isCurrentDay = isToday(day);
  const isCompleted = Boolean(eaten);
  const isDraggedDay = dragState?.type === "day" && dragState.sourceDate === dayKey;
  const isHoverDay = hoverDate === dayKey;
  const canDropOnDay = Boolean(dragState) && !isDraggedDay;

  const dropPlaceholderVisible = canDropOnDay && isHoverDay;

  const handleCardDrop: DragEventHandler<HTMLDivElement> = async (event) => {
    event.preventDefault();
    if (!canDropOnDay) return;
    await onDrop(dayKey);
  };

  return (
    <div
      onDragOver={(event) => {
        if (!dragState) return;
        event.preventDefault();
        onHoverChange(dayKey, dragState.type === "meal" ? activeMeals.length : null);
      }}
      onDrop={handleCardDrop}
      className={`min-h-24 rounded-xl p-3 text-sm transition ${
        isCompleted && isCurrentDay
          ? "border border-emerald-300/30 bg-emerald-500/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          : isCompleted
            ? "border border-emerald-400/20 bg-emerald-500/10"
            : isCurrentDay
              ? "border border-white/20 bg-white/[0.09] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
              : "border border-white/10 bg-[#161618]"
      } ${dropPlaceholderVisible ? "ring-2 ring-sky-400/60 ring-offset-0" : ""} ${isDraggedDay ? "opacity-45" : ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium">{format(day, "EEE d")}</p>
        <button
          type="button"
          draggable
          aria-label={`Drag day ${format(day, "EEEE d MMMM")}`}
          onDragStart={() => onDayDragStart(dayKey)}
          onDragEnd={onDragEnd}
          className="rounded p-1 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-100"
        >
          <GripVertical className="size-4" aria-hidden />
        </button>
      </div>
      {dropPlaceholderVisible && dragState?.type === "day" ? (
        <div className="mt-2 rounded-lg border border-dashed border-sky-300/70 bg-sky-400/10 px-2 py-1 text-xs text-sky-100">
          Drop day here
        </div>
      ) : null}
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
          <>
            {dropPlaceholderVisible && dragState?.type === "meal" ? (
              <div className="rounded-lg border border-dashed border-sky-300/70 bg-sky-400/10 px-2 py-2 text-xs text-sky-100">
                Drop meal here
              </div>
            ) : null}
            <span className="text-zinc-500">No meal</span>
          </>
        ) : (
          activeMeals.map((meal) => (
            <div key={meal.id}>
              {dropPlaceholderVisible &&
              dragState?.type === "meal" &&
              hoverInsertionIndex === activeMeals.findIndex((entry) => entry.id === meal.id) ? (
                <div className="mb-2 rounded-lg border border-dashed border-sky-300/70 bg-sky-400/10 px-2 py-1 text-xs text-sky-100">
                  Drop meal here
                </div>
              ) : null}
              <div
                draggable
                onDragStart={() => onMealDragStart(meal.id, dayKey)}
                onDragEnd={onDragEnd}
                onDragOver={(event) => {
                  if (dragState?.type !== "meal") return;
                  event.preventDefault();
                  const rect = event.currentTarget.getBoundingClientRect();
                  const offset = event.clientY - rect.top;
                  const rowIndex = activeMeals.findIndex((entry) => entry.id === meal.id);
                  const insertionIndex = offset < rect.height / 2 ? rowIndex : rowIndex + 1;
                  onHoverChange(dayKey, insertionIndex);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/10 px-2 py-1 ${
                  dragState?.type === "meal" && dragState.mealId === meal.id
                    ? "opacity-45"
                    : ""
                }`}
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
            </div>
          ))
        )}
        {dropPlaceholderVisible &&
        dragState?.type === "meal" &&
        hoverInsertionIndex === activeMeals.length ? (
          <div className="rounded-lg border border-dashed border-sky-300/70 bg-sky-400/10 px-2 py-1 text-xs text-sky-100">
            Drop meal here
          </div>
        ) : null}
      </div>
    </div>
  );
}
