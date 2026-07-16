# Create / Edit Sync Rule

> **Type:** Modal
> **Route/Trigger:** Opened from Account Sync page — "New Sync Rule" button or edit action on existing rule
> **Parent:** Account Sync page (admin)

## Purpose

Lets the user define or edit a sync rule that maps data between two accounts in the hierarchy — specifying source/target, data type, match key, column mappings, and sync behaviour.

## Layout

Fixed-width modal (680px max, 85vh max height) with scrollable body. Follows the **form-rhythm** pattern (see `docs/ui/patterns/form-rhythm.md`).

Sections in order, each separated by `border-t border-border` with `pt-5`:

1. **Source & Target** — two Comboboxes in a 3-column grid (`1fr / arrow / 1fr`)
2. **Data Type** — segmented toggle (Contacts | Transactions), with conditional list selectors
3. **Match Key** — two Comboboxes in the same 3-column grid layout
4. **Column Mapping** — repeating row group with add/remove, badge showing count
5. **Behaviour** — segmented toggle for "on missing" + switch for "trigger on mapped only"

Footer: Cancel (secondaryGhost) + primary action ("Create Rule" or "Save Changes").

## Interactions

| Action | Result |
|---|---|
| Select source/target account | Populates column options for match key and mappings via schema lookup |
| Toggle Contacts / Transactions | Contacts: hides list selectors. Transactions: shows source/target list comboboxes |
| Select source/target list (transactions) | Populates column options from that list's schema |
| Click "Add Column Mapping" | Appends a new empty mapping row |
| Click trash icon on mapping row | Removes that mapping row |
| Toggle "Only trigger when mapped columns change" | Sets `triggerOnMappedOnly` flag |
| Click "Create Rule" / "Save Changes" | Validates, constructs `SyncRule` object, calls `onSave`, closes modal |
| Click Cancel or X | Calls `onClose`, discards changes |

## States

- **Default (create):** All fields empty, primary button disabled until validation passes
- **Default (edit):** Pre-filled from existing `SyncRule` prop, title changes to "Edit Sync Rule"
- **Empty column options:** Comboboxes disabled when no account/list selected yet
- **Validation error:** Inline red text if source === target account
- **Loading:** TBD — no loading state currently implemented; may need one if schemas are fetched async in future
- **Error:** TBD — no error handling for save failures currently

## Conditional Logic

| Condition | Effect |
|---|---|
| `tableType === 'transaction'` | Shows Source List and Target List comboboxes |
| `tableType === 'contact'` | Hides list selectors, columns come from contact schema |
| `sourceAccountId === targetAccountId` | Shows destructive validation message |
| `sourceColumns.length === 0 \|\| targetColumns.length === 0` | "Add Column Mapping" button disabled |
| `!isValid` (missing accounts, match keys, or same account) | Primary action button disabled |
| `isEditing` (rule prop present) | Title = "Edit Sync Rule", button = "Save Changes" |

## Components Used

- `Dialog`, `DialogContent`, `DialogHeader`, `DialogBody`, `DialogFooter`, `DialogTitle` — modal shell
- `Button` — footer actions + add mapping
- `Combobox` — account selectors, list selectors, column pickers
- `Switch` — trigger-on-mapped-only toggle
- `Label` — field labels
- `Badge` (neutral-subtle) — mapped column count
- `cn()` — conditional class composition for segmented toggles

## Edge Cases

- Column options depend on account selection — if account changes after mappings are set, existing mappings may reference stale columns (TBD: should mappings reset on account change?)
- The modal does not currently clear/reset form state between open/close cycles — relies on parent unmounting or key prop (TBD: confirm reset behaviour)
- No duplicate mapping detection — user can map the same source column twice (TBD: should this be prevented?)
- Segmented toggles are custom button groups, not a shared component — consider extracting to library if reused

## Related

- `docs/ui/patterns/form-rhythm.md` — section spacing and field rhythm
- `docs/ui/patterns/empty-states.md` — if column mapping section needs an empty prompt
- Account Sync page (parent) — TBD: create UX doc when page is built
- `src/models/account-sync.ts` — `SyncRule`, `ColumnMapping`, `SyncTableType`, `OnMissingBehaviour` types
- `src/data/account-sync.ts` — `accountSchemas` seed data
