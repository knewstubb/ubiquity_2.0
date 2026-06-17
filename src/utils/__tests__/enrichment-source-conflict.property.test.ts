// Feature: enrichment-field-selection, Property 5: Primary source conflict clears enrichment
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  resetDownstreamOnSourceChange,
  getFieldsForSourceConfig,
  getAvailableEnrichments,
  createDefaultEnrichmentConfig,
} from '../source-config-utils';
import { didSourceOrSubSourceChange } from '../populate-fields';
import type {
  PrimarySourceType,
  SourceConfig,
  EnrichmentConfig,
  EnrichmentEntity,
  ContactsSourceConfig,
  TransactionsSourceConfig,
  MessagesSourceConfig,
  Channel,
} from '../../models/source-selection';

// ─── Types mirroring the component types ─────────────────────────────────────

interface SelectedField {
  key: string;
  label: string;
  source: string;
}

interface ColumnRename {
  fieldKey: string;
  outputName: string;
}

// ─── Simulate handleDraftUpdate source change logic (from WizardModal) ───────

/**
 * Simulates the full source change flow:
 * 1. resetDownstreamOnSourceChange produces a new config with enrichment: null
 * 2. didSourceOrSubSourceChange detects the change
 * 3. handleDraftUpdate clears selectedFields and columnRenames
 */
function simulateSourceChange(
  oldConfig: SourceConfig,
  newPrimarySource: PrimarySourceType,
  selectedFields: SelectedField[],
  columnRenames: ColumnRename[],
): { newConfig: SourceConfig; selectedFields: SelectedField[]; columnRenames: ColumnRename[] } {
  const newConfig = resetDownstreamOnSourceChange(oldConfig, newPrimarySource);

  if (didSourceOrSubSourceChange(oldConfig, newConfig)) {
    // Primary source changed — clear all field selections (mirrors WizardModal logic)
    return { newConfig, selectedFields: [], columnRenames: [] };
  }

  // Should not happen in this test (primary source always changes), but handle gracefully
  return { newConfig, selectedFields, columnRenames };
}

// ─── Generators ──────────────────────────────────────────────────────────────

const primarySourceArb = fc.constantFrom<PrimarySourceType>('contacts', 'transactions', 'messages');
const channelArb = fc.constantFrom<Channel>('email', 'sms', 'push');
const enrichmentEntityArb = fc.constantFrom<EnrichmentEntity>('contacts', 'transactions', 'messages');

/**
 * Generates a SourceConfig with an enrichment entity that matches a given target.
 * This creates the precondition: enrichment entity === target primary source.
 */
function sourceConfigWithEnrichmentMatching(
  targetPrimarySource: PrimarySourceType,
): fc.Arbitrary<SourceConfig> {
  // The current primary source must be different from the target (so source will change)
  const allSources: PrimarySourceType[] = ['contacts', 'transactions', 'messages'];
  const currentPrimarySources = allSources.filter((s) => s !== targetPrimarySource);

  return fc.constantFrom(...currentPrimarySources).chain((currentPrimary) => {
    // The enrichment entity matches the targetPrimarySource (creating the conflict)
    const enrichment = createDefaultEnrichmentConfig(targetPrimarySource as EnrichmentEntity);

    switch (currentPrimary) {
      case 'contacts':
        return fc.constant<ContactsSourceConfig>({
          primarySource: 'contacts',
          filter: { type: 'field_filter', fieldFilters: [{ field: '', operator: '', value: '' }] },
          enrichment,
        });

      case 'transactions':
        return fc.constant<TransactionsSourceConfig>({
          primarySource: 'transactions',
          tableId: 'table-1',
          filter: { type: 'all' },
          enrichment,
        });

      case 'messages':
        return fc.array(channelArb, { minLength: 0, maxLength: 3 }).map(
          (channels): MessagesSourceConfig => ({
            primarySource: 'messages',
            channels: [...new Set(channels)],
            filter: { type: 'field_filter', fieldFilters: [{ field: '', operator: '', value: '' }] },
            enrichment,
          }),
        );

      default:
        return fc.constant<ContactsSourceConfig>({
          primarySource: 'contacts',
          filter: { type: 'field_filter', fieldFilters: [{ field: '', operator: '', value: '' }] },
          enrichment,
        });
    }
  });
}

/**
 * Generates selectedFields that include fields from both primary source and enrichment entity.
 */
function selectedFieldsWithEnrichment(config: SourceConfig): fc.Arbitrary<SelectedField[]> {
  const allFields = getFieldsForSourceConfig(config);
  // Return a random non-empty subset of all available fields
  return fc.shuffledSubarray(allFields, { minLength: 1, maxLength: allFields.length }).map(
    (fields) =>
      fields.map((f) => ({
        key: f.key,
        label: f.label,
        source: f.source,
      })),
  );
}

/**
 * Generates columnRenames based on selected fields.
 */
function columnRenamesForFields(fields: SelectedField[]): fc.Arbitrary<ColumnRename[]> {
  if (fields.length === 0) return fc.constant([]);
  return fc.shuffledSubarray(fields, { minLength: 0, maxLength: Math.min(fields.length, 5) }).map(
    (subset) =>
      subset.map((f) => ({
        fieldKey: f.key,
        outputName: `renamed_${f.key}`,
      })),
  );
}

// ─── Property Tests ──────────────────────────────────────────────────────────

/**
 * Property 5: Primary source conflict clears enrichment
 * **Validates: Requirements 4.3**
 */
describe('Feature: enrichment-field-selection, Property 5: Primary source conflict clears enrichment', () => {
  it('resetDownstreamOnSourceChange always sets enrichment to null for any new primary source', () => {
    fc.assert(
      fc.property(primarySourceArb, primarySourceArb, (currentPrimary, newPrimary) => {
        // Create a config with any enrichment set
        const available = getAvailableEnrichments(currentPrimary);
        const enrichment = createDefaultEnrichmentConfig(available[0]);

        let config: SourceConfig;
        switch (currentPrimary) {
          case 'contacts':
            config = {
              primarySource: 'contacts',
              filter: { type: 'field_filter', fieldFilters: [{ field: '', operator: '', value: '' }] },
              enrichment,
            };
            break;
          case 'transactions':
            config = {
              primarySource: 'transactions',
              tableId: 'table-1',
              filter: { type: 'all' },
              enrichment,
            };
            break;
          case 'messages':
            config = {
              primarySource: 'messages',
              channels: ['email'],
              filter: { type: 'field_filter', fieldFilters: [{ field: '', operator: '', value: '' }] },
              enrichment,
            };
            break;
        }

        const result = resetDownstreamOnSourceChange(config, newPrimary);

        // resetDownstreamOnSourceChange ALWAYS produces enrichment: null
        expect(result.enrichment).toBeNull();
        expect(result.primarySource).toBe(newPrimary);
      }),
      { numRuns: 100 },
    );
  });

  it('when enrichment entity matches new primary source, source change clears selectedFields and columnRenames', () => {
    fc.assert(
      fc.property(
        primarySourceArb.chain((targetPrimary) =>
          sourceConfigWithEnrichmentMatching(targetPrimary).map((config) => ({
            config,
            targetPrimary,
          })),
        ),
        ({ config, targetPrimary }) => {
          // Precondition: enrichment entity === the new primary source (conflict)
          expect(config.enrichment).not.toBeNull();
          expect(config.enrichment!.entity).toBe(targetPrimary);
          expect(config.primarySource).not.toBe(targetPrimary);

          // Get fields representing current state (includes enrichment fields)
          const allFields = getFieldsForSourceConfig(config);
          const selectedFields: SelectedField[] = allFields.map((f) => ({
            key: f.key,
            label: f.label,
            source: f.source,
          }));
          const columnRenames: ColumnRename[] = selectedFields.slice(0, 3).map((f) => ({
            fieldKey: f.key,
            outputName: `custom_${f.key}`,
          }));

          // Verify we have enrichment fields in selectedFields before the change
          const enrichmentFieldsBefore = selectedFields.filter(
            (f) => f.key.startsWith('enrichment_'),
          );
          expect(enrichmentFieldsBefore.length).toBeGreaterThan(0);

          // Apply the source change
          const result = simulateSourceChange(config, targetPrimary, selectedFields, columnRenames);

          // After source change: enrichment is cleared
          expect(result.newConfig.enrichment).toBeNull();

          // After source change: selectedFields is cleared (no enrichment fields remain)
          expect(result.selectedFields).toEqual([]);

          // After source change: columnRenames is cleared
          expect(result.columnRenames).toEqual([]);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('source change to conflicting entity removes all fields belonging to the old enrichment entity', () => {
    fc.assert(
      fc.property(
        primarySourceArb.chain((targetPrimary) =>
          sourceConfigWithEnrichmentMatching(targetPrimary).chain((config) =>
            selectedFieldsWithEnrichment(config).chain((fields) =>
              columnRenamesForFields(fields).map((renames) => ({
                config,
                targetPrimary,
                selectedFields: fields,
                columnRenames: renames,
              })),
            ),
          ),
        ),
        ({ config, targetPrimary, selectedFields, columnRenames }) => {
          // Precondition: config has enrichment that conflicts with new primary
          expect(config.enrichment!.entity).toBe(targetPrimary);

          // Apply source change
          const result = simulateSourceChange(
            config,
            targetPrimary,
            selectedFields,
            columnRenames,
          );

          // The new config should have enrichment cleared
          expect(result.newConfig.enrichment).toBeNull();

          // Since primary source changed, ALL fields are cleared (not just enrichment ones)
          // This is correct behaviour: didSourceOrSubSourceChange returns true → full reset
          expect(result.selectedFields).toEqual([]);
          expect(result.columnRenames).toEqual([]);

          // No fields from the conflicting enrichment entity remain
          const conflictEntityFields = result.selectedFields.filter(
            (f) => f.source === targetPrimary,
          );
          expect(conflictEntityFields).toEqual([]);
        },
      ),
      { numRuns: 100 },
    );
  });
});
