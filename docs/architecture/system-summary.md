# UbiQuity 2.0 — System Summary

> **Purpose:** Reference document for AI agents and developers to understand the current state of the prototype, plan future phases, and identify refactoring opportunities.
>
> **Last updated:** July 2026

---

## What This Is

Interactive design prototype for UbiQuity 2.0 — a hybrid CDP/MAP (Customer Data Platform + Marketing Automation Platform) for SMEs. This is NOT production code. It simulates user workflows end-to-end so stakeholders can experience the product before development begins.

**Tech stack:** React 19 + TypeScript + Vite + Tailwind CSS + Supabase (persistence + auth)

---

## Architecture Overview

### The AAA Framework

UbiQuity is built on three equal pillars:
- **Acquire** — Getting data in (forms, imports, connectors, integrations)
- **Analyse** — Making sense of it (reports, dashboards, smart segments)
- **Act** — Doing something with it (journey builder, campaigns, automations)

### Data Flow

```
Connection (S3/SFTP/Azure) → Automation (Import/Export) → Contact/Transactional Database
                                                        ↓
                                              Segments → Campaigns → Journeys
```

---

## Core Entities

### Account Hierarchy

Hierarchical tree structure. Three root organisations in seed data:
- Serenity Spa Group (primary, with 4 child accounts)
- Christchurch City Council
- Save the Children NZ

Each account owns connections, contacts, and automations. Users can switch between accounts or view "all accounts" (platform admin mode).

### Connections

External file storage links. Three protocols supported:
- **AWS S3** — bucket + prefix + IAM/access key auth
- **Azure Blob** — container + account + SAS token
- **SFTP** — host + port + SSH key

Each connection has a `basePath` (optional for S3/Azure, required for SFTP) and alert emails. Automations are grouped under their parent connection on the Connectors page.

### Automations

Two directions:
- **Import** — pulls data from connection into UbiQuity (contacts + transactional tables)
- **Export** — pushes data from UbiQuity to connection (configurable source, fields, schedule)

Each automation has: name, direction, data type, selected fields, file format options, schedule, notifications, status (active/paused).

### Source Selection (Exporter)

The exporter uses a `SourceConfig` discriminated union:
- `ContactsSourceConfig` — primary source is the contacts database
- `TransactionsSourceConfig` — primary source is a specific transactional table
- `MessagesSourceConfig` — primary source is mailout/messaging data

Each config supports enrichment — adding fields from other sources (e.g. contacts exporter enriched with transactional fields).

---

## Connectors Page (Dashboard)

**Route:** `/`

Shows all connections for the selected account, each expandable to show child automations.

### Key Features

- Connection cards with protocol icon, name, status, automation count
- **IMPORTERS / EXPORTERS sections** within each connection (always visible headings)
- Per-section "+ Add Importer" / "+ Add Exporter" buttons (navigate directly to wizard)
- Automation cards show: direction icon, name, data type, status badge, last run time, toggle switch, meatball menu
- Exporter cards show "Exporter" in the data type column (importers show specific destination)
- Activation dialog (billing) when toggling a paused exporter on — requires typing "ACCEPT"
- Settings modal per automation with step-by-step summary
- Delete confirmation modal
- Run history modal
- Create/edit connection modal (protocol-specific forms)

---

## Exporter Wizard

**Routes:** `/exporters/new/:connectionId` | `/exporters/edit/:automationId`

### 6-Step Flow

1. **File Settings** — exporter name, file prefix (auto-slugified), advanced options (delimiter, header row), destination path, preview
2. **Data Source** — select primary source via SelectorCard option cards. Sources grouped: Contacts (uses account name), Messaging (Mailout, SMS*), Transactional (per-table cards), Data Capture* (Surveys, Forms). HelpPopover explains "primary source" concept.
3. **Filter** — Phase 1-2: shows "All changed records will be exported" with CheckCircle. Phase 3: full ModalFilterBuilder with drill-down source categories, nested AND/OR logic, max 25 conditions/10 groups.
4. **Export Fields** — source chips row + "+ Add source" modal. Field list with checkboxes, drag reorder, source tags (human-readable names), column rename inputs. Source tags show account name for contacts, table name for transactional.
5. **Schedule** — frequency via SelectorCard grid (10 Min/$1000, Hourly/$500, Daily/$250, Weekly/$250). Weekly shows DayPicker. Daily/Weekly show time-of-day dropdown (Morning/Afternoon/Evening/Overnight). InfoHint about system-assigned execution time. Phase 2+ adds notifications (failure email required, success optional).
6. **Review** — read-only summary with teal left-border sections. Grid layout matching importer pattern.

*Items marked with * are disabled/coming in Phase 3.

### Phase System

Features are progressively enabled via `PrototypePhaseContext`:
- **Phase 1:** Contacts + Transactional sources, export fields, file settings, schedule, notifications, create/edit/delete
- **Phase 2:** + Mailout source + enrichment from contacts
- **Phase 3:** + Filter builder, + SMS, Surveys, Forms sources + all enrichments

### Add Source Modal

Phase-aware modal for adding enrichment sources:
- Shows all sources EXCEPT the primary (can't enrich with yourself)
- Phase 2: only Contacts enrichment available
- Phase 3: all sources (Contacts, Mailout, SMS, Transactional tables, Surveys, Forms)
- Uses SelectorCard variant="checkbox" with dynamic button label

---

## Importer Wizard

**Routes:** `/importers/new/:connectionId` | `/importers/edit/:automationId`

### Dynamic Steps (based on data type)

Steps vary by selection:
- **Contact only:** File Settings → Contact Config → Contact Mapping → Notifications → Review
- **Transactional only:** File Settings → Transactional Config → Transactional Mapping → Notifications → Review
- **Both:** File Settings → Contact Config → Contact Mapping → Transactional Config → Transactional Mapping → Notifications → Review

### Key Features

- File path modes (Automatic/Base/Custom) with different field visibility
- CSV format configuration (delimiter, encoding, header row)
- Contact/Transactional config (update type, blank value handling, matching fields)
- Field mapping with source→target column pairs
- Notifications (failure, success, no-file alert)
- Review summary matching the section pattern

---

## Component Library

**Route:** `/admin/components` (admin-only)

Full design system with:
- Token pages (colours, typography, shadows, spacing/radius)
- Input components (buttons, text fields, checkboxes, selects, etc.)
- Feedback components (alerts, toasts, popovers, dialogs)
- Composed components (filter builder, selector cards, chips, etc.)
- Controller panels for interactive prop editing

### Key Composed Components

- `SelectorCard` — 4 variants: icon, checkbox, radio, option
- `InfoHint` — inline/panel annotation with icon
- `HelpPopover` — teal (?) circle that opens popover with title + body
- `ModalFilterBuilder` — card-based filter builder with drill-down source categories
- `AlertDialogComposed` — intent-based (neutral/warning/destructive) confirmation dialog
- `Chip` — tags, filter pills, insertion tokens
- `ChipInput` — multi-value input with chips

---

## Refactoring Opportunities

### High Priority — Dead/Duplicate Code

| Item | Location | Issue |
|------|----------|-------|
| Legacy `WizardDraft` | `models/wizard.ts` | Old exporter draft shape, still used by `AutomationsContext.addAutomation()`. Should be replaced by `ExporterWizardDraft`. |
| Deprecated fields in `ExporterWizardDraft` | `models/wizard.ts:128-135` | `exporterType`, `selectedSources`, `transactionalSource`, `filters`, `selectedEventSources` — marked "kept for backward compat until migration tasks 6-13 complete" |
| Duplicate field registries | `data/fieldRegistry.ts` vs `utils/source-config-utils.ts` | Two parallel field definition systems. Old uses `FieldDefinition` with `source: 'contact'|'treatment'|'product'`. New uses `SourceFieldDefinition` with `source: string`. |
| `exporter-utils.getFieldsForSources()` | `utils/exporter-utils.ts` | Legacy field resolution using `ExportDataType`. Superseded by `source-config-utils.getFieldsForSourceConfig()`. Still imported but only used in legacy fallback path. |
| Duplicate notification models | `models/importer.ts` + `models/wizard.ts` | Two `NotificationConfig` interfaces with different shapes. |
| Duplicate schedule models | `ScheduleConfig` + `ExporterScheduleConfig` + `ScheduleFrequency` | Three overlapping schedule representations. |
| `filterMigration.ts` | `utils/filterMigration.ts` | Handles legacy `dateRange`-based FilterConfig migration. May be removable once all seed data is clean. |
| `contacts.ts` vs `spaContacts.ts` | `data/` | Two contact datasets — likely overlap. |

### Medium Priority — Shared Abstractions

| Opportunity | Benefit |
|-------------|---------|
| Unified wizard shell component | Both wizards duplicate the 280px sidebar + stepper + breadcrumb + content + nav buttons layout |
| Single field definition source | Consolidate `fieldRegistry.ts` and `source-config-utils.ts` inline arrays |
| Unified notification UI | Importer and exporter both have notification steps with similar UX but different state shapes |
| Remove `addAutomation(draft: WizardDraft)` | Replace with `addAutomationDirect()` everywhere, remove legacy transformation layer |

### Low Priority — Cleanup

- Component library `foundations/*` route redirects → remove once no external links use old paths
- `SourceSelectionStep` component — appears unused after wizard rework (data source selection moved to `DataSourceFilterStep`)
- `EnrichmentSelector` — deleted file reference may still be in imports somewhere
- Unused `tableName` variable in `getEnrichmentFields` for transactions case

---

## Database / Supabase Tables

The prototype uses Supabase when configured, with localStorage fallback. Key tables (via adapters):
- `connections` — connection records
- `connectors` (automations) — automation records
- `contacts` — contact records per account
- `accounts` — account hierarchy

Adapters in `src/lib/adapters/` handle the Supabase ↔ model mapping.

---

## Seed Data Summary

| Entity | Count | Notes |
|--------|-------|-------|
| Accounts | 22 | 3 root orgs, nested hierarchy |
| Connections | 13 | S3, SFTP, Azure Blob across accounts |
| Automations | ~24 | Mix of importers + exporters |
| Transactional Databases | 6 | Spa Bookings, Product Purchases, Treatment History, Membership Rewards Programme, Gift Card Redemptions, Customer Loyalty Points |
| Contacts | ~50 | NZ-themed names across account regions |
| Segments | ~12 | Smart + manual |
| Campaigns | ~8 | Various statuses |

---

## Key Design Decisions

1. **Prototype phases gate features** — not feature flags. Phases are toggled via a floating PhaseToggle control.
2. **Single Automation model** — importers and exporters share one `Automation` interface, distinguished by `direction` field.
3. **Source tags use human-readable names** — contacts shows account name, transactional shows table name, not raw keys.
4. **Per-section add buttons** replace the old generic "Add Automation" + direction modal.
5. **Filter is always valid** — empty filter means "all changes since last export". This is a valid state, not an error.
6. **SelectorCard is the primary selection component** — used for sources, frequency, enrichment. Four variants cover all selection patterns.
7. **InfoHint for annotations** — two variants (inline/panel) replace ad-hoc info text patterns.
8. **HelpPopover for contextual help** — teal (?) button with title + body popover.
