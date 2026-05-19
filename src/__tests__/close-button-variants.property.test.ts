import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { closeButtonVariants } from '../components/ui/close-button'

/**
 * Feature: close-button-component
 * Property tests for CloseButton CVA variants
 *
 * **Validates: Requirements 1.2, 1.3, 1.4, 2.5, 4.1**
 */

const VALID_SIZES = ['xs', 'sm', 'default', 'lg'] as const
type Size = (typeof VALID_SIZES)[number]

const BASE_CLASSES = [
  'inline-flex',
  'items-center',
  'justify-center',
  'rounded-sm',
  'transition-colors',
]

const HOVER_CLASS = 'hover:bg-secondary'

const FOCUS_RING_CLASSES = [
  'focus-visible:outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-ring',
  'focus-visible:ring-offset-2',
  'ring-offset-background',
]

describe('Feature: close-button-component, Property 1: Base classes are always present', () => {
  /**
   * For any valid size value, the output of closeButtonVariants always contains
   * all base classes: inline-flex, items-center, justify-center, rounded-sm,
   * transition-colors, hover:bg-secondary, and the focus-visible ring classes.
   *
   * **Validates: Requirements 1.2, 1.3, 1.4**
   */
  it('output always contains base classes for any valid size', () => {
    const arbSize = fc.constantFrom<Size>(...VALID_SIZES)

    fc.assert(
      fc.property(arbSize, (size) => {
        const result = closeButtonVariants({ size })

        for (const cls of BASE_CLASSES) {
          expect(result).toContain(cls)
        }

        // Hover state (Requirement 1.3)
        expect(result).toContain(HOVER_CLASS)

        // Focus ring pattern (Requirement 1.4)
        for (const cls of FOCUS_RING_CLASSES) {
          expect(result).toContain(cls)
        }
      }),
      { numRuns: 100 }
    )
  })
})

describe('Feature: close-button-component, Property 2: Size variant omission equals default', () => {
  /**
   * Calling closeButtonVariants() with no size argument produces the same
   * output as calling closeButtonVariants({ size: "default" }).
   *
   * **Validates: Requirements 2.5**
   */
  it('no size arg produces same output as size: "default"', () => {
    const withoutSize = closeButtonVariants()
    const withDefault = closeButtonVariants({ size: 'default' })

    expect(withoutSize).toBe(withDefault)
  })

  it('passing undefined size produces same output as size: "default"', () => {
    const withUndefined = closeButtonVariants({ size: undefined })
    const withDefault = closeButtonVariants({ size: 'default' })

    expect(withUndefined).toBe(withDefault)
  })
})

describe('Feature: close-button-component, Property 3: Custom className merges without overriding', () => {
  /**
   * For any arbitrary className string passed to closeButtonVariants({ size, className }),
   * the resulting class string contains both the base/variant classes AND the custom className.
   *
   * **Validates: Requirements 4.1**
   */
  it('arbitrary className is present alongside base/variant classes', () => {
    const arbSize = fc.constantFrom<Size>(...VALID_SIZES)

    // Generate realistic Tailwind-like class names that won't conflict with base classes
    const arbClassName = fc.constantFrom(
      'absolute right-4 top-4',
      'mt-2 ml-auto',
      'opacity-70',
      'z-50',
      'shrink-0',
      'hidden md:flex',
      'border border-red-500',
      'shadow-lg',
      'cursor-pointer',
      'group-hover:visible',
    )

    fc.assert(
      fc.property(arbSize, arbClassName, (size, className) => {
        const result = closeButtonVariants({ size, className })

        // Custom className tokens should appear in the output
        const classTokens = className.split(' ')
        for (const token of classTokens) {
          expect(result).toContain(token)
        }

        // Base classes should still be present
        for (const cls of BASE_CLASSES) {
          expect(result).toContain(cls)
        }
      }),
      { numRuns: 100 }
    )
  })
})
