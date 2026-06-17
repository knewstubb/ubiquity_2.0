# Implementation Plan: Auto-Populate Field Mapping

## Overview

This feature adds automatic field population to the exporter wizard's Field Mapping step. The implementation is localised to `WizardModal.tsx` — adding a `previousSourceConfigRef` to track source changes, extracting `populateFieldsForTransition()` as a pure function, and modifying `handleNext` to invoke the population logic when transitioning from Data Source → Field Mapping. The `FieldMappingStep` component requires no changes.

## Tasks

- [x] 1. Extract the pure population function and add the source config ref
  - [x] 1.1 Create `src/utils/populate-fields.ts` with the `populateFieldsForTransition` function
    - Export a pure function: `populateFieldsForTransition(draft, previousSourceConfig) → Partial<ExporterWizardDraft> | null`
    - Import `getFieldsForSourceConfig` from `src/utils/source-config-utils`
    - Import `didSourceOrSubSourceChange` from the wizard (or co-locate if needed)
    - Implement the three-branch logic: empty fields → populate all; source changed → clear and re-populate; source unchanged → return null
    - Map `SourceFieldDefinition[]` to `SelectedField[]` (key, label, source)
    - When source changes, include `columnRenames: []` in the returned patch
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_

  - [x] 1.2 Export `didSourceOrSubSourceChange` from `WizardModal.tsx` or move to a shared utility
    - The function already exists in `WizardModal.tsx` as a module-level function
    - Move it to `src/utils/populate-fields.ts` (or a shared file) so the pure function and tests can import it
    - Re-export or import it back in `WizardModal.tsx` to maintain existing behaviour
    - _Requirements: 2.3_

  - [ ]* 1.3 Write property tests for `populateFieldsForTransition`
    - **Property 1: Auto-population produces the complete field set**
    - **Validates: Requirements 1.1, 1.3**
    - Create test file at `src/utils/__tests__/auto-populate-fields.test.ts`
    - Install `fast-check` as a dev dependency if not present
    - Create `arbSourceConfig()` generator for valid SourceConfig values (contacts, transactions, messages with optional enrichment)
    - Assert: when `selectedFields` is empty and `sourceConfig` is non-null, returned `selectedFields` keys/order match `getFieldsForSourceConfig(sourceConfig)`
    - Run 100+ iterations via `fc.assert(fc.property(...), { numRuns: 100 })`

  - [ ]* 1.4 Write property test: non-empty fields preserved when source unchanged
    - **Property 2: Non-empty fields are preserved when source is unchanged**
    - **Validates: Requirements 1.2, 2.2, 3.2, 5.1, 5.2**
    - Create `arbSelectedFields(config)` generator that produces random subsets of fields from a config
    - Create `arbColumnRenames(fields)` generator for random renames
    - Assert: when `selectedFields` is non-empty and `didSourceOrSubSourceChange` returns false, returned patch is `null` (fields and renames unchanged)
    - Run 100+ iterations

  - [ ]* 1.5 Write property test: source change triggers full re-population
    - **Property 3: Source change triggers full re-population and clears renames**
    - **Validates: Requirements 2.1, 2.3, 5.3**
    - Generate two different `SourceConfig` values where `didSourceOrSubSourceChange` returns true
    - Assert: returned `selectedFields` equals `getFieldsForSourceConfig(newConfig)` and `columnRenames` is `[]`
    - Run 100+ iterations

- [x] 2. Integrate population logic into WizardModal
  - [x] 2.1 Add `previousSourceConfigRef` to `WizardModal.tsx`
    - Import `useRef` from React
    - Add `const previousSourceConfigRef = useRef<SourceConfig | null>(null)` after the draft state declaration
    - _Requirements: 2.1, 2.2_

  - [x] 2.2 Modify `handleNext` to call `populateFieldsForTransition` on Data Source → Field Mapping transition
    - Import `populateFieldsForTransition` from `src/utils/populate-fields`
    - Before advancing the step, check if `steps[currentStep]?.label === 'Data Source'`
    - Call `populateFieldsForTransition(draft, previousSourceConfigRef.current)`
    - If patch is non-null, apply it with `setDraft(prev => ({ ...prev, ...patch }))`
    - Update `previousSourceConfigRef.current = draft.sourceConfig` after the call
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 5.3_

  - [ ]* 2.3 Write unit tests for the WizardModal integration
    - Test: navigating from Data Source → Field Mapping with empty fields populates all fields from sourceConfig
    - Test: navigating back and forward with unchanged source preserves existing fields
    - Test: navigating back, changing source type, navigating forward clears and re-populates
    - Test: null sourceConfig leaves selectedFields empty
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2_

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Add remaining property tests for field invariants
  - [ ]* 4.1 Write property test: available fields partition invariant
    - **Property 4: Available fields partition invariant**
    - **Validates: Requirements 3.1, 3.3, 4.4**
    - For any `SourceConfig`, verify that the union of selected fields (from population) and unselected fields (computed by FieldMappingStep logic) equals `getFieldsForSourceConfig(sourceConfig)` with no duplicates or omissions
    - Run 100+ iterations

  - [ ]* 4.2 Write property test: enrichment fields included with correct prefix
    - **Property 5: Enrichment fields are included with correct prefix**
    - **Validates: Requirements 4.4**
    - For any `SourceConfig` with an enrichment entity, verify that `getFieldsForSourceConfig` output contains all primary fields PLUS enrichment fields with keys prefixed by `enrichment_{entity}_` and labels prefixed by capitalised singular entity name
    - Run 100+ iterations

- [x] 5. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The `populateFieldsForTransition` function is extracted as a pure function to enable direct property-based testing without component rendering
- `FieldMappingStep.tsx` requires no modifications — it already handles pre-populated fields correctly
- The `didSourceOrSubSourceChange` function already exists and is reused (not reimplemented)
- Property tests use `fast-check` with 100+ iterations each
- Test file location: `src/utils/__tests__/auto-populate-fields.test.ts`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "1.4", "1.5", "2.1"] },
    { "id": 2, "tasks": ["2.2"] },
    { "id": 3, "tasks": ["2.3", "4.1", "4.2"] }
  ]
}
```
