import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { parse } from '../utils/csv-parser'

/**
 * Feature: csv-sample-upload, Property 3: Duplicate header deduplication
 *
 * For any CSV string where the header row contains duplicate values after trimming,
 * parsing SHALL produce an array of headers where every element is unique, with
 * duplicates receiving a numeric suffix (_2, _3, etc.) appended in left-to-right order.
 *
 * **Validates: Requirements 2.7**
 */

// --- Arbitraries ---

/**
 * Generate a non-empty header string (1–30 chars, printable ASCII excluding
 * comma, quote, CR, LF to keep them as simple unquoted fields).
 */
const arbHeaderName = fc.string({ minLength: 1, maxLength: 30 }).filter((s) => {
  const trimmed = s.trim()
  return (
    trimmed.length > 0 &&
    !trimmed.includes(',') &&
    !trimmed.includes('"') &&
    !trimmed.includes('\r') &&
    !trimmed.includes('\n')
  )
})

/**
 * Generate an array of headers where at least some are duplicates.
 * Strategy: pick a base set of 1–5 unique headers, then build an array of 2–20
 * items by sampling from that base set (guaranteeing duplicates when base < total).
 */
const arbHeadersWithDuplicates = fc
  .record({
    baseHeaders: fc.array(arbHeaderName, { minLength: 1, maxLength: 5 }),
    indices: fc.array(fc.nat(), { minLength: 2, maxLength: 20 }),
  })
  .map(({ baseHeaders, indices }) => {
    // Map indices into the base headers to create duplicates
    return indices.map((idx) => baseHeaders[idx % baseHeaders.length])
  })
  .filter((headers) => {
    // Ensure there is at least one duplicate
    const unique = new Set(headers.map((h) => h.trim()))
    return unique.size < headers.length
  })

/**
 * Build a CSV string from an array of header values (single header row, no data row).
 */
function buildCsvFromHeaders(headers: string[]): string {
  return headers.join(',')
}

describe('Feature: csv-sample-upload, Property 3: Duplicate header deduplication', () => {
  it('all returned headers are unique after deduplication', () => {
    fc.assert(
      fc.property(arbHeadersWithDuplicates, (inputHeaders) => {
        const csv = buildCsvFromHeaders(inputHeaders)
        const result = parse(csv)

        // All returned headers must be unique
        const uniqueSet = new Set(result.headers)
        expect(uniqueSet.size).toBe(result.headers.length)
      }),
      { numRuns: 20 }
    )
  })

  it('duplicates receive _2, _3 suffixes in left-to-right order', () => {
    fc.assert(
      fc.property(arbHeadersWithDuplicates, (inputHeaders) => {
        const csv = buildCsvFromHeaders(inputHeaders)
        const result = parse(csv)

        // Track expected deduplication: first occurrence keeps original,
        // subsequent get _2, _3, etc.
        const seen = new Map<string, number>()
        const expectedHeaders = inputHeaders.map((h) => {
          const trimmed = h.trim()
          const count = seen.get(trimmed) ?? 0
          seen.set(trimmed, count + 1)
          if (count === 0) {
            return trimmed
          }
          return `${trimmed}_${count + 1}`
        })

        expect(result.headers).toEqual(expectedHeaders)
      }),
      { numRuns: 20 }
    )
  })
})
