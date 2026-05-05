import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-white/10 bg-[#111113] px-3 text-sm text-white placeholder:text-zinc-500 outline-none transition duration-200 ease-out focus:ring-2 focus:ring-white/20",
        className,
      )}
      {...props}
    />
  );
}
