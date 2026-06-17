# Requirements Document

## Introduction

The exporter wizard's Field Mapping step currently uses the `EnrichmentSelector` component — a row of toggle chips labelled "Enrich with:" — to let users add fields from a single secondary source entity. This feature replaces that toggle-chip pattern with a source chips row and an "Add source" modal that supports multiple simultaneous sources. Contacts remains the always-present base source (non-removable). Additional sources (Messages, transaction databases) are added via a categorised modal dialog and appear as removable chips. The field list, source badges, drag-and-drop, rename, and select-all behaviour remain unchanged.

## Glossary

- **Field_Mapping_Step**: The wizard step (`FieldMappingStep.tsx`) where users select, reorder, and rename fields for export
- **Source_Chips_Row**: The horizontal row of chips displayed above the field list, showing all currently active data sources
- **Contacts_Chip**: The permanent chip representing the base Contacts source — always present and non-removable
- **Source_Chip**: A removable chip representing an active additional source (Messages or a specific transaction table), displaying the source name and an X button to remove it
- **Add_Source_Button**: The "+ Add source" button at the end of the Source_Chips_Row that opens the Add_Source_Modal
- **Add_Source_Modal**: A dialog presenting all available additional sources as a categorised checkbox list, allowing the user to select one or more sources to activate
- **Messages_Source**: The messages entity with a fixed set of message-related fields (message ID, channel, status, etc.)
- **Transaction_Database**: A specific transactional table (e.g. Bookings, Purchases) from the `transactionalDatabases` data, each with its own field set
- **Active_Sources**: The set of currently enabled sources whose fields appear in the Available_Fields pool — always includes Contacts plus any user-added sources
- **Available_Fields**: The combined set of fields from all Active_Sources, displayed in the field list
- **Source_Badge**: The small pill label on each field row indicating which source the field originates from
- **Wizard_Modal**: The exporter wizard dialog (`WizardModal.tsx`) that orchestrates step navigation and holds the `ExporterWizardDraft` state
- **Source_Config**: The `SourceConfig` discriminated union describing the user's primary source, filter settings, and enrichment configuration — to be extended to support multiple enrichment sources

## Requirements

### Requirement 1: Source Chips Row Display

**User Story:** As an exporter wizard user, I want to see my active data sources as chips above the field list, so that I can quickly understand which sources are contributing fields to my export.

#### Acceptance Criteria

1. WHEN the Field_Mapping_Step renders, THE Field_Mapping_Step SHALL display the Source_Chips_Row above the field list, replacing the existing EnrichmentSelector toggle chips
2. THE Source_Chips_Row SHALL always display the Contacts_Chip as the first chip in the row
3. THE Contacts_Chip SHALL not display an X button or any removal affordance
4. WHEN additional sources have been added, THE Source_Chips_Row SHALL display a Source_Chip for each active additional source, positioned after the Contacts_Chip and before the Add_Source_Button
5. THE Source_Chips_Row SHALL display the Add_Source_Button as the last element in the row

### Requirement 2: Add Source Button and Modal Trigger

**User Story:** As an exporter wizard user, I want a button to add more data sources, so that I can expand the available fields in my export beyond the base Contacts source.

#### Acceptance Criteria

1. THE Add_Source_Button SHALL display as a "+ Add source" button styled consistently with the chip row (compact size, secondary appearance)
2. WHEN the user clicks the Add_Source_Button, THE Field_Mapping_Step SHALL open the Add_Source_Modal as a dialog overlay
3. WHEN the Add_Source_Modal is open, THE Field_Mapping_Step SHALL prevent interaction with the underlying field list until the modal is closed

### Requirement 3: Add Source Modal Content and Layout

**User Story:** As an exporter wizard user, I want the Add Source modal to show all available sources in a categorised list with checkboxes, so that I can quickly select which sources to add.

#### Acceptance Criteria

1. WHEN the Add_Source_Modal opens, THE Add_Source_Modal SHALL display a "Messages" category containing a single checkbox item labelled "Messages" with its field count (e.g. "6 fields")
2. WHEN the Add_Source_Modal opens, THE Add_Source_Modal SHALL display a "Transaction Databases" category containing a checkbox item for each available transaction table from the transactionalDatabases data, with each item showing the table name and its field count (e.g. "Bookings — 6 fields")
3. WHEN a source is already active (present as a Source_Chip in the Source_Chips_Row), THE Add_Source_Modal SHALL display that source's checkbox as checked and disabled
4. THE Add_Source_Modal SHALL display a confirmation button (labelled "Done" or "Add") that applies the user's selections and closes the modal
5. THE Add_Source_Modal SHALL display a cancel action (close button or cancel button) that discards any pending selections and closes the modal
6. THE Add_Source_Modal SHALL render as a compact dialog (not a full-width wizard), using the existing Dialog component from the UI library

### Requirement 4: Add Source Modal Selection Behaviour

**User Story:** As an exporter wizard user, I want to check multiple sources in the modal and have them all added when I confirm, so that I can add several sources in a single action.

#### Acceptance Criteria

1. WHEN the user checks one or more unchecked source items in the Add_Source_Modal and clicks the confirmation button, THE Field_Mapping_Step SHALL add a Source_Chip for each newly selected source to the Source_Chips_Row
2. WHEN the user checks one or more unchecked source items in the Add_Source_Modal and clicks the confirmation button, THE Field_Mapping_Step SHALL add the fields from each newly selected source to the Available_Fields pool as unselected
3. WHEN the user opens the Add_Source_Modal with no new sources to add (all available sources are already active), THE Add_Source_Modal SHALL display all checkboxes as checked and disabled
4. WHEN the user clicks cancel or closes the Add_Source_Modal without confirming, THE Field_Mapping_Step SHALL not modify the Active_Sources or Available_Fields

### Requirement 5: Remove Source via Chip

**User Story:** As an exporter wizard user, I want to remove a source by clicking X on its chip, so that I can quickly discard a source I no longer need without opening the modal.

#### Acceptance Criteria

1. WHEN the user clicks the X button on a Source_Chip, THE Field_Mapping_Step SHALL remove that Source_Chip from the Source_Chips_Row
2. WHEN the user removes a Source_Chip, THE Field_Mapping_Step SHALL remove all fields belonging to that source from the Available_Fields pool
3. WHEN the user removes a Source_Chip, THE Field_Mapping_Step SHALL remove any selected fields from that source from the selected fields array and discard their associated column renames
4. THE Contacts_Chip SHALL not be removable — no X button SHALL be rendered on the Contacts_Chip

### Requirement 6: Multiple Simultaneous Sources

**User Story:** As an exporter wizard user, I want to have Contacts plus Messages plus multiple transaction tables all active at the same time, so that I can build exports combining fields from many sources.

#### Acceptance Criteria

1. THE Field_Mapping_Step SHALL support any combination of Active_Sources: Contacts (always) plus zero or one Messages_Source plus zero or more Transaction_Databases simultaneously
2. WHEN multiple sources are active, THE Available_Fields pool SHALL contain the combined fields from all Active_Sources
3. WHEN multiple sources are active, THE field list SHALL display a Source_Badge on each field row indicating which source the field originates from
4. WHEN a Transaction_Database is added that shares field names with another active source, THE Field_Mapping_Step SHALL prefix that table's field keys and labels to distinguish them from fields of other sources

### Requirement 7: Field List Integration

**User Story:** As an exporter wizard user, I want fields from all active sources to appear in the same field list with consistent interactions, so that I can select, reorder, and rename them uniformly.

#### Acceptance Criteria

1. WHEN a new source is activated, THE field list SHALL append that source's fields to the end of the unselected section
2. WHEN a source is removed, THE field list SHALL remove that source's fields from both selected and unselected sections
3. WHILE fields from multiple sources are selected, THE field list SHALL allow the user to reorder fields across source boundaries using drag-and-drop
4. WHILE fields from any source are selected, THE field list SHALL allow the user to rename field output columns using the column rename input
5. WHEN the user clicks "Select All", THE field list SHALL select all available fields from all Active_Sources
6. WHEN all fields are already selected and the user clicks "Select All", THE field list SHALL deselect all fields

### Requirement 8: Persist Source Selection Across Navigation

**User Story:** As an exporter wizard user, I want my source selections preserved when I navigate between wizard steps, so that I do not lose my configuration.

#### Acceptance Criteria

1. WHEN the user navigates away from the Field_Mapping_Step and returns without changing the primary source type, THE Source_Chips_Row SHALL restore all previously active sources (Contacts plus any added Messages or Transaction_Databases)
2. WHEN the user navigates away from the Field_Mapping_Step and returns without changing the primary source type, THE field list SHALL preserve the selected fields, their ordering, and their column renames
3. WHEN the user changes the primary source type in the Data Source step, THE Wizard_Modal SHALL clear all additional source selections, reset the Source_Chips_Row to only the Contacts_Chip, and reset field selections

### Requirement 9: Accessibility

**User Story:** As a keyboard or screen reader user, I want the source chips row and modal to be fully operable with keyboard navigation and announced correctly, so that I can manage data sources without a pointing device.

#### Acceptance Criteria

1. THE Source_Chips_Row SHALL ensure the Add_Source_Button is keyboard-focusable and activatable via Enter or Space
2. THE Source_Chip X buttons SHALL be keyboard-focusable and activatable via Enter or Space, with an accessible label describing the action (e.g. "Remove Bookings source")
3. WHEN the Add_Source_Modal opens, THE Add_Source_Modal SHALL trap focus within the dialog and return focus to the Add_Source_Button on close
4. THE Add_Source_Modal SHALL ensure all checkboxes are keyboard-focusable and togglable via Space
5. THE Add_Source_Modal SHALL associate each checkbox with a visible label identifying the source name
