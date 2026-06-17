# Implementation Plan: Card-Based Filter Builder

## Overview

Implement a progressive drill-down card-based filter builder component that replaces the existing inline-dropdown FilterBuilder. The implementation is broken into: pure utility functions (operators, summary generation, validation), the main component with logic group rendering, the multi-step condition modal, and finally the demo page with registry integration.

All pure logic functions are implemented first and tested in isolation. The UI components build on top of these utilities. The existing `filter-builder.tsx` remains untouched.

## Tasks

- [x] 1. Define types, interfaces, and pure utility functions
  - [x] 1.1 Create type definitions and operator maps
    - Create `src/components/composed/card-filter-builder/types.ts` with all TypeScript interfaces: `CardFilterBuilderProps`, `SourceCategoryConfig`, `SubSourceConfig`, `FilterFieldDef`, `CardFilterRow`, `ModalState`, and re-export `FilterGroup`, `FilterCondition`, `FilterLogic` from existing filter-builder
    - Create `src/components/composed/card-filter-builder/operators.ts` with operator definitions per data type (text, number, date, boolean, enum) and `getOperatorsForType(dataType)` function
    - Define the `NO_VALUE_OPERATORS` constant array: `['is_true', 'is_false', 'is_empty', 'is_not_empty']`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 10.1, 10.6_

  - [x] 1.2 Implement summary generator function
    - Create `src/components/composed/card-filter-builder/summary.ts` with `generateConditionSummary(row: CardFilterRow, sourceCategories: SourceCategoryConfig[]): string`
    - Resolve sourceCategory key → title, field key → label, operator key → display label
    - Format date values using `toLocaleDateString` for locale-aware display
    - Format "between" as "between {start} – {end}" and "in_last_n_days" as "in last {N} days"
    - Resolve enum values to their display labels
    - Omit value portion for no-value operators
    - Fall back to raw keys when sourceCategory or field cannot be resolved
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 11.2, 11.4, 11.5_

  - [x] 1.3 Implement validation utilities
    - Create `src/components/composed/card-filter-builder/validation.ts` with functions: `isConditionComplete(row: CardFilterRow): boolean`, `validateValue(dataType, operator, value): { valid: boolean; message?: string }`
    - Validate number inputs are valid integers/decimals
    - Validate date range: start ≤ end for "between" operator
    - Validate "in_last_n_days": whole number 1–3650
    - Validate text inputs: non-empty, max 500 chars
    - Validate enum values: must be one of defined enumOptions
    - _Requirements: 7.9, 7.10, 7.11, 7.13_

  - [x] 1.4 Implement group manipulation helpers
    - Create `src/components/composed/card-filter-builder/group-helpers.ts` with pure functions:
    - `toggleGroupLogic(group: FilterGroup): FilterGroup` — flips and/or
    - `addConditionToGroup(group: FilterGroup, row: CardFilterRow): FilterGroup` — appends
    - `removeConditionFromGroup(group: FilterGroup, index: number): FilterGroup` — removes at index, preserves order
    - `replaceConditionInGroup(group: FilterGroup, index: number, row: CardFilterRow): FilterGroup` — in-place replace
    - `addNestedGroup(group: FilterGroup): FilterGroup` — adds child with opposite logic + one empty row
    - `removeEmptyGroups(group: FilterGroup): FilterGroup` — recursively prunes empty nested groups, preserves root
    - `isConditionInvalid(row: CardFilterRow, sourceCategories: SourceCategoryConfig[]): boolean` — checks if referenced keys exist in config
    - _Requirements: 1.2, 1.3, 1.6, 1.7, 2.5, 3.4, 8.4, 9.3_

  - [x] 1.5 Write property tests for operator mapping (Property 12)
    - **Property 12: Operators map correctly to data types**
    - For each data type, verify the operator set matches the specified list exactly
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6**

  - [x] 1.6 Write property tests for summary generator (Properties 4, 5, 6, 7)
    - **Property 4: Summary generation resolves keys to labels** — generate arbitrary valid CardFilterRows and verify summary contains source title, field label, operator label with no raw keys
    - **Property 5: No-value operators produce summary without value** — for rows with no-value ops, verify no value portion appears
    - **Property 6: Date formatting in summaries** — for date rows with "between" and "in_last_n_days", verify formatting
    - **Property 7: Unresolvable keys fall back to raw text** — for rows referencing missing keys, verify raw key appears as fallback
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 11.4, 11.5**

  - [x] 1.7 Write property tests for group manipulation (Properties 1, 2, 3, 8, 9, 14)
    - **Property 1: Logic toggle flips correctly** — toggling produces opposite logic with conditions unchanged
    - **Property 2: Nested group has opposite logic** — new nested group has opposite logic to parent
    - **Property 3: Empty group auto-removal preserves root** — removing last condition from nested group prunes it; root is never removed
    - **Property 8: Removing a condition produces correct group** — N conditions → N-1 after remove, order preserved
    - **Property 9: Confirm appends new condition to target group** — N conditions → N+1 with new at end
    - **Property 14: Edit replaces condition in-place** — N conditions stays N, only index i changes
    - **Validates: Requirements 1.2, 1.3, 1.6, 1.7, 2.5, 3.4, 8.4**

  - [x] 1.8 Write property tests for validation and config detection (Properties 13, 15, 16)
    - **Property 13: Date range validation** — Between passes iff both dates valid and start ≤ end; In last N days passes iff 1 ≤ N ≤ 3650 and N is whole
    - **Property 15: Invalid condition detection on config change** — conditions with missing keys are invalid, those with present keys are not
    - **Property 16: JSON round-trip integrity** — serialize/deserialize a CardFilterRow produces deeply equal result
    - **Validates: Requirements 7.9, 7.10, 9.3, 11.3**

- [x] 2. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Implement the main CardFilterBuilder component and LogicGroupRenderer
  - [x] 3.1 Create the LogicGroupRenderer component
    - Create `src/components/composed/card-filter-builder/logic-group-renderer.tsx`
    - Render logic toggle button (AND/OR) that calls `toggleGroupLogic` on click
    - Render "+Filter" button that opens ConditionModal in add mode
    - Render "+Group" button when `allowNesting=true` and depth < maxDepth (disabled with tooltip at max)
    - Hide "+Group" when `allowNesting=false`
    - Render each condition as a `ConditionSummary` component
    - Recursively render nested groups in bordered containers
    - Use left border-line (border-l-2 border-primary/30) for visual hierarchy
    - Wire auto-removal of empty nested groups via `removeEmptyGroups`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 10.3, 10.4_

  - [x] 3.2 Create the ConditionSummary component
    - Create `src/components/composed/card-filter-builder/condition-summary.tsx`
    - Use `generateConditionSummary` to render natural language text
    - Add remove button (Trash icon) that removes condition from parent group
    - Click on summary opens ConditionModal in edit mode (pre-populated at Step 4)
    - Truncate value portion at 40 chars with ellipsis + tooltip for full value
    - Display warning icon + muted styling for invalid conditions (unresolvable keys)
    - Block edit (no click handler) for invalid conditions, allow remove
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 8.1, 9.3, 9.4_

  - [x] 3.3 Create the top-level CardFilterBuilder component
    - Create `src/components/composed/card-filter-builder/index.tsx` as the barrel export
    - Create `src/components/composed/card-filter-builder/card-filter-builder.tsx` with the main component
    - Accept props: `value`, `onChange`, `sourceCategories`, `allowNesting`, `maxDepth`
    - Render root LogicGroupRenderer regardless of empty state
    - Invoke `onChange` on every user interaction that mutates filter state
    - Show empty state when sourceCategories is empty (disable filter creation)
    - Operate as pure controlled component — rendered output reflects `value` prop
    - _Requirements: 10.1, 10.2, 10.5, 10.6, 10.7, 10.8, 10.9, 9.2_

- [x] 4. Implement the multi-step ConditionModal
  - [x] 4.1 Create the ConditionModal shell with step navigation
    - Create `src/components/composed/card-filter-builder/condition-modal.tsx`
    - Use shadcn/ui `Dialog` for the modal overlay
    - Manage internal `ModalState` with step, selections, mode (add/edit)
    - Implement back navigation that preserves session data
    - Dismiss (close/Escape/backdrop) discards in-progress condition
    - Confirm creates/updates condition and closes modal
    - In edit mode, open at Step 4 with all fields pre-populated
    - Handle back-navigation clearing downstream on different selection, preserving on same selection
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 4.2 Implement Step 1 — Source Category Grid
    - Create `src/components/composed/card-filter-builder/steps/source-category-grid.tsx`
    - Render `SelectorCard` (variant="icon") for each category from `sourceCategories` prop
    - Truncate title at 40 chars, description at 120 chars with ellipsis
    - On select: highlight with teal border + checkmark badge, auto-advance to next step
    - Bypass Step 1 when only one category (pre-select it)
    - Show empty state when zero categories
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 4.3 Implement Step 2 — Sub-Source Selection
    - Create `src/components/composed/card-filter-builder/steps/sub-source-list.tsx`
    - Render list of sub-sources with labels when category has >1 sub-source
    - Skip step when 0 or 1 sub-source (auto-select single)
    - On select: advance to field selection with filtered fields
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 4.4 Implement Step 3 — Field Selection
    - Create `src/components/composed/card-filter-builder/steps/field-list.tsx`
    - Display flat list of fields sorted alphabetically by label
    - Show data type badge/indicator adjacent to each field label
    - Show search input when >8 fields (case-insensitive substring filtering)
    - On select: advance to operator/value step
    - Show empty state when zero fields available
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 4.5 Write property tests for field sorting and filtering (Properties 10, 11)
    - **Property 10: Fields displayed in alphabetical order** — for any set of FilterFieldDefs, sorted output is alphabetical by label (case-insensitive)
    - **Property 11: Field search filters case-insensitively** — for any list and search string, results contain exactly matching fields in alphabetical order
    - **Validates: Requirements 6.1, 6.3**

  - [x] 4.6 Implement Step 4 — Operator and Value Configuration
    - Create `src/components/composed/card-filter-builder/steps/operator-value-config.tsx`
    - Render operator selector populated via `getOperatorsForType`
    - Hide value input for no-value operators, enable confirm immediately
    - Render appropriate value input per data type: text Input, number Input, date Calendar/Popover, enum Select, date range picker for Between, numeric "days" input for In last N days
    - Clear value on operator change and disable confirm until valid
    - Show inline validation messages for invalid values
    - Enable confirm only when operator selected + valid value (or no-value op)
    - _Requirements: 7.1–7.13_

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Create the demo page and registry entry
  - [x] 6.1 Create the CardFilterBuilder demo page
    - Create `src/pages/component-demos/CardFilterBuilderDemo.tsx`
    - Provide default `SourceCategoryConfig` with at least 2 categories: Contacts (text, date, enum fields) and Transactional (with sub-sources: Treatments and Products, covering number and date fields)
    - Wire `value` / `onChange` state, pass `allowNesting` and `maxDepth` from props
    - Include fields covering text, number, date, boolean, and enum data types
    - _Requirements: 12.2, 12.4_

  - [x] 6.2 Register in the component registry
    - Add entry to `src/data/componentRegistry.tsx` with: name "Card Filter Builder", category "compositions", unique slug "card-filter-builder", description, searchTerms
    - Add `propControls`: `allowNesting` as toggle (default true), `maxDepth` as counter (min 1, max 5, visibleWhen allowNesting=true)
    - Add `designGuidance` sections covering when to use, variants, and states
    - _Requirements: 12.1, 12.3_

- [x] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement "Is In" / "Is Not In" — Bulk Value Chip Input
  - [x] 8.1 Add `is_in` and `is_not_in` operators to operator maps
    - Update `src/components/composed/card-filter-builder/operators.ts` to add `is_in` and `is_not_in` to text, number, and enum operator lists
    - Define display labels: "Is in" and "Is not in"
    - Add `is_in` and `is_not_in` to the `ARRAY_VALUE_OPERATORS` constant
    - _Requirements: 7.2, 7.3, 7.6, 13.1_

  - [x] 8.2 Update `CardFilterRow` type to support `string[]` value
    - Update `src/components/composed/card-filter-builder/types.ts` to include `string[]` in the `value` union type on `CardFilterRow`
    - Ensure `ModalState` value field also includes `string[]`
    - _Requirements: 11.1, 13.1_

  - [x] 8.3 Create the `ChipInput` sub-component
    - Create `src/components/composed/card-filter-builder/steps/chip-input.tsx`
    - Implement text input that adds a chip on Enter key press (trimmed, non-empty)
    - Support multi-line paste: split on newline characters, each non-empty trimmed line becomes a chip
    - Render each chip as a removable `Badge` with an X button
    - Display a "Clear all" action that removes all chips
    - Display a count label (e.g., "12 values") showing total chips
    - Accept `value: string[]` and `onChange: (value: string[]) => void` as controlled props
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_

  - [x] 8.4 Wire `ChipInput` into `OperatorValueConfig`
    - Update `src/components/composed/card-filter-builder/steps/operator-value-config.tsx`
    - When operator is `is_in` or `is_not_in`, render `ChipInput` instead of standard value input
    - Disable confirm when chip array is empty
    - Clear value (reset to empty array) when operator changes to/from `is_in`/`is_not_in`
    - _Requirements: 13.1, 13.8_

  - [x] 8.5 Update validation for `is_in` / `is_not_in`
    - Update `src/components/composed/card-filter-builder/validation.ts`
    - `is_in`/`is_not_in` requires non-empty `string[]` (at least one chip)
    - For number type: validate each chip is a valid number string
    - For enum type: validate each chip is a valid enum option value
    - _Requirements: 13.8_

  - [x] 8.6 Update `generateConditionSummary` for "Is in" / "Is not in"
    - Update `src/components/composed/card-filter-builder/summary.ts`
    - When operator is `is_in` or `is_not_in` and value is `string[]`, render value portion as "{N} values" (e.g., "5 values")
    - Do NOT include individual chip values in the summary string
    - _Requirements: 13.9_

  - [x] 8.7 Update `ConditionSummary` tooltip for "Is in" conditions
    - Update `src/components/composed/card-filter-builder/condition-summary.tsx`
    - When operator is `is_in` or `is_not_in`, wrap value portion in a `Tooltip` showing the first 10 values
    - If list exceeds 10, append "+{N} more" indicator in tooltip
    - _Requirements: 13.10_

  - [x] 8.8 Update demo `SourceCategoryConfig` with new operators
    - Update `src/pages/component-demos/CardFilterBuilderDemo.tsx`
    - Ensure demo fields of type text, number, and enum are available to demonstrate `is_in`/`is_not_in`
    - _Requirements: 12.2, 12.4_

  - [x]* 8.9 Write property test for chip operations (Property 17)
    - **Property 17: Chip operations produce correct array**
    - For any sequence of add, remove, and clear-all operations on an initially empty chip list, the resulting value array contains exactly the chips added and not subsequently removed or cleared, in insertion order
    - **Validates: Requirements 13.1, 13.2, 13.5, 13.6**

  - [x]* 8.10 Write property test for "Is in" summary format (Property 19)
    - **Property 19: "Is in" summary shows count not values**
    - For any CardFilterRow with `is_in` or `is_not_in` operator and a non-empty `string[]` value of length N, the summary contains "{N} values" and does NOT contain any individual chip value
    - **Validates: Requirements 13.9**

- [x] 9. Checkpoint - Ensure all "Is In" tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement Date Mode Toggle
  - [x] 10.1 Add `dateMode` field to `CardFilterRow` type
    - Update `src/components/composed/card-filter-builder/types.ts` to add `dateMode: 'specific' | 'anniversary' | 'same_day' | null` to `CardFilterRow`
    - Update `ModalState` to include `dateMode` field (default `null`)
    - _Requirements: 7.14, 11.1_

  - [x] 10.2 Create the `DateModeSelector` sub-component
    - Create `src/components/composed/card-filter-builder/steps/date-mode-selector.tsx`
    - Render a segmented control or radio group with three options: "Specific date", "Anniversary", "Same day as"
    - Default selection: "Specific date"
    - Accept `value: 'specific' | 'anniversary' | 'same_day'` and `onChange` as controlled props
    - Only render for date operators that are NOT `in_last_n_days`, `is_empty`, `is_not_empty`
    - _Requirements: 7.14, 7.15, 7.16, 7.17_

  - [x] 10.3 Wire `DateModeSelector` into `OperatorValueConfig`
    - Update `src/components/composed/card-filter-builder/steps/operator-value-config.tsx`
    - Show `DateModeSelector` below operator dropdown when field is date type and operator is applicable
    - When mode is "Anniversary", render month/day picker (no year) for value input
    - When mode is "Specific date" or "Same day as", render standard date picker
    - Reset `dateMode` to `null` when operator changes to `in_last_n_days`, `is_empty`, or `is_not_empty`
    - Reset `dateMode` to `null` when field changes to non-date type
    - _Requirements: 7.14, 7.15, 7.16, 7.17_

  - [x] 10.4 Update `generateConditionSummary` for date mode
    - Update `src/components/composed/card-filter-builder/summary.ts`
    - When `dateMode` is `"anniversary"`, include "anniversary" qualifier before formatted date (e.g., "DOB anniversary on 15 Mar")
    - When `dateMode` is `"same_day"`, include "same day as" qualifier (e.g., "DOB same day as 25 Dec")
    - When `dateMode` is `"specific"` or `null`, no qualifier added (existing behaviour)
    - _Requirements: 2.3_

  - [x] 10.5 Update serialisation and validation for dateMode
    - Ensure JSON round-trip preserves `dateMode` field (verify in existing round-trip logic)
    - Update validation: for "Anniversary" mode, validate month (1–12) and day (1–31)
    - Ensure `dateMode` is silently set to `null` for non-date fields
    - _Requirements: 7.14, 11.1, 11.3_

  - [x] 10.6 Update demo to demonstrate date mode options
    - Update `src/pages/component-demos/CardFilterBuilderDemo.tsx`
    - Ensure at least one date field is available in the demo config to demonstrate date mode selection
    - _Requirements: 12.2, 12.4_

  - [x]* 10.7 Write property test for date mode serialisation (Property 18)
    - **Property 18: Date mode serialisation integrity**
    - For any valid CardFilterRow with a date field and a dateMode value ("specific", "anniversary", or "same_day"), serialising to JSON and deserialising back produces an object where dateMode is deeply equal to the original
    - **Validates: Requirements 7.14, 7.15, 7.16, 7.17, 11.3**

- [x] 11. Final checkpoint - Ensure all new feature tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The existing `filter-builder.tsx` is not modified — this is a new component alongside it
- All pure functions (operators, summary, validation, group helpers) are in separate files for isolated testability
- The component uses a directory structure (`card-filter-builder/`) with barrel export via `index.tsx`
- Tasks 1–7 are completed (Phase 1). Tasks 8–11 implement "Is In"/"Is Not In" chip input and Date Mode Toggle features.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4"] },
    { "id": 2, "tasks": ["1.5", "1.6", "1.7", "1.8"] },
    { "id": 3, "tasks": ["3.1", "3.2"] },
    { "id": 4, "tasks": ["3.3", "4.1"] },
    { "id": 5, "tasks": ["4.2", "4.3", "4.4"] },
    { "id": 6, "tasks": ["4.5", "4.6"] },
    { "id": 7, "tasks": ["6.1", "6.2"] },
    { "id": 8, "tasks": ["8.1", "8.2", "10.1"] },
    { "id": 9, "tasks": ["8.3", "8.5", "10.2"] },
    { "id": 10, "tasks": ["8.4", "8.6", "10.3", "10.4"] },
    { "id": 11, "tasks": ["8.7", "8.8", "10.5", "10.6"] },
    { "id": 12, "tasks": ["8.9", "8.10", "10.7"] }
  ]
}
```
