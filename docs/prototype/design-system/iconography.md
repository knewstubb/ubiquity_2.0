# Iconography

> **Last updated:** 2026-05-21
> **Library:** Phosphor Icons (https://phosphoricons.com)
> **Package:** `@phosphor-icons/react`

## Weight Rules

| Weight | Usage |
|---|---|
| Regular (default) | Standard UI icons — nav items, buttons, inline indicators |
| Light | Large decorative icons — empty states, onboarding illustrations (32px+) |
| Bold | TBD: Not currently used. Reserved for future emphasis cases. |
| Fill | Active/selected states — filled heart, filled star, active toggle icons |

## Size Scale

| Size | Usage |
|---|---|
| 14px | Inline with Body XS text, badge icons |
| 16px | Inline with Body S text, button icons, table cell icons |
| 20px | Nav bar icons, standalone action icons |
| 24px | Section header icons, card header icons |
| 32px | Feature icons in cards, chooser modal options |
| 48px | Empty state illustrations, onboarding |

## Design Decisions

1. **Phosphor only** — no mixing icon libraries. Phosphor's consistent stroke width and optical sizing make it work as a unified system.

2. **Regular weight is the default** — Light weight is only for large decorative use (empty states). Using Light at 16px looks too thin and loses clarity.

3. **Icons are never the only affordance** — every icon-only button must have either a tooltip or an aria-label. Meatball menus (DotsThreeVertical) always have a tooltip on hover.

4. **Icon colour follows text colour** — icons inherit the text colour of their context. A muted-foreground label gets a muted-foreground icon. Never colour icons independently unless they're semantic (error red, success green).

5. **No icon rotation or flip for state** — use different icons for different states (e.g. CaretDown → CaretUp) rather than rotating the same icon with CSS.

## Common Icons

| Purpose | Icon |
|---|---|
| Close/dismiss | X |
| Menu/actions | DotsThreeVertical |
| Add/create | Plus |
| Search | MagnifyingGlass |
| Settings | GearSix |
| Navigation caret | CaretDown, CaretRight |
| Back | ArrowLeft |
| External link | ArrowSquareOut |
| Delete | Trash |
| Edit | PencilSimple |
| Import (data in) | ArrowDown / DownloadSimple |
| Export (data out) | ArrowUp / UploadSimple |
| Connection/integration | PlugsConnected |
| User/contact | User, UsersThree |
| Error/warning | Warning, WarningCircle |
| Success/check | Check, CheckCircle |
