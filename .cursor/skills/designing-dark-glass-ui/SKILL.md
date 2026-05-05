---
name: designing-dark-glass-ui
description: Applies this project’s dark, minimal, glassmorphism-inspired design system with consistent spacing, contrast, and subtle motion. Use when designing screens, updating visual hierarchy, improving polish, or creating new UI that should match current app aesthetics.
---

# Designing Dark Glass UI

## Goal
Keep new UI visually consistent with this app's current premium dark style.

## Visual Baseline
- Background: `#0b0b0c`
- Surfaces: `#111113`, `#161618`
- Borders: white alpha (`/10` range)
- Text primary/secondary: white and zinc-muted
- Glass cards: translucent fill + subtle blur + soft border

## Current Project Patterns
- Prefer `Card` for surface containers.
- Use subtle transitions (`duration-200 ease-out`).
- Keep hover states restrained: slight brightness/scale.
- Keep decorative effects low-intensity (noise/gradient should never reduce readability).

## Layout and Rhythm
- Use spacious layouts and predictable gaps.
- Favor consistent spacing scale already present in the codebase.
- Maintain readable line lengths and clear section grouping.
- In grids, guard against overflow issues with `min-w-0` when needed.
- In modals with form fields, keep horizontal inner padding so focus rings/highlights do not look clipped at container edges.

## Motion and Effects
- Motion should be quiet and purposeful.
- No flashy gradients or high-contrast glow effects.
- Keep animations slow and low-amplitude.
- Preserve accessibility: avoid motion-heavy interactions for key actions.

## Charts and Data UI
- Keep chart colors muted and on-brand for dark mode.
- Ensure chart containers have explicit dimensions and safe width constraints.
- Prefer clarity over decoration in analytics panels.

## Review Checklist
- Does the screen look like it belongs in the existing app?
- Is contrast high enough for text and controls?
- Are spacing and alignment consistent across sections?
- Are interactive states visible but subtle?
- Are all visual effects non-distracting?

## Done Criteria
- UI matches existing dark glass style without visual drift.
- Components remain reusable and composable.
- Accessibility and readability are preserved.
