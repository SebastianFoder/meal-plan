import { Card } from "@/components/ui/card";
import { StatsBarChart } from "@/components/ui/stats-charts";
import { getDashboardStats } from "@/features/stats/server/stats-service";
import { requireUserId } from "@/lib/auth";

export default async function DashboardPage() {
  const userId = await requireUserId();
  const stats = await getDashboardStats(userId);

  return (
    <div className="space-y-6">
      <Card className="space-y-2">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-zinc-400">Your latest meal consistency and ingredient trends.</p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="min-w-0">
          <h2 className="mb-3 text-sm font-medium text-zinc-300">Meals per week</h2>
          <StatsBarChart data={stats.mealsPerWeek} xKey="week" />
        </Card>
        <Card className="min-w-0">
          <h2 className="mb-3 text-sm font-medium text-zinc-300">Most frequent recipies</h2>
          <StatsBarChart data={stats.mealFrequency} xKey="name" />
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-sm font-medium text-zinc-300">Ingredient frequency</h2>
        <div className="flex flex-wrap gap-2">
          {stats.ingredientFrequency.map((item) => (
            <span
              key={item.name}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200"
            >
              {item.name} ({item.count})
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}
