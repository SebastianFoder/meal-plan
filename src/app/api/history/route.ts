import { NextResponse } from "next/server";
import { z } from "zod";
import { listMealHistory, upsertMealHistory } from "@/features/history/server/history-service";
import { requireUserId } from "@/lib/auth";

const upsertSchema = z.object({
  date: z.string().date(),
  plannedScheduledMealId: z.string().optional(),
  plannedTemplateId: z.string().optional(),
  actualTemplateId: z.string().optional(),
  actualMealName: z.string().max(120).optional(),
  notes: z.string().max(500).optional(),
});

export async function GET() {
  const userId = await requireUserId();
  const history = await listMealHistory(userId);
  return NextResponse.json(history);
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  const parsed = upsertSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const entry = await upsertMealHistory({
    userId,
    ...parsed.data,
    date: new Date(parsed.data.date),
  });

  return NextResponse.json(entry);
}
