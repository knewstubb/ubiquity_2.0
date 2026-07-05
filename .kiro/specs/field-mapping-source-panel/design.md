# Design Document: Field Mapping Source Panel

## Overview

This design replaces the existing `EnrichmentSelector` toggle-chip pattern in the exporter wizard's Field Mapping step with a multi-source selection system. The new architecture supports simultaneous activation of multiple data sources (Contacts + Messages + N transaction databases) via a source chips row and a categorised "Add source" modal dialog.

The core change is moving from a single `enrichment: EnrichmentConfig | null` property to an array-based `enrichments: EnrichmentConfig[]` property on `SourceConfig`. This enables the field resolution pipeline, chip display, and cleanup logic to operate over multiple concurrent enrichment sources.

### Key Design Decisions

1. **Array replaces nullable single value** — `enrichment` becomes `enrichments` (plural array). This is the minimal data model change that enables multi-source support without restructuring the entire `SourceConfig` discriminated union.

2. **Contacts is implicit, not stored** — The Contacts chip is always rendered from `sourceConfig.primarySource`. It is never added/removed from `enrichments`. This avoids duplication and aligns with the existing mental model where Contacts is the base entity.

3. **Modal state is local** — The Add Source Modal's pending checkbox state lives in component-local `useState`, not in the draft. Only on "Done" confirmation does the state propagate to `sourceConfig.enrichments` via `onUpdate`.

4. **Field keys are prefixed by source** — Transaction database fields use `txn_{tableId}_{fieldName}` keys to avoid collisions when multiple tables are active simultaneously.

## Architecture

```mermaid
graph TD
    subgraph WizardModal
        Draft[ExporterWizardDraft]
        HandleUpdate[handleDraftUpdate]
    end

    subgraph FieldMappingStep
        SourceChipsRow[SourceChipsRow]
        AddSourceModal[AddSourceModal]
        FieldList[Field List]
    end

    subgraph Utilities
        GetFieldsMulti[getFieldsForSourceConfig - multi]
        CleanupLogic[Multi-source cleanup logic]
    end

    Draft -->|draft prop| FieldMappingStep
    FieldMappingStep -->|onUpdate patch| HandleUpdate
    HandleUpdate -->|enrichments diff| CleanupLogic
    CleanupLogic -->|filtered fields/renames| Draft

    SourceChipsRow -->|"+ Add source" click| AddSourceModal
    AddSourceModal -->|confirmed selections| FieldMappingStep
    SourceChipsRow -->|X click| FieldMappingStep

    FieldMappingStep -->|sourceConfig| GetFieldsMulti
    GetFieldsMulti -->|SourceFieldDefinition[]| FieldList
```

## Components and Interfaces

### New Components

#### `SourceChipsRow`

**Location:** `src/components/wizard/SourceChipsRow.tsx`

```typescript
interface SourceChipsRowProps {
  primarySource: PrimarySourceType;
  enrichments: EnrichmentConfig[];
  onRemoveEnrichment: (index: number) => void;
  onOpenAddModal: () => void;
}
```

Renders:
1. A permanent "Contacts" chip (no X button)
2. A removable chip for each item in `enrichments` — label derived from entity type + tableId for transactions
3. A "+ Add source" button as the trailing element

#### `AddSourceModal`

**Location:** `src/components/wizard/AddSourceModal.tsx`

```typescript
interface AddSourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeEnrichments: EnrichmentConfig[];
  onConfirm: (newEnrichments: EnrichmentConfig[]) => void;
}
```

Renders a `Dialog` containing:
- **Messages category** — single checkbox for the messages entity
- **Transaction Databases category** — one checkbox per entry from `transactionalDatabases`
- Already-active sources shown as checked + disabled
- "Done" button applies pending selections; cancel/close discards

Internal state: `pendingSelections: Set<string>` where the string is either `"messages"` or `"txn:{tableId}"`.

### Modified Components

#### `FieldMappingStep`

- Removes `EnrichmentSelector` import and render
- Adds `SourceChipsRow` and `AddSourceModal` with local `modalOpen` state
- Field resolution uses the updated `getFieldsForSourceConfig` which iterates all enrichments
- Remove handler calls `onUpdate` with updated `enrichments` array + cleanup

#### `WizardModal` (`handleDraftUpdate`)

- Enrichment removal cleanup logic extended from single-entity comparison to array diffing:
  - Compare old `enrichments[]` vs new `enrichments[]`
  - For each removed enrichment, filter out its fields from `selectedFields` and discard associated `columnRenames`

### Unchanged Components

- Field list row rendering (checkboxes, drag-and-drop, rename inputs, source badges) — unchanged
- `ReviewStep`, `OutputConfigStep`, `ScheduleStep` — no changes needed

## Data Models

### Extended `SourceConfig` (source-selection.ts)

```typescript
// Current (single enrichment):
export interface ContactsSourceConfig {
  primarySource: 'contacts';
  filter: ContactsFilterConfig;
  enrichment: EnrichmentConfig | null;  // DEPRECATED
}

// New (multi-source):
export interface ContactsSourceConfig {
  primarySource: 'contacts';
  filter: ContactsFilterConfig;
  enrichment: EnrichmentConfig | null;  // Keep for backward compat (ignored when enrichments present)
  enrichments: EnrichmentConfig[];       // NEW — authoritative source list
}
```

The same pattern applies to `TransactionsSourceConfig` and `MessagesSourceConfig`. The `enrichments` field is the authoritative array. The legacy `enrichment` field is preserved for backward compatibility but ignored when `enrichments` is populated.

### `EnrichmentConfig` for Transaction Databases

Transaction enrichments use the existing `TransactionEnrichmentOptions` interface:

```typescript
interface TransactionEnrichmentOptions {
  entity: 'transactions';
  tableId: string;            // e.g. 'tdb-bookings'
  joinStrategy: JoinStrategy; // defaults to 'most_recent'
}
```

Each transaction database gets its own entry in `enrichments[]` with a distinct `tableId`.

### Field Key Prefixing Strategy

```typescript
// Messages enrichment fields:
`enrichment_messages_${fieldKey}`  // e.g. enrichment_messages_message_id

// Transaction enrichment fields (per-table):
`enrichment_txn_${tableId}_${fieldKey}`  // e.g. enrichment_txn_tdb-bookings_transaction_id
```

The `source` property on `SourceFieldDefinition` is set to:
- `"messages"` for message enrichment fields
- `"txn:{tableId}"` for transaction enrichment fields (enables chip→field mapping for removal)

### Updated `getFieldsForSourceConfig`

```typescript
export function getFieldsForSourceConfig(config: SourceConfig): SourceFieldDefinition[] {
  const primaryFields = getPrimaryFields(config.primarySource);
  const enrichments = config.enrichments ?? (config.enrichment ? [config.enrichment] : []);

  const enrichmentFields = enrichments.flatMap(getEnrichmentFields);
  return [...primaryFields, ...enrichmentFields];
}
```

The `getEnrichmentFields` helper differentiates transaction tables by including `tableId` in the key prefix and using the table name in the label.

### Cleanup Logic in `handleDraftUpdate`

```typescript
// In handleDraftUpdate, when sourceConfig changes:
const oldEnrichments = oldConfig?.enrichments ?? [];
const newEnrichments = newConfig?.enrichments ?? [];

// Find removed enrichments
const removedSources = oldEnrichments.filter(
  (old) => !newEnrichments.some((ne) => enrichmentKey(ne) === enrichmentKey(old))
);

// For each removed source, filter selectedFields and columnRenames
for (const removed of removedSources) {
  const sourceTag = getSourceTag(removed); // "messages" or "txn:tdb-bookings"
  preservedFields = preservedFields.filter((f) => f.source !== sourceTag);
}
preservedRenames = prev.columnRenames.filter((r) => preservedFieldKeys.has(r.fieldKey));
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Chip Row Ordering Invariant

*For any* array of enrichments (0 to N items), the Source Chips Row SHALL render elements in the order: [Contacts chip, ...enrichment chips in array order, Add Source button]. The total rendered element count SHALL equal `enrichments.length + 2` (one Contacts chip + one chip per enrichment + one Add button).

**Validates: Requirements 1.2, 1.4, 1.5**

### Property 2: Active Sources Disabled in Modal

*For any* set of currently active enrichments passed to the Add Source Modal, every source whose enrichment config is present in the active set SHALL render as a checked and disabled checkbox in the modal.

**Validates: Requirements 3.3**

### Property 3: Confirm Adds Source Chips

*For any* subset of available sources selected (checked) in the Add Source Modal, clicking the confirmation button SHALL result in the `enrichments` array growing by exactly the count of newly selected sources, with each new source's config appended.

**Validates: Requirements 4.1**

### Property 4: Confirm Adds Fields as Unselected

*For any* set of newly confirmed source additions, the available fields pool SHALL grow by the sum of each new source's field count, and none of those new fields SHALL appear in the `selectedFields` array.

**Validates: Requirements 4.2, 7.1**

### Property 5: Cancel Preserves State

*For any* pending checkbox state in the Add Source Modal, closing the modal via cancel or the close button SHALL leave `sourceConfig.enrichments`, `selectedFields`, and `columnRenames` identical to their state before the modal was opened.

**Validates: Requirements 4.4**

### Property 6: Removal Cleanup

*For any* enrichment removed from the `enrichments` array (via chip X button), the resulting state SHALL satisfy: (a) the `enrichments` array length decreases by exactly 1, (b) no field in `selectedFields` has a `source` matching the removed enrichment's source tag, and (c) no entry in `columnRenames` references a field key belonging to the removed source.

**Validates: Requirements 5.1, 5.2, 5.3, 7.2**

### Property 7: Combined Field Resolution

*For any* valid `SourceConfig` with any combination of enrichments (0-1 messages + 0-N transaction tables), `getFieldsForSourceConfig` SHALL return a `SourceFieldDefinition[]` whose length equals the sum of: primary source field count + each enrichment's field count. Every returned field SHALL have a non-empty `source` string.

**Validates: Requirements 6.1, 6.2, 6.3**

### Property 8: Field Key Uniqueness

*For any* valid `SourceConfig` with any combination of active enrichments (including multiple transaction tables), all field keys returned by `getFieldsForSourceConfig` SHALL be unique — no two entries share the same `key` value.

**Validates: Requirements 6.4**

### Property 9: Reorder Across Source Boundaries

*For any* array of `SelectedField` items with mixed `source` values, applying `reorderFields(fields, fromIndex, toIndex)` SHALL produce an array of the same length with the element at `fromIndex` moved to `toIndex`, regardless of the `source` values of adjacent elements.

**Validates: Requirements 7.3**

### Property 10: Select All Covers All Sources

*For any* set of available fields from multiple active sources, invoking the select-all action SHALL result in `selectedFields` containing every field from the available pool (all sources combined). The resulting `selectedFields.length` SHALL equal the available fields count.

**Validates: Requirements 7.5**

## Error Handling

| Scenario | Handling |
|---|---|
| `transactionalDatabases` data is empty | Transaction Databases category in the modal renders empty with a "No transaction tables available" message |
| User attempts to add a transaction table whose ID is already in enrichments | Modal checkbox shows as checked + disabled (duplicate prevention) |
| `sourceConfig` is null when FieldMappingStep renders | SourceChipsRow and AddSourceModal are not rendered (same guard as existing EnrichmentSelector) |
| Enrichment removal targets an index out of bounds | No-op — guard `if (index < 0 \|\| index >= enrichments.length) return` |
| Legacy `enrichment` field present but `enrichments` is empty | Migration helper: if `enrichments` is undefined/empty but `enrichment` is non-null, treat it as `enrichments: [enrichment]` |
| Field key collision from unknown source | The prefixing strategy (`enrichment_txn_{tableId}_{field}`) makes collisions structurally impossible for known data |

## Testing Strategy

### Unit Tests (Vitest)

- **SourceChipsRow rendering** — verify chip count, ordering, Contacts permanence, X button presence/absence
- **AddSourceModal** — verify checkbox states for various active enrichment configurations, confirm/cancel behavior
- **getFieldsForSourceConfig (multi)** — verify field resolution with 0, 1, and N enrichments
- **handleDraftUpdate cleanup** — verify field/rename pruning when enrichments are removed
- **Select-all with multi-source** — verify all available fields selected

### Property-Based Tests (Vitest + fast-check)

Property-based testing is appropriate here because:
- The enrichments array can have variable length (0 to N transaction tables)
- Field key uniqueness must hold across all possible combinations
- Cleanup logic must correctly handle any subset removal from any state
- The pure utility functions (`getFieldsForSourceConfig`, cleanup logic) have clear input/output behavior

**Configuration:**
- Library: `fast-check` (already suitable for Vitest)
- Minimum 100 iterations per property
- Each test tagged with: `Feature: field-mapping-source-panel, Property {N}: {title}`

**Properties to implement:**
1. Chip row ordering invariant — generate random EnrichmentConfig arrays
2. Active sources disabled — generate random active sets
3. Confirm adds sources — generate random subsets of available sources
4. Confirm adds fields as unselected — generate random additions
5. Cancel preserves state — generate random pending states
6. Removal cleanup — generate random enrichments + selected fields, remove one
7. Combined field resolution — generate random valid SourceConfig combinations
8. Field key uniqueness — generate random multi-table combinations
9. Reorder across source boundaries — generate random mixed-source arrays + indices
10. Select all covers all sources — generate random multi-source available fields

### Integration Tests

- Wizard step navigation preserves enrichments and field selections (Requirement 8.1, 8.2)
- Primary source change resets enrichments (Requirement 8.3)

