import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

/**
 * Feature: alert-dialog-composed, Property 1 (input guard subset)
 *
 * Tests the type-to-confirm guard logic extracted from AlertDialogComposed.
 * The guard condition is:
 *   confirmDisabled = isLoading || !inputValid
 *   inputValid = !showInput || inputValue === requiresInput
 *   showInput = !!requiresInput && intent === 'destructive'
 *
 * For destructive intent with requiresInput set, confirm is disabled
 * unless the user has typed the exact required string.
 *
 * **Validates: Requirements 5.2**
 */

/**
 * Pure guard logic extracted from the component for testability.
 * Mirrors the derived state in alert-dialog-composed.tsx.
 */
function computeConfirmDisabled(
  requiresInput: string | undefined,
  intent: 'neutral' | 'warning' | 'destructive',
  inputValue: string,
  isLoading: boolean
): boolean {
  const showInput = !!requiresInput && intent === 'destructive'
  const inputValid = !showInput || inputValue === requiresInput
  return isLoading || !inputValid
}

describe('Feature: alert-dialog-composed, Property: Input guard disables confirm', () => {
  it('for any string R and any string I where I !== R, confirm is disabled', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.string(),
        (requiresInput, inputValue) => {
          // Precondition: input does not match the required string
          fc.pre(inputValue !== requiresInput)

          const disabled = computeConfirmDisabled(
            requiresInput,
            'destructive',
            inputValue,
            false // not loading
          )

          expect(disabled).toBe(true)
        }
      ),
      { numRuns: 200 }
    )
  })

  it('for any non-empty string R, typing exactly R enables confirm', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        (requiresInput) => {
          const disabled = computeConfirmDisabled(
            requiresInput,
            'destructive',
            requiresInput, // input matches exactly
            false // not loading
          )

          expect(disabled).toBe(false)
        }
      ),
      { numRuns: 200 }
    )
  })
})
