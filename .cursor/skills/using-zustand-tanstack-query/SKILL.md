---
name: using-zustand-tanstack-query
description: Implements frontend state with Zustand stores and TanStack Query mutations/queries using this repository's architecture. Use when adding or refactoring client state, CRUD flows, or page data loading for recipes, timeline, schedule, or history (including user requests mentioning tanstack querry/query).
---

# Using Zustand + TanStack Query

## Goal
Keep server data logic in TanStack Query hooks and keep UI/workflow state in Zustand stores.

## Ownership Rules
- TanStack Query owns server `get/create/update/delete` data flows and cache lifecycle.
- Zustand owns client/UI state only (modal open state, selected IDs, filters, preview state, transient workflow flags).
- Pages/components should not call `fetch` directly for domain data.
- API calls live in `src/features/<domain>/client/api.ts`.
- Query keys live in `src/features/<domain>/client/query-keys.ts`.
- Query hooks live in `src/features/<domain>/client/queries.ts`.
- Mutation hooks live in `src/features/<domain>/client/mutations.ts`.
- Zustand stores live in `src/features/<domain>/client/*-ui-store.ts`.

## Default Workflow
1. Add/extend typed API client functions in `client/api.ts` using `requestJson` from `src/lib/client-api.ts`.
2. Add query keys and query hooks for read paths.
3. Add mutation hooks for write paths.
4. In mutation `onSuccess`, prefer:
   - `setQueryData` for local/contained updates (fast UX), or
   - `invalidateQueries` when server-side cascading logic recalculates related data.
5. Add/update Zustand UI store only for page workflow state.
6. Refactor page/component to consume hooks/store and remove direct fetch logic.
7. Run lint/build checks.

## Cache Strategy Defaults
- Keep moderate `staleTime` to prevent refetch on every navigation:
  - recipes-like lists: around `5 * 60_000`
  - timeline/schedule/history: around `60_000` unless requirements differ
- Disable noisy auto-refetch behavior at provider level unless specifically needed.
- Use explicit invalidation after mutations that affect multiple queries.

## Error Handling
- Use `ApiError` from `src/lib/client-api.ts` for user-visible error messages.
- Show clear fallback UI in pages for loading and error states.
- Avoid swallowing mutation errors; let callers decide message/UX.

## Store Design Rules (Zustand)
- Keep store shape focused on UI state and actions.
- Prefer explicit action names (`openCreateRecipeModal`, `setSelectedRecipeId`).
- Do not duplicate TanStack Query server data inside Zustand.
- Avoid localStorage persistence for server caches.

## Repo Patterns To Follow
- Provider setup: `src/app/providers.tsx` and `src/app/(app)/layout.tsx`
- Recipes pattern: `src/features/recipes/client/*`
- Timeline pattern: `src/features/timeline/client/*`

## Done Criteria
- No page-level domain `fetch` remains in migrated screen.
- Server reads/mutations flow through TanStack Query hooks.
- UI workflow state flows through Zustand store.
- Query invalidation/setQueryData behavior is explicit and consistent.
- Lint and build pass.
