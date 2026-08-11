# Implementation Plan: Connector Exporter — Updated Design (Modal-Based Wizard)

## Overview

This plan covers the delta between the existing working prototype (91 passing tests, route-based wizard) and the updated design (modal-based wizard with new fields and sub-components). The existing project scaffolding, pre-seeded data, shared UI components, and core contexts are already complete. Tasks focus on: updating data models, replacing the route-based wizard with modal-based wizard, creating new sub-components (KeyFieldPicker, FilterSection, DataPreview, FileNamingInput), refactoring existing wizard steps, and updating the dashboard to manage modal state.

## Tasks

- [x] 1. Update data models and types for new fields
  - [x] 1.1 Update Connector type with new fields
    - Add `FileType` type (`'csv' | 'json' | 'xml'`) to `src/models/connector.ts`
    - Add `FilterConfig` interface with `dateRange`, optional `membershipTier`, optional `transactionType`
    - Add `fileType: FileType`, `fileNamingPattern: string`, `enrichmentKeyField?: string`, `filters: FilterConfig` to `Connector` interface
    - _Requirements: 8.4, 8.6, 8.11, 10.1, 10.6, 10.10_

  - [x] 1.2 Update WizardDraft type with new fields
    - Add `enrichmentKeyField: string | null`, `fileType: FileType`, `fileNamingPattern: string`, `filters: FilterConfig` to `WizardDraft` interface in `src/models/wizard.ts`
    - Add `DEFAULT_FILTERS` constant (`{ dateRange: 'all_time' }`)
    - Add `DEFAULT_FILE_NAMING_PATTERN` constant (`'{connector_name}_{date}'`)
    - Update default draft creation to include new fields with defaults
    - _Requirements: 8.7, 8.11, 10.1, 10.5, 10.6_

- [x] 2. Update ConnectorsContext for new Connector fields
  - [x] 2.1 Update addConnector to map new draft fields
    - Map `fileType`, `fileNamingPattern`, `enrichmentKeyField`, `filters` from `WizardDraft` to new `Connector` in `src/contexts/ConnectorsContext.tsx`
    - _Requirements: 10.10, 11.3_

  - [x] 2.2 Update updateConnector to persist new fields
    - Include `fileType`, `fileNamingPattern`, `enrichmentKeyField`, `filters` in the update spread in `src/contexts/ConnectorsContext.tsx`
    - _Requirements: 13.3_

- [x] 3. Remove wizard route and update App.tsx
  - Remove the `/wizard/:step` route from `src/App.tsx`
  - Remove the `WizardPage` import
  - Only `/` and `/connector/:id` routes remain
  - _Requirements: 7.1, 7.4_

- [x] 4. Checkpoint — Verify data model updates compile cleanly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create InitialModal component
  - [x] 5.1 Implement InitialModal
    - Create `src/components/dashboard/InitialModal.tsx` with CSS Module
    - Props: `connection: Connection`, `onProceed: (name: string) => void`, `onClose: () => void`
    - Display parent connection name and protocol as read-only context
    - Render Import/Export toggle where Import is visually disabled and non-clickable
    - Render text input for connector name
    - Disable "Proceed" button until "Export" is selected AND name is non-empty (trimmed)
    - Close on Escape key press
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 5.2 Write unit tests for InitialModal
    - Test connection context is displayed read-only
    - Test import toggle is disabled
    - Test proceed button is disabled when name is empty or whitespace-only
    - Test proceed button is enabled when export selected and name provided
    - Test onProceed is called with the entered name
    - Test Escape closes the modal
    - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [x] 6. Create WizardModal component
  - [x] 6.1 Implement WizardModal
    - Create `src/components/wizard/WizardModal.tsx` with CSS Module
    - Props: `connectionId: string`, `connectorName: string`, `editConnectorId?: string`, `onSave: (draft: WizardDraft) => void`, `onClose: () => void`
    - Render as 60% viewport width × 80% viewport height overlay with backdrop
    - Backdrop click does NOT close the modal (prevent accidental data loss)
    - Escape key shows "discard changes?" confirmation if draft has been modified
    - Manage local `WizardDraft` state internally (initialize from existing connector if `editConnectorId` provided)
    - Render WizardStepper (4 steps), step content area, and WizardNavButtons
    - Implement `canProceed` validation per step (updated for 4-step flow: Step 1 requires dataType + transactionalSource if applicable + enrichmentKeyField if enrichment; Step 2 requires ≥1 field; Step 3 requires schedule; Step 4 always true)
    - On save at review step: call `onSave(draft)` and close
    - In edit mode: pre-populate draft from existing connector (including new fields), mark all steps completed
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 13.1, 13.2_

  - [ ]* 6.2 Write unit tests for WizardModal
    - Test modal renders at correct dimensions
    - Test backdrop click does not close modal
    - Test 4-step stepper is rendered
    - Test edit mode pre-populates draft from existing connector (Property 16 representative example)
    - Test save produces connector matching draft (Property 15 representative example)
    - _Requirements: 7.1, 7.2, 7.3, 13.1_

- [x] 7. Refactor DashboardPage for modal management
  - [x] 7.1 Update DashboardPage to manage InitialModal and WizardModal state
    - Add `initialModalConnectionId` state (string | null) to `src/pages/DashboardPage.tsx`
    - Add `wizardModalState` state (`{ open, connectionId, connectorName, editConnectorId } | null`)
    - Remove "New Connector" link that navigated to `/wizard/1`
    - Wire `onAddConnector` callback to open InitialModal for a specific connection
    - Wire InitialModal's `onProceed` to close InitialModal and open WizardModal with connection context + name
    - Wire edit flow to open WizardModal directly (skip InitialModal) with `editConnectorId`
    - Wire WizardModal's `onSave` to call `addConnector` or `updateConnector` from ConnectorsContext
    - _Requirements: 5.6, 6.1, 6.6, 7.4, 13.1_

  - [x] 7.2 Update ConnectionRow to use onAddConnector callback
    - Add `onAddConnector: (connectionId: string) => void` prop to `ConnectionRow`
    - Replace the `<Link to="/wizard/1">` with a button that calls `onAddConnector(connection.id)`
    - Pass `onAddConnector` from DashboardPage
    - _Requirements: 5.6, 6.1_

  - [ ]* 7.3 Write unit tests for modal management flow
    - Test clicking "+ Add Connector" opens InitialModal
    - Test completing InitialModal opens WizardModal
    - Test edit action opens WizardModal directly
    - _Requirements: 5.6, 6.1, 6.6, 13.1_

- [x] 8. Checkpoint — Verify modal shell works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Refactor DataTypeStep → DataSourceStep with new sub-components
  - [x] 9.1 Create KeyFieldPicker sub-component
    - Create `src/components/wizard/KeyFieldPicker.tsx` with CSS Module
    - Props: `transactionalSource: TransactionalSource`, `value: string | null`, `onChange: (key: string) => void`
    - Display explanatory text: "This field links each transaction to a contact record"
    - Show `customerId` as the only valid option; contact side fixed to `ContactRecord.id`
    - _Requirements: 8.4, 8.5, 8.6_

  - [x] 9.2 Create FilterSection sub-component
    - Create `src/components/wizard/FilterSection.tsx` with CSS Module
    - Props: `dataType: ExportDataType`, `filters: FilterConfig`, `onUpdate: (filters: FilterConfig) => void`
    - Always show date range filter (Last 7 days, Last 30 days, Last 90 days, All time)
    - Show membership tier filter when dataType includes contacts (`'contact'` or `'transactional_with_contact'`)
    - Show transaction type filter when dataType includes transactional (`'transactional'` or `'transactional_with_contact'`)
    - Filters are non-functional — values stored but never applied to data
    - _Requirements: 8.7, 8.8, 8.9, 8.10, 8.11_

  - [x] 9.3 Refactor DataTypeStep into DataSourceStep
    - Rename/refactor `src/components/wizard/DataTypeStep.tsx` → `src/components/wizard/DataSourceStep.tsx`
    - Remove connection selector and connector name input (these are now handled by InitialModal)
    - Keep the three ExportDataType radio cards and transactional source sub-selector
    - Add KeyFieldPicker (shown when `transactional_with_contact` is selected and transactionalSource is set)
    - Add FilterSection below the data type selection
    - Wire `enrichmentKeyField` and `filters` to draft updates
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.7, 8.12_

  - [ ]* 9.4 Write unit tests for DataSourceStep and sub-components
    - Test KeyFieldPicker displays explanatory text and customerId option
    - Test FilterSection shows correct filters based on dataType (Property 13 representative examples)
    - Test DataSourceStep shows KeyFieldPicker only for enrichment type
    - Test DataSourceStep shows FilterSection
    - _Requirements: 8.4, 8.5, 8.6, 8.9, 8.10_

- [x] 10. Refactor FieldSelectionStep → FieldMappingStep with DataPreview
  - [x] 10.1 Create DataPreview sub-component
    - Create `src/components/wizard/DataPreview.tsx` with CSS Module
    - Props: `draft: WizardDraft`
    - Generate 3-row sample table from pre-seeded data based on selected fields and their order
    - For enrichments, join transactional records with contacts via `customerId`
    - Project only selected fields in order as table columns
    - Update dynamically when fields or order change
    - Show empty state when no fields selected
    - _Requirements: 9.6, 9.7_

  - [x] 10.2 Refactor FieldSelectionStep into FieldMappingStep
    - Rename/refactor `src/components/wizard/FieldSelectionStep.tsx` → `src/components/wizard/FieldMappingStep.tsx`
    - Keep existing checkbox field selection and drag-to-reorder functionality
    - Add DataPreview panel alongside the field picker
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ]* 10.3 Write unit tests for DataPreview
    - Test preview shows 3 rows when fields are selected
    - Test preview columns match selected fields in order (Property 11 representative example)
    - Test preview updates when field selection changes
    - Test empty state when no fields selected
    - _Requirements: 9.6, 9.7_

- [x] 11. Merge FormatOptionsStep + ScheduleStep → OutputConfigStep
  - [x] 11.1 Create FileNamingInput sub-component
    - Create `src/components/wizard/FileNamingInput.tsx` with CSS Module
    - Props: `value: string`, `onChange: (pattern: string) => void`
    - Text input with clickable token chips: `{connector_name}`, `{date}`, `{timestamp}`
    - Clicking a token inserts it at cursor position in the input
    - _Requirements: 10.6, 10.7_

  - [x] 11.2 Create OutputConfigStep (merging FormatOptions + Schedule)
    - Create `src/components/wizard/OutputConfigStep.tsx` with CSS Module
    - File type selector: CSV, JSON, XML (default: CSV)
    - Format options: delimiter (only visible when fileType is CSV), header row toggle, date format, timezone
    - FileNamingInput for file naming convention (default: `{connector_name}_{date}`)
    - Schedule dropdown with 5 options (every 15 min, hourly, daily, weekly, monthly)
    - Validate schedule selected before proceeding
    - Wire `fileType`, `formatOptions`, `fileNamingPattern`, `schedule` to draft updates
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10_

  - [ ]* 11.3 Write unit tests for OutputConfigStep
    - Test file type selector renders CSV/JSON/XML options
    - Test delimiter is visible for CSV, hidden for JSON/XML (Property 12 representative examples)
    - Test FileNamingInput renders token chips
    - Test schedule dropdown renders 5 options
    - Test defaults: CSV, comma delimiter, header enabled, ISO 8601, UTC, default naming pattern
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.8_

- [x] 12. Update ReviewStep for new fields
  - [x] 12.1 Update ReviewStep to display new configuration fields
    - Update `src/components/wizard/ReviewStep.tsx` to show: file type, file naming pattern, key field (when applicable), filter values
    - Show delimiter only when fileType is CSV
    - Update "Edit" links to navigate to correct steps in the 4-step flow (Step 0: Data Source, Step 1: Field Mapping, Step 2: Output Config, Step 3: Review)
    - _Requirements: 11.1, 11.2_

  - [ ]* 12.2 Write unit tests for updated ReviewStep
    - Test review displays file type, file naming pattern, key field, and filter values (Property 14 representative example)
    - Test edit links navigate to correct step indices
    - _Requirements: 11.1, 11.2_

- [x] 13. Update WizardStepper for 4 steps
  - Update step labels in WizardModal to: "Data Source Selection", "Field Mapping", "Output Configuration", "Review"
  - Ensure stepper renders 4 steps instead of 5
  - _Requirements: 16.1, 16.2, 16.3_

- [x] 14. Checkpoint — Verify full wizard flow works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Update ConnectorDetailPage for new fields
  - [x] 15.1 Update ConnectorDetailPage to display new fields
    - Add file type, file naming pattern, key field (when applicable), and filter values to the detail view in `src/pages/ConnectorDetailPage.tsx`
    - Show delimiter only when fileType is CSV
    - Update edit button to open WizardModal instead of navigating to `/wizard/1?edit=...`
    - _Requirements: 12.1, 12.2_

  - [ ]* 15.2 Write unit tests for updated ConnectorDetailPage
    - Test new fields are displayed
    - Test delimiter shown only for CSV file type
    - _Requirements: 12.1, 12.2_

- [x] 16. Clean up deprecated files
  - Remove or archive `src/pages/WizardPage.tsx`, `src/pages/WizardPage.module.css`, `src/pages/WizardPage.test.tsx`
  - Remove `src/components/wizard/FormatOptionsStep.tsx`, `src/components/wizard/FormatOptionsStep.module.css`
  - Remove `src/components/wizard/ScheduleStep.tsx`, `src/components/wizard/ScheduleStep.module.css`
  - Remove `src/components/wizard/DataTypeStep.module.css` if DataSourceStep uses a new CSS Module
  - Update any remaining imports that reference removed files
  - _Requirements: 7.1_

- [x] 17. Update existing tests for refactored components
  - [x] 17.1 Update ConnectionRow tests
    - Update `src/components/dashboard/ConnectionRow.test.tsx` to test `onAddConnector` callback instead of `<Link>` navigation
    - _Requirements: 5.6_

  - [x] 17.2 Update WizardStepper tests
    - Update `src/components/wizard/WizardStepper.test.tsx` to verify 4 steps instead of 5
    - _Requirements: 16.1_

  - [x] 17.3 Update WizardNavButtons tests
    - Verify `src/components/wizard/WizardNavButtons.test.tsx` still passes (component interface unchanged)
    - _Requirements: 16.1_

  - [x] 17.4 Update ConnectorsContext tests
    - Update `src/contexts/ConnectorsContext.test.tsx` to verify new fields (`fileType`, `fileNamingPattern`, `enrichmentKeyField`, `filters`) are persisted on add and update
    - _Requirements: 10.10, 13.3_

- [x] 18. Checkpoint — Verify all existing and new tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 19. Write property-based tests for updated logic
  - [ ]* 19.1 Write property test for wizard step validation (Property 7)
    - **Property 7: Wizard step validation prevents invalid progression**
    - Generate random incomplete drafts with missing required fields (including new fields: enrichmentKeyField for enrichments, schedule for Step 3)
    - Verify `canProceed` returns false for each step when requirements not met
    - Also generate random empty/whitespace names for InitialModal validation
    - **Validates: Requirements 6.5, 8.2, 9.5, 10.9**

  - [ ]* 19.2 Write property test for delimiter visibility (Property 12)
    - **Property 12: Delimiter visibility depends on file type**
    - Generate random file type values, verify delimiter option visible for CSV, hidden for JSON/XML
    - **Validates: Requirements 10.3, 10.4**

  - [ ]* 19.3 Write property test for filter visibility (Property 13)
    - **Property 13: Non-functional filter visibility depends on data type**
    - Generate random data type values, verify correct filter dropdowns are visible
    - **Validates: Requirements 8.9, 8.10**

  - [ ]* 19.4 Write property test for data preview (Property 11)
    - **Property 11: Data preview reflects selected fields**
    - Generate random non-empty field selections, verify preview produces 3 rows with matching columns
    - **Validates: Requirements 9.6, 9.7**

  - [ ]* 19.5 Write property test for save draft → connector mapping (Property 15)
    - **Property 15: Saving wizard draft creates connector with matching configuration**
    - Generate random complete WizardDrafts (including fileType, fileNamingPattern, enrichmentKeyField, filters), save, verify connector matches
    - **Validates: Requirements 8.11, 10.10, 11.3**

  - [ ]* 19.6 Write property test for edit mode draft population (Property 16)
    - **Property 16: Edit mode populates draft from existing connector**
    - Generate random connectors with new fields, open edit, verify draft matches connector
    - **Validates: Requirements 13.1**

  - [ ]* 19.7 Write property test for edit save preserving identity (Property 17)
    - **Property 17: Saving edit updates connector preserving identity**
    - Generate random connectors and valid config changes, save edit, verify id/createdAt preserved
    - **Validates: Requirements 13.3**

- [x] 20. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster delivery
- This plan assumes all original prototype tasks (1–15 in the previous plan) are complete with 91 passing tests
- The primary structural change is replacing the route-based wizard (`/wizard/:step`) with two modal components (`InitialModal` + `WizardModal`) managed by `DashboardPage` state
- The wizard goes from 5 steps to 4 steps by merging FormatOptions + Schedule into OutputConfigStep
- New data model fields: `fileType`, `fileNamingPattern`, `enrichmentKeyField`, `filters` (with `FilterConfig` and `FileType` types)
- New sub-components: `KeyFieldPicker`, `FilterSection`, `DataPreview`, `FileNamingInput`
- Deprecated files (WizardPage, FormatOptionsStep, ScheduleStep) should be removed after new components are wired
- Property tests reference correctness properties from the updated design document
