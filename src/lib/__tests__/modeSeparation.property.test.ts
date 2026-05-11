import { describe, it, expect, beforeEach } from 'vitest'
import fc from 'fast-check'
import { renderHook, act } from '@testing-library/react'
import { useTokenConfig } from '../useTokenConfig'
import { PALETTE_NAMES, SHADE_STEPS } from '../../data/tailwindPalette'
import { DEFAULT_TOKEN_CONFIG } from '../../data/defaultTokenConfig'

/**
 * Property 4: Light/Dark Mode Independence
 *
 * For any colour token, updating the light mode value SHALL NOT change the
 * dark mode value stored in the config, and updating the dark mode value
 * SHALL NOT change the light mode value.
 *
 * Formally: for any token T, `updateColour(T, 'light', X)` leaves
 * `config.colours[T].dark` unchanged, and vice versa.
 *
 * **Validates: Requirements 3.4**
 */

const TOKEN_NAMES = Object.keys(DEFAULT_TOKEN_CONFIG.colours)

/** Arbitrary that generates a valid palette-shade primitive reference */
const arbPrimitiveRef = fc
  .tuple(
    fc.constantFrom(...PALETTE_NAMES),
    fc.constantFrom(...SHADE_STEPS),
  )
  .map(([palette, shade]) => `${palette}-${shade}`)

/** Arbitrary that picks a random token name from the default config */
const arbTokenName = fc.constantFrom(...TOKEN_NAMES)

describe('Property 4: Light/Dark Mode Independence', () => {
  beforeEach(() => {
    // Clear localStorage and inline styles between tests
    localStorage.removeItem('ubiquity-token-config')
    document.documentElement.removeAttribute('style')
  })

  it('updating light mode value does NOT change dark mode value', () => {
    fc.assert(
      fc.property(arbTokenName, arbPrimitiveRef, (tokenName, newValue) => {
        const { result } = renderHook(() => useTokenConfig())

        // Capture the dark mode value before the light mode update
        const darkBefore = result.current.config.colours[tokenName].dark

        // Update the light mode value
        act(() => {
          result.current.updateColour(tokenName, 'light', newValue)
        })

        // Assert dark mode value is unchanged
        const darkAfter = result.current.config.colours[tokenName].dark
        expect(darkAfter).toBe(darkBefore)
      }),
      { numRuns: 100 },
    )
  })

  it('updating dark mode value does NOT change light mode value', () => {
    fc.assert(
      fc.property(arbTokenName, arbPrimitiveRef, (tokenName, newValue) => {
        const { result } = renderHook(() => useTokenConfig())

        // Capture the light mode value before the dark mode update
        const lightBefore = result.current.config.colours[tokenName].light

        // Update the dark mode value
        act(() => {
          result.current.updateColour(tokenName, 'dark', newValue)
        })

        // Assert light mode value is unchanged
        const lightAfter = result.current.config.colours[tokenName].light
        expect(lightAfter).toBe(lightBefore)
      }),
      { numRuns: 100 },
    )
  })
})
