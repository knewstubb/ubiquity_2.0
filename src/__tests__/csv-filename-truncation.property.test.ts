import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { truncateFilename } from '../components/importer/FileSettingsStep'

/**
 * Feature: csv-sample-upload, Property 7: Filename display truncation
 *
 * For any filename string, the dropzone SHALL display the full filename when
 * it is 40 characters or fewer, and SHALL truncate to 40 characters with an
 * ellipsis suffix when the filename exceeds 40 characters.
 *
 * **Validates: Requirements 6.1**
 */

describe('Feature: csv-sample-upload, Property 7: Filename display truncation', () => {
  it('filenames ≤ 40 chars display in full; filenames > 40 chars are truncated to 40 chars with ellipsis suffix', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }),
        (filename) => {
          const result = truncateFilename(filename)

          if (filename.length <= 40) {
            // Short filenames are returned unchanged
            expect(result).toBe(filename)
          } else {
            // Long filenames are truncated to 40 chars + ellipsis
            expect(result).toHaveLength(41) // 40 chars + 1 ellipsis character
            expect(result.slice(0, 40)).toBe(filename.slice(0, 40))
            expect(result[40]).toBe('\u2026')
          }
        }
      ),
      { numRuns: 20 }
    )
  })
})
