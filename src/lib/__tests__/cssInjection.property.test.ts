import { describe, it, expect, beforeEach } from 'vitest'
import fc from 'fast-check'
import { renderHook, act } from '@testing-library/react'
import { useTokenConfig } from '../useTokenConfig'
import { resolveToHex, PALETTE_NAMES, SHADE_STEPS } from '../../data/tailwindPalette'
import { DEFAULT_TOKEN_CONFIG } from '../../data/defaultTokenConfig'

/**
 * Property 3: CSS Injection Correctness (updated for single injection)
 *
 * After calling `updateColour(tokenName, mode, primitiveRef)`,
 * `document.documentElement.style.getPropertyValue('--' + tokenName)` equals
 * `resolveToHex(primitiveRef)`. Only one CSS variable is set per token.
 *
 * **Validates: Requirements 3.3, 9.1, 9.2**
 */
describe('Feature: token-management-ui, Property 3: CSS Injection Correctness', () => {
  // --- Setup / Teardown ---

  beforeEach(() => {
    // Clear inline styles on document root
    document.documentElement.removeAttribute('style')
    // Remove data-theme attribute (default to light mode)
    document.documentElement.removeAttribute('data-theme')
    // Clear localStorage
    localStorage.removeItem('ubiquity-token-config')
  })

  // --- Arbitraries ---

  /** Arbitrary for a valid palette name */
  const arbPalette = fc.constantFrom(...PALETTE_NAMES)

  /** Arbitrary for a valid shade step */
  const arbShade = fc.constantFrom(...SHADE_STEPS)

  /** Arbitrary for a valid primitive reference: `{palette}-{shade}` */
  const arbPrimitiveRef = fc.tuple(arbPalette, arbShade).map(
    ([palette, shade]) => `${palette}-${shade}`
  )

  /** Arbitrary for a token name from DEFAULT_TOKEN_CONFIG colours */
  const tokenNames = Object.keys(DEFAULT_TOKEN_CONFIG.colours)
  const arbTokenName = fc.constantFrom(...tokenNames)

  // --- Tests ---

  it('updateColour injects the correct hex value as --{tokenName} on document root (100+ runs)', () => {
    fc.assert(
      fc.property(arbTokenName, arbPrimitiveRef, (tokenName, primitiveRef) => {
        // Render the hook fresh for each property check
        const { result, unmount } = renderHook(() => useTokenConfig())

        // Call updateColour in light mode (no data-theme attribute = light)
        act(() => {
          result.current.updateColour(tokenName, 'light', primitiveRef)
        })

        const expectedHex = resolveToHex(primitiveRef)
        expect(expectedHex).not.toBeNull()

        // With single injection, the token's CSS variable should be --{tokenName}
        const actual = document.documentElement.style.getPropertyValue(`--${tokenName}`)
        expect(
          actual,
          `Expected CSS var "--${tokenName}" to be "${expectedHex}" for ref "${primitiveRef}"`
        ).toBe(expectedHex)

        // Clean up: clear styles and localStorage between iterations
        document.documentElement.removeAttribute('style')
        localStorage.removeItem('ubiquity-token-config')
        unmount()
      }),
      { numRuns: 100 }
    )
  })

  it('all tokens inject directly as --{tokenName} (no dual injection)', () => {
    fc.assert(
      fc.property(arbTokenName, arbPrimitiveRef, (tokenName, primitiveRef) => {
        const { result, unmount } = renderHook(() => useTokenConfig())

        act(() => {
          result.current.updateColour(tokenName, 'light', primitiveRef)
        })

        const expectedHex = resolveToHex(primitiveRef)
        expect(expectedHex).not.toBeNull()

        // Verify the canonical variable is set
        const actual = document.documentElement.style.getPropertyValue(`--${tokenName}`)
        expect(
          actual,
          `CSS var "--${tokenName}" should equal "${expectedHex}" for ref "${primitiveRef}"`
        ).toBe(expectedHex)

        // Clean up
        document.documentElement.removeAttribute('style')
        localStorage.removeItem('ubiquity-token-config')
        unmount()
      }),
      { numRuns: 100 }
    )
  })
})
