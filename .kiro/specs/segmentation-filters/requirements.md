# Requirements Document

## Introduction

A shared, ClickUp-style filter builder component for the UbiQuity 2.0 interactive design prototype. The filter builder provides a visual query interface with AND/OR grouped conditions, nested filter groups, progressive disclosure (field → operator → value), and a live match count. It is the primary UI for defining smart segment rules and is reusable across journey branch conditions, report/analytics filters, and contact list filtering.

This is a prototype feature — all state is local, all data is the existing NZ spa chain sample set, and the goal is to simulate the full UX so stakeholders can experience the interaction before development begins.

## Glossary

- **Filter_Builder**: The shared React component that renders a visual query builder with grouped filter conditions, AND/OR logic, and nested groups.
- **Filter_Rule**: A single condition row consisting of a field, an operator, and a value input.
- **Filter_Group**: A collection of one or more Filter_Rules combined by a single logical combinator (AND or OR).
- **Root_Group**: The top-level Filter_Group that contains all other groups and rules.
- **Combinator**: The logical operator (AND or OR) that joins Filter_Rules within a Filter_Group or joins sibling Filter_Groups.
- **Field_Picker**: A dropdown that lists available fields from the field registry, grouped by source (contact, treatment, product).
- **Operator_Dropdown**: A dropdown that shows operators valid for the selected field's data type.
- **Value_Input**: A text input, number input, date picker, or multi-select dropdown rendered based on the selected field and operator.
- **Match_Count**: A live-updating count of contacts that satisfy the current filter configuration.
- **Segment_Detail_View**: The page displayed when a user clicks a segment row, showing the segment's rules in the Filter_Builder and its matched members.
- **Field_Registry**: The existing `fieldRegistry.ts` module that defines available fields with their keys, labels, and source categories.
- **Account_Context**: The existing context provider that scopes data to the selected account.

## Requirements

### Requirement 1: Filter Rule Row

**User Story:** As a prototype user, I want each filter condition displayed as a discrete row with field, operator, and value controls, so that I can build conditions using progressive disclosure.

#### Acceptance Criteria

1. WHEN the user clicks the Field_Picker in a Filter_Rule, THE Filter_Builder SHALL display a dropdown listing all fields from the Field_Registry grouped by source category (Contact, Treatment, Product).
2. WHEN the user selects a field, THE Filter_Builder SHALL display the Operator_Dropdown populated with operators valid for that field's data type.
3. WHEN the user selects an operator, THE Filter_Builder SHALL display the Value_Input appropriate for the field type: a text input for string fields, a number input for numeric fields, a date picker for date fields, and a multi-select dropdown for enum fields (such as membershipTier or category).
4. THE Filter_Builder SHALL render each Filter_Rule as a single horizontal row containing the Field_Picker, Operator_Dropdown, Value_Input, and a remove button.
5. WHEN the user clicks the remove button on a Filter_Rule, THE Filter_Builder SHALL remove that rule from its parent Filter_Group.
6. IF a Filter_Rule has no field selected, THEN THE Filter_Builder SHALL disable the Operator_Dropdown and Value_Input for that rule.

### Requirement 2: Operators by Field Type

**User Story:** As a prototype user, I want operators to match the selected field's data type, so that I only see relevant comparison options.

#### Acceptance Criteria

1. WHEN a string-type field is selected, THE Operator_Dropdown SHALL offer: equals, not equals, contains, does not contain, is empty, is not empty.
2. WHEN a numeric-type field is selected, THE Operator_Dropdown SHALL offer: equals, not equals, greater than, less than, between, is empty, is not empty.
3. WHEN a date-type field is selected, THE Operator_Dropdown SHALL offer: equals, before, after, between, in the last (days), is empty, is not empty.
4. WHEN an enum-type field is selected (membershipTier, category, purchaseChannel), THE Operator_Dropdown SHALL offer: is, is not, is any of, is empty, is not empty.
5. WHEN the user changes the selected field to a different data type, THE Filter_Builder SHALL reset the operator and value for that rule.

### Requirement 3: AND/OR Combinator Toggle

**User Story:** As a prototype user, I want to toggle between AND and OR logic within a filter group, so that I can define whether all conditions or any condition must match.

#### Acceptance Criteria

1. THE Filter_Builder SHALL display a combinator toggle (AND / OR) between consecutive Filter_Rules within a Filter_Group.
2. WHEN the user clicks the combinator toggle, THE Filter_Builder SHALL switch the group's combinator between AND and OR.
3. THE Filter_Builder SHALL apply a single combinator value to all rules within a given Filter_Group (all AND or all OR, not mixed).
4. THE Filter_Builder SHALL visually distinguish the active combinator state using the prototype's teal primary colour for the selected option and a neutral background for the unselected option.

### Requirement 4: Nested Filter Groups

**User Story:** As a prototype user, I want to create nested filter groups combined with AND/OR, so that I can build complex queries like "(Gold OR Platinum) AND (Auckland OR Wellington)".

#### Acceptance Criteria

1. THE Filter_Builder SHALL display an "Add filter group" button below the current rules.
2. WHEN the user clicks "Add filter group", THE Filter_Builder SHALL append a new child Filter_Group inside the current group, visually indented and separated with a border or background colour change.
3. THE Filter_Builder SHALL display a combinator toggle (AND / OR) between sibling Filter_Groups.
4. THE Filter_Builder SHALL support at least two levels of nesting (a root group containing child groups, each containing rules).
5. WHEN the user clicks a remove button on a Filter_Group, THE Filter_Builder SHALL remove that group and all its contained rules.

### Requirement 5: Add and Remove Controls

**User Story:** As a prototype user, I want clear controls to add rules and groups and remove them, so that I can iteratively build and refine my filter.

#### Acceptance Criteria

1. THE Filter_Builder SHALL display an "Add filter" button within each Filter_Group to append a new empty Filter_Rule.
2. WHEN the user clicks "Add filter", THE Filter_Builder SHALL append a new Filter_Rule row with the Field_Picker in its default (unselected) state.
3. THE Filter_Builder SHALL display a remove icon on each Filter_Rule row and each nested Filter_Group.
4. IF only one Filter_Rule remains in a Filter_Group, THEN THE Filter_Builder SHALL hide the remove button for that rule to prevent an empty group.
5. IF only the Root_Group remains with no nested groups, THEN THE Filter_Builder SHALL hide the remove button for the Root_Group.

### Requirement 6: Live Match Count

**User Story:** As a prototype user, I want to see how many contacts match my current filter in real time, so that I can validate my segment definition as I build it.

#### Acceptance Criteria

1. THE Filter_Builder SHALL display a Match_Count indicator showing the number of contacts that satisfy the current filter configuration.
2. WHEN the user modifies any Filter_Rule (field, operator, or value), THE Filter_Builder SHALL recalculate and update the Match_Count within the same render cycle.
3. THE Filter_Builder SHALL evaluate the match count against the sample contact data scoped to the currently selected account via Account_Context.
4. IF no Filter_Rules have complete values (field + operator + value all set), THEN THE Filter_Builder SHALL display the total contact count for the selected account as the Match_Count.

### Requirement 7: Segment Detail View

**User Story:** As a prototype user, I want to click a segment row to see its rules in the filter builder and preview matched members, so that I can understand and edit segment definitions.

#### Acceptance Criteria

1. WHEN the user clicks a segment row in the Segments list, THE Segment_Detail_View SHALL navigate to a detail page showing the segment name, type badge, and member count.
2. THE Segment_Detail_View SHALL render the segment's existing rules inside the Filter_Builder component, pre-populated from the segment's rule data.
3. THE Segment_Detail_View SHALL display a members preview table showing contacts that match the segment's rules, limited to the first 10 rows.
4. WHILE the segment type is "manual", THE Segment_Detail_View SHALL display the Filter_Builder in a read-only state with a label indicating manual membership.
5. WHILE the segment type is "smart", THE Segment_Detail_View SHALL allow the user to modify rules in the Filter_Builder and see the Match_Count update live.

### Requirement 8: Segment Data Model Extension

**User Story:** As a prototype developer, I want the segment model to support nested filter groups with combinators, so that the filter builder state can be persisted and restored.

#### Acceptance Criteria

1. THE Segment model SHALL define a FilterGroup type containing a combinator (AND or OR), an array of FilterRule items, and an array of child FilterGroup items.
2. THE Segment model SHALL replace the existing flat `rules: FilterRule[]` with a `rootGroup: FilterGroup` property.
3. THE existing segment sample data SHALL be migrated to use the new FilterGroup structure while preserving the same logical conditions.
4. THE FilterRule type SHALL include a `field` (string), `operator` (string), and `value` (string, string array, or number) property.

### Requirement 9: Reusable Component API

**User Story:** As a prototype developer, I want the filter builder to be a self-contained shared component with a clean props API, so that it can be embedded in segments, journey branches, report filters, and contact list filtering.

#### Acceptance Criteria

1. THE Filter_Builder SHALL accept a `value` prop of type FilterGroup representing the current filter state.
2. THE Filter_Builder SHALL accept an `onChange` callback prop that fires with the updated FilterGroup whenever the user modifies any rule, combinator, or group.
3. THE Filter_Builder SHALL accept an optional `readOnly` prop that disables all interactive controls when true.
4. THE Filter_Builder SHALL accept an optional `fields` prop to override the default Field_Registry, enabling context-specific field sets.
5. THE Filter_Builder SHALL be located in `src/components/shared/` alongside other reusable components.

### Requirement 10: Visual Design Consistency

**User Story:** As a prototype user, I want the filter builder to match the established UbiQuity design system, so that it feels like a native part of the application.

#### Acceptance Criteria

1. THE Filter_Builder SHALL use CSS Modules for all styling, consistent with the existing prototype pattern.
2. THE Filter_Builder SHALL use the prototype's design tokens for colours, spacing, border radius, and shadows (teal primary, zinc neutrals, 4px radius, shadow-sm).
3. THE Filter_Builder SHALL visually separate nested Filter_Groups using a left border accent or subtle background colour shift.
4. THE Filter_Builder SHALL render the combinator toggle as a compact pill-style toggle consistent with the ClickUp filter pattern.
5. THE Filter_Builder SHALL render the "Add filter" and "Add filter group" buttons as text-style buttons with a plus icon, consistent with the ClickUp pattern.
