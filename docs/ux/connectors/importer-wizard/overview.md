# Importer Wizard

> **Type:** Modal (multi-step wizard)
> **Route/Trigger:** "+ Add Automation" button on Connectors page (with direction = Import), or "Edit Automation" from meatball menu on an import automation card
> **Parent:** [Connectors Page](../connectors-page.md)

## Purpose

Configure how UbiQuity imports files from an external connection into the contact or transactional database.

## Layout

60vw × 80vh modal (min 860px, max 1080px) with two panels:

1. **Left sidebar** (239px, `bg-secondary`) — Importer icon (DownloadSimple, 56px), title "Importer", connection name subtitle, vertical stepper
2. **Right content area** — Step title + description header, scrollable step content, fixed footer with navigation buttons

## Flow

The wizard has a dynamic number of steps based on the selected data type:

| Data Type | Steps |
|-----------|-------|
| Contacts | File Settings → Contact Configuration → Contact Mapping → Notifications → Review |
| Transactional | File Settings → Transactional Configuration → Transactional Mapping → Notifications → Review |
| Combined | File Settings → Contact Configuration → Contact Mapping → Transactional Configuration → Transactional Mapping → Notifications → Review |

## Navigation

- **Back/Next buttons** in the footer control step progression
- **Stepper clicks** allow jumping to any completed step or backwards — but NOT forward past the current step
- **Next** is disabled until the current step's validation passes
- **Last step** shows "Create Importer" (new) or "Save Changes" (edit, dirty) or "Done" (edit, clean) instead of "Next"

## Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| Create importer | "Create Importer" on Review step | Saves config, closes modal, returns to Connectors page with connection expanded showing new automation card + success toast |
| Save changes | "Save Changes" on Review step (edit mode, dirty) | Saves config, closes modal, success toast |
| Done (no changes) | "Done" on Review step (edit mode, clean) | Closes modal |
| Cancel | Cancel button or close button | If dirty: discard confirmation dialog. If clean: closes immediately. |
| Escape key | Keyboard | Same as Cancel — discard confirmation if dirty, close if clean |
| Change data type | Toggle on File Settings step | Step count recalculates, stepper updates, current step clamped if beyond new range |

## States

- **Default (create):** Step 1 shown, name empty, data type = Contacts, path mode = Automatic
- **Default (edit):** Step 1 shown with fields pre-populated from existing config. CSV headers cleared (must re-upload to remap).
- **Dirty:** Any field changed from initial state. Enables discard confirmation on close.
- **Clean (edit):** No changes made. "Done" button on last step, no discard confirmation.

## Conditional Logic

| Condition | Effect |
|-----------|--------|
| Data type = Contacts | 5 steps (no transactional config/mapping) |
| Data type = Transactional | 5 steps (no contact config/mapping) |
| Data type = Combined | 7 steps (both contact and transactional) |
| Edit mode | CSV headers cleared — mapping step shows empty state until new file uploaded |
| Form dirty + close attempt | Discard confirmation dialog shown |
| Step validation fails | Next button disabled |

## Validation (per step)

| Step | Required |
|------|----------|
| File Settings | Name not empty, data type selected, CSV uploaded (create only) |
| Configuration | Always valid (has defaults) |
| Mapping (transactional) | At least one complete Lookup Mapping, no duplicate target fields |
| Notifications | At least one failure email |
| Review | Always valid |

## Components Used

- AlertDialogComposed (discard confirmation, mapping incomplete alert)
- Stepper (vertical, left sidebar)
- WizardNavButtons (footer navigation)
- CloseButton (top-right)
- All step-specific components (see individual step docs)

## Edge Cases

- Changing data type mid-wizard recalculates steps and clamps current step index
- Edit mode clears CSV headers — user must re-upload to change mappings
- "Done" button appears on last step when editing with no changes (no-op close)
- Escape key respects dirty state — shows confirmation if unsaved changes exist
- File upload max size: 50MB. Show spinner/progress for large files during parsing.

## Related

- [Connectors Page](../connectors-page.md) — parent page
- [File Settings Step](./file-settings.md)
- [Configuration Step](./configuration.md)
- [Mapping Step](./mapping.md)
- [Notifications Step](./notifications.md)
- [Review Step](./review.md)
- [Set Import Default Modal](./set-import-default-modal.md)
