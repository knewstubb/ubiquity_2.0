# Implementation Plan: AlertDialog Composed Component

## Overview

Build a composed AlertDialog component with three intent variants (neutral, warning, destructive), wrapping the existing shadcn/Radix primitive. Then refactor six existing ad-hoc dialog implementations to use it. The work is sequenced so the core component is built and tested first, then refactors proceed in parallel, with a final cleanup pass.

## Tasks

- [x] 1. Build the AlertDialogComposed component
  - [x] 1.1 Create the component file
    - Create `src/components/composed/alert-dialog-composed.tsx` exporting `AlertDialogComposed` and `AlertDialogComposedProps`. Wrap Radix primitives (`AlertDialog`, `AlertDialogPortal`, `AlertDialogOverlay`, `AlertDialogContent`, `AlertDialogTitle`, `AlertDialogDescription`). Do NOT use `AlertDialogAction`/`AlertDialogCancel` — use standard `Button` components for custom loading/disabled behaviour.
    - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 9.1, 9.2, 9.3, 9.4_
  - [x] 1.2 Implement intent variant styling
    - Apply conditional classes via `cn()`: no top border for neutral, `border-t-4 border-t-warning` for warning, `border-t-4 border-t-destructive` for destructive. Render Phosphor `Warning` icon (size 20, weight fill, `text-warning`) inline with title only for warning intent. Map confirm button variant: `default` for neutral, `secondary` for warning, `destructive` for destructive.
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 3.5, 3.6_
  - [x] 1.3 Implement dialog layout
    - Header: flex row with title (text-base font-semibold) and close X button (Phosphor `X` icon, top-right). Body: `children` wrapped in `AlertDialogDescription asChild`. Footer: flex row, justify-end, gap-3, Cancel button (secondary variant) + Confirm button. Max width `max-w-[460px]` on content. Padding: `px-6 pt-6` header, `px-6 py-4` body, `px-6 py-4 border-t border-border` footer.
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [x] 1.4 Implement async loading state
    - Internal `isLoading` state. When `onConfirm()` returns a Promise, set `isLoading = true`, await it, set `isLoading = false` in `finally`. During loading: show inline SVG spinner (`animate-spin h-4 w-4`) in confirm button, change label to `loadingLabel` (or keep `confirmLabel`), disable both buttons, prevent Escape (`onEscapeKeyDown` → `preventDefault`) and overlay click (`onInteractOutside` → `preventDefault`).
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 9.5_
  - [x] 1.5 Implement type-to-confirm input
    - Internal `inputValue` state. When `requiresInput` is set AND `intent === 'destructive'`, render instruction text ("Type {requiresInput} to confirm") and an `Input` component. Confirm button disabled until `inputValue === requiresInput`. Reset `inputValue` to `''` via `useEffect` when `open` changes to `false`. Ignore `requiresInput` for non-destructive intents.
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 2. Update the AlertDialogDemo and registry entry
  - [x] 2.1 Rewrite AlertDialogDemo
    - Replace `src/pages/component-demos/AlertDialogDemo.tsx` with a new implementation that renders a trigger button opening `AlertDialogComposed`. All props driven by the controls panel values. When `loading` control is true, `onConfirm` returns `new Promise(resolve => setTimeout(resolve, 2000))`. Trigger button label reflects current intent.
    - _Requirements: 8.1, 8.2, 8.4_
  - [x] 2.2 Update componentRegistry entry
    - Update the existing `AlertDialog` entry in `src/data/componentRegistry.tsx`: new `description` ("Confirmation dialog with neutral, warning, and destructive intent variants."), `usesComponents: ['Button', 'Input']`, and full `propControls` array with intent select, title text, body textarea, confirm-label text, cancel-label text, requires-input toggle, input-text (visibleWhen requires-input true), loading toggle, loading-label (visibleWhen loading true).
    - _Requirements: 8.3_

- [x] 3. Write unit and property-based tests
  - [x] 3.1 Create unit test file
    - Create `src/__tests__/alert-dialog-composed.test.tsx` with 12 tests: renders title/body per intent, neutral has no border accent, warning shows amber border + icon, destructive shows red border, confirm disabled when input required and empty, confirm enabled when input matches, loading state shows spinner and disables buttons, loading label shown during loading, input resets on close, cancel calls onCancel + onOpenChange, close X calls onOpenChange(false), escape suppressed during loading.
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3_
  - [x] 3.2 Create property-based test file
    - Create `src/__tests__/alert-dialog-input-guard.property.test.ts` with 2 fast-check property tests: (1) for any string R and any string I where I !== R, confirm is disabled; (2) for any non-empty string R, typing exactly R enables confirm.
    - _Requirements: 5.2_

- [x] 4. Refactor DeleteConfirmModal (dashboard)
  - [x] 4.1 Rewrite DeleteConfirmModal using AlertDialogComposed
    - Rewrite `src/components/dashboard/DeleteConfirmModal.tsx` to render `AlertDialogComposed` with `intent="destructive"`, `requiresInput="DELETE"`, `inputPlaceholder="Type DELETE here"`. Title: "Delete {objectType}?" (sentence case). Body: bold object name + "will be deleted" message. Confirm label: "Delete {objectType}". Keep the same component interface (`DeleteConfirmModalProps`) for backward compatibility. Add `open` prop if not already present.
    - _Requirements: 7.1_

- [x] 5. Refactor DeleteConfirmDialog (campaign)
  - [x] 5.1 Rewrite DeleteConfirmDialog using AlertDialogComposed
    - Rewrite `src/components/campaign/DeleteConfirmDialog.tsx` to render `AlertDialogComposed` with `intent="destructive"`. No `requiresInput`. Title: "Delete {itemType}" (sentence case, e.g. "Delete campaign"). Body: "Are you sure you want to delete {itemName}? This action cannot be undone." Confirm label: "Delete". Add `open` and `onOpenChange` props for controlled state.
    - _Requirements: 7.2_

- [x] 6. Refactor DashboardPage edit-connection warning
  - [x] 6.1 Replace inline warning markup with AlertDialogComposed
    - In `src/pages/DashboardPage.tsx`, remove the inline `<div>` backdrop + modal markup (lines ~291-315). Replace with `<AlertDialogComposed intent="warning" open={!!pendingEditConnectionId} onOpenChange={...}>`. Title: "Edit connection". Body: "Changes to a connection may affect all linked automations. Proceed only if you understand the impact." Confirm label: "Edit connection". Cancel clears `pendingEditConnectionId`. Confirm sets `editingConnection` and clears `pendingEditConnectionId`.
    - _Requirements: 7.3_

- [x] 7. Refactor ImporterWizardModal dialogs
  - [x] 7.1 Replace discard changes dialog
    - In `src/components/importer/ImporterWizardModal.tsx`, replace the "Discard changes?" `AlertDialog` usage with `AlertDialogComposed` with `intent="neutral"`. Title: "Discard changes?". Body: "You have unsaved changes. Are you sure you want to discard them?" Confirm label: "Discard". Cancel label: "Keep editing". Confirm calls `onClose`.
    - _Requirements: 7.4_
  - [x] 7.2 Replace mapping incomplete alert
    - Replace the "Mapping incomplete" `AlertDialog` usage with `AlertDialogComposed` with `intent="neutral"`. Title: "Mapping incomplete". Body: `{mappingAlertMessage}`. Since this is informational (dismiss only), use confirm label "OK" with `onConfirm` closing the dialog. Consider adding an optional `showCancel?: boolean` prop to `AlertDialogComposed` (defaulting to `true`) to hide the cancel button for single-action dialogs.
    - _Requirements: 7.5_

- [x] 8. Refactor DeleteGroupDialog (permissions)
  - [x] 8.1 Rewrite DeleteGroupDialog using AlertDialogComposed
    - Rewrite `src/components/permissions/DeleteGroupDialog.tsx` to render `AlertDialogComposed` with `intent="destructive"`. Title: "Delete {groupName}". Body: affected user count message (preserve existing conditional logic). Confirm label: "Delete". Keep same interface (`open`, `groupName`, `affectedUserCount`, `onConfirm`, `onCancel`).
    - _Requirements: 7.6_

- [x] 9. Clean up and verify
  - [x] 9.1 Remove deprecated code
    - Check if `src/components/shared/Modal.tsx` has remaining consumers via grep. If none, delete it. Verify all import paths are correct. Run `npx tsc --noEmit` to confirm no type errors.
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  - [x] 9.2 Visual verification
    - Run the app and manually verify each refactored dialog: correct border accent, button variant, spacing, loading state (where applicable), type-to-confirm (where applicable). Verify the demo page shows all three intents correctly with all controls functional.
    - _Requirements: 1.2, 1.3, 1.4, 3.1, 3.2, 3.3, 3.4, 3.5, 8.1, 8.2_

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4", "1.5"] },
    { "id": 1, "tasks": ["2.1", "2.2", "3.1", "3.2", "4.1", "5.1", "6.1", "7.1", "7.2", "8.1"] },
    { "id": 2, "tasks": ["9.1", "9.2"] }
  ]
}
```

Wave 0 builds the core component (all sub-tasks of Task 1). Wave 1 runs in parallel: demo/registry, tests, and all six refactors. Wave 2 is the final cleanup after all refactors land.

## Notes

- The "Mapping incomplete" dialog (Task 7.2) is informational with only a dismiss action. The simplest approach is to add an optional `showCancel?: boolean` prop to `AlertDialogComposed` (defaulting to `true`). This keeps the component API clean while supporting single-button dialogs. If this feels like scope creep, the alternative is to show both buttons where Cancel also dismisses — functionally equivalent.
- The `DeleteConfirmModal` (Task 4) currently depends on a `Modal` component from `../shared/Modal`. After refactoring, this dependency is removed. Task 9 checks whether `Modal` can be deleted entirely.
- All refactored components should preserve their existing public interface (props) for backward compatibility with parent components. Internal implementation changes only.
