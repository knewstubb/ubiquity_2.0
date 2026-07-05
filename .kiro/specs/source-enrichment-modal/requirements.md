# Requirements Document

## Introduction

This feature improves the exporter wizard's field mapping step by renaming "Mailout Recipients" to "Mailout" across data source cards, fixing the source tag displayed on mailout fields (currently showing "messages" when it should show "mailout"), and introducing a source enrichment modal that allows users to add Contact fields when Mailout is the primary data source. The modal is designed to support multiple additional sources in future iterations.

## Glossary

- **Wizard**: The multi-step exporter creation flow that guides users through data source selection, field mapping, and export configuration.
- **Data_Source_Step**: The wizard step where users choose their primary data source (Contacts or Mailout).
- **Field_Mapping_Step**: The wizard step where users select and configure which fields to include in the export.
- **Source_Tag**: A visual pill/badge displayed next to each field in the field mapping list indicating which data source the field belongs to.
- **Source_Chips_Row**: The row of chips at the top of the field mapping step showing active sources with an "Add source" button.
- **Enrichment_Modal**: A dialog that presents available additional data sources and allows users to select one to add fields from.
- **Enrichment_Config**: The data model representing an additional source added to the export (entity type plus configuration options).
- **Primary_Source**: The main data source selected in the data source step (Contacts or Mailout).
- **SelectorCard**: The composed library component used for source selection cards in the wizard.

## Requirements

### Requirement 1: Rename Mailout Recipients to Mailout

**User Story:** As a user, I want the data source cards to say "Mailout" instead of "Mailout Recipients", so that the label is concise and consistent with how the source is referenced elsewhere in the wizard.

#### Acceptance Criteria

1. THE Data_Source_Step SHALL display "Mailout" as the label on the mailout SelectorCard in the unselected card grid.
2. THE Data_Source_Step SHALL display "Mailout" as the label on the mailout SelectorCard in the selected card grid.
3. THE Data_Source_Step SHALL display "Mailout" as the heading in the mailout confirmation summary view.

### Requirement 2: Fix Source Tags for Mailout Fields

**User Story:** As a user, I want mailout fields in the field mapping list to display "mailout" as the source tag, so that I can distinguish them from other data sources.

#### Acceptance Criteria

1. WHEN Mailout is selected as the primary source, THE Field_Mapping_Step SHALL display "mailout" as the Source_Tag on all primary mailout fields.
2. THE Field_Mapping_Step SHALL display the source tag value from the field's `source` property without modification.
3. WHEN Contact enrichment fields are added, THE Field_Mapping_Step SHALL display "contacts" as the Source_Tag on those fields.

### Requirement 3: Source Enrichment Modal for Mailout Source

**User Story:** As a user, I want to add Contact fields to my mailout export via a modal, so that I can enrich recipient data with profile information.

#### Acceptance Criteria

1. WHEN Mailout is the primary source, THE Source_Chips_Row SHALL display a "Contacts" chip as a permanent non-removable chip and an "+ Add source" button.
2. WHEN the user clicks "+ Add source", THE Enrichment_Modal SHALL open and display a list of available enrichment sources.
3. THE Enrichment_Modal SHALL display "Contacts" as an available enrichment source with a field count indicator.
4. WHEN the user selects Contacts and confirms, THE Enrichment_Modal SHALL add a Contacts Enrichment_Config to the wizard draft and close.
5. WHEN a Contacts enrichment is active, THE Field_Mapping_Step SHALL include Contact fields in the available field list with "contacts" as the Source_Tag.
6. WHEN a Contacts enrichment is active, THE Source_Chips_Row SHALL display a removable "Contacts" chip.
7. WHEN the user removes the Contacts enrichment chip, THE Field_Mapping_Step SHALL remove all Contact fields from the selected fields and column renames.

### Requirement 4: Modal Extensibility for Future Sources

**User Story:** As a developer, I want the enrichment modal to support multiple source categories, so that additional sources (Messages, Transactions) can be added in future without restructuring the modal.

#### Acceptance Criteria

1. THE Enrichment_Modal SHALL render source options grouped by category (e.g. Contacts, Messages, Transaction Databases).
2. THE Enrichment_Modal SHALL disable source options that are already active as enrichments.
3. WHEN multiple new sources are selected, THE Enrichment_Modal SHALL add all selected sources as enrichments in a single confirm action.
4. THE Enrichment_Modal SHALL display a "Done" button that is disabled until at least one new source is selected.

### Requirement 5: Mailout Source Configuration

**User Story:** As a user, I want selecting Mailout as the data source to initialise the correct source configuration, so that the field mapping step can resolve fields accurately.

#### Acceptance Criteria

1. WHEN the user selects Mailout in the Data_Source_Step, THE Wizard SHALL create a SourceConfig with `primarySource` set to "messages" and an empty enrichments array.
2. WHEN Mailout is selected, THE Wizard SHALL populate the field mapping with mailout-specific fields (Mailout ID, Mailout Name, Send Date, Recipient Count, Open Rate, Click Rate).
3. THE source field definitions for mailout fields SHALL use "mailout" as the `source` property value.
