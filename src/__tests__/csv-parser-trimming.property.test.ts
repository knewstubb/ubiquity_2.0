import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { parse } from '../utils/csv-parser'

/**
 * Feature: csv-sample-upload, Property 2: Header whitespace trimming and placeholder assignment
 *
 * For any CSV string where the header row contains fields with leading/trailing whitespace
 * or fields that are empty/whitespace-only, parsing SHALL produce headers where all leading
 * and trailing whitespace is removed, and any header that becomes empty after trimming is
 * replaced with "Column N" where N is the 1-based column index.
 *
 * **Validates: Requirements 2.4**
 */

// --- Arbitraries ---

/** Generate a whitespace string of given length range */
const arbWhitespace = (min: number, max: number) =>
  fc.array(fc.constantFrom(' ', '\t'), { minLength: min, maxLength: max }).map((chars) => chars.join(''))

/** Generate a header that has leading/trailing whitespace around a non-empty core */
const arbWhitespacePaddedHeader = fc.tuple(
  arbWhitespace(1, 5),
  fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0 && !s.includes(',') && !s.includes('\n') && !s.includes('\r') && !s.includes('"')),
  arbWhitespace(1, 5)
).map(([leading, core, trailing]) => leading + core + trailing)

/** Generate a header that is empty or whitespace-only (should become "Column N") */
const arbEmptyOrWhitespaceHeader = arbWhitespace(0, 5)

/**
 * Generate a mixed array of headers: some padded, some empty/whitespace-only.
 * Must produce at least 2 fields OR at least one non-empty field,
 * because the parser treats a single empty field as "no columns".
 */
const arbHeaderRow = fc.oneof(
  // Case 1: At least one padded (non-empty) header, mixed with empty ones
  fc.tuple(
    fc.array(fc.oneof(arbWhitespacePaddedHeader, arbEmptyOrWhitespaceHeader), { minLength: 0, maxLength: 10 }),
    arbWhitespacePaddedHeader,
    fc.array(fc.oneof(arbWhitespacePaddedHeader, arbEmptyOrWhitespaceHeader), { minLength: 0, maxLength: 10 })
  ).map(([before, required, after]) => [...before, required, ...after]),
  // Case 2: Multiple empty/whitespace-only headers (at least 2 so parser doesn't treat as empty)
  fc.array(arbEmptyOrWhitespaceHeader, { minLength: 2, maxLength: 10 })
)

/** Build a CSV string from raw header fields (unquoted, comma-separated, with a trailing newline) */
function buildCsvFromHeaders(headers: string[]): string {
  // Quote headers that contain commas, newlines, or quotes
  const escaped = headers.map((h) => {
    if (h.includes(',') || h.includes('\n') || h.includes('\r') || h.includes('"')) {
      return `"${h.replace(/"/g, '""')}"`
    }
    return h
  })
  return escaped.join(',') + '\r\n'
}

describe('Feature: csv-sample-upload, Property 2: Header whitespace trimming and placeholder assignment', () => {
  it('all parsed headers have no leading/trailing whitespace, and empty/whitespace-only headers become "Column N"', () => {
    fc.assert(
      fc.property(arbHeaderRow, (rawHeaders) => {
        const csvString = buildCsvFromHeaders(rawHeaders)
        const result = parse(csvString)

        // The parser should return the same number of headers as input fields
        expect(result.headers.length).toBe(rawHeaders.length)

        for (let i = 0; i < rawHeaders.length; i++) {
          const header = result.headers[i]
          const originalTrimmed = rawHeaders[i].trim()

          // Property: no leading/trailing whitespace on any header
          expect(header).toBe(header.trim())

          // Property: empty/whitespace-only headers become "Column N" (before dedup)
          if (originalTrimmed === '') {
            // Should start with "Column " followed by the 1-based index
            // (may have a dedup suffix like _2, _3 if there are duplicates)
            const expectedBase = `Column ${i + 1}`
            // Account for deduplication: the header is either exactly "Column N"
            // or it's a deduplicated variant like "Column N_2"
            const isPlaceholder = header === expectedBase || header.startsWith('Column ')
            expect(isPlaceholder).toBe(true)
          } else {
            // Non-empty headers should either equal the trimmed value exactly,
            // or start with the trimmed value followed by a dedup suffix (_2, _3, etc.)
            const isDirect = header === originalTrimmed
            const hasDedupSuffix = header.startsWith(originalTrimmed) && /^_\d+$/.test(header.slice(originalTrimmed.length))
            expect(isDirect || hasDedupSuffix).toBe(true)
          }
        }
      }),
      { numRuns: 20 }
    )
  })
})
