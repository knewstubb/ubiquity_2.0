---
inclusion: always
---

# UbiQuity Interactive Design Prototype

## What This Is

This is an interactive design prototype for UbiQuity 2.0 — a hybrid CDP/MAP (Customer Data Platform + Marketing Automation Platform) for SMEs. It is NOT production code. It is a functional prototype used to:

- Simulate user workflows end-to-end so stakeholders can experience the product before development
- Validate UX/UI decisions with real interactions, not static mockups
- Generate a living design system that feeds back into the Figma component library
- Serve as a reference implementation for the development team (accessible via git)

## Who Maintains This

The PO and UX/UI designer. This prototype is the bridge between Figma designs and developer handoff.

## How It Should Behave

- Every action a user might perform should be simulatable — buttons should respond, modals should open, forms should accept input, state should persist within a session
- Use realistic sample data (names, emails, dates) not lorem ipsum
- Match the Figma designs as closely as possible — this IS the design spec
- When in doubt, favour simplicity over completeness. This is a small business product.

## Tech Stack

- React 19 + TypeScript + Vite
- CSS Modules (no Tailwind, no CSS-in-JS)
- React Router for page navigation
- Supabase for data persistence and auth (seed data via `npx tsx scripts/seed.ts`)
- Vitest for tests

## Design System

- Typography: Inter
- Icons: Phosphor Icons (https://phosphoricons.com)
- Primary colour: Teal (--color-primary-500: #14B88A)
- Design tokens defined in CSS custom properties
- Segmented buttons use teal TEXT for active state, grey-100 background for inactive
- Card selectors use subtle shadow + grey-50 fill when unselected, teal border + checkmark badge when selected
- Modals are overlays (60vw × 80vh for wizards, smaller for dialogs)
- Scrollbars: 8px thumb, grey-300, 4px inset from edge, 8px border-radius

## The AAA Framework

UbiQuity is built on three equal pillars:
- **Acquire** — Getting data in (forms, imports, connectors, integrations)
- **Analyse** — Making sense of it (reports, dashboards, smart segments)
- **Act** — Doing something with it (journey builder, campaigns, automations)

## Key Design Principles

- Opinionated but flexible — clear path, not infinite options
- Journey-centric creation — content built inside journeys as modal overlays
- Context preservation — modals over navigation, breadcrumbs for return paths
- Progressive disclosure — complexity revealed only when needed
- Quiet interface — every element earns its place

## Confluence References

- North Star vision: https://sparknz.atlassian.net/wiki/spaces/UB/pages/12554043393/North+Star
- Tooltips & Popovers: https://sparknz.atlassian.net/wiki/spaces/UB/pages/12916359178/Tooltips+and+Popovers

## Figma References

- Design System (UDS): https://www.figma.com/design/X09yFfjMsaiph3v71kggQO/UDS?node-id=4-3
- UDS Variables/Tokens: https://www.figma.com/design/X09yFfjMsaiph3v71kggQO/UDS?node-id=4-3&p=f
- Pages: Cover, Icons, Atoms (typography, colours, shadows), Molecules (chips, split buttons, day picker, buttons, text fields, checkboxes, radio buttons, toggles, tags, toasts, nav items, icon buttons, menu items, dropdown menus, account selector, search bar, tab bar, filter bar, page title bar), Patterns, Templates

## UDS Component Tokens (from Figma Molecules)

### Page Title Bar
- Title: 24px Inter SemiBold, rgb(24, 24, 27)
- Status pills: 9999px radius, 3px 8px padding, 0.5px border
  - Active: bg rgb(230, 249, 245), border rgb(20, 184, 138)
  - Invited: bg rgb(239, 246, 255), border rgb(59, 130, 246)
  - Inactive: bg rgb(244, 244, 245), border rgb(212, 212, 216)
- Actions gap: 8px
- Title-to-actions spacer: flex

### Filter Bar
- Search: bg rgb(244, 244, 245), 8px radius, 0.5px border rgb(228, 228, 231), padding 8px 10px
- Filter buttons: bg white, 8px radius, 0.5px inset border rgb(228, 228, 231), padding 6px 12px, gap 6px
- Filter label: 12px Inter SemiBold, rgb(113, 113, 122)
- View toggles: 7px padding, 8px radius, active bg rgb(244, 244, 245)
- Bar gap: 8px

### Tab Bar
- Tab padding: 10px 14px
- Active tab: 2px bottom border rgb(24, 24, 27), text rgb(24, 24, 27)
- Default tab: no border, text rgb(113, 113, 122)
- Count badge: 9999px radius, 1px 6px padding
  - Active: bg rgb(24, 24, 27), text white
  - Default: bg rgb(244, 244, 245), text zinc
- Tab font: 12px Inter, ~15px line height

### Buttons (from UDS)
- Primary: bg rgb(20, 184, 138), 8px radius, padding 8px 16px (medium) or 8px 10px (with icon)
- Secondary: bg white, 0.5px border rgb(228, 228, 231), 8px radius, padding 6px 12px
- Button text: 12px Inter SemiBold
- Icon + text gap: 6–10px
- Hover: opacity 0.8
- Click: scale(0.95)

### Menu Items
- Divider: 1px solid rgb(228, 228, 231)

## Design Tokens (from Figma Atoms)

### Typography (Inter)

| Token | Size | Line Height | Weight |
|---|---|---|---|
| Display L | 48px | ~58px | Bold |
| Display M | 36px | ~44px | Bold |
| Heading H1 | 30px | ~36px | SemiBold |
| Heading H2 | 24px | ~29px | SemiBold |
| Heading H3 | 20px | ~24px | SemiBold |
| Heading H4 | 18px | ~22px | SemiBold |
| Heading H5 | 16px | ~19px | SemiBold |
| Body L | 18px | ~22px | Regular |
| Body Base | 16px | ~19px | Regular |
| Body S | 14px | ~17px | Regular |
| Body XS | 12px | ~15px | Regular |
| Body XXS | 10px | ~12px | Medium |
| Button Standard | 16px | 16px | SemiBold |
| Button Small | 14px | 14px | Bold |

### Colours (from Figma)

| Name | Value | Usage |
|---|---|---|
| Primary (Success) | rgb(20, 184, 138) | #14B88A — teal, primary actions |
| Warning | rgb(245, 158, 11) | #F59E0B — amber |
| Error | rgb(239, 68, 68) | #EF4444 — red |
| Info | rgb(56, 189, 248) | #38BDF8 — sky blue |
| Text Primary | rgb(39, 39, 42) | #27272A — zinc-800 |
| Text Secondary | rgb(82, 82, 91) | #52525B — zinc-600 |
| Text Muted | rgb(161, 161, 170) | #A1A1AA — zinc-400 |
| Surface | rgb(244, 244, 245) | #F4F4F5 — zinc-100 |
| Background | rgb(250, 250, 250) | #FAFAFA — zinc-50 |
| Border | rgb(228, 228, 231) | #E4E4E7 — zinc-200 |

### Shadows

| Name | Value |
|---|---|
| Drop Shadow S | 0px 2px 3px rgba(0,0,0,0.05), border 1px solid #E4E4E7 |
| Drop Shadow M | 0px 3px 4px -1px rgba(0,0,0,0.08), border 1px solid #E4E4E7 |
| Drop Shadow L | 0px 7px 10px -3px rgba(0,0,0,0.08), border 1px solid #E4E4E7 |
| Drop Shadow XL | 0px 15px 20px -5px rgba(0,0,0,0.08), border 1px solid #E4E4E7 |

### Border Radius

- Default: 4px
- Components use 4px radius consistently


## When to Include Additional Context

- Working on UI/interactions → add `#ux-decisions`
- Starting a new feature spec → add `#research-references`
- Touching token values → add `#design-tokens`
