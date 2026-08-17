// Feature: card-based-filter-builder, Property 10: Fields displayed in alphabetical order
// Feature: card-based-filter-builder, Property 11: Field search filters case-insensitively
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

import type { FilterFieldDef } from '../types'

// ─── Logic Under Test ────────────────────────────────────────────────────────
// Extracted from src/components/composed/filter-builder/modal/condition-modal.tsx

function sortFields(fields: FilterFieldDef[]): FilterFieldDef[] {
  return [...fields].sort((a, b) =>
    a.label.toLowerCase().localeCompare(b.label.toLowerCase())
  )
}

function filterFields(
  sortedFields: FilterFieldDef[],
  query: string
): FilterFieldDef[] {
  if (!query.trim()) return sortedFields
  const q = query.toLowerCase()
  return sortedFields.filter((f) => f.label.toLowerCase().includes(q))
}

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const DATA_TYPES: FilterFieldDef['dataType'][] = [
  'text',
  'number',
  'date',
  'boolean',
  'enum',
]

const filterFieldDefArb: fc.Arbitrary<FilterFieldDef> = fc.record({
  key: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
  label: fc.string({ minLength: 1, maxLength: 40 }).filter((s) => s.trim().length > 0),
  dataType: fc.constantFrom(...DATA_TYPES),
})

const filterFieldDefsArb: fc.Arbitrary<FilterFieldDef[]> = fc.array(filterFieldDefArb, {
  minLength: 0,
  maxLength: 30,
})

const searchStringArb: fc.Arbitrary<string> = fc.string({ minLength: 0, maxLength: 20 })

// ─── Property 10: Fields displayed in alphabetical order ─────────────────────

describe('Property 10: Fields displayed in alphabetical order', () => {
  /**
   * **Validates: Requirements 6.1**
   *
   * For any set of FilterFieldDefs, the sorted output is in non-decreasing
   * alphabetical order by label (case-insensitive).
   */
  it('sorted fields are in non-decreasing alphabetical order by label (case-insensitive)', () => {
    fc.assert(
      fc.property(filterFieldDefsArb, (fields) => {
        const sorted = sortFields(fields)

        for (let i = 1; i < sorted.length; i++) {
          const prev = sorted[i - 1].label.toLowerCase()
          const curr = sorted[i].label.toLowerCase()
          expect(prev.localeCompare(curr)).toBeLessThanOrEqual(0)
        }
      }),
      { numRuns: 100 },
    )
  })

  /**
   * **Validates: Requirements 6.1**
   *
   * Sorting preserves all original elements — no fields are added or removed.
   */
  it('sorting preserves all original elements (same length and same set)', () => {
    fc.assert(
      fc.property(filterFieldDefsArb, (fields) => {
        const sorted = sortFields(fields)

        expect(sorted.length).toBe(fields.length)

        // Every field in the input appears in the output
        for (const field of fields) {
          expect(sorted).toContain(field)
        }
      }),
      { numRuns: 100 },
    )
  })

  /**
   * **Validates: Requirements 6.1**
   *
   * Sorting is idempotent — sorting an already-sorted list produces the same result.
   */
  it('sorting is idempotent', () => {
    fc.assert(
      fc.property(filterFieldDefsArb, (fields) => {
        const sorted = sortFields(fields)
        const sortedAgain = sortFields(sorted)

        expect(sortedAgain.map((f) => f.label)).toEqual(sorted.map((f) => f.label))
      }),
      { numRuns: 100 },
    )
  })
})

// ─── Property 11: Field search filters case-insensitively ────────────────────

describe('Property 11: Field search filters case-insensitively', () => {
  /**
   * **Validates: Requirements 6.3**
   *
   * For any list of FilterFieldDefs and search string S, the filtered results
   * contain exactly those fields whose label includes S as a case-insensitive substring.
   */
  it('filtered results contain exactly fields whose label includes the search string (case-insensitive)', () => {
    fc.assert(
      fc.property(filterFieldDefsArb, searchStringArb, (fields, query) => {
        const sorted = sortFields(fields)
        const filtered = filterFields(sorted, query)

        const q = query.trim().toLowerCase()

        if (q === '') {
          // Empty/whitespace query returns all sorted fields
          expect(filtered).toEqual(sorted)
        } else {
          // Each result must contain the query substring
          for (const field of filtered) {
            expect(field.label.toLowerCase()).toContain(q)
          }

          // Every sorted field that matches must be in the result
          const expectedMatches = sorted.filter((f) =>
            f.label.toLowerCase().includes(q)
          )
          expect(filtered).toEqual(expectedMatches)
        }
      }),
      { numRuns: 100 },
    )
  })

  /**
   * **Validates: Requirements 6.3**
   *
   * The filtered result is still in alphabetical order.
   */
  it('filtered results maintain alphabetical order', () => {
    fc.assert(
      fc.property(filterFieldDefsArb, searchStringArb, (fields, query) => {
        const sorted = sortFields(fields)
        const filtered = filterFields(sorted, query)

        for (let i = 1; i < filtered.length; i++) {
          const prev = filtered[i - 1].label.toLowerCase()
          const curr = filtered[i].label.toLowerCase()
          expect(prev.localeCompare(curr)).toBeLessThanOrEqual(0)
        }
      }),
      { numRuns: 100 },
    )
  })

  /**
   * **Validates: Requirements 6.3**
   *
   * The filtered result is a subset of the full sorted list.
   */
  it('filtered results are a subset of the full sorted list', () => {
    fc.assert(
      fc.property(filterFieldDefsArb, searchStringArb, (fields, query) => {
        const sorted = sortFields(fields)
        const filtered = filterFields(sorted, query)

        for (const field of filtered) {
          expect(sorted).toContain(field)
        }
      }),
      { numRuns: 100 },
    )
  })

  /**
   * **Validates: Requirements 6.3**
   *
   * Search is case-insensitive: filtering with uppercase, lowercase, or mixed-case
   * versions of the same query produces the same result set.
   */
  it('search is case-insensitive (same results regardless of query casing)', () => {
    fc.assert(
      fc.property(filterFieldDefsArb, searchStringArb, (fields, query) => {
        const sorted = sortFields(fields)

        const filteredLower = filterFields(sorted, query.toLowerCase())
        const filteredUpper = filterFields(sorted, query.toUpperCase())
        const filteredOriginal = filterFields(sorted, query)

        expect(filteredLower.map((f) => f.key)).toEqual(filteredOriginal.map((f) => f.key))
        expect(filteredUpper.map((f) => f.key)).toEqual(filteredOriginal.map((f) => f.key))
      }),
      { numRuns: 100 },
    )
  })
})
