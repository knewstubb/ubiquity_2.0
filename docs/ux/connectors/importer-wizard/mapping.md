# Mapping Step

> **Type:** Wizard Step (Step 3 or 3+5 for Combined)
> **Parent:** [Importer Wizard](./overview.md)

## Purpose

Map columns from the uploaded CSV file to columns in the UbiQuity database, set import defaults for unmapped fields, and (for transactional imports) define lookup mappings to link transactions to contacts.

## Layout

### Lookup Mapping (transactional only)
Shown above the main mapping table. A bordered card with:
- Header row: "File Column" | "Contact Table Column" | remove button
- Editable rows with two Combobox dropdowns each
- "+ Add Lookup Field" button at bottom

### Database Mapping
A bordered table with 5-column grid:
- **Columns from File** | arrow | **Columns in Ubiquity** | equals | **Example Values**
- Each row: source field name → Combobox dropdown → example value or warning
- Import Default rows appear below regular rows (with "Import Default" badge)
- "+ Set import default" button at bottom

## Fields

### Lookup Mapping (transactional only)
- **File Column** — Combobox populated from CSV headers
- **Contact Table Column** — Combobox with options: Email, Customer ID, Phone, External ID, Account Number
- At least one complete mapping required before Next

### Database Mapping
- **Source field** — read-only, from CSV headers
- **Target field** — Combobox with UbiQuity schema fields + "[[Ignore Column]]" option
- **Example value** — read-only, first row value from CSV
- Auto-mapping runs on initial load (fuzzy name matching)

### Import Defaults
- Added via the Set Import Default sub-modal
- Shows as a row with "Import Default" badge in source column
- Can be removed with X button

## Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| Change target field | Combobox selection | Updates mapping, recalculates duplicate warnings |
| Add lookup row | "+ Add Lookup Field" | Adds empty row to lookup section |
| Remove lookup row | X button on row | Removes row (minimum 1 row always shown) |
| Set import default | "+ Set import default" button | Opens SetImportDefaultModal |
| Remove import default | X button on default row | Removes the default |
| Go to File Settings | Link in empty state | Navigates to step 1 |

## States

- **Default (file uploaded):** Auto-mapped rows shown, unmatched rows show "no match found" warning
- **Empty (edit mode, no file):** Empty state with upload icon, message "Upload a new file to remap fields", and "Go to File Settings" link
- **Duplicate mapping:** Red text on source field, red warning icon + "Duplicate mapping" text in example column, Combobox shows error state
- **No match:** Yellow warning icon + "No match found" in example column, Combobox shows warning state

## Conditional Logic

| Condition | Effect |
|-----------|--------|
| Type = transactional | Lookup Mapping section shown above Database Mapping |
| Type = contact | Lookup Mapping section hidden |
| No CSV headers (edit mode) | Empty state shown instead of mapping table |
| Target = "[[Ignore Column]]" | Example value shows "—" |
| Same target mapped twice | Both rows show duplicate warning |
| Next clicked with incomplete lookup (transactional) | Alert dialog: "At least one Lookup Mapping is required" |
| Next clicked with duplicate targets (transactional) | Alert dialog: "Duplicate field mapping detected" |

## Auto-Mapping Logic

On initial load (when CSV headers are first available), the system attempts to match headers to target fields:
- Normalises both sides (lowercase, strip separators)
- Uses an alias map for common variations (e.g. "email" → "email_address", "custid" → "customer_id")
- Each target field used at most once
- Unmatched headers show "no match found" warning

## Components Used

- Combobox (target field selection, lookup field selection)
- Badge ("Import Default" indicator)
- Button ("+ Add Lookup Field", "+ Set import default")
- HelpPopover (lookup mapping explanation)
- WarningCircle icon (duplicate/no-match indicators)

## Edge Cases

- Auto-mapping only runs once on initial CSV load — subsequent changes are manual
- Replacing the CSV file on step 1 clears ALL mappings (contact + transactional + lookup + defaults)
- Duplicate detection is real-time — warnings appear/disappear as selections change
- "[[Ignore Column]]" is not counted as a duplicate (multiple columns can be ignored)
- Lookup mapping minimum 1 row — the remove button is hidden when only 1 row exists

## Related

- [Importer Wizard Overview](./overview.md)
- [Configuration Step](./configuration.md)
- [Set Import Default Modal](./set-import-default-modal.md)
- [Notifications Step](./notifications.md)
