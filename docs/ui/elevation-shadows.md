# Elevation & Shadows

> **Last updated:** 2026-05-21

## Shadow Scale

| Level | Value | Usage |
|---|---|---|
| Drop Shadow S | `0px 2px 3px rgba(0,0,0,0.05)` + 1px border | Cards at rest, subtle elevation |
| Drop Shadow M | `0px 3px 4px -1px rgba(0,0,0,0.08)` + 1px border | Hovered cards, dropdown menus |
| Drop Shadow L | `0px 7px 10px -3px rgba(0,0,0,0.08)` + 1px border | Popovers, floating panels |
| Drop Shadow XL | `0px 15px 20px -5px rgba(0,0,0,0.08)` + 1px border | Modals, dialogs |

## Design Decisions

1. **Shadows always include a border** — shadows alone look "floaty" on light backgrounds. Every elevated surface has both a shadow AND a 1px `border-border` to ground it.

2. **Shadows are subtle** — max opacity is 0.08. The interface should feel flat with gentle depth cues, not Material Design-style dramatic elevation.

3. **Only 4 levels** — S (resting cards), M (hover/active), L (floating UI), XL (modals). No in-between levels. If you're reaching for a custom shadow, you're probably using the wrong pattern.

4. **Cards lose shadow when paused/disabled** — reduced-emphasis states (paused automations, disabled cards) drop to no shadow + muted background. Shadow = active/interactive.

5. **Dark mode shadows are invisible** — in dark mode, elevation is communicated through surface colour (lighter = higher) rather than shadows. The shadow values still exist but are imperceptible against dark backgrounds.

## Elevation Hierarchy

```
Background (zinc-50) — ground level
  └── Card (white + Shadow S) — resting content
       └── Hovered card (white + Shadow M) — interactive feedback
            └── Dropdown/Popover (white + Shadow L) — floating UI
                 └── Modal (white + Shadow XL) — overlay
```

## When NOT to Use Shadows

- Table rows — use hover background colour instead
- Nav items — use background colour for active/hover
- Inline panels (grey background boxes) — use `bg-muted` with no shadow
- Badges/chips — flat, no elevation
