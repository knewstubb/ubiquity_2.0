# Motion & Transitions

> **Last updated:** 2026-05-21

## Principles

1. **Motion is functional, not decorative** — every animation communicates something (state change, spatial relationship, feedback). No animations for visual flair.
2. **Fast and subtle** — transitions should feel instant but smooth. Users shouldn't wait for animations to complete before they can act.
3. **Consistent timing** — same type of action = same duration everywhere.

## Duration Scale

| Duration | Usage |
|---|---|
| 100ms | Micro-interactions: button press scale, icon swap |
| 150ms | State changes: hover backgrounds, border colour changes, opacity shifts |
| 200ms | Component transitions: dropdown open, tooltip appear, badge change |
| 300ms | Layout shifts: accordion expand, panel slide, modal enter |
| 500ms | TBD: Complex orchestrated animations (if ever needed) |

## Easing

| Curve | Usage |
|---|---|
| `ease-out` | Elements entering (dropdown opening, modal appearing) |
| `ease-in` | Elements exiting (dropdown closing, modal dismissing) |
| `ease-in-out` | Layout shifts (accordion, panel resize) |
| `linear` | Progress bars, loading indicators |

## Standard Patterns

### Button press
- `transform: scale(0.95)` on `:active`
- Duration: 100ms
- No easing (instant snap)

### Hover state
- Background colour transition: 150ms ease-out
- No transform on hover (only on press)

### Dropdown/Popover
- Enter: 200ms ease-out, opacity 0→1 + translateY(-4px→0)
- Exit: 150ms ease-in, opacity 1→0

### Modal
- Enter: 300ms ease-out, overlay fade + content scale(0.95→1)
- Exit: 200ms ease-in, reverse

### Accordion/Collapsible
- Expand: 300ms ease-in-out, height auto
- Collapse: 200ms ease-in-out

### Toggle/Switch
- Thumb slide: 200ms ease-in-out

## What NOT to Animate

- Page navigations (instant, no page transitions)
- Table row reordering
- Form field appearance (fields are always visible or hidden, no fade-in)
- Scrolling (native browser behaviour only)
- TBD: Whether skeleton loaders should pulse or shimmer
