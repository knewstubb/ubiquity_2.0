// Feature: card-based-filter-builder, Property 19: "Is in" summary shows count not values

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { generateConditionSummary } from '../summary'
import type { CardFilterRow, SourceCategoryConfig } from '../types'

// ─── Mock SourceCategoryConfig ────────────────────────────────────────────────

const TEST_CONFIG: SourceCategoryConfig[] = [
  {
    key: 'contacts',
    icon: null as unknown as React.ReactNode,
    title: 'Contacts',
    description: 'Contact fields',
    fields: [
      { key: 'email', label: 'Email Address', dataType: 'text' },
      { key: 'age', label: 'Age', dataType: 'number' },
      {
        key: 'status',
        label: 'Status',
        dataType: 'enum',
        enumOptions: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'pending', label: 'Pending' },
        ],
      },
    ],
  },
]

// ─── Arbitraries ──────────────────────────────────────────────────────────────

/** Fields available for is_in / is_not_in testing (text, number, enum) */
const FIELDS = TEST_CONFIG[0].fields

/** Generates a non-empty array of unique non-empty strings */
function arbNonEmptyStringArray(): fc.Arbitrary<string[]> {
  return fc
    .uniqueArray(
      fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
      { minLength: 1, maxLength: 20 }
    )
    .map((arr) => arr.map((s) => s.trim()))
}

/** Generates a CardFilterRow with is_in or is_not_in operator and string[] value */
function arbIsInRow(): fc.Arbitrary<CardFilterRow> {
  return fc
    .record({
      operator: fc.constantFrom('is_in', 'is_not_in'),
      fieldIdx: fc.integer({ min: 0, max: FIELDS.length - 1 }),
      values: arbNonEmptyStringArray(),
    })
    .map(({ operator, fieldIdx, values }) => ({
      sourceCategory: 'contacts',
      subSource: null,
      field: FIELDS[fieldIdx].key,
      operator,
      value: values,
      dateMode: null,
    }))
}

// ─── Property 19: "Is in" summary shows count not values ──────────────────────
// **Validates: Requirements 13.9**

describe('Property 19: "Is in" summary shows count not values', () => {
  it('summary contains "{N} values" and does NOT contain any individual chip value (for values > 3 chars)', () => {
    fc.assert(
      fc.property(arbIsInRow(), (row) => {
        const summary = generateConditionSummary(row, TEST_CONFIG)
        const values = row.value as string[]

        // Summary should contain "{N} values"
        expect(summary).toContain(`${values.length} values`)

        // Summary should NOT contain any individual value from the array
        // (only check values > 3 chars to avoid false substring matches)
        for (const chipValue of values) {
          if (chipValue.length > 3) {
            expect(summary).not.toContain(chipValue)
          }
        }
      }),
      { numRuns: 100 }
    )
  })
})
