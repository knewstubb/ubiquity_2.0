# Design: Connectors

> **Last updated:** 2026-08-11
> **Status:** ✅ Shipped
> **Consolidated from:** `integrations/`, `connector-data-persistence/`, `exporter-wizard-rework/`
> **Implementation:** `src/pages/ExporterWizardPage.tsx`, `src/pages/ImporterWizardPage.tsx`, `src/components/wizard/`, `src/components/importer/`

## Design Goals

- **Unified data flow** — Both import and export automations share the same connection infrastructure and lifecycle patterns
- **Full persistence** — All configuration persists to Supabase; no client-only state that gets lost
- **Callback-based state lifting** — Wizard steps report changes via `onUpdate` callbacks; parent owns complete state
- **Progressive disclosure** — Complex options (enrichments, filters) appear only when relevant
- **Consistent notifications** — Importers and exporters share the same notification pattern (failure, success, no-file)

## Design Principles

| Principle | Application |
|-----------|-------------|
| Journey-centric | Wizards guide users through configuration step-by-step |
| Context preservation | Full-page wizards with breadcrumbs; settings in modal overlays |
| Progressive disclosure | Filter builder only shown when "Filtered" mode selected |
| Opinionated defaults | NZ timezone, sensible CSV settings, daily schedule |

---

## Screens & Components

### Page: Connectors Dashboard

**Route:** `/` (root of Audience > Connectors)

**Layout:**
- Breadcrumb: Audience > Connectors
- Page header with title, subtitle ("{X} connections · {Y} automations"), "+ New Connection" button
- Connection list — expandable rows with nested automation cards

**Connection Row (collapsed):**
- Protocol icon (S3/SFTP/Azure)
- Connection name
- Automation count badge
- Meatball menu (Edit, Delete)

**Connection Row (expanded):**
- Same header
- Nested automation cards
- "+ Add Automation" dashed button

**Automation Card:**
- Direction icon (↓ import / ↑ export) + name
- Data type badge
- Last run status + time
- Active/paused toggle
- Meatball menu (Edit, Settings, Activity Log, History, Delete)

### Page: Exporter Wizard

**Route:** `/exporters/new/:connectionId` or `/exporters/edit/:automationId`

**Layout:**
- Full-page (no nav bar)
- Left sidebar: connection context, 6-step stepper, phase toggle
- Right content: step-specific UI, navigation buttons

**Steps:**
1. **File Settings** — Name, prefix, destination path, CSV options
2. **Data Source** — Primary source selection, enrichments
3. **Filter** — All changes vs filtered (card-based filter builder)
4. **Export Fields** — Field selection, reordering, column renaming
5. **Schedule** — Frequency, day selection, notifications
6. **Review** — Summary with edit links

### Page: Importer Wizard

**Route:** `/importers/new/:connectionId` or `/importers/edit/:automationId`

**Layout:**
- Full-page (no nav bar)
- Left sidebar: connection context, step stepper
- Right content: step-specific UI, navigation buttons

**Steps:**
1. **File Settings** — Path mode, folder name, file patterns
2. **File Format** — CSV delimiter, encoding, header detection
3. **Data Type** — Contact, Transactional, or Both
4. **Configuration** — Update type, blank handling, matching fields, dedupe
5. **Field Mapping** — Source-to-target mappings, lookup fields, import defaults
6. **Notifications** — Failure, success, no-file alerts
7. **Review** — Summary with edit links

### Modal: Automation Settings

**Trigger:** Click automation card on dashboard

**Layout:**
- Modal overlay (standard width)
- Tabs or sections for different config areas
- Read-only display of all persisted configuration
- Edit button opens wizard in edit mode

### Modal: Create Connection

**Trigger:** "+ New Connection" button

**Layout:**
- Protocol selection (S3, SFTP, Azure)
- Protocol-specific credential fields
- Connection name
- Test connection action
- Save/Cancel buttons

---

## Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| Expand connection | Click row | Shows nested automations |
| Add automation | "+ Add Automation" | Opens InitialModal (name + direction) |
| Proceed from InitialModal | Click "Proceed" | Navigates to wizard page |
| Navigate wizard | Back/Next buttons | Step transitions with validation |
| Complete wizard | "Create" on Review | Persists to Supabase, redirects to dashboard |
| Toggle automation | Switch on card | Pause (immediate) or activate (billing confirm) |
| Edit automation | Meatball menu | Opens wizard pre-populated |
| Delete automation | Meatball menu | Confirmation modal (type "DELETE") |

## Accessibility Notes

- All form controls have visible labels
- Stepper steps are keyboard navigable
- Filter builder cards are focusable
- Modal dialogs trap focus
- Confirmation dialogs require explicit action (not just click-away)

---

## Architecture

### Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         App Shell                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    AppProviders                           │  │
│  │  ┌─────────────────┐  ┌─────────────────┐                │  │
│  │  │ ConnectionsCtx  │  │ AutomationsCtx  │                │  │
│  │  └────────┬────────┘  └────────┬────────┘                │  │
│  │           │                    │                          │  │
│  │           └──────────┬─────────┘                          │  │
│  │                      │                                    │  │
│  │  ┌──────────────────────────────────────────────────┐    │  │
│  │  │              Connectors Adapter                   │    │  │
│  │  │   (mapRowToConnector / mapConnectorToRow)        │    │  │
│  │  └──────────────────────┬───────────────────────────┘    │  │
│  │                         │                                 │  │
│  │                    ┌────▼────┐                            │  │
│  │                    │ Supabase │                           │  │
│  │                    └─────────┘                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Components

| Component | Role | Location |
|-----------|------|----------|
| ExporterWizardPage | Full-page wizard host | `src/pages/ExporterWizardPage.tsx` |
| ImporterWizardPage | Full-page wizard host | `src/pages/ImporterWizardPage.tsx` |
| WizardModal | Exporter step container | `src/components/wizard/WizardModal.tsx` |
| ImporterWizardModal | Importer step container | `src/components/importer/ImporterWizardModal.tsx` |
| SourceSelectionStep | Data source + enrichments | `src/components/wizard/SourceSelectionStep.tsx` |
| DataSourceFilterStep | Filter builder UI | `src/components/wizard/DataSourceFilterStep.tsx` |
| FieldMappingStep | Field picker + preview | `src/components/wizard/FieldMappingStep.tsx` |
| OutputConfigStep | File settings | `src/components/wizard/OutputConfigStep.tsx` |
| ScheduleStep | Frequency + notifications | `src/components/wizard/ScheduleStep.tsx` |
| ReviewStep | Summary view | `src/components/wizard/ReviewStep.tsx` |
| AutomationSettingsModal | Read-only config view | `src/components/shared/AutomationSettingsModal.tsx` |

### Data Model

#### Connection

```typescript
interface Connection {
  id: string;
  accountId: string;
  name: string;
  protocol: 'S3' | 'SFTP' | 'AzureBlob';
  status: 'connected' | 'error';
  basePath: string;
  config: S3Config | SFTPConfig | AzureBlobConfig;
  createdAt: string;
  updatedAt: string;
}
```

#### Automation

```typescript
interface Automation {
  id: string;
  connectionId: string;
  name: string;
  direction: 'import' | 'export';
  dataType: ExportDataType;
  transactionalSource?: TransactionalSource;
  selectedFields: SelectedField[];
  fileType: FileType;
  formatOptions: FormatOptions;
  fileNamingPattern: string;
  schedule: ScheduleFrequency;
  scheduleConfig?: ScheduleConfig;
  filters: FilterGroup;
  status: AutomationStatus;
  notifications?: ExporterNotificationConfig;
  importerConfig?: ImporterConfig;  // Present when direction === 'import'
  createdAt: string;
  updatedAt: string;
}
```

#### SourceConfig (Exporter)

```typescript
type SourceConfig =
  | ContactsSourceConfig
  | TransactionsSourceConfig
  | MessagesSourceConfig;

interface ContactsSourceConfig {
  primarySource: 'contacts';
  filter: ContactsFilterConfig;
  enrichment: EnrichmentConfig | null;
  enrichments: EnrichmentConfig[];  // Multi-enrichment support
}

interface TransactionsSourceConfig {
  primarySource: 'transactions';
  tableId: string;
  filter: TransactionsFilterConfig;
  enrichment: EnrichmentConfig | null;
  enrichments: EnrichmentConfig[];
}

interface MessagesSourceConfig {
  primarySource: 'messages';
  channels: Channel[];
  filter: MessagesFilterConfig;
  enrichment: EnrichmentConfig | null;
  enrichments: EnrichmentConfig[];
}

type EnrichmentConfig =
  | { entity: 'contacts' }
  | { entity: 'transactions'; tableId: string; joinStrategy: JoinStrategy }
  | { entity: 'messages'; channel: Channel; statuses: MessageStatus[] };
```

#### ImporterConfig

```typescript
interface ImporterConfig {
  connectionId: string;
  name: string;
  dataType: ImportDataType | null;
  filePathConfig: FilePathConfig;
  csvFormat: CsvFormatConfig;
  notifications: NotificationConfig;
  contactConfig: ContactConfig;
  contactMapping: FieldMapping[];
  transactionalConfig: TransactionalConfig;
  transactionalMapping: FieldMapping[];
  transactionalTable?: string;
  csvHeaders?: string[];
  lookupMappings?: LookupMapping[];
  importDefaults?: ImportDefaultRow[];
}
```

### State Management

**Pattern:** Callback-based state lifting

Wizard steps are controlled components that receive `value` and `onUpdate` props:

```typescript
interface StepProps<T> {
  value: T;
  onUpdate: (value: T) => void;
}
```

The parent wizard modal owns the complete draft state:

```typescript
// ExporterWizardModal
const [draft, setDraft] = useState<ExporterWizardDraft>(initialDraft);

const handleDraftUpdate = (patch: Partial<ExporterWizardDraft>) => {
  setDraft(prev => ({ ...prev, ...patch }));
};

// Pass to step
<FieldMappingStep draft={draft} onUpdate={handleDraftUpdate} />
```

**Why not Context?**
- Wizards have a known, linear step sequence
- One level of prop passing (parent → step) is simpler than another context
- Draft state is scoped to the wizard session, not app-wide

### Persistence

**Adapter:** `src/lib/adapters/connectors-adapter.ts`

The adapter handles:
- `mapRowToConnector(row)` — Supabase row → TypeScript `Automation`
- `mapConnectorToRow(connector)` — TypeScript `Automation` → Supabase row
- `getAll(accountId)` — Fetch all automations for account
- `add(connector)` — Insert new automation
- `update(id, updates)` — Partial update
- `delete(id)` — Remove automation

**JSONB columns:**
- `importer_config` — Full `ImporterConfig` object (importers only)
- `format_options` — File formatting settings
- `filters` — Dynamic filter rules
- `selected_fields` — Ordered field list
- `notifications` — Alert configuration
- `schedule_config` — Full schedule details

---

## Trade-offs & Alternatives

| Decision | Chosen | Alternative | Rationale |
|----------|--------|-------------|-----------|
| Full-page wizard vs modal | Full-page | Modal overlay | Complex multi-step flow benefits from dedicated screen; easier to handle validation states |
| Callback state lifting vs Context | Callbacks | WizardContext | One level of prop passing is simpler; Context would add indirection for minimal benefit |
| Multi-enrichment array | Yes | Single enrichment | Future-proofs for complex exports (contacts + transactions + messages) |
| JSONB columns | Yes | Normalized tables | Config is always read/written as a unit; schema flexibility for future fields |
| Shared NotificationsStep | Yes | Separate per wizard | Importer and exporter notifications have identical structure |

---

## Open Questions

| # | Question | Status |
|---|----------|--------|
| 1 | Should event-based exporters have a separate wizard flow? | Deferred — current flow adapts based on source selection |
| 2 | What happens to running automations when connection edited? | TBD — need to define pause/resume behavior |
| 3 | Should field mapping support formula/transformation? | Phase 2 consideration |
