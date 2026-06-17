# Requirements Document

## Introduction

The exporter wizard's Field Mapping step currently uses a chip toggle UI to offer at most 2 enrichment entity options (e.g. "transactions" and "messages" when the primary source is "contacts"). In practice, "transactions" is not a single table — there could be dozens of transactional database structures (orders, invoices, payments, subscriptions, bookings, purchases, etc.). The chip toggle pattern does not scale to dozens of options.

This feature replaces the current enrichment selector with a scalable UI pattern that handles a large number of available source tables. Users need to browse, search, and select specific tables from a potentially large catalogue while maintaining a clear mental model of what they have selected. The feature also revisits the single-enrichment constraint to allow multi-source enrichment where users can pull fields from more than one additional table simultaneously.

## Glossary

- **Field_Mapping_Step**: The wizard step (`FieldMappingStep.tsx`) where users select, reorder, and rename fields for export
- **Source_Selector**: The new UI component within the Field Mapping step that replaces the existing EnrichmentSelector, designed to handle dozens of available source tables
- **Source_Catalogue**: The complete list of available source tables that a user can enrich from, grouped by category
- **Source_Category**: A logical grouping of source tables (e.g. "Transactional", "Messaging", "Contact") used to organise the Source_Catalogue
- **Selected_Sources**: The set of additional source tables the user has chosen to enrich their export with (zero or more)
- **Primary_Source**: The source entity determined by the user's filter configuration (contacts, transactions, or messages)
- **Source_Config**: The `SourceConfig` discriminated union describing the user's primary source, filter settings, and optional enrichment configuration
- **Available_Fields**: The full set of fields shown in the Field Mapping step, comprising primary source fields plus fields from all Selected_Sources
- **Wizard_Modal**: The exporter wizard dialog (`WizardModal.tsx`) that orchestrates step navigation and holds the `ExporterWizardDraft` state
- **Source_Table**: A single database table or entity (e.g. "Bookings", "Purchases", "Invoices") that can contribute fields to an export
- **Popover_Panel**: A floating panel triggered from the Source_Selector that displays the searchable, categorised source catalogue

## Requirements

### Requirement 1: Display Scalable Source Selector

**User Story:** As an exporter wizard user, I want to see a compact source selector that can handle dozens of available tables, so that I can add enrichment sources without the UI becoming cluttered or unusable.

#### Acceptance Criteria

1. IF the Source_Config is non-null, THEN THE Source_Selector SHALL render within the Field_Mapping_Step above the available fields list
2. IF no additional sources are in Selected_Sources, THEN THE Source_Selector SHALL display an "Add sources" button as the trigger element that opens the Source_Catalogue
3. IF one or more additional sources are in Selected_Sources, THEN THE Source_Selector SHALL display each selected source name as a chip with a visible remove button, alongside an "Add" button that opens the Source_Catalogue
4. IF the Source_Config is null, THEN THE Source_Selector SHALL not render
5. IF the number of selected source chips exceeds the available horizontal space of the Source_Selector container, THEN THE Source_Selector SHALL wrap chips to additional lines rather than truncating or hiding them
6. WHEN the user clicks the remove button on a source chip, THE Source_Selector SHALL deselect that source, equivalent to deselecting it in the Source_Catalogue

### Requirement 2: Browse and Search the Source Catalogue

**User Story:** As an exporter wizard user, I want to search and browse available tables by category, so that I can quickly find the specific table I want from a potentially large list.

#### Acceptance Criteria

1. WHEN the user opens the Source_Catalogue via the trigger element, THE Popover_Panel SHALL display a search input at the top and a categorised list of available Source_Tables below
2. WHEN the user types in the search input, THE Popover_Panel SHALL filter the displayed Source_Tables immediately on each keystroke to those whose name contains the search term (case-insensitive substring match)
3. WHEN search results span multiple categories, THE Popover_Panel SHALL maintain category grouping in the filtered results and hide categories that have no matching Source_Tables
4. WHEN no Source_Tables match the search term, THE Popover_Panel SHALL display an empty state message indicating no results were found
5. WHILE the Popover_Panel is open, THE Source_Catalogue SHALL visually distinguish Source_Tables that are already in Selected_Sources with a checked state
6. THE Popover_Panel SHALL exclude the current Primary_Source from the available Source_Tables list
7. WHEN the Source_Catalogue contains more than 10 Source_Tables, THE Popover_Panel SHALL be scrollable with a maximum height of 320px
8. WHEN the user clears the search input (via backspace or a clear button), THE Popover_Panel SHALL restore the full categorised list of available Source_Tables

### Requirement 3: Select and Deselect Multiple Sources

**User Story:** As an exporter wizard user, I want to select multiple additional source tables simultaneously, so that I can pull fields from several transactional databases in a single export.

#### Acceptance Criteria

1. WHEN the user selects a Source_Table from the Source_Catalogue, THE Source_Selector SHALL immediately add that table to Selected_Sources and append its fields to the Available_Fields list without closing the Popover_Panel
2. WHEN the user deselects a Source_Table from the Source_Catalogue, THE Source_Selector SHALL remove that table from Selected_Sources
3. WHEN the user deselects a Source_Table that has fields in the selected fields array, THE Field_Mapping_Step SHALL remove all fields belonging to that table from the selected fields array
4. WHEN the user deselects a Source_Table, THE Wizard_Modal SHALL remove all column renames associated with that table's fields
5. WHEN the user clicks the remove button on a selected source chip, THE Source_Selector SHALL deselect that source (triggering the same removal behaviour as deselecting in the catalogue per criteria 2, 3, and 4)
6. THE Source_Selector SHALL allow zero or more sources to be selected simultaneously up to the total number of Source_Tables in the Source_Catalogue minus the Primary_Source (no single-source constraint)
7. WHILE the Popover_Panel is open and the user selects or deselects a Source_Table, THE Popover_Panel SHALL remain open to allow additional selections without requiring the user to reopen the catalogue

### Requirement 4: Populate Fields from Selected Sources

**User Story:** As an exporter wizard user, I want the available fields list to include fields from all my selected sources, so that I can pick specific fields from multiple additional tables for my export.

#### Acceptance Criteria

1. WHEN one or more Source_Tables are in Selected_Sources, THE Field_Mapping_Step SHALL add each table's fields to the Available_Fields list with keys prefixed by the table identifier and labels prefixed by the table display name
2. WHEN Source_Tables are in Selected_Sources, THE Field_Mapping_Step SHALL display their fields as unselected by default (not auto-selected)
3. WHEN the user selects individual fields from an enrichment Source_Table, THE Field_Mapping_Step SHALL add those fields to the selected fields array
4. THE Field_Mapping_Step SHALL visually distinguish fields from different Source_Tables using a source badge that displays the table name
5. WHEN multiple Source_Tables are selected, THE Field_Mapping_Step SHALL group unselected fields by their source table in the available fields list, with Primary_Source fields appearing first followed by enrichment source groups in the order they were added to Selected_Sources
6. WHILE fields are grouped by source table, THE Field_Mapping_Step SHALL display fields within each group in the order defined by the Source_Table's field definitions

### Requirement 5: Source Selection Independence from Filters

**User Story:** As an exporter wizard user, I want to add fields from other tables regardless of what I filtered on, so that my export can include data from sources I did not use in my filter conditions.

#### Acceptance Criteria

1. WHEN the user has configured filters on "contacts" only in the Data Source step, THE Source_Selector SHALL still allow the user to add any available Source_Tables in the Field Mapping step
2. WHEN the user changes their filters in the Data Source step without changing the Primary_Source type, THE Field_Mapping_Step SHALL preserve Selected_Sources and any enrichment fields in the selected fields array
3. WHEN the user changes the Primary_Source type, THE Field_Mapping_Step SHALL remove any Selected_Sources that now match the new Primary_Source, remove all fields belonging to those conflicting sources from the selected fields array, and remove their associated column renames, while preserving non-conflicting Selected_Sources and their fields

### Requirement 6: Persist Source Selection Across Navigation

**User Story:** As an exporter wizard user, I want my source selections to be remembered when I navigate between wizard steps, so that I do not lose my configuration.

#### Acceptance Criteria

1. WHEN the user navigates away from the Field_Mapping_Step (forward or back) and returns without the Primary_Source having changed, THE Field_Mapping_Step SHALL restore all previously Selected_Sources and their checked state in the Source_Catalogue
2. WHEN the user navigates away from the Field_Mapping_Step (forward or back) and returns without the Primary_Source having changed, THE Field_Mapping_Step SHALL preserve any enrichment fields in the selected fields array, their column renames, and their current display order
3. WHEN the Primary_Source changes between navigations (as determined by `didSourceOrSubSourceChange`), THE Wizard_Modal SHALL clear Selected_Sources, remove all enrichment fields from the selected fields array, and remove all column renames associated with those enrichment fields
4. WHEN the user returns to the Field_Mapping_Step after a Primary_Source change, THE Source_Selector SHALL display the empty state ("Add sources" button) with no pre-selected sources

### Requirement 7: Enrichment Field Interactions

**User Story:** As an exporter wizard user, I want enrichment fields from multiple sources to support the same interactions as primary fields (reordering, renaming, select/deselect), so that my export configuration is consistent.

#### Acceptance Criteria

1. WHILE enrichment fields are in the selected fields array, THE Field_Mapping_Step SHALL allow the user to drag-and-drop enrichment fields to any position among all selected fields, including before, after, or between primary source fields
2. WHILE enrichment fields are in the selected fields array, THE Field_Mapping_Step SHALL allow the user to rename enrichment field output columns using the column rename input, subject to the same validation rules as primary fields
3. WHEN the user clicks "Select All" in the field list, THE Field_Mapping_Step SHALL include both primary source fields and all enrichment fields from all Selected_Sources in the selection
4. WHEN the user clicks "Deselect All", THE Field_Mapping_Step SHALL remove all fields (primary and enrichment) from the selected fields array and clear associated column renames, while preserving the source selections in Selected_Sources
5. IF all fields are deselected, THEN THE Field_Mapping_Step SHALL continue to display enrichment fields in the unselected fields list, available for re-selection without requiring the user to re-enable the source in Selected_Sources

### Requirement 8: Source Catalogue Data Model

**User Story:** As a developer, I want the source catalogue to be driven by a data model that can scale to dozens of entries, so that the UI adapts automatically as new transactional tables are added.

#### Acceptance Criteria

1. THE Source_Catalogue SHALL derive its available Source_Tables from a data source where each entry contains a unique id (string), a name (string, 1–100 characters), a category (string matching a known Source_Category), and a fields array where each field has at minimum a key (string) and a label (string)
2. WHEN a new Source_Table entry is added to the data source, THE Source_Catalogue SHALL include it in the rendered catalogue on the next component render without requiring UI code changes
3. THE Source_Catalogue SHALL support at least 50 Source_Tables while completing search filtering within 100ms and initial render within 200ms on a standard desktop browser
4. WHEN a Source_Table has an empty fields array, THE Source_Catalogue SHALL still display the table as selectable but show a "No fields available" indicator in the field list area when that table is selected
5. IF a Source_Table entry is missing any required property (id, name, category, or fields array), THEN THE Source_Catalogue SHALL omit that entry from the rendered catalogue
