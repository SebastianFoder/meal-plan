import { NextResponse } from "next/server";
import { deleteScheduledMeal } from "@/features/schedule/server/schedule-service";
import { requireUserId } from "@/lib/auth";

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await requireUserId();
  const { id } = await context.params;
  await deleteScheduledMeal({ userId, mealId: id });
  return NextResponse.json({ ok: true });
}
