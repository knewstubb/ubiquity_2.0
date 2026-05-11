import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { DEFAULT_TOKEN_CONFIG } from '../data/defaultTokenConfig'

/**
 * Feature: tailwind-token-migration, Property 4: No UDS Naming in Canonical Config
 *
 * For any key in DEFAULT_TOKEN_CONFIG.colours, the key SHALL NOT match UDS naming
 * patterns: it SHALL NOT start with `color-`, `state-`, `danger-` (except
 * `danger-hover`, `danger-text`), or contain the substring `text-` as a prefix
 * (except `text-inverse`), and SHALL NOT duplicate a shadcn-named token's value
 * and semantic purpose.
 *
 * **Validates: Requirements 5.5, 5.6**
 */
describe('Feature: tailwind-token-migration, Property 4: No UDS Naming in Canonical Config', () => {
  const tokenNames = Object.keys(DEFAULT_TOKEN_CONFIG.colours)

  // Allowed exceptions for danger- prefix
  const dangerExceptions = ['danger-hover', 'danger-text']

  // Allowed exceptions for text- prefix
  const textExceptions = ['text-inverse']

  it('no token starts with "color-" prefix', () => {
    const arbTokenName = fc.constantFrom(...tokenNames)

    fc.assert(
      fc.property(arbTokenName, (tokenName) => {
        expect(tokenName.startsWith('color-')).toBe(false)
      }),
      { numRuns: 100 }
    )
  })

  it('no token starts with "state-" prefix', () => {
    const arbTokenName = fc.constantFrom(...tokenNames)

    fc.assert(
      fc.property(arbTokenName, (tokenName) => {
        expect(tokenName.startsWith('state-')).toBe(false)
      }),
      { numRuns: 100 }
    )
  })

  it('no token starts with "danger-" prefix except danger-hover and danger-text', () => {
    const arbTokenName = fc.constantFrom(...tokenNames)

    fc.assert(
      fc.property(arbTokenName, (tokenName) => {
        if (tokenName.startsWith('danger-')) {
          expect(dangerExceptions).toContain(tokenName)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('no token starts with "text-" prefix except text-inverse', () => {
    const arbTokenName = fc.constantFrom(...tokenNames)

    fc.assert(
      fc.property(arbTokenName, (tokenName) => {
        if (tokenName.startsWith('text-')) {
          expect(textExceptions).toContain(tokenName)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('all forbidden UDS patterns are absent across random token subsets', () => {
    const arbTokenSubset = fc.subarray(tokenNames, { minLength: 1 })

    fc.assert(
      fc.property(arbTokenSubset, (subset) => {
        for (const tokenName of subset) {
          // SHALL NOT start with color-
          expect(tokenName.startsWith('color-')).toBe(false)

          // SHALL NOT start with state-
          expect(tokenName.startsWith('state-')).toBe(false)

          // SHALL NOT start with danger- unless it's an allowed exception
          if (tokenName.startsWith('danger-')) {
            expect(dangerExceptions).toContain(tokenName)
          }

          // SHALL NOT start with text- unless it's an allowed exception
          if (tokenName.startsWith('text-')) {
            expect(textExceptions).toContain(tokenName)
          }
        }
      }),
      { numRuns: 100 }
    )
  })
})
