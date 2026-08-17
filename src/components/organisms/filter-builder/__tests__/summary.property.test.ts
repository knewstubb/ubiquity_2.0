// Feature: card-based-filter-builder, Property 4: Summary generation resolves keys to labels
// Feature: card-based-filter-builder, Property 5: No-value operators produce summary without value
// Feature: card-based-filter-builder, Property 6: Date formatting in summaries
// Feature: card-based-filter-builder, Property 7: Unresolvable keys fall back to raw text

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { generateConditionSummary } from '../summary'
import type { CardFilterRow, SourceCategoryConfig, FilterFieldDef } from '../types'
import { NO_VALUE_OPERATORS, getOperatorsForType } from '../operators'

// ─── Test Helpers ─────────────────────────────────────────────────────────────

/** Generates a valid field definition */
function arbFieldDef(): fc.Arbitrary<FilterFieldDef> {
  return fc.record({
    key: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-z][a-z0-9_]*$/.test(s)),
    label: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
    dataType: fc.constantFrom('text', 'number', 'date', 'boolean', 'enum') as fc.Arbitrary<FilterFieldDef['dataType']>,
  })
}

/** Generates a valid SourceCategoryConfig with at least one field */
function arbSourceCategory(): fc.Arbitrary<SourceCategoryConfig> {
  return fc.record({
    key: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-z][a-z0-9_]*$/.test(s)),
    icon: fc.constant(null as unknown as React.ReactNode),
    title: fc.string({ minLength: 1, maxLength: 40 }).filter((s) => s.trim().length > 0),
    description: fc.string({ minLength: 1, maxLength: 120 }),
    fields: fc.array(arbFieldDef(), { minLength: 1, maxLength: 5 }),
  })
}

/**
 * Generates a valid CardFilterRow whose sourceCategory and field keys
 * exist in the given SourceCategoryConfig array.
 */
function arbValidRow(configs: SourceCategoryConfig[]): fc.Arbitrary<CardFilterRow> {
  return fc.integer({ min: 0, max: configs.length - 1 }).chain((catIdx) => {
    const cat = configs[catIdx]
    return fc.integer({ min: 0, max: cat.fields.length - 1 }).chain((fieldIdx) => {
      const field = cat.fields[fieldIdx]
      const operators = getOperatorsForType(field.dataType)
      const nonNoValueOps = operators.filter((op) => !NO_VALUE_OPERATORS.includes(op.value))

      // Use only operators that require a value for Property 4
      if (nonNoValueOps.length === 0) {
        // All operators are no-value (boolean type), use any
        return fc.constant<CardFilterRow>({
          sourceCategory: cat.key,
          subSource: null,
          field: field.key,
          operator: operators[0].value,
          value: null,
          dateMode: null,
        })
      }

      return fc.integer({ min: 0, max: nonNoValueOps.length - 1 }).chain((opIdx) => {
        const op = nonNoValueOps[opIdx]
        return fc.constant<CardFilterRow>({
          sourceCategory: cat.key,
          subSource: null,
          field: field.key,
          operator: op.value,
          value: 'test_value',
          dateMode: null,
        })
      })
    })
  })
}

// ─── Fixed test config for stable property testing ────────────────────────────

const TEST_CONFIG: SourceCategoryConfig[] = [
  {
    key: 'contacts',
    icon: null as unknown as React.ReactNode,
    title: 'Contacts',
    description: 'Contact fields',
    fields: [
      { key: 'first_name', label: 'First Name', dataType: 'text' },
      { key: 'email', label: 'Email Address', dataType: 'text' },
      { key: 'age', label: 'Age', dataType: 'number' },
      { key: 'created_at', label: 'Created At', dataType: 'date' },
      { key: 'is_active', label: 'Is Active', dataType: 'boolean' },
      {
        key: 'status',
        label: 'Status',
        dataType: 'enum',
        enumOptions: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ],
      },
    ],
  },
  {
    key: 'transactions',
    icon: null as unknown as React.ReactNode,
    title: 'Transactions',
    description: 'Transaction data',
    fields: [
      { key: 'amount', label: 'Amount', dataType: 'number' },
      { key: 'tx_date', label: 'Transaction Date', dataType: 'date' },
      { key: 'memo', label: 'Memo', dataType: 'text' },
    ],
  },
]

// ─── Property 4: Summary generation resolves keys to labels ───────────────────
// **Validates: Requirements 2.1, 2.4, 11.4**

describe('Property 4: Summary generation resolves keys to labels', () => {
  it('summary contains source title, field label, and operator label for any valid row', () => {
    fc.assert(
      fc.property(arbValidRow(TEST_CONFIG), (row) => {
        const summary = generateConditionSummary(row, TEST_CONFIG)

        // Find the expected source category title
        const cat = TEST_CONFIG.find((c) => c.key === row.sourceCategory)!
        const field = cat.fields.find((f) => f.key === row.field)!
        const operators = getOperatorsForType(field.dataType)
        const op = operators.find((o) => o.value === row.operator)!

        // Summary should contain the resolved labels
        expect(summary).toContain(cat.title)
        expect(summary).toContain(field.label)
        expect(summary).toContain(op.label)

        // Summary should NOT contain the raw keys (unless they happen to match labels)
        if (cat.title !== cat.key) {
          expect(summary).not.toContain(cat.key)
        }
        if (field.label !== field.key) {
          expect(summary).not.toContain(field.key)
        }
      }),
      { numRuns: 100 }
    )
  })
})

// ─── Property 5: No-value operators produce summary without value ─────────────
// **Validates: Requirements 2.2**

describe('Property 5: No-value operators produce summary without value', () => {
  /** Generates a row with a no-value operator for a compatible field */
  function arbNoValueRow(): fc.Arbitrary<CardFilterRow> {
    // Gather all (category, field, operator) combinations that use no-value ops
    const combos: { catKey: string; fieldKey: string; dataType: FilterFieldDef['dataType']; op: string }[] = []

    for (const cat of TEST_CONFIG) {
      for (const field of cat.fields) {
        const operators = getOperatorsForType(field.dataType)
        for (const op of operators) {
          if (NO_VALUE_OPERATORS.includes(op.value)) {
            combos.push({ catKey: cat.key, fieldKey: field.key, dataType: field.dataType, op: op.value })
          }
        }
      }
    }

    return fc.integer({ min: 0, max: combos.length - 1 }).map((idx) => {
      const combo = combos[idx]
      return {
        sourceCategory: combo.catKey,
        subSource: null,
        field: combo.fieldKey,
        operator: combo.op,
        value: null,
        dateMode: null,
      }
    })
  }

  it('no-value operator summaries end after the operator label with no trailing content', () => {
    fc.assert(
      fc.property(arbNoValueRow(), (row) => {
        const summary = generateConditionSummary(row, TEST_CONFIG)

        // Find expected labels
        const cat = TEST_CONFIG.find((c) => c.key === row.sourceCategory)!
        const field = cat.fields.find((f) => f.key === row.field)!
        const operators = getOperatorsForType(field.dataType)
        const op = operators.find((o) => o.value === row.operator)!

        // Summary should contain source title, field label, operator label
        expect(summary).toContain(cat.title)
        expect(summary).toContain(field.label)
        expect(summary).toContain(op.label)

        // Summary should end exactly with the operator label (no value portion after it)
        const expectedSummary = `${cat.title} ${field.label} ${op.label}`
        expect(summary).toBe(expectedSummary)
      }),
      { numRuns: 100 }
    )
  })
})

// ─── Property 6: Date formatting in summaries ─────────────────────────────────
// **Validates: Requirements 2.3**

describe('Property 6: Date formatting in summaries', () => {
  /** Generates a valid ISO date string */
  function arbIsoDate(): fc.Arbitrary<string> {
    return fc
      .record({
        year: fc.integer({ min: 2000, max: 2030 }),
        month: fc.integer({ min: 1, max: 12 }),
        day: fc.integer({ min: 1, max: 28 }), // safe for all months
      })
      .map(({ year, month, day }) => {
        const m = String(month).padStart(2, '0')
        const d = String(day).padStart(2, '0')
        return `${year}-${m}-${d}`
      })
  }

  /** Generates a valid date range [start, end] where start <= end */
  function arbDateRange(): fc.Arbitrary<[string, string]> {
    return arbIsoDate().chain((start) => {
      return arbIsoDate().map((end) => {
        // Ensure start <= end by sorting
        return [start, end].sort() as [string, string]
      })
    })
  }

  /** Generates a date field row with "between" operator */
  function arbBetweenRow(): fc.Arbitrary<CardFilterRow> {
    const dateFields = TEST_CONFIG.flatMap((cat) =>
      cat.fields
        .filter((f) => f.dataType === 'date')
        .map((f) => ({ catKey: cat.key, fieldKey: f.key }))
    )

    return fc
      .integer({ min: 0, max: dateFields.length - 1 })
      .chain((idx) => {
        const { catKey, fieldKey } = dateFields[idx]
        return arbDateRange().map((range) => ({
          sourceCategory: catKey,
          subSource: null,
          field: fieldKey,
          operator: 'between',
          value: range,
          dateMode: null,
        }))
      })
  }

  /** Generates a date field row with "in_last_n_days" operator */
  function arbInLastNDaysRow(): fc.Arbitrary<CardFilterRow> {
    const dateFields = TEST_CONFIG.flatMap((cat) =>
      cat.fields
        .filter((f) => f.dataType === 'date')
        .map((f) => ({ catKey: cat.key, fieldKey: f.key }))
    )

    return fc
      .integer({ min: 0, max: dateFields.length - 1 })
      .chain((idx) => {
        const { catKey, fieldKey } = dateFields[idx]
        return fc.integer({ min: 1, max: 3650 }).map((n) => ({
          sourceCategory: catKey,
          subSource: null,
          field: fieldKey,
          operator: 'in_last_n_days',
          value: n,
          dateMode: null,
        }))
      })
  }

  it('"between" operator summary contains "between" and en-dash separator', () => {
    fc.assert(
      fc.property(arbBetweenRow(), (row) => {
        const summary = generateConditionSummary(row, TEST_CONFIG)

        // Should contain the word "between" and the en-dash separator
        expect(summary).toContain('between')
        expect(summary).toContain('–')

        // Should NOT contain raw ISO date strings (they get formatted)
        const [start, end] = row.value as [string, string]
        // Formatted dates won't match ISO format (e.g. "2024-01-15" becomes "1/15/2024" or locale equivalent)
        const startDate = new Date(start)
        const endDate = new Date(end)
        if (!isNaN(startDate.getTime())) {
          expect(summary).toContain(startDate.toLocaleDateString())
        }
        if (!isNaN(endDate.getTime())) {
          expect(summary).toContain(endDate.toLocaleDateString())
        }
      }),
      { numRuns: 100 }
    )
  })

  it('"in_last_n_days" operator summary contains "in last {N} days"', () => {
    fc.assert(
      fc.property(arbInLastNDaysRow(), (row) => {
        const summary = generateConditionSummary(row, TEST_CONFIG)

        const n = row.value as number
        expect(summary).toContain(`in last ${n} days`)
      }),
      { numRuns: 100 }
    )
  })
})

// ─── Property 7: Unresolvable keys fall back to raw text ──────────────────────
// **Validates: Requirements 11.5**

describe('Property 7: Unresolvable keys fall back to raw text', () => {
  /** Generates a row with a sourceCategory key NOT in the config */
  function arbMissingSourceRow(): fc.Arbitrary<CardFilterRow> {
    const existingKeys = TEST_CONFIG.map((c) => c.key)
    return fc
      .string({ minLength: 3, maxLength: 20 })
      .filter((s) => /^[a-z][a-z0-9_]*$/.test(s) && !existingKeys.includes(s))
      .map((missingKey) => ({
        sourceCategory: missingKey,
        subSource: null,
        field: 'some_field',
        operator: 'equals',
        value: 'test',
        dateMode: null,
      }))
  }

  /** Generates a row with a field key NOT in the config (but valid source) */
  function arbMissingFieldRow(): fc.Arbitrary<CardFilterRow> {
    return fc
      .integer({ min: 0, max: TEST_CONFIG.length - 1 })
      .chain((catIdx) => {
        const cat = TEST_CONFIG[catIdx]
        const existingFieldKeys = cat.fields.map((f) => f.key)
        return fc
          .string({ minLength: 3, maxLength: 20 })
          .filter((s) => /^[a-z][a-z0-9_]*$/.test(s) && !existingFieldKeys.includes(s))
          .map((missingField) => ({
            sourceCategory: cat.key,
            subSource: null,
            field: missingField,
            operator: 'equals',
            value: 'test',
            dateMode: null,
          }))
      })
  }

  it('missing source category key appears as raw text in summary', () => {
    fc.assert(
      fc.property(arbMissingSourceRow(), (row) => {
        const summary = generateConditionSummary(row, TEST_CONFIG)

        // The raw source category key should appear in the summary as fallback
        expect(summary).toContain(row.sourceCategory)
        // Should not throw or produce empty string
        expect(summary.length).toBeGreaterThan(0)
      }),
      { numRuns: 100 }
    )
  })

  it('missing field key appears as raw text in summary', () => {
    fc.assert(
      fc.property(arbMissingFieldRow(), (row) => {
        const summary = generateConditionSummary(row, TEST_CONFIG)

        // The raw field key should appear in the summary as fallback
        expect(summary).toContain(row.field)
        // Should not throw or produce empty string
        expect(summary.length).toBeGreaterThan(0)
      }),
      { numRuns: 100 }
    )
  })
})
