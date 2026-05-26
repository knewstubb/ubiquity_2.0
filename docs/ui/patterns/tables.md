# Tables & Lists

> **Last updated:** 2026-05-26
> **Status:** Active

## Overview

This document defines the standard patterns for all tabular and list-like data displays in UbiQuity. It covers data tables, card lists, reorderable lists, and key-value lists.

## Component Types

| Type | Use Case | Component |
|------|----------|-----------|
| **Data Table** | Structured columnar data with sorting | `DataTable`, `Table` primitives |
| **Card List** | Rich rows with icons, meta, expandable children | Custom (Card List sandbox pattern) |
| **Reorderable List** | Ordered items with drag-to-reorder | Custom (Reorderable List sandbox pattern) |
| **Key-Value List** | Label–value pairs for settings/metadata | TBD |
| **Tree Table** | Hierarchical data with expand/collapse | `BillingTreeTable` pattern |

---

## Density

All table-like components support three density levels:

| Level | Cell Padding | Approx Row Height | Use Case |
|-------|-------------|-------------------|----------|
| Compact | `py-1.5 px-3` | ~36px | Dense data, field pickers, admin views |
| **Default** | `py-3 px-4` | ~44px | Standard usage everywhere |
| Relaxed | `py-4 px-4` | ~52px | Marketing-facing, low-density views |

**Default is always `default` (py-3 px-4).** Only deviate when the context demands it.

Header cells use slightly tighter vertical padding than body cells:
- Compact: `py-1.5 px-3`
- Default: `py-2.5 px-4`
- Relaxed: `py-3 px-4`

---

## Container Styles

Three container options, used consistently across all table/list types:

| Style | Appearance | When to Use |
|-------|-----------|-------------|
| **Borderless** (default) | No outer border, row dividers only | Most tables — clean, minimal |
| **Bordered** | 1px outer border, rounded-md, row dividers | When the table needs visual containment (e.g. inside a card, modal) |
| **Card** | 1px outer border, rounded-lg, shadow-sm, row dividers | Standalone tables that need elevation (e.g. dashboard widgets) |

```
/* Borderless (default) */
/* No wrapper styles — rows handle their own borders */

/* Bordered */
border border-border rounded-md overflow-hidden

/* Card */
border border-border rounded-lg shadow-sm overflow-hidden
```

---

## Row Borders

- Default: `border-b border-border` on every row, `last:border-b-0` on the final row
- Grid mode (optional): vertical + horizontal borders — use sparingly, only for spreadsheet-like views
- None: remove all borders — only for card-style lists with gap between items

---

## Hover

Standard hover for all interactive rows:

```
hover:bg-secondary cursor-pointer
```

- Use `hover:bg-secondary` (not `bg-secondary/50`) for consistency
- Only apply hover when the row is clickable or selectable
- Non-interactive tables (display-only) should not have row hover

---

## Selection

When rows are selectable (checkbox column):

| State | Style |
|-------|-------|
| Unselected | Default row background |
| Selected | `bg-accent/30` — light teal tint |
| Selected + hover | `bg-accent/40` |

- Checkbox column width: `w-10`
- Use `Checkbox` component with `indeterminate` state for "select all"
- Show a **Bulk Action Bar** below the table when ≥1 row is selected

---

## Selected vs Reorderable Indicator

Two distinct visual patterns — do not mix:

| Pattern | Visual | Meaning |
|---------|--------|---------|
| **Selection** (checkbox) | `bg-accent/30` fill only | "This row is checked" |
| **Reorderable** (drag) | `border-l-[3px] border-l-primary` + `bg-accent/30` | "This item is in the active/ordered set" |

The left teal border is exclusively for reorderable items. Never use it for simple selection.

---

## Sorting

Use Phosphor icons for sort indicators:

| State | Icon | Style |
|-------|------|-------|
| Unsorted | `ArrowsDownUp` | `h-3 w-3 opacity-40` |
| Ascending | `ArrowUp` | `h-3 w-3` |
| Descending | `ArrowDown` | `h-3 w-3` |

- Sort icons sit inline after the column label with `gap-1`
- Sortable headers get `cursor-pointer select-none`
- Click cycles: unsorted → asc → desc → unsorted

---

## Number Columns

All numeric data columns MUST use:

```
tabular-nums text-right
```

- `tabular-nums` ensures digits align vertically (monospace numerals)
- Right-align all number columns for easy scanning
- Currency values: format with locale-appropriate separators

---

## Header Styling

```
font-semibold text-muted-foreground
```

- Headers use muted foreground colour (not full black)
- Font weight: semibold (600)
- Text size matches body cells (inherits from density)
- Sticky headers: `sticky top-0 z-10 bg-background`

---

## Expandable Rows

For tree tables and card lists with nested content:

- Expand indicator: `CaretRight` (Phosphor), 14px, weight bold
- Rotates 90° when expanded: `transition-transform duration-150`
- Nested content animates in: `grid grid-rows-[1fr] opacity-100` / `grid grid-rows-[0fr] opacity-0` with `transition-all duration-300`
- Indent per level: 24px (`paddingLeft: level * 24`)

---

## Drag & Reorder

When items are reorderable:

- Drag handle: `DotsSixVertical` (Phosphor), 16px, weight bold, `text-muted-foreground`
- Dragging item: `opacity-50 shadow-md scale-[1.01]`
- Drop indicator (default): `border-t-2 border-t-primary` on the target row
- Alternative drop indicator: gap (`mt-2` on target) — use for card lists
- Cursor: `cursor-grab` default, `active:cursor-grabbing` while dragging

---

## Empty State

When a table has no data:

```
<div className="text-center py-12 px-6 text-muted-foreground text-base">
  {message}
</div>
```

For richer empty states (with illustration + CTA), follow `docs/ui/patterns/empty-states.md`.

---

## Bulk Action Bar

When ≥1 row is selected, show a contextual action bar:

```
mt-3 flex items-center gap-3 px-4 py-2 bg-accent rounded-md
```

- Selection count: `text-sm font-medium text-primary`
- Clear button: `text-xs text-primary font-medium hover:underline`
- Action buttons: standard Button component, small size

---

## Striped Rows (Optional)

When enabled, alternate rows get a subtle background:

```
bg-muted/30  /* on odd rows */
```

- Off by default — only enable for very dense data where row tracking is difficult
- Do not combine with selection highlight (selection takes precedence)

---

## Design Decisions

1. **Borderless is the default container** — outer borders add visual noise. Only add containment when the table sits inside another container or needs to be visually separated from surrounding content.

2. **`bg-secondary` for hover, not `bg-secondary/50`** — the full secondary colour provides clear feedback without being too heavy. Consistency across all table types.

3. **Phosphor icons for sort, not text arrows** — aligns with the icon system. Text arrows (▲▼) are legacy and should be migrated.

4. **`tabular-nums` is mandatory for numbers** — misaligned digits in columns look broken. This is a hard rule, not a suggestion.

5. **Left border = reorderable, fill = selected** — these are two distinct interaction patterns and must remain visually distinct. Mixing them creates confusion about what the user can do.

6. **44px default row height** — matches the 48px minimum touch target from spacing-rhythm.md when you account for the border. Compact mode (36px) is acceptable for non-touch contexts only.
