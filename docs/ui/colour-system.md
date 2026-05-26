# Colour System

> **Last updated:** 2026-05-21
> **Token source:** `src/styles/globals.css`

## Philosophy

UbiQuity uses a quiet, neutral-first palette. The interface stays out of the way — zinc greys for structure, with teal (mint-500 `#14B88A`) as the single accent colour for primary actions and active states. Colour is used sparingly and intentionally.

## Palette Structure

### Neutral (Zinc scale)
The backbone of the interface. Used for text, borders, backgrounds, and disabled states.

- **zinc-50 `#FAFAFA`** — App background (light mode)
- **zinc-100 `#F4F4F5`** — Secondary surfaces, muted fills
- **zinc-200 `#E4E4E7`** — Borders, dividers
- **zinc-300 `#D4D4D8`** — Input borders, stronger dividers
- **zinc-400 `#A1A1AA`** — Muted text, placeholders
- **zinc-500 `#71717A`** — Helper text, timestamps
- **zinc-600 `#52525B`** — Secondary text
- **zinc-800 `#27272A`** — Primary text, headings
- **zinc-900 `#18181B`** — Dark mode background

### Primary (Mint/Teal)
One colour for all primary actions. No secondary brand colours.

- **mint-50 `#E6F9F5`** — Accent backgrounds, selected row highlights
- **mint-500 `#14B88A`** — Primary buttons, active indicators, links, focus rings
- **mint-600 `#10A078`** — Accent text on light backgrounds
- **mint-700 `#0D8866`** — Hover state for primary buttons
- **mint-950 `#043D2E`** — Dark mode accent backgrounds

### Semantic Colours
Used exclusively for their meaning — never decoratively.

| Semantic | Colour | Usage |
|----------|--------|-------|
| Success | mint-500 `#14B88A` | Confirmation, completion (same as primary) |
| Warning | amber-500 `#F59E0B` | Caution, attention needed |
| Error | red-500 `#EF4444` | Destructive actions, validation failures |
| Info | sky-500 `#0EA5E9` | Informational banners, help indicators |

## Usage Rules

1. **Primary teal is for actions only** — buttons, links, active states, focus rings. Never use it for decorative backgrounds or large surface areas.
2. **Semantic colours are for meaning** — don't use red for non-error styling, don't use amber for non-warning purposes.
3. **Text hierarchy uses zinc weight, not colour** — differentiate text importance with zinc-800 → zinc-600 → zinc-500 → zinc-400, not with coloured text.
4. **Dark mode inverts surfaces, not brand** — mint-500 stays the same in both modes. Surfaces flip (zinc-50 ↔ zinc-900).
5. **No additional brand colours** — if a new feature needs colour differentiation (charts, tags), use the chart palette, not new brand colours.

## Dark Mode Strategy

Token-based automatic inversion. Every semantic token has a light and dark value defined in `globals.css`. Components use tokens (`bg-primary`, `text-muted-foreground`), never raw hex values.

- Surfaces: light backgrounds become dark, dark text becomes light
- Primary accent: unchanged (mint-500 in both modes)
- Borders: zinc-200 → zinc-700
- Semantic colours: base hue unchanged, subtle backgrounds invert (e.g. red-50 → red-950)

## Full Token Reference

See `docs/design-tokens.md` for the complete token table with light/dark values.
