import { NextResponse } from "next/server";
import { z } from "zod";
import { pushMealForwardCascading } from "@/features/schedule/server/schedule-service";
import { requireUserId } from "@/lib/auth";

const pushSchema = z.object({
  mealId: z.string().min(1),
  days: z.number().int().min(1).max(14),
});

export async function POST(request: Request) {
  const userId = await requireUserId();
  const parsed = pushSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await pushMealForwardCascading({
    userId,
    mealId: parsed.data.mealId,
    days: parsed.data.days,
  });

  return NextResponse.json(updated);
}
