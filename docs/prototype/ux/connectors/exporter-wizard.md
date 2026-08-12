# Export Wizard

> **Type:** Wizard (Multi-step Modal)
> **Route/Trigger:** Opened from a connection detail page via "New Exporter" or "Edit" on an existing exporter
> **Parent:** Connection detail page (within Audience > Integrations)

## Purpose

Guides the user through configuring an automated data export — selecting a source, choosing fields, configuring the output file format, setting a schedule, and defining notification recipients.

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
  - **Icon:** UploadSimple (Phosphor, 56px, teal)
  - **Title:** "New Exporter" or "Edit Exporter" (depending on mode)
  - **Subtitle:** "Connector: {connection name}" (uppercase, 11px, tracking-wider)
  - **Stepper:** Vertical stepper component showing all 6 steps

### Right Content Area

- **Header (fixed):** Step title (xl, semibold, teal) + step description (sm, muted) + CloseButton (top-right)
- **Body (scrollable):** Step content with vertical gap-6, scrollbar-gutter-stable
- **Footer (fixed):** WizardNavButtons (Cancel, Back, Next/Submit)

### Navigation Buttons

- Three buttons aligned right: Cancel (ghost) | Back (outline, disabled on step 0) | Next/Submit (primary, disabled when step is invalid)
- Final step button label adapts: "Create Exporter" (new) / "Save Changes" (editing, dirty) / "Done" (editing, no changes)

---

## Steps (Fixed)

| # | Step | Description |
|---|---|---|
| 0 | Source | Choose your data source and configure filters |
| 1 | Field Mapping | Select and reorder the fields to include in your export |
| 2 | File Configuration | Configure CSV output format, naming, and delivery options |
| 3 | Schedule | Configure when and how often this export runs |
| 4 | Notifications | Configure email notifications for this export |
| 5 | Review | Review your exporter configuration before saving |

---

## Step 0: Source Selection

Uses **progressive disclosure** — each "beat" appears only when the previous is complete.

### Beat 1: Primary Source (always visible)

- **Label column:** "Primary Source" with helper text
- **CardSelector grid** (3 columns, gap-3):
  - **Contacts** — Users icon, "Export contact records from your database"
  - **Transactions** — Receipt icon, "Export transactional data records"
  - **Messages** — ChatCircle icon, "Export message delivery data"
- **Selection behaviour:** Single-select card with teal border + checkmark when active
- **Change confirmation:** If downstream config exists (filters/enrichment), changing primary source triggers a warning AlertDialog: "Changing the primary source will reset your filter and enrichment settings."
- **Reset behaviour:** Changing primary source clears selectedFields and columnRenames

### Beat 2: Sub-Source (appears when Beat 1 is complete)

Rendered inside a grey `bg-muted` rounded box below the selected card. Content depends on primary source:

#### Contacts → No sub-source needed

#### Transactions → Table dropdown

- Select component with options: Purchases, Bookings, Subscriptions, Returns
- Helper: "A transaction table must be selected to continue."

#### Messages → Channel selector

- **Multiple channels available:** CheckboxCard list (Email, SMS, Push) — multi-select
- **Single channel available:** Auto-selected, disabled CheckboxCard with note
- **No channels configured:** Info banner explaining channels must be configured first
- **Validation:** At least one channel must be selected

### Beat 3: Record Filter (appears when Beat 2 is complete)

- **Label column:** Dynamic label — "Filter Contacts" / "Filter Records" / "Filter Messages"
- Content varies by primary source:

#### Contacts Filter

RadioCard list (vertical, gap-1.5):
- **All contacts** — no additional fields
- **Created in last N days** — expands to show number input (1–365), with validation
- **In list/segment** — expands to show Combobox (searchable segment list)
- **Unsubscribed** — no additional fields
- **Not sent campaign** — expands to show Combobox (campaign list) + "Cross-entity filter" note

#### Transactions Filter

RadioCard list:
- **All records** — no additional fields
- **Created in last N days** — number input
- **Field filter** — field/operator/value filter rows

#### Messages Filter

RadioCard list:
- **All messages** — no additional fields
- **By status** — status checkboxes (delivered, bounced, failed, opened)
- **For campaign** — campaign Combobox
- **In date range** — start/end date inputs

### Match Count Indicator

Appears below the filter panel. States:
- **Loading:** Spinner + "Calculating..."
- **Pending (filter incomplete):** DotsThree icon + "Complete filter to see match count"
- **Success:** Bold teal count + "{entity} match" (with left teal accent border)
- **Zero matches:** "0 records match" (neutral styling)
- **Error:** Red text + Retry button

### Beat 4: Enrichment / Add Context (appears when Beat 3 is complete)

- **Label column:** "Add Context" — "Enrich your export with columns from related entities."
- **When no enrichment selected:** Grid of CheckboxCards (2 columns) showing available enrichment entities:
  - From Contacts → can enrich with Transactions, Messages
  - From Transactions → can enrich with Contacts, Messages
  - From Messages → can enrich with Contacts, Transactions
- **When enrichment selected:**
  - Header bar: Entity icon + name + "Remove" button (X)
  - Entity-specific configuration panel below:
    - **Transactions:** Table select + Join Strategy (most recent / all records)
    - **Messages:** Channel select + Status multi-select
    - **Contacts:** No additional config needed

### Step 0 Validation (gates Next button)

- Primary source selected
- Sub-source complete (table selected for Transactions, channel selected for Messages)
- Filter complete (varies per filter type — e.g. "created_in_last_n_days" needs a valid day count)

---

## Step 1: Field Mapping

### Structure

- **Select All header:** Checkbox row at top of field list
- **Selected fields (draggable):** Teal left-border accent, drag handle, position number, checkbox (checked), label, source badge, rename input, reset button
- **Unselected fields:** No left border, no drag handle, checkbox (unchecked), label, source badge

### Field Sources

Fields are derived from the sourceConfig:
- Base fields from the primary source (contacts, transactions, or messages)
- Additional fields from the enrichment entity (if configured)
- Each field shows a source badge (rounded pill, muted background)

### Column Renaming

- Each selected field has an inline rename input (h-7, w-40, xs text)
- Placeholder shows the original field label
- Reset button (ArrowCounterClockwise icon) appears when a rename exists
- **Validation:**
  - Column names must be valid (validated on each keystroke)
  - Duplicate column names are flagged as errors
  - Invalid characters blocked

### Drag & Drop Reordering

- Selected fields can be dragged to reorder
- Visual feedback: dragged row becomes semi-transparent + slightly scaled, drop target shows top-border highlight
- Position numbers update in real-time

### Step 1 Validation

- At least one field must be selected
- All rename inputs must pass validation
- No duplicate column names allowed

---

## Step 2: File Configuration

### Section: File Name (required)

- **Label column:** "File Name" with helper "Prefix for exported file names"
- **Input + suffix badge:** `{prefix}` input + static `-{timestamp}.{ext}` suffix
- **Validation:** Only letters, numbers, hyphens, underscores. Max 100 chars.
- **Error display:** Inline red text below input

### Section: File Format

- **Label:** "File Format" with helper "Output file type"
- **Select dropdown:**
  - CSV (Comma-separated)
  - TSV (Tab-separated)
  - Pipe-delimited

### Section: Timezone

- **Label:** "Timezone" with helper "For datetime values in export"
- **Select dropdown:** Pacific/Auckland (default), UTC, Australia/Sydney, Australia/Melbourne, US timezones, Europe, Asia

### Section: Format Options (collapsible)

- **Separated** from above sections by a border-top + pt-5
- **Label:** "Format Options" with helper "Advanced format settings"
- **Collapsed state:** Shows summary ("CSV · Headers on · Pacific/Auckland") with caret toggle
- **Expanded state reveals:**
  - **Delimiter** dropdown (Comma, Tab, Pipe, Semicolon)
  - **Include header row** toggle (Switch + Label)
  - **Date Format** dropdown (ISO 8601, US, EU, UNIX Timestamp)

### Section: Preview

- **Separated** by border-top + pt-5
- **Label:** "Preview" with helper "Generated filename"
- **Display:** Monospace text in muted rounded box showing the resolved filename (e.g. `daily-export-20250509T143022.csv`)

### Step 2 Validation

- File prefix must be non-empty and pass the regex validation (letters, numbers, hyphens, underscores, 1–100 chars)

---

## Step 3: Schedule

### Frequency Selector

- **SegmentedControl:** Hourly | Daily | Weekly | Monthly

### Weekly Configuration (when frequency = weekly)

- **Label:** "On"
- **DayPicker:** 7-day toggle buttons (Mon–Sun)
- **Validation:** At least one day must be selected (red error text shown if none)

### Monthly Configuration (when frequency = monthly)

- **Label:** "On days"
- **Grid** (7 columns): Buttons 1–28, teal fill when selected, border when unselected
- **Validation:** At least one day must be selected

### Info Note

- "Execution time is assigned automatically by the system to avoid scheduling conflicts."

### Step 3 Validation

- Hourly / Daily: always valid
- Weekly: at least one day selected
- Monthly: at least one day selected

---

## Step 4: Notifications

Same shared `NotificationsStep` component as the Import Wizard. See [Import Wizard → Notifications Step](#notifications-step-second-to-last) for full documentation.

Key fields:
- **Failure** (required): ChipInput for emails — at least one required
- **Success** (optional): Toggle + ChipInput + "copy from above"
- **No File** (optional): Toggle + full schedule configuration UI + ChipInput

### Step 4 Validation

- At least one failure email must be present

---

## Step 5: Review

- Read-only summary of all configuration
- Each section styled with a 2px left border (teal) and an "Edit" button (ghost, pencil icon)
- Clicking "Edit" navigates directly to that step

### Sections displayed:

| Section | Content |
|---|---|
| Exporter Type | Type label |
| Data Sources | Source config summary (from `formatSourceConfigSummary`) or legacy source list |
| Fields | Numbered list of selected fields with column names. Shows "(from: original)" for renamed fields |
| Output Configuration | File name preview (monospace), prefix, format, timezone |
| Schedule | Frequency + selected days summary |
| Notifications | Failure emails, success status, no file alert status |

---

## Interactions

| Action | Result |
|---|---|
| Click stepper step | Navigate only if step is completed or is current step |
| Click Next | Mark current step complete, advance to next |
| Click Back | Go to previous step |
| Click Cancel or Close (X) | If dirty: show discard confirmation. If clean: close immediately. |
| Press Escape | Same as Cancel/Close |
| Select primary source (when downstream exists) | Warning dialog before resetting filters |
| Change primary source or sub-source | Clears selectedFields and columnRenames |
| Change enrichment entity | Removes fields from old enrichment source, preserves primary source fields |
| Remove enrichment | Removes enrichment fields from selection |
| Drag field in mapping | Reorders the export column order |
| Click "Edit" on Review step | Navigates to that specific step |

## States

- **Default (new):** Empty form, no source selected. A pending placeholder is shown ("Select a source above...")
- **Default (editing):** Pre-populated from existing automation config. All steps marked as completed.
- **Dirty:** Any change from initial state triggers the discard confirmation on close
- **Stale references (edit mode):** If hydrated sourceConfig contains references to deleted segments/campaigns, a warning is logged. (UI for stale reference display is not yet implemented.)

## Conditional Logic

- Sub-source section only appears for Transactions and Messages (not Contacts)
- Filter panel appears only when sub-source selection is complete
- Enrichment section appears only when filter is complete
- Available enrichment entities depend on the primary source (can't enrich with yourself)
- Match count shows "pending" state until filter is fully configured
- Field Mapping dynamically updates available fields when source/enrichment changes
- File extension in preview changes based on selected format (csv vs tsv)
- Format Options section is collapsible — starts collapsed
- Monthly/Weekly schedule fields only shown when that frequency is selected
- Review step's "Edit" buttons navigate to specific step indices

## Components Used

- `Stepper` (composed) — vertical orientation
- `SegmentedControl` (composed)
- `CardSelector` (composed) — primary source selection
- `CheckboxCard` (composed) — channels, enrichment
- `RadioCard` (composed) — filter type selection
- `HelpPopover` (composed)
- `ChipInput` (composed) — notification emails
- `DayPicker` (composed) — weekly schedule
- `AlertDialogComposed` (composed) — source change warning
- `Combobox` (ui) — segments, campaigns
- `Collapsible` (ui) — format options
- `CloseButton` (ui)
- `Button` (ui)
- `Input` (ui)
- `Select` / `SelectTrigger` / `SelectContent` / `SelectItem` (ui)
- `Switch` (ui)
- `Label` (ui)
- `Checkbox` (ui) — field selection
- `Tooltip` (ui)
- `DragHandle` (shared) — field reordering

## Edge Cases

- **Source change resets downstream:** Changing primary source or sub-source clears field selections and renames. Enrichment entity change only removes that entity's fields.
- **Stepper click restriction:** Unlike the import wizard (where any step is clickable), the export wizard only allows clicking completed steps or the current step.
- **No channels configured:** Messages source shows an info banner and blocks progression
- **Zero match count:** Doesn't block Next — user can still proceed with an empty export
- **Cross-entity filter note:** "Not sent campaign" filter on Contacts shows a note explaining it's a cross-entity filter
- **Column name validation:** Duplicate column names and invalid characters are validated inline and block the Next button
- **File prefix validation:** Validated against regex pattern — only alphanumeric + hyphens + underscores, 1–100 chars
- **Edit mode pre-population:** Existing automation data is mapped to the draft format. Source config is hydrated from stored JSON; stale references are detected but currently only logged.
- **Monthly grid capped at 28:** Avoids issues with months that don't have 29/30/31

## Related

- [Import Wizard](./importer-wizard.md) — sibling wizard, same modal shell pattern
- Shared `NotificationsStep` component (`src/components/shared/NotificationsStep.tsx`)
- Connection detail page — parent context
- Source selection sub-components in `src/components/wizard/source-selection/`
