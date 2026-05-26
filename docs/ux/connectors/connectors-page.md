# Connectors

> **Type:** Page
> **Route:** `/dashboard`
> **Parent:** Audience (breadcrumb: Audience > Connectors)

## Purpose

The central hub for setting up and monitoring how data flows in and out of UbiQuity.

## Mental Model

Connections are infrastructure containers (like folders) that group automations. The connection is the plumbing — credentials, server details, file paths. Automations are the actual work that runs on that connection (imports and exports).

## Layout

1. **Breadcrumb** — Audience > Connectors
2. **Page header** — Title "Connectors", subtitle showing "{X} connections · {Y} automations", "+ New Connection" button (outline variant)
3. **Connection list** — Collapsible rows, each containing:
   - Connection row (collapsed): protocol icon, protocol label, connection name, automation count ("X of Y automations active"), meatball menu
   - Connection row (expanded): same header + nested automation cards + "+ Add Automation" dashed button
4. **Empty state** — when no connections exist (see States below)

## Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| Create connection | "+ New Connection" button | Opens CreateConnectionModal |
| Expand/collapse connection | Click connection row | Toggles automation cards visibility |
| Add automation | "+ Add Automation" button or meatball menu | Opens InitialModal (choose name + direction) |
| Edit connection | Meatball menu → "Edit Connection" | Warning dialog (automations pause) → CreateConnectionModal in edit mode |
| Fix connection | "Fix connection" button (error state only) | Warning dialog → CreateConnectionModal in edit mode |
| Delete connection | Meatball menu → "Delete Connection" | Confirmation modal (type "DELETE"). Disabled if automations exist. |
| Click automation card | Card click | Opens AutomationSettingsModal |
| Toggle automation on/off | Switch on card | If activating: billing confirmation (type "ACCEPT"). If pausing: immediate. |
| Edit automation | Meatball menu → "Edit Automation" | Opens ImporterWizardModal or ExporterWizardModal directly |
| Delete automation | Meatball menu → "Delete Automation" | Confirmation modal (type "DELETE") |
| View activity log | Meatball menu → "Activity Log" | Opens ActivityLogModal — audit trail of actions (created, edited, paused, activated) |
| View history | Meatball menu → "History" | Opens HistoryModal — past file imports/exports with results |
| View settings | Meatball menu → "Automation Settings" | Opens AutomationSettingsModal |

## States

### Default
List of connection rows. Each shows protocol icon, name, and automation count. Connections start collapsed.

### Empty (no connections)
- Centred layout with PlugsConnected icon (48px, light weight)
- Headline: "Connect your data source"
- Supporting text: "Automations require an active connection to your database or file storage."
- Primary CTA: "Create Your First Connection" (large button)
- Help link: "View connection requirements" (opens popover with checklist)

### Connection error state
- Protocol icon turns red
- Connection name turns red
- "Fix connection" button replaces the automation count text
- "+ Add Automation" button is hidden
- Automation cards show red hover border instead of teal

### Automation paused state
- Card has reduced opacity (60%)
- Background changes to secondary
- Shadow removed
- Badge shows neutral styling

## Conditional Logic

| Condition | Effect |
|-----------|--------|
| Connection has error status | Red icon, red name, "Fix connection" button shown, "+ Add Automation" hidden |
| Connection has 0 automations (no error) | "Add automation" button shown in place of count text |
| Connection has automations | Delete connection is disabled in meatball menu (tooltip: "Remove all Automations before deleting connection") |
| Automation is paused → user toggles on | Billing confirmation dialog with type-to-confirm "ACCEPT" |
| Automation is active → user toggles off | Immediate pause, no confirmation |
| User clicks "Edit Connection" | Warning dialog shows count of affected automations. Behaviour of running automations during edit is TBD. |

## Business Rules

- **Billing:** Every automation has a cost. Importers and exporters have differing values. No free tier. Billing starts immediately on activation. Minimum billing period cannot be cancelled or refunded.
- **Delete connection:** User must manually delete all automations first. Connection cannot be deleted while automations exist.
- **Edit connection:** TBD — what happens to running automations when a connection is edited (pause/resume, keep running, etc.) not yet decided.
- **Connection error trigger:** When a daily credential check detects that a connection's credentials have expired or the server is unreachable, the connection enters error state. A summary email is sent to the connection's Alert Email recipients listing all affected connections for that account.
- **Run statuses:** TBD — the set of possible run statuses for automations not yet decided.

## Automation Card Structure

Each automation card is a 4-column grid row:
1. **Direction icon + Name** — Import (↓) or Export (↑) icon + automation name
2. **Data type** — Contacts database name (with UsersThree icon), transactional source name (with NewspaperClipping icon), or combined
3. **Last run status + time** — Badge (Completed/Failed) + relative time
4. **Switch + meatball menu** — Active/paused toggle + actions dropdown

## Activity Log vs History

- **Activity Log:** Audit trail of all actions taken on the automation — created, edited, paused, activated, settings changed.
- **History:** List of past file imports/exports with results — when it ran, how many records, success/failure.

## Components Used

- Button, Badge, Switch, Breadcrumb
- Collapsible (connection expand/collapse)
- DropdownMenu (meatball menus)
- AlertDialogComposed (edit warning, fix warning, activation billing confirmation)
- DeleteConfirmModal (delete automation, delete connection)
- Popover (connection requirements in empty state)

## Edge Cases

- Connection with 0 automations shows "Add automation" button instead of count
- Delete connection disabled with tooltip when automations exist — user must delete automations first
- Activation billing dialog uses CurrencyDollar icon and requires typing "ACCEPT"
- Automation card click opens settings, but switch and meatball menu clicks don't propagate to the card

## Related

- [CreateConnectionModal](./create-connection-modal.md)
- [InitialModal](./initial-modal.md)
- [ImporterWizard](./importer-wizard/)
- [ExporterWizard](./exporter-wizard/)
- [AutomationSettingsModal](./automation-settings-modal.md)
- [ActivityLogModal](./activity-log-modal.md)
- [HistoryModal](./history-modal.md)
