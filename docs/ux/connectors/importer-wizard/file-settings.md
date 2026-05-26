# File Settings Step

> **Type:** Wizard Step (Step 1)
> **Parent:** [Importer Wizard](./overview.md)

## Purpose

Configure the importer's name, file location, sample file structure, and destination database.

## Layout

Horizontal two-column layout per field group: label column (160px) on the left, input column (552px) on the right. Groups separated by 32px vertical gap.

Field groups in order:
1. Importer Name
2. File Path (with path mode toggle)
3. Sample CSV (with drag-drop upload)
4. File Pattern (conditional — hidden in Automatic mode)
5. Importing To (data type + database selection)

## Fields

### Importer Name
- Text input, required
- Placeholder: "e.g. Daily Contact Import"
- In Automatic path mode, changing the name auto-syncs the folder name (kebab-case conversion)

### File Path
- **Path Mode toggle** (SegmentedControl): Automatic / Shared / Custom
- Fields shown per mode:

| Field | Automatic | Shared | Custom |
|-------|-----------|--------|--------|
| Folder Name input | Yes | No | No |
| Folders preview box (teal background) | Yes | No | No |
| Read Path (disabled, inherited from connection) | No | Yes | No |
| Read Path (editable) | No | No | Yes |
| Error Folder Path | No | No | Yes |
| Archive Folder Path | No | No | Yes |

- **Automatic mode** shows a preview box listing the three folders that will be created: `{basePath}{folderName}/`, `{basePath}{folderName}/error/`, `{basePath}{folderName}/archive/`
- HelpPopover explains the file lifecycle: found → read path → archive (success) or error (failure)

### Sample CSV
- Drag-and-drop zone (dashed border, 56px height)
- Accepts `.csv` files only, max 50MB
- On upload: parses headers and example values, stores in config
- After upload: shows filename with FileCsv icon and remove (X) button
- **Advanced options** toggle (collapsed by default): delimiter select, encoding select
- Replacing a file clears all existing mappings
- Show spinner/progress indicator for large files during parsing

### File Pattern (conditional)
- **Only shown for Shared and Custom path modes** — hidden in Automatic
- Text input with wildcard support (e.g. `sales-*.csv`)
- Validation: if wildcard used, must have a filename prefix before the `*`
- HelpPopover explains pattern matching with examples
- Must be unique (TBD: enforcement mechanism)

### Importing To
- **Data Type toggle** (SegmentedControl): Contacts / Transactional / Combined
- Contacts preselected by default
- **Contacts Database** (shown for Contact and Combined): disabled input showing "Customer Contacts"
- **Transactional Database** (shown for Transactional and Combined): Select dropdown with table options

## Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| Change path mode | SegmentedControl toggle | Shows/hides relevant path fields |
| Upload CSV | Drag-drop or click browse | Parses file, stores headers, enables mapping step |
| Remove CSV | X button on uploaded file | Clears headers and all mappings |
| Replace CSV | Upload when file already exists | Clears all existing mappings, parses new file |
| Toggle advanced | "Advanced options" link | Shows/hides delimiter and encoding selects |
| Change data type | SegmentedControl toggle | Recalculates wizard step count |

## States

- **Default (create):** Name empty, Automatic mode, no file uploaded, Contacts selected
- **Default (edit):** Name pre-filled, path mode pre-set, no file shown (must re-upload to remap), data type pre-set
- **File uploaded:** Dropzone replaced with filename display
- **File error:** Red border on dropzone, error message below (e.g. "Only .csv files are accepted", "File is too large (max 50 MB)")
- **Pattern validation error:** Red border on input, error text below

## Conditional Logic

| Condition | Effect |
|-----------|--------|
| Path mode = Automatic | Folder Name + preview shown, File Pattern hidden |
| Path mode = Shared | Read Path (disabled) shown, File Pattern shown |
| Path mode = Custom | All path inputs editable, File Pattern shown |
| Name changes (Automatic mode) | Folder name auto-syncs via kebab-case |
| Data type = Contact or Both | Contacts Database field shown |
| Data type = Transactional or Both | Transactional Database select shown |
| File uploaded (create mode) | Next button enabled (if name also filled) |
| No file (create mode) | Next button disabled |
| No file (edit mode) | Next button enabled (existing mappings preserved) |

## Components Used

- Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem
- SegmentedControl
- HelpPopover
- PrefixInput (for path fields)

## Edge Cases

- File size capped at 50MB — show error if exceeded
- Show loading indicator during CSV parsing for large files
- Replacing a file clears ALL mappings (contact + transactional + lookup) — this is intentional
- Base Path defaults to "/company/base-path/" if the connection has no base path set
- Folder name uniqueness: TBD — enforcement mechanism not yet decided

## Related

- [Importer Wizard Overview](./overview.md)
- [Configuration Step](./configuration.md)
