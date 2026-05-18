# Implementation Plan: Connector Data Persistence

## Overview

This plan implements full persistence for importer configuration data. It replaces `Record<string, unknown>` types with typed interfaces, wires wizard step components to lift state via callbacks, updates the connectors adapter and seed script to handle the new `importer_config` JSONB column, and updates the settings modal to read from the database instead of displaying hardcoded values.

## Tasks

- [x] 1. Define typed importer interfaces and defaults
  - [x] 1.1 Replace Record<string, unknown> types in src/models/importer.ts with typed interfaces
    - Add `UpdateType`, `BlankValueHandling` type aliases
    - Add `ContactConfig`, `TransactionalConfig`, `FieldMapping`, `NotificationConfig` interfaces
    - Replace `notifications: Record<string, unknown>` with `notifications: NotificationConfig`
    - Replace `contactConfig: Record<string, unknown>` with `contactConfig: ContactConfig`
    - Replace `contactMapping: Record<string, unknown>` with `contactMapping: FieldMapping[]`
    - Replace `transactionalConfig: Record<string, unknown>` with `transactionalConfig: TransactionalConfig`
    - Replace `transactionalMapping: Record<string, unknown>` with `transactionalMapping: FieldMapping[]`
    - Add `DEFAULT_CONTACT_CONFIG`, `DEFAULT_TRANSACTIONAL_CONFIG`, `DEFAULT_NOTIFICATION_CONFIG` constants
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 1.2 Add importerConfig field to the Automation model in src/models/automation.ts
    - Add optional `importerConfig?: ImporterConfig` field to the `Automation` interface
    - Import `ImporterConfig` from `./importer`
    - _Requirements: 7.5, 1.2, 2.2_

- [x] 2. Update connectors adapter for importer_config persistence
  - [x] 2.1 Extend mapRowToConnector and mapConnectorToRow in src/lib/adapters/connectors-adapter.ts
    - Add `importerConfig: row.importer_config ?? undefined` to `mapRowToConnector`
    - Add `importer_config: connector.importerConfig ?? null` to `mapConnectorToRow`
    - Add `if (updates.importerConfig !== undefined) row.importer_config = updates.importerConfig` to the `update` function
    - _Requirements: 1.2, 2.2, 3.3, 4.2, 5.1, 5.2, 8.1_

  - [x] 2.2 Write property test for ImporterConfig round-trip serialization
    - **Property 1: ImporterConfig round-trip serialization**
    - Generate arbitrary valid `ImporterConfig` objects using fast-check
    - Serialize via `mapConnectorToRow` and deserialize via `mapRowToConnector`
    - Assert deep equality between original and round-tripped `importerConfig`
    - Run minimum 100 iterations
    - **Validates: Requirements 1.2, 2.2, 3.3, 4.2, 5.1, 5.2**

- [x] 3. Wire wizard step components with onUpdate callbacks
  - [x] 3.1 Update ImportConfigStep to accept value and onUpdate props
    - Add `value: ContactConfig | TransactionalConfig` and `onUpdate: (config) => void` props to the component interface
    - Initialize local state from `value` prop instead of empty defaults
    - Call `onUpdate` with the complete section state whenever a field changes
    - _Requirements: 6.1, 6.5, 1.1, 2.1_

  - [x] 3.2 Update ImportMappingStep to accept value and onUpdate props
    - Add `value: FieldMapping[]` and `onUpdate: (mappings: FieldMapping[]) => void` props
    - Initialize local state from `value` prop
    - Call `onUpdate` with the complete mapping array whenever a mapping changes
    - _Requirements: 6.2, 6.5, 3.1, 3.2_

  - [x] 3.3 Update NotificationsStep to accept value and onUpdate props
    - Add `value: NotificationConfig` and `onUpdate: (config: NotificationConfig) => void` props
    - Initialize local state from `value` prop
    - Call `onUpdate` with the complete notification config whenever a value changes
    - _Requirements: 6.3, 6.5, 4.1_

  - [x] 3.4 Write property test for step callback state lifting
    - **Property 2: Step callback state lifting**
    - Generate arbitrary field value changes for each step component type
    - Simulate `onUpdate` invocation and verify the parent state contains exactly those values
    - Run minimum 100 iterations
    - **Validates: Requirements 1.1, 2.1, 3.1, 3.2, 4.1, 6.1, 6.2, 6.3**

  - [x] 3.5 Write property test for controlled component initialization
    - **Property 3: Controlled component initialization**
    - Generate arbitrary non-default `ImporterConfig` sections
    - Pass as `value` prop to step components
    - Assert rendered state matches input values (not empty defaults)
    - Run minimum 100 iterations
    - **Validates: Requirements 6.5, 8.1, 8.2, 8.3, 8.4**

- [x] 4. Update ImporterWizardModal to pass config sections and handlers to steps
  - [x] 4.1 Wire ImporterWizardModal step rendering with value/onUpdate pattern
    - Pass `config.contactConfig` and a `handleConfigUpdate` handler to ImportConfigStep
    - Pass `config.transactionalConfig` and handler to ImportConfigStep (transactional variant)
    - Pass `config.contactMapping` and handler to ImportMappingStep (contact variant)
    - Pass `config.transactionalMapping` and handler to ImportMappingStep (transactional variant)
    - Pass `config.notifications` and handler to NotificationsStep
    - Implement `handleConfigUpdate` as a partial state merge into the parent `ImporterConfig`
    - _Requirements: 6.4, 1.1, 2.1, 3.1, 3.2, 4.1_

  - [x] 4.2 Update ImporterWizardModal onSave to persist importerConfig via adapter
    - On "Create Importer" click, include the full `importerConfig` in the automation object passed to `addAutomationDirect()`
    - Ensure the `importerConfig` is included in the connector row sent to Supabase
    - _Requirements: 1.2, 2.2, 3.3, 4.2_

- [x] 5. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Update ImporterReviewStep to read from config props
  - [x] 6.1 Refactor ImporterReviewStep to render from ImporterConfig prop
    - Accept `config: ImporterConfig` prop from the parent wizard
    - Render file settings, contact/transactional config, field mappings, and notifications from the config object
    - Remove any hardcoded demo data
    - _Requirements: 9.1, 9.2_

- [x] 7. Update AutomationSettingsModal to read from database
  - [x] 7.1 Refactor importer sections in AutomationSettingsModal to read from automation.importerConfig
    - Replace hardcoded "Append / Update" and similar values with data from `automation.importerConfig.contactConfig`
    - Render field mappings from `automation.importerConfig.contactMapping` / `.transactionalMapping`
    - Render notification settings from `automation.importerConfig.notifications`
    - Render file settings from `automation.importerConfig.filePathConfig`
    - Handle null/undefined `importerConfig` gracefully (show "Not configured" fallback)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 1.3, 2.3, 3.4, 4.3_

  - [x] 7.2 Update exporter sections in AutomationSettingsModal to read notification and schedule from database
    - Replace hardcoded notification values with data from the stored automation record
    - Replace hardcoded schedule display with data from `automation.schedule`
    - _Requirements: 5.3_

- [x] 8. Update seed data and seed script
  - [x] 8.1 Add importerConfig to seed data in src/data/automations.ts
    - Add a complete `importerConfig` object to the `auto-spa-s3-contacts` record with full `ContactConfig`, at least 7 field mappings, and `NotificationConfig`
    - Add a complete `importerConfig` to at least one transactional importer (e.g. `auto-spa-s3-treatments`) with `TransactionalConfig` and mappings
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 8.2 Update seedConnectors() in scripts/seed.ts to include importer_config column
    - Add `importer_config: c.importerConfig ?? null` to the row mapping in `seedConnectors()`
    - _Requirements: 10.1, 10.2, 10.3_

- [x] 9. Exporter wizard notification and schedule persistence
  - [x] 9.1 Ensure exporter wizard persists notification and schedule config to Supabase
    - Verify the exporter wizard (WizardModal) includes notification emails, success toggle, and failure toggle in the automation object on save
    - Verify the full schedule configuration (frequency, starting time, interval, weekly days, monthly pattern) is persisted
    - Add any missing fields to the save flow
    - _Requirements: 5.1, 5.2_

- [x] 10. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The `importer_config` column must be added to Supabase manually (or via migration) before the seed script can write to it

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "3.1", "3.2", "3.3"] },
    { "id": 3, "tasks": ["2.2", "3.4", "3.5", "4.1"] },
    { "id": 4, "tasks": ["4.2", "6.1"] },
    { "id": 5, "tasks": ["7.1", "7.2", "8.1"] },
    { "id": 6, "tasks": ["8.2", "9.1"] }
  ]
}
```
