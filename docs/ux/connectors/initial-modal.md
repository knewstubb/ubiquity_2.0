# Initial Modal (Add Automation)

> **Type:** Modal (single-step chooser)
> **Route/Trigger:** "+ Add Automation" button on an expanded connection row
> **Parent:** [Connectors Page](./connectors-page.md)

## Purpose

Choose the direction (import or export) for a new automation on an existing connection.

## Layout

Uses the ChooserModal pattern — a card selector with two options:

| Option | Icon | Label |
|--------|------|-------|
| Import | DownloadSimple (28px, Light) | Importer |
| Export | UploadSimple (28px, Light) | Exporter |

- Icon above cards: ArrowsLeftRight (48px, Light)
- Title: "Select Automation Type"
- Description: "Choose the direction for your automation on {connection name}."
- "Next" button disabled until a direction is selected

## Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| Select direction | Card click | Highlights card, enables Next |
| Confirm | Next button | Proceeds to ImporterWizardModal (import) or ExporterWizardModal (export) with empty name |
| Cancel | Cancel button or close | Closes modal, returns to Connectors page |
| Close | Click outside or Escape | Same as Cancel |

## States

- **Default:** No direction selected, Next disabled
- **Direction selected:** One card highlighted (teal border + checkmark), Next enabled

## Conditional Logic

| Condition | Effect |
|-----------|--------|
| No direction selected | Next button disabled |
| Direction selected | Next button enabled |

## Components Used

- ChooserModal (composed component — handles the card selector pattern)

## Edge Cases

- The name field is NOT on this modal — it's on the first step of the wizard that follows
- This modal passes an empty string for name to `onProceed` — the wizard handles naming
- Connection must be in a healthy state to show this modal (error connections hide "+ Add Automation")

## Related

- [Connectors Page](./connectors-page.md) — parent page
- [Importer Wizard](./importer-wizard.md) — opened when Import selected
- [ChooserModal](../_shared/chooser-modal.md) — reusable card selector pattern
