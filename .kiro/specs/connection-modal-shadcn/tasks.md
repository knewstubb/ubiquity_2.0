# Implementation Plan: Rebuild Connection Modals with shadcn

## Overview

Rebuild `CreateConnectionModal` and `InitialModal` from CSS Modules to shadcn/Tailwind. Replace custom modal chrome, form fields, selects, and card selectors with their shadcn equivalents while preserving all existing functionality.

## Tasks

- [x] 1. Rebuild InitialModal with shadcn Dialog
  - [x] 1.1 Rewrite InitialModal.tsx using shadcn primitives
    - Replace `Modal` wrapper with `Dialog` + `DialogContent` (max-w-[520px])
    - Use `DialogHeader` + `DialogTitle` for the connection name heading
    - Use `DialogFooter` with shadcn `Button` (variant="outline" for Cancel, variant="default" for Next)
    - Replace shared `CardSelector` import with `@/components/composed/card-selector`
    - Replace `TextField` with `Label` + `Input` from `@/components/ui/`
    - Use Tailwind utilities for all layout (`space-y-4`, `flex`, `gap-3`, etc.)
    - Remove manual Escape key handler (Radix Dialog handles this)
    - Preserve the same `InitialModalProps` interface and behaviour
    - Add `DialogDescription` (can be visually hidden) for accessibility

  - [x] 1.2 Delete InitialModal.module.css
    - Remove the CSS Module file — all styles are now Tailwind utilities

- [ ] 2. Rebuild CreateConnectionModal with shadcn Dialog
  - [x] 2.1 Rewrite CreateConnectionModal.tsx using shadcn primitives
    - Replace custom backdrop/dialog with `Dialog` + `DialogContent` (max-w-[560px])
    - Use `DialogHeader` + `DialogTitle` for "Create Connection" / "Edit Connection"
    - Use `DialogFooter` with shadcn `Button` components
    - Replace shared `CardSelector` import with `@/components/composed/card-selector`
    - Replace all `TextField` usages with `Label` + `Input`
    - Replace `<select>` elements with shadcn `Select` / `SelectTrigger` / `SelectContent` / `SelectItem`
    - Replace `<textarea>` with shadcn `Textarea`
    - Replace SFTP auth toggle buttons with `ToggleGroup` + `ToggleGroupItem`
    - Use Tailwind utilities for all layout and spacing
    - Remove manual `keydown` Escape listener (Radix handles it)
    - Preserve all state logic, multi-step wizard, test connection, and edit mode
    - Preserve the same `CreateConnectionModalProps` interface
    - Add `DialogDescription` (visually hidden) for accessibility

  - [x] 2.2 Delete CreateConnectionModal.module.css
    - Remove the CSS Module file — all styles are now Tailwind utilities

- [x] 3. Verify build and functionality
  - [x] 3.1 Run build and fix any TypeScript or import errors
    - Run `npm run build` and resolve any issues
    - Ensure no references to deleted CSS Module files remain
    - Ensure no references to the old shared `CardSelector` or `TextField` from these modals

## Notes

- The shadcn `Dialog` component uses Radix UI primitives which provide built-in focus trapping, Escape key handling, and overlay click-to-close — removing the need for manual event listeners.
- The `CardSelector` at `@/components/composed/card-selector` has the same props interface as the old shared one, so it's a direct import swap.
- The `Select` component from shadcn uses a different API than native `<select>` — it uses `onValueChange` instead of `onChange` with `e.target.value`.
- Parent components that render these modals should not need any changes since the prop interfaces are preserved.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["2.2"] },
    { "id": 3, "tasks": ["3.1"] }
  ]
}
```
