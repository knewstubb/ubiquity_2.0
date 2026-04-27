---
inclusion: always
---

# UbiQuity Navigation Structure

The top-level navigation is a single horizontal bar (56px tall) with dropdown menus for sub-pages. There is no secondary sub-navigation bar.

## Primary Navigation (Top Bar)

| Nav Item | Route | Dropdown Sub-items |
|---|---|---|
| Home | `/dashboard` | — |
| Campaigns | `/automations/campaigns` | All Campaigns → `/automations/campaigns`, All Journeys → `/automations/journeys` |
| Audience | — (dropdown only) | Databases → `/audiences/databases`, Segments → `/audiences/segments`, Integrations → `/`, Fields & Config → `/audiences/attributes` |
| Assets | — (dropdown only) | Email Templates → `/content/templates`, Brand → `/content/assets`, Forms & Surveys → `/content/forms`, Media Library → `/content/emails`, SMS & Push Templates → `/content/sms` |
| Reporting | — (dropdown only) | Overview → `/analytics/dashboards`, Campaign Results → `/analytics/reports`, Audience Growth → `/analytics/activity`, Deliverability → `/analytics/billing` |
| Admin | — (dropdown only) | Brand Configuration → `/settings`, Users & Permissions → `/settings/permissions` |

## Right-side Actions

- Search icon button (MagnifyingGlass, Phosphor)
- Settings icon button (GearSix, Phosphor) → `/settings`
- Vertical divider
- Avatar circle ("BK", teal initials on light teal background)

## Dropdown Behaviour

- Click to open/close (not hover)
- Items without sub-items (Home) navigate directly on click
- Clicking a dropdown item navigates and closes the dropdown
- Clicking outside or pressing Escape closes the dropdown
- Opening one dropdown closes any other open dropdown

## Active State

- The primary nav item whose section contains the current route gets teal text + 2px teal bottom border
- Inside a dropdown, the item matching the current route gets teal text

## Section → Route Mapping

| Section | Routes |
|---|---|
| Home | `/dashboard` |
| Campaigns | `/automations/*` |
| Audience | `/audiences/*`, `/` (Integrations) |
| Assets | `/content/*` |
| Reporting | `/analytics/*` |
| Admin | `/settings`, `/settings/*` |

## Implementation Notes

- The nav bar is `AppNavBar` in `src/components/layout/AppNavBar.tsx`
- Uses CSS Modules (`AppNavBar.module.css`), not Tailwind
- Imports `AccountSwitcher` from `./AccountSwitcher`
- Uses Phosphor icons: `MagnifyingGlass`, `GearSix`, `CaretDown`
- Logo: "U" in teal (#14B88A), "biquity" in dark (#18181B), Inter 20px bold
- No sub-navigation bar — all sub-pages are accessed via dropdown menus
