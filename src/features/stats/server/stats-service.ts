import { endOfWeek, format, startOfWeek, subWeeks } from "date-fns";
import { db } from "@/lib/prisma";

type LegacyStatRow = {
  date: Date;
  actualMealName: string | null;
  actualTemplate: { name: string; ingredients: string[] } | null;
  plannedTemplate: { ingredients: string[] } | null;
};

export async function getDashboardStats(userId: string) {
  const now = new Date();
  const from = startOfWeek(subWeeks(now, 7), { weekStartsOn: 1 });
  const to = endOfWeek(now, { weekStartsOn: 1 });

  let history: Array<{
    date: Date;
    actualMealName: string | null;
    actualRecipe: { name: string; ingredients: string[] } | null;
    plannedRecipe: { ingredients: string[] } | null;
  }>;

  try {
    history = await db.mealHistory.findMany({
      where: { userId, date: { gte: from, lte: to } },
      include: {
        actualRecipe: true,
        plannedRecipe: true,
      },
    });
  } catch {
    const legacyDb = db as unknown as {
      mealHistory: { findMany: (args: object) => Promise<LegacyStatRow[]> };
    };
    const legacyRows = await legacyDb.mealHistory.findMany({
      where: { userId, date: { gte: from, lte: to } },
      include: {
        actualTemplate: true,
        plannedTemplate: true,
      },
    });

    history = legacyRows.map((row) => ({
      date: row.date,
      actualMealName: row.actualMealName,
      actualRecipe: row.actualTemplate,
      plannedRecipe: row.plannedTemplate,
    }));
  }

  const mealsPerWeekMap = new Map<string, number>();
  const mealFrequencyMap = new Map<string, number>();
  const ingredientFrequencyMap = new Map<string, number>();

  for (const row of history) {
    const weekLabel = format(startOfWeek(row.date, { weekStartsOn: 1 }), "MMM d");
    mealsPerWeekMap.set(weekLabel, (mealsPerWeekMap.get(weekLabel) ?? 0) + 1);

    const mealName = row.actualRecipe?.name ?? row.actualMealName ?? "Unknown";
    mealFrequencyMap.set(mealName, (mealFrequencyMap.get(mealName) ?? 0) + 1);

    const ingredients =
      row.actualRecipe?.ingredients ?? row.plannedRecipe?.ingredients ?? [];
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
