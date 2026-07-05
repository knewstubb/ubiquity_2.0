// Feature: field-mapping-source-panel, Property 6: Removal Cleanup

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getSourceTag } from '../../../models/source-selection';
import type {
  EnrichmentConfig,
  Channel,
  JoinStrategy,
  MessageEnrichmentOptions,
  TransactionEnrichmentOptions,
} from '../../../models/source-selection';
import type { SelectedField } from '../../../models/automation';
import type { ColumnRename } from '../../../models/wizard';
import { transactionalDatabases } from '../../../data/transactionalData';

// ─── Pure function: replicates the handleRemoveEnrichment logic ──────────────

interface RemovalInput {
  enrichments: EnrichmentConfig[];
  selectedFields: SelectedField[];
  columnRenames: ColumnRename[];
  removeIndex: number;
}

interface RemovalOutput {
  enrichments: EnrichmentConfig[];
  selectedFields: SelectedField[];
  columnRenames: ColumnRename[];
}

/**
 * Pure function that replicates the removal logic from FieldMappingStep.handleRemoveEnrichment.
 * Given enrichments array, selectedFields, columnRenames, and the index to remove,
 * returns the new state after removal + cleanup.
 */
function applyRemoveEnrichment(input: RemovalInput): RemovalOutput {
  const { enrichments, selectedFields, columnRenames, removeIndex } = input;

  if (removeIndex < 0 || removeIndex >= enrichments.length) {
    // No-op for out-of-bounds (matches the guard in the component)
    return { enrichments, selectedFields, columnRenames };
  }

  const removed = enrichments[removeIndex];
  const sourceTag = getSourceTag(removed);

  // Remove the enrichment from the array
  const newEnrichments = [
    ...enrichments.slice(0, removeIndex),
    ...enrichments.slice(removeIndex + 1),
  ];

  // Filter out selected fields whose source matches the removed enrichment
  const newSelectedFields = selectedFields.filter((f) => f.source !== sourceTag);

  // Filter out column renames for fields that were removed
  const remainingFieldKeys = new Set(newSelectedFields.map((f) => f.key));
  const newColumnRenames = columnRenames.filter((r) => remainingFieldKeys.has(r.fieldKey));

  return {
    enrichments: newEnrichments,
    selectedFields: newSelectedFields,
    columnRenames: newColumnRenames,
  };
}

// ─── Constants ───────────────────────────────────────────────────────────────

const AVAILABLE_TABLE_IDS = transactionalDatabases.map((t) => t.id);

// ─── Generators ──────────────────────────────────────────────────────────────

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

const transactionEnrichmentArb: fc.Arbitrary<TransactionEnrichmentOptions> = fc
  .tuple(fc.constantFrom(...AVAILABLE_TABLE_IDS), joinStrategyArb)
  .map(([tableId, joinStrategy]): TransactionEnrichmentOptions => ({
    entity: 'transactions',
    tableId,
    joinStrategy,
  }));

/**
 * Generates a non-empty enrichments array with unique enrichments.
 * Includes 0-1 messages + 1-N transaction enrichments (at least 1 total).
 */
const nonEmptyEnrichmentsArb: fc.Arbitrary<EnrichmentConfig[]> = fc
  .tuple(
    fc.boolean(), // whether to include messages
    fc.subarray(AVAILABLE_TABLE_IDS, { minLength: 0, maxLength: AVAILABLE_TABLE_IDS.length }),
  )
  .chain(([includeMessages, tableIds]) => {
    const configs: fc.Arbitrary<EnrichmentConfig>[] = [];
    if (includeMessages) {
      configs.push(messagesEnrichmentArb as fc.Arbitrary<EnrichmentConfig>);
    }
    for (const tableId of tableIds) {
      configs.push(
        joinStrategyArb.map(
          (js): EnrichmentConfig => ({
            entity: 'transactions',
            tableId,
            joinStrategy: js,
          }),
        ),
      );
    }
    // Ensure at least 1 enrichment
    if (configs.length === 0) {
      configs.push(messagesEnrichmentArb as fc.Arbitrary<EnrichmentConfig>);
    }
    return fc.tuple(...configs);
  })
  .map((enrichments) => enrichments as unknown as EnrichmentConfig[]);

/**
 * Generates selected fields for a given set of enrichments.
 * Each enrichment contributes some fields with the correct source tag and key pattern.
 */
function selectedFieldsForEnrichments(
  enrichments: EnrichmentConfig[],
): fc.Arbitrary<SelectedField[]> {
  // For each enrichment, generate 1-4 fields
  const fieldArbs = enrichments.map((enrichment) => {
    const sourceTag = getSourceTag(enrichment);
    const keyPrefix =
      enrichment.entity === 'messages'
        ? 'enrichment_messages_'
        : `enrichment_txn_${enrichment.entity === 'transactions' ? enrichment.tableId : ''}_`;

    return fc
      .array(
        fc.string({ minLength: 1, maxLength: 10 }).filter((s) => /^[a-z_]+$/.test(s)),
        { minLength: 1, maxLength: 4 },
      )
      .map((fieldNames) =>
        // Deduplicate field names
        [...new Set(fieldNames)].map(
          (fieldName): SelectedField => ({
            key: `${keyPrefix}${fieldName}`,
            label: fieldName,
            source: sourceTag as SelectedField['source'],
          }),
        ),
      );
  });

  // Also add some "contact" fields that should not be affected by any enrichment removal
  const contactFieldsArb = fc
    .array(
      fc.string({ minLength: 1, maxLength: 10 }).filter((s) => /^[a-z_]+$/.test(s)),
      { minLength: 0, maxLength: 3 },
    )
    .map((fieldNames) =>
      [...new Set(fieldNames)].map(
        (fieldName): SelectedField => ({
          key: `contact_${fieldName}`,
          label: fieldName,
          source: 'contact',
        }),
      ),
    );

  if (fieldArbs.length === 0) {
    return contactFieldsArb;
  }

  return fc.tuple(contactFieldsArb, ...fieldArbs).map((arrays) => {
    const allFields = (arrays as SelectedField[][]).flat();
    // Deduplicate by key
    const seen = new Set<string>();
    return allFields.filter((f) => {
      if (seen.has(f.key)) return false;
      seen.add(f.key);
      return true;
    });
  });
}

/**
 * Generates column renames that reference keys from the given selected fields.
 */
function columnRenamesForFields(fields: SelectedField[]): fc.Arbitrary<ColumnRename[]> {
  if (fields.length === 0) return fc.constant([]);
  return fc
    .subarray(fields, { minLength: 0, maxLength: Math.min(fields.length, 5) })
    .map((subset) =>
      subset.map(
        (f): ColumnRename => ({
          fieldKey: f.key,
          outputName: `renamed_${f.key}`,
        }),
      ),
    );
}

// ─── Property Test ───────────────────────────────────────────────────────────

/**
 * Property 6: Removal Cleanup
 *
 * For any enrichment removed from the enrichments array (via chip X button),
 * the resulting state SHALL satisfy:
 * (a) the enrichments array length decreases by exactly 1,
 * (b) no field in selectedFields has a source matching the removed enrichment's source tag,
 * (c) no entry in columnRenames references a field key belonging to the removed source.
 *
 * **Validates: Requirements 5.1, 5.2, 5.3, 7.2**
 */
describe('Feature: field-mapping-source-panel, Property 6: Removal Cleanup', () => {
  it('(a) enrichments array length decreases by exactly 1', () => {
    fc.assert(
      fc.property(
        nonEmptyEnrichmentsArb.chain((enrichments) =>
          fc.tuple(
            fc.constant(enrichments),
            fc.integer({ min: 0, max: enrichments.length - 1 }),
          ),
        ),
        ([enrichments, removeIndex]) => {
          const fields = fc.sample(selectedFieldsForEnrichments(enrichments), 1)[0];
          const renames = fc.sample(columnRenamesForFields(fields), 1)[0];

          const result = applyRemoveEnrichment({
            enrichments,
            selectedFields: fields,
            columnRenames: renames,
            removeIndex,
          });

          expect(result.enrichments.length).toBe(enrichments.length - 1);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('(b) no selectedFields have source matching the removed enrichment source tag', () => {
    fc.assert(
      fc.property(
        nonEmptyEnrichmentsArb.chain((enrichments) =>
          selectedFieldsForEnrichments(enrichments).chain((fields) =>
            columnRenamesForFields(fields).chain((renames) =>
              fc.tuple(
                fc.constant(enrichments),
                fc.constant(fields),
                fc.constant(renames),
                fc.integer({ min: 0, max: enrichments.length - 1 }),
              ),
            ),
          ),
        ),
        ([enrichments, fields, renames, removeIndex]) => {
          const removedSourceTag = getSourceTag(enrichments[removeIndex]);

          const result = applyRemoveEnrichment({
            enrichments,
            selectedFields: fields,
            columnRenames: renames,
            removeIndex,
          });

          // No remaining selectedField should have the removed source tag
          for (const field of result.selectedFields) {
            expect(field.source).not.toBe(removedSourceTag);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('(c) no columnRenames reference field keys from the removed source', () => {
    fc.assert(
      fc.property(
        nonEmptyEnrichmentsArb.chain((enrichments) =>
          selectedFieldsForEnrichments(enrichments).chain((fields) =>
            columnRenamesForFields(fields).chain((renames) =>
              fc.tuple(
                fc.constant(enrichments),
                fc.constant(fields),
                fc.constant(renames),
                fc.integer({ min: 0, max: enrichments.length - 1 }),
              ),
            ),
          ),
        ),
        ([enrichments, fields, renames, removeIndex]) => {
          const removedSourceTag = getSourceTag(enrichments[removeIndex]);
          // Identify field keys that belong to the removed source
          const removedFieldKeys = new Set(
            fields
              .filter((f) => f.source === removedSourceTag)
              .map((f) => f.key),
          );

          const result = applyRemoveEnrichment({
            enrichments,
            selectedFields: fields,
            columnRenames: renames,
            removeIndex,
          });

          // No remaining columnRename should reference a removed field key
          for (const rename of result.columnRenames) {
            expect(removedFieldKeys.has(rename.fieldKey)).toBe(false);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('fields from non-removed sources are preserved', () => {
    fc.assert(
      fc.property(
        nonEmptyEnrichmentsArb.chain((enrichments) =>
          selectedFieldsForEnrichments(enrichments).chain((fields) =>
            columnRenamesForFields(fields).chain((renames) =>
              fc.tuple(
                fc.constant(enrichments),
                fc.constant(fields),
                fc.constant(renames),
                fc.integer({ min: 0, max: enrichments.length - 1 }),
              ),
            ),
          ),
        ),
        ([enrichments, fields, renames, removeIndex]) => {
          const removedSourceTag = getSourceTag(enrichments[removeIndex]);

          const result = applyRemoveEnrichment({
            enrichments,
            selectedFields: fields,
            columnRenames: renames,
            removeIndex,
          });

          // All fields NOT from the removed source should still be present
          const expectedPreservedFields = fields.filter(
            (f) => f.source !== removedSourceTag,
          );
          expect(result.selectedFields).toEqual(expectedPreservedFields);
        },
      ),
      { numRuns: 100 },
    );
  });
});
