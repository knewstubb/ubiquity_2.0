# Requirements Document

## Introduction

The Connectors feature in UbiQuity allows users to configure import and export automations against external storage endpoints (S3, SFTP, Azure Blob). Currently, exporter configuration is fully persisted to Supabase, but importer wizard steps manage local-only state — contact configuration, field mappings, and notification settings are lost after creation. The AutomationSettingsModal also displays hardcoded values for importer sections rather than reading from the database.

This feature ensures all importer and exporter configuration data is fully persisted to Supabase, wizard steps lift state to the parent modal via callbacks, the settings modal reads all data from the database, and the seed script provides realistic importer config data.

## Glossary

- **Importer_Wizard**: The multi-step modal (ImporterWizardModal) that guides users through creating an import automation
- **Exporter_Wizard**: The multi-step modal (WizardModal) that guides users through creating an export automation
- **ImporterConfig**: The TypeScript model representing all configuration for an import automation
- **Automation**: The TypeScript model representing an export automation stored in Supabase
- **Settings_Modal**: The AutomationSettingsModal component that displays read-only configuration for a selected automation
- **Seed_Script**: The scripts/seed.ts file that populates Supabase with sample data
- **Contact_Config**: The configuration for how contact records are updated during import (update type, blank value handling, matching fields)
- **Field_Mapping**: A set of source-to-target field pairs defining how imported file columns map to database fields
- **Notification_Config**: Email notification settings for import/export success, failure, and no-file alerts
- **Review_Step**: The final summary step in the importer wizard that displays all configured values before creation
- **Supabase**: The backend database and API layer used for data persistence

## Requirements

### Requirement 1: Importer Contact Configuration Persistence

**User Story:** As a user, I want my contact configuration choices to be saved when I create an importer, so that the system knows how to handle contact record updates.

#### Acceptance Criteria

1. WHEN a user completes the Contact Configuration step, THE Importer_Wizard SHALL store the update type, blank value handling, and matching fields in the ImporterConfig object
2. WHEN the importer is saved, THE Importer_Wizard SHALL persist the Contact_Config to Supabase as a structured object (not Record<string, unknown>)
3. WHEN the Settings_Modal displays a contact importer, THE Settings_Modal SHALL read the update type, blank value handling, and matching fields from the database record

### Requirement 2: Importer Transactional Configuration Persistence

**User Story:** As a user, I want my transactional configuration choices to be saved when I create an importer, so that the system knows how to handle transactional record updates.

#### Acceptance Criteria

1. WHEN a user completes the Transactional Configuration step, THE Importer_Wizard SHALL store the update type, blank value handling, and matching fields in the ImporterConfig object
2. WHEN the importer is saved, THE Importer_Wizard SHALL persist the transactional config to Supabase as a structured object
3. WHEN the Settings_Modal displays a transactional importer, THE Settings_Modal SHALL read the transactional configuration from the database record

### Requirement 3: Importer Field Mapping Persistence

**User Story:** As a user, I want my field mappings to be saved when I create an importer, so that subsequent imports use the correct column-to-field assignments.

#### Acceptance Criteria

1. WHEN a user completes the Contact Mapping step, THE Importer_Wizard SHALL store the source-to-target field pairs in the ImporterConfig contactMapping property
2. WHEN a user completes the Transactional Mapping step, THE Importer_Wizard SHALL store the source-to-target field pairs in the ImporterConfig transactionalMapping property
3. WHEN the importer is saved, THE Importer_Wizard SHALL persist all Field_Mapping data to Supabase as an array of typed objects
4. WHEN the Settings_Modal displays an importer, THE Settings_Modal SHALL render the field mappings from the database record

### Requirement 4: Importer Notification Settings Persistence

**User Story:** As a user, I want my notification preferences to be saved when I create an importer, so that I receive alerts based on my chosen configuration.

#### Acceptance Criteria

1. WHEN a user completes the Notifications step, THE Importer_Wizard SHALL store failure email addresses, success notification toggle, success email addresses, and no-file alert configuration in the ImporterConfig notifications property
2. WHEN the importer is saved, THE Importer_Wizard SHALL persist the Notification_Config to Supabase as a structured object
3. WHEN the Settings_Modal displays an importer, THE Settings_Modal SHALL read notification settings from the database record and display the configured email addresses and toggle states

### Requirement 5: Exporter Notification and Schedule Persistence

**User Story:** As a user, I want my exporter notification preferences and schedule details to be saved, so that the export runs on my chosen schedule and I receive the correct alerts.

#### Acceptance Criteria

1. WHEN a user completes the exporter wizard, THE Exporter_Wizard SHALL persist notification email addresses, success notification toggle, and failure notification toggle to Supabase
2. WHEN a user completes the exporter wizard, THE Exporter_Wizard SHALL persist the full schedule configuration (frequency, starting time, interval, weekly days, monthly pattern) to Supabase
3. WHEN the Settings_Modal displays an exporter, THE Settings_Modal SHALL read notification and schedule data from the database record instead of displaying hardcoded values

### Requirement 6: Wizard State Lifting

**User Story:** As a developer, I want wizard step components to report their state changes to the parent modal via callbacks, so that the parent owns the complete configuration and can persist it.

#### Acceptance Criteria

1. THE ImportConfigStep component SHALL accept an onUpdate callback prop and invoke it with the current configuration whenever a field value changes
2. THE ImportMappingStep component SHALL accept an onUpdate callback prop and invoke it with the current field mapping whenever a mapping changes
3. THE NotificationsStep component SHALL accept an onUpdate callback prop and invoke it with the current notification settings whenever a value changes
4. THE Importer_Wizard SHALL pass the current config section and an onUpdate handler to each step component
5. WHEN a step component receives initial values via props, THE step component SHALL use those values as its initial state instead of empty defaults

### Requirement 7: Typed Importer Model

**User Story:** As a developer, I want the ImporterConfig model to use typed interfaces instead of Record<string, unknown>, so that the codebase has compile-time safety for importer data.

#### Acceptance Criteria

1. THE ImporterConfig model SHALL define a ContactConfig interface with fields for updateType, blankValueHandling, and matchingFields
2. THE ImporterConfig model SHALL define a TransactionalConfig interface with fields for updateType, blankValueHandling, and matchingFields
3. THE ImporterConfig model SHALL define a FieldMapping interface with fields for sourceField and targetField
4. THE ImporterConfig model SHALL define a NotificationConfig interface with fields for failureEmails, successEnabled, successEmails, noFileAlertEnabled, and noFileAlertEmails
5. THE ImporterConfig model SHALL replace all Record<string, unknown> properties with the corresponding typed interfaces

### Requirement 8: Settings Modal Reads from Database

**User Story:** As a user, I want the automation settings modal to show my actual saved configuration, so that I can verify what was configured.

#### Acceptance Criteria

1. WHEN the Settings_Modal opens for an importer, THE Settings_Modal SHALL display the file settings from the stored ImporterConfig
2. WHEN the Settings_Modal opens for an importer, THE Settings_Modal SHALL display the contact or transactional configuration from the stored record
3. WHEN the Settings_Modal opens for an importer, THE Settings_Modal SHALL display the field mappings from the stored record
4. WHEN the Settings_Modal opens for an importer, THE Settings_Modal SHALL display the notification settings from the stored record
5. THE Settings_Modal SHALL NOT display hardcoded placeholder values for any importer configuration section

### Requirement 9: Importer Review Step Reads from Config

**User Story:** As a user, I want the review step to show my actual configuration choices before I save, so that I can verify everything is correct.

#### Acceptance Criteria

1. WHEN the Review_Step is displayed, THE Review_Step SHALL read file settings, contact/transactional configuration, field mappings, and notification settings from the ImporterConfig passed by the parent wizard
2. THE Review_Step SHALL NOT display hardcoded demo data for any section

### Requirement 10: Seed Script Includes Importer Config Data

**User Story:** As a developer, I want the seed script to include realistic importer configuration data, so that the prototype demonstrates a fully configured importer without manual setup.

#### Acceptance Criteria

1. WHEN the Seed_Script runs, THE Seed_Script SHALL insert at least one importer record with a complete ContactConfig including update type, blank value handling, and matching fields
2. WHEN the Seed_Script runs, THE Seed_Script SHALL insert at least one importer record with a complete set of field mappings (minimum 5 source-to-target pairs)
3. WHEN the Seed_Script runs, THE Seed_Script SHALL insert at least one importer record with a complete NotificationConfig including failure emails and success toggle state
