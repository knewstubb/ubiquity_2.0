# Loading States

> **Last updated:** 2026-05-21

## Patterns

| Pattern | When to use | Duration |
|---------|-------------|----------|
| Skeleton | Page/section initial load, data tables, card grids | > 300ms |
| Inline spinner | Button actions, form submissions | Any |
| Progress bar | File uploads, multi-step processes with known progress | > 2s |
| Optimistic update | Toggle switches, simple state changes | Instant |

## Skeleton Loading

Used when the layout structure is known but content hasn't arrived yet.

- Skeleton shapes match the content they replace (rectangle for text, circle for avatar, etc.)
- Background: `bg-muted` with subtle pulse animation
- TBD: Whether to use pulse (opacity oscillation) or shimmer (gradient sweep)
- No skeleton for elements smaller than 24px (badges, icons) — they just appear when ready
- Skeleton appears after 300ms delay — if data arrives faster, skip the skeleton entirely

## Inline Spinner

Used inside buttons and small containers during an action.

- Spinner replaces the button icon (or appears before the label if no icon)
- Button text changes to present participle: "Create" → "Creating…"
- Button is disabled during loading
- Size: matches the icon size of the context (16px in buttons, 20px standalone)

## Optimistic Updates

Used when the action is very likely to succeed and the UI can update immediately.

- Toggle switches: flip immediately, revert on error
- Star/favourite: fill immediately, revert on error
- Reordering: move immediately, revert on error
- Always show a toast on failure with "undo" or "retry"

## Design Decisions

1. **No full-page loading screens** — the shell (nav, sidebar, page header) renders immediately. Only the content area shows a skeleton.

2. **300ms delay before showing skeleton** — prevents flash of skeleton on fast connections. If data arrives within 300ms, the user sees nothing → content (no intermediate state).

3. **Buttons disable during actions** — prevents double-submission. Label changes to indicate progress.

4. **No loading text ("Loading…")** — skeletons communicate loading visually. Text-based loading indicators feel dated.

5. **TBD: Skeleton animation style** — pulse vs shimmer not yet decided.
