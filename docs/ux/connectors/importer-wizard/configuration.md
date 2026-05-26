# Configuration Step

> **Type:** Wizard Step (Step 2 or 2+4 for Combined)
> **Parent:** [Importer Wizard](./overview.md)

## Purpose

Set how imported records are matched against existing data, how updates are applied, and whether deduplication runs within the file.

## Layout

Same horizontal two-column layout as File Settings: label column (160px) + input column (552px). Shared component (`ImportConfigStep`) used for both Contact and Transactional configuration — differentiated by `type` prop.

Field groups in order:
1. Update Type (radio group)
2. Blank Values (radio group, conditional)
3. Matching Columns (chip input)
4. Dedupe (toggle + chip input)

## Fields

### Update Type
Radio group with three options:

| Option | Label | Description |
|--------|-------|-------------|
| `append-update` | Append / Update | Add new records and update any that exist |
| `append` | Append | Add new records and ignore any that exist |
| `update` | Update | Ignore new records and update any that exist |

Default: Append / Update

### Blank Values
Radio group with two options (only shown when Update Type ≠ Append):

| Option | Label | Description |
|--------|-------|-------------|
| `preserve` | Preserve Existing Data | Blank values in the file are ignored — existing UbiQuity values preserved |
| `import` | Import Blank Values | Blank values in the file overwrite existing UbiQuity values |

Default: Preserve Existing Data

### Matching Columns
Chip input with dropdown. Defines which columns are used to determine if a record already exists.

- Default chips: Email, Customer ID
- Available options: Email, Customer ID, Phone, First Name, Last Name
- Supports search, add, remove, clear all
- HelpPopover explains matching logic

### Dedupe
Toggle switch + conditional chip input.

- Default: disabled
- When enabled: shows a chip input for selecting which column(s) to deduplicate on
- Deduplication is within-file only — does not check against existing UbiQuity data
- HelpPopover explains scope

## Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| Select update type | Radio click | Updates config, conditionally shows/hides Blank Values |
| Select blank value mode | Radio click | Updates config |
| Add matching column | Chip input dropdown or type | Adds chip |
| Remove matching column | X on chip | Removes chip |
| Clear all columns | X button (clear all) | Removes all chips |
| Toggle dedupe | Switch | Shows/hides dedupe field selector |

## States

- **Default:** Append/Update selected, Preserve selected, Email + Customer ID chips, dedupe off
- **Append selected:** Blank Values section hidden (not relevant when only adding new records)

## Conditional Logic

| Condition | Effect |
|-----------|--------|
| Update Type = Append | Blank Values section hidden |
| Update Type = Append/Update or Update | Blank Values section shown |
| Dedupe enabled | Dedupe field chip input shown |
| Dedupe disabled | Dedupe field chip input hidden |

## Components Used

- HelpPopover
- Switch, Label
- Custom radio buttons (styled circles, not native)
- Custom ChipInput (internal to this component)

## Edge Cases

- Changing Update Type to Append hides Blank Values but preserves the selection (shown again if type changes back)
- Matching Columns can be empty — no minimum enforced in the UI (validation is server-side)
- Dedupe fields are independent of Matching Columns — they can overlap or differ

## Related

- [Importer Wizard Overview](./overview.md)
- [File Settings Step](./file-settings.md)
- [Mapping Step](./mapping.md)
