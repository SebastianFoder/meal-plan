import { Card } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <Card className="space-y-3">
        <div className="h-8 w-48 max-w-[70%] animate-pulse rounded-lg bg-white/10 motion-reduce:animate-none" />
        <div className="h-4 w-full max-w-md animate-pulse rounded-md bg-white/10 motion-reduce:animate-none" />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="min-w-0 space-y-3">
          <div className="h-4 w-36 animate-pulse rounded-md bg-white/10 motion-reduce:animate-none" />
          <div className="h-52 min-h-[13rem] animate-pulse rounded-xl bg-white/[0.06] motion-reduce:animate-none" />
        </Card>
        <Card className="min-w-0 space-y-3">
          <div className="h-4 w-44 animate-pulse rounded-md bg-white/10 motion-reduce:animate-none" />
          <div className="h-52 min-h-[13rem] animate-pulse rounded-xl bg-white/[0.06] motion-reduce:animate-none" />
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="h-4 w-48 animate-pulse rounded-md bg-white/10 motion-reduce:animate-none" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="h-9 w-24 animate-pulse rounded-lg bg-white/10 motion-reduce:animate-none"
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
