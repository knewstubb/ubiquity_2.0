# Implementation Plan: Field Mapping Source Panel

## Overview

Replace the `EnrichmentSelector` toggle-chip pattern with a multi-source selection system: a source chips row displaying active sources and an "Add source" modal dialog supporting simultaneous activation of Contacts + Messages + N transaction databases. The implementation follows a bottom-up approach: data model → utilities → new components → integration → cleanup.

## Tasks

- [x] 1. Extend data model and utility layer
  - [x] 1.1 Add `enrichments: EnrichmentConfig[]` to all SourceConfig variants
    - Add `enrichments: EnrichmentConfig[]` to `ContactsSourceConfig`, `TransactionsSourceConfig`, and `MessagesSourceConfig` in `src/models/source-selection.ts`
    - Keep the existing `enrichment: EnrichmentConfig | null` field for backward compatibility
    - Add an `enrichmentKey` helper function that returns a unique string identifier for an `EnrichmentConfig` (e.g. `"messages"` or `"txn:tdb-bookings"`)
    - Add a `getSourceTag` helper that maps an `EnrichmentConfig` to the `source` string used on `SourceFieldDefinition` (e.g. `"messages"` or `"txn:tdb-bookings"`)
    - _Requirements: 6.1, 6.4_

  - [x] 1.2 Update `getFieldsForSourceConfig` to support multi-enrichment
    - Modify `getFieldsForSourceConfig` in `src/utils/source-config-utils.ts` to iterate `config.enrichments` array (with fallback to legacy `config.enrichment` if `enrichments` is empty/undefined)
    - Add transaction-table-specific field resolution: for `entity: 'transactions'` enrichments, prefix field keys as `enrichment_txn_{tableId}_{fieldKey}` and labels as `{tableName}: {fieldLabel}`
    - Set the `source` property to `"messages"` for message enrichments and `"txn:{tableId}"` for transaction enrichments
    - Ensure the existing messages enrichment uses `enrichment_messages_{fieldKey}` prefix
    - Look up the table name from `transactionalDatabases` data by `tableId` for label generation
    - _Requirements: 6.2, 6.3, 6.4_

  - [x] 1.3 Write property tests for `getFieldsForSourceConfig` (multi-enrichment)
    - **Property 7: Combined Field Resolution** — generate random valid SourceConfig with 0-1 messages + 0-N transaction enrichments, assert returned array length equals primary field count + sum of each enrichment's field count, and every field has a non-empty `source`
    - **Property 8: Field Key Uniqueness** — generate random multi-table combinations, assert all returned field keys are unique (no duplicates in the array)
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

  - [x] 1.4 Update `resetDownstreamOnSourceChange` to include `enrichments: []`
    - Add `enrichments: []` to each returned config in `resetDownstreamOnSourceChange`
    - Ensure `formatSourceConfigSummary` handles the multi-enrichment case (list enrichment labels)
    - _Requirements: 8.3_

- [x] 2. Build SourceChipsRow component
  - [x] 2.1 Create `SourceChipsRow` component
    - Create `src/components/wizard/SourceChipsRow.tsx` with the `SourceChipsRowProps` interface from the design
    - Render a permanent "Contacts" chip (no X button) as the first element
    - Render a removable chip for each item in `enrichments` — derive label from entity type (`"Messages"` for messages, table name for transactions)
    - Render a "+ Add source" `Button` (secondary, compact) as the trailing element
    - Each removable chip's X button calls `onRemoveEnrichment(index)` with its array index
    - Style using Tailwind + `cn()` utility; chips use `Badge` or custom chip styling consistent with the existing design system
    - Ensure the X button has an accessible label (e.g. `aria-label="Remove Bookings source"`)
    - Ensure the Add Source button is keyboard-focusable and activatable via Enter/Space
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 5.4, 9.1, 9.2_

  - [x] 2.2 Write property test for SourceChipsRow ordering
    - **Property 1: Chip Row Ordering Invariant** — generate random `EnrichmentConfig[]` arrays (0 to N items), render SourceChipsRow, assert rendered element count equals `enrichments.length + 2` (Contacts + enrichment chips + Add button), and order matches [Contacts, ...enrichments, Add button]
    - **Validates: Requirements 1.2, 1.4, 1.5**

- [x] 3. Build AddSourceModal component
  - [x] 3.1 Create `AddSourceModal` component
    - Create `src/components/wizard/AddSourceModal.tsx` with the `AddSourceModalProps` interface from the design
    - Use the shadcn `Dialog` component (compact, not full-width wizard)
    - Render a "Messages" category with a single checkbox labelled "Messages" showing its field count (e.g. "6 fields")
    - Render a "Transaction Databases" category with a checkbox for each entry from `transactionalDatabases`, showing `{name} — {fieldCount} fields`
    - If a source is already in `activeEnrichments`, render its checkbox as checked and disabled
    - Manage internal `pendingSelections: Set<string>` state (string is `"messages"` or `"txn:{tableId}"`)
    - "Done" button calls `onConfirm(newEnrichments)` with the array of newly selected `EnrichmentConfig` objects, then closes
    - Cancel/close discards pending state via `onOpenChange(false)`
    - Implement focus trap (handled by Dialog component) and return focus to trigger on close
    - All checkboxes keyboard-focusable and togglable via Space
    - Each checkbox associated with a visible label via `<Label>`
    - _Requirements: 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.3, 4.4, 9.3, 9.4, 9.5_

  - [x] 3.2 Write property test for AddSourceModal disabled state
    - **Property 2: Active Sources Disabled in Modal** — generate random sets of active enrichments, render AddSourceModal, assert every source present in active set renders as checked + disabled
    - **Validates: Requirements 3.3**

  - [x] 3.3 Write property test for AddSourceModal confirm behaviour
    - **Property 3: Confirm Adds Source Chips** — generate random subsets of available sources, simulate confirm, assert `enrichments` array grows by exactly the count of newly selected sources
    - **Property 5: Cancel Preserves State** — generate random pending states, simulate cancel, assert enrichments/selectedFields/columnRenames unchanged
    - **Validates: Requirements 4.1, 4.4**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Integrate into FieldMappingStep
  - [x] 5.1 Wire SourceChipsRow and AddSourceModal into FieldMappingStep
    - Remove the `EnrichmentSelector` import and its render block from `FieldMappingStep.tsx`
    - Add `SourceChipsRow` and `AddSourceModal` imports
    - Add local `const [modalOpen, setModalOpen] = useState(false)` state
    - Render `SourceChipsRow` in place of the old `EnrichmentSelector`, passing:
      - `primarySource={draft.sourceConfig.primarySource}`
      - `enrichments={draft.sourceConfig.enrichments ?? []}`
      - `onRemoveEnrichment` handler
      - `onOpenAddModal={() => setModalOpen(true)}`
    - Render `AddSourceModal` with:
      - `open={modalOpen}`
      - `onOpenChange={setModalOpen}`
      - `activeEnrichments={draft.sourceConfig.enrichments ?? []}`
      - `onConfirm` handler that appends new enrichments and calls `onUpdate`
    - Implement `handleRemoveEnrichment(index)`: splice enrichment from array, call `onUpdate` with new `enrichments` + filtered `selectedFields` and `columnRenames` (remove fields whose `source` matches the removed enrichment's source tag)
    - Implement `handleConfirmAdd(newEnrichments)`: append to existing enrichments array, call `onUpdate`
    - Ensure `availableContactFields` memo uses the updated `getFieldsForSourceConfig` which now resolves multi-enrichments
    - _Requirements: 1.1, 4.1, 4.2, 5.1, 5.2, 5.3, 7.1, 7.2_

  - [x] 5.2 Write property test for source removal cleanup
    - **Property 6: Removal Cleanup** — generate random enrichments + selected fields, remove one enrichment, assert: (a) enrichments length decreases by 1, (b) no selectedFields have `source` matching removed enrichment's tag, (c) no columnRenames reference field keys from removed source
    - **Validates: Requirements 5.1, 5.2, 5.3, 7.2**

  - [x] 5.3 Update field list select-all to cover all sources
    - Verify the existing `handleSelectAll` logic in FieldMappingStep selects/deselects all `availableContactFields` (which now includes multi-enrichment fields)
    - If needed, adjust the select-all toggle to operate over the full available fields from all active sources
    - _Requirements: 7.5, 7.6_

  - [x] 5.4 Write property test for select-all across sources
    - **Property 10: Select All Covers All Sources** — generate random multi-source available fields, invoke select-all, assert `selectedFields.length` equals total available fields count
    - **Validates: Requirements 7.5**

- [x] 6. Update WizardModal handleDraftUpdate cleanup logic
  - [x] 6.1 Implement multi-source enrichment removal cleanup in WizardModal
    - In `handleDraftUpdate` within `src/components/wizard/WizardModal.tsx`, add array-diff logic when `sourceConfig` changes:
      - Compare old `enrichments[]` vs new `enrichments[]` using `enrichmentKey()` helper
      - For each removed enrichment, get its source tag and filter out matching fields from `selectedFields`
      - Filter `columnRenames` to only retain entries whose `fieldKey` exists in the remaining selected field keys
    - Ensure primary source change still resets everything (existing behaviour via `resetDownstreamOnSourceChange`)
    - _Requirements: 5.2, 5.3, 8.3_

  - [x] 6.2 Write property test for reorder across source boundaries
    - **Property 9: Reorder Across Source Boundaries** — generate random SelectedField arrays with mixed source values + random fromIndex/toIndex, apply reorder, assert array length unchanged and element moved correctly
    - **Validates: Requirements 7.3**

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Cleanup and field list integration verification
  - [x] 8.1 Add fields as unselected when sources are added
    - Verify that when `handleConfirmAdd` appends enrichments, the new fields from `getFieldsForSourceConfig` appear in `availableContactFields` but NOT in `selectedFields` (they remain unselected by default)
    - Verify the field list displays source badges correctly for multi-source fields (existing badge logic should work since `source` is set on each field)
    - _Requirements: 4.2, 6.3, 7.1_

  - [x] 8.2 Write property test for confirm adds fields as unselected
    - **Property 4: Confirm Adds Fields as Unselected** — generate random new source additions, assert available fields grows by sum of each new source's field count, and none of those fields appear in selectedFields
    - **Validates: Requirements 4.2, 7.1**

  - [x] 8.3 Remove EnrichmentSelector component
    - Delete `src/components/wizard/EnrichmentSelector.tsx`
    - Remove any related test file for EnrichmentSelector if it exists
    - Verify no remaining imports reference EnrichmentSelector across the codebase
    - _Requirements: 1.1_

  - [x] 8.4 Verify navigation preserves source selections
    - Ensure that navigating away from FieldMappingStep and returning preserves `enrichments` array, `selectedFields`, and `columnRenames` (the state lives in the draft which is managed by WizardModal — verify this works with the new array structure)
    - _Requirements: 8.1, 8.2_

- [x] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The legacy `enrichment` field is preserved for backward compatibility — `getFieldsForSourceConfig` falls back to it when `enrichments` is empty/undefined
- Transaction database data already exists in `src/data/transactionalData.ts` — no new data files needed
- The existing field list rendering (drag-and-drop, rename, source badges) requires no changes — it operates on the `SourceFieldDefinition[]` returned by utility functions

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.4"] },
    { "id": 2, "tasks": ["1.3", "2.1", "3.1"] },
    { "id": 3, "tasks": ["2.2", "3.2", "3.3"] },
    { "id": 4, "tasks": ["5.1"] },
    { "id": 5, "tasks": ["5.2", "5.3", "6.1"] },
    { "id": 6, "tasks": ["5.4", "6.2", "8.1"] },
    { "id": 7, "tasks": ["8.2", "8.3", "8.4"] }
  ]
}
```
