# Requirements Document

## Introduction

The exporter wizard's Field Mapping step currently shows fields from the user's primary data source (derived from their filter conditions in the Data Source step). Users can only get fields from additional tables if they happen to add filter conditions across multiple source categories — there is no explicit way to say "I also want transaction fields in my export" independently of what they filtered on. This feature adds an explicit UI mechanism in the Field Mapping step that lets users select additional source entities to enrich their export with, populating the available fields list with fields from those secondary tables regardless of filter configuration.

## Glossary

- **Field_Mapping_Step**: The wizard step (`FieldMappingStep.tsx`) where users select, reorder, and rename fields for export
- **Source_Config**: The `SourceConfig` discriminated union describing the user's primary source, filter settings, and optional enrichment configuration
- **Enrichment_Config**: The `EnrichmentConfig` type union (contacts, transactions, or messages) that describes a secondary entity whose fields are added to the export
- **Enrichment_Selector**: The new UI component within the Field Mapping step that allows users to explicitly choose additional source entities to pull fields from
- **Primary_Source**: The source entity determined by the user's filter configuration (contacts, transactions, or messages)
- **Available_Fields**: The full set of fields shown in the Field Mapping step, comprising primary source fields plus any enrichment entity fields
- **Enrichment_Entity**: A secondary source entity (contacts, transactions, or messages) that is not the primary source, whose fields can be added to the export
- **Wizard_Modal**: The exporter wizard dialog (`WizardModal.tsx`) that orchestrates step navigation and holds the `ExporterWizardDraft` state

## Requirements

### Requirement 1: Display Enrichment Source Options

**User Story:** As an exporter wizard user, I want to see which additional source tables are available to pull fields from, so that I know what enrichment options exist beyond my primary data source.

#### Acceptance Criteria

1. WHEN the Field_Mapping_Step renders with a non-null Source_Config, THE Enrichment_Selector SHALL display all Enrichment_Entity options that differ from the current Primary_Source
2. WHEN the Primary_Source is "contacts", THE Enrichment_Selector SHALL offer "transactions" and "messages" as Enrichment_Entity options
3. WHEN the Primary_Source is "transactions", THE Enrichment_Selector SHALL offer "contacts" and "messages" as Enrichment_Entity options
4. WHEN the Primary_Source is "messages", THE Enrichment_Selector SHALL offer "contacts" and "transactions" as Enrichment_Entity options
5. WHEN the Source_Config is null, THE Enrichment_Selector SHALL not render

### Requirement 2: Select and Deselect Enrichment Sources

**User Story:** As an exporter wizard user, I want to toggle additional source entities on and off, so that I can control which extra fields are available in my export.

#### Acceptance Criteria

1. WHEN the user selects an Enrichment_Entity from the Enrichment_Selector, THE Field_Mapping_Step SHALL update the Source_Config enrichment field to include the selected entity
2. WHEN the user deselects a previously selected Enrichment_Entity, THE Field_Mapping_Step SHALL remove that entity from the Source_Config enrichment field
3. WHEN the user deselects an Enrichment_Entity, THE Field_Mapping_Step SHALL remove all fields belonging to that entity from the Selected_Fields array
4. WHEN the user deselects an Enrichment_Entity, THE Wizard_Modal SHALL remove all column renames associated with the deselected entity's fields

### Requirement 3: Populate Fields from Selected Enrichment Source

**User Story:** As an exporter wizard user, I want the available fields list to include fields from my selected enrichment source, so that I can pick specific fields from that additional table for my export.

#### Acceptance Criteria

1. WHEN an Enrichment_Entity is selected, THE Field_Mapping_Step SHALL add that entity's fields to the Available_Fields list with keys prefixed by `enrichment_{entity}_` and labels prefixed by the capitalised singular entity name
2. WHEN an Enrichment_Entity is selected, THE Field_Mapping_Step SHALL display the enrichment fields as unselected by default (not auto-selected)
3. WHEN the user selects individual enrichment fields from the Available_Fields list, THE Field_Mapping_Step SHALL add those fields to the Selected_Fields array
4. THE Field_Mapping_Step SHALL visually distinguish enrichment fields from primary source fields using the source badge already present in the field list

### Requirement 4: Enrichment Independence from Filters

**User Story:** As an exporter wizard user, I want to add fields from other tables regardless of what I filtered on, so that my export can include data from sources I did not use in my filter conditions.

#### Acceptance Criteria

1. WHEN the user has configured filters on "contacts" only in the Data Source step, THE Enrichment_Selector SHALL still allow the user to add "transactions" or "messages" fields in the Field Mapping step
2. WHEN the user changes their filters in the Data Source step without changing the Primary_Source type, THE Field_Mapping_Step SHALL preserve the user's enrichment selection and any enrichment fields in Selected_Fields
3. WHEN the user changes the Primary_Source type by modifying filter conditions, THE Field_Mapping_Step SHALL clear the enrichment selection if the previously selected Enrichment_Entity now matches the new Primary_Source

### Requirement 5: Persist Enrichment Selection Across Navigation

**User Story:** As an exporter wizard user, I want my enrichment selection to be remembered when I navigate between wizard steps, so that I do not lose my configuration.

#### Acceptance Criteria

1. WHEN the user navigates away from the Field_Mapping_Step and returns without changing the Primary_Source, THE Field_Mapping_Step SHALL restore the previously selected Enrichment_Entity
2. WHEN the user navigates away from the Field_Mapping_Step and returns without changing the Primary_Source, THE Field_Mapping_Step SHALL preserve any enrichment fields in the Selected_Fields array and their column renames
3. WHEN the Primary_Source changes between navigations, THE Wizard_Modal SHALL clear the enrichment selection along with the primary field reset (as defined in the auto-populate-field-mapping spec)

### Requirement 6: Enrichment Field Interactions

**User Story:** As an exporter wizard user, I want enrichment fields to support the same interactions as primary fields (reordering, renaming, select/deselect), so that my export configuration is consistent.

#### Acceptance Criteria

1. WHILE enrichment fields are in the Selected_Fields array, THE Field_Mapping_Step SHALL allow the user to reorder enrichment fields among all selected fields using drag-and-drop
2. WHILE enrichment fields are in the Selected_Fields array, THE Field_Mapping_Step SHALL allow the user to rename enrichment field output columns using the column rename input
3. WHEN the user clicks "Select All" in the field list, THE Field_Mapping_Step SHALL include both primary source fields and enrichment fields in the selection
4. WHEN the user deselects all fields and clicks "Select All" again, THE Field_Mapping_Step SHALL restore all available fields including enrichment fields

