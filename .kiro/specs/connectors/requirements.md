# Requirements: Connectors

> **Status:** ✅ Shipped
> **Last updated:** 2026-08-11
> **Consolidated from:** `integrations/`, `connector-data-persistence/`, `exporter-wizard-rework/`
> **Implementation:** `src/pages/ExporterWizardPage.tsx`, `src/pages/ImporterWizardPage.tsx`, `src/components/wizard/`, `src/components/importer/`

## 1. Problem Statement

UbiQuity users need to move data in and out of the platform — importing contact and transactional records from external files, and exporting audience segments, campaign results, and enriched datasets to downstream systems.

Without connectors, users must manually transfer data via CSV uploads or API calls, which is error-prone, time-consuming, and doesn't scale for regular data syncs.

## 2. Outcome

A complete data flow infrastructure where users can:
- Configure reusable connections to external storage (S3, SFTP, Azure Blob)
- Create import automations that ingest contact and transactional data on schedule
- Create export automations that extract filtered, enriched datasets on schedule
- Monitor automation status, view run history, and receive notifications on success/failure

## 3. Users

| User | Role |
|------|------|
| Marketing Analyst | Configures exporters to extract campaign performance data for external BI tools |
| Data Operations | Sets up importers to sync customer data from CRM/ERP systems |
| Platform Admin | Manages connections, monitors automation health, troubleshoots failures |

## 4. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | All automation configuration persists to Supabase; no client-only state |
| NFR-2 | Wizards use callback-based state lifting (no intermediate contexts) |
| NFR-3 | Default timezone is Pacific/Auckland for NZ-based users |
| NFR-4 | File naming uses `{timestamp}.csv` suffix for unique identification |

---

## 5. User Stories & Acceptance Criteria

### 5.1 Connection Management

**US-5.1.1** As a Platform Admin, I want to view all connections on a central dashboard so that I can manage data flow infrastructure.

#### Acceptance Criteria
- WHEN the Connectors page loads, THE SYSTEM SHALL display all connections as expandable rows showing protocol icon, name, and automation count.
- WHEN a connection has an error status, THE SYSTEM SHALL display a red icon, red name, and "Fix connection" button.
- WHEN a connection has zero automations (no error), THE SYSTEM SHALL display an "Add automation" button in place of the count text.

**US-5.1.2** As a Platform Admin, I want to create new connections so that I can set up storage endpoints for automations.

#### Acceptance Criteria
- WHEN the user clicks "+ New Connection", THE SYSTEM SHALL open the CreateConnectionModal.
- THE CreateConnectionModal SHALL collect protocol type (S3/SFTP/Azure), credentials, and connection name.
- WHEN credentials are validated, THE SYSTEM SHALL save the connection and display it on the dashboard.

**US-5.1.3** As a Platform Admin, I want to edit or delete connections so that I can maintain the infrastructure.

#### Acceptance Criteria
- WHEN the user selects "Edit Connection" from the meatball menu, THE SYSTEM SHALL display a warning about affected automations, then open the connection modal in edit mode.
- WHEN the user selects "Delete Connection", THE SYSTEM SHALL display a confirmation modal requiring the user to type "DELETE".
- THE SYSTEM SHALL disable connection deletion when automations exist, with tooltip: "Remove all Automations before deleting connection".

---

### 5.2 Importer Wizard

**US-5.2.1** As a Data Operations user, I want to create import automations so that customer data syncs automatically from external files.

#### Acceptance Criteria
- WHEN the user clicks "+ Add Automation" on a connection and selects Import, THE SYSTEM SHALL open the ImporterWizardModal.
- THE ImporterWizardModal SHALL guide the user through: File Settings → Data Type → Configuration → Field Mapping → Notifications → Review.

**US-5.2.2** As a Data Operations user, I want to configure how contact records are imported so that I control update behavior.

#### Acceptance Criteria
- THE Contact Configuration step SHALL allow selection of update type: Append & Update, Append Only, or Update Only.
- THE Contact Configuration step SHALL allow selection of blank value handling: Preserve Existing or Import Blanks.
- THE Contact Configuration step SHALL allow selection of matching fields (e.g., Email, Customer ID) for record identification.
- THE Contact Configuration step SHALL allow enabling deduplication with configurable fields.

**US-5.2.3** As a Data Operations user, I want to map file columns to database fields so that data lands in the correct locations.

#### Acceptance Criteria
- THE Field Mapping step SHALL display all columns detected from the file (via CSV headers).
- THE Field Mapping step SHALL allow mapping each source column to a target database field.
- THE Field Mapping step SHALL support lookup mappings that reference contact fields for transactional imports.
- THE Field Mapping step SHALL support import defaults (fixed values or send-date rules) for unmapped target fields.

**US-5.2.4** As a Data Operations user, I want to configure notification settings so that I'm alerted on import results.

#### Acceptance Criteria
- THE Notifications step SHALL require at least one failure notification email.
- THE Notifications step SHALL allow enabling success notifications with configurable email addresses.
- THE Notifications step SHALL allow enabling "no file" alerts with a configurable schedule.
- THE Notifications step SHALL provide "copy from above" actions to duplicate email lists.

**US-5.2.5** As a Data Operations user, I want all my importer configuration to persist so that settings aren't lost.

#### Acceptance Criteria
- WHEN the importer is saved, THE SYSTEM SHALL persist all configuration (file path, CSV format, contact/transactional config, field mappings, notifications) to Supabase.
- WHEN the AutomationSettingsModal opens for an importer, THE SYSTEM SHALL display all persisted values (not hardcoded placeholders).
- WHEN the user edits an existing importer, THE SYSTEM SHALL pre-populate all wizard steps from the stored configuration.

---

### 5.3 Exporter Wizard

**US-5.3.1** As a Marketing Analyst, I want to create export automations so that I can extract data for external analysis.

#### Acceptance Criteria
- WHEN the user clicks "+ Add Automation" on a connection and selects Export, THE SYSTEM SHALL open the ExporterWizardPage.
- THE ExporterWizardPage SHALL guide the user through: File Settings → Data Source → Filter → Export Fields → Schedule → Review.

**US-5.3.2** As a Marketing Analyst, I want to select my primary data source so that I export the right type of data.

#### Acceptance Criteria
- THE Data Source step SHALL allow selection of primary source: Contacts, Transactions, or Messages.
- WHEN Transactions is selected, THE SYSTEM SHALL require selection of a specific transactional table.
- WHEN Messages is selected, THE SYSTEM SHALL allow selection of channels (email, SMS, push).
- THE Data Source step SHALL allow adding enrichments from other data sources (multi-enrichment support).

**US-5.3.3** As a Marketing Analyst, I want to filter the exported records so that I only get relevant data.

#### Acceptance Criteria
- THE Filter step SHALL allow selection between "All changes since last export" and "Filtered records".
- WHEN filtered is selected, THE SYSTEM SHALL display a card-based filter builder.
- THE filter builder SHALL support field-based filters with operators appropriate to each field type.
- FOR Messages source, THE SYSTEM SHALL allow selection of specific message IDs.

**US-5.3.4** As a Marketing Analyst, I want to select and reorder export fields so that I control the output structure.

#### Acceptance Criteria
- THE Export Fields step SHALL display all available fields from the selected source(s), grouped by source.
- THE SYSTEM SHALL allow selecting, deselecting, and drag-to-reorder fields.
- THE SYSTEM SHALL allow renaming output columns (max 128 characters).
- THE SYSTEM SHALL validate column names: no empty, no whitespace-only, no duplicates.
- THE SYSTEM SHALL require at least one field selected before proceeding.

**US-5.3.5** As a Marketing Analyst, I want to configure file output settings so that the export matches my downstream requirements.

#### Acceptance Criteria
- THE File Settings step SHALL allow configuration of: file naming prefix, destination path, delimiter, header row toggle, date format, and timezone.
- THE SYSTEM SHALL default timezone to Pacific/Auckland.
- THE SYSTEM SHALL append `_{timestamp}.csv` to the file naming prefix automatically.
- THE SYSTEM SHALL display a live preview of the resolved file name.

**US-5.3.6** As a Marketing Analyst, I want to configure the export schedule so that data flows automatically.

#### Acceptance Criteria
- THE Schedule step SHALL allow selection of frequency: 10-minute, hourly, daily, or weekly.
- WHEN weekly is selected, THE SYSTEM SHALL display a day-of-week picker requiring at least one day.
- THE Schedule step SHALL include notification configuration matching the importer pattern.

**US-5.3.7** As a Marketing Analyst, I want to review my exporter configuration before saving so that I can verify correctness.

#### Acceptance Criteria
- THE Review step SHALL display a summary of all configuration: source, filters, fields (with renames), file settings, schedule, and notifications.
- THE Review step SHALL provide "Edit" links that navigate to the corresponding step.
- WHEN the user clicks "Create Exporter", THE SYSTEM SHALL persist all configuration to Supabase.

---

### 5.4 Automation Lifecycle

**US-5.4.1** As a Platform Admin, I want to view automation details so that I can inspect configuration.

#### Acceptance Criteria
- WHEN the user clicks an automation card, THE SYSTEM SHALL open the AutomationSettingsModal.
- THE AutomationSettingsModal SHALL display all persisted configuration from the database.

**US-5.4.2** As a Platform Admin, I want to pause and resume automations so that I can control execution.

#### Acceptance Criteria
- WHEN the user toggles an automation off, THE SYSTEM SHALL immediately pause it.
- WHEN the user toggles an automation on, THE SYSTEM SHALL display a billing confirmation dialog requiring the user to type "ACCEPT".
- THE automation card SHALL visually indicate paused status (reduced opacity, secondary background).

**US-5.4.3** As a Platform Admin, I want to edit automations so that I can update configuration.

#### Acceptance Criteria
- WHEN the user selects "Edit Automation", THE SYSTEM SHALL open the wizard modal pre-populated with current configuration.
- THE SYSTEM SHALL allow modifying any configuration step.
- WHEN saved, THE SYSTEM SHALL update the automation preserving its ID and creation timestamp.

**US-5.4.4** As a Platform Admin, I want to delete automations so that I can remove obsolete configurations.

#### Acceptance Criteria
- WHEN the user selects "Delete Automation", THE SYSTEM SHALL display a confirmation modal requiring the user to type "DELETE".
- WHEN confirmed, THE SYSTEM SHALL remove the automation from the database and dashboard.

**US-5.4.5** As a Platform Admin, I want to view automation activity logs so that I can audit changes.

#### Acceptance Criteria
- WHEN the user selects "Activity Log", THE SYSTEM SHALL display a chronological list of actions: created, edited, paused, activated.

**US-5.4.6** As a Platform Admin, I want to view automation run history so that I can monitor execution.

#### Acceptance Criteria
- WHEN the user selects "History", THE SYSTEM SHALL display past file imports/exports with results: timestamp, record count, success/failure status.

---

## 6. In Scope

- Connection CRUD (S3, SFTP, Azure Blob)
- Importer wizard with full configuration persistence
- Exporter wizard with multi-source/multi-enrichment support
- Automation lifecycle (pause/resume, edit, delete)
- Notification configuration for success, failure, and no-file alerts
- Seed data for realistic prototype demonstration

## 7. Out of Scope

| Item | Reason |
|------|--------|
| Actual file generation/transfer | Prototype-only; backend execution not implemented |
| Real scheduling | Schedules stored but not executed |
| OAuth connection authentication | Prototype uses static credentials |
| Webhook/API connectors | Phase 2 feature |
| Real-time data streaming | Phase 2 feature |

## 8. Open Questions

| # | Question | Impact |
|---|----------|--------|
| 1 | What happens to running automations when a connection is edited? | Determines warning dialog behavior |
| 2 | What are the possible run statuses for automations? | Affects status badge design |
| 3 | Should event-based exporters (mailout events) use a separate wizard flow? | Currently unified flow adapts to source selection |
