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
 * Five branches:
 * 1. No sourceConfig → return null (no-op)
 * 2. selectedFields is empty → populate all fields from sourceConfig
 * 3. Source changed → clear and re-populate with new fields, reset columnRenames
 * 4. Available fields count changed → re-populate (field definitions were updated)
 * 5. Source unchanged, fields non-empty, count matches → return null (preserve existing)
 */
export function populateFieldsForTransition(
  draft: ExporterWizardDraft,
  previousSourceConfig: SourceConfig | null,
): Partial<ExporterWizardDraft> | null {
  const { sourceConfig, selectedFields } = draft;

  // No source config — leave fields unchanged
  if (!sourceConfig) return null;

  const availableFields = getFieldsForSourceConfig(sourceConfig);

  // Fields empty — first visit, populate all
  if (selectedFields.length === 0) {
    return {
      selectedFields: availableFields.map((f) => ({
        key: f.key,
        label: f.label,
        source: f.source as SelectedField['source'],
      })),
    };
  }

  // Source changed — clear and re-populate
  if (didSourceOrSubSourceChange(previousSourceConfig, sourceConfig)) {
    return {
      selectedFields: availableFields.map((f) => ({
        key: f.key,
        label: f.label,
        source: f.source as SelectedField['source'],
      })),
      columnRenames: [],
    };
  }

  // Available fields count changed — field definitions were updated, re-populate
  // This handles cases where the seed data or field config was expanded/reduced
  if (availableFields.length !== selectedFields.length) {
    return {
      selectedFields: availableFields.map((f) => ({
        key: f.key,
        label: f.label,
        source: f.source as SelectedField['source'],
      })),
      columnRenames: [],
    };
  }

  // Source unchanged, fields non-empty, count matches — preserve
  return null;
}
