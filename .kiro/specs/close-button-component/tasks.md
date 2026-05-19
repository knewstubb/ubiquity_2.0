# Implementation Plan: CloseButton Component

## Overview

Create a reusable `CloseButton` component using CVA for size variants and `@radix-ui/react-slot` for `asChild` composition, then migrate all existing inline close button implementations across the codebase to use it.

## Tasks

- [x] 1. Create the CloseButton component
  - [x] 1.1 Create `src/components/ui/close-button.tsx` with CVA variants, forwardRef, and asChild support
    - Define `closeButtonVariants` with base classes and size variants (xs, sm, default, lg)
    - Define `iconSizeMap` lookup for Phosphor X icon sizes
    - Implement `CloseButton` using `React.forwardRef` with `Slot`/`button` toggle via `asChild`
    - Include `<X>` icon and `<span className="sr-only">Close</span>` inside the component
    - Export `CloseButton`, `closeButtonVariants`, and `CloseButtonProps`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 6.1, 6.2, 6.3_

  - [x] 1.2 Write property tests for CloseButton CVA variants
    - **Property 1: Base classes are always present** — for any valid size value, output always contains base classes
    - **Property 2: Size variant omission equals default** — no size arg produces same output as `size: "default"`
    - **Property 3: Custom className merges without overriding** — arbitrary className is present alongside base/variant classes
    - **Validates: Requirements 1.2, 1.3, 1.4, 2.5, 4.1**

  - [x] 1.3 Write unit tests for CloseButton rendering and accessibility
    - Test that the component renders a button element with X icon and sr-only "Close" text
    - Test that `asChild` renders via Slot instead of native button
    - Test that `aria-label` prop overrides the default accessible name
    - Test that `onClick`, `disabled`, and other HTML attributes are forwarded
    - Test that `ref` is forwarded to the underlying element
    - **Property 4: HTML attributes are forwarded**
    - **Property 5: Accessible name is always present**
    - **Validates: Requirements 3.1, 3.2, 3.3, 4.2, 4.3, 6.1, 6.2, 6.3**

- [x] 2. Checkpoint - Verify component in isolation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Migrate Radix asChild pattern files
  - [x] 3.1 Migrate `src/components/ui/sheet.tsx` to use CloseButton with asChild
    - Replace inline `<SheetPrimitive.Close>` with `<CloseButton asChild className="absolute right-4 top-4"><SheetPrimitive.Close /></CloseButton>`
    - Remove the inline X icon and sr-only span
    - _Requirements: 5.1_

  - [x] 3.2 Migrate `src/components/ui/alert-dialog-composed.tsx` (if using Radix close primitive)
    - Replace inline close button markup with `<CloseButton>` using appropriate pattern
    - _Requirements: 5.2_

- [x] 4. Migrate standalone button pattern files (batch 1)
  - [x] 4.1 Migrate `modal-header` component
    - Replace inline close button with `<CloseButton size="sm" onClick={onClose} />`
    - _Requirements: 5.2_

  - [x] 4.2 Migrate `WizardModal` and `ImporterWizardModal`
    - Replace inline close buttons with `<CloseButton>` using appropriate size and positioning
    - _Requirements: 5.2_

  - [x] 4.3 Migrate `AssetDetailPanel` and `InspectorPanel`
    - Replace inline close buttons with `<CloseButton>` using appropriate size and positioning
    - _Requirements: 5.2_

  - [x] 4.4 Migrate `ActivityLogModal`, `HistoryModal`, and `ContentModal`
    - Replace inline close buttons with `<CloseButton>` using appropriate size and positioning
    - _Requirements: 5.2_

- [x] 5. Checkpoint - Verify batch 1 migrations
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Migrate standalone button pattern files (batch 2)
  - [x] 6.1 Migrate `CreateConnectionModal` and `ChangePasswordModal`
    - Replace inline close buttons with `<CloseButton>` using appropriate size and positioning
    - _Requirements: 5.2_

  - [x] 6.2 Migrate `ChangelogBanner` and `WhatsNewPanel`
    - Replace inline close buttons with `<CloseButton>` using appropriate size and positioning
    - _Requirements: 5.2_

  - [x] 6.3 Migrate `PermissionEditPanel` and `FeedbackWidget`
    - Replace inline close buttons with `<CloseButton>` using appropriate size and positioning
    - _Requirements: 5.2_

  - [x] 6.4 Migrate `FeatureFlagsModal` and `ValidationSummary`
    - Replace inline close buttons with `<CloseButton>` using appropriate size and positioning
    - _Requirements: 5.2_

- [x] 7. Final checkpoint - Full verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The component follows the exact same pattern as `src/components/ui/button.tsx` (CVA + forwardRef + Slot)
- Migration tasks are batched to allow incremental verification
- Each migration should match the size variant to the existing icon/container dimensions
- Property tests validate the CVA function output; unit tests validate rendered DOM behaviour

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["3.1", "3.2"] },
    { "id": 3, "tasks": ["4.1", "4.2", "4.3", "4.4"] },
    { "id": 4, "tasks": ["6.1", "6.2", "6.3", "6.4"] }
  ]
}
```
