// Feature: field-mapping-source-panel, Property 9: Reorder Across Source Boundaries

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { reorderFields } from '../exporter-utils';
import type { SelectedField } from '../../models/automation';

// ─── Generators ──────────────────────────────────────────────────────────────

/**
 * Generate source values representing the multi-source scenario:
 * contacts (base), messages, and transaction databases.
 * We cast these to SelectedField['source'] to match the function signature,
 * mirroring the runtime cast pattern used in FieldMappingStep.
 */
const mixedSourceArb = fc.constantFrom(
  'contacts' as SelectedField['source'],
  'messages' as SelectedField['source'],
  'txn:tdb-bookings' as SelectedField['source'],
  'txn:tdb-purchases' as SelectedField['source'],
  'txn:tdb-appointments' as SelectedField['source'],
);

/**
 * Generate a SelectedField with a mixed source value.
 * Uses unique key suffixes to avoid key collisions.
 */
const selectedFieldArb = fc.record({
  key: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
  label: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
  source: mixedSourceArb,
});

/**
 * Generate an array of SelectedFields with unique keys (minimum 2 elements for reorder).
 * Ensures mixed source values are present.
 */
const uniqueFieldsArb = fc
  .array(selectedFieldArb, { minLength: 2, maxLength: 30 })
  .map((fields) => {
    const seen = new Set<string>();
    return fields.filter((f) => {
      if (seen.has(f.key)) return false;
      seen.add(f.key);
      return true;
    });
  })
  .filter((fields) => fields.length >= 2);

/**
 * Generate a fields array with guaranteed mixed sources (at least 2 different source values).
 */
const mixedSourceFieldsArb = uniqueFieldsArb.filter((fields) => {
  const sources = new Set(fields.map((f) => f.source));
  return sources.size >= 2;
});

// ─── Property 9: Reorder Across Source Boundaries ────────────────────────────

/**
 * Property 9: Reorder Across Source Boundaries
 *
 * For any array of SelectedField items with mixed source values,
 * applying reorderFields(fields, fromIndex, toIndex) SHALL produce an array
 * of the same length with the element at fromIndex moved to toIndex,
 * regardless of the source values of adjacent elements.
 *
 * **Validates: Requirements 7.3**
 */
describe('Feature: field-mapping-source-panel, Property 9: Reorder Across Source Boundaries', () => {
  it('array length is unchanged after reorder across source boundaries', () => {
    fc.assert(
      fc.property(
        mixedSourceFieldsArb.chain((fields) =>
          fc.tuple(
            fc.constant(fields),
            fc.integer({ min: 0, max: fields.length - 1 }),
            fc.integer({ min: 0, max: fields.length - 1 }),
          )
        ),
        ([fields, fromIndex, toIndex]) => {
          const result = reorderFields(fields, fromIndex, toIndex);
          expect(result.length).toBe(fields.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('the element that was at fromIndex is now at toIndex', () => {
    fc.assert(
      fc.property(
        mixedSourceFieldsArb.chain((fields) =>
          fc.tuple(
            fc.constant(fields),
            fc.integer({ min: 0, max: fields.length - 1 }),
            fc.integer({ min: 0, max: fields.length - 1 }),
          )
        ),
        ([fields, fromIndex, toIndex]) => {
          const movedElement = fields[fromIndex];
          const result = reorderFields(fields, fromIndex, toIndex);
          expect(result[toIndex]).toEqual(movedElement);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('all original elements are still present after reorder (just reordered)', () => {
    fc.assert(
      fc.property(
        mixedSourceFieldsArb.chain((fields) =>
          fc.tuple(
            fc.constant(fields),
            fc.integer({ min: 0, max: fields.length - 1 }),
            fc.integer({ min: 0, max: fields.length - 1 }),
          )
        ),
        ([fields, fromIndex, toIndex]) => {
          const result = reorderFields(fields, fromIndex, toIndex);

          // All original keys still present
          const inputKeys = fields.map((f) => f.key).sort();
          const resultKeys = result.map((f) => f.key).sort();
          expect(resultKeys).toEqual(inputKeys);

          // All original elements (by reference equality on key+label+source) still present
          const inputSet = new Set(fields.map((f) => `${f.key}|${f.label}|${f.source}`));
          const resultSet = new Set(result.map((f) => `${f.key}|${f.label}|${f.source}`));
          expect(resultSet).toEqual(inputSet);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('reorder does not mutate the original array', () => {
    fc.assert(
      fc.property(
        mixedSourceFieldsArb.chain((fields) =>
          fc.tuple(
            fc.constant(fields),
            fc.integer({ min: 0, max: fields.length - 1 }),
            fc.integer({ min: 0, max: fields.length - 1 }),
          )
        ),
        ([fields, fromIndex, toIndex]) => {
          const originalCopy = fields.map((f) => ({ ...f }));
          reorderFields(fields, fromIndex, toIndex);
          expect(fields).toEqual(originalCopy);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('source values of non-moved elements remain unchanged relative to each other', () => {
    fc.assert(
      fc.property(
        mixedSourceFieldsArb.chain((fields) =>
          fc.tuple(
            fc.constant(fields),
            fc.integer({ min: 0, max: fields.length - 1 }),
            fc.integer({ min: 0, max: fields.length - 1 }),
          )
        ),
        ([fields, fromIndex, toIndex]) => {
          const result = reorderFields(fields, fromIndex, toIndex);

          // After removing the moved element from both input and result,
          // the remaining elements should be in the same order
          const inputWithout = fields.filter((_, i) => i !== fromIndex);
          const resultWithout = result.filter((_, i) => i !== toIndex);
          expect(resultWithout.map((f) => f.key)).toEqual(inputWithout.map((f) => f.key));
        }
      ),
      { numRuns: 100 }
    );
  });
});
