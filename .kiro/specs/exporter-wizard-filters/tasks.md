# Implementation Plan: Exporter Wizard Filters

## Overview

Replace the static `FilterSection` component in the exporter wizard with the shared `FilterBuilder` component. This is primarily a wiring/integration task — the FilterBuilder, FilterGroup model, filter engine, and field registry all exist. The work involves model migration (FilterConfig → FilterGroup), component swapping, ReviewStep update, seed data migration, and legacy cleanup.

## Tasks

- [x] 1. Migrate data models from FilterConfig to FilterGroup
  - [x] 1.1 Update WizardDraft to use FilterGroup
    - In `src/models/wizard.ts`, change the `filters` property type from `FilterConfig` to `FilterGroup` (import from `./segment`)
    - Update `DEFAULT_FILTERS` to an empty FilterGroup: `{ combinator: 'AND', rules: [{ field: '', operator: '', value: '' }], groups: [] }`
    - Remove the `FilterConfig` import from `./connector`
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 1.2 Update Connector interface to use FilterGroup
    - In `src/models/connector.ts`, change `Connector.filters` type from `FilterConfig` to `FilterGroup` (import from `./segment`)
    - Remove the `FilterConfig` interface from `src/models/connector.ts`
    - Remove `FilterConfig` from the re-exports in `src/models/index.ts`
    - _Requirements: 6.1, 8.4_

- [x] 2. Create utility modules
  - [x] 2.1 Create the filterMigration utility
    - Create `src/utils/filterMigration.ts` with `isLegacyFilterConfig()` type guard and `migrateFilters()` function
    - `isLegacyFilterConfig` detects objects with a `dateRange` property (which FilterGroup never has)
    - `migrateFilters` returns a valid empty FilterGroup for legacy shapes, passes through valid FilterGroups unchanged
    - Also handle corrupted/invalid values by returning an empty FilterGroup
    - _Requirements: 7.2_

  - [x] 2.2 Create the filterSummary utility
    - Create `src/utils/filterSummary.ts` with `summariseFilterGroup()` and `hasCompleteRules()` functions
    - `summariseFilterGroup` converts a FilterGroup into a structured summary (field label, operator label, value) for each complete rule
    - Include combinator text (AND/OR) between rules and nested groups
    - Use `getFieldByKey` from the field registry to resolve field labels
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]* 2.3 Write property test for legacy FilterConfig migration
    - **Property 6: Legacy FilterConfig migration**
    - **Validates: Requirements 7.2**

  - [ ]* 2.4 Write property test for filter summary completeness
    - **Property 4: Filter summary completeness**
    - **Validates: Requirements 5.1, 5.2, 5.3**

- [x] 3. Checkpoint — Verify compilation
  - Ensure all tests pass, ask the user if questions arise. Run `npx tsc --noEmit` and `npx vitest --run` to verify no type errors from the model migration.

- [x] 4. Wire FilterBuilder into the DataSourceStep
  - [x] 4.1 Replace FilterSection with FilterBuilder in DataSourceStep
    - In `src/components/wizard/DataSourceStep.tsx`, replace the `FilterSection` import with `FilterBuilder` from `../../components/shared/FilterBuilder`
    - Import `getFieldsForDataType` from `../../data/fieldRegistry`
    - Import `FilterGroup` from `../../models/segment` (remove `FilterConfig` import)
    - Compute fields using `getFieldsForDataType(draft.dataType, draft.transactionalSource)` and pass as `fields` prop
    - Pass `draft.filters` as `value` prop and wire `onChange` to update `draft.filters` via `onUpdate`
    - Update the filters row hint text from "Preview only — filters are not applied in this demo" to "Narrow down the records to export"
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4_

  - [ ]* 4.2 Write property test for field selection matching data type
    - **Property 2: Field selection matches data type**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

- [x] 5. Update ReviewStep to display FilterGroup summary
  - [x] 5.1 Replace legacy filter display with FilterGroup summary
    - In `src/components/wizard/ReviewStep.tsx`, remove the legacy `dateRange`, `membershipTier`, and `transactionType` display rows
    - Import and use `summariseFilterGroup` and `hasCompleteRules` from `../../utils/filterSummary`
    - When the FilterGroup has complete rules, render each rule as "Field Operator Value" with combinators between groups
    - When the FilterGroup has no complete rules, display "No filters applied"
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 5.2 Write unit tests for ReviewStep filter display
    - Test "No filters applied" for empty FilterGroup
    - Test rule summary rendering for FilterGroup with complete rules
    - Test combinator display for nested groups
    - Verify legacy dateRange/membershipTier/transactionType labels are not rendered
    - _Requirements: 5.1, 5.4, 5.5_

- [x] 6. Add localStorage migration guard
  - [x] 6.1 Add migrateFilters call to ConnectorsContext
    - In `src/contexts/ConnectorsContext.tsx`, import `migrateFilters` from `../utils/filterMigration`
    - In the `loadConnectors()` function, map each parsed connector through `migrateFilters` on its `filters` field
    - This ensures existing localStorage data with old FilterConfig shapes loads correctly
    - _Requirements: 7.1, 7.2_

  - [ ]* 6.2 Write property test for connector save/load round-trip
    - **Property 5: Connector save/load round-trip**
    - **Validates: Requirements 6.2, 6.3**

- [x] 7. Migrate test fixtures from FilterConfig to FilterGroup
  - [x] 7.1 Update ConnectorsContext test fixtures
    - In `src/contexts/ConnectorsContext.test.tsx`, update `makeDraft` and all test fixtures to use FilterGroup shape instead of FilterConfig
    - Replace `{ dateRange: 'all_time' }` with `{ combinator: 'AND', rules: [{ field: '', operator: '', value: '' }], groups: [] }`
    - Replace `{ dateRange: 'last_30_days', membershipTier: 'Gold' }` and similar with equivalent empty FilterGroups
    - Update the localStorage persistence test fixture similarly
    - _Requirements: 7.1_

  - [x] 7.2 Update ConnectionRow test fixtures
    - In `src/components/dashboard/ConnectionRow.test.tsx`, update `mockConnectors` to use FilterGroup shape instead of FilterConfig
    - Replace `{ dateRange: 'all_time' }` and `{ dateRange: 'last_30_days' }` with FilterGroup objects
    - _Requirements: 7.1_

- [x] 8. Checkpoint — Verify all tests pass
  - Ensure all tests pass, ask the user if questions arise. Run `npx vitest --run` to confirm all test fixtures are correctly migrated.

- [x] 9. Delete legacy FilterSection component
  - [x] 9.1 Remove FilterSection files
    - Delete `src/components/wizard/FilterSection.tsx`
    - Delete `src/components/wizard/FilterSection.module.css`
    - Verify no remaining imports or references to `FilterSection` across the codebase
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 10. Final checkpoint — Verify clean build and all tests pass
  - Ensure all tests pass, ask the user if questions arise. Run `npx tsc --noEmit` and `npx vitest --run` to confirm clean build with no dead code references.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The FilterBuilder component, FilterGroup model, evaluateFilterGroup engine, and getFieldsForDataType registry all exist — this is wiring work
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation after model migration and test fixture updates
- Property tests validate universal correctness properties from the design document
