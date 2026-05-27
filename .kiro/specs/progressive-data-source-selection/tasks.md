# Implementation Plan: Progressive Data Source Selection

## Overview

Replace the exporter wizard's two-step source selection (TypeSelectionStep → DataSourceStep/EventSourceStep) with a single SourceSelectionStep using progressive disclosure. The implementation follows a bottom-up approach: data models and validation first, then utility functions, then the hook, then UI components, and finally wizard integration.

## Tasks

- [x] 1. Define data models and type system
  - [x] 1.1 Create source selection type definitions
    - Create `src/models/source-selection.ts` with all new types: `PrimarySourceType`, `Channel`, `JoinStrategy`, `MessageStatus`, filter config types (`ContactsFilterConfig`, `TransactionsFilterConfig`, `MessagesFilterConfig`), enrichment config types (`TransactionEnrichmentOptions`, `MessageEnrichmentOptions`, `ContactEnrichmentOptions`, `EnrichmentConfig`), and the top-level `SourceConfig` discriminated union (`ContactsSourceConfig`, `TransactionsSourceConfig`, `MessagesSourceConfig`)
    - Export `FieldFilterRow` interface for the transaction field filter builder
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 10.1_

  - [x] 1.2 Update ExporterWizardDraft to use SourceConfig
    - Modify `src/models/wizard.ts` to add `sourceConfig: SourceConfig | null` to `ExporterWizardDraft`
    - Remove deprecated fields (`exporterType`, `selectedSources`, `transactionalSource`, `filters`, `selectedEventSources`) from the interface
    - Update `DEFAULT_EXPORTER_DRAFT` to include `sourceConfig: null`
    - _Requirements: 9.1, 10.1_

- [x] 2. Implement validation functions
  - [x] 2.1 Create validation module
    - Create `src/utils/source-selection-validation.ts`
    - Implement `isSourceConfigComplete(config: SourceConfig | null): boolean` — returns true when primary source is selected, sub-source is chosen (if applicable), and filter is valid
    - Implement `isFilterComplete(config: SourceConfig): boolean` — validates filter type is selected and all required secondary inputs are valid per filter type rules
    - Implement `isEnrichmentComplete(enrichment: EnrichmentConfig | null): boolean` — validates enrichment-specific required fields
    - Implement `validateDays(value: number): boolean` — returns true for integers 1–365
    - Implement `validateDateRange(start: string, end: string): boolean` — returns true when start ≤ end
    - _Requirements: 2.2, 2.3, 2.6, 2.7, 3.3, 3.6, 3.7, 4.5, 4.8, 4.9, 5.9, 10.4_

  - [x]* 2.2 Write property test: Days input validation (Property 2)
    - **Property 2: Days input validation**
    - Test that `validateDays` returns valid iff value is integer in 1–365
    - Generator: arbitrary numbers (integers, floats, negatives, zero, large values)
    - **Validates: Requirements 2.2, 2.3, 3.3**

  - [x]* 2.3 Write property test: Filter completeness (Property 3)
    - **Property 3: Filter completeness**
    - Test that `isFilterComplete` returns true iff filter type is selected AND all required secondary inputs are valid
    - Generator: random filter configs with varying completeness
    - **Validates: Requirements 2.6, 2.7, 3.6, 3.7, 4.9**

  - [x]* 2.4 Write property test: Date range validation (Property 5)
    - **Property 5: Date range validation**
    - Test that `validateDateRange` returns valid iff start ≤ end
    - Generator: random ISO date string pairs
    - **Validates: Requirements 4.8**

  - [x]* 2.5 Write property test: Enrichment completeness (Property 7)
    - **Property 7: Enrichment completeness**
    - Test that `isEnrichmentComplete` returns true iff all required fields for that enrichment type are populated
    - Generator: random EnrichmentConfig objects with varying completeness
    - **Validates: Requirements 5.9**

  - [x]* 2.6 Write property test: Enrichment options exclude primary source (Property 6)
    - **Property 6: Enrichment options exclude primary source**
    - Test that `getAvailableEnrichments(primarySource)` never includes the primary source entity
    - Generator: all three PrimarySourceType values
    - **Validates: Requirements 5.2**

- [x] 3. Implement utility functions
  - [x] 3.1 Create source config utilities module
    - Create `src/utils/source-config-utils.ts`
    - Implement `getFieldsForSourceConfig(config: SourceConfig): FieldDefinition[]` — returns primary source fields + enrichment fields (prefixed with entity name)
    - Implement `serialiseSourceConfig(config: SourceConfig): string | null` — returns null if config is incomplete
    - Implement `deserialiseSourceConfig(json: string): SourceConfig` — parses JSON back to typed config
    - Implement `formatSourceConfigSummary(config: SourceConfig): string` — human-readable summary for Review step
    - Implement `getAvailableEnrichments(primarySource: PrimarySourceType): EnrichmentEntity[]` — returns entities excluding primary source
    - Implement `resetDownstreamOnSourceChange(config: SourceConfig, newSource: PrimarySourceType): SourceConfig` — resets filter + enrichment when primary source changes
    - Implement `formatMatchCount(count: number): string` — locale-formatted count with thousand separators
    - _Requirements: 5.2, 9.2, 9.6, 10.1, 10.4, 10.5, 10.6, 7.1_

  - [x]* 3.2 Write property test: Primary source change resets downstream (Property 1)
    - **Property 1: Primary source change resets downstream state**
    - Test that changing primary source resets filter to default and enrichment to null
    - Generator: random valid SourceConfig × random different PrimarySourceType
    - **Validates: Requirements 1.4**

  - [x]* 3.3 Write property test: Serialisation guard (Property 13)
    - **Property 13: Serialisation guard**
    - Test that `serialiseSourceConfig` returns null for incomplete configs
    - Generator: random incomplete SourceConfig objects
    - **Validates: Requirements 10.4**

  - [x]* 3.4 Write property test: Serialisation round-trip (Property 14)
    - **Property 14: Serialisation round-trip**
    - Test that `deserialiseSourceConfig(serialiseSourceConfig(config))` deeply equals original
    - Generator: random valid complete SourceConfig objects
    - **Validates: Requirements 10.5**

  - [x]* 3.5 Write property test: Pretty printer accepts any valid config (Property 15)
    - **Property 15: Pretty printer accepts any valid config**
    - Test that `formatSourceConfigSummary` returns a non-empty string for any valid config
    - Generator: random valid complete SourceConfig objects
    - **Validates: Requirements 10.6**

  - [x]* 3.6 Write property test: Match count locale formatting (Property 9)
    - **Property 9: Match count locale formatting**
    - Test that `formatMatchCount` produces locale-appropriate thousand separators and parses back to original
    - Generator: random non-negative integers
    - **Validates: Requirements 7.1**

  - [x]* 3.7 Write property test: Field resolution from source config (Property 11)
    - **Property 11: Field resolution from source config**
    - Test that `getFieldsForSourceConfig` returns union of primary + enrichment fields with no duplicate keys per prefix
    - Generator: random valid SourceConfig objects
    - **Validates: Requirements 9.2**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement useMatchCount hook
  - [x] 5.1 Create useMatchCount hook
    - Create `src/hooks/useMatchCount.ts`
    - Implement debounced match count calculation (500ms debounce)
    - Simulate async computation with 300–800ms random delay
    - Compute count from in-memory seed data (contacts, transactions, messages)
    - Return `{ count: number | null; loading: boolean; error: boolean; retry: () => void }`
    - Implement 10s timeout that triggers error state
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x]* 5.2 Write unit tests for useMatchCount hook
    - Test loading state during calculation
    - Test debounce fires only once after rapid changes
    - Test error state on timeout
    - Test retry resets error and recalculates
    - Test returns null when config is null
    - _Requirements: 7.2, 7.3, 7.4_

- [x] 6. Implement filter panel components
  - [x] 6.1 Create ContactsFilterPanel component
    - Create `src/components/wizard/source-selection/ContactsFilterPanel.tsx`
    - Render mutually exclusive canned filter options: All contacts, Created in last N days, In list/segment, Unsubscribed, Not sent campaign
    - Implement secondary inputs: days numeric input (1–365 validation), searchable segment selector, campaign selector with cross-entity label
    - Show inline validation errors for invalid inputs
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.7_

  - [x] 6.2 Create TransactionsFilterPanel component
    - Create `src/components/wizard/source-selection/TransactionsFilterPanel.tsx`
    - Render canned filter options: All records, Created in last N days, Field/operator/value builder
    - Implement field filter builder with add/remove rows (max 10), AND logic
    - Show inline validation for incomplete rows
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x] 6.3 Create MessagesFilterPanel component
    - Create `src/components/wizard/source-selection/MessagesFilterPanel.tsx`
    - Render canned filter options: All sends, By status, For specific campaign, In date range
    - Implement status multi-select (Delivered, Bounced, Failed, Opened), campaign selector, date range inputs
    - Show inline validation for incomplete selections and invalid date ranges
    - _Requirements: 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

  - [x]* 6.4 Write property test: Transaction field filter AND logic (Property 4)
    - **Property 4: Transaction field filter AND logic**
    - Test that combined filter matches record iff record satisfies every individual row
    - Generator: random filter row sets × random record objects
    - **Validates: Requirements 3.5**

- [x] 7. Implement source selector components
  - [x] 7.1 Create PrimarySourceSelector component
    - Create `src/components/wizard/source-selection/PrimarySourceSelector.tsx`
    - Render three mutually exclusive radio-style cards: Contacts, Transactions, Messages
    - Emit confirmation dialog when changing selection with downstream config present
    - On confirm, call `resetDownstreamOnSourceChange`; on cancel, revert selection
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 7.2 Create SubSourceSelector component
    - Create `src/components/wizard/source-selection/SubSourceSelector.tsx`
    - Render conditionally based on primary source type
    - For Transactions: dropdown of available transaction tables
    - For Messages: channel selector (Email, SMS, Push) with auto-select when only one exists
    - For Contacts: render nothing (no sub-source needed)
    - _Requirements: 3.1, 3.8, 4.1, 4.2, 4.3_

  - [x] 7.3 Create MatchCountIndicator component
    - Create `src/components/wizard/source-selection/MatchCountIndicator.tsx`
    - Display formatted count with entity label, loading spinner, error state with retry button, or "0 records match"
    - Use `formatMatchCount` for locale formatting
    - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [x] 8. Implement enrichment components
  - [x] 8.1 Create EnrichmentSection component
    - Create `src/components/wizard/source-selection/EnrichmentSection.tsx`
    - Show available enrichment options (excludes primary source entity via `getAvailableEnrichments`)
    - Render inline config for selected enrichment
    - Provide remove action to clear enrichment
    - Limit to one enrichment layer in v1
    - _Requirements: 5.1, 5.2, 5.6, 5.7, 5.8_

  - [x] 8.2 Create enrichment config sub-components
    - Create `src/components/wizard/source-selection/TransactionEnrichmentConfig.tsx` — table selector + join strategy selector
    - Create `src/components/wizard/source-selection/MessageEnrichmentConfig.tsx` — channel selector + status multi-select
    - Create `src/components/wizard/source-selection/ContactEnrichmentConfig.tsx` — auto-joined via Contact ID, no additional config
    - Implement join strategy selector with "Most recent record" (default) and "All records" options
    - Show fan-out warning when "All records" is selected
    - _Requirements: 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x]* 8.3 Write property test: Most recent record join resolution (Property 8)
    - **Property 8: Most recent record join resolution**
    - Test that "most recent record" join selects exactly the record with latest created-date
    - Generator: random arrays of records with distinct dates
    - **Validates: Requirements 6.2**

- [x] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement SourceSelectionStep orchestrator
  - [x] 10.1 Create SourceSelectionStep component
    - Create `src/components/wizard/SourceSelectionStep.tsx`
    - Orchestrate four-beat progressive disclosure flow
    - Manage internal beat visibility state: Beat N+1 visible only when Beat N is complete
    - Compose PrimarySourceSelector, SubSourceSelector, filter panels, MatchCountIndicator, and EnrichmentSection
    - Wire `useMatchCount` hook to current source config
    - Props: `{ draft: ExporterWizardDraft; onUpdate: (patch: Partial<ExporterWizardDraft>) => void }`
    - _Requirements: 1.2, 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x]* 10.2 Write property test: Progressive disclosure visibility (Property 10)
    - **Property 10: Progressive disclosure visibility**
    - Test that beat N+1 is only visible when beat N is complete
    - Generator: random partial SourceConfig states
    - **Validates: Requirements 8.3**

- [x] 11. Integrate with WizardModal
  - [x] 11.1 Update WizardModal step array and routing
    - Modify `src/components/wizard/WizardModal.tsx`
    - Replace TypeSelectionStep + DataSourceStep/EventSourceStep with single SourceSelectionStep
    - Update step definitions: 6 steps instead of 7 (Source → Field Mapping → File Config → Schedule → Notifications → Review)
    - Update `canProceed` for Step 0 to use `isSourceConfigComplete(draft.sourceConfig)`
    - Update stepper label logic: show "{PrimarySourceName} Source" when selected, "Source" otherwise
    - _Requirements: 1.5, 9.1, 9.5_

  - [x] 11.2 Implement field clearing logic in WizardModal
    - When primary source or sub-source changes, clear `selectedFields` and `columnRenames`
    - When only filter/enrichment changes, preserve valid field selections and remove only fields from removed enrichment entity
    - _Requirements: 9.4, 9.6_

  - [x]* 11.3 Write property test: Field preservation on filter/enrichment-only changes (Property 12)
    - **Property 12: Field preservation on filter/enrichment-only changes**
    - Test that primary source fields are preserved when only filter/enrichment changes
    - Generator: random field sets × config pairs differing only in filter/enrichment
    - **Validates: Requirements 9.6**

- [x] 12. Update FieldMappingStep and ReviewStep
  - [x] 12.1 Update FieldMappingStep to use getFieldsForSourceConfig
    - Modify `src/components/wizard/FieldMappingStep.tsx`
    - Replace `getFieldsForDataType` with `getFieldsForSourceConfig(draft.sourceConfig)`
    - Include enrichment entity fields prefixed with entity name when enrichment is configured
    - _Requirements: 9.2_

  - [x] 12.2 Update ReviewStep to use formatSourceConfigSummary
    - Modify `src/components/wizard/ReviewStep.tsx`
    - Use `formatSourceConfigSummary(draft.sourceConfig)` for the source selection summary section
    - _Requirements: 10.6_

- [x] 13. Handle edit mode hydration and stale references
  - [x] 13.1 Implement config hydration for edit mode
    - Update WizardModal's `initialDraft` logic to hydrate `sourceConfig` from persisted automation data
    - Implement stale reference detection: mark invalid segment/campaign/table references with validation indicator
    - Allow user to correct stale references before proceeding
    - _Requirements: 10.2, 10.3_

- [x] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using fast-check
- Unit tests validate specific examples and edge cases
- The implementation uses TypeScript throughout, matching the existing project stack
- All new components follow the project's Tailwind CSS styling approach with `cn()` utility

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "3.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.4", "2.5", "2.6", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "5.1"] },
    { "id": 4, "tasks": ["5.2", "6.1", "6.2", "6.3", "7.1", "7.2", "7.3"] },
    { "id": 5, "tasks": ["6.4", "8.1", "8.2"] },
    { "id": 6, "tasks": ["8.3", "10.1"] },
    { "id": 7, "tasks": ["10.2", "11.1"] },
    { "id": 8, "tasks": ["11.2", "12.1", "12.2"] },
    { "id": 9, "tasks": ["11.3", "13.1"] }
  ]
}
```
