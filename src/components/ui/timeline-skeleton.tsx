import { cn } from "@/lib/utils";

function WeekBlock({ emphasis }: { emphasis: "muted" | "current" | "next" }) {
  const containerClassName =
    emphasis === "current"
      ? "space-y-3 rounded-2xl border border-white/15 bg-white/[0.06] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]"
      : emphasis === "muted"
        ? "space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3 opacity-70"
        : "space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 opacity-85";

  return (
    <div className={containerClassName}>
      <div className="h-4 w-36 animate-pulse rounded-md bg-white/10 motion-reduce:animate-none" />
      <div className="grid gap-3 md:grid-cols-7">
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl bg-white/10 motion-reduce:animate-none"
          />
        ))}
      </div>
    </div>
  );
}

export function TimelineSkeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("space-y-4", className)}
    >
      <span className="sr-only">Loading timeline…</span>
      <WeekBlock emphasis="muted" />
      <WeekBlock emphasis="current" />
      <WeekBlock emphasis="next" />
    </div>
  );
}
