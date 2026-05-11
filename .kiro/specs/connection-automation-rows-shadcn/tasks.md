# Implementation Plan: Rebuild ConnectionRow & AutomationCard with shadcn

## Overview

Rebuild `ConnectionRow` and `AutomationCard` from CSS Modules to shadcn/Tailwind. Replace the custom expand/collapse, context menus, and toggle with shadcn Collapsible, DropdownMenu, Switch, and StatusBadge primitives while preserving all existing functionality and prop interfaces.

## Tasks

- [x] 1. Rebuild ConnectionRow with shadcn Collapsible and DropdownMenu
  - [x] 1.1 Rewrite ConnectionRow.tsx using shadcn primitives
    - Replace manual expand/collapse state with `Collapsible` / `CollapsibleTrigger` / `CollapsibleContent` from `@/components/ui/collapsible`
    - Use `CollapsibleTrigger asChild` on the header div for accessible keyboard toggle (Enter/Space)
    - Replace custom context menu (absolute div + click-outside listener) with `DropdownMenu` / `DropdownMenuTrigger` / `DropdownMenuContent` / `DropdownMenuItem` from `@/components/ui/dropdown-menu`
    - Use `forceMount` on CollapsibleContent with grid-rows animation (`grid-rows-[0fr]` → `grid-rows-[1fr]`, 300ms transition)
    - Implement chevron rotation with `transition-transform duration-200` and `rotate-90` when expanded
    - Use `CaretRight` from Phosphor for the chevron icon
    - Apply `stopPropagation` on DropdownMenuTrigger button to prevent expand/collapse toggle
    - Conditionally hide "Add Automation" menu item when connection status is "error"
    - Disable "Delete Connection" with `disabled` prop when `connectors.length > 0`, add `title` attribute explaining constraint
    - Apply destructive styling to "Delete Connection" item (`text-destructive focus:text-destructive focus:bg-destructive/5`)
    - Use Tailwind utilities for all layout: `border border-border rounded-lg p-4 mb-6` for card, `flex items-center justify-between gap-3 min-h-8` for header
    - Centre status text with `absolute left-1/2 -translate-x-1/2`
    - Preserve the same `ConnectionRowProps` interface — no changes to public API
    - Remove `useRef` + `useEffect` click-outside listener, manual `role="button"` / `tabIndex` / `onKeyDown`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 6.1, 6.2, 6.3, 8.1, 8.4, 8.5_

  - [x] 1.2 Delete ConnectionRow.module.css
    - Remove the CSS Module file — all styles are now Tailwind utilities
    - _Requirements: 7.1_

- [x] 2. Rebuild AutomationCard with shadcn Switch, DropdownMenu, and StatusBadge
  - [x] 2.1 Rewrite AutomationCard.tsx using shadcn primitives
    - Replace custom context menu with `DropdownMenu` / `DropdownMenuTrigger` / `DropdownMenuContent` / `DropdownMenuItem`
    - Replace `Toggle` import from `../shared/Toggle` with `Switch` from `@/components/ui/switch`
    - Replace custom `.lastRunBadge` pill with `StatusBadge` from `@/components/composed/status-badge`
    - Use CSS Grid layout via Tailwind: `grid grid-cols-[1fr_1fr_1fr_auto] items-center px-4 py-2 min-h-11`
    - Apply card styling: `bg-background border border-border rounded-md shadow-sm`
    - Apply hover state: `hover:shadow-md hover:border-primary`
    - Apply focus-visible: `focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2`
    - Apply paused state: `bg-secondary border-border shadow-none opacity-60`
    - Wrap Switch in `<div onClick={(e) => e.stopPropagation()}>` to prevent row click
    - Apply `stopPropagation` on DropdownMenuTrigger button to prevent `onViewSettings` invocation
    - DropdownMenu items: "Automation Settings", "Edit Automation", "Activity Log", "History", separator, "Delete Automation" (destructive)
    - Use `DropdownMenuSeparator` before the Delete item
    - Style menu items: `gap-2.5 px-2.5 py-2 text-[13px] font-medium rounded-md`
    - Preserve the same `AutomationCardProps` interface — no changes to public API
    - Remove `useState` for `menuOpen` + `menuPos`, `useRef` for `buttonRef` + `menuRef`, `useEffect` click-outside, `createPortal`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5, 8.2, 8.3, 8.5_

  - [x] 2.2 Delete AutomationCard.module.css
    - Remove the CSS Module file — all styles are now Tailwind utilities
    - _Requirements: 7.2_

- [x] 3. Delete StatusToggle component (no longer imported)
  - [x] 3.1 Delete StatusToggle.tsx, StatusToggle.module.css, and StatusToggle.test.tsx
    - AutomationCard was the only consumer of StatusToggle — now uses shadcn Switch directly
    - Verify no other imports exist before deleting
    - _Requirements: 7.4_

- [x] 4. Verify build and functionality
  - [x] 4.1 Run build and fix any TypeScript or import errors
    - Run `npm run build` and resolve any issues
    - Ensure no references to deleted CSS Module files remain
    - Ensure no references to `StatusToggle` or old `Toggle` import from AutomationCard
    - Ensure OverflowMenu.tsx and OverflowMenu.module.css are NOT deleted (still used by CampaignFolderCard and JourneyCard)
    - _Requirements: 7.3 (verify OverflowMenu still needed), 8.1, 8.2_

- [x] 5. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- The shadcn `Collapsible` uses Radix UI which provides built-in keyboard handling (Enter/Space toggle) via `CollapsibleTrigger` — removing the need for manual `onKeyDown` handlers.
- The shadcn `DropdownMenu` uses Radix Portal for content rendering, handles focus management, Escape dismissal, and click-outside — removing all manual event listeners and `createPortal` usage.
- The `Switch` component from shadcn uses `checked` + `onCheckedChange` props, replacing the CSS Module checkbox-hack toggle.
- `StatusBadge` from `@/components/composed/status-badge` is a direct replacement for the custom `.lastRunBadge` pill styling.
- The `forceMount` prop on `CollapsibleContent` keeps DOM present for CSS grid-rows animation (Radix unmounts by default which prevents transitions).
- Parent components (`IntegrationsPage`) require no changes since prop interfaces are preserved.
- `OverflowMenu.tsx` is NOT deleted — it's still imported by `CampaignFolderCard` and `JourneyCard`.
- The shared `Toggle` component (`src/components/shared/Toggle.tsx`) may still be used elsewhere — verify before considering deletion in a future spec.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["1.2", "2.2", "3.1"] },
    { "id": 2, "tasks": ["4.1"] }
  ]
}
```
