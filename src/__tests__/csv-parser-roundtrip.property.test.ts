import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { parse, format } from '../utils/csv-parser'

/**
 * Feature: csv-sample-upload, Property 1: CSV parse/format round-trip
 *
 * For any valid array of pre-trimmed, non-empty header strings (1–1000 items,
 * each 1–255 characters) and any record of example values (strings of 0–1000
 * characters, potentially containing commas, newlines, and double quotes),
 * formatting the headers and values into a CSV string via `format` and then
 * parsing the result via `parse` SHALL produce headers that are character-for-
 * character identical to the input headers, and example values that are
 * character-for-character identical to the input values.
 *
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.6, 7.1, 7.2, 7.5**
 */

// --- Arbitraries ---

// A single pre-trimmed non-empty header (1–255 chars).
// Must not have leading/trailing whitespace. Uses alphanumeric + common punctuation.
const arbHeader = fc
  .stringMatching(/^[A-Za-z0-9_\-./()[\]+=#@!?&%^|~:;'{}]+( [A-Za-z0-9_\-./()[\]+=#@!?&%^|~:;'{}]+)*$/, { minLength: 1, maxLength: 50 })
  .filter((h) => h.trim() === h && h.length > 0 && h.length <= 255)

// Generate unique headers array (1–20 items for practical test speed)
const arbUniqueHeaders = fc
  .uniqueArray(arbHeader, { minLength: 1, maxLength: 20 })
  .filter((arr) => arr.length > 0)

// Example value: 0–100 chars, can contain commas, newlines, and double quotes
// to exercise the RFC 4180 quoting logic
const arbExampleValue = fc.oneof(
  fc.string({ minLength: 0, maxLength: 100 }),
  // Strings that specifically include special CSV characters
  fc.string({ minLength: 0, maxLength: 50 }).map((s) => s + ','),
  fc.string({ minLength: 0, maxLength: 50 }).map((s) => s + '\n'),
  fc.string({ minLength: 0, maxLength: 50 }).map((s) => s + '"'),
  fc.string({ minLength: 0, maxLength: 50 }).map((s) => `"${s}"`),
  fc.string({ minLength: 0, maxLength: 30 }).map((s) => `${s},${s}\n${s}`)
)

// Build a record of example values keyed by headers
function arbExampleValues(headers: string[]): fc.Arbitrary<Record<string, string>> {
  if (headers.length === 0) return fc.constant({})
  return fc.tuple(...headers.map(() => arbExampleValue)).map((values) =>
    Object.fromEntries(headers.map((h, i) => [h, values[i]]))
  )
}

describe('Feature: csv-sample-upload, Property 1: CSV parse/format round-trip', () => {
  it('parse(format(headers, values)) produces character-for-character identical headers and values', () => {
    fc.assert(
      fc.property(
        arbUniqueHeaders.chain((headers) =>
          arbExampleValues(headers).map((values) => ({ headers, values }))
        ),
        ({ headers, values }) => {
          // Format to CSV string
          const csvString = format(headers, values)

          // Parse back
          const result = parse(csvString)

          // Headers must be character-for-character identical
          expect(result.headers).toEqual(headers)

          // Example values must be character-for-character identical
          for (const header of headers) {
            expect(result.exampleValues[header]).toEqual(values[header])
          }
        }
      ),
      { numRuns: 20 }
    )
  })
})
