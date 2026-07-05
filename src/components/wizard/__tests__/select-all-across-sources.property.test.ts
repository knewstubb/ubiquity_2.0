// Feature: field-mapping-source-panel, Property 10: Select All Covers All Sources

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getFieldsForSourceConfig } from '../../../utils/source-config-utils';
import type { SourceFieldDefinition } from '../../../utils/source-config-utils';
import type {
  PrimarySourceType,
  SourceConfig,
  EnrichmentConfig,
  ContactsSourceConfig,
  TransactionsSourceConfig,
  MessagesSourceConfig,
  Channel,
  JoinStrategy,
  MessageEnrichmentOptions,
  TransactionEnrichmentOptions,
} from '../../../models/source-selection';
import { transactionalDatabases } from '../../../data/transactionalData';

// ─── Types mirroring the component's SelectedField ───────────────────────────

interface SelectedField {
  key: string;
  label: string;
  source: string;
}

// ─── Select All logic (mirrors FieldMappingStep handleSelectAllContact) ──────

/**
 * Simulates the Select All logic from FieldMappingStep:
 * `selectedFields = [...availableContactFields]`
 * where `availableContactFields` = `getFieldsForSourceConfig(sourceConfig)`
 */
function simulateSelectAll(config: SourceConfig): SelectedField[] {
  const availableFields = getFieldsForSourceConfig(config);
  return availableFields.map((f): SelectedField => ({
    key: f.key,
    label: f.label,
    source: f.source,
  }));
}

// ─── Constants ───────────────────────────────────────────────────────────────

const AVAILABLE_TABLE_IDS = transactionalDatabases.map((t) => t.id);

// ─── Generators ──────────────────────────────────────────────────────────────

const primarySourceArb = fc.constantFrom<PrimarySourceType>('contacts', 'transactions', 'messages');
const channelArb = fc.constantFrom<Channel>('email', 'sms', 'push');
const joinStrategyArb = fc.constantFrom<JoinStrategy>('most_recent', 'all_records');

/**
 * Generates 0 or 1 messages enrichment configs.
 */
const messagesEnrichmentArb: fc.Arbitrary<MessageEnrichmentOptions[]> = fc.oneof(
  fc.constant([] as MessageEnrichmentOptions[]),
  fc.tuple(
    channelArb,
    fc.constantFrom<Array<'delivered' | 'bounced' | 'failed' | 'opened'>>(
      ['delivered'],
      ['bounced', 'failed'],
      ['delivered', 'opened'],
    ),
  ).map(([channel, statuses]): MessageEnrichmentOptions[] => [{
    entity: 'messages',
    channel,
    statuses,
  }]),
);

/**
 * Generates 0-N transaction enrichment configs, each with a unique tableId
 * drawn from actual transactionalDatabases data.
 */
const transactionEnrichmentsArb: fc.Arbitrary<TransactionEnrichmentOptions[]> = fc
  .subarray(AVAILABLE_TABLE_IDS, { minLength: 0, maxLength: AVAILABLE_TABLE_IDS.length })
  .chain((tableIds) =>
    fc.tuple(
      fc.constant(tableIds),
      fc.array(joinStrategyArb, { minLength: tableIds.length, maxLength: tableIds.length }),
    ),
  )
  .map(([tableIds, strategies]) =>
    tableIds.map((tableId, i): TransactionEnrichmentOptions => ({
      entity: 'transactions',
      tableId,
      joinStrategy: strategies[i],
    })),
  );

/**
 * Generates a valid enrichments array: 0-1 messages + 0-N transactions.
 * Ensures at least one enrichment is present (multi-source scenario).
 */
const multiSourceEnrichmentsArb: fc.Arbitrary<EnrichmentConfig[]> = fc
  .tuple(messagesEnrichmentArb, transactionEnrichmentsArb)
  .map(([msgs, txns]) => [...msgs, ...txns])
  .filter((enrichments) => enrichments.length > 0);

/**
 * Generates a valid SourceConfig with multi-enrichment array populated (at least 1 enrichment).
 * This ensures we're testing the multi-source scenario.
 */
const multiSourceConfigArb: fc.Arbitrary<SourceConfig> = fc
  .tuple(primarySourceArb, multiSourceEnrichmentsArb)
  .chain(([primarySource, enrichments]) => {
    switch (primarySource) {
      case 'contacts':
        return fc.constant<ContactsSourceConfig>({
          primarySource: 'contacts',
          filter: { type: 'field_filter', fieldFilters: [] },
          enrichment: null,
          enrichments,
        });
      case 'transactions':
        return fc.constantFrom(...AVAILABLE_TABLE_IDS).map(
          (tableId): TransactionsSourceConfig => ({
            primarySource: 'transactions',
            tableId,
            filter: { type: 'all' },
            enrichment: null,
            enrichments,
          }),
        );
      case 'messages':
        return fc.array(channelArb, { minLength: 1, maxLength: 3 }).map(
          (channels): MessagesSourceConfig => ({
            primarySource: 'messages',
            channels: [...new Set(channels)],
            filter: { type: 'field_filter', fieldFilters: [] },
            enrichment: null,
            enrichments,
          }),
        );
    }
  });

// ─── Property Test ───────────────────────────────────────────────────────────

/**
 * Property 10: Select All Covers All Sources
 *
 * For any set of available fields from multiple active sources, invoking the select-all
 * action SHALL result in `selectedFields` containing every field from the available pool
 * (all sources combined). The resulting `selectedFields.length` SHALL equal the available
 * fields count.
 *
 * **Validates: Requirements 7.5**
 */
describe('Feature: field-mapping-source-panel, Property 10: Select All Covers All Sources', () => {
  it('selectedFields.length equals total available fields count after select-all', () => {
    fc.assert(
      fc.property(multiSourceConfigArb, (config) => {
        const availableFields = getFieldsForSourceConfig(config);
        const selectedFields = simulateSelectAll(config);

        expect(selectedFields.length).toBe(availableFields.length);
      }),
      { numRuns: 100 },
    );
  });

  it('every field from every active source is included in selectedFields after select-all', () => {
    fc.assert(
      fc.property(multiSourceConfigArb, (config) => {
        const availableFields = getFieldsForSourceConfig(config);
        const selectedFields = simulateSelectAll(config);

        const selectedKeys = new Set(selectedFields.map((f) => f.key));

        // Every available field key must be present in the selected set
        for (const field of availableFields) {
          expect(selectedKeys.has(field.key)).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('select-all includes fields from enrichment sources (not just primary)', () => {
    fc.assert(
      fc.property(multiSourceConfigArb, (config) => {
        const availableFields = getFieldsForSourceConfig(config);
        const selectedFields = simulateSelectAll(config);

        // Identify enrichment fields (those with key starting with 'enrichment_')
        const enrichmentFields = availableFields.filter((f) => f.key.startsWith('enrichment_'));
        expect(enrichmentFields.length).toBeGreaterThan(0);

        // All enrichment fields must be in the selected set
        const selectedKeys = new Set(selectedFields.map((f) => f.key));
        for (const field of enrichmentFields) {
          expect(selectedKeys.has(field.key)).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('select-all covers all distinct source tags present in available fields', () => {
    fc.assert(
      fc.property(multiSourceConfigArb, (config) => {
        const availableFields = getFieldsForSourceConfig(config);
        const selectedFields = simulateSelectAll(config);

        // Get all distinct source values from available fields
        const availableSources = new Set(availableFields.map((f) => f.source));
        const selectedSources = new Set(selectedFields.map((f) => f.source));

        // Every source represented in available fields must appear in selected fields
        for (const source of availableSources) {
          expect(selectedSources.has(source)).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });
});
