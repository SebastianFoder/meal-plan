---
name: building-react-components
description: Builds and refactors reusable React/Next.js UI components for this codebase using existing primitives, utility patterns, and API conventions. Use when creating new components, extracting duplicated UI, improving component composition, or wiring forms and interactions in app pages.
---

# Building React Components

## Goal
Create maintainable components that match this repository's existing architecture and style.

## Default Standards
- Prefer composition over one-off page-specific markup.
- Reuse existing primitives first: `Button`, `Input`, `Card`, `Container`.
- Use `cn()` from `src/lib/utils.ts` for class merging.
- Keep server/client boundaries explicit; add `"use client"` only when required.
- Keep props small and typed; avoid optional prop overloads when a variant is cleaner.

## Workflow
1. Check existing components under `src/components/ui` and `src/components/layout`.
2. Identify repeated patterns in page files.
3. Extract into a reusable component with typed props.
4. Keep data-fetching and side effects at feature/page level unless shared.
5. Validate with lint/typecheck after edits.

## Component Authoring Rules
- Prefer function components with explicit prop types.
- Keep UI-only components stateless when possible.
- For variants, use `class-variance-authority` pattern already used in `button.tsx`.
- Keep naming consistent with domain language in this repo (`recipe`, `timeline`, `history`, `stats`).
- Keep text and spacing consistent with existing dark UI.

## Form and Interaction Patterns
- Use controlled inputs in client components.
- Validate payloads in API routes with `zod`; keep route handlers thin.
- Keep optimistic UI optional; default to simple refetch after mutation in this codebase.
- Handle non-OK fetch responses and avoid unguarded `response.json()` on failures.
- For form UIs inside modals/dialogs, include horizontal inner padding so input focus rings and hover highlights are fully visible.

## File Placement
- Shared UI primitive: `src/components/ui/<name>.tsx`
- Layout helper: `src/components/layout/<name>.tsx`
- Feature-specific view logic: `src/app/(app)/...` or `src/features/...`
- Server-side domain logic: `src/features/<feature>/server/...`

## Done Criteria
- Component is reusable, typed, and composable.
- No duplicate Tailwind class blobs across multiple pages.
- Lint and typecheck pass.
- Behavior remains accessible (labels, contrast, focus states).
