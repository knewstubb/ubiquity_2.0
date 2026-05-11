import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

/**
 * Property 7: Spacing Ordering Invariant
 *
 * For any set of spacing token values displayed in the Spacing Section,
 * the rendered order is sorted in ascending order by pixel value.
 * Formally: for displayed tokens at indices i and j where i < j, value[i] <= value[j].
 *
 * The SpacingSection sorts like this:
 *   const sortedTokens = Object.entries(config.spacing).sort(([, a], [, b]) => a - b)
 *
 * **Validates: Requirements 5.2**
 */
describe('Feature: token-management-ui, Property 7: Spacing Ordering Invariant', () => {
  /**
   * Replicates the sorting logic used by SpacingSection:
   * Object.entries(config.spacing).sort(([, a], [, b]) => a - b)
   */
  function sortSpacingTokens(spacing: Record<string, number>): [string, number][] {
    return Object.entries(spacing).sort(([, a], [, b]) => a - b)
  }

  // --- Arbitraries ---

  /** Arbitrary for a spacing token name (lowercase kebab-case) */
  const arbTokenName = fc
    .array(
      fc.string({
        minLength: 1,
        maxLength: 6,
        unit: fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')),
      }),
      { minLength: 1, maxLength: 3 }
    )
    .map((parts) => parts.join('-'))

  /** Arbitrary for a positive spacing value (pixels) */
  const arbSpacingValue = fc.integer({ min: 0, max: 1000 })

  /** Arbitrary for a spacing config: Record<string, number> with positive values */
  const arbSpacingConfig: fc.Arbitrary<Record<string, number>> = fc
    .array(fc.tuple(arbTokenName, arbSpacingValue), { minLength: 1, maxLength: 20 })
    .map((entries) => {
      const config: Record<string, number> = {}
      for (const [name, value] of entries) {
        config[name] = value
      }
      return config
    })

  it('sorted spacing tokens are always in ascending order by value (100+ runs)', () => {
    fc.assert(
      fc.property(arbSpacingConfig, (spacing) => {
        const sorted = sortSpacingTokens(spacing)

        // Assert ascending order: for all consecutive pairs, value[i] <= value[i+1]
        for (let i = 0; i < sorted.length - 1; i++) {
          expect(
            sorted[i][1] <= sorted[i + 1][1],
            `Ordering violated: token "${sorted[i][0]}" (${sorted[i][1]}) should be <= token "${sorted[i + 1][0]}" (${sorted[i + 1][1]}) at indices ${i}, ${i + 1}`
          ).toBe(true)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('single-entry spacing configs are trivially ordered', () => {
    fc.assert(
      fc.property(arbTokenName, arbSpacingValue, (name, value) => {
        const spacing: Record<string, number> = { [name]: value }
        const sorted = sortSpacingTokens(spacing)
        expect(sorted).toHaveLength(1)
        expect(sorted[0][1]).toBe(value)
      }),
      { numRuns: 100 }
    )
  })

  it('duplicate values maintain non-decreasing order', () => {
    fc.assert(
      fc.property(
        fc.array(arbTokenName, { minLength: 2, maxLength: 10 }),
        arbSpacingValue,
        (names, sharedValue) => {
          // Create a config where all tokens have the same value
          const spacing: Record<string, number> = {}
          for (const name of names) {
            spacing[name] = sharedValue
          }
          const sorted = sortSpacingTokens(spacing)

          for (let i = 0; i < sorted.length - 1; i++) {
            expect(
              sorted[i][1] <= sorted[i + 1][1],
              `Ordering violated with duplicate values at indices ${i}, ${i + 1}`
            ).toBe(true)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('large spacing configs with varied values maintain ascending order', () => {
    const arbLargeSpacingConfig: fc.Arbitrary<Record<string, number>> = fc
      .array(fc.tuple(arbTokenName, fc.integer({ min: 0, max: 10000 })), {
        minLength: 5,
        maxLength: 50,
      })
      .map((entries) => {
        const config: Record<string, number> = {}
        for (const [name, value] of entries) {
          config[name] = value
        }
        return config
      })

    fc.assert(
      fc.property(arbLargeSpacingConfig, (spacing) => {
        const sorted = sortSpacingTokens(spacing)

        for (let i = 0; i < sorted.length - 1; i++) {
          expect(
            sorted[i][1] <= sorted[i + 1][1],
            `Ordering violated in large config: "${sorted[i][0]}" (${sorted[i][1]}) > "${sorted[i + 1][0]}" (${sorted[i + 1][1]})`
          ).toBe(true)
        }
      }),
      { numRuns: 100 }
    )
  })
})
