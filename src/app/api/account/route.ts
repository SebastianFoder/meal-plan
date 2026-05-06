import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/auth";
import {
  deleteAccount,
  updateAccount,
} from "@/features/account/server/account-service";

const patchSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

export async function PATCH(request: Request) {
  const userId = await requireUserId();
  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await updateAccount(userId, { name: parsed.data.name });
  return NextResponse.json(updated);
}

export async function DELETE() {
  const userId = await requireUserId();
  await deleteAccount(userId);
  return NextResponse.json({ ok: true as const });
}
