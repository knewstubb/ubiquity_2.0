# Integrations Feature Walkthrough

## Feature Summary

The Integrations page (`/`, `DashboardPage.tsx`) is the central hub for managing data connections and automations (importers and exporters). Users create connections to external systems (AWS S3, Azure Blob, SFTP), then attach automations to those connections that move data in or out of UbiQuity on a schedule. The page displays connections as expandable rows, each containing automation cards. Supporting flows include a create/edit connection modal, an initial automation type selector, an importer wizard (5-7 steps depending on data type), an exporter wizard (5 steps), an automation settings read-only modal, and delete confirmation dialogs for both connections and automations. Data is filtered by the currently selected account.

---

## What Works

- Connection rows expand/collapse correctly with chevron animation and keyboard support (Enter/Space)
- Account-level filtering: `filteredConnections` correctly filters by `selectedAccountId` from `AccountContext`
- Connection error state is visually distinct (red styling) and disables the "+ Add Automation" button with a tooltip explanation
- Automation toggle (active/paused) works via `ConnectorsContext.toggleConnectorStatus` and persists to localStorage
- Meatball menu on ConnectionRow correctly offers Edit Connection and Delete Connection, with Delete disabled when automations exist
- Meatball menu on ConnectorCard uses `createPortal` to render to `document.body`, avoiding overflow clipping issues
- ConnectorCard shows direction icon (import/export), data type label, last run status badge, and last run time
- InitialModal correctly gates on both name and direction selection before enabling "Next"
- Importer wizard dynamically adjusts its step list based on data type selection (contact: 5 steps, transactional: 5 steps, both: 7 steps) and clamps the current step when the step count changes
- FileSettingsStep shows/hides fields correctly per path mode (Automatic/Base/Custom) and per data type
- ImportConfigStep has working radio groups for update type and blank value handling, with blank values conditionally hidden when update type is "Append"
- ImportMappingStep has working duplicate detection with warning icons and tooltips, and supports the `[[Ignore Field]]` option
- NotificationsStep has a fully interactive scheduling UI with frequency-dependent fields (weekly day picker, monthly day/date pattern)
- Exporter wizard (WizardModal) has a complete 5-step flow with per-step validation and dirty-state tracking
- Both wizards have discard confirmation dialogs when closing with unsaved changes
- DeleteConfirmModal requires typing "ACCEPT" before the delete button enables -- good safety pattern
- Edit Connection flow has a warning interstitial before opening the edit modal
- Empty state when no connections exist includes a requirements popover with practical guidance
- Escape key handling is implemented on all modals
- Backdrop click-to-close is implemented on all modals
- Accessibility: ARIA roles, labels, and keyboard handlers are present on interactive elements

---

## Gaps Found

### Missing UI

1. **No page subtitle or summary counts.** The page header audit (`docs/page-header-audit.md`) specifies the production Integrations header should show a subtitle like "4 connections / 12 automations". Currently only the title "Integrations" and the "New Connection" button are rendered. No search, status filter, or direction filter either (all listed as production requirements in the audit).

2. **No loading state.** When data loads from Supabase or localStorage, there is no skeleton, spinner, or loading indicator. The page either renders the full list or the empty state instantly. If Supabase is slow, the user would see a flash of empty state before data appears.

3. **ConnectorDetailPage (`/connector/:id`) is broken.** The page references `connector.filters.dateRange` and `connector.filters.membershipTier` (lines ~180-195), but the `Connector` model defines `filters` as a `FilterGroup` (from `segment.ts`) which has `combinator`, `rules`, and `groups` -- not `dateRange` or `membershipTier`. It also passes `connectorName` to `DeleteConfirmModal` but that component expects `objectName` and `objectType`. This page would crash at runtime.

4. **No "Activity Log" or "History" views.** The ConnectorCard meatball menu has "Activity Log" and "History" buttons that close the menu but do nothing (`onClick` just calls `setMenuOpen(false)` with no handler). These are dead-end interactions.

5. **Importer wizard Review step is fully hardcoded.** `ImporterReviewStep.tsx` renders static placeholder data ("onboarding-2026", "sample-contacts.csv", "Email, Customer ID") regardless of what the user configured in previous steps. The "Edit" buttons on each section do nothing.

6. **ContactConfigStep and TransactionalConfigStep are unused placeholders.** The files exist (`ContactConfigStep.tsx`, `TransactionalConfigStep.tsx`, `ContactMappingStep.tsx`, `TransactionalMappingStep.tsx`) but show "Coming Soon" text. The wizard actually uses `ImportConfigStep` and `ImportMappingStep` with a `type` prop instead, which is the correct approach. The placeholder files are dead code.

### Missing Data

7. **All seed connectors are importers.** Every entry in `src/data/connectors.ts` has `direction: 'import'`. There are no export automations in the seed data. This means the exporter wizard flow and the exporter icon on ConnectorCard cannot be demonstrated without manually creating one. For a demo, at least 1-2 exporters should exist in seed data.

8. **`selectedFields` is always empty in seed data.** Every connector in `src/data/connectors.ts` has `selectedFields: []`. The AutomationSettingsModal does not display selected fields, but the ConnectorDetailPage does (showing "No fields selected"). This makes the detail page look incomplete.

### Missing Interaction

9. **Importer save is a no-op.** In `DashboardPage.tsx`, `handleImporterSave` receives the `ImporterConfig` but does nothing with it (comment says "Prototype: just close the modal"). The importer wizard completes but no automation is added to the list. By contrast, the exporter wizard's `handleWizardSave` correctly calls `addConnector(draft)`. This means the entire importer wizard flow dead-ends -- a user completes 5-7 steps and nothing appears.

10. **Delete connection is a no-op.** The `pendingDeleteConnectionId` flow shows the `DeleteConfirmModal` but `onConfirm` just closes the modal (`setPendingDeleteConnectionId(null)`). The connection is not removed from state. The `ConnectionsContext` does not expose a `deleteConnection` method.

11. **Edit connection uses `addConnection` instead of an update method.** When editing a connection, `DashboardPage` calls `addConnection(connection)` which appends a new connection rather than replacing the existing one. The `ConnectionsContext` only exposes `addConnection`, not `updateConnection`. This would result in a duplicate connection appearing in the list.

12. **New connection has no `accountId`.** `CreateConnectionModal.handleCreate` sets `accountId: editConnection?.accountId ?? ''`. For new connections, this means `accountId` is an empty string. Since `DashboardPage` filters by `selectedAccountId`, the new connection would not appear in the filtered list after creation.

13. **"+ Add New Field" button in ImportMappingStep does nothing.** The button at the bottom of the mapping table has no `onClick` handler.

14. **Sample file upload is non-functional.** The dropzone in `FileSettingsStep` is a visual placeholder with no file input, drag-and-drop handler, or upload logic.

### Missing Validation

15. **Connection name has no duplicate check.** Users can create multiple connections with the same name. No validation or warning is shown.

16. **CreateConnectionModal step 2 has no field validation.** The "Create Connection" button is always enabled on step 2 regardless of whether required fields (bucket name, hostname, SAS token, etc.) are filled in. A user can create a connection with all empty credential fields.

17. **InitialModal automation name has no length limit or character validation.** Any string is accepted, including very long names or special characters that could break layout.

18. **FileSettingsStep folder name has no uniqueness validation.** The label says "This must be unique" but there is no check against existing folder names.

19. **No validation on the "Test Connection" result before allowing creation.** The user can skip the test entirely and create a connection. The test always succeeds after 1.5 seconds regardless of input.

### Missing Empty State

20. **No empty state for a connection with zero automations when expanded.** When a connection row is expanded and has no automations, only the "+ Add Automation" dashed button is shown. There is no explanatory text like "No automations yet. Create one to start importing or exporting data."

### Inconsistency

21. **OverflowMenu component is unused.** `src/components/dashboard/OverflowMenu.tsx` exists as a reusable meatball menu component, but both `ConnectionRow` and `ConnectorCard` implement their own inline menu logic. The OverflowMenu component is dead code.

22. **ConnectorCard `onEdit` opens AutomationSettingsModal, not the edit wizard.** The prop is named `onEdit` but it opens a read-only settings view. The actual edit wizard is triggered by `onEditWizard`. This naming is confusing -- `onEdit` suggests editing, but it is the "view settings" action. The ConnectorCard's `onClick` (clicking the card body) also calls `onEdit()`, meaning clicking anywhere on the card opens the settings modal, not the edit wizard.

23. **Data type labels are inconsistent between components.** `ConnectorCard` maps `transactional` to `"transactional_sales"` and `transactional_with_contact` to `"transactional_with_contact"`. `AutomationSettingsModal` maps them to `"Transactional"` and `"Transactional + Contact"`. The ConnectorCard labels look like raw database values rather than display labels.

24. **`getLastRunTime` in ConnectorCard is hardcoded.** It always returns `"2-minutes ago"` (with a typo -- should be "2 minutes ago"). This is not derived from any data.

25. **Importer wizard config steps are local-only.** `ImportConfigStep` and `ImportMappingStep` manage their own local state (useState) and do not call `onUpdate` to propagate changes back to the wizard's `ImporterConfig`. The wizard's config object never receives the user's configuration or mapping choices. Even if save were implemented, the saved config would be empty.

26. **NotificationsStep is also local-only.** Same issue as above -- all notification settings are managed in local state and never propagated to the parent wizard config.

---

## Recommendations

### Quick Fixes (< 1 hour each)

1. **Fix `accountId` on new connections.** In `CreateConnectionModal.handleCreate`, set `accountId` to the current `selectedAccountId` from `AccountContext` instead of empty string. This is a one-line fix that makes the create flow actually work.

2. **Fix data type labels in ConnectorCard.** Change the `DATA_TYPE_LABELS` map to use proper display labels: `contact` -> `"Contacts"`, `transactional` -> `"Transactional"`, `transactional_with_contact` -> `"Transactional + Contact"`.

3. **Fix the "2-minutes ago" typo.** Change to "2 minutes ago" in `ConnectorCard.getLastRunTime`.

4. **Add 1-2 export automations to seed data** so the exporter direction icon and flow can be demonstrated.

5. **Rename `onEdit` to `onViewSettings` in ConnectorCard** (or `onSettings`) to clarify intent. Keep `onEditWizard` as `onEdit`.

6. **Delete the unused placeholder files** (`ContactConfigStep.tsx`, `TransactionalConfigStep.tsx`, `ContactMappingStep.tsx`, `TransactionalMappingStep.tsx`, `OverflowMenu.tsx`) to reduce confusion.

7. **Add a subtitle to the page header** showing connection and automation counts (e.g., "4 connections / 12 automations") per the page header audit.

### Needs Work (1-4 hours each)

8. **Wire up importer save.** Make `handleImporterSave` in `DashboardPage` create a `Connector` record (similar to how the exporter does it via `addConnector`) so the importer wizard produces a visible result.

9. **Add `updateConnection` and `deleteConnection` to ConnectionsContext.** The edit and delete flows currently have no backing state operations. Add these methods and wire them into the DashboardPage handlers.

10. **Propagate importer step state to the wizard config.** Pass `onUpdate` callbacks into `ImportConfigStep`, `ImportMappingStep`, and `NotificationsStep` so their selections are captured in the `ImporterConfig` object. This is required before the Review step can show real data.

11. **Make the Review step dynamic.** Replace the hardcoded values in `ImporterReviewStep` with data from the `ImporterConfig` passed as a prop. Wire the "Edit" buttons to navigate back to the relevant step.

12. **Add field validation to CreateConnectionModal step 2.** Disable the "Create Connection" button until required fields for the selected protocol are filled in (e.g., bucket name for S3, hostname for SFTP, container name for Azure Blob).

13. **Fix ConnectorDetailPage.** Update the filters section to use the actual `FilterGroup` shape (`combinator`, `rules`, `groups`) instead of the non-existent `dateRange`/`membershipTier` properties. Fix the `DeleteConfirmModal` props to use `objectType`/`objectName`.

### Larger Effort (4+ hours)

14. **Add search and filter controls to the page header.** The production spec calls for search by name, status filter (Active/Error/All), and direction filter (Import/Export). This would require a filter bar component and filtering logic in the page.

15. **Implement the sample file upload flow.** The FileSettingsStep dropzone needs a file input, drag-and-drop handling, and parsing logic to extract column headers for the mapping step.

---

## Questions for PO

1. **Should the importer wizard produce a visible automation in the list for the prototype?** Currently it is a no-op. If yes, what minimal fields should be persisted? The exporter wizard creates a full `Connector` record -- should the importer do the same?

2. **What should "Activity Log" and "History" show when clicked on a ConnectorCard?** Should these be placeholder pages, modals, or should the buttons be hidden until the feature is built?

3. **Should the ConnectorDetailPage (`/connector/:id`) be part of the demo flow?** It is currently broken and not linked from the main page (no navigation leads there). If it is not needed, it could be removed to avoid confusion. If it is needed, it requires fixes.

4. **For the empty state when a connection has zero automations, should there be explanatory text or just the "+ Add Automation" button?** Other features in the prototype (e.g., Campaigns) show descriptive empty states.

5. **Should the "Test Connection" step be required before creating a connection, or remain optional?** Currently it can be skipped entirely, which means a connection can be created with invalid credentials.

6. **Is the edit connection warning interstitial ("Changes to a connection may affect all linked automations") the desired UX, or should editing just open the modal directly?** The warning adds friction that may not be needed in a prototype context.
