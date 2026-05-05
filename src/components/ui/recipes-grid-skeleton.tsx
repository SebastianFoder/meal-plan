import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function RecipesGridSkeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("grid gap-4 md:grid-cols-2", className)}
    >
      <span className="sr-only">Loading recipes…</span>
      {Array.from({ length: 4 }, (_, i) => (
        <Card key={i} className="space-y-3">
          <div className="flex justify-between gap-3">
            <div className="h-5 w-2/5 min-w-0 animate-pulse rounded-md bg-white/10 motion-reduce:animate-none" />
            <div className="flex shrink-0 gap-2">
              <div className="h-9 w-14 animate-pulse rounded-xl bg-white/10 motion-reduce:animate-none" />
              <div className="h-9 w-16 animate-pulse rounded-xl bg-white/10 motion-reduce:animate-none" />
            </div>
          </div>
          <div className="h-3 w-full animate-pulse rounded-md bg-white/10 motion-reduce:animate-none" />
          <div className="h-3 w-4/5 animate-pulse rounded-md bg-white/10 motion-reduce:animate-none" />
          <div className="h-3 w-full animate-pulse rounded-md bg-white/[0.07] motion-reduce:animate-none" />
        </Card>
      ))}
    </div>
  );
}
