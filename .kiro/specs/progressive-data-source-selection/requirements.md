# Requirements Document

## Introduction

Evolution of the exporter wizard's data source selection from a two-type model (Contact/Transactional vs Event-based) into a three-path progressive disclosure model. Every export has one Primary Source (Contacts, Transactions, or Messages) that determines what a row represents, and zero or more Enrichment Layers that add columns from related entities. The wizard follows a consistent four-beat rhythm: What type? → Which one? → Which records? → Add context?

## Glossary

- **Primary_Source**: The main data entity that determines what each row in the export represents — one of Contacts, Transactions, or Messages
- **Enrichment_Layer**: An optional join to a related entity that adds columns to the export without changing what a row represents
- **Source_Selection_Step**: The wizard step that replaces the former TypeSelectionStep and DataSourceStep/EventSourceStep with the new progressive disclosure flow
- **Match_Count**: A live indicator showing how many records match the current filter configuration
- **Join_Strategy**: The method used to resolve one-to-many relationships when enriching — either "most recent record" or "all records"
- **Cross_Entity_Filter**: A filter that references a different entity than the primary source (e.g., filtering Contacts by campaign send history)
- **Canned_Filter**: A predefined filter option presented as a selectable choice rather than a manual field/operator/value configuration
- **Progressive_Disclosure**: A UX pattern where additional options are revealed only after prerequisite selections are made
- **Wizard**: The multi-step modal interface used to create or edit an exporter automation
- **Channel**: A messaging medium (e.g., Email, SMS, Push) used to send communications
- **Transaction_Table**: A named transactional data source (e.g., Purchases, Bookings, Subscriptions)

## Requirements

### Requirement 1: Three-Path Primary Source Selection

**User Story:** As a user, I want to choose between Contacts, Transactions, or Messages as my primary data source, so that the export rows represent the entity most relevant to my use case.

#### Acceptance Criteria

1. WHEN the user reaches the source selection step, THE Source_Selection_Step SHALL present exactly three mutually exclusive primary source options: "Contacts", "Transactions", and "Messages", with no option pre-selected
2. WHEN the user selects a primary source, THE Source_Selection_Step SHALL progressively reveal the sub-selection controls specific to that source type below the primary source selector
3. WHILE no primary source is selected, THE Source_Selection_Step SHALL keep the forward navigation control disabled
4. WHEN the user changes the primary source selection after having previously configured sub-source, filters, or enrichment, THE Source_Selection_Step SHALL display a confirmation prompt warning that downstream selections will be lost, and IF the user confirms, THEN THE Source_Selection_Step SHALL reset all downstream selections (sub-source, filters, enrichment layers) for the previous source type
5. THE Source_Selection_Step SHALL replace the former TypeSelectionStep and DataSourceStep/EventSourceStep in the wizard flow

### Requirement 2: Contacts Path — Sub-Selection and Filtering

**User Story:** As a user, I want to filter my contact export by segment, recency, or campaign history, so that I can target a specific subset of contacts.

#### Acceptance Criteria

1. WHEN the user selects "Contacts" as the primary source, THE Source_Selection_Step SHALL present canned filter options as a mutually exclusive selection: "All contacts", "Created in last N days", "In list/segment", "Unsubscribed", and "Not sent campaign"
2. WHEN the user selects "Created in last N days", THE Source_Selection_Step SHALL display a numeric input for the user to specify the number of days, accepting only whole numbers between 1 and 365 inclusive
3. IF the user enters a value outside the range 1–365 or a non-integer in the days input, THEN THE Source_Selection_Step SHALL display a validation error message indicating the accepted range and SHALL treat the filter as incomplete until corrected
4. WHEN the user selects "In list/segment", THE Source_Selection_Step SHALL display a searchable selector that filters available lists and segments by name as the user types, allowing the user to choose one list or segment
5. WHEN the user selects "Not sent campaign", THE Source_Selection_Step SHALL display a campaign selector allowing the user to choose one campaign, and SHALL display a visible label identifying this as a cross-entity filter
6. WHEN the user has configured a complete filter (a canned filter is selected AND any required secondary input for that filter has a valid value), THE Source_Selection_Step SHALL display a match count showing the number of contacts matching the current filter criteria
7. IF the user selects "All contacts" or "Unsubscribed" as the filter, THEN THE Source_Selection_Step SHALL treat the selection as valid without requiring additional input

### Requirement 3: Transactions Path — Table Selection and Filtering

**User Story:** As a user, I want to select a specific transaction table and filter records by date or field values, so that I can export a targeted subset of transactional data.

#### Acceptance Criteria

1. WHEN the user selects "Transactions" as the primary source, THE Source_Selection_Step SHALL display all transaction tables available in the account and require the user to select one before proceeding
2. WHEN the user selects a transaction table, THE Source_Selection_Step SHALL present canned filter options: "All records", "Created in last N days", and a field/operator/value filter builder, with no option pre-selected
3. WHEN the user selects "Created in last N days", THE Source_Selection_Step SHALL display a numeric input accepting a whole number between 1 and 365
4. WHEN the user selects the field/operator/value filter, THE Source_Selection_Step SHALL display a filter row with field selector, operator selector, and value input, plus an "Add filter" action to add additional filter rows up to a maximum of 10 rows
5. WHEN multiple filter rows are configured, THE Source_Selection_Step SHALL combine all filter rows using AND logic such that only records matching every row are included
6. WHEN the user has configured a valid filter (a canned filter selection is made, or all field/operator/value rows have non-empty values), THE Source_Selection_Step SHALL display a match count showing the number of transaction records matching the current filter criteria
7. IF the user selects "All records" as the filter, THEN THE Source_Selection_Step SHALL treat the selection as valid without requiring additional input
8. IF the user attempts to proceed without selecting a transaction table, THEN THE Source_Selection_Step SHALL prevent navigation and display a validation message

### Requirement 4: Messages Path — Channel Selection and Filtering

**User Story:** As a user, I want to select a messaging channel and filter sends by status, campaign, or date range, so that I can export specific message delivery data.

#### Acceptance Criteria

1. WHEN the user selects "Messages" as the primary source, THE Source_Selection_Step SHALL present a channel selector with the channels available in the account (Email, SMS, Push)
2. IF only one channel exists in the account, THEN THE Source_Selection_Step SHALL auto-select that channel and skip the channel selection sub-step
3. IF no channels exist in the account, THEN THE Source_Selection_Step SHALL display an informational message indicating no channels are configured and SHALL prevent the user from proceeding
4. WHEN the user selects a channel, THE Source_Selection_Step SHALL present canned filter options as a single-select list: "All sends", "By status", "For specific campaign", and "In date range"
5. WHEN the user selects "By status", THE Source_Selection_Step SHALL display a multi-select allowing the user to choose one or more statuses from: Delivered, Bounced, Failed, Opened, and SHALL require at least one status to be selected before the filter is considered valid
6. WHEN the user selects "For specific campaign", THE Source_Selection_Step SHALL display a searchable campaign selector scoped to the selected channel, allowing the user to choose one campaign
7. IF the user selects "For specific campaign" and no campaigns exist for the selected channel, THEN THE Source_Selection_Step SHALL display an informational message indicating no campaigns are available for that channel
8. WHEN the user selects "In date range", THE Source_Selection_Step SHALL display start date and end date inputs and SHALL require the start date to be on or before the end date for the filter to be considered valid
9. WHEN the user has selected a filter option and provided all required inputs for that filter (or selected "All sends"), THE Source_Selection_Step SHALL display a match count showing the number of message records matching the current filter criteria

### Requirement 5: Enrichment Layer Selection

**User Story:** As a user, I want to optionally enrich my export with columns from related entities, so that I can produce a comprehensive output without creating multiple exports.

#### Acceptance Criteria

1. WHEN the user has completed the primary source filter configuration, THE Source_Selection_Step SHALL present an "Add context" section offering enrichment layer options
2. THE Source_Selection_Step SHALL NOT offer the primary source entity as an enrichment option (e.g., if Contacts is the primary source, Contacts SHALL NOT appear as an enrichment option)
3. WHEN "Contacts" is the primary source, THE Source_Selection_Step SHALL offer enrichment with Transactions (requiring table selection and join strategy selection) and Messages (requiring channel selection and a status multi-select filter matching the options: Delivered, Bounced, Failed, Opened)
4. WHEN "Transactions" is the primary source, THE Source_Selection_Step SHALL offer enrichment with Contacts (auto-joined via Contact ID) and Messages (requiring channel selection and a status multi-select filter matching the options: Delivered, Bounced, Failed, Opened)
5. WHEN "Messages" is the primary source, THE Source_Selection_Step SHALL offer enrichment with Contacts (auto-joined via Contact ID) and Transactions (requiring table selection, join strategy fixed to most recent record only)
6. THE Source_Selection_Step SHALL limit the user to a maximum of one enrichment layer in v1
7. WHEN the user selects an enrichment layer, THE Source_Selection_Step SHALL display the configuration controls for that enrichment type inline within the "Add context" section
8. WHEN the user has selected an enrichment layer, THE Source_Selection_Step SHALL provide a remove action that clears the enrichment selection and hides the configuration controls
9. IF the user has selected an enrichment layer but has not completed its required configuration fields, THEN THE Source_Selection_Step SHALL prevent navigation to the next wizard step and indicate which enrichment fields require input

### Requirement 6: Enrichment Join Strategy

**User Story:** As a user, I want to control how one-to-many relationships are resolved when enriching, so that I get either the most recent related record or all related records depending on my needs.

#### Acceptance Criteria

1. WHEN an enrichment layer involves a one-to-many relationship with the primary source, THE Source_Selection_Step SHALL present a join strategy selector with options: "Most recent record" and "All records", where "Most recent record" is pre-selected as the default
2. WHEN the user selects "Most recent record" as the join strategy, THE Source_Selection_Step SHALL resolve the enrichment by selecting the single related record with the most recent created-date value
3. WHEN the user selects "All records" as the join strategy, THE Source_Selection_Step SHALL display an informational message indicating that the export may produce multiple output rows per primary record (fan-out)
4. WHEN the enrichment is "Contacts" joined to a non-Contact primary source, THE Source_Selection_Step SHALL auto-join via Contact ID without presenting a join strategy selector (one-to-one relationship)
5. WHEN the enrichment is "Transactions" joined to a Messages primary source, THE Source_Selection_Step SHALL use "Most recent record" join strategy without presenting a join strategy selector

### Requirement 7: Match Count Display

**User Story:** As a user, I want to see how many records match my current filter configuration, so that I can validate my selections before proceeding.

#### Acceptance Criteria

1. WHEN the user has selected a primary source and configured at least one filter criterion, THE Source_Selection_Step SHALL display a match count indicator formatted with locale-appropriate thousand separators (e.g., "4,231 contacts match")
2. WHILE the match count is being calculated, THE Source_Selection_Step SHALL display a loading state in the match count indicator (e.g., a spinner or skeleton text)
3. IF the match count query fails or times out after 10 seconds, THEN THE Source_Selection_Step SHALL display an error state with a "Retry" action in the match count indicator without preventing the user from proceeding
4. WHEN the user changes the filter configuration, THE Source_Selection_Step SHALL recalculate and update the match count within 2 seconds of the last filter change (debounced)
5. WHEN the match count returns zero records, THE Source_Selection_Step SHALL display "0 records match" and SHALL NOT prevent the user from proceeding

### Requirement 8: Four-Beat Rhythm Consistency

**User Story:** As a user, I want the source selection flow to follow a consistent pattern regardless of which primary source I choose, so that the interface is predictable and easy to learn.

#### Acceptance Criteria

1. THE Source_Selection_Step SHALL present all three paths in the same four-beat sequence: (1) primary source type selection, (2) sub-source selection, (3) record filtering, and (4) enrichment configuration, where each beat occupies a visually distinct section rendered in top-to-bottom order
2. WHEN a beat has no applicable sub-selection (e.g., Contacts has no sub-source equivalent to a transaction table), THE Source_Selection_Step SHALL skip that beat and proceed to the next without displaying an empty or placeholder section
3. THE Source_Selection_Step SHALL use progressive disclosure to reveal each beat only after the preceding beat has a completed selection — where "completed" means: beat 1 requires a primary source chosen, beat 2 requires a sub-source chosen (or is skipped), and beat 3 requires at least one filter criterion configured
4. THE Source_Selection_Step SHALL present the enrichment layer configuration using the same layout structure (section heading, available enrichment options list, and configuration controls for the selected option) regardless of which primary source is selected
5. WHEN the user switches between primary source types, THE Source_Selection_Step SHALL present the applicable beats in the same positional order and with the same progressive disclosure behavior as any other primary source path

### Requirement 9: Wizard Flow Integration

**User Story:** As a user, I want the new source selection to integrate seamlessly with the existing wizard steps, so that my overall export configuration experience remains cohesive.

#### Acceptance Criteria

1. THE Wizard SHALL replace the TypeSelectionStep and DataSourceStep/EventSourceStep with a single Source_Selection_Step as the first substantive step in the wizard
2. WHEN the user has selected a valid primary source and completed the filter configuration within the Source_Selection_Step, THE Wizard SHALL enable navigation to the Field Mapping step, which SHALL present fields determined by the selected primary source, sub-source, and enrichment layers
3. WHEN the user navigates back to the Source_Selection_Step from a later step, THE Wizard SHALL retain all previously configured selections (primary source, sub-source, filters, enrichment)
4. WHEN the user changes the primary source type or sub-source selection (e.g., a different transaction table) after having configured later steps, THE Wizard SHALL clear all Field Mapping step selections, since the set of available fields has changed
5. WHEN the user selects or changes a primary source, THE Wizard SHALL update the stepper label for the source step to display the format "{PrimarySourceName} Source" (e.g., "Contacts Source", "Transactions Source", or "Messages Source"), and SHALL display a generic label "Source" before any primary source is selected
6. IF the user changes only the filter criteria or enrichment layer without changing the primary source type or sub-source, THEN THE Wizard SHALL preserve existing Field Mapping selections that remain valid and remove only selections referencing fields no longer available

### Requirement 10: Parse Primary Source Configuration

**User Story:** As a developer, I want to serialise and deserialise the source selection configuration, so that it can be persisted and restored when editing an existing exporter.

#### Acceptance Criteria

1. THE Source_Selection_Step SHALL produce a configuration object containing: primary source type, sub-source selection (transaction table or channel where applicable), filter type and filter parameters, and enrichment layer configuration (entity, join strategy, and enrichment-specific options)
2. WHEN an existing exporter is opened for editing, THE Source_Selection_Step SHALL hydrate its state from the persisted configuration object and restore all selections to their previously configured values
3. IF the persisted configuration references an entity that no longer exists (e.g., a deleted segment, campaign, or transaction table), THEN THE Source_Selection_Step SHALL hydrate all still-valid fields and display a validation indicator on the invalid reference, allowing the user to correct it before proceeding
4. THE Source_Selection_Step SHALL serialise the configuration only when the primary source, sub-source (if applicable), and filter configuration represent a valid complete selection; incomplete states SHALL NOT be persisted
5. THE Source_Selection_Step SHALL guarantee that serialising a valid configuration and then deserialising the result produces a configuration with identical primary source type, sub-source, filter type, filter parameters, and enrichment layer settings (deep equality of all fields)
6. THE Source_Selection_Step SHALL produce a configuration object that the Pretty_Printer can format back into a human-readable summary for the Review step
