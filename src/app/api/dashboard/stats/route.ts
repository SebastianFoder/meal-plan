import { NextResponse } from "next/server";
import { getDashboardStats } from "@/features/stats/server/stats-service";
import { requireUserId } from "@/lib/auth";

export async function GET() {
  const userId = await requireUserId();
  const stats = await getDashboardStats(userId);
  return NextResponse.json(stats);
}
