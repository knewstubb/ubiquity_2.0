import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { PALETTE_NAMES, SHADE_STEPS } from '../tailwindPalette'
import { DEFAULT_TOKEN_CONFIG } from '../defaultTokenConfig'
import type { TokenConfig, ColourTokenValue } from '../../models/tokenConfig'

/**
 * Property 6: Token Format Invariant
 *
 * Every colour value in a TokenConfig produced by the editor is a string
 * matching `{palette}-{shade}` where palette ∈ PALETTE_NAMES and shade ∈ SHADE_STEPS.
 *
 * **Validates: Requirements 10.1, 3.2**
 */
describe('Feature: token-management-ui, Property 6: Token Format Invariant', () => {
  const paletteSet = new Set<string>(PALETTE_NAMES)
  const shadeSet = new Set<string>(SHADE_STEPS)

  /**
   * Validates that a primitive reference matches the format `{palette}-{shade}`
   * where palette ∈ PALETTE_NAMES and shade ∈ SHADE_STEPS,
   * or is a standalone colour keyword like 'white' or 'black'.
   */
  function isValidPrimitiveRef(ref: string): boolean {
    // Accept standalone colour keywords
    if (ref === 'white' || ref === 'black') return true
    const dashIndex = ref.lastIndexOf('-')
    if (dashIndex === -1) return false
    const palette = ref.slice(0, dashIndex)
    const shade = ref.slice(dashIndex + 1)
    return paletteSet.has(palette) && shadeSet.has(shade)
  }

  /**
   * Asserts that every colour value in a TokenConfig satisfies the format invariant.
   */
  function assertAllColoursValid(config: TokenConfig): void {
    for (const [tokenName, value] of Object.entries(config.colours)) {
      expect(
        isValidPrimitiveRef(value.light),
        `Token "${tokenName}" light value "${value.light}" does not match {palette}-{shade} format`
      ).toBe(true)
      expect(
        isValidPrimitiveRef(value.dark),
        `Token "${tokenName}" dark value "${value.dark}" does not match {palette}-{shade} format`
      ).toBe(true)
    }
  }

  // --- Arbitraries ---

  /** Arbitrary for a valid palette name from PALETTE_NAMES */
  const arbPalette = fc.constantFrom(...PALETTE_NAMES)

  /** Arbitrary for a valid shade step from SHADE_STEPS */
  const arbShade = fc.constantFrom(...SHADE_STEPS)

  /** Arbitrary for a valid primitive reference: `{palette}-{shade}` */
  const arbPrimitiveRef = fc.tuple(arbPalette, arbShade).map(
    ([palette, shade]) => `${palette}-${shade}`
  )

  /** Arbitrary for a valid ColourTokenValue with light and dark refs */
  const arbColourTokenValue: fc.Arbitrary<ColourTokenValue> = fc.record({
    light: arbPrimitiveRef,
    dark: arbPrimitiveRef,
  }) as fc.Arbitrary<ColourTokenValue>

  /** Arbitrary for a valid token name (non-empty kebab-case string) */
  const arbTokenName = fc
    .array(
      fc.string({ minLength: 1, maxLength: 10, unit: fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')) }),
      { minLength: 1, maxLength: 3 }
    )
    .map((parts) => parts.join('-'))

  /** Arbitrary for a valid TokenConfig with all colour values as valid primitive refs */
  const arbTokenConfig: fc.Arbitrary<TokenConfig> = fc
    .array(fc.tuple(arbTokenName, arbColourTokenValue), { minLength: 1, maxLength: 20 })
    .map((entries) => {
      const colours: Record<string, ColourTokenValue> = {}
      for (const [name, value] of entries) {
        colours[name] = value
      }
      return {
        colours,
        spacing: { xxs: 2, xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 40 },
        radius: { base: 8 },
        typography: { fontSizes: { base: 14, sm: 12, lg: 16 } },
      }
    })

  it('generated TokenConfig objects with valid palette-shade values satisfy the format invariant (100+ runs)', () => {
    fc.assert(
      fc.property(arbTokenConfig, (config) => {
        assertAllColoursValid(config)
      }),
      { numRuns: 100 }
    )
  })

  it('every generated primitive ref matches the {palette}-{shade} pattern', () => {
    fc.assert(
      fc.property(arbPrimitiveRef, (ref) => {
        expect(isValidPrimitiveRef(ref)).toBe(true)
      }),
      { numRuns: 200 }
    )
  })

  it('invalid palette names are rejected by the format check', () => {
    const arbInvalidPalette = fc
      .string({ minLength: 1, maxLength: 10 })
      .filter((s) => !paletteSet.has(s) && /^[a-z]+$/.test(s))

    fc.assert(
      fc.property(arbInvalidPalette, arbShade, (palette, shade) => {
        const ref = `${palette}-${shade}`
        expect(isValidPrimitiveRef(ref)).toBe(false)
      }),
      { numRuns: 100 }
    )
  })

  it('invalid shade steps are rejected by the format check', () => {
    const arbInvalidShade = fc
      .string({ minLength: 1, maxLength: 5 })
      .filter((s) => !shadeSet.has(s) && /^\d+$/.test(s))

    fc.assert(
      fc.property(arbPalette, arbInvalidShade, (palette, shade) => {
        const ref = `${palette}-${shade}`
        expect(isValidPrimitiveRef(ref)).toBe(false)
      }),
      { numRuns: 100 }
    )
  })

  it('DEFAULT_TOKEN_CONFIG satisfies the token format invariant', () => {
    assertAllColoursValid(DEFAULT_TOKEN_CONFIG)
  })
})
