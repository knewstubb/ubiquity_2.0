import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { validateValue } from '../validation'
import { isConditionInvalid } from '../group-helpers'
import type { CardFilterRow, SourceCategoryConfig, FilterFieldDef } from '../types'

// ─── Arbitraries ─────────────────────────────────────────────────────────────

/** Generates a valid ISO date string (YYYY-MM-DD) within a reasonable range. */
const arbValidDateString = fc
  .tuple(
    fc.integer({ min: 1900, max: 2100 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 })
  )
  .map(([y, m, d]) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`)

/** Generates a string that is NOT a valid date (no valid parse). */
const arbInvalidDateString = fc.oneof(
  fc.constant(''),
  fc.constant('not-a-date'),
  fc.constant('2024-13-45'),
  fc.constant('abc/def/ghi'),
  fc.constant('xxxx-yy-zz')
)

/** Generates a whole number in valid range [1, 3650]. */
const arbValidNDays = fc.integer({ min: 1, max: 3650 })

/** Generates a number outside valid range or not a whole number. */
const arbInvalidNDays = fc.oneof(
  fc.integer({ min: -1000, max: 0 }),
  fc.integer({ min: 3651, max: 100000 }),
  fc.double({ min: 0.01, max: 3649.99, noNaN: true }).filter((n) => !Number.isInteger(n))
)

/** Generates a non-empty key string for use in config/row keys. */
const arbKey = fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0)

/** Generates a FilterFieldDef. */
const arbFieldDef: fc.Arbitrary<FilterFieldDef> = fc.record({
  key: arbKey,
  label: fc.string({ minLength: 1, maxLength: 40 }),
  dataType: fc.constantFrom('text' as const, 'number' as const, 'date' as const, 'boolean' as const, 'enum' as const),
})

/** Generates a SourceCategoryConfig (without icon — not relevant for logic tests). */
const arbSourceCategoryConfig: fc.Arbitrary<SourceCategoryConfig> = fc.record({
  key: arbKey,
  icon: fc.constant(null as unknown as React.ReactNode),
  title: fc.string({ minLength: 1, maxLength: 40 }),
  description: fc.string({ minLength: 1, maxLength: 120 }),
  fields: fc.array(arbFieldDef, { minLength: 1, maxLength: 5 }),
  subSources: fc.option(
    fc.array(
      fc.record({
        key: arbKey,
        label: fc.string({ minLength: 1, maxLength: 30 }),
        fields: fc.array(arbFieldDef, { minLength: 1, maxLength: 5 }),
      }),
      { minLength: 1, maxLength: 3 }
    ),
    { nil: undefined }
  ),
})

/** Generates a valid CardFilterRow value (all JSON-serializable types). */
const arbValue = fc.oneof(
  fc.string({ minLength: 0, maxLength: 50 }),
  fc.integer({ min: -10000, max: 10000 }).filter((n) => !Object.is(n, -0)),
  fc.double({ min: -10000, max: 10000, noNaN: true }).filter((n) => !Object.is(n, -0)),
  fc.boolean(),
  fc.constant(null),
  fc.tuple(arbValidDateString, arbValidDateString).map(([a, b]) => [a, b] as [string, string])
)

/** Generates a complete CardFilterRow with arbitrary values. */
const arbCardFilterRow: fc.Arbitrary<CardFilterRow> = fc.record({
  sourceCategory: fc.string({ minLength: 0, maxLength: 30 }),
  subSource: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: null }),
  field: fc.string({ minLength: 0, maxLength: 30 }),
  operator: fc.string({ minLength: 0, maxLength: 30 }),
  value: arbValue,
  dateMode: fc.oneof(
    fc.constant('specific' as const),
    fc.constant('anniversary' as const),
    fc.constant('same_day' as const),
    fc.constant(null)
  ),
})

// ═══════════════════════════════════════════════════════════════════════════════
// Feature: card-based-filter-builder, Property 13: Date range validation
// ═══════════════════════════════════════════════════════════════════════════════

describe('Feature: card-based-filter-builder, Property 13: Date range validation', () => {
  /**
   * **Validates: Requirements 7.9, 7.10**
   *
   * Between passes iff both dates are valid and start ≤ end.
   */
  it('Between operator passes iff both dates are valid and start ≤ end', () => {
    // Test with two valid date strings
    fc.assert(
      fc.property(arbValidDateString, arbValidDateString, (dateA, dateB) => {
        const [start, end] = [dateA, dateB].sort()
        const resultOrdered = validateValue('date', 'between', [start, end])
        expect(resultOrdered.valid).toBe(true)

        // Reversed order should fail when start > end
        if (start !== end) {
          const resultReversed = validateValue('date', 'between', [end, start])
          expect(resultReversed.valid).toBe(false)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('Between operator fails when either date is invalid', () => {
    fc.assert(
      fc.property(arbValidDateString, arbInvalidDateString, (valid, invalid) => {
        // Invalid start
        const result1 = validateValue('date', 'between', [invalid, valid])
        expect(result1.valid).toBe(false)

        // Invalid end
        const result2 = validateValue('date', 'between', [valid, invalid])
        expect(result2.valid).toBe(false)

        // Both invalid
        const result3 = validateValue('date', 'between', [invalid, invalid])
        expect(result3.valid).toBe(false)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * **Validates: Requirements 7.10**
   *
   * In last N days passes iff N is a whole number where 1 ≤ N ≤ 3650.
   */
  it('In last N days passes iff N is a whole number between 1 and 3650', () => {
    fc.assert(
      fc.property(arbValidNDays, (n) => {
        const result = validateValue('date', 'in_last_n_days', n)
        expect(result.valid).toBe(true)
      }),
      { numRuns: 100 }
    )
  })

  it('In last N days fails for values outside [1, 3650] or non-whole numbers', () => {
    fc.assert(
      fc.property(arbInvalidNDays, (n) => {
        const result = validateValue('date', 'in_last_n_days', n)
        expect(result.valid).toBe(false)
      }),
      { numRuns: 100 }
    )
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// Feature: card-based-filter-builder, Property 15: Invalid condition detection on config change
// ═══════════════════════════════════════════════════════════════════════════════

describe('Feature: card-based-filter-builder, Property 15: Invalid condition detection on config change', () => {
  /**
   * **Validates: Requirements 9.3**
   *
   * Conditions with missing keys are invalid; those with present keys are not.
   */
  it('condition with sourceCategory and field keys present in config is NOT invalid', () => {
    fc.assert(
      fc.property(arbSourceCategoryConfig, (config) => {
        // Pick a field from the config's top-level fields
        const field = config.fields[0]
        const row: CardFilterRow = {
          sourceCategory: config.key,
          subSource: null,
          field: field.key,
          operator: 'equals',
          value: 'test',
          dateMode: null,
        }
        expect(isConditionInvalid(row, [config])).toBe(false)
      }),
      { numRuns: 100 }
    )
  })

  it('condition with field key from sub-source fields is NOT invalid', () => {
    // Generate configs that always have sub-sources
    const arbConfigWithSub = arbSourceCategoryConfig.filter(
      (c) => c.subSources !== undefined && c.subSources.length > 0
    )

    fc.assert(
      fc.property(arbConfigWithSub, (config) => {
        const subSource = config.subSources![0]
        const field = subSource.fields[0]
        const row: CardFilterRow = {
          sourceCategory: config.key,
          subSource: subSource.key,
          field: field.key,
          operator: 'equals',
          value: 'test',
          dateMode: null,
        }
        expect(isConditionInvalid(row, [config])).toBe(false)
      }),
      { numRuns: 100 }
    )
  })

  it('condition with missing sourceCategory key IS invalid', () => {
    fc.assert(
      fc.property(arbSourceCategoryConfig, arbKey, (config, missingKey) => {
        // Ensure missingKey doesn't accidentally match
        fc.pre(missingKey !== config.key)

        const row: CardFilterRow = {
          sourceCategory: missingKey,
          subSource: null,
          field: config.fields[0].key,
          operator: 'equals',
          value: 'test',
          dateMode: null,
        }
        expect(isConditionInvalid(row, [config])).toBe(true)
      }),
      { numRuns: 100 }
    )
  })

  it('condition with missing field key IS invalid', () => {
    fc.assert(
      fc.property(arbSourceCategoryConfig, arbKey, (config, missingFieldKey) => {
        // Ensure missingFieldKey doesn't match any field in the config
        const allFieldKeys = [
          ...config.fields.map((f) => f.key),
          ...(config.subSources?.flatMap((s) => s.fields.map((f) => f.key)) ?? []),
        ]
        fc.pre(!allFieldKeys.includes(missingFieldKey))

        const row: CardFilterRow = {
          sourceCategory: config.key,
          subSource: null,
          field: missingFieldKey,
          operator: 'equals',
          value: 'test',
          dateMode: null,
        }
        expect(isConditionInvalid(row, [config])).toBe(true)
      }),
      { numRuns: 100 }
    )
  })

  it('condition with empty sourceCategory is invalid', () => {
    fc.assert(
      fc.property(arbSourceCategoryConfig, (config) => {
        const row: CardFilterRow = {
          sourceCategory: '',
          subSource: null,
          field: config.fields[0].key,
          operator: 'equals',
          value: 'test',
          dateMode: null,
        }
        expect(isConditionInvalid(row, [config])).toBe(true)
      }),
      { numRuns: 100 }
    )
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// Feature: card-based-filter-builder, Property 16: JSON round-trip integrity
// ═══════════════════════════════════════════════════════════════════════════════

describe('Feature: card-based-filter-builder, Property 16: JSON round-trip integrity', () => {
  /**
   * **Validates: Requirements 11.3**
   *
   * Serializing a CardFilterRow via JSON.stringify and deserializing via
   * JSON.parse produces a deeply equal result.
   */
  it('JSON.parse(JSON.stringify(row)) produces a deeply equal CardFilterRow', () => {
    fc.assert(
      fc.property(arbCardFilterRow, (row) => {
        const serialized = JSON.stringify(row)
        const deserialized = JSON.parse(serialized)

        expect(deserialized).toEqual(row)
        expect(deserialized.sourceCategory).toBe(row.sourceCategory)
        expect(deserialized.subSource).toBe(row.subSource)
        expect(deserialized.field).toBe(row.field)
        expect(deserialized.operator).toBe(row.operator)
        expect(deserialized.value).toEqual(row.value)
        expect(deserialized.dateMode).toBe(row.dateMode)
      }),
      { numRuns: 100 }
    )
  })

  it('round-trip preserves string values', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 500 }),
        (strValue) => {
          const row: CardFilterRow = {
            sourceCategory: 'cat',
            subSource: null,
            field: 'field',
            operator: 'equals',
            value: strValue,
            dateMode: null,
          }
          const deserialized = JSON.parse(JSON.stringify(row))
          expect(deserialized).toEqual(row)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('round-trip preserves number values', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.integer({ min: -1000000, max: 1000000 }),
          fc.double({ min: -1000000, max: 1000000, noNaN: true, noDefaultInfinity: true })
        ).filter((n) => !Object.is(n, -0)),
        (numValue) => {
          const row: CardFilterRow = {
            sourceCategory: 'cat',
            subSource: 'sub',
            field: 'amount',
            operator: 'greater_than',
            value: numValue,
            dateMode: null,
          }
          const deserialized = JSON.parse(JSON.stringify(row))
          expect(deserialized).toEqual(row)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('round-trip preserves boolean values', () => {
    fc.assert(
      fc.property(fc.boolean(), (boolValue) => {
        const row: CardFilterRow = {
          sourceCategory: 'cat',
          subSource: null,
          field: 'active',
          operator: 'is_true',
          value: boolValue,
          dateMode: null,
        }
        const deserialized = JSON.parse(JSON.stringify(row))
        expect(deserialized).toEqual(row)
      }),
      { numRuns: 100 }
    )
  })

  it('round-trip preserves null values', () => {
    const row: CardFilterRow = {
      sourceCategory: 'cat',
      subSource: null,
      field: 'status',
      operator: 'is_empty',
      value: null,
      dateMode: null,
    }
    const deserialized = JSON.parse(JSON.stringify(row))
    expect(deserialized).toEqual(row)
  })

  it('round-trip preserves [string, string] tuple values', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 50 })
        ),
        ([start, end]) => {
          const row: CardFilterRow = {
            sourceCategory: 'transactions',
            subSource: null,
            field: 'date',
            operator: 'between',
            value: [start, end],
            dateMode: null,
          }
          const deserialized = JSON.parse(JSON.stringify(row))
          expect(deserialized).toEqual(row)
          expect(Array.isArray(deserialized.value)).toBe(true)
          expect(deserialized.value[0]).toBe(start)
          expect(deserialized.value[1]).toBe(end)
        }
      ),
      { numRuns: 100 }
    )
  })
})
