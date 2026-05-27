# Implementation Plan: Exporter Wizard Rework

## Overview

Rework the existing exporter wizard to support two distinct exporter types (Contact/Transactional and Event-based) with a shared wizard shell, simplified configuration (no join key, no time-of-day scheduling), column renaming, `{timestamp}.csv` file naming, and shared notifications matching the importer pattern. Implementation is sequenced: data models first, then utility functions, then shared components, then step components, then wizard shell integration.

## Tasks

- [x] 1. Define data models and utility functions
  - [x] 1.1 Create `ExporterType`, `EventSource`, `ColumnRename`, `ExporterScheduleConfig`, `ExporterNotificationConfig`, and `ExporterWizardDraft` types in `src/models/wizard.ts`
    - Add `ExporterType = 'contact_transactional' | 'event_based'`
    - Add `EventSource = 'mailout_sends' | 'campaign_events' | 'failed_sends'`
    - Add `ColumnRename` interface with `fieldKey` and `outputName`
    - Add `ExporterScheduleConfig` (frequency, weeklyDays, monthlyDays — no time fields)
    - Add `ExporterNotificationConfig` matching the importer pattern (failureEmails, successEnabled, successEmails, noFileAlertEnabled, noFileAlertEmails, noFileSchedule)
    - Add `ExporterWizardDraft` interface with all fields from design
    - Add `DEFAULT_EXPORTER_DRAFT` constant with `timezone: 'Pacific/Auckland'`
    - Add `EVENT_FIELDS` record mapping each `EventSource` to its predefined `SelectedField[]`
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 4.1, 4.2, 5.1, 8.1, 9.1_

  - [x] 1.2 Create utility functions in `src/utils/exporter-utils.ts`
    - `getFieldsForSources(sources: ExportDataType[]): SelectedField[]` — returns deduplicated union of fields for selected contact/transactional sources
    - `getEventFields(eventSources: EventSource[]): SelectedField[]` — returns deduplicated union of predefined event fields
    - `resolveColumnName(fieldKey: string, renames: ColumnRename[], defaultLabel: string): string` — returns custom name or default
    - `validateColumnName(name: string): { valid: boolean; error?: string }` — rejects empty, whitespace-only, or >128 chars
    - `validateColumnNames(names: string[]): { valid: boolean; duplicates: string[] }` — detects duplicate output names
    - `validatePrefix(prefix: string): boolean` — validates 1–100 chars, `[a-zA-Z0-9_-]` only
    - `resolveTimestamp(date: Date): string` — formats as `YYYYMMDD-HHmmss` in UTC
    - `reorderFields(fields: SelectedField[], fromIndex: number, toIndex: number): SelectedField[]` — moves field preserving set membership
    - _Requirements: 3.3, 3.4, 4.3, 5.1, 5.4, 5.6, 6.1, 6.2, 6.3, 6.5, 6.6, 7.2, 7.3, 7.5_

  - [x] 1.3 Write property tests for `getFieldsForSources`
    - **Property 1: Contact/Transactional field list is the union of selected sources**
    - **Validates: Requirements 3.3**

  - [x] 1.4 Write property tests for `getEventFields`
    - **Property 2: Event field generation produces deduplicated union**
    - **Validates: Requirements 4.3, 5.1, 5.6**

  - [x] 1.5 Write property tests for `reorderFields`
    - **Property 3: Reorder preserves field set membership**
    - **Validates: Requirements 3.4, 5.4**

  - [x] 1.6 Write property tests for event field immutability
    - **Property 4: Event fields are immutable**
    - **Validates: Requirements 5.3**

  - [x] 1.7 Write property tests for `resolveColumnName`
    - **Property 5: Column name resolution**
    - **Validates: Requirements 6.2, 6.3**

  - [x] 1.8 Write property tests for `validateColumnName`
    - **Property 6: Column name validation rejects invalid input**
    - **Validates: Requirements 6.1, 6.5**

  - [x] 1.9 Write property tests for `validateColumnNames`
    - **Property 7: Duplicate column name detection**
    - **Validates: Requirements 6.6**

  - [x] 1.10 Write property tests for `validatePrefix`
    - **Property 8: File naming prefix validation**
    - **Validates: Requirements 7.2, 7.5**

  - [x] 1.11 Write property tests for `resolveTimestamp`
    - **Property 9: Timestamp token resolution format**
    - **Validates: Requirements 7.3**

- [x] 2. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Extract shared NotificationsStep component
  - [x] 3.1 Create `src/components/shared/NotificationsStep.tsx` by extracting the importer's `NotificationsStep` into a reusable component
    - Props: `{ value: ExporterNotificationConfig; onUpdate: (config: ExporterNotificationConfig) => void; onValidChange?: (valid: boolean) => void; teamEmails?: string[] }`
    - Three sections: Failure (always visible, required), Success (toggle + chip input + copy-from-above), No File (toggle + schedule config + chip input + copy-from-above)
    - Failure section validates at least one email before allowing proceed
    - No File section includes frequency selector, starting date, interval, time, and day-of-week/day-of-month pickers matching the importer pattern
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

  - [x] 3.2 Update `src/components/importer/NotificationsStep.tsx` to use the shared component
    - Replace the importer's inline implementation with a thin wrapper around the shared `NotificationsStep`
    - Ensure existing importer behaviour is preserved
    - _Requirements: 10.1_

  - [x] 3.3 Write unit tests for shared NotificationsStep
    - Test failure section always visible with required email validation
    - Test success toggle shows/hides email input
    - Test no-file toggle shows schedule config
    - Test copy-from-above duplicates failure emails
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.7, 10.8_

- [x] 4. Implement TypeSelectionStep
  - [x] 4.1 Create `src/components/wizard/TypeSelectionStep.tsx`
    - Two card options using `CheckboxCard` pattern as radio-style (single select): "Contact/Transactional" and "Event-based"
    - Neither option pre-selected on initial render
    - Props: `{ selectedType: ExporterType | null; onSelect: (type: ExporterType) => void }`
    - Selecting a type calls `onSelect` — parent handles step list update
    - _Requirements: 1.1, 1.4, 1.5_

  - [x] 4.2 Write unit tests for TypeSelectionStep
    - Test renders two options with neither pre-selected
    - Test selecting a type calls onSelect with correct value
    - Test previously selected type is retained on re-render
    - _Requirements: 1.1, 1.4, 1.5_

- [x] 5. Implement EventSourceStep
  - [x] 5.1 Create `src/components/wizard/EventSourceStep.tsx`
    - Displays checkboxes for event sources: "Mailouts from this send", "All event channels from this campaign", "All failed sends from this send"
    - Props: `{ draft: ExporterWizardDraft; onUpdate: (patch: Partial<ExporterWizardDraft>) => void }`
    - Updates `draft.selectedEventSources` on toggle
    - Shows inline validation message when no event source selected
    - _Requirements: 4.1, 4.2, 4.5_

  - [x] 5.2 Write unit tests for EventSourceStep
    - Test renders all three event source options
    - Test toggling updates selectedEventSources
    - Test validation message shown when none selected
    - _Requirements: 4.1, 4.2, 4.5_

- [x] 6. Rework FieldMappingStep with column renaming and event field support
  - [x] 6.1 Rework `src/components/wizard/FieldMappingStep.tsx` to support both exporter types
    - Add inline editable "Output Column" input next to each selected field (max 128 chars)
    - For event-based exports: render predefined event fields as read-only (cannot deselect) with lock icon, but allow reorder and rename
    - Add optional contact fields section below event fields when `draft.exporterType === 'event_based'`
    - Validate: no empty/whitespace column names, no duplicates, max 128 chars — show inline errors
    - Use `draft.columnRenames` to store custom names; reset action clears rename for a field
    - Show read-only join key indicator "Joined by: Email Address" when multiple sources selected (contact/transactional path)
    - _Requirements: 2.4, 3.3, 3.4, 4.3, 4.4, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 6.2 Write unit tests for reworked FieldMappingStep
    - Test read-only styling for event fields (cannot deselect)
    - Test editable rename input appears for all fields
    - Test validation errors for empty, whitespace, >128 char, and duplicate column names
    - Test reset rename action restores default label
    - Test join key indicator shown when multiple sources selected
    - _Requirements: 5.2, 5.3, 6.1, 6.4, 6.5, 6.6_

- [x] 7. Rework OutputConfigStep with timestamp naming and NZ timezone
  - [x] 7.1 Rework `src/components/wizard/OutputConfigStep.tsx`
    - Replace file naming pattern with: editable prefix input (1–100 chars, `[a-zA-Z0-9_-]`) + fixed suffix `{timestamp}.csv`
    - Add live preview that resolves `{timestamp}` to current UTC `YYYYMMDD-HHmmss` and updates as prefix changes
    - Change default timezone from `UTC` to `Pacific/Auckland`
    - Add timezone selector with all valid IANA timezone identifiers
    - Validate prefix: show inline error if empty or invalid characters
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3_

  - [x] 7.2 Write unit tests for reworked OutputConfigStep
    - Test default timezone is Pacific/Auckland
    - Test live preview updates as prefix changes
    - Test validation error for invalid prefix characters
    - Test timestamp resolves to YYYYMMDD-HHmmss format
    - _Requirements: 7.2, 7.4, 7.5, 8.1_

- [x] 8. Implement ScheduleStep (extracted from DeliveryStep)
  - [x] 8.1 Create `src/components/wizard/ScheduleStep.tsx`
    - Frequency selector: hourly, daily, weekly, monthly (segmented control)
    - Weekly: day-of-week picker (Mon–Sun, at least one required)
    - Monthly: day-of-month selector (1–28, at least one required)
    - **No time-of-day input** — system assigns execution time
    - Props: `{ draft: ExporterWizardDraft; onUpdate: (patch: Partial<ExporterWizardDraft>) => void }`
    - Updates `draft.schedule` (ExporterScheduleConfig)
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 8.2 Write unit tests for ScheduleStep
    - Test does not render time-of-day input
    - Test weekly shows day-of-week picker
    - Test monthly shows day-of-month selector (1–28)
    - Test validation: weekly with no days prevents proceed
    - Test validation: monthly with no days prevents proceed
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 9. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Rework DataSourceStep (remove join key input)
  - [x] 10.1 Rework `src/components/wizard/DataSourceStep.tsx`
    - Remove the join key `ChipInput` and `JOIN_KEY_OPTIONS` entirely
    - When multiple sources selected, show read-only text: "Joined by: Email Address"
    - Remove `enrichmentKeyField` from draft updates
    - Keep existing source selection, transactional sub-source, and filter builder unchanged
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2_

  - [x] 10.2 Write unit tests for reworked DataSourceStep
    - Test join key input is not rendered
    - Test read-only "Joined by: Email Address" shown when multiple sources selected
    - Test existing source selection still works
    - _Requirements: 2.1, 2.2, 2.4_

- [x] 11. Rework WizardModal with dynamic steps and type selection
  - [x] 11.1 Rework `src/components/wizard/WizardModal.tsx` to support the new wizard flow
    - Step 0 is always `TypeSelectionStep`
    - Step array is dynamic based on `draft.exporterType`:
      - Contact/Transactional: Type → Data Source → Field Mapping → File Config → Schedule → Notifications → Review
      - Event-based: Type → Event Source → Field Mapping → File Config → Schedule → Notifications → Review
    - Update `canProceed` validation for each new step structure
    - Use `ExporterWizardDraft` instead of `WizardDraft`
    - Create `createDefaultExporterDraft()` using `DEFAULT_EXPORTER_DRAFT`
    - Handle type change: reset type-specific state (selectedSources, selectedEventSources, selectedFields, columnRenames) while preserving shared state
    - Wire `NotificationsStep` (shared) into step 5
    - Wire `ScheduleStep` into step 4
    - Update stepper labels dynamically based on selected type
    - Update edit mode to hydrate `ExporterWizardDraft` from existing automation, overriding legacy join key
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.5, 9.5, 9.6_

  - [x] 11.2 Write unit tests for reworked WizardModal
    - Test step list changes based on exporter type selection
    - Test canProceed returns false for each validation edge case per step
    - Test type change resets type-specific state but preserves shared state
    - Test edit mode hydrates draft correctly
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 12. Rework ReviewStep to reflect new wizard structure
  - [x] 12.1 Rework `src/components/wizard/ReviewStep.tsx`
    - Display exporter type selection
    - Show selected sources (contact/transactional) or event sources (event-based)
    - Show field list with resolved output column names (including renames)
    - Show file naming preview (prefix + timestamp.csv)
    - Show schedule configuration (frequency + days, no time)
    - Show notification configuration summary
    - Show read-only join key indicator when applicable
    - Each section has an "Edit" link that navigates to the corresponding step
    - _Requirements: 1.2, 1.3, 3.4, 6.3, 7.4, 9.1_

  - [x] 12.2 Write unit tests for reworked ReviewStep
    - Test displays correct summary for contact/transactional path
    - Test displays correct summary for event-based path
    - Test edit links navigate to correct steps
    - _Requirements: 1.2, 1.3_

- [x] 13. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using fast-check
- Unit tests validate specific examples and edge cases using Vitest
- The shared `NotificationsStep` extraction (task 3) enables reuse across importer and exporter wizards
- The existing `DeliveryStep` is not deleted — it remains for the current wizard until migration is complete

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3", "1.4", "1.5", "1.6", "1.7", "1.8", "1.9", "1.10", "1.11"] },
    { "id": 3, "tasks": ["3.1", "4.1", "5.1", "10.1"] },
    { "id": 4, "tasks": ["3.2", "3.3", "4.2", "5.2", "10.2"] },
    { "id": 5, "tasks": ["6.1", "7.1", "8.1"] },
    { "id": 6, "tasks": ["6.2", "7.2", "8.2"] },
    { "id": 7, "tasks": ["11.1", "12.1"] },
    { "id": 8, "tasks": ["11.2", "12.2"] }
  ]
}
```
