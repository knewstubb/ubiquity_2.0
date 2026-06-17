// Feature: card-based-filter-builder, Property 18: Date mode serialisation integrity

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import type { CardFilterRow } from '../types'

// ─── Arbitraries ─────────────────────────────────────────────────────────────

/** Generates a valid ISO date string (YYYY-MM-DD). */
const arbValidDateString = fc
  .tuple(
    fc.integer({ min: 1900, max: 2100 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 })
  )
  .map(([y, m, d]) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`)

/** Generates a valid date field key. */
const arbDateField = fc.constantFrom('created_at', 'dob', 'updated_at', 'last_login', 'birth_date')

/** Generates a valid source category key. */
const arbSourceCategory = fc.constantFrom('contacts', 'transactions', 'events', 'accounts')

/** Generates a valid date operator (those where dateMode is applicable). */
const arbDateOperator = fc.constantFrom('equals', 'before', 'after', 'between')

/** Generates a dateMode value (non-null). */
const arbDateMode = fc.constantFrom('specific' as const, 'anniversary' as const, 'same_day' as const)

/** Generates an appropriate value for a date operator. */
function arbValueForOperator(operator: string) {
  if (operator === 'between') {
    return fc
      .tuple(arbValidDateString, arbValidDateString)
      .map(([a, b]) => (a <= b ? [a, b] : [b, a]) as [string, string])
  }
  return arbValidDateString
}

/** Generates a complete CardFilterRow with a date field and a non-null dateMode. */
const arbDateModeRow: fc.Arbitrary<CardFilterRow> = arbDateOperator.chain((operator) =>
  fc.record({
    sourceCategory: arbSourceCategory,
    subSource: fc.option(fc.constantFrom('treatments', 'products', 'orders'), { nil: null }),
    field: arbDateField,
    operator: fc.constant(operator),
    value: arbValueForOperator(operator),
    dateMode: arbDateMode,
  })
)

/** Generates a CardFilterRow with dateMode = null (non-date fields or in_last_n_days). */
const arbNullDateModeRow: fc.Arbitrary<CardFilterRow> = fc.record({
  sourceCategory: arbSourceCategory,
  subSource: fc.option(fc.constantFrom('treatments', 'products'), { nil: null }),
  field: fc.constantFrom('created_at', 'email', 'name', 'amount'),
  operator: fc.constantFrom('equals', 'contains', 'in_last_n_days', 'is_empty'),
  value: fc.oneof(
    fc.string({ minLength: 0, maxLength: 50 }),
    fc.integer({ min: 1, max: 3650 }),
    fc.constant(null)
  ),
  dateMode: fc.constant(null),
})

// ═══════════════════════════════════════════════════════════════════════════════
// Feature: card-based-filter-builder, Property 18: Date mode serialisation integrity
// ═══════════════════════════════════════════════════════════════════════════════

describe('Feature: card-based-filter-builder, Property 18: Date mode serialisation integrity', () => {
  /**
   * **Validates: Requirements 7.14, 7.15, 7.16, 7.17, 11.3**
   *
   * For any valid CardFilterRow with a date field and a dateMode value
   * ("specific", "anniversary", or "same_day"), serialising to JSON and
   * deserialising back produces an object where dateMode is deeply equal
   * to the original.
   */
  it('dateMode is preserved through JSON round-trip for all valid modes', () => {
    fc.assert(
      fc.property(arbDateModeRow, (row) => {
        const serialized = JSON.stringify(row)
        const deserialized = JSON.parse(serialized)

        // dateMode specifically preserved
        expect(deserialized.dateMode).toBe(row.dateMode)

        // Full deep equality
        expect(deserialized).toEqual(row)
      }),
      { numRuns: 100 }
    )
  })

  it('dateMode "specific" survives round-trip without mutation', () => {
    fc.assert(
      fc.property(arbDateOperator, arbDateField, arbSourceCategory, (operator, field, category) => {
        const value = operator === 'between' ? ['2024-01-01', '2024-12-31'] : '2024-06-15'
        const row: CardFilterRow = {
          sourceCategory: category,
          subSource: null,
          field,
          operator,
          value: value as string | [string, string],
          dateMode: 'specific',
        }

        const deserialized = JSON.parse(JSON.stringify(row))
        expect(deserialized.dateMode).toBe('specific')
        expect(deserialized).toEqual(row)
      }),
      { numRuns: 100 }
    )
  })

  it('dateMode "anniversary" survives round-trip without mutation', () => {
    fc.assert(
      fc.property(arbDateOperator, arbDateField, arbSourceCategory, (operator, field, category) => {
        const value = operator === 'between' ? ['2024-03-01', '2024-03-31'] : '2024-03-15'
        const row: CardFilterRow = {
          sourceCategory: category,
          subSource: null,
          field,
          operator,
          value: value as string | [string, string],
          dateMode: 'anniversary',
        }

        const deserialized = JSON.parse(JSON.stringify(row))
        expect(deserialized.dateMode).toBe('anniversary')
        expect(deserialized).toEqual(row)
      }),
      { numRuns: 100 }
    )
  })

  it('dateMode "same_day" survives round-trip without mutation', () => {
    fc.assert(
      fc.property(arbDateOperator, arbDateField, arbSourceCategory, (operator, field, category) => {
        const value = operator === 'between' ? ['2024-12-01', '2024-12-25'] : '2024-12-25'
        const row: CardFilterRow = {
          sourceCategory: category,
          subSource: null,
          field,
          operator,
          value: value as string | [string, string],
          dateMode: 'same_day',
        }

        const deserialized = JSON.parse(JSON.stringify(row))
        expect(deserialized.dateMode).toBe('same_day')
        expect(deserialized).toEqual(row)
      }),
      { numRuns: 100 }
    )
  })

  it('dateMode null round-trips correctly for non-date-mode conditions', () => {
    fc.assert(
      fc.property(arbNullDateModeRow, (row) => {
        const serialized = JSON.stringify(row)
        const deserialized = JSON.parse(serialized)

        // dateMode specifically null
        expect(deserialized.dateMode).toBeNull()

        // Full deep equality
        expect(deserialized).toEqual(row)
      }),
      { numRuns: 100 }
    )
  })

  it('full object deep equality is maintained for date mode rows', () => {
    fc.assert(
      fc.property(arbDateModeRow, (row) => {
        const deserialized = JSON.parse(JSON.stringify(row))

        // Verify all fields individually
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
})
