# Implementation Plan: CSV Sample Upload

## Overview

This plan implements the CSV sample file upload feature for the importer wizard. The approach starts with the pure csv-parser module (no dependencies, fully testable), then extends the data model, then wires the UI components from File Settings through to the Mapping step. Each task builds incrementally on the previous, ensuring no orphaned code.

## Tasks

- [x] 1. Create csv-parser utility module
  - [x] 1.1 Implement `parse` and `format` functions in `src/utils/csv-parser.ts`
    - Create `src/utils/csv-parser.ts` with the `CsvParseResult` interface
    - Implement `parse(csvString)`: extract header row and first data row, handle RFC 4180 quoted fields (commas, newlines, escaped quotes), trim whitespace from headers, assign "Column N" for empty headers, deduplicate headers with _2, _3 suffixes
    - Implement `format(headers, exampleValues)`: produce RFC 4180 CSV string with header row on line 1 and data row on line 2 separated by CRLF, quote fields containing commas/newlines/double quotes, return empty string for empty headers array
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 1.2 Write property test: CSV parse/format round-trip
    - **Property 1: CSV parse/format round-trip**
    - Create `src/__tests__/csv-parser-roundtrip.property.test.ts`
    - Generate arbitrary arrays of pre-trimmed non-empty headers (1–1000 items, 1–255 chars) and example value records (0–1000 chars, containing commas/newlines/quotes)
    - Assert `parse(format(headers, values))` produces character-for-character identical headers and values
    - Use `fast-check` with `{ numRuns: 100 }`
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.6, 7.1, 7.2, 7.5**

  - [x] 1.3 Write property test: Header whitespace trimming and placeholder assignment
    - **Property 2: Header whitespace trimming and placeholder assignment**
    - Create `src/__tests__/csv-parser-trimming.property.test.ts`
    - Generate CSV strings with headers containing leading/trailing whitespace and empty/whitespace-only fields
    - Assert all returned headers have no leading/trailing whitespace, and empty headers become "Column N" (1-based index)
    - Use `fast-check` with `{ numRuns: 100 }`
    - **Validates: Requirements 2.4**

  - [x] 1.4 Write property test: Duplicate header deduplication
    - **Property 3: Duplicate header deduplication**
    - Create `src/__tests__/csv-parser-dedup.property.test.ts`
    - Generate CSV strings with duplicate header values after trimming
    - Assert all returned headers are unique, with duplicates receiving _2, _3 suffixes in left-to-right order
    - Use `fast-check` with `{ numRuns: 100 }`
    - **Validates: Requirements 2.7**

- [x] 2. Extend ImporterConfig model
  - [x] 2.1 Add `LookupMapping` interface and new fields to `src/models/importer.ts`
    - Add `LookupMapping` interface with `sourceField: string` and `contactField: string`
    - Add optional `csvHeaders?: string[]` field to `ImporterConfig`
    - Add optional `csvExampleValues?: Record<string, string>` field to `ImporterConfig`
    - Add optional `lookupMappings?: LookupMapping[]` field to `ImporterConfig`
    - Export the `CONTACT_LOOKUP_FIELDS` constant array: `['Email', 'Customer ID', 'Phone', 'External ID', 'Account Number']`
    - _Requirements: 3.2, 3.3, 5.7_

  - [x] 2.2 Write property test: ImporterConfig serialization round-trip
    - **Property 4: ImporterConfig serialization round-trip**
    - Create `src/__tests__/csv-config-roundtrip.property.test.ts`
    - Generate arbitrary valid `ImporterConfig` objects with `csvHeaders`, `csvExampleValues`, and `lookupMappings`
    - Assert `JSON.parse(JSON.stringify(config))` produces a deeply equal object
    - Use `fast-check` with `{ numRuns: 100 }`
    - **Validates: Requirements 3.2, 3.3, 3.6, 5.5, 5.7**

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Wire FileSettingsStep dropzone for CSV upload
  - [x] 4.1 Implement functional file upload in `src/components/importer/FileSettingsStep.tsx`
    - Add hidden `<input type="file" accept=".csv">` triggered by click on the dropzone div
    - Add `uploadedFileName` and `fileError` internal state
    - Implement `onDrop`/`onChange` handler: validate file extension is `.csv` and size < 5 MB
    - On valid file: read via `FileReader.readAsText()`, call `parse()` from csv-parser, call `onUpdate({ csvHeaders, csvExampleValues })` if headers are non-empty
    - On invalid file: set `fileError` state with appropriate message, do not call `onUpdate`
    - On empty headers result: show "File has no columns" error
    - Display uploaded filename in the dropzone (truncated to 40 chars with ellipsis if longer)
    - Add remove button that clears `uploadedFileName` and calls `onUpdate({ csvHeaders: undefined, csvExampleValues: undefined, lookupMappings: [] })`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 6.1, 6.4_

  - [x] 4.2 Write property test: Filename display truncation
    - **Property 7: Filename display truncation**
    - Create `src/__tests__/csv-filename-truncation.property.test.ts`
    - Generate arbitrary filename strings
    - Assert: filenames ≤ 40 chars display in full; filenames > 40 chars are truncated to 40 chars with ellipsis suffix
    - Use `fast-check` with `{ numRuns: 100 }`
    - **Validates: Requirements 6.1**

- [x] 5. Refactor ImportMappingStep to use dynamic CSV headers
  - [x] 5.1 Update `ImportMappingStep` props and rendering in `src/components/importer/ImportMappingStep.tsx`
    - Add `csvHeaders?: string[]`, `csvExampleValues?: Record<string, string>`, `lookupMappings?: LookupMapping[]`, and `onLookupUpdate?: (mappings: LookupMapping[]) => void` to the props interface
    - When `csvHeaders` is provided and non-empty, use it as the source fields array instead of hardcoded constants
    - When `csvHeaders` is undefined or empty, display "Please upload a sample CSV file on the File Settings step" message instead of the mapping table
    - Display `csvExampleValues[header] || '—'` in the example values column
    - Remove all hardcoded `CONTACT_SOURCE_FIELDS`, `CONTACT_EXAMPLE_VALUES`, `CONTACT_INITIAL_MAPPINGS`, `TRANSACTIONAL_SOURCE_FIELDS`, `TRANSACTIONAL_EXAMPLE_VALUES`, `TRANSACTIONAL_INITIAL_MAPPINGS` constants
    - Keep `CONTACT_TARGET_FIELDS` and `TRANSACTIONAL_TARGET_FIELDS` (these are UbiQuity fields, not CSV-derived)
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 5.2 Write property test: Mapping step displays headers in CSV order
    - **Property 5: Mapping step displays headers in CSV order with correct example values**
    - Create `src/__tests__/csv-mapping-display.property.test.ts`
    - Generate arbitrary non-empty arrays of CSV headers and corresponding example values
    - Assert the mapping step renders exactly one row per header in array order, displaying the example value or dash for empty values
    - Use `fast-check` with `{ numRuns: 100 }`
    - **Validates: Requirements 4.1, 4.2**

- [x] 6. Implement Lookup Field Mapping section
  - [x] 6.1 Add Lookup Field Mapping UI to `ImportMappingStep` for transactional type
    - Render the section only when `type === 'transactional'`
    - Add heading "Lookup Field Mapping" above the main mapping table
    - Render rows with "File Column" dropdown (options from `csvHeaders`, disabled if no headers) and "Contact Table Column" dropdown (options from `CONTACT_LOOKUP_FIELDS`)
    - Add "+ Add Lookup Field" button to append rows
    - Add remove button on each row (visible when > 1 row exists)
    - Call `onLookupUpdate` when lookup mappings change
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6_

  - [x] 6.2 Write property test: Lookup dropdown populated from CSV headers
    - **Property 6: Lookup dropdown populated from CSV headers**
    - Create `src/__tests__/csv-lookup-dropdown.property.test.ts`
    - Generate arbitrary non-empty arrays of CSV headers passed to the transactional mapping step
    - Assert the "File Column" dropdown contains exactly those headers as selectable options in the same order
    - Use `fast-check` with `{ numRuns: 100 }`
    - **Validates: Requirements 5.2**

- [x] 7. Wire ImporterWizardModal to pass CSV data to mapping steps
  - [x] 7.1 Update `ImporterWizardModal` to pass new props in `src/components/importer/ImporterWizardModal.tsx`
    - Pass `csvHeaders={config.csvHeaders}` and `csvExampleValues={config.csvExampleValues}` to all `ImportMappingStep` instances (contact and transactional)
    - Pass `lookupMappings={config.lookupMappings}` and `onLookupUpdate={(lookupMappings) => handleConfigUpdate({ lookupMappings })}` to the transactional `ImportMappingStep`
    - _Requirements: 3.1, 4.1, 5.2, 5.5_

- [x] 8. Implement file replacement logic
  - [x] 8.1 Add mapping-clearing behaviour when a new CSV file is uploaded
    - In `FileSettingsStep`, when a new valid file replaces an existing one: call `onUpdate` with new `csvHeaders`, `csvExampleValues`, and clear `contactMapping: []`, `transactionalMapping: []`, `lookupMappings: []`
    - When an invalid replacement file is uploaded: show error, preserve previous file's data unchanged
    - When the user removes the file: clear `csvHeaders`, `csvExampleValues`, `lookupMappings`, `contactMapping`, and `transactionalMapping`
    - _Requirements: 3.4, 3.5, 4.5, 6.2, 6.3, 6.4_

- [x] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The csv-parser module is implemented first because it has zero dependencies and is the foundation for all subsequent tasks
- Hardcoded source field constants are removed from ImportMappingStep but target field constants are preserved (they represent UbiQuity schema, not CSV data)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4", "2.2"] },
    { "id": 2, "tasks": ["4.1", "5.1"] },
    { "id": 3, "tasks": ["4.2", "5.2", "6.1"] },
    { "id": 4, "tasks": ["6.2", "7.1"] },
    { "id": 5, "tasks": ["8.1"] }
  ]
}
```
