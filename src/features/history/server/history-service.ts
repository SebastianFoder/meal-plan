import { db } from "@/lib/prisma";

type LegacyHistoryRow = {
  plannedTemplate: { id: string; name: string } | null;
  actualTemplate: { id: string; name: string } | null;
  plannedScheduledMeal:
    | ({ id: string; mealTemplate: { id: string; name: string } | null } & Record<string, unknown>)
    | null;
} & Record<string, unknown>;

type UpsertMealHistoryInput = {
  userId: string;
  date: Date;
  plannedScheduledMealId?: string;
  plannedRecipeId?: string;
  actualRecipeId?: string;
  actualMealName?: string;
  notes?: string;
};

export async function listMealHistory(userId: string) {
  try {
    return await db.mealHistory.findMany({
      where: { userId },
      include: {
        plannedRecipe: true,
        actualRecipe: true,
        plannedScheduledMeal: { include: { recipe: true } },
      },
      orderBy: { date: "desc" },
    });
  } catch {
    const legacyDb = db as unknown as {
      mealHistory: { findMany: (args: object) => Promise<LegacyHistoryRow[]> };
    };
    const rows = await legacyDb.mealHistory.findMany({
      where: { userId },
      include: {
        plannedTemplate: true,
        actualTemplate: true,
        plannedScheduledMeal: { include: { mealTemplate: true } },
      },
      orderBy: { date: "desc" },
    });

    return rows.map((row) => ({
      ...row,
      plannedRecipe: row.plannedTemplate,
      actualRecipe: row.actualTemplate,
      plannedScheduledMeal: row.plannedScheduledMeal
        ? {
            ...row.plannedScheduledMeal,
            recipe: row.plannedScheduledMeal.mealTemplate,
          }
        : null,
    }));
  }
}

export async function upsertMealHistory(input: UpsertMealHistoryInput) {
  return db.mealHistory.upsert({
    where: { userId_date: { userId: input.userId, date: input.date } },
    create: input,
    update: {
      plannedScheduledMealId: input.plannedScheduledMealId,
      plannedRecipeId: input.plannedRecipeId,
      actualRecipeId: input.actualRecipeId,
      actualMealName: input.actualMealName,
      notes: input.notes,
    },
  });
}
