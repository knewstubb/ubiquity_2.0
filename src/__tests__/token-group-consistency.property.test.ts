import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { DEFAULT_TOKEN_CONFIG, COLOUR_TOKEN_GROUPS } from '../data/defaultTokenConfig'

/**
 * Feature: tailwind-token-migration, Property 5: Token Group Consistency
 *
 * For any token name listed in any group within COLOUR_TOKEN_GROUPS,
 * that token name SHALL exist as a key in DEFAULT_TOKEN_CONFIG.colours.
 *
 * **Validates: Requirements 4.5**
 */
describe('Feature: tailwind-token-migration, Property 5: Token Group Consistency', () => {
  // Flatten all token names from all groups
  const allGroupTokens = COLOUR_TOKEN_GROUPS.flatMap((group) => group.tokens)
  const colourKeys = Object.keys(DEFAULT_TOKEN_CONFIG.colours)

  it('every token listed in COLOUR_TOKEN_GROUPS exists as a key in DEFAULT_TOKEN_CONFIG.colours', () => {
    expect(allGroupTokens.length).toBeGreaterThan(0)

    const arbTokenName = fc.constantFrom(...allGroupTokens)

    fc.assert(
      fc.property(arbTokenName, (tokenName) => {
        expect(colourKeys).toContain(tokenName)
      }),
      { numRuns: 100 }
    )
  })
})
