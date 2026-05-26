# Review Step

> **Type:** Wizard Step (last step)
> **Parent:** [Importer Wizard](./overview.md)

## Purpose

Show a read-only summary of the entire importer configuration before the user commits.

## Layout

Vertical stack of summary sections, each with a teal left border (2px `border-primary`). Sections use a two-column grid (160px label + value) for key-value pairs.

Sections shown (conditional on data type):
1. **File Settings** — path mode, folder name, read path, error/archive paths, file pattern, data type
2. **Contact Configuration** (contact/combined) — update type, blank values, matching fields
3. **Contact Mapping** (contact/combined) — source → target field list with count
4. **Transactional Configuration** (transactional/combined) — update type, blank values, matching fields
5. **Transactional Mapping** (transactional/combined) — source → target field list with count
6. **Notifications** — failure emails, success emails (or "Disabled"), no-file emails (or "Disabled")

## Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| Create Importer | Primary button (create mode) | Saves config, closes modal, returns to Connectors page with connection expanded + success toast |
| Save Changes | Primary button (edit mode, dirty) | Saves config, closes modal, success toast |
| Done | Primary button (edit mode, clean) | Closes modal (no-op) |
| Back | Back button | Returns to Notifications step |
| Click stepper step | Stepper item click | Jumps to that step (backwards only) |

## States

- **Default:** All sections shown based on data type, values populated from config
- **Empty mapping:** Section shows "0 fields mapped" (shouldn't normally happen if validation works)

## Conditional Logic

| Condition | Effect |
|-----------|--------|
| Data type = Contact | Contact config + mapping shown, transactional hidden |
| Data type = Transactional | Transactional config + mapping shown, contact hidden |
| Data type = Combined | All sections shown |
| Folder name empty | Field row hidden |
| Read/error/archive paths empty | Field rows hidden |
| File pattern empty | Field row hidden |
| Success disabled | Shows "Disabled" |
| No-file disabled | Shows "Disabled" |

## Components Used

- No interactive components — purely presentational
- Uses semantic text styling (muted labels, medium values, primary arrows for mappings)

## Edge Cases

- Mapping arrows use `→` character with teal colour for target field names
- Field count shown below mapping sections ("3 fields mapped")
- Empty optional fields are hidden rather than showing "—"

## Related

- [Importer Wizard Overview](./overview.md)
- [Notifications Step](./notifications.md)
