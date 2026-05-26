# Borders & Radius

> **Last updated:** 2026-05-21

## Border Radius

| Value | Usage |
|---|---|
| 4px (`rounded`) | Default for all components — inputs, cards, buttons, dropdowns, badges |
| 8px (`rounded-lg`) | Large containers — modals, sheets, page-level cards |
| 9999px (`rounded-full`) | Pills — status badges, avatar circles, toggle thumbs |
| 0px | Table cells, inline elements that sit flush |

## Design Decisions

1. **4px is the default** — not 8px. The interface is dense and professional; larger radii feel too playful for a business tool. 4px gives softness without roundness.

2. **8px only for large containers** — modals, sheets, and page-level card wrappers. These are the "outer shell" of a UI region. Everything inside uses 4px.

3. **9999px is only for pills** — status badges, avatar circles, and toggle switch thumbs. Never for buttons or inputs (those use 4px).

4. **Consistency over context** — a button inside a modal still uses 4px, not 8px to "match" the modal. Components own their own radius regardless of container.

## Border Usage

| Token | Value | Usage |
|---|---|---|
| `--border` | zinc-200 (light) / zinc-700 (dark) | Standard borders — cards, dividers, table lines |
| `--input` | zinc-300 (light) / zinc-600 (dark) | Input field borders (slightly stronger than card borders) |
| `--border-strong` | zinc-300 (light) / zinc-600 (dark) | Section dividers, active borders |
| `--ring` | mint-500 | Focus rings on interactive elements |

## Border Rules

1. **Cards always have a border** — even with a shadow. Border + shadow together.
2. **Inputs have a stronger border than cards** — `--input` (zinc-300) vs `--border` (zinc-200). Inputs need to be clearly delineated as interactive.
3. **Focus ring is always teal** — 2px offset ring using `--ring` (mint-500). Consistent across all interactive elements.
4. **Dividers are full-width** — horizontal dividers span the full width of their container. No inset dividers.
5. **Border on one side only for section breaks** — use `border-b` not `border` when separating sections within a container.
