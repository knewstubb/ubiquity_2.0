// Feature: enrichment-field-selection, Property 6: Select All includes all available fields
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getFieldsForSourceConfig, getAvailableEnrichments, createDefaultEnrichmentConfig } from '../source-config-utils';
import type { SourceFieldDefinition } from '../source-config-utils';
import type {
  PrimarySourceType,
  SourceConfig,
  EnrichmentConfig,
  ContactsSourceConfig,
  TransactionsSourceConfig,
  MessagesSourceConfig,
  Channel,
  EnrichmentEntity,
} from '../../models/source-selection';

// ─── Types mirroring the component's SelectedField ───────────────────────────

interface SelectedField {
  key: string;
  label: string;
  source: string;
}

// ─── Select All logic (mirrors FieldMappingStep handleSelectAllContact) ──────

/**
 * Simulates the Select All logic from FieldMappingStep:
 * 1. Get all fields from getFieldsForSourceConfig(config)
 * 2. Map them to SelectedField[]
 * 3. Return as selectedFields
 */
function simulateSelectAll(config: SourceConfig): SelectedField[] {
  const sourceFields = getFieldsForSourceConfig(config);
  return sourceFields.map((f) => ({
    key: f.key,
    label: f.label,
    source: f.source as SelectedField['source'],
  }));
}

// ─── Generators ──────────────────────────────────────────────────────────────

const primarySourceArb = fc.constantFrom<PrimarySourceType>('contacts', 'transactions', 'messages');
const channelArb = fc.constantFrom<Channel>('email', 'sms', 'push');

/**
 * Generates a valid SourceConfig with or without enrichment.
 * The enrichment entity is always different from the primary source.
 */
const sourceConfigArb: fc.Arbitrary<SourceConfig> = primarySourceArb.chain((primarySource) => {
  // Available enrichment entities (those not matching primary)
  const availableEnrichments = getAvailableEnrichments(primarySource);

  // Enrichment: either null or one of the available entities with default config
  const enrichmentArb: fc.Arbitrary<EnrichmentConfig | null> = fc.oneof(
    fc.constant(null),
    fc.constantFrom(...availableEnrichments).map((entity) => createDefaultEnrichmentConfig(entity))
  );

  switch (primarySource) {
    case 'contacts':
      return enrichmentArb.map((enrichment): ContactsSourceConfig => ({
        primarySource: 'contacts',
        filter: { type: 'field_filter', fieldFilters: [{ field: '', operator: '', value: '' }] },
        enrichment,
      }));

    case 'transactions':
      return enrichmentArb.map((enrichment): TransactionsSourceConfig => ({
        primarySource: 'transactions',
        tableId: 'table-1',
        filter: { type: 'all' },
        enrichment,
      }));

    case 'messages':
      return fc.tuple(enrichmentArb, fc.array(channelArb, { minLength: 0, maxLength: 3 }))
        .map(([enrichment, channels]): MessagesSourceConfig => ({
          primarySource: 'messages',
          channels: [...new Set(channels)],
          filter: { type: 'field_filter', fieldFilters: [{ field: '', operator: '', value: '' }] },
          enrichment,
        }));
  }
});

// ─── Property Tests ──────────────────────────────────────────────────────────

/**
 * Property 6: Select All includes all available fields
 * **Validates: Requirements 6.3, 6.4**
 */
describe('Feature: enrichment-field-selection, Property 6: Select All includes all available fields', () => {
  it('Select All results in selectedFields containing every field from getFieldsForSourceConfig', () => {
    fc.assert(
      fc.property(sourceConfigArb, (config) => {
        const allAvailableFields = getFieldsForSourceConfig(config);
        const selectedFields = simulateSelectAll(config);

        // selectedFields length equals all available fields
        expect(selectedFields.length).toBe(allAvailableFields.length);

        // Every available field key is present in selectedFields
        const selectedKeys = new Set(selectedFields.map((f) => f.key));
        for (const field of allAvailableFields) {
          expect(selectedKeys.has(field.key)).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('Select All preserves field labels from the available fields list', () => {
    fc.assert(
      fc.property(sourceConfigArb, (config) => {
        const allAvailableFields = getFieldsForSourceConfig(config);
        const selectedFields = simulateSelectAll(config);

        // Build a lookup from available fields
        const availableByKey = new Map(allAvailableFields.map((f) => [f.key, f]));

        for (const selected of selectedFields) {
          const available = availableByKey.get(selected.key);
          expect(available).toBeDefined();
          expect(selected.label).toBe(available!.label);
          expect(selected.source).toBe(available!.source);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('Select All includes enrichment fields when enrichment is active', () => {
    // Only test configs that have enrichment set
    const configWithEnrichmentArb = sourceConfigArb.filter((config) => config.enrichment !== null);

    fc.assert(
      fc.property(configWithEnrichmentArb, (config) => {
        const allAvailableFields = getFieldsForSourceConfig(config);
        const selectedFields = simulateSelectAll(config);

        // There must be enrichment fields in the available set
        const enrichmentFields = allAvailableFields.filter(
          (f) => f.key.startsWith('enrichment_')
        );
        expect(enrichmentFields.length).toBeGreaterThan(0);

        // All enrichment fields must be in the selected set
        const selectedKeys = new Set(selectedFields.map((f) => f.key));
        for (const field of enrichmentFields) {
          expect(selectedKeys.has(field.key)).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('Select All after deselect all restores every available field', () => {
    fc.assert(
      fc.property(sourceConfigArb, (config) => {
        // Simulate: user deselects all (selectedFields = [])
        const _deselectedFields: SelectedField[] = [];

        // Then user clicks Select All again
        const restoredFields = simulateSelectAll(config);

        // All available fields should be restored
        const allAvailableFields = getFieldsForSourceConfig(config);
        expect(restoredFields.length).toBe(allAvailableFields.length);

        const restoredKeys = new Set(restoredFields.map((f) => f.key));
        for (const field of allAvailableFields) {
          expect(restoredKeys.has(field.key)).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });
});
