# Requirements Document

## Introduction

A unified, reusable card-based filter builder component that replaces the existing inline-dropdown FilterBuilder with a progressive drill-down experience. Instead of presenting all fields in a flat dropdown or nested tree, users navigate through category selection cards to progressively narrow down to a specific field, then configure the full condition (operator + value) in a single modal flow. The main filter view displays configured conditions as natural language summaries with AND/OR logic groups and nesting support.

This component replaces the existing `FilterBuilder` at `src/components/composed/filter-builder.tsx` and the spec at `.kiro/specs/progressive-data-source-selection/`. It is designed to be reusable across the exporter wizard, segment builder, and journey builder.

## Glossary

- **Card_Filter_Builder**: The top-level composed component that renders the filter structure (logic groups, condition summaries, add/edit actions) and orchestrates the condition configuration modal
- **Condition_Summary**: A natural language representation of a configured filter condition displayed in the main view (e.g., "Contact email contains @gmail.com")
- **Logic_Group**: A collection of conditions combined with either AND or OR logic, supporting nesting up to a configurable depth
- **Condition_Modal**: The dialog overlay where users progressively configure a filter condition through source category → sub-source → field → operator/value steps
- **Source_Category**: A top-level grouping of related fields presented as selection cards (e.g., Contacts, Messages, Transactional)
- **Source_Category_Card**: A clickable card in the modal representing a source category, displaying an icon, title, and description
- **Sub_Source**: An intermediate selection within a source category that narrows down the available field set (e.g., choosing "Treatments" or "Products" within the Transactional category)
- **Field_Definition**: A field available for filtering, with a key, label, source, data type, and optional enum values
- **Data_Type**: The classification of a field's value type — one of: text, number, date, boolean, or enum
- **Operator**: A comparison function applied to a field value (e.g., equals, contains, greater_than, before, is_true, is_in)
- **Date_Mode**: A qualifier that determines how a date value is interpreted during comparison — one of: "specific" (exact date), "anniversary" (recurring annual date, day/month only), or "same_day" (day/month match, ignoring year)
- **Chip_Input**: A bulk value entry control that displays added values as removable chips, supporting paste from spreadsheets (one value per line) and individual entry via the Enter key
- **Condition_Configuration**: The complete specification of a single filter condition: source category, sub-source (if applicable), field, operator, and value
- **Source_Category_Config**: The configuration object passed as a prop defining which source categories are available and what fields each provides

## Requirements

### Requirement 1: Main Filter View — Logic Groups and Nesting

**User Story:** As a user, I want to build filter conditions organized in AND/OR logic groups with optional nesting, so that I can express complex filtering criteria.

#### Acceptance Criteria

1. THE Card_Filter_Builder SHALL render a root Logic_Group with a clickable logic toggle displaying either "AND" or "OR", defaulting to "AND" when no value prop is provided
2. WHEN the user clicks the logic toggle on a Logic_Group, THE Card_Filter_Builder SHALL switch that group between AND and OR logic and emit the updated state via the onChange callback
3. IF the allowNesting prop is true AND the current nesting depth is below the maxDepth prop value (where the root Logic_Group is depth 1), THEN THE Card_Filter_Builder SHALL display a "+Group" action that creates a nested Logic_Group with the opposite logic of its parent
4. IF the allowNesting prop is false, THEN THE Card_Filter_Builder SHALL hide the "+Group" action and operate in flat mode with only "+Filter" available
5. IF the current nesting depth equals the maxDepth prop value, THEN THE Card_Filter_Builder SHALL disable the "+Group" action with a tooltip reading "Maximum nesting depth reached"
6. WHEN a nested Logic_Group loses all its conditions and nested groups through removal, THE Card_Filter_Builder SHALL automatically remove that empty group from its parent, applying recursively up the tree but never removing the root Logic_Group
7. THE Card_Filter_Builder SHALL always render the root Logic_Group regardless of whether it contains any conditions or nested groups

### Requirement 2: Condition Display as Natural Language Summaries

**User Story:** As a user, I want to see my configured filter conditions as readable natural language summaries, so that I can quickly understand what each condition does without decoding dropdown values.

#### Acceptance Criteria

1. WHEN a condition has a sourceCategory, field, operator, and value (or a no-value operator) all specified, THE Card_Filter_Builder SHALL display it as a Condition_Summary formatted as "{Source Category Title} {Field Label} {Operator Label} {Value}" (e.g., "Contact email contains @gmail.com")
2. WHEN a condition uses a no-value operator (is_empty, is_not_empty, is_true, is_false), THE Card_Filter_Builder SHALL display the summary without a value portion (e.g., "Contact phone is empty")
3. WHEN a condition uses the "Between" date operator, THE Card_Filter_Builder SHALL format the value as two dates using the browser's locale date formatting (e.g., "Transaction date between 1 Jan – 31 Mar 2025"), WHEN a condition uses the "In last N days" operator, THE Card_Filter_Builder SHALL format the value as "{Field Label} in last {N} days", and WHEN a condition uses a date mode other than "Specific date", THE Card_Filter_Builder SHALL include the mode in the summary (e.g., "DOB anniversary on 15 Mar", "DOB same day as 25 Dec")
4. WHEN a condition uses an enum operator, THE Card_Filter_Builder SHALL display the enum label rather than the raw value in the summary
5. THE Card_Filter_Builder SHALL display a remove action on each Condition_Summary that immediately deletes the condition from its parent Logic_Group when activated without requiring a confirmation step
6. WHEN a Condition_Summary value portion exceeds 40 characters, THE Card_Filter_Builder SHALL truncate the displayed value with an ellipsis and display the full value on hover via a tooltip

### Requirement 3: Add Filter — Opening the Condition Modal

**User Story:** As a user, I want to click "+Filter" to open a modal that guides me through configuring a new condition, so that I can add conditions without the interface feeling overwhelming.

#### Acceptance Criteria

1. WHEN the user activates the "+Filter" action within a Logic_Group, THE Card_Filter_Builder SHALL open the Condition_Modal as a centered dialog overlay starting at the first step (Source Category selection)
2. WHILE the Condition_Modal is on any step beyond the first, THE Condition_Modal SHALL display a back navigation action that returns to the previous step without clearing data entered during the current modal session (from open to close or confirm)
3. WHEN the user dismisses the Condition_Modal without completing all steps — via the close button, pressing Escape, or clicking the backdrop overlay — THE Card_Filter_Builder SHALL discard the in-progress condition and leave the filter structure unchanged
4. WHEN the user completes all steps and activates the confirm action, THE Card_Filter_Builder SHALL append the new Condition_Configuration to the end of the condition list within the Logic_Group that initiated the "+Filter" action

### Requirement 4: Modal Step 1 — Source Category Card Selection

**User Story:** As a user, I want to see available data source categories as visual cards, so that I can quickly identify and select the type of data I want to filter on.

#### Acceptance Criteria

1. WHEN the Condition_Modal opens for a new condition, THE Condition_Modal SHALL display Source_Category_Cards for each category defined in the Source_Category_Config prop, arranged in a responsive grid layout
2. THE Condition_Modal SHALL render each Source_Category_Card with an icon, title (maximum 40 characters, truncated with ellipsis if exceeded), and description (maximum 120 characters, truncated with ellipsis if exceeded) as specified in the Source_Category_Config
3. WHEN the user selects a Source_Category_Card, THE Condition_Modal SHALL highlight the selected card with a teal border and checkmark badge, then immediately advance to the next applicable step without requiring a separate confirmation action
4. WHEN the Source_Category_Config contains only one category, THE Condition_Modal SHALL bypass Step 1 entirely without rendering it and advance directly to the next step with that category pre-selected
5. IF the Source_Category_Config prop contains zero categories, THEN THE Condition_Modal SHALL display an empty state message indicating no source categories are available and disable the confirm action

### Requirement 5: Modal Step 2 — Sub-Source Selection

**User Story:** As a user, I want to narrow down within a category when it contains multiple sub-sources, so that I only see fields relevant to my specific data table.

#### Acceptance Criteria

1. WHEN the selected Source_Category has more than one Sub_Source defined, THE Condition_Modal SHALL display a list of available Sub_Sources for that category, rendering each Sub_Source with its label as defined in the Source_Category_Config
2. WHEN the selected Source_Category has no Sub_Sources defined or has exactly one Sub_Source defined, THE Condition_Modal SHALL skip this step and advance directly to field selection (auto-selecting the single Sub_Source if one exists)
3. WHEN the user selects a Sub_Source, THE Condition_Modal SHALL advance to the field selection step showing only fields belonging to that Sub_Source

### Requirement 6: Modal Step 3 — Field Selection

**User Story:** As a user, I want to pick from a flat list of fields once I have narrowed to a specific source, so that field selection is fast and unambiguous.

#### Acceptance Criteria

1. WHEN the Condition_Modal reaches the field selection step, THE Condition_Modal SHALL display a flat list of Field_Definitions available for the selected source (or sub-source), sorted alphabetically by field label
2. THE Condition_Modal SHALL display each field with its label and a Data_Type indicator (badge or icon) adjacent to the label that identifies the field's type (text, number, date, boolean, or enum)
3. WHEN the available field list contains more than 8 items, THE Condition_Modal SHALL display a search input that performs case-insensitive substring matching against field labels, filtering the list on each keystroke starting from the first character
4. WHEN the user selects a field, THE Condition_Modal SHALL advance to the operator and value configuration step
5. IF the selected source (or sub-source) has zero Field_Definitions available, THEN THE Condition_Modal SHALL display an empty state message indicating no fields are available and SHALL disable advancement to the next step

### Requirement 7: Modal Step 4 — Operator and Value Configuration

**User Story:** As a user, I want to configure the operator and value for my chosen field in a single step, so that I can complete the condition without navigating further.

#### Acceptance Criteria

1. WHEN the Condition_Modal reaches the operator/value step, THE Condition_Modal SHALL display an operator selector populated with operators appropriate for the selected field's Data_Type
2. WHEN the selected field has Data_Type "text", THE Condition_Modal SHALL offer operators: Equals, Not equals, Contains, Starts with, Ends with, Is in, Is not in, Is empty, Is not empty
3. WHEN the selected field has Data_Type "number", THE Condition_Modal SHALL offer operators: Equals, Not equals, Greater than, Less than, Greater or equal, Less or equal, Is in, Is not in, Is empty, Is not empty
4. WHEN the selected field has Data_Type "date", THE Condition_Modal SHALL offer operators: On, Before, After, Between, In last N days, Is empty, Is not empty
5. WHEN the selected field has Data_Type "boolean", THE Condition_Modal SHALL offer operators: Is true, Is false
6. WHEN the selected field has Data_Type "enum", THE Condition_Modal SHALL offer operators: Is, Is not, Is in, Is not in, Is empty, Is not empty
7. WHEN the user selects a no-value operator (Is empty, Is not empty, Is true, Is false), THE Condition_Modal SHALL hide the value input and enable the confirm action immediately
8. WHEN the selected operator requires a value, THE Condition_Modal SHALL render a value input appropriate to the Data_Type: text input (maximum 500 characters) for text, numeric input (accepting integers and decimals) for number, date picker for date, and enum selector populated from the field's defined enum values for enum
9. WHEN the operator is "Between" for a date field, THE Condition_Modal SHALL render a date range picker with start and end date inputs, and SHALL disable the confirm action until both dates are provided and the start date is on or before the end date
10. WHEN the operator is "In last N days" for a date field, THE Condition_Modal SHALL render a numeric input labelled "days" that accepts only whole numbers between 1 and 3650
11. WHEN the user has selected an operator and provided a valid, non-empty value (or selected a no-value operator), THE Condition_Modal SHALL enable a confirm action that closes the modal and creates the condition
12. WHEN the user changes the selected operator after a value has been entered, THE Condition_Modal SHALL clear the current value and render the value input appropriate to the new operator, disabling the confirm action until a valid value is provided
13. IF the user submits a value that does not match the expected Data_Type format (e.g., non-numeric text in a number input), THEN THE Condition_Modal SHALL display an inline validation message below the input and keep the confirm action disabled
14. WHEN the selected field has Data_Type "date" AND the operator is not "In last N days", "Is empty", or "Is not empty", THE Condition_Modal SHALL display a date mode selector below the operator with options: "Specific date" (default), "Anniversary", and "Same day as"
15. WHEN the date mode is "Specific date", THE Condition_Modal SHALL render a standard date picker for the value input
16. WHEN the date mode is "Anniversary", THE Condition_Modal SHALL render a month and day picker (no year) and the condition SHALL match the recurring annual date regardless of year
17. WHEN the date mode is "Same day as", THE Condition_Modal SHALL render a date picker and the condition SHALL compare only the day and month portions, ignoring year

### Requirement 13: "Is In" / "Is Not In" — Bulk Value Input

**User Story:** As a user, I want to filter by a list of values (e.g. multiple email addresses or IDs), so that I can target or exclude a specific set of records without creating multiple individual conditions.

#### Acceptance Criteria

1. WHEN the user selects the "Is in" or "Is not in" operator, THE Condition_Modal SHALL render a chip-based value input that supports adding multiple values
2. THE chip input SHALL allow the user to type a value and press Enter to add it as a chip
3. THE chip input SHALL allow the user to paste multi-line text (e.g. copied from a spreadsheet column) where each line is automatically added as a separate chip
4. WHEN multi-line text is pasted, THE chip input SHALL split on newline characters and add each non-empty trimmed line as an individual chip
5. THE chip input SHALL display each added value as a removable chip with an X button
6. THE chip input SHALL display a "Clear all" action that removes all chips in a single action
7. THE chip input SHALL display a count label (e.g. "12 values") showing the total number of chips added
8. THE Condition_Modal SHALL disable the confirm action when zero chips are present for an "Is in" or "Is not in" operator
9. WHEN the condition uses "Is in" or "Is not in", THE Condition_Summary SHALL display the value portion as "{N} values" (e.g. "Contact email is in 5 values") rather than listing all values inline
10. WHEN the user hovers over the value portion of an "Is in" / "Is not in" Condition_Summary, THE Card_Filter_Builder SHALL display a tooltip showing the first 10 values with an indication of how many more exist if the list exceeds 10

### Requirement 8: Edit Existing Condition

**User Story:** As a user, I want to click an existing condition summary to re-open the modal pre-populated with its current configuration, so that I can modify any part of the condition without rebuilding it from scratch.

#### Acceptance Criteria

1. WHEN the user clicks on an existing Condition_Summary, THE Card_Filter_Builder SHALL open the Condition_Modal at the operator/value step (Step 4) with all steps pre-populated from the current Condition_Configuration (source category, sub-source, field, operator, and value), allowing back-navigation to any earlier step
2. WHILE the Condition_Modal is in edit mode, IF the user navigates back to a previous step and selects a different value than the current one, THEN THE Condition_Modal SHALL clear all selections in subsequent steps and require the user to re-configure from that point forward
3. WHILE the Condition_Modal is in edit mode, IF the user navigates back to a previous step and re-selects the same value, THEN THE Condition_Modal SHALL preserve all existing downstream selections unchanged
4. WHEN the user confirms the edited condition, THE Card_Filter_Builder SHALL replace the existing Condition_Configuration with the updated configuration in-place within the same Logic_Group position
5. WHEN the user closes the modal without confirming, THE Card_Filter_Builder SHALL retain the original Condition_Configuration unchanged

### Requirement 9: Configurable Source Categories

**User Story:** As a developer, I want to configure which source categories are available through props, so that different contexts (exporter, segment builder, journey builder) can show different card sets.

#### Acceptance Criteria

1. THE Card_Filter_Builder SHALL accept a Source_Category_Config prop that defines the available source categories, each with: a unique key, icon component, title, description, optional sub-sources array, and a field set (array of Field_Definitions)
2. IF the Source_Category_Config prop contains zero categories, THEN THE Card_Filter_Builder SHALL render an empty state in place of the "+Filter" action indicating no source categories are configured, and SHALL disable filter creation
3. WHEN the Source_Category_Config prop changes, THE Card_Filter_Builder SHALL mark any existing conditions that reference categories or fields no longer present in the configuration as invalid by displaying a warning icon and muted styling on those Condition_Summaries, and SHALL fire the onChange callback with the updated filter state
4. WHEN a condition is marked as invalid due to a Source_Category_Config change, THE Card_Filter_Builder SHALL still allow the user to remove the invalid condition but SHALL prevent editing it via the Condition_Modal
5. THE Card_Filter_Builder SHALL allow conditions from different source categories to coexist within the same Logic_Group, with each condition independently referencing its own source category key and field set from the Source_Category_Config

### Requirement 10: Component API and Integration

**User Story:** As a developer, I want the Card_Filter_Builder to follow the same controlled-component pattern as the existing FilterBuilder, so that it integrates consistently with forms and state management.

#### Acceptance Criteria

1. THE Card_Filter_Builder SHALL accept a value prop of type FilterGroup (matching the structure exported by the existing composed FilterBuilder at `src/components/composed/filter-builder.tsx`: `{ logic: FilterLogic, conditions: FilterCondition[] }`) representing the current filter state
2. WHEN the filter structure changes due to any user interaction (adding, editing, removing conditions or groups, or toggling logic), THE Card_Filter_Builder SHALL invoke the onChange callback prop with the complete updated FilterGroup within the same event cycle
3. THE Card_Filter_Builder SHALL accept an allowNesting boolean prop (defaulting to true) that controls whether nested Logic_Groups are permitted
4. THE Card_Filter_Builder SHALL accept a maxDepth number prop (defaulting to 3, minimum 1, maximum 10) that limits the maximum nesting depth of Logic_Groups
5. WHEN the value prop contains an empty FilterGroup (no conditions), THE Card_Filter_Builder SHALL render the root Logic_Group with only the "+Filter" action visible and no Condition_Summaries
6. THE Card_Filter_Builder SHALL be implemented as a composed component at `src/components/composed/card-filter-builder.tsx`
7. THE Card_Filter_Builder SHALL use shadcn/ui Dialog for the Condition_Modal and shadcn/ui Card for Source_Category_Cards
8. THE Card_Filter_Builder SHALL use Phosphor Icons for all iconography within the component
9. THE Card_Filter_Builder SHALL operate as a pure controlled component — it SHALL NOT maintain internal filter state, and the rendered output SHALL always reflect the current value prop

### Requirement 11: Condition Serialisation and Summary Generation

**User Story:** As a developer, I want each condition to be serialisable to a structured object and renderable as a natural language string, so that the filter state can be persisted and displayed consistently.

#### Acceptance Criteria

1. THE Card_Filter_Builder SHALL produce a FilterGroup structure where each condition row stores: sourceCategory key (string), subSource key (string or null), field key (string), operator key (string), value (string, number, boolean, null for no-value operators, a two-element array of strings for range operators such as "Between", or an array of strings for "Is in" / "Is not in" operators), and dateMode (string or null — one of "specific", "anniversary", "same_day" — only present for date field conditions)
2. THE Card_Filter_Builder SHALL provide a summary generator function that converts a Condition_Configuration into a natural language string by resolving the source category title, field label, operator label, and value formatted according to its Data_Type: dates displayed in locale short-date format, numbers displayed as-is, enum values resolved to their display labels, and boolean/no-value operators rendered without a value portion
3. THE Card_Filter_Builder SHALL guarantee JSON round-trip integrity: serialising any valid Condition_Configuration to a JSON string and deserialising it back SHALL produce a result where sourceCategory, subSource, field, operator, and value are deeply equal to the original
4. THE Card_Filter_Builder SHALL generate a Condition_Summary that contains no raw field keys or operator codes — only human-readable labels resolved from the Source_Category_Config
5. IF the summary generator receives a Condition_Configuration that references a sourceCategory key or field key not present in the current Source_Category_Config, THEN THE Card_Filter_Builder SHALL render the summary using the raw keys as fallback text and apply a visual validation indicator to that condition

### Requirement 12: Component Library Demo Support

**User Story:** As a developer, I want the Card_Filter_Builder to work within the component library demo system, so that it can be explored and tested via the component registry.

#### Acceptance Criteria

1. THE Card_Filter_Builder SHALL be registered in the component registry at `src/data/componentRegistry.tsx` with category "compositions", a unique slug, a description, searchTerms for discoverability, and propControls defining interactive controls for the demo
2. THE Card_Filter_Builder demo SHALL provide a default Source_Category_Config with at least two source categories (e.g., Contacts and Transactional), where at least one category includes Sub_Sources to demonstrate the full progressive drill-down flow through all modal steps
3. THE Card_Filter_Builder demo SHALL expose allowNesting as a toggle control and maxDepth as a counter control (minimum 1, maximum 5) in the registry, where the maxDepth control is only visible when allowNesting is true
4. THE Card_Filter_Builder demo default Source_Category_Config SHALL include fields covering at least three distinct Data_Types (from text, number, date, boolean, enum) so that operator and value input variations are demonstrable without reconfiguration
