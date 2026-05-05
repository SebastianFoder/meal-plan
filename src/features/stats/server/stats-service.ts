import { endOfWeek, format, startOfWeek, subWeeks } from "date-fns";
import { db } from "@/lib/prisma";

export async function getDashboardStats(userId: string) {
  const now = new Date();
  const from = startOfWeek(subWeeks(now, 7), { weekStartsOn: 1 });
  const to = endOfWeek(now, { weekStartsOn: 1 });

  const history = await db.mealHistory.findMany({
    where: { userId, date: { gte: from, lte: to } },
    include: {
      actualTemplate: true,
      plannedTemplate: true,
    },
  });

  const mealsPerWeekMap = new Map<string, number>();
  const mealFrequencyMap = new Map<string, number>();
  const ingredientFrequencyMap = new Map<string, number>();

  for (const row of history) {
    const weekLabel = format(startOfWeek(row.date, { weekStartsOn: 1 }), "MMM d");
    mealsPerWeekMap.set(weekLabel, (mealsPerWeekMap.get(weekLabel) ?? 0) + 1);

    const mealName = row.actualTemplate?.name ?? row.actualMealName ?? "Unknown";
    mealFrequencyMap.set(mealName, (mealFrequencyMap.get(mealName) ?? 0) + 1);

    const ingredients =
      row.actualTemplate?.ingredients ?? row.plannedTemplate?.ingredients ?? [];
    for (const ingredient of ingredients) {
      ingredientFrequencyMap.set(
        ingredient,
        (ingredientFrequencyMap.get(ingredient) ?? 0) + 1,
      );
    }
  }

  return {
    mealsPerWeek: Array.from(mealsPerWeekMap.entries()).map(([week, count]) => ({
      week,
      count,
    })),
    mealFrequency: Array.from(mealFrequencyMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    ingredientFrequency: Array.from(ingredientFrequencyMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
  };
}
