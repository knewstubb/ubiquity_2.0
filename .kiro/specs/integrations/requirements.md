# Requirements Document

## Introduction

The Connector Exporter Prototype is a standalone React application built for design reference and demonstration purposes. It showcases the UbiQuity export connector creation and management flow using realistic pre-seeded data from a wellness spa business domain. The prototype simulates the full connector setup experience — from browsing connections to configuring export fields, formatting, scheduling, and output file naming — without any real backend, file generation, or pipeline execution. All data is client-side and mocked.

Connector creation begins with an Initial_Modal triggered from a specific Connection_Row, then proceeds into a 4-step Wizard_Modal overlay on the dashboard. The wizard covers data source selection (with key field picker and non-functional filters), field mapping with data preview, output configuration (file type, format options, file naming, and schedule), and a final review step.

## Glossary

- **Prototype_App**: The standalone React application that renders the connector exporter UI. All data is held in client-side state with no backend API.
- **Connection**: A pre-seeded entity representing a configured external storage endpoint (S3 or SFTP). Connections are read-only and exist at application startup.
- **Connector**: A user-created configuration entity nested under a parent Connection. In this prototype, only export connectors are created. Each Connector defines a data type, field selection, format options, file type, file naming convention, schedule, and optional non-functional filter values.
- **Connections_Dashboard**: The main page of the Prototype_App displaying all pre-seeded Connections as expandable rows, with child Connectors shown as nested cards.
- **Initial_Modal**: A small modal dialog opened by clicking "+ Add Connector" on a Connection_Row. It displays the parent Connection name and type as read-only context, an Import/Export toggle (import is disabled), and a connector name text input. The user must select "Export" and provide a name before proceeding to the Wizard_Modal.
- **Wizard_Modal**: A large modal overlay (60% viewport width, 80% viewport height) displayed on top of the Connections_Dashboard. It contains the 4-step guided flow for configuring a new export Connector. Replaces the previous full-page wizard route.
- **Creation_Wizard**: The 4-step guided flow hosted inside the Wizard_Modal for creating a new export Connector. Steps: Data Source Selection, Field Mapping, Output Configuration, and Review.
- **Contact_Database**: A pre-seeded dataset of approximately 50 spa customer records containing fields such as name, email, phone number, membership tier, join date, and preferences.
- **Treatment_Database**: A pre-seeded dataset of approximately 200 in-store spa treatment purchase records containing fields such as customer reference, treatment type, therapist name, date, duration, and price.
- **Product_Database**: A pre-seeded dataset of approximately 200 product and voucher purchase records containing fields such as customer reference, product name, category, purchase channel, date, and price.
- **Export_Data_Type**: The category of data a Connector exports. One of: Contact_Table_Data, Transactional_Table_Data, or Transactional_With_Contact_Enrichments.
- **Key_Field**: A field on the transactional side of an enrichment join that links each transactional record to a contact record. For the prototype's pre-seeded data, `customerId` is the only valid Key_Field. The contact side of the join is always `ContactRecord.id`.
- **Field_Picker**: The UI component within the Creation_Wizard that displays available fields for the selected Export_Data_Type and allows the user to select, deselect, and reorder columns.
- **Data_Preview**: A panel on the Field Mapping step that shows a static 3-row sample of what the export would look like with the currently selected fields and their order, using pre-seeded data.
- **Format_Options**: User-configurable formatting settings including delimiter (CSV only), header row toggle, date format, and timezone.
- **File_Type**: The output file format for the export. One of: CSV, JSON, or XML.
- **File_Naming_Convention**: A user-defined naming pattern for exported files using available tokens such as `{connector_name}`, `{date}`, and `{timestamp}`. Configured in the Output Configuration step.
- **Non_Functional_Filter**: A visual-only filter control displayed on the Data Source Selection step. Filter values are stored in the connector configuration but do not actually filter any data. They exist for discussion and demo purposes only.
- **Schedule_Selection**: A UI-only dropdown where the user picks an export frequency. No actual scheduling occurs.
- **Connector_Card**: A UI element on the Connections_Dashboard representing a single Connector, showing its type, data type, schedule, and status.
- **Connection_Row**: A UI element on the Connections_Dashboard representing a single Connection, expandable to reveal its child Connector_Cards and an "+ Add Connector" button.

## Requirements

### Requirement 1: Pre-seeded Connections

**User Story:** As a prototype user, I want to see pre-existing connections on the dashboard when the app loads, so that I can immediately begin creating connectors without manual setup.

#### Acceptance Criteria

1. WHEN the Prototype_App loads, THE Connections_Dashboard SHALL display at least two pre-seeded Connections: one S3 Connection and one SFTP Connection.
2. THE Prototype_App SHALL populate each pre-seeded Connection with a realistic display name, protocol type, and status indicator.
3. THE Prototype_App SHALL store all pre-seeded Connection data in client-side state with no external API calls.

### Requirement 2: Pre-seeded Contact Database

**User Story:** As a prototype user, I want a realistic set of spa customer contacts available for export configuration, so that the field selection and preview steps feel authentic.

#### Acceptance Criteria

1. THE Prototype_App SHALL include a pre-seeded Contact_Database containing approximately 50 spa customer records.
2. THE Contact_Database SHALL include the following fields for each record: first name, last name, email address, phone number, membership tier, join date, and communication preferences.
3. THE Contact_Database SHALL contain realistic wellness spa customer data with varied membership tiers and contact details.

### Requirement 3: Pre-seeded Treatment Transaction Database

**User Story:** As a prototype user, I want a realistic set of in-store treatment purchase records available for export configuration, so that transactional export flows feel authentic.

#### Acceptance Criteria

1. THE Prototype_App SHALL include a pre-seeded Treatment_Database containing approximately 200 in-store spa treatment records.
2. THE Treatment_Database SHALL include the following fields for each record: customer reference, treatment type, therapist name, treatment date, duration, and price.
3. THE Treatment_Database SHALL contain realistic spa treatment data including varied treatment types such as facials, massages, and body wraps.

### Requirement 4: Pre-seeded Product and Voucher Transaction Database

**User Story:** As a prototype user, I want a realistic set of product and voucher purchase records available for export configuration, so that the second transactional export type feels authentic.

#### Acceptance Criteria

1. THE Prototype_App SHALL include a pre-seeded Product_Database containing approximately 200 product and voucher purchase records.
2. THE Product_Database SHALL include the following fields for each record: customer reference, product name, category, purchase channel, purchase date, and price.
3. THE Product_Database SHALL contain realistic wellness spa data including skincare products, wellness products, gift cards, and treatment vouchers with both in-person and online purchase channels.

### Requirement 5: Connections Dashboard

**User Story:** As a prototype user, I want to view all connections and their child connectors on a single dashboard, so that I can manage my export configurations from one place.

#### Acceptance Criteria

1. THE Connections_Dashboard SHALL display each pre-seeded Connection as a Connection_Row.
2. WHEN a user clicks on a Connection_Row, THE Connections_Dashboard SHALL expand the row to reveal all child Connector_Cards belonging to that Connection.
3. WHEN a user clicks on an expanded Connection_Row, THE Connections_Dashboard SHALL collapse the row to hide the child Connector_Cards.
4. THE Connections_Dashboard SHALL visually distinguish export Connectors from import Connectors on each Connector_Card.
5. THE Connector_Card SHALL display the connector name, type (import or export), Export_Data_Type, schedule, and status.
6. THE Connection_Row SHALL include an "+ Add Connector" control that opens the Initial_Modal for that specific Connection.

### Requirement 6: Initial Modal for Connector Creation

**User Story:** As a prototype user, I want a small modal to appear when I click "+ Add Connector" on a connection, so that I can name my connector and confirm the export direction before entering the full wizard.

#### Acceptance Criteria

1. WHEN a user clicks "+ Add Connector" on a Connection_Row, THE Prototype_App SHALL open the Initial_Modal as a small dialog overlaying the Connections_Dashboard.
2. THE Initial_Modal SHALL display the parent Connection name and protocol type as read-only context that the user cannot change.
3. THE Initial_Modal SHALL display an Import/Export toggle where the Import option is visually disabled and non-functional for this demo.
4. THE Initial_Modal SHALL display a text input for the user to enter a connector name.
5. THE Initial_Modal SHALL require the user to select "Export" and provide a non-empty connector name before enabling the proceed action.
6. WHEN the user completes the Initial_Modal and proceeds, THE Prototype_App SHALL open the Wizard_Modal with the selected Connection and connector name pre-populated.

### Requirement 7: Wizard Modal Overlay

**User Story:** As a prototype user, I want the creation wizard to appear as a modal overlay on the dashboard rather than a separate page, so that I maintain context of where I am in the application.

#### Acceptance Criteria

1. THE Wizard_Modal SHALL render as a modal overlay on top of the Connections_Dashboard, sized at 60% viewport width and 80% viewport height.
2. THE Wizard_Modal SHALL contain the full 4-step Creation_Wizard flow.
3. WHILE the Wizard_Modal is open, THE Connections_Dashboard SHALL remain visible but non-interactive behind the modal overlay.
4. WHEN the user completes or cancels the wizard, THE Wizard_Modal SHALL close and return the user to the Connections_Dashboard.

### Requirement 8: Connector Creation — Data Source Selection Step (Step 1)

**User Story:** As a prototype user, I want to choose the type of data my export connector will handle and configure source-specific options, so that the subsequent field selection step shows the correct fields.

#### Acceptance Criteria

1. THE Creation_Wizard SHALL present exactly three Export_Data_Type options: Contact_Table_Data, Transactional_Table_Data, and Transactional_With_Contact_Enrichments.
2. THE Creation_Wizard SHALL require the user to select exactly one Export_Data_Type before proceeding to the next step.
3. WHEN the user selects Transactional_Table_Data or Transactional_With_Contact_Enrichments, THE Creation_Wizard SHALL prompt the user to choose which transactional source to use: Treatment_Database or Product_Database.
4. WHEN the user selects Transactional_With_Contact_Enrichments, THE Creation_Wizard SHALL display a Key_Field picker requiring the user to select a field from the transactional side that links to the Contact_Database.
5. THE Key_Field picker SHALL display an explanatory message: "This field links each transaction to a contact record".
6. THE Key_Field picker SHALL present `customerId` as the only valid Key_Field option for the prototype's pre-seeded data, with the contact side of the join fixed to `ContactRecord.id`.
7. THE Data Source Selection step SHALL include a Non_Functional_Filter section with static filter dropdowns.
8. THE Non_Functional_Filter section SHALL include a date range filter with options: Last 7 days, Last 30 days, Last 90 days, and All time.
9. WHEN the Export_Data_Type includes Contact_Table_Data, THE Non_Functional_Filter section SHALL include a membership tier filter with options: Bronze, Silver, Gold, Platinum, and All.
10. WHEN the Export_Data_Type includes Transactional_Table_Data, THE Non_Functional_Filter section SHALL include a transaction type filter.
11. THE Prototype_App SHALL store Non_Functional_Filter values in the Connector configuration but SHALL NOT use them to filter any data.
12. THE Creation_Wizard SHALL display a progress indicator showing the current step within the 4-step wizard flow.

### Requirement 9: Connector Creation — Field Mapping Step (Step 2)

**User Story:** As a prototype user, I want to pick which fields to include in my export, arrange their column order, and preview the result, so that I can see how the field picker and data preview interactions work.

#### Acceptance Criteria

1. WHEN the user reaches the Field Mapping step, THE Field_Picker SHALL display all available fields for the selected Export_Data_Type and data source.
2. WHEN the Export_Data_Type is Transactional_With_Contact_Enrichments, THE Field_Picker SHALL display fields from both the selected transactional source and the Contact_Database.
3. THE Field_Picker SHALL allow the user to select and deselect individual fields using checkboxes or a similar toggle mechanism.
4. THE Field_Picker SHALL allow the user to reorder selected fields using drag-and-drop interaction.
5. THE Field_Picker SHALL require at least one field to be selected before the user can proceed to the next step.
6. THE Field Mapping step SHALL include a Data_Preview panel showing a static 3-row sample of what the export would look like with the currently selected fields and their order.
7. THE Data_Preview panel SHALL use the pre-seeded data to generate a realistic preview that updates when the user changes field selection or order.

### Requirement 10: Connector Creation — Output Configuration Step (Step 3)

**User Story:** As a prototype user, I want to configure file type, format options, file naming, and schedule in a single step, so that all output-related settings are consolidated.

#### Acceptance Criteria

1. THE Output Configuration step SHALL present a File_Type selector with options: CSV, JSON, and XML.
2. THE Output Configuration step SHALL present Format_Options including: delimiter selection, header row toggle, date format selection, and timezone selection.
3. WHEN the selected File_Type is CSV, THE Output Configuration step SHALL display the delimiter selection option.
4. WHEN the selected File_Type is JSON or XML, THE Output Configuration step SHALL hide the delimiter selection option since it does not apply.
5. THE Output Configuration step SHALL default the File_Type to CSV, the delimiter to comma, the header row toggle to enabled, the date format to ISO 8601, and the timezone to UTC.
6. THE Output Configuration step SHALL present a File_Naming_Convention input where the user can define a naming pattern for exported files.
7. THE File_Naming_Convention input SHALL display available tokens the user can use, including at minimum: `{connector_name}`, `{date}`, and `{timestamp}`.
8. THE Output Configuration step SHALL present a schedule dropdown with the following options: every 15 minutes, hourly, daily, weekly, and monthly.
9. THE Output Configuration step SHALL require the user to select exactly one schedule option before proceeding.
10. THE Prototype_App SHALL store the selected schedule, File_Type, Format_Options, and File_Naming_Convention as part of the Connector configuration in client-side state only, with no actual scheduling or file generation execution.

### Requirement 11: Connector Creation — Review and Save Step (Step 4)

**User Story:** As a prototype user, I want to review all my connector settings before saving, so that I can verify the configuration is correct.

#### Acceptance Criteria

1. WHEN the user reaches the review step, THE Creation_Wizard SHALL display a summary of the full Connector configuration including: parent Connection name, Export_Data_Type, Key_Field (when applicable), selected fields with column order, File_Type, Format_Options, File_Naming_Convention, selected schedule, and Non_Functional_Filter values.
2. THE Creation_Wizard SHALL allow the user to navigate back to any previous step from the review step to make changes.
3. WHEN the user confirms the configuration on the review step, THE Prototype_App SHALL save the new Connector to client-side state and add a corresponding Connector_Card to the parent Connection_Row on the Connections_Dashboard.
4. WHEN the user confirms the configuration, THE Wizard_Modal SHALL close and return the user to the Connections_Dashboard.

### Requirement 12: Connector Lifecycle — View Details

**User Story:** As a prototype user, I want to view the full configuration of an existing connector, so that I can inspect its settings.

#### Acceptance Criteria

1. WHEN a user clicks on a Connector_Card on the Connections_Dashboard, THE Prototype_App SHALL display the full Connector configuration including parent Connection, Export_Data_Type, Key_Field (when applicable), selected fields, File_Type, Format_Options, File_Naming_Convention, schedule, and Non_Functional_Filter values.
2. THE Prototype_App SHALL present the Connector details in a read-only view by default.

### Requirement 13: Connector Lifecycle — Edit Configuration

**User Story:** As a prototype user, I want to edit an existing connector's settings, so that I can see how the edit flow works.

#### Acceptance Criteria

1. WHEN a user initiates an edit action on a Connector, THE Prototype_App SHALL open the Wizard_Modal pre-populated with the Connector's current configuration.
2. THE Creation_Wizard SHALL allow the user to modify any configuration step during an edit.
3. WHEN the user saves changes from the edit flow, THE Prototype_App SHALL update the Connector in client-side state and reflect the changes on the Connections_Dashboard.

### Requirement 14: Connector Lifecycle — Pause and Resume

**User Story:** As a prototype user, I want to pause and resume a connector, so that I can see how the status toggle interaction works.

#### Acceptance Criteria

1. WHEN a user pauses an active Connector, THE Prototype_App SHALL update the Connector status to paused in client-side state.
2. WHEN a Connector is paused, THE Connector_Card SHALL display a visual indicator showing the paused status.
3. WHEN a user resumes a paused Connector, THE Prototype_App SHALL update the Connector status to active in client-side state.
4. WHEN a Connector is resumed, THE Connector_Card SHALL display a visual indicator showing the active status.

### Requirement 15: Connector Lifecycle — Delete

**User Story:** As a prototype user, I want to delete a connector, so that I can see how the removal interaction works.

#### Acceptance Criteria

1. WHEN a user initiates a delete action on a Connector, THE Prototype_App SHALL display a confirmation prompt before proceeding.
2. WHEN the user confirms deletion, THE Prototype_App SHALL remove the Connector from client-side state and remove the corresponding Connector_Card from the Connections_Dashboard.
3. WHEN the user cancels deletion, THE Prototype_App SHALL retain the Connector unchanged.

### Requirement 16: Wizard Progress Indicator

**User Story:** As a prototype user, I want to see where I am in the connector creation flow, so that I understand how many steps remain.

#### Acceptance Criteria

1. THE Creation_Wizard SHALL display a step progress indicator showing all four wizard steps: Data Source Selection, Field Mapping, Output Configuration, and Review.
2. THE Creation_Wizard SHALL visually highlight the current active step in the progress indicator.
3. THE Creation_Wizard SHALL allow the user to navigate to any previously completed step by clicking on the progress indicator.

### Requirement 17: Responsive and Clean UI

**User Story:** As a prototype user, I want the application to look polished and follow the Figma design patterns, so that it serves as a credible design reference.

#### Acceptance Criteria

1. THE Prototype_App SHALL follow the UbiQuity Figma design patterns for the Connections_Dashboard layout, including Connection_Row expand/collapse and nested Connector_Cards.
2. THE Prototype_App SHALL follow the UbiQuity Figma design patterns for the Wizard_Modal layout, including the multi-step progress indicator, Field_Picker with drag-to-reorder, Data_Preview panel, Output Configuration controls, and Schedule_Selection dropdown.
3. THE Prototype_App SHALL render correctly at standard desktop viewport widths of 1280 pixels and above.
