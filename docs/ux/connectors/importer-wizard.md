# Import Wizard

> **Type:** Wizard (Multi-step Modal)
> **Route/Trigger:** Opened from a connection detail page via "New Importer" or "Edit" on an existing importer
> **Parent:** Connection detail page (within Audience > Integrations)

## Purpose

Guides the user through configuring an automated file-based import — from defining file paths and upload structure, through to field mapping, notifications, and review.

## Layout

### Modal Shell

- **Dimensions:** 60vw width, min 860px, max 1080px, 80vh height
- **Structure:** Two-column layout — fixed left sidebar (239px) + flexible right content area
- **Background:** Dark overlay (black/50 + backdrop blur)
- **Animation:** Fade in (200ms) for overlay, slide up (200ms) for modal

### Left Sidebar

- Background: `bg-secondary`
- Padding: 32px all sides
- Content (top to bottom):
  - **Icon:** DownloadSimple (Phosphor, 56px, teal)
  - **Title:** "New Importer" or "Edit Importer" (depending on mode)
  - **Subtitle:** "Connector: {connection name}" (uppercase, 11px, tracking-wider)
  - **Stepper:** Vertical stepper component showing all wizard steps

### Right Content Area

- **Header (fixed):** Step title (xl, semibold, teal) + step description (sm, muted) + CloseButton (top-right)
- **Body (scrollable):** Step content with vertical gap-6, scrollbar-gutter-stable
- **Footer (fixed):** WizardNavButtons (Cancel, Back, Next/Submit)

### Navigation Buttons

- Three buttons aligned right: Cancel (ghost) | Back (outline, disabled on step 0) | Next/Submit (primary, disabled when step is invalid)
- Final step button label adapts: "Create Importer" (new) / "Save Changes" (editing, dirty) / "Done" (editing, no changes)
- When Next is disabled, a tooltip shows the reason on hover

---

## Steps (Dynamic)

The step list changes based on the selected data type:

| Data Type | Steps |
|---|---|
| Contact | File Settings → Contact Configuration → Contact Mapping → Notifications → Review |
| Transactional | File Settings → Transactional Configuration → Transactional Mapping → Notifications → Review |
| Both (Combined) | File Settings → Contact Configuration → Contact Mapping → Transactional Configuration → Transactional Mapping → Notifications → Review |
| Not yet selected | File Settings → Configuration → Mapping → Notifications → Review |

---

## Step 1: File Settings

### Section: Importer Name (required)

- **Layout:** Label column (w-40) | Input field (w-552px)
- **Label:** "Importer Name" with red asterisk
- **Helper:** "A unique name for this importer"
- **Input:** Text, placeholder "e.g. Daily Contact Import"
- **Behaviour:** In Automatic path mode, changing the name auto-syncs the folder name (kebab-cased)

### Section: File Path

- **Label:** "File Path" with HelpPopover explaining read/error/archive flow
- **Helper:** "This must be unique"
- **Segmented Control:** Automatic | Shared | Custom

#### Automatic mode

- **Folder Name** input — editable, synced from importer name
- **Preview box** (green/accent background, rounded) — shows the three paths that will be created:
  - `{basePath}{folderName}/`
  - `{basePath}{folderName}/error/`
  - `{basePath}{folderName}/archive/`

#### Shared (Base) mode

- **Read Path** — disabled input showing the connection's base path (inherited)

#### Custom mode

- **Read Path** — editable, required (red asterisk)
- **Error Folder Path** — editable, required, auto-fills from read path + `/error/`
- **Archive Folder Path** — editable, required, auto-fills from read path + `/archive/`

### Section: Sample CSV

- **Label:** "Sample CSV" with HelpPopover explaining why samples matter. Required (red asterisk) for new importers, optional when editing.
- **Helper:** "This file will define all the fields available for mapping"
- **Upload zone:** Compact, single-line dashed border dropzone (h-14)
  - States: empty (drag/browse prompt), dragging (border-primary, slight scale), uploaded (file name + remove button)
  - Validation: .csv only, max 5 MB
  - On upload: parses headers and first row values
  - When replacing an existing file: clears all mappings (contact, transactional, and lookups)
- **Advanced options toggle:** Chevron link below dropzone ("Advanced options" / "Hide advanced options")
  - Expands a secondary panel with:
    - **Delimiter** dropdown (Comma, Tab, Pipe, Semicolon) — default: Comma
    - **Encoding** dropdown (UTF-8, ISO-8859-1, Windows-1252) — default: UTF-8

### Section: File Pattern (conditional)

- **Visibility:** Only shown in Shared and Custom path modes. Hidden in Automatic.
- **Label:** "File Pattern" with wide HelpPopover explaining wildcard matching
- **Helper:** "This must be unique"
- **Input:** Text with `.csv` suffix badge appended (non-editable suffix). Placeholder: "filename*"
- **Validation:**
  - Max 1 wildcard (`*`) per pattern
  - A lone `*` is rejected — must include prefix/suffix
  - `.csv` is auto-stripped if user types it

### Section: Importing To

- **Label:** "Importing To" with HelpPopover explaining Contact vs Transactional vs Combined
- **Helper:** "Select the database you want to update"
- **Segmented Control:** Contacts | Transactional | Combined — default: Contacts
- **Sub-fields (conditional):**
  - When Contacts or Combined: "Contacts Database" — disabled input showing "Customer Contacts"
  - When Transactional or Combined: "Transactional Database" — Select dropdown (Treatments, Products)

### Step 1 Validation (gates Next button)

- Name is non-empty
- Data type is selected
- For new importers: CSV must be uploaded (headers parsed)
- Disabled reason tooltip explains what's missing

---

## Step 2/3: Configuration (Contact or Transactional)

Shared layout for both Contact Configuration and Transactional Configuration. The only difference is the step title and the default matching fields.

### Section: Update Type

- **Label:** "Update Type" with wide HelpPopover
- **Radio buttons** (custom styled — teal ring when selected):
  - **Append / Update** — "add new records and update any that exist" (default)
  - **Append** — "add new records and ignore any that exist"
  - **Update** — "ignore new records and update any that exist"

### Section: Blank Values (conditional)

- **Visibility:** Hidden when Update Type is "Append" (since append doesn't update existing records)
- **Label:** "Blank Values" with wide HelpPopover
- **Radio buttons:**
  - **Preserve Existing Data** — blank values ignored, existing data kept (default)
  - **Import Blank Values** — blank values overwrite existing data

### Section: Matching Columns

- **Label:** "Matching Columns" with HelpPopover
- **Chip input:** Teal-bordered chips with X buttons, inline search input, dropdown of available options
  - Available options: Email, Customer ID, Phone, First Name, Last Name
  - Default chips (Contact): Email, Customer ID
  - Default chips (Transactional): Customer ID
  - Features: type-to-filter, clear all button, dropdown caret toggle

### Section: Dedupe

- **Label:** "Dedupe" with wide HelpPopover
- **Toggle row:** "Enable" label + Switch
- **When enabled:** Chip input appears (same style as Matching Columns) for selecting dedupe fields
- Default: disabled

---

## Step 3/4: Field Mapping (Contact or Transactional)

### Empty State (no CSV uploaded / editing existing without re-upload)

- Dashed border container with UploadSimple icon
- Heading: "Upload a new file to remap fields"
- Subtext: "Your current mappings are saved and will continue to be used."
- Link: "Go to File Settings" (navigates back to step 0)

### Mapping Table (when CSV headers are available)

- **Columns:** File Column → UbiQuity Column = Example Value
- **Each row:** Source field name (plain text) | Arrow (→) | Combobox dropdown | Equals (=) | Example value or status icon
- **Auto-mapping:** On first load, headers are auto-matched to target fields via fuzzy alias matching (e.g. "email" → "email_address", "firstname" → "first_name")
- **Status indicators:**
  - Normal: shows example value from CSV
  - No match (warning, amber): WarningCircle icon + "No match found"
  - Duplicate (error, red): WarningCircle icon + "Duplicate mapping" — tooltip shows which other source field is also mapped to that target
- **Special option:** `[[Ignore Column]]` — tells the system to skip this column

### Import Defaults (below mapping table)

- "+ Set import default" link adds rows with a Badge ("Import Default") in the source column
- Opens SetImportDefaultModal to configure:
  - Target field (from unmapped fields)
  - Mode: fixed value or send-date
  - Fixed value: text input
- Import default rows are displayed below the regular mapping rows with a delete button

### Lookup Mapping (Transactional mapping only)

- Appears above the field mapping table
- **Title:** "Lookup Mapping" with wide HelpPopover
- **Description:** explains that transactional rows must link to contacts
- **Table structure:** File Column | Contact Table Column | Remove button
- **Dropdowns:** File Column = CSV headers, Contact Table Column = [Email, Customer ID, Phone, External ID, Account Number]
- **Add row:** "+ Add Lookup Field" link inside the table
- **Remove:** X button (visible when > 1 row)
- **Validation on Next:** At least one complete lookup mapping is required. Alert dialog shown if missing.

### Duplicate Target Validation

- On Next from Transactional Mapping: checks for duplicate target field assignments
- Alert dialog: "Duplicate field mapping detected: {field} is mapped more than once."

---

## Notifications Step (second-to-last)

Shared component used by both Import and Export wizards.

### Section: Failure (required)

- **Label:** "Failure" with red asterisk
- **Helper:** "Be alerted by email when a connector run fails"
- **ChipInput:** Email type, with team member autocomplete suggestions
- **Validation:** At least one email required (gates the Next button)

### Section: Success (optional)

- **Toggle:** Switch + "Enable" label
- **When enabled:** ChipInput for emails + "copy from above" link to clone failure emails

### Section: No File (optional)

- **Label:** "No File" with HelpPopover
- **Helper:** explains the alert timing concept
- **Toggle:** Switch + "Enable" label
- **When enabled (full schedule UI):**
  - **Frequency:** Segmented Control (Hourly | Daily | Weekly | Monthly)
  - **Starting:** Text input (date)
  - **Weekly specific:** DayPicker (7-day toggle buttons)
  - **Monthly specific:** Pattern toggle (Day/Date) + ordinal/day-of-week selects OR date chip picker (1st–28th)
  - **Every:** Select (1–12) + unit suffix
  - **At:** Text input (time)
  - **Email Address:** ChipInput + "copy from above" link

---

## Review Step (last)

- Read-only summary of all configuration
- Each section styled with a 2px left border (teal)
- Sections shown (conditionally based on data type):
  - **File Settings:** Path mode, folder name, read path, error/archive paths, file pattern, data type
  - **Contact Configuration:** Update type, blank values, matching fields
  - **Contact Mapping:** Source → target field list + count
  - **Transactional Configuration:** (same fields as contact config)
  - **Transactional Mapping:** (same format as contact mapping)
  - **Notifications:** Failure emails, success status, no file alert status
- Layout: 2-column grid (160px label | flexible value)

---

## Interactions

| Action | Result |
|---|---|
| Click stepper step | Navigate to that step (any step is clickable) |
| Click Next | Validate current step, mark complete, advance |
| Click Back | Go to previous step |
| Click Cancel or Close (X) | If dirty: show discard confirmation dialog. If clean: close immediately. |
| Press Escape | Same as Cancel/Close |
| Upload CSV | Parse headers, populate mapping step, enable Next |
| Remove uploaded file | Clear headers, clear all mappings |
| Change data type | Step list recompiles, currentStep clamped if needed, completed steps pruned |

## States

- **Default (new):** Empty form, Contact pre-selected, Automatic path mode
- **Default (editing):** Pre-populated from existing config. Mapping step shows empty state (requires re-upload to remap).
- **Dirty:** Any change from initial state triggers the discard confirmation on close
- **Validation disabled:** Next button disabled with tooltip explaining the missing requirement

## Conditional Logic

- Data type controls which config/mapping steps appear (dynamic step list)
- Path mode controls which fields appear in File Path section
- "Append" update type hides the Blank Values section
- File Pattern section hidden in Automatic mode
- Lookup Mapping section only appears on Transactional Mapping step
- Dedupe chip input only appears when dedupe toggle is enabled
- Advanced CSV options only appear when toggled open
- Importing To sub-fields depend on selected data type

## Components Used

- `Stepper` (composed) — vertical orientation
- `SegmentedControl` (composed)
- `HelpPopover` (composed)
- `ChipInput` (composed)
- `CardSelector` — not used (different from export wizard)
- `PrefixInput` (composed)
- `DayPicker` (composed)
- `AlertDialogComposed` (composed)
- `CloseButton` (ui)
- `Button` (ui)
- `Input` (ui)
- `Select` / `SelectTrigger` / `SelectContent` / `SelectItem` (ui)
- `Switch` (ui)
- `Label` (ui)
- `Combobox` (ui)
- `Badge` (ui)
- `Tooltip` (ui)

## Edge Cases

- **Long file names:** Truncated at 40 chars with ellipsis
- **Re-uploading a CSV clears all mappings** — contact, transactional, and lookups are all reset
- **Editing without re-upload:** Mapping step shows empty state with link back to File Settings. Existing mappings are preserved silently.
- **Step count changes mid-wizard:** When data type changes from "Contact" to "Both", new steps are inserted. If current step exceeds new total, it's clamped to the last step.
- **Completed step tracking:** Changing a field on any step marks all later steps as incomplete (they're pruned from completedSteps)
- **Custom path auto-fill:** Error and archive paths auto-populate from the read path, but only when they're empty or match the previous auto-generated pattern
- **File Pattern `.csv` stripping:** If user types ".csv" at the end, it's automatically removed on blur (since the suffix is shown separately)
- **Dedupe scope:** Only deduplicates within the uploaded file — not against existing database records

## Related

- [Export Wizard](./exporter-wizard.md) — sibling wizard, same modal shell pattern
- Shared `NotificationsStep` component (`src/components/shared/NotificationsStep.tsx`)
- Connection detail page — parent context
