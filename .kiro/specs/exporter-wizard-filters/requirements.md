# Requirements Document

## Introduction

Replace the static FilterSection component in the exporter wizard's Data Source step with the shared FilterBuilder component. The old FilterSection renders hardcoded dropdowns (Date Range, Membership Tier, Transaction Type) and stores a flat `FilterConfig` object. The new implementation uses the ClickUp-style FilterBuilder backed by the `FilterGroup` model from the segment system, enabling dynamic rule-based filtering with field-aware operators, nested groups, and a live match count scoped to the selected account. The FilterBuilder is functional — it evaluates filter rules against sample data in real time.

## Glossary

- **FilterBuilder**: The shared component at `src/components/shared/FilterBuilder.tsx` that renders a dynamic, rule-based filter UI with combinators (AND/OR), nested groups, and a live match count.
- **FilterGroup**: The recursive data model from `src/models/segment.ts` containing a combinator, an array of FilterRule objects, and nested FilterGroup children.
- **FilterRule**: A single filter condition consisting of a field key, an operator, and a value.
- **FilterSection**: The legacy wizard component at `src/components/wizard/FilterSection.tsx` that renders static dropdowns for dateRange, membershipTier, and transactionType.
- **FilterConfig**: The legacy flat filter type in `src/models/connector.ts` with fields `dateRange`, `membershipTier`, and `transactionType`.
- **WizardDraft**: The local state object in `src/models/wizard.ts` that holds all exporter wizard configuration during creation or editing.
- **DataSourceStep**: The wizard step component that renders data type selection, key field picker, and the filter UI.
- **ReviewStep**: The final wizard step that displays a read-only summary of the entire draft configuration.
- **FieldRegistry**: The module at `src/data/fieldRegistry.ts` that provides `getFieldsForDataType()` to return appropriate FieldDefinition arrays based on ExportDataType and TransactionalSource.
- **FieldDefinition**: A descriptor for a filterable/selectable field, including key, label, source, dataType, and optional enumValues.
- **Connector**: The persisted connector model in `src/models/connector.ts` that stores the saved export configuration including filters.
- **ExportDataType**: A union type (`'contact' | 'transactional' | 'transactional_with_contact'`) indicating what data the export covers.

## Requirements

### Requirement 1: Replace FilterConfig with FilterGroup in the Wizard Draft

**User Story:** As a developer, I want the WizardDraft to store a FilterGroup instead of a FilterConfig, so that the wizard state model supports the dynamic rule-based filter structure.

#### Acceptance Criteria

1. THE WizardDraft SHALL store a `filters` property typed as FilterGroup instead of FilterConfig.
2. THE WizardDraft default filters SHALL be an empty FilterGroup with combinator `'AND'`, one empty FilterRule, and no nested groups.
3. WHEN a new wizard is opened, THE WizardModal SHALL initialise the draft with the default empty FilterGroup.

### Requirement 2: Replace FilterSection with FilterBuilder in the Data Source Step

**User Story:** As a user, I want to build dynamic filter rules in the Data Source step, so that I can define flexible conditions instead of choosing from static dropdowns.

#### Acceptance Criteria

1. WHEN a data type is selected, THE DataSourceStep SHALL render the FilterBuilder component in place of the FilterSection component.
2. THE DataSourceStep SHALL pass the current `draft.filters` FilterGroup as the `value` prop to the FilterBuilder.
3. WHEN the user modifies filter rules in the FilterBuilder, THE DataSourceStep SHALL update `draft.filters` with the new FilterGroup via the `onUpdate` callback.
4. THE DataSourceStep SHALL remove the "Preview only" label from the filters row hint text.
5. THE DataSourceStep SHALL display a functional description such as "Narrow down the records to export" as the filters row hint text.

### Requirement 3: Provide Data-Type-Appropriate Fields to the FilterBuilder

**User Story:** As a user, I want the filter field options to match my selected data type, so that I only see relevant fields for contacts, transactional records, or both.

#### Acceptance Criteria

1. WHEN the data type is `'contact'`, THE DataSourceStep SHALL pass contact fields from the FieldRegistry to the FilterBuilder `fields` prop.
2. WHEN the data type is `'transactional'`, THE DataSourceStep SHALL pass treatment or product fields from the FieldRegistry based on the selected TransactionalSource.
3. WHEN the data type is `'transactional_with_contact'`, THE DataSourceStep SHALL pass both transactional and contact fields from the FieldRegistry.
4. WHEN the data type or transactional source changes, THE DataSourceStep SHALL update the fields passed to the FilterBuilder to reflect the new selection.

### Requirement 4: Display Live Match Count Scoped to the Selected Account

**User Story:** As a user, I want to see how many records match my filter rules in real time, so that I can gauge the impact of my filters before proceeding.

#### Acceptance Criteria

1. THE FilterBuilder SHALL display a live count of records matching the current filter rules.
2. THE FilterBuilder SHALL evaluate filter rules against sample data scoped to the currently selected account.
3. WHEN no complete filter rules exist, THE FilterBuilder SHALL display the total record count with an indication that all records match.
4. WHEN the user adds, modifies, or removes a filter rule, THE FilterBuilder SHALL recalculate and update the match count.

### Requirement 5: Update the ReviewStep to Display FilterGroup Summary

**User Story:** As a user, I want the Review step to show a human-readable summary of my filter rules, so that I can verify my filter configuration before saving.

#### Acceptance Criteria

1. THE ReviewStep SHALL display a summary of the filter rules from the FilterGroup stored in the draft.
2. WHEN the FilterGroup contains complete rules, THE ReviewStep SHALL render each rule showing the field label, operator label, and value.
3. WHEN the FilterGroup contains nested groups, THE ReviewStep SHALL indicate the group combinator (AND/OR) between rule summaries.
4. WHEN the FilterGroup contains no complete rules, THE ReviewStep SHALL display "No filters applied".
5. THE ReviewStep SHALL remove the legacy FilterConfig display logic (dateRange, membershipTier, transactionType rows).

### Requirement 6: Update the Connector Model to Use FilterGroup

**User Story:** As a developer, I want the Connector model to store FilterGroup instead of FilterConfig, so that saved connectors persist the dynamic filter structure.

#### Acceptance Criteria

1. THE Connector interface SHALL define its `filters` property as type FilterGroup instead of FilterConfig.
2. WHEN the wizard saves a new connector, THE WizardModal SHALL persist the FilterGroup from the draft into the Connector's `filters` field.
3. WHEN the wizard opens in edit mode for an existing connector, THE WizardModal SHALL load the connector's FilterGroup into the draft.

### Requirement 7: Migrate Existing Connector Data from FilterConfig to FilterGroup

**User Story:** As a developer, I want existing seed/sample connectors to use the FilterGroup shape, so that the prototype does not break when loading pre-existing data.

#### Acceptance Criteria

1. THE seed data for sample connectors SHALL use FilterGroup objects instead of FilterConfig objects in the `filters` field.
2. IF a connector's filters field contains a legacy FilterConfig shape, THEN THE application SHALL treat it as an empty FilterGroup with no rules applied.

### Requirement 8: Remove the Legacy FilterSection Component

**User Story:** As a developer, I want to remove the unused FilterSection component and its styles, so that the codebase does not retain dead code.

#### Acceptance Criteria

1. THE codebase SHALL no longer contain the FilterSection component file (`src/components/wizard/FilterSection.tsx`).
2. THE codebase SHALL no longer contain the FilterSection CSS module file (`src/components/wizard/FilterSection.module.css`).
3. THE codebase SHALL not import or reference FilterSection from any module.
4. THE FilterConfig type MAY be removed from `src/models/connector.ts` if no other module references it.
