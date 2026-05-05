import { NextResponse } from "next/server";
import { z } from "zod";
import { moveScheduledMeal } from "@/features/schedule/server/schedule-service";
import { requireUserId } from "@/lib/auth";

const moveMealSchema = z.object({
  mealId: z.string().min(1),
  targetDate: z.string().date(),
  targetOrderIndex: z.number().int().min(0).optional(),
});

export async function POST(request: Request) {
  const userId = await requireUserId();
  const parsed = moveMealSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await moveScheduledMeal({
    userId,
    mealId: parsed.data.mealId,
    targetDate: new Date(parsed.data.targetDate),
    targetOrderIndex: parsed.data.targetOrderIndex,
  });

  return NextResponse.json(updated);
}
