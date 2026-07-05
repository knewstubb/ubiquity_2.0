// Feature: card-based-filter-builder, Property 12: Operators map correctly to data types
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  getOperatorsForType,
  TEXT_OPERATORS,
  NUMBER_OPERATORS,
  DATE_OPERATORS,
  BOOLEAN_OPERATORS,
  ENUM_OPERATORS,
} from '../operators'

// ─── Expected Operator Values by Data Type ───────────────────────────────────

const EXPECTED_OPERATORS: Record<string, string[]> = {
  text: ['equals', 'not_equals', 'contains', 'does_not_contain', 'starts_with', 'ends_with', 'is_in', 'is_not_in', 'is_empty', 'is_not_empty'],
  number: ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_or_equal', 'less_or_equal', 'is_in', 'is_not_in', 'is_empty', 'is_not_empty'],
  date: ['equals', 'before', 'after', 'between', 'in_last_n_days', 'is_empty', 'is_not_empty'],
  boolean: ['is_true', 'is_false'],
  enum: ['equals', 'not_equals', 'is_in', 'is_not_in', 'is_empty', 'is_not_empty'],
}

const OPERATOR_CONSTANTS: Record<string, typeof TEXT_OPERATORS> = {
  text: TEXT_OPERATORS,
  number: NUMBER_OPERATORS,
  date: DATE_OPERATORS,
  boolean: BOOLEAN_OPERATORS,
  enum: ENUM_OPERATORS,
}

const DATA_TYPES = ['text', 'number', 'date', 'boolean', 'enum'] as const
type DataType = (typeof DATA_TYPES)[number]

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const dataTypeArb = fc.constantFrom(...DATA_TYPES)

// ─── Property Tests ──────────────────────────────────────────────────────────

describe('Property 12: Operators map correctly to data types', () => {
  /**
   * **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6**
   *
   * For each data type, getOperatorsForType returns exactly the expected
   * operator values — no extras and no missing entries.
   */
  it('getOperatorsForType returns exactly the expected operator values for any data type', () => {
    fc.assert(
      fc.property(dataTypeArb, (dataType: DataType) => {
        const operators = getOperatorsForType(dataType)
        const operatorValues = operators.map((op) => op.value)
        const expected = EXPECTED_OPERATORS[dataType]

        // Exact match: same length and same items in order
        expect(operatorValues).toEqual(expected)
      }),
      { numRuns: 100 },
    )
  })

  /**
   * **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6**
   *
   * getOperatorsForType is deterministic — calling it multiple times with the
   * same data type always returns the same result.
   */
  it('getOperatorsForType is deterministic for any valid data type', () => {
    fc.assert(
      fc.property(dataTypeArb, (dataType: DataType) => {
        const first = getOperatorsForType(dataType)
        const second = getOperatorsForType(dataType)

        expect(first).toEqual(second)
      }),
      { numRuns: 100 },
    )
  })

  /**
   * **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6**
   *
   * Every operator returned by getOperatorsForType has both a `value` (string)
   * and `label` (string) property.
   */
  it('all operators have both value (string) and label (string) properties', () => {
    fc.assert(
      fc.property(dataTypeArb, (dataType: DataType) => {
        const operators = getOperatorsForType(dataType)

        for (const op of operators) {
          expect(typeof op.value).toBe('string')
          expect(typeof op.label).toBe('string')
          expect(op.value.length).toBeGreaterThan(0)
          expect(op.label.length).toBeGreaterThan(0)
        }
      }),
      { numRuns: 100 },
    )
  })

  /**
   * **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6**
   *
   * getOperatorsForType returns the same reference as the exported constant
   * for each data type, confirming the lookup is wired correctly.
   */
  it('getOperatorsForType returns the same array reference as the exported constant', () => {
    fc.assert(
      fc.property(dataTypeArb, (dataType: DataType) => {
        const fromFunction = getOperatorsForType(dataType)
        const fromConstant = OPERATOR_CONSTANTS[dataType]

        expect(fromFunction).toBe(fromConstant)
      }),
      { numRuns: 100 },
    )
  })

  /**
   * **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6**
   *
   * No data type has duplicate operator values within its set.
   */
  it('no data type has duplicate operator values', () => {
    fc.assert(
      fc.property(dataTypeArb, (dataType: DataType) => {
        const operators = getOperatorsForType(dataType)
        const values = operators.map((op) => op.value)
        const unique = new Set(values)

        expect(unique.size).toBe(values.length)
      }),
      { numRuns: 100 },
    )
  })
})
