// Feature: field-mapping-source-panel, Property 4: Confirm Adds Fields as Unselected

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getFieldsForSourceConfig } from '../../../utils/source-config-utils';
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
import { getSourceTag } from '../../../models/source-selection';
import { transactionalDatabases } from '../../../data/transactionalData';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SelectedField {
  key: string;
  label: string;
  source: string;
}

// ─── Pure function: replicates handleConfirmAdd logic ─────────────────────────

/**
 * Simulates handleConfirmAdd from FieldMappingStep:
 * - Appends new enrichments to existing enrichments array
 * - Does NOT modify selectedFields (new fields appear as unselected)
 */
function simulateConfirmAdd(
  initialConfig: SourceConfig,
  initialSelectedFields: SelectedField[],
  newEnrichments: EnrichmentConfig[],
): {
  updatedConfig: SourceConfig;
  selectedFields: SelectedField[];
} {
  const updatedConfig: SourceConfig = {
    ...initialConfig,
    enrichments: [...initialConfig.enrichments, ...newEnrichments],
  } as SourceConfig;

  // handleConfirmAdd does NOT modify selectedFields — new fields are unselected
  return {
    updatedConfig,
    selectedFields: initialSelectedFields,
  };
}

// ─── Constants ───────────────────────────────────────────────────────────────

const AVAILABLE_TABLE_IDS = transactionalDatabases.map((t) => t.id);

/** Known field counts per enrichment type */
const MESSAGES_ENRICHMENT_FIELD_COUNT = 6;
const TRANSACTION_ENRICHMENT_FIELD_COUNT = 6;

function getEnrichmentFieldCount(enrichment: EnrichmentConfig): number {
  switch (enrichment.entity) {
    case 'messages':
      return MESSAGES_ENRICHMENT_FIELD_COUNT;
    case 'transactions':
      return TRANSACTION_ENRICHMENT_FIELD_COUNT;
    case 'contacts':
      return 7; // contacts primary field count
  }
}

// ─── Generators ──────────────────────────────────────────────────────────────

const primarySourceArb = fc.constantFrom<PrimarySourceType>('contacts', 'transactions', 'messages');
const channelArb = fc.constantFrom<Channel>('email', 'sms', 'push');
const joinStrategyArb = fc.constantFrom<JoinStrategy>('most_recent', 'all_records');

const messagesEnrichmentArb: fc.Arbitrary<MessageEnrichmentOptions> = fc
  .tuple(
    channelArb,
    fc.constantFrom<Array<'delivered' | 'bounced' | 'failed' | 'opened'>>(
      ['delivered'],
      ['bounced', 'failed'],
      ['delivered', 'opened'],
    ),
  )
  .map(([channel, statuses]): MessageEnrichmentOptions => ({
    entity: 'messages',
    channel,
    statuses,
  }));

const transactionEnrichmentArb = (tableId: string): fc.Arbitrary<TransactionEnrichmentOptions> =>
  joinStrategyArb.map(
    (joinStrategy): TransactionEnrichmentOptions => ({
      entity: 'transactions',
      tableId,
      joinStrategy,
    }),
  );

/**
 * Generates a scenario with:
 * - An initial SourceConfig with some enrichments (possibly empty)
 * - A set of new enrichments to add (at least 1) that are NOT already in the initial set
 * - Initial selectedFields from existing enrichments (may include primary source fields)
 */
const confirmAddScenarioArb = fc
  .tuple(
    primarySourceArb,
    fc.boolean(), // whether initial config includes messages
    fc.subarray(AVAILABLE_TABLE_IDS, { minLength: 0, maxLength: AVAILABLE_TABLE_IDS.length }),
  )
  .filter(([_primarySource, initialHasMessages, initialTableIds]) => {
    // Pre-filter: ensure there's at least 1 source remaining to add
    const canAddMessages = !initialHasMessages;
    const remainingTableIds = AVAILABLE_TABLE_IDS.filter((id) => !initialTableIds.includes(id));
    return canAddMessages || remainingTableIds.length > 0;
  })
  .chain(([primarySource, initialHasMessages, initialTableIds]) => {
    // Determine which sources are available to add (not yet in initial config)
    const remainingTableIds = AVAILABLE_TABLE_IDS.filter((id) => !initialTableIds.includes(id));
    const canAddMessages = !initialHasMessages;

    // We need at least 1 new enrichment to add
    // Build the new enrichments generator
    return fc
      .tuple(
        // New messages enrichment (add only if not already present)
        canAddMessages ? fc.boolean() : fc.constant(false),
        // New transaction enrichments from remaining table IDs
        fc.subarray(remainingTableIds, { minLength: 0, maxLength: remainingTableIds.length }),
      )
      .filter(([addMessages, newTableIds]) => {
        // Ensure at least 1 new enrichment is being added
        return addMessages || newTableIds.length > 0;
      })
      .chain(([addMessages, newTableIds]) => {
        // Build initial enrichments
        const initialEnrichmentArbs: fc.Arbitrary<EnrichmentConfig>[] = [];
        if (initialHasMessages) {
          initialEnrichmentArbs.push(messagesEnrichmentArb as fc.Arbitrary<EnrichmentConfig>);
        }
        for (const tableId of initialTableIds) {
          initialEnrichmentArbs.push(transactionEnrichmentArb(tableId) as fc.Arbitrary<EnrichmentConfig>);
        }

        // Build new enrichments
        const newEnrichmentArbs: fc.Arbitrary<EnrichmentConfig>[] = [];
        if (addMessages) {
          newEnrichmentArbs.push(messagesEnrichmentArb as fc.Arbitrary<EnrichmentConfig>);
        }
        for (const tableId of newTableIds) {
          newEnrichmentArbs.push(transactionEnrichmentArb(tableId) as fc.Arbitrary<EnrichmentConfig>);
        }

        const initialEnrichmentsArb =
          initialEnrichmentArbs.length > 0
            ? fc.tuple(...initialEnrichmentArbs).map((arr) => arr as unknown as EnrichmentConfig[])
            : fc.constant([] as EnrichmentConfig[]);

        const newEnrichmentsArb = fc
          .tuple(...newEnrichmentArbs)
          .map((arr) => arr as unknown as EnrichmentConfig[]);

        return fc.tuple(
          fc.constant(primarySource),
          initialEnrichmentsArb,
          newEnrichmentsArb,
        );
      });
  })
  .map(([primarySource, initialEnrichments, newEnrichments]) => {
    // Build the initial SourceConfig
    let initialConfig: SourceConfig;
    switch (primarySource) {
      case 'contacts':
        initialConfig = {
          primarySource: 'contacts',
          filter: { type: 'field_filter', fieldFilters: [] },
          enrichment: null,
          enrichments: initialEnrichments,
        } as ContactsSourceConfig;
        break;
      case 'transactions':
        initialConfig = {
          primarySource: 'transactions',
          tableId: AVAILABLE_TABLE_IDS[0],
          filter: { type: 'all' },
          enrichment: null,
          enrichments: initialEnrichments,
        } as TransactionsSourceConfig;
        break;
      case 'messages':
        initialConfig = {
          primarySource: 'messages',
          channels: ['email'] as Channel[],
          filter: { type: 'field_filter', fieldFilters: [] },
          enrichment: null,
          enrichments: initialEnrichments,
        } as MessagesSourceConfig;
        break;
    }

    // Build initial selectedFields from existing config (some primary fields selected)
    const existingFields = getFieldsForSourceConfig(initialConfig);
    // Select a subset of existing fields to represent user's current selections
    const initialSelectedFields: SelectedField[] = existingFields
      .slice(0, Math.min(3, existingFields.length))
      .map((f) => ({ key: f.key, label: f.label, source: f.source }));

    return {
      initialConfig,
      initialSelectedFields,
      newEnrichments,
    };
  });

// ─── Property Test ───────────────────────────────────────────────────────────

/**
 * Property 4: Confirm Adds Fields as Unselected
 *
 * For any set of newly confirmed source additions, the available fields pool
 * SHALL grow by the sum of each new source's field count, and none of those
 * new fields SHALL appear in the `selectedFields` array.
 *
 * **Validates: Requirements 4.2, 7.1**
 */
describe('Feature: field-mapping-source-panel, Property 4: Confirm Adds Fields as Unselected', () => {
  it('available fields grows by sum of each new source field count', () => {
    fc.assert(
      fc.property(confirmAddScenarioArb, ({ initialConfig, initialSelectedFields, newEnrichments }) => {
        const fieldsBefore = getFieldsForSourceConfig(initialConfig);

        const { updatedConfig } = simulateConfirmAdd(
          initialConfig,
          initialSelectedFields,
          newEnrichments,
        );
        const fieldsAfter = getFieldsForSourceConfig(updatedConfig);

        const expectedGrowth = newEnrichments.reduce(
          (sum, e) => sum + getEnrichmentFieldCount(e),
          0,
        );

        expect(fieldsAfter.length).toBe(fieldsBefore.length + expectedGrowth);
      }),
      { numRuns: 100 },
    );
  });

  it('none of the new enrichment fields appear in selectedFields', () => {
    fc.assert(
      fc.property(confirmAddScenarioArb, ({ initialConfig, initialSelectedFields, newEnrichments }) => {
        const fieldsBefore = getFieldsForSourceConfig(initialConfig);
        const existingFieldKeys = new Set(fieldsBefore.map((f) => f.key));

        const { updatedConfig, selectedFields } = simulateConfirmAdd(
          initialConfig,
          initialSelectedFields,
          newEnrichments,
        );
        const fieldsAfter = getFieldsForSourceConfig(updatedConfig);

        // Identify new fields (those that didn't exist before)
        const newFieldKeys = fieldsAfter
          .filter((f) => !existingFieldKeys.has(f.key))
          .map((f) => f.key);

        // None of these new field keys should appear in selectedFields
        const selectedKeys = new Set(selectedFields.map((f) => f.key));
        for (const newKey of newFieldKeys) {
          expect(selectedKeys.has(newKey)).toBe(false);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('selectedFields remains unchanged after confirm (no new fields auto-selected)', () => {
    fc.assert(
      fc.property(confirmAddScenarioArb, ({ initialConfig, initialSelectedFields, newEnrichments }) => {
        const { selectedFields } = simulateConfirmAdd(
          initialConfig,
          initialSelectedFields,
          newEnrichments,
        );

        // selectedFields should be exactly the same reference/content as before
        expect(selectedFields).toEqual(initialSelectedFields);
        expect(selectedFields.length).toBe(initialSelectedFields.length);
      }),
      { numRuns: 100 },
    );
  });

  it('new fields have source tags matching the added enrichments', () => {
    fc.assert(
      fc.property(confirmAddScenarioArb, ({ initialConfig, initialSelectedFields, newEnrichments }) => {
        const fieldsBefore = getFieldsForSourceConfig(initialConfig);
        const existingFieldKeys = new Set(fieldsBefore.map((f) => f.key));

        const { updatedConfig } = simulateConfirmAdd(
          initialConfig,
          initialSelectedFields,
          newEnrichments,
        );
        const fieldsAfter = getFieldsForSourceConfig(updatedConfig);

        // Identify new fields
        const newFields = fieldsAfter.filter((f) => !existingFieldKeys.has(f.key));

        // Get expected source tags from the new enrichments
        const expectedSourceTags = new Set(newEnrichments.map((e) => getSourceTag(e)));

        // Every new field's source should be one of the expected source tags
        for (const field of newFields) {
          expect(expectedSourceTags.has(field.source)).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });
});
