import { addDays, format } from "date-fns";
import type { ScheduledMeal } from "./types";

export function toDateKey(value: string) {
  return value.length >= 10 ? value.slice(0, 10) : format(new Date(value), "yyyy-MM-dd");
}

export function isMealActiveOnDay(meal: ScheduledMeal, dayKey: string) {
  const startKey = toDateKey(meal.startDate);
  const endKey = format(
    addDays(new Date(`${startKey}T00:00:00`), Math.max(0, meal.durationDays - 1)),
    "yyyy-MM-dd",
  );
  return dayKey >= startKey && dayKey <= endKey;
}
