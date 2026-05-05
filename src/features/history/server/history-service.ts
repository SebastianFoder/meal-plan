import { db } from "@/lib/prisma";

type UpsertMealHistoryInput = {
  userId: string;
  date: Date;
  plannedScheduledMealId?: string;
  plannedTemplateId?: string;
  actualTemplateId?: string;
  actualMealName?: string;
  notes?: string;
};

export async function listMealHistory(userId: string) {
  return db.mealHistory.findMany({
    where: { userId },
    include: {
      plannedTemplate: true,
      actualTemplate: true,
      plannedScheduledMeal: { include: { mealTemplate: true } },
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
      plannedTemplateId: input.plannedTemplateId,
      actualTemplateId: input.actualTemplateId,
      actualMealName: input.actualMealName,
      notes: input.notes,
    },
  });
}
