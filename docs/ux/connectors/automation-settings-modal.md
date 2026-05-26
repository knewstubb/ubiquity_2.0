# Automation Settings Modal

> **Type:** Modal (read-only detail view)
> **Route/Trigger:** Click on an automation card, or "Automation Settings" from meatball menu
> **Parent:** [Connectors Page](./connectors-page.md)

## Purpose

Display a read-only summary of an automation's full configuration — file settings, mapping, notifications, schedule — with an action to open the edit wizard.

## Layout

Standard Dialog (max-width 560px) with:
- **Header:** Automation name as title, "{connection name} · Importer/Exporter" as description, close button
- **Body:** Scrollable (max-height 60vh), vertical stack of sections with teal left border
- **Footer:** "Close" (secondary) + "Edit Automation" (primary)

## Sections (Importer)

1. **File Settings** — path mode, folder name, read/error/archive paths, file pattern, importing to
2. **Contact Configuration** — update type, blank values, matching fields
3. **Transactional Configuration** (if applicable) — same fields as contact
4. **Contact Mapping** — source → target field list with count
5. **Transactional Mapping** (if applicable) — same format as contact
6. **Notifications** — failure emails, success status, no-file alert status
7. **Metadata** — created date, last updated date

## Sections (Exporter)

1. **Data Source** — connection, exporting from, database, source table, key field, filters
2. **Field Mapping** — numbered list of selected fields
3. **File Configuration** — file type, delimiter, header row, date format, timezone, naming pattern, output path
4. **Schedule** — frequency, status (active/paused with colour)
5. **Notifications** — email addresses, success/failure toggle status
6. **Metadata** — created date, last updated date

## Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| Edit Automation | "Edit Automation" button | Closes this modal, opens ImporterWizardModal or ExporterWizardModal in edit mode |
| Close | "Close" button, X button, click outside, Escape | Closes modal |

## States

- **Default (importer with config):** All importer sections shown with populated data
- **Default (importer without config):** Shows "Not configured" italic text
- **Default (exporter):** All exporter sections shown with populated data

## Conditional Logic

| Condition | Effect |
|-----------|--------|
| Direction = import | Importer sections shown |
| Direction = export | Exporter sections shown |
| Importer has transactional mapping | Transactional Configuration + Mapping sections shown |
| Importer has no transactional mapping | Those sections hidden |
| ImporterConfig is null | "Not configured" placeholder shown |

## Section Visual Pattern

Each section uses:
- 2px teal left border (`border-l-2 border-primary`)
- 16px left padding (`pl-4`)
- Section title: 14px SemiBold
- Rows: label (muted) left-aligned, value (foreground, medium) right-aligned
- Mapping rows: source → target with teal target text

## Components Used

- Dialog, DialogContent, DialogTitle, DialogDescription
- ModalHeader (composed — title + description + close)
- ModalFooter (composed — primary + secondary actions)

## Edge Cases

- "Edit Automation" closes this modal first, then opens the wizard — prevents modal stacking
- Mapping sections show field count below the list ("3 fields mapped")
- Empty optional fields show "Not configured" or "—" rather than being hidden
- Date formatting: "21 May 2026 at 14:30" format

## Related

- [Connectors Page](./connectors-page.md) — parent page
- [Importer Wizard](./importer-wizard/overview.md) — opened via "Edit Automation"
