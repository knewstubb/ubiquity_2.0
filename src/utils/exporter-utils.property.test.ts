import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getFieldsForSources, getEventFields, reorderFields, resolveTimestamp, resolveColumnName, validateColumnName, validateColumnNames, validatePrefix } from './exporter-utils';
import type { ExportDataType, SelectedField } from '../models/automation';
import { CONTACT_FIELDS, TREATMENT_FIELDS } from '../data/fieldRegistry';
import type { FieldDefinition } from '../data/fieldRegistry';
import { EVENT_FIELDS } from '../models/wizard';
import type { EventSource, ColumnRename } from '../models/wizard';

// Known field definitions per source (mirrors the internal mapping in exporter-utils.ts)
const MAILOUT_FIELDS: FieldDefinition[] = [
  { key: 'mailout_id', label: 'Mailout ID', source: 'contact', dataType: 'string' },
  { key: 'mailout_name', label: 'Mailout Name', source: 'contact', dataType: 'string' },
  { key: 'send_date', label: 'Send Date', source: 'contact', dataType: 'date' },
  { key: 'recipient_count', label: 'Recipient Count', source: 'contact', dataType: 'number' },
  { key: 'open_rate', label: 'Open Rate', source: 'contact', dataType: 'number' },
  { key: 'click_rate', label: 'Click Rate', source: 'contact', dataType: 'number' },
];

const SOURCE_FIELD_MAP: Record<ExportDataType, FieldDefinition[]> = {
  contact: CONTACT_FIELDS,
  transactional: TREATMENT_FIELDS,
  mailout: MAILOUT_FIELDS,
};

const ALL_SOURCES: ExportDataType[] = ['contact', 'transactional', 'mailout'];
const ALL_EVENT_SOURCES: EventSource[] = ['mailout_sends', 'campaign_events', 'failed_sends'];
const nonEmptySourceSubset = fc.subarray(ALL_SOURCES, { minLength: 1, maxLength: 3 });

/**
 * Property 1: Contact/Transactional field list is the union of selected sources
 * **Validates: Requirements 3.3**
 */
describe('Feature: exporter-wizard-rework, Property 1: Contact/Transactional field list is the union of selected sources', () => {
  it('result contains no duplicate keys', () => {
    fc.assert(
      fc.property(nonEmptySourceSubset, (sources) => {
        const result = getFieldsForSources(sources);
        const keys = result.map((f) => f.key);
        expect(new Set(keys).size).toBe(keys.length);
      }),
      { numRuns: 100 }
    );
  });

  it('result length equals the unique field count from all selected sources', () => {
    fc.assert(
      fc.property(nonEmptySourceSubset, (sources) => {
        const result = getFieldsForSources(sources);
        const expectedKeys = new Set<string>();
        for (const source of sources) {
          for (const field of SOURCE_FIELD_MAP[source]) {
            expectedKeys.add(field.key);
          }
        }
        expect(result.length).toBe(expectedKeys.size);
      }),
      { numRuns: 100 }
    );
  });

  it('result contains only fields from selected sources (no fields from unselected sources)', () => {
    fc.assert(
      fc.property(nonEmptySourceSubset, (sources) => {
        const result = getFieldsForSources(sources);
        const unselectedSources = ALL_SOURCES.filter((s) => !sources.includes(s));
        const unselectedKeys = new Set<string>();
        for (const source of unselectedSources) {
          for (const field of SOURCE_FIELD_MAP[source]) {
            // Only count keys that are exclusive to unselected sources
            const isInSelectedSource = sources.some((s) =>
              SOURCE_FIELD_MAP[s].some((f) => f.key === field.key)
            );
            if (!isInSelectedSource) {
              unselectedKeys.add(field.key);
            }
          }
        }
        const resultKeys = new Set(result.map((f) => f.key));
        for (const key of unselectedKeys) {
          expect(resultKeys.has(key)).toBe(false);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('result contains all fields from each selected source', () => {
    fc.assert(
      fc.property(nonEmptySourceSubset, (sources) => {
        const result = getFieldsForSources(sources);
        const resultKeys = new Set(result.map((f) => f.key));
        for (const source of sources) {
          for (const field of SOURCE_FIELD_MAP[source]) {
            expect(resultKeys.has(field.key)).toBe(true);
          }
        }
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 2: Event field generation produces deduplicated union
 * **Validates: Requirements 4.3, 5.1, 5.6**
 */
describe('Feature: exporter-wizard-rework, Property 2: Event field generation produces deduplicated union', () => {
  const nonEmptyEventSourceSubsetArb = fc.subarray(ALL_EVENT_SOURCES, {
    minLength: 1,
    maxLength: ALL_EVENT_SOURCES.length,
  });

  it('result contains no duplicate keys', () => {
    fc.assert(
      fc.property(nonEmptyEventSourceSubsetArb, (sources) => {
        const result = getEventFields(sources);
        const keys = result.map((f) => f.key);
        expect(new Set(keys).size).toBe(keys.length);
      }),
      { numRuns: 100 }
    );
  });

  it('result contains all unique fields from selected sources', () => {
    fc.assert(
      fc.property(nonEmptyEventSourceSubsetArb, (sources) => {
        const result = getEventFields(sources);
        const resultKeys = new Set(result.map((f) => f.key));
        for (const source of sources) {
          for (const field of EVENT_FIELDS[source]) {
            expect(resultKeys.has(field.key)).toBe(true);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  it('result contains only fields from selected sources (no extras)', () => {
    fc.assert(
      fc.property(nonEmptyEventSourceSubsetArb, (sources) => {
        const result = getEventFields(sources);
        const resultKeys = new Set(result.map((f) => f.key));
        const expectedKeys = new Set<string>();
        for (const source of sources) {
          for (const field of EVENT_FIELDS[source]) {
            expectedKeys.add(field.key);
          }
        }
        expect(resultKeys).toEqual(expectedKeys);
      }),
      { numRuns: 100 }
    );
  });

  it('shared fields across multiple sources appear only once', () => {
    fc.assert(
      fc.property(nonEmptyEventSourceSubsetArb, (sources) => {
        const result = getEventFields(sources);
        const keyCounts = new Map<string, number>();
        for (const field of result) {
          keyCounts.set(field.key, (keyCounts.get(field.key) ?? 0) + 1);
        }
        for (const [, count] of keyCounts) {
          expect(count).toBe(1);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('result length equals the number of unique keys across selected sources', () => {
    fc.assert(
      fc.property(nonEmptyEventSourceSubsetArb, (sources) => {
        const result = getEventFields(sources);
        const expectedKeys = new Set<string>();
        for (const source of sources) {
          for (const field of EVENT_FIELDS[source]) {
            expectedKeys.add(field.key);
          }
        }
        expect(result.length).toBe(expectedKeys.size);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 3: Reorder preserves field set membership
 * **Validates: Requirements 3.4, 5.4**
 */
describe('Feature: exporter-wizard-rework, Property 3: Reorder preserves field set membership', () => {
  const sourceArb = fc.constantFrom<SelectedField['source']>('contact', 'treatment', 'product', 'event');
  const selectedFieldArb = fc.record({
    key: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
    label: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
    source: sourceArb,
  });
  const uniqueFieldsArb = fc
    .array(selectedFieldArb, { minLength: 2, maxLength: 20 })
    .map((fields) => {
      const seen = new Set<string>();
      return fields.filter((f) => {
        if (seen.has(f.key)) return false;
        seen.add(f.key);
        return true;
      });
    })
    .filter((fields) => fields.length >= 2);

  it('result length equals input length after reorder', () => {
    fc.assert(
      fc.property(
        uniqueFieldsArb.chain((fields) =>
          fc.tuple(
            fc.constant(fields),
            fc.integer({ min: 0, max: fields.length - 1 }),
            fc.integer({ min: 0, max: fields.length - 1 })
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

  it('result contains exactly the same set of keys as input', () => {
    fc.assert(
      fc.property(
        uniqueFieldsArb.chain((fields) =>
          fc.tuple(
            fc.constant(fields),
            fc.integer({ min: 0, max: fields.length - 1 }),
            fc.integer({ min: 0, max: fields.length - 1 })
          )
        ),
        ([fields, fromIndex, toIndex]) => {
          const result = reorderFields(fields, fromIndex, toIndex);
          const inputKeys = new Set(fields.map((f) => f.key));
          const resultKeys = new Set(result.map((f) => f.key));
          expect(resultKeys).toEqual(inputKeys);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('reorder does not mutate the original array', () => {
    fc.assert(
      fc.property(
        uniqueFieldsArb.chain((fields) =>
          fc.tuple(
            fc.constant(fields),
            fc.integer({ min: 0, max: fields.length - 1 }),
            fc.integer({ min: 0, max: fields.length - 1 })
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
});

/**
 * Property 9: Timestamp token resolution format
 * **Validates: Requirements 7.3**
 */
describe('Feature: exporter-wizard-rework, Property 9: Timestamp token resolution format', () => {
  it('resolveTimestamp produces a string matching YYYYMMDD-HHmmss for any valid Date', () => {
    const dateArb = fc.integer({
      min: new Date('1000-01-01T00:00:00.000Z').getTime(),
      max: new Date('9999-12-31T23:59:59.999Z').getTime(),
    }).map((ts) => new Date(ts));

    fc.assert(
      fc.property(dateArb, (date) => {
        const result = resolveTimestamp(date);
        expect(result).toMatch(/^\d{8}-\d{6}$/);
        expect(result.length).toBe(15);
        expect(parseInt(result.slice(0, 4), 10)).toBe(date.getUTCFullYear());
        expect(parseInt(result.slice(4, 6), 10)).toBe(date.getUTCMonth() + 1);
        expect(parseInt(result.slice(6, 8), 10)).toBe(date.getUTCDate());
        expect(parseInt(result.slice(9, 11), 10)).toBe(date.getUTCHours());
        expect(parseInt(result.slice(11, 13), 10)).toBe(date.getUTCMinutes());
        expect(parseInt(result.slice(13, 15), 10)).toBe(date.getUTCSeconds());
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 7: Duplicate column name detection
 * For any list of resolved output column names where two or more names are identical
 * (case-sensitive comparison), the validation function should return a duplicate error
 * identifying the conflicting name.
 *
 * **Validates: Requirements 6.6**
 */
describe('Feature: exporter-wizard-rework, Property 7: Duplicate column name detection', () => {
  it('arrays with injected duplicates return valid=false with the duplicate name in duplicates array', () => {
    // Generator: create a unique array, then inject a duplicate by picking one element and inserting it again
    const namesWithDuplicateArb = fc
      .array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 1, maxLength: 20 })
      .chain((baseNames): fc.Arbitrary<{ names: string[]; duplicateName: string }> => {
        const uniqueNames = [...new Set(baseNames)];
        if (uniqueNames.length === 0) {
          return fc.constant({ names: ['a', 'a'] as string[], duplicateName: 'a' });
        }
        return fc.tuple(
          fc.integer({ min: 0, max: uniqueNames.length - 1 }),
          fc.integer({ min: 0, max: uniqueNames.length })
        ).map(([pickIdx, insertIdx]): { names: string[]; duplicateName: string } => {
          const duplicateName = uniqueNames[pickIdx];
          const names = [...uniqueNames];
          names.splice(insertIdx, 0, duplicateName);
          return { names, duplicateName };
        });
      });

    fc.assert(
      fc.property(namesWithDuplicateArb, ({ names, duplicateName }) => {
        const result = validateColumnNames(names);
        expect(result.valid).toBe(false);
        expect(result.duplicates).toContain(duplicateName);
      }),
      { numRuns: 100 }
    );
  });

  it('arrays of unique strings return valid=true with empty duplicates', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.string({ minLength: 1, maxLength: 30 }), {
          minLength: 0,
          maxLength: 50,
          comparator: (a, b) => a === b,
        }),
        (uniqueNames) => {
          const result = validateColumnNames(uniqueNames);
          expect(result.valid).toBe(true);
          expect(result.duplicates).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('case-sensitivity: names differing only in case are treated as different', () => {
    // Generate lowercase-only strings of length >= 1 that contain at least one letter
    const lowerAlphaArb = fc
      .array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 1, maxLength: 20 })
      .map((chars) => chars.join(''));

    fc.assert(
      fc.property(lowerAlphaArb, (baseName) => {
        const lower = baseName.toLowerCase();
        const upper = baseName.toUpperCase();
        // Since lower !== upper (case differs), they should be treated as unique
        const result = validateColumnNames([lower, upper]);
        expect(result.valid).toBe(true);
        expect(result.duplicates).toEqual([]);
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * Property 4: Event fields are immutable
 * For any set of predefined event fields in the field mapping step, no deselect or remove
 * operation should alter the set of event fields. After any sequence of user deselect actions,
 * the event field set should remain identical to the initial predefined set.
 *
 * **Validates: Requirements 5.3**
 */
describe('Feature: exporter-wizard-rework, Property 4: Event fields are immutable', () => {
  const nonEmptyEventSourceSubsetArb = fc.subarray(ALL_EVENT_SOURCES, {
    minLength: 1,
    maxLength: ALL_EVENT_SOURCES.length,
  });

  it('EVENT_FIELDS constant is not mutated after calling getEventFields', () => {
    // Take a deep snapshot of EVENT_FIELDS before any operations
    const snapshotBefore = JSON.parse(JSON.stringify(EVENT_FIELDS));

    fc.assert(
      fc.property(nonEmptyEventSourceSubsetArb, (sources) => {
        // Call getEventFields — this should not mutate EVENT_FIELDS
        getEventFields(sources);

        // Verify EVENT_FIELDS is unchanged
        expect(EVENT_FIELDS).toEqual(snapshotBefore);
      }),
      { numRuns: 100 }
    );
  });

  it('calling getEventFields multiple times with the same input returns identical results', () => {
    fc.assert(
      fc.property(nonEmptyEventSourceSubsetArb, (sources) => {
        const result1 = getEventFields(sources);
        const result2 = getEventFields(sources);
        expect(result1).toEqual(result2);
      }),
      { numRuns: 100 }
    );
  });

  it('simulating deselect operations on the result does not alter EVENT_FIELDS', () => {
    fc.assert(
      fc.property(
        nonEmptyEventSourceSubsetArb.chain((sources) => {
          // Get the event fields for these sources
          const fields = getEventFields(sources);
          if (fields.length === 0) {
            return fc.constant({ sources, keysToDeselect: [] as string[] });
          }
          // Generate a random subset of keys to "deselect" (filter out)
          const allKeys = fields.map((f) => f.key);
          return fc.subarray(allKeys, { minLength: 0, maxLength: allKeys.length }).map(
            (keysToDeselect) => ({ sources, keysToDeselect })
          );
        }),
        ({ sources, keysToDeselect }) => {
          // Snapshot EVENT_FIELDS before the operation
          const snapshotBefore = JSON.parse(JSON.stringify(EVENT_FIELDS));

          // Get event fields
          const eventFields = getEventFields(sources);

          // Simulate user "deselect" — filter out some keys from the result
          const _afterDeselect = eventFields.filter(
            (f) => !keysToDeselect.includes(f.key)
          );

          // The EVENT_FIELDS constant must remain unchanged
          expect(EVENT_FIELDS).toEqual(snapshotBefore);

          // Calling getEventFields again should still return the same predefined set
          const eventFieldsAgain = getEventFields(sources);
          expect(eventFieldsAgain).toEqual(eventFields);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('mutating the returned array does not affect subsequent calls', () => {
    fc.assert(
      fc.property(nonEmptyEventSourceSubsetArb, (sources) => {
        const result1 = getEventFields(sources);

        // Simulate mutation of the returned array (e.g., user removes items)
        result1.splice(0, result1.length);

        // A fresh call should still return the full predefined set
        const result2 = getEventFields(sources);
        const expectedKeys = new Set<string>();
        for (const source of sources) {
          for (const field of EVENT_FIELDS[source]) {
            expectedKeys.add(field.key);
          }
        }
        expect(result2.length).toBe(expectedKeys.size);
        for (const field of result2) {
          expect(expectedKeys.has(field.key)).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });
});

describe('Feature: exporter-wizard-rework, Property 8: File naming prefix validation', () => {
  /**
   * **Validates: Requirements 7.2, 7.5**
   *
   * For any string, the prefix validation function should return valid if and only if
   * the string is between 1 and 100 characters (inclusive) and contains only characters
   * matching [a-zA-Z0-9_-].
   */

  const validCharsArray = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-'.split('');

  // Generator for valid prefix strings (1-100 chars from [a-zA-Z0-9_-])
  const validPrefixArb = fc
    .array(fc.constantFrom(...validCharsArray), { minLength: 1, maxLength: 100 })
    .map((chars) => chars.join(''));

  it('valid prefixes (1-100 chars from [a-zA-Z0-9_-]) return true', () => {
    fc.assert(
      fc.property(validPrefixArb, (prefix) => {
        expect(validatePrefix(prefix)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('empty strings return false', () => {
    expect(validatePrefix('')).toBe(false);
  });

  it('strings longer than 100 chars (even with valid chars) return false', () => {
    const longValidPrefixArb = fc
      .array(fc.constantFrom(...validCharsArray), { minLength: 101, maxLength: 300 })
      .map((chars) => chars.join(''));

    fc.assert(
      fc.property(longValidPrefixArb, (prefix) => {
        expect(validatePrefix(prefix)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('strings with invalid characters (spaces, dots, special chars) return false', () => {
    const invalidCharsArray = ' .!@#$%^&*()+=[]{}|\\:;"\'<>,?/~`'.split('');
    const invalidCharArb = fc.constantFrom(...invalidCharsArray);
    const validPartArb = fc
      .array(fc.constantFrom(...validCharsArray), { minLength: 0, maxLength: 50 })
      .map((chars) => chars.join(''));

    // Generate strings that contain at least one invalid character, within valid length range
    const invalidPrefixArb = fc
      .tuple(validPartArb, invalidCharArb, validPartArb)
      .map(([before, invalid, after]) => before + invalid + after)
      .filter((s) => s.length >= 1 && s.length <= 100);

    fc.assert(
      fc.property(invalidPrefixArb, (prefix) => {
        expect(validatePrefix(prefix)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('for any arbitrary string, validatePrefix returns true iff 1-100 chars and all chars match [a-zA-Z0-9_-]', () => {
    const arbitraryStringArb = fc.string({ minLength: 0, maxLength: 200 });

    fc.assert(
      fc.property(arbitraryStringArb, (s) => {
        const isValidLength = s.length >= 1 && s.length <= 100;
        const hasOnlyValidChars = /^[a-zA-Z0-9_-]+$/.test(s);
        const expected = isValidLength && hasOnlyValidChars;

        expect(validatePrefix(s)).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * Property 5: Column name resolution
 * For any selected field, the resolved output column name should equal the custom rename
 * value if one exists in the columnRenames list for that field's key, otherwise it should
 * equal the field's default label.
 *
 * **Validates: Requirements 6.2, 6.3**
 */
describe('Feature: exporter-wizard-rework, Property 5: Column name resolution', () => {
  // Generator for a non-empty field key
  const fieldKeyArb = fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0);

  // Generator for a default label
  const defaultLabelArb = fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0);

  // Generator for a custom output name
  const outputNameArb = fc.string({ minLength: 1, maxLength: 128 }).filter((s) => s.trim().length > 0);

  // Generator for a ColumnRename entry
  const columnRenameArb = fc.record({
    fieldKey: fieldKeyArb,
    outputName: outputNameArb,
  });

  it('returns the custom rename outputName when a rename exists for the field key', () => {
    fc.assert(
      fc.property(
        fieldKeyArb,
        defaultLabelArb,
        outputNameArb,
        fc.array(columnRenameArb, { minLength: 0, maxLength: 10 }),
        (fieldKey, defaultLabel, customName, otherRenames) => {
          // Ensure the target rename is present in the list
          const targetRename: ColumnRename = { fieldKey, outputName: customName };
          // Filter out any accidental matches for the same fieldKey from otherRenames
          const filteredOthers = otherRenames.filter((r) => r.fieldKey !== fieldKey);
          const renames = [...filteredOthers, targetRename];

          const result = resolveColumnName(fieldKey, renames, defaultLabel);
          expect(result).toBe(customName);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns the default label when no rename exists for the field key', () => {
    fc.assert(
      fc.property(
        fieldKeyArb,
        defaultLabelArb,
        fc.array(columnRenameArb, { minLength: 0, maxLength: 10 }),
        (fieldKey, defaultLabel, renames) => {
          // Ensure no rename matches the target fieldKey
          const filteredRenames = renames.filter((r) => r.fieldKey !== fieldKey);

          const result = resolveColumnName(fieldKey, filteredRenames, defaultLabel);
          expect(result).toBe(defaultLabel);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('uses the first matching rename when multiple renames exist for the same key', () => {
    fc.assert(
      fc.property(
        fieldKeyArb,
        defaultLabelArb,
        outputNameArb,
        outputNameArb,
        (fieldKey, defaultLabel, firstName, secondName) => {
          const renames: ColumnRename[] = [
            { fieldKey, outputName: firstName },
            { fieldKey, outputName: secondName },
          ];

          const result = resolveColumnName(fieldKey, renames, defaultLabel);
          expect(result).toBe(firstName);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns default label when renames array is empty', () => {
    fc.assert(
      fc.property(fieldKeyArb, defaultLabelArb, (fieldKey, defaultLabel) => {
        const result = resolveColumnName(fieldKey, [], defaultLabel);
        expect(result).toBe(defaultLabel);
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * Property 6: Column name validation rejects invalid input
 * For any string that is empty, composed entirely of whitespace characters, or exceeds
 * 128 characters in length, the column name validation function should return a validation error.
 *
 * **Validates: Requirements 6.1, 6.5**
 */
describe('Feature: exporter-wizard-rework, Property 6: Column name validation rejects invalid input', () => {
  it('empty strings are rejected', () => {
    const result = validateColumnName('');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('whitespace-only strings (random lengths of spaces/tabs/newlines) are rejected', () => {
    const whitespaceChars = [' ', '\t', '\n', '\r', '\f', '\v'];
    const whitespaceOnlyArb = fc
      .array(fc.constantFrom(...whitespaceChars), { minLength: 1, maxLength: 128 })
      .map((chars) => chars.join(''));

    fc.assert(
      fc.property(whitespaceOnlyArb, (name) => {
        const result = validateColumnName(name);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  it('strings exceeding 128 characters are rejected', () => {
    const longStringArb = fc.string({ minLength: 129, maxLength: 500 });

    fc.assert(
      fc.property(longStringArb, (name) => {
        const result = validateColumnName(name);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  it('valid strings (1-128 chars, at least one non-whitespace) are accepted', () => {
    // Generate strings that have at least one non-whitespace character and are 1-128 chars
    const validColumnNameArb = fc
      .string({ minLength: 1, maxLength: 128 })
      .filter((s) => s.trim().length > 0);

    fc.assert(
      fc.property(validColumnNameArb, (name) => {
        const result = validateColumnName(name);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });
});
