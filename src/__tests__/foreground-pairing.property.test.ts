import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { DEFAULT_TOKEN_CONFIG } from '../data/defaultTokenConfig'

/**
 * Feature: tailwind-token-migration, Property 6: Foreground Pairing Invariant
 *
 * For any token in DEFAULT_TOKEN_CONFIG.colours whose name ends with `-foreground`,
 * there SHALL exist a corresponding base token (the name without the `-foreground`
 * suffix) also present in DEFAULT_TOKEN_CONFIG.colours.
 *
 * Known exception: `tertiary-foreground` is a standalone token in the Muted group
 * (its base `tertiary` does not exist as a separate surface token by design).
 *
 * **Validates: Requirements 5.1**
 */
describe('Feature: tailwind-token-migration, Property 6: Foreground Pairing Invariant', () => {
  const allTokenNames = Object.keys(DEFAULT_TOKEN_CONFIG.colours)

  // Known exceptions: tokens ending in -foreground that intentionally lack a base token
  const KNOWN_EXCEPTIONS = new Set(['tertiary-foreground'])

  // Filter to only tokens ending with `-foreground`, excluding known exceptions
  const foregroundTokens = allTokenNames.filter(
    (name) => name.endsWith('-foreground') && !KNOWN_EXCEPTIONS.has(name)
  )

  it('has foreground tokens to test', () => {
    expect(foregroundTokens.length).toBeGreaterThan(0)
  })

  it('every -foreground token has a corresponding base token in DEFAULT_TOKEN_CONFIG.colours', () => {
    const arbForegroundToken = fc.constantFrom(...foregroundTokens)

    fc.assert(
      fc.property(arbForegroundToken, (tokenName) => {
        const baseName = tokenName.replace(/-foreground$/, '')
        expect(
          allTokenNames,
          `Expected base token "${baseName}" to exist for foreground token "${tokenName}"`
        ).toContain(baseName)
      }),
      { numRuns: 100 }
    )
  })

  it('known exceptions are documented and present in the config', () => {
    for (const exception of KNOWN_EXCEPTIONS) {
      expect(
        allTokenNames,
        `Known exception "${exception}" should exist in DEFAULT_TOKEN_CONFIG.colours`
      ).toContain(exception)
    }
  })
})
