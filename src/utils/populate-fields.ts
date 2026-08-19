import type { SourceConfig } from '../models/source-selection';
import type { SelectedField } from '../models/automation';
import type { ExporterWizardDraft } from '../models/wizard';
import { getFieldsForSourceConfig } from './source-config-utils';

/**
 * Returns true when the primary source type or sub-source (tableId/channel) has changed,
 * meaning the available field set has changed and field selections must be cleared.
 */
export function didSourceOrSubSourceChange(
  oldConfig: SourceConfig | null,
  newConfig: SourceConfig | null,
): boolean {
  if (!oldConfig || !newConfig) return true;
  if (oldConfig.primarySource !== newConfig.primarySource) return true;
  if (oldConfig.primarySource === 'transactions' && newConfig.primarySource === 'transactions') {
    return oldConfig.tableId !== newConfig.tableId;
  }
  if (oldConfig.primarySource === 'messages' && newConfig.primarySource === 'messages') {
    return JSON.stringify(oldConfig.channels) !== JSON.stringify(newConfig.channels);
  }
  return false;
}

/**
 * Pure function that determines what draft patches (if any) should be applied
 * when transitioning from the Data Source step to the Field Mapping step.
 *
 * Branches:
 * 1. No sourceConfig → return null (no-op)
 * 2. New exporter (isEdit=false) with empty fields → return null (start deselected)
 * 3. Edit mode with empty fields → populate all (backward compat for legacy data)
 * 4. Source changed → clear selections (user must re-select)
 * 5. Available fields count changed on edit → re-sync to new field definitions
 * 6. Source unchanged, fields non-empty, count matches → preserve existing
 */
export function populateFieldsForTransition(
  draft: ExporterWizardDraft,
  previousSourceConfig: SourceConfig | null,
  isEdit: boolean = false,
): Partial<ExporterWizardDraft> | null {
  const { sourceConfig, selectedFields } = draft;

  // No source config — leave fields unchanged
  if (!sourceConfig) return null;

  const availableFields = getFieldsForSourceConfig(sourceConfig);

  // Fields empty
  if (selectedFields.length === 0) {
    // New exporter — start with all fields deselected
    if (!isEdit) {
      return null;
    }
    // Edit mode with empty fields (legacy data) — populate all for backward compat
    return {
      selectedFields: availableFields.map((f) => ({
        key: f.key,
        label: f.label,
        source: f.source as SelectedField['source'],
      })),
    };
  }

  // Source changed — clear selections, user must re-select
  if (didSourceOrSubSourceChange(previousSourceConfig, sourceConfig)) {
    return {
      selectedFields: [],
      columnRenames: [],
    };
  }

  // Edit mode: available fields count changed — field definitions were updated, re-sync
  // This handles cases where the seed data or field config was expanded/reduced
  if (isEdit && availableFields.length !== selectedFields.length) {
    return {
      selectedFields: availableFields.map((f) => ({
        key: f.key,
        label: f.label,
        source: f.source as SelectedField['source'],
      })),
      columnRenames: [],
    };
  }

  // Source unchanged, fields non-empty — preserve existing
  return null;
}
