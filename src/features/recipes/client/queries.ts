import { useQuery } from "@tanstack/react-query";
import { listRecipes } from "./api";
import { recipesQueryKeys } from "./query-keys";

export function useRecipesQuery() {
  return useQuery({
    queryKey: recipesQueryKeys.all,
    queryFn: listRecipes,
    staleTime: 5 * 60_000,
  });
}
