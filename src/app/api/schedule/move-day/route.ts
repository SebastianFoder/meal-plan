import { NextResponse } from "next/server";
import { z } from "zod";
import { moveDayMeals } from "@/features/schedule/server/schedule-service";
import { requireUserId } from "@/lib/auth";

const moveDaySchema = z.object({
  sourceDate: z.string().date(),
  targetDate: z.string().date(),
});

export async function POST(request: Request) {
  const userId = await requireUserId();
  const parsed = moveDaySchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await moveDayMeals({
    userId,
    sourceDate: new Date(parsed.data.sourceDate),
    targetDate: new Date(parsed.data.targetDate),
  });

  return NextResponse.json(updated);
}
