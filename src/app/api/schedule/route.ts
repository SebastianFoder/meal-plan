import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createScheduledMeal,
  listScheduledMeals,
} from "@/features/schedule/server/schedule-service";
import { requireUserId } from "@/lib/auth";

const createSchema = z.object({
  mealTemplateId: z.string().min(1),
  startDate: z.string().date(),
  durationDays: z.number().int().min(1).max(30),
});

export async function GET() {
  const userId = await requireUserId();
  const meals = await listScheduledMeals(userId);
  return NextResponse.json(meals);
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const created = await createScheduledMeal({
    userId,
    mealTemplateId: parsed.data.mealTemplateId,
    startDate: new Date(parsed.data.startDate),
    durationDays: parsed.data.durationDays,
  });
  return NextResponse.json(created, { status: 201 });
}
