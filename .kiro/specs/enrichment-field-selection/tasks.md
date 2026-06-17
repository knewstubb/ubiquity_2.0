# Implementation Plan: Enrichment Field Selection

## Overview

Add an EnrichmentSelector component to the FieldMappingStep that lets users toggle additional source entities (contacts, transactions, messages) to pull fields from — independently of their filter configuration. The implementation builds the utility helper first, then the UI component, then integrates it into the existing wizard flow.

## Tasks

- [x] 1. Create `createDefaultEnrichmentConfig` utility function
  - [x] 1.1 Add `createDefaultEnrichmentConfig` to `src/utils/source-config-utils.ts`
    - Implement the function that accepts an `EnrichmentEntity` and returns a default `EnrichmentConfig`
    - For `'contacts'`: return `{ entity: 'contacts' }`
    - For `'transactions'`: return `{ entity: 'transactions', tableId: '', joinStrategy: 'most_recent' }`
    - For `'messages'`: return `{ entity: 'messages', channel: 'email', statuses: ['delivered'] }`
    - Export the function
    - _Requirements: 2.1_

  - [x]* 1.2 Write property test for available enrichment derivation
    - **Property 1: Available enrichment derivation**
    - Generate random `PrimarySourceType` values, verify `getAvailableEnrichments` returns exactly the two entities that differ from the primary source
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

  - [x]* 1.3 Write property test for enrichment field prefixing
    - **Property 2: Enrichment field key and label prefixing**
    - Generate random valid `EnrichmentConfig` objects, call `getFieldsForSourceConfig` with a matching `SourceConfig`, verify all enrichment fields have keys prefixed with `enrichment_{entity}_` and labels prefixed with capitalised singular entity name followed by `: `
    - **Validates: Requirements 3.1**

- [x] 2. Implement the EnrichmentSelector component
  - [x] 2.1 Create `src/components/wizard/EnrichmentSelector.tsx`
    - Define `EnrichmentSelectorProps` interface: `{ primarySource: PrimarySourceType; currentEnrichment: EnrichmentConfig | null; onEnrichmentChange: (enrichment: EnrichmentConfig | null) => void }`
    - Render a row of toggle chips using `getAvailableEnrichments(primarySource)`
    - Label prefix: "Enrich with:" followed by entity chips
    - Active chip: primary colour border + filled background
    - Inactive chip: default border + transparent background
    - Clicking inactive chip → call `onEnrichmentChange(createDefaultEnrichmentConfig(entity))`
    - Clicking active chip → call `onEnrichmentChange(null)`
    - Only one chip active at a time (single enrichment constraint)
    - Add `data-testid="enrichment-selector"` to root element
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2_

  - [x]* 2.2 Write unit tests for EnrichmentSelector
    - Test renders correct chips for each primary source type
    - Test does not render when sourceConfig is null (parent responsibility — test props)
    - Test clicking active chip deselects enrichment (calls onEnrichmentChange(null))
    - Test clicking inactive chip activates enrichment (calls onEnrichmentChange with default config)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2_

- [x] 3. Integrate EnrichmentSelector into FieldMappingStep
  - [x] 3.1 Add EnrichmentSelector rendering to `src/components/wizard/FieldMappingStep.tsx`
    - Import `EnrichmentSelector` and `createDefaultEnrichmentConfig`
    - Conditionally render `EnrichmentSelector` when `draft.sourceConfig` is non-null
    - Place it between the join key indicator and the field list section
    - Pass `primarySource`, `currentEnrichment` (from `draft.sourceConfig.enrichment`), and `onEnrichmentChange` handler
    - _Requirements: 1.1, 1.5, 4.1_

  - [x] 3.2 Implement the enrichment toggle handler in FieldMappingStep
    - Create `handleEnrichmentChange` callback that builds the patched `sourceConfig` with the new enrichment value
    - Call `onUpdate({ sourceConfig: { ...draft.sourceConfig, enrichment: newValue } })` to propagate the change up to WizardModal
    - The existing `handleDraftUpdate` in WizardModal already handles enrichment removal cleanup (removes old entity fields from selectedFields and columnRenames)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.3 Verify enrichment fields appear in available (unselected) pool
    - `getFieldsForSourceConfig` already returns enrichment fields when `config.enrichment` is set
    - Verify that the `availableContactFields` memo in FieldMappingStep resolves enrichment fields correctly via the existing `getFieldsForSourceConfig` call
    - Enrichment fields should appear unselected by default with their entity source badge
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Verify Select All includes enrichment fields
  - [x] 5.1 Verify Select All / Deselect All logic handles enrichment fields
    - The existing `handleSelectAllContact` already selects all `availableContactFields` which will include enrichment fields once the enrichment is active
    - Verify this works correctly — enrichment fields should be included in Select All
    - If needed, adjust the Select All logic to ensure it covers all available fields including enrichment
    - _Requirements: 6.3, 6.4_

  - [x]* 5.2 Write property test for Select All completeness
    - **Property 6: Select All includes all available fields**
    - Generate random available field sets (primary + enrichment), invoke Select All logic, verify `selectedFields` contains every field from the available fields list
    - **Validates: Requirements 6.3, 6.4**

- [x] 6. Verify enrichment state persistence and conflict handling
  - [x] 6.1 Verify enrichment state persistence across step navigation
    - Enrichment is stored in `draft.sourceConfig.enrichment` which persists across step navigation automatically (draft state lives in WizardModal)
    - Verify that navigating away from Field Mapping and returning preserves the enrichment selection and enrichment fields in selectedFields
    - _Requirements: 5.1, 5.2_

  - [x] 6.2 Verify primary source conflict clearing
    - The existing `didSourceOrSubSourceChange` + `handleDraftUpdate` logic in WizardModal clears selectedFields and columnRenames when primary source changes
    - `resetDownstreamOnSourceChange` already sets enrichment to null for new source configs
    - Verify that when primary source changes to match the enrichment entity, the enrichment is cleared
    - _Requirements: 4.3, 5.3_

  - [x]* 6.3 Write property test for deselection cleanup
    - **Property 3: Deselection cleanup removes entity fields and renames**
    - Generate random `selectedFields` and `columnRenames` containing fields from an enrichment entity, apply deselection logic (simulate `handleDraftUpdate` with enrichment removal), verify no fields with old entity source remain
    - **Validates: Requirements 2.3, 2.4**

  - [x]* 6.4 Write property test for filter-only preservation
    - **Property 4: Filter-only changes preserve enrichment state**
    - Generate draft with enrichment active, apply a filter-only sourceConfig patch (same primarySource, different filter), verify enrichment field, selectedFields, and columnRenames remain unchanged
    - **Validates: Requirements 4.2**

  - [x]* 6.5 Write property test for primary source conflict clearing
    - **Property 5: Primary source conflict clears enrichment**
    - Generate configs where enrichment entity matches the new primary source, apply the source change logic, verify enrichment is cleared and entity fields removed
    - **Validates: Requirements 4.3**

- [x] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- The existing `handleDraftUpdate` logic in WizardModal already handles enrichment removal cleanup — no changes needed there
- `getFieldsForSourceConfig` already returns enrichment fields when enrichment is set — no changes needed there
- `getAvailableEnrichments` already exists in source-config-utils.ts — no changes needed there

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "2.1"] },
    { "id": 2, "tasks": ["2.2", "3.1"] },
    { "id": 3, "tasks": ["3.2", "3.3"] },
    { "id": 4, "tasks": ["5.1", "6.1", "6.2"] },
    { "id": 5, "tasks": ["5.2", "6.3", "6.4", "6.5"] }
  ]
}
```
