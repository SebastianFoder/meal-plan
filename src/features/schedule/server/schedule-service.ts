import { addDays } from "date-fns";
import { ScheduleShiftReason } from "@/generated/prisma/enums";
import { db } from "@/lib/prisma";

type CreateScheduledMealInput = {
  userId: string;
  recipeId: string;
  startDate: Date;
  durationDays: number;
};

export async function listScheduledMeals(userId: string) {
  return db.scheduledMeal.findMany({
    where: { userId },
    include: { recipe: { include: { parentRecipe: true } } },
    orderBy: [{ startDate: "asc" }, { orderIndex: "asc" }],
  });
}

export async function createScheduledMeal(input: CreateScheduledMealInput) {
  const last = await db.scheduledMeal.findFirst({
    where: { userId: input.userId },
    orderBy: { orderIndex: "desc" },
  });

  return db.scheduledMeal.create({
    data: {
      ...input,
      orderIndex: (last?.orderIndex ?? 0) + 1,
    },
  });
}

export async function pushMealForwardCascading(args: {
  userId: string;
  mealId: string;
  days: number;
}) {
  return db.$transaction(async (tx) => {
    const target = await tx.scheduledMeal.findUnique({
      where: { id_userId: { id: args.mealId, userId: args.userId } },
      select: { id: true, startDate: true, orderIndex: true },
    });

    if (!target) {
      throw new Error("Scheduled meal not found.");
    }

    // If this meal was marked as eaten on its original day, clear that history
    // so pushing it forward returns the day to an uncompleted state.
    await tx.mealHistory.deleteMany({
      where: {
        userId: args.userId,
        plannedScheduledMealId: args.mealId,
      },
    });

    const futureMeals = await tx.scheduledMeal.findMany({
      where: {
        userId: args.userId,
        OR: [
          { startDate: { gt: target.startDate } },
          { startDate: target.startDate, orderIndex: { gte: target.orderIndex } },
        ],
      },
      orderBy: [{ startDate: "asc" }, { orderIndex: "asc" }],
      select: { id: true, startDate: true },
    });

    // Shift every meal at/after the target date by the same delta.
    // This preserves timeline ordering while handling skipped days.
    for (const meal of futureMeals) {
      await tx.scheduledMeal.update({
        where: { id: meal.id },
        data: {
          startDate: addDays(meal.startDate, args.days),
          shiftReason: ScheduleShiftReason.SKIP_DAY,
        },
      });
    }

    return tx.scheduledMeal.findMany({
      where: { userId: args.userId },
      include: { recipe: { include: { parentRecipe: true } } },
      orderBy: [{ startDate: "asc" }, { orderIndex: "asc" }],
    });
  });
}

export async function deleteScheduledMeal(args: { userId: string; mealId: string }) {
  return db.scheduledMeal.delete({
    where: {
      id_userId: {
        id: args.mealId,
        userId: args.userId,
      },
    },
  });
}
