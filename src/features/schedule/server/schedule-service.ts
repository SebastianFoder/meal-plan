import { addDays } from "date-fns";
import type { Prisma } from "@/generated/prisma/client";
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

function toDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function combineNotes(primary: string | null, secondary: string | null) {
  if (primary && secondary) {
    return `${primary}\n${secondary}`;
  }
  return primary ?? secondary;
}

async function moveHistoryEntryWithConflictResolution(args: {
  tx: Prisma.TransactionClient;
  historyId: string;
  userId: string;
  targetDate: Date;
}) {
  const { tx, historyId, userId, targetDate } = args;
  const history = await tx.mealHistory.findUnique({
    where: { id: historyId },
  });
  if (!history) return;

  const existingAtTarget = await tx.mealHistory.findUnique({
    where: { userId_date: { userId, date: targetDate } },
  });

  if (!existingAtTarget || existingAtTarget.id === history.id) {
    await tx.mealHistory.update({
      where: { id: history.id },
      data: { date: targetDate },
    });
    return;
  }

  const preferMoving =
    Boolean(history.plannedScheduledMealId) &&
    !existingAtTarget.plannedScheduledMealId;

  if (preferMoving) {
    await tx.mealHistory.delete({
      where: { id: existingAtTarget.id },
    });
    await tx.mealHistory.update({
      where: { id: history.id },
      data: {
        date: targetDate,
        plannedRecipeId: history.plannedRecipeId ?? existingAtTarget.plannedRecipeId,
        actualRecipeId: history.actualRecipeId ?? existingAtTarget.actualRecipeId,
        actualMealName: history.actualMealName ?? existingAtTarget.actualMealName,
        notes: combineNotes(history.notes, existingAtTarget.notes),
      },
    });
    return;
  }

  await tx.mealHistory.update({
    where: { id: existingAtTarget.id },
    data: {
      plannedRecipeId:
        existingAtTarget.plannedRecipeId ?? history.plannedRecipeId,
      actualRecipeId: existingAtTarget.actualRecipeId ?? history.actualRecipeId,
      actualMealName: existingAtTarget.actualMealName ?? history.actualMealName,
      notes: combineNotes(existingAtTarget.notes, history.notes),
    },
  });
  await tx.mealHistory.delete({
    where: { id: history.id },
  });
}

async function listScheduledMealsWithRecipe(args: {
  tx: Prisma.TransactionClient;
  userId: string;
}) {
  return args.tx.scheduledMeal.findMany({
    where: { userId: args.userId },
    include: { recipe: { include: { parentRecipe: true } } },
    orderBy: [{ startDate: "asc" }, { orderIndex: "asc" }],
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
          {
            startDate: target.startDate,
            orderIndex: { gte: target.orderIndex },
          },
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

export async function moveScheduledMeal(args: {
  userId: string;
  mealId: string;
  targetDate: Date;
  targetOrderIndex?: number;
}) {
  return db.$transaction(async (tx) => {
    const targetMeal = await tx.scheduledMeal.findUnique({
      where: { id_userId: { id: args.mealId, userId: args.userId } },
      select: { id: true, startDate: true },
    });

    if (!targetMeal) {
      throw new Error("Scheduled meal not found.");
    }

    await tx.scheduledMeal.update({
      where: { id: targetMeal.id },
      data: {
        startDate: args.targetDate,
        shiftReason: ScheduleShiftReason.MANUAL_ADJUST,
      },
    });

    if (typeof args.targetOrderIndex === "number") {
      const sameDayMeals = await tx.scheduledMeal.findMany({
        where: {
          userId: args.userId,
          startDate: args.targetDate,
        },
        orderBy: { orderIndex: "asc" },
        select: { id: true },
      });

      const boundedIndex = Math.max(
        0,
        Math.min(args.targetOrderIndex, sameDayMeals.length - 1),
      );
      const orderedIds = sameDayMeals.map((meal) => meal.id);
      const fromIndex = orderedIds.findIndex((id) => id === targetMeal.id);
      if (fromIndex >= 0) {
        orderedIds.splice(fromIndex, 1);
      }
      orderedIds.splice(boundedIndex, 0, targetMeal.id);
      for (const [offset, id] of orderedIds.entries()) {
        await tx.scheduledMeal.update({
          where: { id },
          data: { orderIndex: offset + 1 },
        });
      }
    }

    const linkedHistory = await tx.mealHistory.findMany({
      where: {
        userId: args.userId,
        plannedScheduledMealId: targetMeal.id,
      },
      select: { id: true },
    });

    for (const entry of linkedHistory) {
      await moveHistoryEntryWithConflictResolution({
        tx,
        historyId: entry.id,
        userId: args.userId,
        targetDate: args.targetDate,
      });
    }

    return listScheduledMealsWithRecipe({ tx, userId: args.userId });
  });
}

export async function moveDayMeals(args: {
  userId: string;
  sourceDate: Date;
  targetDate: Date;
}) {
  return db.$transaction(async (tx) => {
    const sourceDayKey = toDayKey(args.sourceDate);
    const targetDayKey = toDayKey(args.targetDate);
    if (sourceDayKey === targetDayKey) {
      return listScheduledMealsWithRecipe({ tx, userId: args.userId });
    }

    const allMeals = await tx.scheduledMeal.findMany({
      where: { userId: args.userId },
      orderBy: [{ startDate: "asc" }, { orderIndex: "asc" }],
      select: { id: true, startDate: true },
    });

    const updates: Array<{ id: string; nextDate: Date }> = [];
    const sourceRows = allMeals.filter(
      (meal) => toDayKey(meal.startDate) === sourceDayKey,
    );

    if (sourceRows.length === 0) {
      return listScheduledMealsWithRecipe({ tx, userId: args.userId });
    }

    const moveForward = args.sourceDate < args.targetDate;

    for (const meal of allMeals) {
      const mealDay = toDayKey(meal.startDate);
      if (mealDay === sourceDayKey) {
        updates.push({ id: meal.id, nextDate: args.targetDate });
        continue;
      }

      if (moveForward) {
        if (meal.startDate > args.sourceDate && meal.startDate <= args.targetDate) {
          updates.push({ id: meal.id, nextDate: addDays(meal.startDate, -1) });
        }
        continue;
      }

      if (meal.startDate >= args.targetDate && meal.startDate < args.sourceDate) {
        updates.push({ id: meal.id, nextDate: addDays(meal.startDate, 1) });
      }
    }

    for (const update of updates) {
      await tx.scheduledMeal.update({
        where: { id: update.id },
        data: {
          startDate: update.nextDate,
          shiftReason: ScheduleShiftReason.MANUAL_ADJUST,
        },
      });
    }

    const mealIdsToMove = updates.map((entry) => entry.id);
    const linkedHistory = await tx.mealHistory.findMany({
      where: {
        userId: args.userId,
        plannedScheduledMealId: { in: mealIdsToMove },
      },
      select: { id: true, plannedScheduledMealId: true },
    });

    const nextDateByMealId = new Map(updates.map((entry) => [entry.id, entry.nextDate]));

    for (const history of linkedHistory) {
      const mealId = history.plannedScheduledMealId;
      if (!mealId) continue;
      const targetDate = nextDateByMealId.get(mealId);
      if (!targetDate) continue;
      await moveHistoryEntryWithConflictResolution({
        tx,
        historyId: history.id,
        userId: args.userId,
        targetDate,
      });
    }

    return listScheduledMealsWithRecipe({ tx, userId: args.userId });
  });
}

export async function deleteScheduledMeal(args: {
  userId: string;
  mealId: string;
}) {
  return db.scheduledMeal.delete({
    where: {
      id_userId: {
        id: args.mealId,
        userId: args.userId,
      },
    },
  });
}
