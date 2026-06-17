# Requirements Document

## Introduction

When users configure an exporter in the UbiQuity wizard, they first select a data source and configure filters (Data Source step), then move to the Field Mapping step to choose which fields to include in the export. Currently, the Field Mapping step starts with no fields selected, requiring users to manually add every field — even though the system already knows which source categories they filtered on. This feature automatically pre-populates the Field Mapping step with all fields from the user's configured data source, reducing friction while still allowing users to add fields from additional sources or remove unwanted fields.

## Glossary

- **Wizard_Modal**: The exporter wizard dialog component (`WizardModal.tsx`) that orchestrates step navigation and holds the `ExporterWizardDraft` state
- **Data_Source_Step**: The wizard step where users configure source categories and filters using the card-based filter builder (`DataSourceFilterStep.tsx`)
- **Field_Mapping_Step**: The wizard step where users select, reorder, and rename fields for export (`FieldMappingStep.tsx`)
- **Source_Config**: The structured configuration object (`SourceConfig`) that describes the user's chosen primary source type, filter settings, and optional enrichment
- **Selected_Fields**: The array of `SelectedField` objects on the wizard draft representing fields the user has chosen to include in the export
- **Available_Fields**: The full set of fields resolvable from a given `SourceConfig` via `getFieldsForSourceConfig()`, including both primary source fields and enrichment fields
- **Filter_Builder**: The card-based filter builder component used in the Data Source step, which presents source categories (Contacts, Transactional, Email, SMS) with their respective fields
- **Source_Category**: A top-level grouping of fields used in the filter builder (e.g., Contacts, Transactional, Email, SMS)

## Requirements

### Requirement 1: Auto-Populate Fields on Step Transition

**User Story:** As an exporter wizard user, I want the Field Mapping step to automatically include all fields from my configured data source, so that I do not have to manually add each field after configuring my filters.

#### Acceptance Criteria

1. WHEN the user navigates forward from the Data Source step to the Field Mapping step AND the Selected_Fields array is empty, THE Wizard_Modal SHALL populate Selected_Fields with all Available_Fields derived from the current Source_Config
2. WHEN the user navigates forward from the Data Source step to the Field Mapping step AND the Selected_Fields array already contains fields, THE Wizard_Modal SHALL retain the existing Selected_Fields without overwriting them
3. WHEN the Source_Config is null at the time of transition to the Field Mapping step, THE Wizard_Modal SHALL leave the Selected_Fields array unchanged (empty)

### Requirement 2: Respect Source Config Changes

**User Story:** As an exporter wizard user, I want the auto-populated fields to update if I go back and change my data source, so that the field list always reflects my current source selection.

#### Acceptance Criteria

1. WHEN the user navigates back from the Field Mapping step to the Data Source step, changes the Source_Config such that the primary source type or sub-source changes, and then navigates forward again, THE Wizard_Modal SHALL clear the existing Selected_Fields and re-populate them with all Available_Fields from the new Source_Config
2. WHEN the user navigates back from the Field Mapping step to the Data Source step, modifies only the filter conditions without changing the primary source type or sub-source, and then navigates forward again, THE Wizard_Modal SHALL retain the existing Selected_Fields unchanged
3. THE Wizard_Modal SHALL use the existing `didSourceOrSubSourceChange` function to determine whether the source type or sub-source has changed between the previous and current Source_Config

### Requirement 3: Allow Additional Field Selection

**User Story:** As an exporter wizard user, I want to add fields from other available sources after auto-population, so that I can enrich my export beyond the fields from my primary data source.

#### Acceptance Criteria

1. WHILE the Field_Mapping_Step displays auto-populated fields, THE Field_Mapping_Step SHALL continue to show unselected fields from the Available_Fields list that can be toggled on by the user
2. WHEN the user manually selects additional fields beyond the auto-populated set, THE Field_Mapping_Step SHALL append those fields to the Selected_Fields array and persist them across step navigation (forward and back) as long as the source type has not changed
3. THE Field_Mapping_Step SHALL allow the user to deselect any auto-populated field, removing it from the Selected_Fields array

### Requirement 4: Filter Builder Category Fields Inform Available Fields

**User Story:** As an exporter wizard user, I want the fields available for mapping to correspond to the source categories I interacted with in the filter builder, so that the field mapping reflects the data sources I have configured.

#### Acceptance Criteria

1. WHEN the Source_Config has a primary source of "contacts", THE Field_Mapping_Step SHALL include contact fields (Email, First Name, Last Name, Created At, Status, Phone, Segment) in the Available_Fields list
2. WHEN the Source_Config has a primary source of "transactions", THE Field_Mapping_Step SHALL include transaction fields (Transaction ID, Contact ID, Amount, Date, Type, Status) in the Available_Fields list
3. WHEN the Source_Config has a primary source of "messages", THE Field_Mapping_Step SHALL include message fields (Message ID, Contact ID, Channel, Status, Sent At, Campaign ID) in the Available_Fields list
4. WHEN the Source_Config includes an enrichment entity, THE Field_Mapping_Step SHALL include the enrichment entity's fields (prefixed with the entity name) in addition to the primary source fields

### Requirement 5: Preserve Field Order and Renames

**User Story:** As an exporter wizard user, I want my field reordering and column renames to be preserved when I navigate between steps, so that I do not lose customisation work.

#### Acceptance Criteria

1. WHEN the user has reordered auto-populated fields and navigates away from the Field Mapping step and back, THE Field_Mapping_Step SHALL preserve the custom field order as long as the source type has not changed
2. WHEN the user has applied column renames to auto-populated fields and the source type has not changed, THE Wizard_Modal SHALL preserve those column renames across step navigation
3. WHEN the source type changes and fields are re-populated, THE Wizard_Modal SHALL clear all column renames associated with the previous field set
