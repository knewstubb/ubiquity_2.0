# Implementation Plan: Segmentation Filters

## Overview

Build a shared, ClickUp-style filter builder component for the UbiQuity 2.0 prototype. The implementation migrates the segment data model from flat rules to nested FilterGroups, creates the full FilterBuilder component tree (field picker, operator dropdown, value input, combinator toggle, nested groups), adds a live match count engine, builds the segment detail view with routing, and wires everything together. All state is local, all data is the existing NZ spa sample set.

## Tasks

- [x] 1. Migrate data model and field registry
  - [x] 1.1 Extend the Segment model with FilterGroup types
    - In `src/models/segment.ts`, define `FilterGroup` type with `combinator: 'AND' | 'OR'`, `rules: FilterRule[]`, and `groups: FilterGroup[]`
    - Update `FilterRule` to include `field: string`, `operator: string`, `value: string | string[] | number`
    - Replace `rules: FilterRule[]` on `Segment` with `rootGroup: FilterGroup`
    - Export all types for use across the codebase
    - _Requirements: 8.1, 8.2, 8.4_

  - [x] 1.2 Extend the field registry with data type metadata
    - In `src/data/fieldRegistry.ts`, add a `dataType: 'string' | 'number' | 'date' | 'enum'` property to `FieldDefinition`
    - Add an optional `enumValues: string[]` property for enum fields (membershipTier, category, purchaseChannel)
    - Annotate each existing field with its correct data type
    - Create a `getFieldByKey(key: string): FieldDefinition | undefined` lookup helper
    - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4_

  - [x] 1.3 Migrate segment sample data to FilterGroup structure
    - In `src/data/segments.ts`, rewrite each segment's rules as a `rootGroup: FilterGroup` preserving the same logical conditions
    - Ensure all existing segments (seg-gold, seg-new, seg-risk, seg-auckland, seg-platinum-vip, seg-queenstown-winter) are migrated correctly
    - _Requirements: 8.2, 8.3_

  - [x] 1.4 Create operator registry mapping field types to valid operators
    - Create `src/data/operatorRegistry.ts` defining operator sets per data type
    - String operators: equals, not_equals, contains, does_not_contain, is_empty, is_not_empty
    - Number operators: equals, not_equals, greater_than, less_than, between, is_empty, is_not_empty
    - Date operators: equals, before, after, between, in_the_last, is_empty, is_not_empty
    - Enum operators: is, is_not, is_any_of, is_empty, is_not_empty
    - Export a `getOperatorsForFieldType(dataType: string)` function and an `operatorLabels` map for display
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 2. Checkpoint — Verify data model compiles
  - Ensure all tests pass, ask the user if questions arise.
  - Run `npx tsc --noEmit` to confirm no type errors after model migration
  - Verify `SegmentsPage.tsx` still compiles with the new Segment shape

- [x] 3. Build FilterBuilder component tree
  - [x] 3.1 Create FilterRuleRow component
    - Create `src/components/shared/FilterRuleRow.tsx` and `FilterRuleRow.module.css`
    - Render a single horizontal row: FieldPicker dropdown, OperatorDropdown, ValueInput, and a remove button
    - FieldPicker lists fields from the field registry grouped by source (Contact, Treatment, Product)
    - Disable OperatorDropdown and ValueInput when no field is selected
    - Fire `onChange` callback with updated rule when any control changes
    - Fire `onRemove` callback when remove button is clicked
    - Support `readOnly` prop to disable all controls
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 9.3_

  - [x] 3.2 Create OperatorDropdown component
    - Create `src/components/shared/OperatorDropdown.tsx` and `OperatorDropdown.module.css`
    - Accept `fieldDataType` prop and render only valid operators from the operator registry
    - When field type changes, reset operator selection
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.3 Create ValueInput component
    - Create `src/components/shared/ValueInput.tsx` and `ValueInput.module.css`
    - Render text input for string fields, number input for numeric fields, date input for date fields
    - Render multi-select dropdown for enum fields using the field's `enumValues`
    - Handle `between` operator by rendering two inputs (min/max or start/end)
    - Handle `in_the_last` operator by rendering a number input with "days" label
    - _Requirements: 1.3, 2.1, 2.2, 2.3, 2.4_

  - [x] 3.4 Create CombinatorToggle component
    - Create `src/components/shared/CombinatorToggle.tsx` and `CombinatorToggle.module.css`
    - Render a compact pill-style AND/OR toggle between consecutive rules
    - Use teal primary colour for active state, neutral background for inactive
    - Fire `onChange` with the new combinator value
    - Support `readOnly` prop
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 10.4_

  - [x] 3.5 Create FilterGroup component
    - Create `src/components/shared/FilterGroup.tsx` and `FilterGroup.module.css`
    - Render a list of FilterRuleRow components with CombinatorToggle between them
    - Render nested child FilterGroup components with CombinatorToggle between sibling groups
    - Visually indent nested groups with a left border accent or subtle background shift
    - Include "Add filter" text button with plus icon to append a new empty rule
    - Include "Add filter group" text button to append a new child group
    - Include remove button on each rule and each nested group
    - Hide remove button on last remaining rule in a group
    - Hide remove button on root group when no nested groups exist
    - Support at least two levels of nesting
    - Support `readOnly` prop to disable all controls
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 10.3, 10.5_

  - [ ]* 3.6 Write unit tests for FilterRuleRow
    - Test that FieldPicker renders grouped fields
    - Test that OperatorDropdown is disabled when no field selected
    - Test that changing field type resets operator and value
    - Test remove button fires onRemove
    - _Requirements: 1.1, 1.6, 2.5_

  - [ ]* 3.7 Write unit tests for FilterGroup
    - Test adding a new rule appends an empty FilterRule
    - Test adding a filter group appends a nested FilterGroup
    - Test removing a rule updates the group
    - Test combinator toggle switches between AND and OR
    - Test last rule's remove button is hidden
    - _Requirements: 3.2, 4.2, 5.2, 5.4_

- [x] 4. Build the FilterBuilder container component
  - [x] 4.1 Create FilterBuilder component with props API
    - Create `src/components/shared/FilterBuilder.tsx` and `FilterBuilder.module.css`
    - Accept `value: FilterGroup` prop for current filter state
    - Accept `onChange: (group: FilterGroup) => void` callback
    - Accept optional `readOnly: boolean` prop
    - Accept optional `fields: FieldDefinition[]` prop to override default field registry
    - Render the root FilterGroup component, passing through all state management
    - Place in `src/components/shared/` alongside other reusable components
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 4.2 Implement live match count engine
    - Create `src/utils/filterEngine.ts` with an `evaluateFilterGroup(group: FilterGroup, contacts: Contact[]): Contact[]` function
    - Implement recursive evaluation: AND requires all rules/groups match, OR requires any match
    - Implement per-rule evaluation for each operator type (equals, contains, greater_than, before, is_any_of, between, in_the_last, is_empty, etc.)
    - Handle incomplete rules gracefully (skip rules without field + operator + value)
    - _Requirements: 6.1, 6.2, 6.4_

  - [x] 4.3 Add MatchCount display to FilterBuilder
    - Display a match count indicator inside FilterBuilder showing number of matching contacts
    - Recalculate on every filter change within the same render cycle
    - Scope evaluation to the selected account via AccountContext
    - When no rules are complete, display total contact count for the account
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 4.4 Write unit tests for filterEngine
    - Test AND combinator requires all rules to match
    - Test OR combinator requires any rule to match
    - Test nested groups evaluate correctly
    - Test incomplete rules are skipped
    - Test each operator type against sample contact data
    - _Requirements: 6.1, 6.2, 6.4_

- [x] 5. Checkpoint — Verify FilterBuilder renders and compiles
  - Ensure all tests pass, ask the user if questions arise.
  - Run `npx tsc --noEmit` to confirm no type errors
  - Verify FilterBuilder can be rendered in isolation with sample FilterGroup data

- [x] 6. Build Segment Detail View and routing
  - [x] 6.1 Create SegmentDetailPage component
    - Create `src/pages/SegmentDetailPage.tsx` and `SegmentDetailPage.module.css`
    - Display segment name, type badge (smart/manual), and member count in a header
    - Render the FilterBuilder pre-populated with the segment's `rootGroup`
    - For "smart" segments, allow editing rules with live match count updates
    - For "manual" segments, render FilterBuilder in read-only state with a label indicating manual membership
    - _Requirements: 7.1, 7.2, 7.4, 7.5_

  - [x] 6.2 Add members preview table to SegmentDetailPage
    - Display a DataTable showing contacts that match the segment's rules
    - Limit display to the first 10 rows
    - Show columns: name, email, membership tier, join date
    - Use the filterEngine to compute matched contacts from sample data scoped to the selected account
    - _Requirements: 7.3, 6.3_

  - [x] 6.3 Add routing for segment detail view
    - In `src/App.tsx`, add a route `/audiences/segments/:segmentId` pointing to `SegmentDetailPage`
    - _Requirements: 7.1_

  - [x] 6.4 Make segment rows clickable in SegmentsPage
    - In `src/pages/SegmentsPage.tsx`, wrap each segment row with navigation to `/audiences/segments/:segmentId`
    - Use `useNavigate` from react-router-dom for click handling
    - Add hover cursor and visual feedback on rows
    - _Requirements: 7.1_

  - [ ]* 6.5 Write unit tests for SegmentDetailPage
    - Test that smart segment renders editable FilterBuilder
    - Test that manual segment renders read-only FilterBuilder with manual label
    - Test that members preview table shows up to 10 contacts
    - _Requirements: 7.2, 7.4, 7.5, 7.3_

- [x] 7. Visual design polish and consistency
  - [x] 7.1 Apply design tokens and CSS Modules styling
    - Ensure all new components use CSS Modules
    - Apply prototype design tokens: teal primary, zinc neutrals, 4px border radius, shadow-sm
    - Style nested FilterGroups with left border accent or subtle background colour shift
    - Style CombinatorToggle as compact pill-style toggle
    - Style "Add filter" and "Add filter group" as text-style buttons with plus icon
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 8. Final checkpoint — Full integration verification
  - Ensure all tests pass, ask the user if questions arise.
  - Verify SegmentsPage loads with migrated data, rows are clickable
  - Verify SegmentDetailPage renders with pre-populated FilterBuilder
  - Verify live match count updates when rules are modified
  - Verify nested groups and combinator toggles work correctly
  - Run `npx tsc --noEmit` for final type check

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation after data model changes and component creation
- All state is local — no backend or API calls
- The FilterBuilder is designed as a reusable shared component for future use in journey branches, report filters, and contact list filtering
