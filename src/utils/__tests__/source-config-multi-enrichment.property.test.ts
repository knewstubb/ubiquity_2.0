// Feature: field-mapping-source-panel, Property 7: Combined Field Resolution
// Feature: field-mapping-source-panel, Property 8: Field Key Uniqueness
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getFieldsForSourceConfig } from '../source-config-utils';
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
} from '../../models/source-selection';
import { transactionalDatabases } from '../../data/transactionalData';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Known field counts per primary source type (from static arrays in source-config-utils) */
const PRIMARY_FIELD_COUNTS: Record<PrimarySourceType, number> = {
  contacts: 7,
  transactions: 6,
  messages: 6,
};

/** Transaction enrichment fields map to the 'transactions' primary fields → 6 fields per table */
const TRANSACTION_ENRICHMENT_FIELD_COUNT = PRIMARY_FIELD_COUNTS['transactions'];

/** Messages enrichment fields map to the 'messages' primary fields → 6 fields */
const MESSAGES_ENRICHMENT_FIELD_COUNT = PRIMARY_FIELD_COUNTS['messages'];

/** Available transaction table IDs from actual data */
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
    fc.array(channelArb, { minLength: 1, maxLength: 3 }).map((channels) => [...new Set(channels)]),
    fc.constantFrom<Array<'delivered' | 'bounced' | 'failed' | 'opened'>>(['delivered'], ['bounced', 'failed'], ['delivered', 'opened']),
  ).map(([channels, statuses]): MessageEnrichmentOptions[] => [{
    entity: 'messages',
    channel: channels[0],
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
    )
  )
  .map(([tableIds, strategies]) =>
    tableIds.map((tableId, i): TransactionEnrichmentOptions => ({
      entity: 'transactions',
      tableId,
      joinStrategy: strategies[i],
    }))
  );

/**
 * Generates a valid enrichments array: 0-1 messages + 0-N transactions.
 */
const enrichmentsArb: fc.Arbitrary<EnrichmentConfig[]> = fc
  .tuple(messagesEnrichmentArb, transactionEnrichmentsArb)
  .map(([msgs, txns]) => [...msgs, ...txns]);

/**
 * Generates a valid SourceConfig with the multi-enrichment array populated.
 */
const sourceConfigWithEnrichmentsArb: fc.Arbitrary<SourceConfig> = fc
  .tuple(primarySourceArb, enrichmentsArb)
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
          })
        );
      case 'messages':
        return fc.array(channelArb, { minLength: 1, maxLength: 3 })
          .map((channels): MessagesSourceConfig => ({
            primarySource: 'messages',
            channels: [...new Set(channels)],
            filter: { type: 'field_filter', fieldFilters: [] },
            enrichment: null,
            enrichments,
          }));
    }
  });

// ─── Helper: compute expected enrichment field count ─────────────────────────

function getExpectedEnrichmentFieldCount(enrichments: EnrichmentConfig[]): number {
  return enrichments.reduce((sum, e) => {
    switch (e.entity) {
      case 'messages':
        return sum + MESSAGES_ENRICHMENT_FIELD_COUNT;
      case 'transactions':
        return sum + TRANSACTION_ENRICHMENT_FIELD_COUNT;
      case 'contacts':
        return sum + PRIMARY_FIELD_COUNTS['contacts'];
    }
  }, 0);
}

// ─── Property Tests ──────────────────────────────────────────────────────────

/**
 * Property 7: Combined Field Resolution
 *
 * For any valid SourceConfig with any combination of enrichments (0-1 messages + 0-N transaction tables),
 * `getFieldsForSourceConfig` SHALL return a SourceFieldDefinition[] whose length equals the sum of:
 * primary source field count + each enrichment's field count.
 * Every returned field SHALL have a non-empty `source` string.
 *
 * **Validates: Requirements 6.1, 6.2, 6.3**
 */
describe('Feature: field-mapping-source-panel, Property 7: Combined Field Resolution', () => {
  it('returned array length equals primary field count + sum of each enrichment field count', () => {
    fc.assert(
      fc.property(sourceConfigWithEnrichmentsArb, (config) => {
        const fields = getFieldsForSourceConfig(config);
        const enrichments = config.enrichments ?? [];
        const expectedLength =
          PRIMARY_FIELD_COUNTS[config.primarySource] +
          getExpectedEnrichmentFieldCount(enrichments);

        expect(fields.length).toBe(expectedLength);
      }),
      { numRuns: 100 }
    );
  });

  it('every returned field has a non-empty source string', () => {
    fc.assert(
      fc.property(sourceConfigWithEnrichmentsArb, (config) => {
        const fields = getFieldsForSourceConfig(config);

        for (const field of fields) {
          expect(field.source).toBeDefined();
          expect(typeof field.source).toBe('string');
          expect(field.source.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 8: Field Key Uniqueness
 *
 * For any valid SourceConfig with any combination of active enrichments
 * (including multiple transaction tables), all field keys returned by
 * `getFieldsForSourceConfig` SHALL be unique — no two entries share the same `key` value.
 *
 * **Validates: Requirements 6.4**
 */
describe('Feature: field-mapping-source-panel, Property 8: Field Key Uniqueness', () => {
  it('all returned field keys are unique (no duplicates)', () => {
    fc.assert(
      fc.property(sourceConfigWithEnrichmentsArb, (config) => {
        const fields = getFieldsForSourceConfig(config);
        const keys = fields.map((f) => f.key);
        const uniqueKeys = new Set(keys);

        expect(uniqueKeys.size).toBe(keys.length);
      }),
      { numRuns: 100 }
    );
  });
});
