import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export type PageLoaderProps = {
  label?: string;
  className?: string;
  minHeightClassName?: string;
};

export function PageLoader({
  label = "Loading…",
  className,
  minHeightClassName = "min-h-[240px]",
}: PageLoaderProps) {
  return (
    <Card
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-16",
        minHeightClassName,
        className,
      )}
    >
      <span className="sr-only">{label}</span>
      <Spinner size="lg" />
      <p className="text-sm text-zinc-400">{label}</p>
    </Card>
  );
}
