# Spacing & Rhythm

> **Last updated:** 2026-05-21
> **Base unit:** 4px

## Scale

All spacing uses multiples of 4px:

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Icon-to-label gap, tight inline elements |
| `space-2` | 8px | Label-to-input gap, inline element spacing, filter bar gaps |
| `space-3` | 12px | Field-to-field within a section, card internal padding (small) |
| `space-4` | 16px | Standard card padding, section internal spacing |
| `space-5` | 20px | Section-to-section gap (with border separator) |
| `space-6` | 24px | Section-to-section gap (without border), modal body padding |
| `space-8` | 32px | Page-level section gaps |
| `space-10` | 40px | Large section separators |
| `space-12` | 48px | Page top/bottom padding |

## Three-Tier Form Rhythm

All sectioned forms in modals and panels follow this system:

1. **Intra-field** (label → input): 8px (`space-2`)
2. **Inter-field** (field → field within a section): 12px (`space-3`)
3. **Inter-section** (section → section): 20–24px (`space-5` / `space-6`) with visual break

### Section structure:
- General/identity fields at top, separated by `pb-5 border-b border-border`
- Each section wrapped in its own container with internal `space-y-4`
- Section headings: `text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3`
- Headings "own" their fields — tight gap below (12px), larger gap above (20–24px)
- Terminal action rows (e.g. "Test Connection"): `pt-4 border-t border-border`

### Modal body:
- Container: `px-6 py-5` with no uniform `space-y` — sections manage their own gaps
- Footer: `gap-3` between buttons

## Page Layout Spacing

| Context | Spacing |
|---------|---------|
| Page header to content | 24px |
| Between page sections | 32px |
| Card grid gap | 16px |
| Table row height | 48px (minimum) |
| Nav bar height | 56px |
| Breadcrumb to page title | 8px |

## Design Decisions

1. **No uniform `space-y` on form containers** — sections manage their own internal rhythm. A single `space-y` value can't handle the three-tier system.

2. **Borders as section separators** — when two sections are visually distinct, use a `border-b` + padding rather than just whitespace. This makes the hierarchy scannable.

3. **Headings own their content** — a section heading has tight spacing below (it belongs to the fields beneath it) and generous spacing above (it separates from the previous section).

4. **48px minimum touch target** — all clickable rows, buttons, and interactive elements are at least 48px tall for comfortable interaction.
