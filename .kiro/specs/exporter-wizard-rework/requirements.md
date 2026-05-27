# Requirements Document

## Introduction

Rework of the existing exporter wizard to support two distinct exporter types — Contact/Transactional and Event-based — with simplified configuration, predefined join keys, column renaming, system-controlled scheduling, and notification parity with the importer wizard.

## Glossary

- **Wizard**: The multi-step modal interface used to create or edit an exporter automation
- **Exporter_Type**: The category of export — either "Contact/Transactional" or "Event-based"
- **Contact_Transactional_Exporter**: An exporter where the user selects specific contact and transactional data fields to export
- **Event_Based_Exporter**: An exporter where the user selects event sources (e.g. mailout sends, campaign events, failed sends) and optionally enhances with associated contact data
- **Event_Source**: A selectable event category such as "mailouts from this send", "all event channels from this campaign", or "all failed sends from this send"
- **Field_Mapping**: The step where users select and order fields for export output
- **Column_Rename**: The ability for a user to assign a custom output column name to a mapped field
- **File_Naming_Pattern**: The template string used to generate export file names, suffixed with `{timestamp}.csv`
- **Schedule**: The frequency configuration for when an export runs, without user-specified time
- **Notification_Config**: Email alert settings for export success, failure, and no-file scenarios — matching the importer format
- **Join_Key**: The predefined field used to link records across data sources — no longer user-configurable

## Requirements

### Requirement 1: Exporter Type Selection

**User Story:** As a user, I want to choose between a Contact/Transactional exporter and an Event-based exporter, so that the wizard adapts its steps and field options to my export goal.

#### Acceptance Criteria

1. WHEN the user begins creating a new exporter, THE Wizard SHALL present exactly two exporter type options: "Contact/Transactional" and "Event-based", with neither option pre-selected
2. WHEN the user selects "Contact/Transactional", THE Wizard SHALL display the Data Source, Field Mapping, File Configuration, Schedule, and Review steps with data source options limited to Contacts, Transactional, and Mailout Data
3. WHEN the user selects "Event-based", THE Wizard SHALL display steps and field options specific to event-based exports, excluding contact and transactional data source options
4. IF the user attempts to proceed to the next step without selecting an exporter type, THEN THE Wizard SHALL keep the navigation action disabled and not advance to the next step
5. WHEN the user returns to the type selection step after having previously selected a type, THE Wizard SHALL retain the previously selected exporter type

### Requirement 2: Remove Join Key Input

**User Story:** As a user, I want the join key to be predefined by the system, so that I do not need to manually configure how data sources are linked.

#### Acceptance Criteria

1. THE Wizard SHALL use "Email Address" as the predefined join key for linking records across data sources
2. THE Wizard SHALL NOT present a join key input field or selection control to the user
3. WHEN multiple data sources are combined in an export, THE Wizard SHALL apply the predefined join key automatically without requiring user interaction
4. WHEN multiple data sources are selected, THE Wizard SHALL display a read-only indicator stating which join key is being used
5. WHEN the user edits an existing exporter that previously had a user-configured join key, THE Wizard SHALL override the saved value with the predefined join key and SHALL NOT present the previous selection

### Requirement 3: Contact/Transactional Exporter Configuration

**User Story:** As a user, I want to configure exactly which contact and transactional fields to export, so that I can produce a tailored output file.

#### Acceptance Criteria

1. WHEN the user selects the "Contact/Transactional" exporter type, THE Wizard SHALL present a data source selection step allowing the user to select one or more sources from: Contacts, Mailout Data, and Transactional
2. WHEN the user selects "Transactional" as a data source, THE Wizard SHALL require the user to choose a transactional sub-source before displaying available fields
3. WHEN the user selects data sources, THE Wizard SHALL display all available fields from the selected sources in the field mapping step, with each field labelled by its source
4. THE Wizard SHALL allow the user to select, deselect, and reorder fields for the export output
5. IF the user attempts to proceed with no fields selected, THEN THE Wizard SHALL prevent navigation to the next step and display a validation message indicating at least one field is required

### Requirement 4: Event-Based Exporter Configuration

**User Story:** As a user, I want to select event sources to export (e.g. mailout sends, campaign events, failed sends), so that I can extract event data without manually configuring individual fields.

#### Acceptance Criteria

1. WHEN the user selects the "Event-based" exporter type, THE Wizard SHALL present a list of selectable event sources allowing the user to select one or more options via checkboxes
2. THE Wizard SHALL include event source options: "mailouts from this send", "all event channels from this campaign", and "all failed sends from this send"
3. WHEN the user selects one or more event sources, THE Wizard SHALL display the predetermined event data fields for the selected sources as read-only in the field mapping step
4. WHEN event sources are selected, THE Wizard SHALL present an optional contact data fields section where the user can select additional contact fields to include alongside the event data in the export output
5. IF the user attempts to proceed to the next wizard step with no event source selected, THEN THE Wizard SHALL prevent navigation and display a validation message indicating that at least one event source is required

### Requirement 5: Predefined Event Data Fields

**User Story:** As a user, I want event data fields to be predefined based on my event source selection, so that I do not need to manually configure standard event columns.

#### Acceptance Criteria

1. WHEN the user selects an event source, THE Wizard SHALL automatically include all fields defined for that event source type in the export, without requiring user selection
2. THE Wizard SHALL display the predefined event fields as read-only in the field mapping step, visually distinguishing them from user-selectable contact fields
3. THE Wizard SHALL NOT allow the user to deselect or remove predefined event data fields
4. THE Wizard SHALL allow the user to reorder predefined event fields within the output
5. THE Wizard SHALL allow the user to rename predefined event field output columns using the column rename functionality
6. IF the user selects multiple event sources, THEN THE Wizard SHALL include the predefined fields for each selected source, with any duplicate fields appearing only once in the field list

### Requirement 6: Column Renaming

**User Story:** As a user, I want to rename columns in the export output, so that the exported file uses column headers that match my downstream system's expectations.

#### Acceptance Criteria

1. THE Wizard SHALL display an editable output column name for each selected field in the field mapping step, accepting a maximum of 128 characters
2. WHEN the user does not provide a custom column name, THE Wizard SHALL use the field's default label as the output column name
3. WHEN the user provides a custom column name, THE Wizard SHALL use that name as the column header in the exported file
4. THE Wizard SHALL allow the user to reset a renamed column back to its default label
5. IF the user enters a custom column name that is empty, contains only whitespace, or exceeds 128 characters, THEN THE Wizard SHALL display a validation error and prevent proceeding until corrected
6. IF the user enters a custom column name that duplicates another output column name in the same export, THEN THE Wizard SHALL display a validation error indicating the duplicate and prevent proceeding until resolved

### Requirement 7: File Naming Pattern

**User Story:** As a user, I want the export file name to include a timestamp suffix by default, so that each export produces a uniquely identifiable file.

#### Acceptance Criteria

1. THE Wizard SHALL default the file naming pattern suffix to `{timestamp}.csv`
2. THE Wizard SHALL allow the user to customise the file naming pattern prefix with a value between 1 and 100 characters, restricted to alphanumeric characters, hyphens, and underscores
3. WHEN an export file is generated, THE Wizard SHALL resolve the `{timestamp}` token to the current UTC date and time in the format `YYYYMMDD-HHmmss`
4. THE Wizard SHALL display a live preview of the resolved file name that updates as the user modifies the prefix, using the current UTC time for the timestamp portion
5. IF the user clears the prefix field or enters characters outside the allowed set, THEN THE Wizard SHALL display a validation error and prevent the export from proceeding until a valid prefix is provided

### Requirement 8: Default Timezone

**User Story:** As a user based in New Zealand, I want the default timezone to be NZ (Pacific/Auckland), so that date values in my exports reflect my local time without manual configuration.

#### Acceptance Criteria

1. WHEN a new exporter is created, THE Wizard SHALL set the timezone setting to "Pacific/Auckland" as the default value
2. THE Wizard SHALL allow the user to change the timezone to any valid IANA timezone identifier from the IANA Time Zone Database
3. WHEN the user selects a timezone, THE Wizard SHALL persist the selected timezone as part of the exporter configuration
4. WHEN datetime values are formatted in the export output, THE Wizard SHALL convert them to the exporter's configured timezone, including the correct offset for daylight saving time transitions
5. WHEN a date-only value with no time component is encountered in the export output, THE Wizard SHALL output it unchanged without timezone conversion

### Requirement 9: Schedule Without Time Selection

**User Story:** As a user, I want to configure the schedule frequency without specifying an exact time, so that the system can optimise execution timing and avoid scheduling conflicts.

#### Acceptance Criteria

1. THE Wizard SHALL allow the user to select exactly one schedule frequency from the options: hourly, daily, weekly, or monthly
2. THE Wizard SHALL NOT present a time-of-day input to the user
3. IF the user selects weekly frequency, THEN THE Wizard SHALL present a day-of-week selector allowing one or more days to be selected, with at least one day required before the schedule can be saved
4. IF the user selects monthly frequency, THEN THE Wizard SHALL present a day-of-month selector allowing the user to choose one or more days from 1 to 28, with at least one day required before the schedule can be saved
5. WHEN a schedule is saved, THE System SHALL assign an execution time automatically and SHALL NOT execute the schedule within the same time window (same clock-hour) as another scheduled export for the same account
6. WHEN a schedule is saved successfully, THE System SHALL display a confirmation indicating the selected frequency and assigned execution time

### Requirement 10: Notifications Matching Importer Format

**User Story:** As a user, I want the exporter notifications to follow the same format as the importer, so that I have a consistent alerting experience across both import and export automations.

#### Acceptance Criteria

1. THE Wizard SHALL present a "Failure" notification section that is always visible, containing a required email address chip input that validates entries as valid email format before accepting them
2. THE Wizard SHALL present a "Success" notification section with a toggle to enable/disable and an email address chip input that appears when the toggle is enabled
3. THE Wizard SHALL present a "No File" notification section with a toggle to enable/disable, and when enabled, display a frequency selector (hourly, daily, weekly, monthly), a starting date input, an interval input, a time input, and an email address chip input
4. WHEN the "Success" section is enabled, THE Wizard SHALL display a "copy from above" action that duplicates the current failure email list into the success email input
5. WHEN the "No File" section is enabled and the frequency is set to "weekly", THE Wizard SHALL display a day-of-week picker allowing selection of one or more days
6. WHEN the "No File" section is enabled and the frequency is set to "monthly", THE Wizard SHALL display a pattern selector (day or date) with corresponding ordinal/day-of-week selects or date chip input
7. WHEN the "No File" section is enabled, THE Wizard SHALL display a "copy from above" action that duplicates the current failure email list into the no-file email input
8. IF the user attempts to proceed past the notifications step with zero failure notification emails, THEN THE Wizard SHALL prevent progression and indicate that at least one failure email is required
