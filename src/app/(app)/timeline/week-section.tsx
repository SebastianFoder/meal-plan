"use client";

import { format } from "date-fns";
import { DayCard } from "./day-card";
import type { MealHistory, ScheduledMeal, TimelineWeek } from "./types";
import { isMealActiveOnDay } from "./utils";

type WeekSectionProps = {
  week: TimelineWeek;
  scheduledMeals: ScheduledMeal[];
  history: MealHistory[];
  onOpenScheduleForDay: (dayKey: string) => void;
  onMarkEaten: (dayKey: string, meal: ScheduledMeal) => Promise<void>;
  onUnmarkEaten: (dayKey: string) => Promise<void>;
  onPushDay: (mealId: string) => Promise<void>;
  onPreviewRecipe: (recipe: ScheduledMeal["recipe"]) => void;
  onRemoveMeal: (mealId: string) => Promise<void>;
};

export function WeekSection({
  week,
  scheduledMeals,
  history,
  onOpenScheduleForDay,
  onMarkEaten,
  onUnmarkEaten,
  onPushDay,
  onPreviewRecipe,
  onRemoveMeal,
}: WeekSectionProps) {
  const containerClassName =
    week.key === 0
      ? "space-y-3 rounded-2xl border border-white/15 bg-white/[0.06] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]"
      : week.key === -1
        ? "space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3 opacity-70"
        : "space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 opacity-85";

  return (
    <div className={containerClassName}>
      <p className="text-sm font-medium text-zinc-300">{week.label}</p>
      <div className="grid gap-3 md:grid-cols-7">
        {week.days.map((day) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const activeMeals = scheduledMeals.filter((meal) =>
            isMealActiveOnDay(meal, dayKey),
          );
          const eaten = history.find(
            (entry) => format(new Date(entry.date), "yyyy-MM-dd") === dayKey,
          );

          return (
            <DayCard
              key={dayKey}
              day={day}
              activeMeals={activeMeals}
              eaten={eaten}
              onOpenScheduleForDay={onOpenScheduleForDay}
              onMarkEaten={onMarkEaten}
              onUnmarkEaten={onUnmarkEaten}
              onPushDay={onPushDay}
              onPreviewRecipe={onPreviewRecipe}
              onRemoveMeal={onRemoveMeal}
            />
          );
        })}
      </div>
    </div>
  );
}
