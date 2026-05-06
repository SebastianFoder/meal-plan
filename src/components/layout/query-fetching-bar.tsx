"use client";

import { useIsFetching } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const isBackgroundFetch = (query: {
  state: { fetchStatus: string; status: string };
}) =>
  query.state.fetchStatus === "fetching" && query.state.status !== "pending";

/** Thin top bar when queries refetch in the background (not initial pending). */
export function QueryFetchingBar() {
  const fetchingCount = useIsFetching({
    predicate: isBackgroundFetch,
  });

  const active = fetchingCount > 0;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-30 h-[3px] overflow-hidden bg-white/[0.06] transition-opacity duration-200 ease-out motion-reduce:opacity-0",
        active ? "opacity-100" : "opacity-0",
      )}
      aria-hidden={!active}
    >
      <div
        className={cn(
          "h-full w-[35%] rounded-full bg-white/50",
          active ? "animate-fetch-bar-slide" : undefined,
        )}
      />
    </div>
  );
}
