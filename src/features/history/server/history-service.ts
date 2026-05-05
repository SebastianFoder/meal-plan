import { db } from "@/lib/prisma";

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
  return db.mealHistory.findMany({
    where: { userId },
    include: {
      plannedRecipe: true,
      actualRecipe: true,
      plannedScheduledMeal: { include: { recipe: true } },
    },
    orderBy: { date: "desc" },
  });
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

export async function removeMealHistoryByDate(userId: string, date: Date) {
  await db.mealHistory.deleteMany({
    where: { userId, date },
  });
}
