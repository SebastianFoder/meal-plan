import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "size-5 border-2",
  md: "size-8 border-2",
  lg: "size-10 border-[3px]",
} as const;

const toneClasses = {
  default:
    "border-white/20 border-t-white/70 motion-reduce:border-white/35 motion-reduce:border-t-white/35",
  "on-light":
    "border-zinc-300 border-t-zinc-900 motion-reduce:border-zinc-400 motion-reduce:border-t-zinc-700",
} as const;

export type SpinnerProps = {
  className?: string;
  size?: keyof typeof sizeClasses;
  /** Use `on-light` on white/light surfaces (e.g. primary buttons). */
  tone?: keyof typeof toneClasses;
};

/** Decorative ring; pair with a parent `role="status"` + sr-only label for a11y. */
export function Spinner({
  className,
  size = "md",
  tone = "default",
}: SpinnerProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block shrink-0 rounded-full",
        "animate-spin motion-reduce:animate-none",
        toneClasses[tone],
        sizeClasses[size],
        className,
      )}
    />
  );
}
