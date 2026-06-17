import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { SelectedField } from '../../models/automation';
import type { ColumnRename } from '../../models/wizard';
import type { EnrichmentEntity } from '../../models/source-selection';

// Feature: enrichment-field-selection, Property 3: Deselection cleanup removes entity fields and renames

/**
 * Property 3: Deselection cleanup removes entity fields and renames
 *
 * For any set of selectedFields and columnRenames containing fields from an enrichment entity,
 * deselecting that entity SHALL result in selectedFields containing no fields whose source
 * matches the deselected entity, and columnRenames containing no entries whose fieldKey
 * matches a field from the deselected entity.
 *
 * This implements the same logic as WizardModal's handleDraftUpdate when enrichment is removed:
 *   const preservedFields = prev.selectedFields.filter(
 *     (field) => field.source !== oldEnrichmentEntity,
 *   );
 *   const preservedFieldKeys = new Set(preservedFields.map((f) => f.key));
 *   const preservedRenames = prev.columnRenames.filter(
 *     (rename) => preservedFieldKeys.has(rename.fieldKey),
 *   );
 *
 * **Validates: Requirements 2.3, 2.4**
 */
describe('Feature: enrichment-field-selection, Property 3: Deselection cleanup removes entity fields and renames', () => {
  const ALL_ENRICHMENT_ENTITIES: EnrichmentEntity[] = ['contacts', 'transactions', 'messages'];

  // Generator for an enrichment entity
  const enrichmentEntityArb = fc.constantFrom<EnrichmentEntity>(...ALL_ENRICHMENT_ENTITIES);

  // Generator for a non-empty field key (unique-looking)
  const fieldKeyArb = fc.string({ minLength: 1, maxLength: 40 }).filter((s) => s.trim().length > 0);

  // Generator for a field label
  const fieldLabelArb = fc.string({ minLength: 1, maxLength: 60 }).filter((s) => s.trim().length > 0);

  // Generator for a source value (can be any enrichment entity or primary source like 'contact')
  const sourceArb = fc.constantFrom<string>('contact', 'contacts', 'transactions', 'messages', 'event', 'treatment');

  // Generator for a SelectedField
  const selectedFieldArb = fc.record({
    key: fieldKeyArb,
    label: fieldLabelArb,
    source: sourceArb as fc.Arbitrary<SelectedField['source']>,
  });

  // Generator for a ColumnRename
  const columnRenameArb = (fieldKeys: string[]) =>
    fc.constantFrom(...fieldKeys).map((fieldKey) => ({
      fieldKey,
      outputName: `renamed_${fieldKey}`,
    }));

  /**
   * Simulates the deselection cleanup logic from WizardModal's handleDraftUpdate.
   * This is the pure logic extracted from the component for testing.
   */
  function applyDeselectionCleanup(
    selectedFields: SelectedField[],
    columnRenames: ColumnRename[],
    oldEnrichmentEntity: EnrichmentEntity,
  ): { selectedFields: SelectedField[]; columnRenames: ColumnRename[] } {
    const preservedFields = selectedFields.filter(
      (field) => field.source !== oldEnrichmentEntity,
    );
    const preservedFieldKeys = new Set(preservedFields.map((f) => f.key));
    const preservedRenames = columnRenames.filter(
      (rename) => preservedFieldKeys.has(rename.fieldKey),
    );
    return { selectedFields: preservedFields, columnRenames: preservedRenames };
  }

  it('no fields with the deselected entity source remain in selectedFields', () => {
    // Generate a mix of fields: some from the enrichment entity, some from other sources
    const testCaseArb = enrichmentEntityArb.chain((entity) => {
      const otherSources = ALL_ENRICHMENT_ENTITIES.filter((e) => e !== entity);
      // Fields from the enrichment entity being deselected
      const enrichmentFieldArb = fc.record({
        key: fc.string({ minLength: 1, maxLength: 40 }).filter((s) => s.trim().length > 0).map((k) => `enrichment_${entity}_${k}`),
        label: fc.string({ minLength: 1, maxLength: 60 }).filter((s) => s.trim().length > 0),
        source: fc.constant(entity) as fc.Arbitrary<SelectedField['source']>,
      });
      // Fields from other sources (primary or other enrichments)
      const otherFieldArb = fc.record({
        key: fc.string({ minLength: 1, maxLength: 40 }).filter((s) => s.trim().length > 0).map((k) => `other_${k}`),
        label: fc.string({ minLength: 1, maxLength: 60 }).filter((s) => s.trim().length > 0),
        source: fc.constantFrom<string>('contact', ...otherSources) as fc.Arbitrary<SelectedField['source']>,
      });

      return fc.tuple(
        fc.constant(entity),
        fc.array(enrichmentFieldArb, { minLength: 1, maxLength: 10 }),
        fc.array(otherFieldArb, { minLength: 0, maxLength: 10 }),
      );
    });

    fc.assert(
      fc.property(testCaseArb, ([entity, enrichmentFields, otherFields]) => {
        const allFields = [...enrichmentFields, ...otherFields];
        // Create renames for some of these fields
        const renames: ColumnRename[] = allFields.map((f) => ({
          fieldKey: f.key,
          outputName: `output_${f.key}`,
        }));

        const result = applyDeselectionCleanup(allFields, renames, entity);

        // No fields with the deselected entity source should remain
        for (const field of result.selectedFields) {
          expect(field.source).not.toBe(entity);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('no renames referencing removed field keys remain in columnRenames', () => {
    const testCaseArb = enrichmentEntityArb.chain((entity) => {
      const otherSources = ALL_ENRICHMENT_ENTITIES.filter((e) => e !== entity);
      // Fields from the enrichment entity being deselected
      const enrichmentFieldArb = fc.record({
        key: fc.string({ minLength: 1, maxLength: 40 }).filter((s) => s.trim().length > 0).map((k) => `enrichment_${entity}_${k}`),
        label: fc.string({ minLength: 1, maxLength: 60 }).filter((s) => s.trim().length > 0),
        source: fc.constant(entity) as fc.Arbitrary<SelectedField['source']>,
      });
      // Fields from other sources
      const otherFieldArb = fc.record({
        key: fc.string({ minLength: 1, maxLength: 40 }).filter((s) => s.trim().length > 0).map((k) => `other_${k}`),
        label: fc.string({ minLength: 1, maxLength: 60 }).filter((s) => s.trim().length > 0),
        source: fc.constantFrom<string>('contact', ...otherSources) as fc.Arbitrary<SelectedField['source']>,
      });

      return fc.tuple(
        fc.constant(entity),
        fc.array(enrichmentFieldArb, { minLength: 1, maxLength: 10 }),
        fc.array(otherFieldArb, { minLength: 0, maxLength: 10 }),
      );
    });

    fc.assert(
      fc.property(testCaseArb, ([entity, enrichmentFields, otherFields]) => {
        const allFields = [...enrichmentFields, ...otherFields];
        const renames: ColumnRename[] = allFields.map((f) => ({
          fieldKey: f.key,
          outputName: `output_${f.key}`,
        }));

        const result = applyDeselectionCleanup(allFields, renames, entity);

        // Collect the keys of removed fields (fields with the deselected entity source)
        const removedFieldKeys = new Set(
          enrichmentFields.map((f) => f.key)
        );

        // No renames should reference keys of removed fields
        for (const rename of result.columnRenames) {
          expect(removedFieldKeys.has(rename.fieldKey)).toBe(false);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('all non-enrichment fields are preserved after deselection', () => {
    const testCaseArb = enrichmentEntityArb.chain((entity) => {
      const otherSources = ALL_ENRICHMENT_ENTITIES.filter((e) => e !== entity);
      const enrichmentFieldArb = fc.record({
        key: fc.string({ minLength: 1, maxLength: 40 }).filter((s) => s.trim().length > 0).map((k) => `enrichment_${entity}_${k}`),
        label: fc.string({ minLength: 1, maxLength: 60 }).filter((s) => s.trim().length > 0),
        source: fc.constant(entity) as fc.Arbitrary<SelectedField['source']>,
      });
      const otherFieldArb = fc.record({
        key: fc.string({ minLength: 1, maxLength: 40 }).filter((s) => s.trim().length > 0).map((k) => `other_${k}`),
        label: fc.string({ minLength: 1, maxLength: 60 }).filter((s) => s.trim().length > 0),
        source: fc.constantFrom<string>('contact', ...otherSources) as fc.Arbitrary<SelectedField['source']>,
      });

      return fc.tuple(
        fc.constant(entity),
        fc.array(enrichmentFieldArb, { minLength: 1, maxLength: 10 }),
        fc.array(otherFieldArb, { minLength: 1, maxLength: 10 }),
      );
    });

    fc.assert(
      fc.property(testCaseArb, ([entity, enrichmentFields, otherFields]) => {
        const allFields = [...enrichmentFields, ...otherFields];
        const renames: ColumnRename[] = allFields.map((f) => ({
          fieldKey: f.key,
          outputName: `output_${f.key}`,
        }));

        const result = applyDeselectionCleanup(allFields, renames, entity);

        // All non-enrichment fields should be preserved
        const resultKeys = new Set(result.selectedFields.map((f) => f.key));
        for (const field of otherFields) {
          expect(resultKeys.has(field.key)).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('renames for preserved fields are kept intact', () => {
    const testCaseArb = enrichmentEntityArb.chain((entity) => {
      const otherSources = ALL_ENRICHMENT_ENTITIES.filter((e) => e !== entity);
      const enrichmentFieldArb = fc.record({
        key: fc.string({ minLength: 1, maxLength: 40 }).filter((s) => s.trim().length > 0).map((k) => `enrichment_${entity}_${k}`),
        label: fc.string({ minLength: 1, maxLength: 60 }).filter((s) => s.trim().length > 0),
        source: fc.constant(entity) as fc.Arbitrary<SelectedField['source']>,
      });
      const otherFieldArb = fc.record({
        key: fc.string({ minLength: 1, maxLength: 40 }).filter((s) => s.trim().length > 0).map((k) => `other_${k}`),
        label: fc.string({ minLength: 1, maxLength: 60 }).filter((s) => s.trim().length > 0),
        source: fc.constantFrom<string>('contact', ...otherSources) as fc.Arbitrary<SelectedField['source']>,
      });

      return fc.tuple(
        fc.constant(entity),
        fc.array(enrichmentFieldArb, { minLength: 1, maxLength: 10 }),
        fc.array(otherFieldArb, { minLength: 1, maxLength: 10 }),
      );
    });

    fc.assert(
      fc.property(testCaseArb, ([entity, enrichmentFields, otherFields]) => {
        const allFields = [...enrichmentFields, ...otherFields];
        const renames: ColumnRename[] = allFields.map((f) => ({
          fieldKey: f.key,
          outputName: `output_${f.key}`,
        }));

        const result = applyDeselectionCleanup(allFields, renames, entity);

        // Every preserved field should still have its rename
        const resultRenameKeys = new Set(result.columnRenames.map((r) => r.fieldKey));
        for (const field of otherFields) {
          expect(resultRenameKeys.has(field.key)).toBe(true);
        }

        // Verify rename values are unchanged
        for (const rename of result.columnRenames) {
          expect(rename.outputName).toBe(`output_${rename.fieldKey}`);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('deselection with empty selectedFields and columnRenames produces empty results', () => {
    fc.assert(
      fc.property(enrichmentEntityArb, (entity) => {
        const result = applyDeselectionCleanup([], [], entity);
        expect(result.selectedFields).toEqual([]);
        expect(result.columnRenames).toEqual([]);
      }),
      { numRuns: 100 }
    );
  });
});
