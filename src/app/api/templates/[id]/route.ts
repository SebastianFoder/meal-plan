import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteRecipe, updateRecipe } from "@/features/templates/server/templates-service";
import { requireUserId } from "@/lib/auth";

const updateSchema = z.object({
  name: z.string().min(1).max(120),
  /** Omit or `null` to clear variation and make this a main recipe. */
  parentRecipeId: z.string().nullish(),
  description: z.string().max(500).optional(),
  ingredients: z.array(z.string().min(1)).min(1),
});

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await requireUserId();
  const { id } = await context.params;
  const parsed = updateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await updateRecipe({
    id,
    userId,
    ...parsed.data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await requireUserId();
  const { id } = await context.params;
  await deleteRecipe(userId, id);
  return NextResponse.json({ ok: true });
}
