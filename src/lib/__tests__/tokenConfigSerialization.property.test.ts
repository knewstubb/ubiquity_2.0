import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import type { TokenConfig, ColourTokenValue, PrimitiveRef } from '../../models/tokenConfig'
import { PALETTE_NAMES, SHADE_STEPS } from '../../data/tailwindPalette'

/**
 * Property 2: Token Config Serialization Round-Trip
 *
 * For any valid TokenConfig object, serializing it to JSON via JSON.stringify
 * and then parsing it back via JSON.parse SHALL produce an object deeply equal
 * to the original. Additionally, writing to localStorage and reading back SHALL
 * produce an equivalent config.
 *
 * **Validates: Requirements 4.1, 4.2, 4.4**
 */
describe('Feature: token-management-ui, Property 2: Token Config Serialization Round-Trip', () => {
  // --- Generators ---

  /** Generate a valid PrimitiveRef from known palettes and shades */
  const primitiveRefArb: fc.Arbitrary<PrimitiveRef> = fc.tuple(
    fc.constantFrom(...PALETTE_NAMES),
    fc.constantFrom(...SHADE_STEPS)
  ).map(([palette, shade]) => `${palette}-${shade}` as PrimitiveRef)

  /** Generate a valid ColourTokenValue with light and dark refs */
  const colourTokenValueArb: fc.Arbitrary<ColourTokenValue> = fc.tuple(
    primitiveRefArb,
    primitiveRefArb
  ).map(([light, dark]) => ({ light, dark }))

  /** Token name options for colours */
  const colourTokenNames = [
    'background', 'foreground', 'primary', 'primary-foreground',
    'secondary', 'secondary-foreground', 'muted', 'muted-foreground',
    'accent', 'accent-foreground', 'destructive', 'warning', 'success',
    'info', 'border', 'ring', 'card', 'card-foreground', 'popover', 'popover-foreground'
  ] as const

  /** Spacing token name options */
  const spacingTokenNames = ['xxs', 'xs', 'sm', 'ms', 'md', 'lg', 'xl', 'xxl'] as const

  /** Font size token name options */
  const fontSizeTokenNames = ['xxs', 'xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] as const

  /** Generate a complete valid TokenConfig using plain object construction */
  const tokenConfigArb: fc.Arbitrary<TokenConfig> = fc.tuple(
    // Colours: pick 1-10 unique names, generate values for each
    fc.uniqueArray(fc.constantFrom(...colourTokenNames), { minLength: 1, maxLength: 10 }),
    fc.array(colourTokenValueArb, { minLength: 20, maxLength: 20 }),
    // Spacing: pick 1-8 unique names, generate values for each
    fc.uniqueArray(fc.constantFrom(...spacingTokenNames), { minLength: 1, maxLength: 8 }),
    fc.array(fc.integer({ min: 1, max: 200 }), { minLength: 8, maxLength: 8 }),
    // Radius base
    fc.integer({ min: 1, max: 100 }),
    // Font sizes: pick 1-10 unique names, generate values for each
    fc.uniqueArray(fc.constantFrom(...fontSizeTokenNames), { minLength: 1, maxLength: 10 }),
    fc.array(fc.integer({ min: 1, max: 200 }), { minLength: 10, maxLength: 10 })
  ).map(([colourNames, colourValues, spacingNames, spacingValues, radiusBase, fontNames, fontValues]) => {
    const colours: Record<string, ColourTokenValue> = {}
    for (let i = 0; i < colourNames.length; i++) {
      colours[colourNames[i]] = colourValues[i]
    }

    const spacing: Record<string, number> = {}
    for (let i = 0; i < spacingNames.length; i++) {
      spacing[spacingNames[i]] = spacingValues[i]
    }

    const fontSizes: Record<string, number> = {}
    for (let i = 0; i < fontNames.length; i++) {
      fontSizes[fontNames[i]] = fontValues[i]
    }

    return {
      colours,
      spacing,
      radius: { base: radiusBase },
      typography: { fontSizes },
    } as TokenConfig
  })

  // --- Tests ---

  it('JSON.parse(JSON.stringify(config)) deeply equals the original config', () => {
    fc.assert(
      fc.property(tokenConfigArb, (config) => {
        const serialized = JSON.stringify(config)
        const deserialized = JSON.parse(serialized) as TokenConfig

        expect(deserialized).toStrictEqual(config)
      }),
      { numRuns: 100 }
    )
  })

  it('double serialization round-trip produces identical JSON', () => {
    fc.assert(
      fc.property(tokenConfigArb, (config) => {
        const json1 = JSON.stringify(config)
        const json2 = JSON.stringify(JSON.parse(json1))

        expect(json2).toBe(json1)
      }),
      { numRuns: 100 }
    )
  })

  describe('localStorage round-trip', () => {
    const STORAGE_KEY = 'ubiquity-token-config'

    beforeEach(() => {
      localStorage.clear()
    })

    it('writing to localStorage and reading back produces an equivalent config', () => {
      fc.assert(
        fc.property(tokenConfigArb, (config) => {
          // Write to localStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify(config))

          // Read back from localStorage
          const raw = localStorage.getItem(STORAGE_KEY)
          expect(raw).not.toBeNull()

          const restored = JSON.parse(raw!) as TokenConfig
          expect(restored).toStrictEqual(config)
        }),
        { numRuns: 100 }
      )
    })

    it('localStorage round-trip preserves all colour primitive refs', () => {
      fc.assert(
        fc.property(tokenConfigArb, (config) => {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
          const restored = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as TokenConfig

          // Every colour token value should be preserved exactly
          for (const [tokenName, value] of Object.entries(config.colours)) {
            expect(restored.colours[tokenName].light).toBe(value.light)
            expect(restored.colours[tokenName].dark).toBe(value.dark)
          }
        }),
        { numRuns: 100 }
      )
    })
  })
})
