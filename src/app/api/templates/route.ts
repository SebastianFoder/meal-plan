import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/auth";
import { createRecipe, listRecipes } from "@/features/templates/server/templates-service";

const recipeSchema = z.object({
  name: z.string().min(1).max(120),
  parentRecipeId: z.string().optional(),
  description: z.string().max(500).optional(),
  ingredients: z.array(z.string().min(1)).min(1),
});

export async function GET() {
  const userId = await requireUserId();
  const recipes = await listRecipes(userId);
  return NextResponse.json(recipes);
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  const parsed = recipeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const created = await createRecipe({ userId, ...parsed.data });
  return NextResponse.json(created, { status: 201 });
}
