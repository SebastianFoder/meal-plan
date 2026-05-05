import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/auth";
import { createTemplate, listTemplates } from "@/features/templates/server/templates-service";

const templateSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  ingredients: z.array(z.string().min(1)).min(1),
});

export async function GET() {
  const userId = await requireUserId();
  const templates = await listTemplates(userId);
  return NextResponse.json(templates);
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  const parsed = templateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const created = await createTemplate({ userId, ...parsed.data });
  return NextResponse.json(created, { status: 201 });
}
