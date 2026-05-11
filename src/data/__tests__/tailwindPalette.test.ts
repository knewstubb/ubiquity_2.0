import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  PALETTE_NAMES,
  SHADE_STEPS,
  resolveToHex,
} from '../tailwindPalette'

/**
 * Property 1: Primitive Resolution Correctness
 *
 * For any valid `{palette}-{shade}` where palette ∈ PALETTE_NAMES and
 * shade ∈ SHADE_STEPS, `resolveToHex` returns a valid 7-char hex string
 * matching `/^#[0-9A-Fa-f]{6}$/`; for invalid refs it returns `null`.
 *
 * **Validates: Requirements 2.5, 10.2**
 */
describe('Feature: token-management-ui, Property 1: Primitive Resolution Correctness', () => {
  const hexPattern = /^#[0-9A-Fa-f]{6}$/

  it('resolveToHex returns a valid hex string for any valid palette-shade combination', () => {
    const validPalette = fc.constantFrom(...PALETTE_NAMES)
    const validShade = fc.constantFrom(...SHADE_STEPS)

    fc.assert(
      fc.property(validPalette, validShade, (palette, shade) => {
        const ref = `${palette}-${shade}`
        const result = resolveToHex(ref)

        expect(result).not.toBeNull()
        expect(result).toMatch(hexPattern)
      }),
      { numRuns: 200 },
    )
  })

  it('resolveToHex returns null for invalid palette-shade references', () => {
    // Generate strings that do NOT match any valid palette-shade combo
    const invalidRef = fc
      .string({ minLength: 1, maxLength: 30 })
      .filter((s) => {
        // Exclude any string that happens to be a valid palette-shade combo
        const dashIndex = s.lastIndexOf('-')
        if (dashIndex === -1) return true
        const palette = s.slice(0, dashIndex)
        const shade = s.slice(dashIndex + 1)
        const isValidPalette = (PALETTE_NAMES as readonly string[]).includes(palette)
        const isValidShade = (SHADE_STEPS as readonly string[]).includes(shade)
        return !(isValidPalette && isValidShade)
      })

    fc.assert(
      fc.property(invalidRef, (ref) => {
        const result = resolveToHex(ref)
        expect(result).toBeNull()
      }),
      { numRuns: 200 },
    )
  })
})
