// Feature: enrichment-field-selection, Property 4: Filter-only changes preserve enrichment state
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { didSourceOrSubSourceChange } from '../populate-fields';
import { createDefaultEnrichmentConfig } from '../source-config-utils';
import type {
  SourceConfig,
  ContactsSourceConfig,
  TransactionsSourceConfig,
  MessagesSourceConfig,
  EnrichmentConfig,
  EnrichmentEntity,
  Channel,
  FieldFilterRow,
  ContactsFilterConfig,
  TransactionsFilterConfig,
  MessagesFilterConfig,
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

// ─── Simulate handleDraftUpdate filter-only logic (from WizardModal) ─────────

/**
 * Simulates the handleDraftUpdate logic from WizardModal when a sourceConfig patch is applied.
 *
 * The key logic being tested:
 *   if (patch.sourceConfig !== undefined) {
 *     if (didSourceOrSubSourceChange(oldConfig, newConfig)) {
 *       return { ...prev, ...patch, selectedFields: [], columnRenames: [] };
 *     }
 *     // enrichment entity change check...
 *     // Filter-only change or enrichment added — preserve all fields
 *     return { ...prev, ...patch };
 *   }
 *
 * For a filter-only change (same primary, same sub-source, same enrichment entity),
 * the function should preserve selectedFields and columnRenames unchanged.
 */
function simulateHandleDraftUpdate(
  prevSourceConfig: SourceConfig,
  patchSourceConfig: SourceConfig,
  prevSelectedFields: SelectedField[],
  prevColumnRenames: ColumnRename[],
): { selectedFields: SelectedField[]; columnRenames: ColumnRename[] } {
  // Check if primary source or sub-source changed
  if (didSourceOrSubSourceChange(prevSourceConfig, patchSourceConfig)) {
    return { selectedFields: [], columnRenames: [] };
  }

  const oldEnrichmentEntity = prevSourceConfig.enrichment?.entity ?? null;
  const newEnrichmentEntity = patchSourceConfig.enrichment?.entity ?? null;

  if (oldEnrichmentEntity && oldEnrichmentEntity !== newEnrichmentEntity) {
    // Enrichment entity changed — remove old entity's fields
    const preservedFields = prevSelectedFields.filter(
      (field) => field.source !== oldEnrichmentEntity,
    );
    const preservedFieldKeys = new Set(preservedFields.map((f) => f.key));
    const preservedRenames = prevColumnRenames.filter(
      (rename) => preservedFieldKeys.has(rename.fieldKey),
    );
    return { selectedFields: preservedFields, columnRenames: preservedRenames };
  }

  // Filter-only change or enrichment added — preserve all fields
  return { selectedFields: prevSelectedFields, columnRenames: prevColumnRenames };
}

// ─── Generators ──────────────────────────────────────────────────────────────

const channelArb = fc.constantFrom<Channel>('email', 'sms', 'push');
const enrichmentEntityArb = fc.constantFrom<EnrichmentEntity>('contacts', 'transactions', 'messages');

// Generator for a FieldFilterRow
const fieldFilterRowArb = fc.record({
  field: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
  operator: fc.constantFrom('equals', 'contains', 'startsWith', 'greaterThan', 'lessThan'),
  value: fc.string({ minLength: 1, maxLength: 30 }),
});

// Generator for ContactsFilterConfig (only filter changes)
const contactsFilterArb: fc.Arbitrary<ContactsFilterConfig> = fc.record({
  type: fc.constant('field_filter' as const),
  fieldFilters: fc.option(fc.array(fieldFilterRowArb, { minLength: 0, maxLength: 5 }), { nil: undefined }),
});

// Generator for TransactionsFilterConfig (only filter changes)
const transactionsFilterArb: fc.Arbitrary<TransactionsFilterConfig> = fc.record({
  type: fc.constantFrom<TransactionsFilterConfig['type']>('all', 'created_in_last_n_days', 'field_filter'),
  days: fc.option(fc.integer({ min: 1, max: 365 }), { nil: undefined }),
  fieldFilters: fc.option(fc.array(fieldFilterRowArb, { minLength: 0, maxLength: 5 }), { nil: undefined }),
});

// Generator for MessagesFilterConfig (only filter changes)
const messagesFilterArb: fc.Arbitrary<MessagesFilterConfig> = fc.record({
  type: fc.constant('field_filter' as const),
  fieldFilters: fc.option(fc.array(fieldFilterRowArb, { minLength: 0, maxLength: 5 }), { nil: undefined }),
  selectedMessageIds: fc.option(fc.array(fc.uuid(), { minLength: 0, maxLength: 5 }), { nil: undefined }),
});

// Generator for an enrichment config that's not the same entity as the primary source
function enrichmentForPrimary(primarySource: string): fc.Arbitrary<EnrichmentConfig> {
  const availableEntities: EnrichmentEntity[] = (['contacts', 'transactions', 'messages'] as EnrichmentEntity[]).filter(
    (e) => e !== primarySource,
  );
  return fc.constantFrom(...availableEntities).map((entity) => createDefaultEnrichmentConfig(entity));
}

// Generator for a ContactsSourceConfig with enrichment active and a random filter
function contactsSourceConfigWithEnrichmentArb(): fc.Arbitrary<{
  original: ContactsSourceConfig;
  patched: ContactsSourceConfig;
}> {
  return fc.tuple(contactsFilterArb, contactsFilterArb, enrichmentForPrimary('contacts')).map(
    ([originalFilter, patchedFilter, enrichment]) => ({
      original: {
        primarySource: 'contacts' as const,
        filter: originalFilter,
        enrichment,
      },
      patched: {
        primarySource: 'contacts' as const,
        filter: patchedFilter,
        enrichment,
      },
    }),
  );
}

// Generator for a TransactionsSourceConfig with enrichment active and a random filter
function transactionsSourceConfigWithEnrichmentArb(): fc.Arbitrary<{
  original: TransactionsSourceConfig;
  patched: TransactionsSourceConfig;
}> {
  return fc
    .tuple(
      fc.string({ minLength: 1, maxLength: 20 }), // shared tableId
      transactionsFilterArb,
      transactionsFilterArb,
      enrichmentForPrimary('transactions'),
    )
    .map(([tableId, originalFilter, patchedFilter, enrichment]) => ({
      original: {
        primarySource: 'transactions' as const,
        tableId,
        filter: originalFilter,
        enrichment,
      },
      patched: {
        primarySource: 'transactions' as const,
        tableId, // same tableId — sub-source unchanged
        filter: patchedFilter,
        enrichment,
      },
    }));
}

// Generator for a MessagesSourceConfig with enrichment active and a random filter
function messagesSourceConfigWithEnrichmentArb(): fc.Arbitrary<{
  original: MessagesSourceConfig;
  patched: MessagesSourceConfig;
}> {
  return fc
    .tuple(
      fc.array(channelArb, { minLength: 1, maxLength: 3 }), // shared channels
      messagesFilterArb,
      messagesFilterArb,
      enrichmentForPrimary('messages'),
    )
    .map(([channels, originalFilter, patchedFilter, enrichment]) => ({
      original: {
        primarySource: 'messages' as const,
        channels,
        filter: originalFilter,
        enrichment,
      },
      patched: {
        primarySource: 'messages' as const,
        channels, // same channels — sub-source unchanged
        filter: patchedFilter,
        enrichment,
      },
    }));
}

// Combined generator for any source type with filter-only change
const filterOnlyPatchArb: fc.Arbitrary<{
  original: SourceConfig;
  patched: SourceConfig;
}> = fc.oneof(
  contactsSourceConfigWithEnrichmentArb(),
  transactionsSourceConfigWithEnrichmentArb(),
  messagesSourceConfigWithEnrichmentArb(),
);

// Generator for SelectedFields (mix of primary and enrichment entity fields)
function selectedFieldsArb(enrichmentEntity: EnrichmentEntity): fc.Arbitrary<SelectedField[]> {
  const primaryFieldArb = fc.record({
    key: fc.string({ minLength: 1, maxLength: 30 }).map((k) => `primary_${k}`),
    label: fc.string({ minLength: 1, maxLength: 30 }),
    source: fc.constant('contact'),
  });
  const enrichmentFieldArb = fc.record({
    key: fc.string({ minLength: 1, maxLength: 30 }).map((k) => `enrichment_${enrichmentEntity}_${k}`),
    label: fc.string({ minLength: 1, maxLength: 30 }),
    source: fc.constant(enrichmentEntity),
  });

  return fc.tuple(
    fc.array(primaryFieldArb, { minLength: 1, maxLength: 5 }),
    fc.array(enrichmentFieldArb, { minLength: 1, maxLength: 5 }),
  ).map(([primary, enrichment]) => [...primary, ...enrichment]);
}

// ─── Property Tests ──────────────────────────────────────────────────────────

/**
 * Property 4: Filter-only changes preserve enrichment state
 *
 * For any SourceConfig patch where:
 * 1. primarySource stays the same
 * 2. Sub-source stays the same (tableId for transactions, channels for messages)
 * 3. enrichment entity stays the same (or both are null)
 * 4. Only filter changes
 *
 * Then selectedFields and columnRenames MUST remain unchanged.
 *
 * **Validates: Requirements 4.2**
 */
describe('Feature: enrichment-field-selection, Property 4: Filter-only changes preserve enrichment state', () => {
  it('enrichment field in sourceConfig is preserved after filter-only patch', () => {
    fc.assert(
      fc.property(filterOnlyPatchArb, ({ original, patched }) => {
        const selectedFields: SelectedField[] = [
          { key: 'field_1', label: 'Field 1', source: 'contact' },
          { key: `enrichment_${original.enrichment!.entity}_name`, label: 'Name', source: original.enrichment!.entity },
        ];
        const columnRenames: ColumnRename[] = [
          { fieldKey: 'field_1', outputName: 'Custom Field 1' },
        ];

        const result = simulateHandleDraftUpdate(original, patched, selectedFields, columnRenames);

        // Enrichment in patched config is the same as original
        expect(patched.enrichment).toEqual(original.enrichment);
        // selectedFields preserved
        expect(result.selectedFields).toEqual(selectedFields);
        // columnRenames preserved
        expect(result.columnRenames).toEqual(columnRenames);
      }),
      { numRuns: 100 },
    );
  });

  it('selectedFields remain identical after filter-only change with arbitrary fields', () => {
    const testCaseArb = filterOnlyPatchArb.chain(({ original, patched }) => {
      const entity = original.enrichment!.entity;
      return selectedFieldsArb(entity).map((fields) => ({
        original,
        patched,
        fields,
      }));
    });

    fc.assert(
      fc.property(testCaseArb, ({ original, patched, fields }) => {
        const columnRenames: ColumnRename[] = fields.map((f) => ({
          fieldKey: f.key,
          outputName: `output_${f.key}`,
        }));

        const result = simulateHandleDraftUpdate(original, patched, fields, columnRenames);

        expect(result.selectedFields).toEqual(fields);
        expect(result.selectedFields.length).toBe(fields.length);
      }),
      { numRuns: 100 },
    );
  });

  it('columnRenames remain identical after filter-only change with arbitrary renames', () => {
    const testCaseArb = filterOnlyPatchArb.chain(({ original, patched }) => {
      const entity = original.enrichment!.entity;
      return selectedFieldsArb(entity).map((fields) => ({
        original,
        patched,
        fields,
      }));
    });

    fc.assert(
      fc.property(testCaseArb, ({ original, patched, fields }) => {
        const columnRenames: ColumnRename[] = fields.map((f) => ({
          fieldKey: f.key,
          outputName: `renamed_${f.key}`,
        }));

        const result = simulateHandleDraftUpdate(original, patched, fields, columnRenames);

        expect(result.columnRenames).toEqual(columnRenames);
        expect(result.columnRenames.length).toBe(columnRenames.length);
      }),
      { numRuns: 100 },
    );
  });

  it('didSourceOrSubSourceChange returns false for filter-only patches', () => {
    fc.assert(
      fc.property(filterOnlyPatchArb, ({ original, patched }) => {
        // Precondition: the generated patches keep primary source + sub-source the same
        expect(didSourceOrSubSourceChange(original, patched)).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  it('enrichment entity in result matches the original enrichment entity', () => {
    const testCaseArb = filterOnlyPatchArb.chain(({ original, patched }) => {
      const entity = original.enrichment!.entity;
      return selectedFieldsArb(entity).map((fields) => ({
        original,
        patched,
        fields,
        entity,
      }));
    });

    fc.assert(
      fc.property(testCaseArb, ({ original, patched, fields, entity }) => {
        const columnRenames: ColumnRename[] = fields
          .filter((f) => f.source === entity)
          .map((f) => ({
            fieldKey: f.key,
            outputName: `enrichment_output_${f.key}`,
          }));

        const result = simulateHandleDraftUpdate(original, patched, fields, columnRenames);

        // All enrichment fields should still be present
        const enrichmentFields = result.selectedFields.filter((f) => f.source === entity);
        const originalEnrichmentFields = fields.filter((f) => f.source === entity);
        expect(enrichmentFields.length).toBe(originalEnrichmentFields.length);

        // All enrichment renames should still be present
        expect(result.columnRenames.length).toBe(columnRenames.length);
      }),
      { numRuns: 100 },
    );
  });
});
