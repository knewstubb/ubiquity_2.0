# Requirements Document

## Introduction

Build a single composed `AlertDialog` component with three intent variants (neutral, warning, destructive) that consolidates all confirmation dialogs across the UbiQuity prototype into one consistent, accessible pattern. The component wraps the existing shadcn/Radix AlertDialog primitive and adds intent-based styling, async loading states, and an optional type-to-confirm input guard.

Six existing ad-hoc dialog implementations will be refactored to use this new component, eliminating duplicated modal markup and ensuring visual consistency across all confirmation flows.

## Glossary

- **AlertDialogComposed**: The new composed component at `src/components/composed/alert-dialog-composed.tsx` that provides a unified confirmation dialog API
- **Intent**: The visual variant of the dialog — neutral, warning, or destructive — which determines border accent, button variant, and optional icon
- **Type-to-confirm**: A safety mechanism for destructive actions where the user must type a specific string (e.g. "DELETE") before the confirm button becomes enabled
- **Loading_State**: The state entered when `onConfirm` returns a Promise — spinner shown in confirm button, both buttons disabled, dialog cannot be dismissed
- **Border_Accent**: A 4px top border on the dialog content — amber for warning intent, red for destructive intent, absent for neutral intent
- **Sentence_Case**: Capitalisation rule where only the first word is capitalised (e.g. "Delete connection" not "Delete Connection")

## Requirements

### Requirement 1: Intent variants

**User Story:** As a designer, I want confirmation dialogs to visually communicate the severity of the action, so that users can distinguish between routine confirmations, cautionary warnings, and irreversible destructive actions.

#### Acceptance Criteria

1. THE AlertDialogComposed SHALL support an `intent` prop with values `'neutral'`, `'warning'`, and `'destructive'`
2. WHEN intent is `'neutral'`, THE dialog SHALL render with no top border accent and a teal primary confirm button
3. WHEN intent is `'warning'`, THE dialog SHALL render with a 4px amber top Border_Accent, a Phosphor Warning icon inline with the title, and a secondary (dark foreground) confirm button
4. WHEN intent is `'destructive'`, THE dialog SHALL render with a 4px red top Border_Accent and a red destructive confirm button
5. THE Warning icon SHALL only render when intent is `'warning'`

### Requirement 2: Component API

**User Story:** As a developer, I want a clear, typed API for the AlertDialog component, so that I can use it consistently across the app without guessing prop behaviour.

#### Acceptance Criteria

1. THE AlertDialogComposed SHALL accept `open: boolean` and `onOpenChange: (open: boolean) => void` for controlled state
2. THE AlertDialogComposed SHALL accept `title: string` rendered as the dialog heading
3. THE AlertDialogComposed SHALL accept `children: ReactNode` rendered as the dialog body content
4. THE AlertDialogComposed SHALL accept `confirmLabel: string` for the primary action button text
5. THE AlertDialogComposed SHALL accept `cancelLabel?: string` defaulting to "Cancel"
6. THE AlertDialogComposed SHALL accept `onConfirm: () => void | Promise<void>` as the primary action callback
7. THE AlertDialogComposed SHALL accept `onCancel?: () => void` called when the user cancels
8. THE AlertDialogComposed SHALL accept `requiresInput?: string` for type-to-confirm (destructive only)
9. THE AlertDialogComposed SHALL accept `inputPlaceholder?: string` for the confirmation input placeholder
10. THE AlertDialogComposed SHALL accept `loadingLabel?: string` shown on the confirm button during async loading

### Requirement 3: Visual layout

**User Story:** As a user, I want confirmation dialogs to have a clear, consistent layout, so that I can quickly understand what action I am confirming.

#### Acceptance Criteria

1. THE dialog content SHALL have a maximum width of 460px
2. THE dialog header SHALL contain the title and a close X button positioned top-right
3. THE dialog body SHALL render the `children` content between header and footer
4. THE dialog footer SHALL contain right-aligned buttons: Cancel (secondary variant) followed by the primary action button
5. THE title SHALL use text-base font-semibold styling in Sentence_Case
6. WHEN intent is `'warning'`, THE Phosphor Warning icon SHALL render inline with the title text, sized at 20px, in amber colour

### Requirement 4: Loading state

**User Story:** As a user, I want to see feedback when a destructive action is processing, so that I know the system is working and I cannot accidentally trigger the action twice.

#### Acceptance Criteria

1. WHEN `onConfirm` returns a Promise, THE confirm button SHALL display a spinner animation and change its label to `loadingLabel` (or keep `confirmLabel` if no `loadingLabel` provided)
2. WHILE the Loading_State is active, BOTH the Cancel and Confirm buttons SHALL be disabled
3. WHILE the Loading_State is active, THE dialog SHALL NOT close via Escape key or overlay click
4. WHEN the Promise resolves or rejects, THE Loading_State SHALL end and buttons SHALL re-enable

### Requirement 5: Type-to-confirm

**User Story:** As a user performing an irreversible action, I want to be required to type a confirmation word, so that I cannot accidentally delete important data.

#### Acceptance Criteria

1. WHEN `requiresInput` is provided AND intent is `'destructive'`, THE dialog body SHALL render a text input with instructions to type the required string
2. THE confirm button SHALL be disabled until the input value exactly matches the `requiresInput` string (case-sensitive)
3. WHEN the dialog closes and re-opens, THE input value SHALL reset to empty
4. WHEN `requiresInput` is provided but intent is NOT `'destructive'`, THE input SHALL NOT render

### Requirement 6: Sentence case rule

**User Story:** As a designer, I want all dialog text to follow sentence case, so that the UI is consistent with the UbiQuity design system.

#### Acceptance Criteria

1. ALL button labels and headings in the AlertDialogComposed SHALL use Sentence_Case
2. THE demo page SHALL demonstrate sentence case in all example text

### Requirement 7: Refactor existing usages

**User Story:** As a developer, I want all existing confirmation dialogs replaced with the new AlertDialogComposed, so that the codebase has one consistent pattern.

#### Acceptance Criteria

1. THE `DeleteConfirmModal` in `src/components/dashboard/` SHALL be refactored to use AlertDialogComposed with destructive intent and type-to-confirm
2. THE `DeleteConfirmDialog` in `src/components/campaign/` SHALL be refactored to use AlertDialogComposed with destructive intent
3. THE inline edit-connection warning in `src/pages/DashboardPage.tsx` SHALL be refactored to use AlertDialogComposed with warning intent
4. THE discard changes dialog in `src/components/importer/ImporterWizardModal.tsx` SHALL be refactored to use AlertDialogComposed with neutral intent
5. THE mapping incomplete alert in `src/components/importer/ImporterWizardModal.tsx` SHALL be refactored to use AlertDialogComposed with neutral intent
6. THE `DeleteGroupDialog` in `src/components/permissions/` SHALL be refactored to use AlertDialogComposed with destructive intent

### Requirement 8: Demo page

**User Story:** As a designer or developer, I want an interactive demo of the AlertDialog component, so that I can explore all variants and configurations in the component library.

#### Acceptance Criteria

1. THE demo page SHALL exist at `src/pages/component-demos/AlertDialogDemo.tsx`
2. THE demo SHALL provide controls for: intent, title, body text, confirm label, cancel label, requires input (toggle + text), and loading state (toggle)
3. THE demo SHALL be registered in `componentRegistry.tsx` under the "feedback" category
4. THE demo SHALL render a trigger button that opens the AlertDialogComposed with the current control values

### Requirement 9: Technical constraints

**User Story:** As a developer, I want the component to follow existing project conventions, so that it integrates cleanly with the rest of the codebase.

#### Acceptance Criteria

1. THE component SHALL use Tailwind CSS only (no CSS modules, no inline styles)
2. THE component SHALL use Phosphor Icons for the Warning icon and X close icon
3. THE component SHALL build on the shadcn AlertDialog primitive from `src/components/ui/alert-dialog.tsx`
4. THE component SHALL use `cn()` from `src/lib/utils` for conditional class composition
5. THE spinner SHALL use CSS `animate-spin` on an SVG circle matching the button text colour
