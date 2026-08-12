# Responsive Strategy

> **Last updated:** 2026-05-21

## Target Devices

UbiQuity is a desktop-first business application. The primary viewport is 1280px–1920px wide.

| Breakpoint | Width | Target |
|---|---|---|
| `sm` | 640px | TBD: Mobile support not yet scoped |
| `md` | 768px | TBD: Tablet support not yet scoped |
| `lg` | 1024px | Minimum supported desktop width |
| `xl` | 1280px | Standard desktop (primary target) |
| `2xl` | 1536px | Large monitors |

## Design Decisions

1. **Desktop-first, not mobile-first** — this is a business tool used at desks. Mobile is a future consideration, not a current constraint.

2. **1024px is the floor** — below this width, the app may not render correctly. No responsive adaptations below 1024px in the current phase.

3. **Content max-width: none** — pages use the full available width. No artificial max-width container. Dense information benefits from horizontal space.

4. **Modals are viewport-relative** — wizard modals are 60vw × 80vh. Dialog modals have a max-width (560px) but no min-width below the breakpoint.

5. **Tables scroll horizontally** — on narrower viewports, data tables get horizontal scroll rather than collapsing columns or switching to card view.

## TBD

- Mobile/tablet responsive strategy (Phase 2+)
- Whether the nav bar collapses to a hamburger below `lg`
- Touch target sizing for potential tablet use
- Whether modals become full-screen sheets on smaller viewports
