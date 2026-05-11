import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { cn } from './utils'

/**
 * Property 1: cn() utility is deterministic and handles conflicts
 * Validates: Requirements 3.3
 */
describe('Feature: shadcn-tailwind-integration, Property 1: cn() utility is deterministic and handles conflicts', () => {
  // Tailwind utility generators for realistic class strings
  const spacingValues = ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20']
  const spacingPrefixes = ['p', 'px', 'py', 'pt', 'pb', 'pl', 'pr', 'm', 'mx', 'my', 'mt', 'mb', 'ml', 'mr']
  const widthValues = ['w-full', 'w-auto', 'w-1/2', 'w-1/3', 'w-1/4', 'w-screen']
  const displayValues = ['block', 'inline-block', 'inline', 'flex', 'grid', 'hidden']
  const textSizes = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl']
  const fontWeights = ['font-thin', 'font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold']
  const bgColors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-white', 'bg-black', 'bg-zinc-100']
  const textColors = ['text-red-500', 'text-blue-500', 'text-green-500', 'text-white', 'text-black', 'text-zinc-600']
  const roundedValues = ['rounded-none', 'rounded-sm', 'rounded', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-full']
  const flexValues = ['flex-row', 'flex-col', 'flex-wrap', 'flex-nowrap']
  const gapValues = ['gap-0', 'gap-1', 'gap-2', 'gap-4', 'gap-6', 'gap-8']

  // Generator for a single Tailwind class
  const tailwindClassArb = fc.oneof(
    fc.tuple(
      fc.constantFrom(...spacingPrefixes),
      fc.constantFrom(...spacingValues)
    ).map(([prefix, value]) => `${prefix}-${value}`),
    fc.constantFrom(...widthValues),
    fc.constantFrom(...displayValues),
    fc.constantFrom(...textSizes),
    fc.constantFrom(...fontWeights),
    fc.constantFrom(...bgColors),
    fc.constantFrom(...textColors),
    fc.constantFrom(...roundedValues),
    fc.constantFrom(...flexValues),
    fc.constantFrom(...gapValues)
  )

  // Generator for an array of Tailwind classes (1-10 classes)
  const tailwindClassArrayArb = fc.array(tailwindClassArb, { minLength: 1, maxLength: 10 })

  it('is deterministic: same input always produces same output', () => {
    fc.assert(
      fc.property(tailwindClassArrayArb, (classes) => {
        const input = classes.join(' ')
        const result1 = cn(input)
        const result2 = cn(input)
        expect(result1).toBe(result2)
      }),
      { numRuns: 100 }
    )
  })

  it('is deterministic with multiple arguments', () => {
    fc.assert(
      fc.property(tailwindClassArrayArb, tailwindClassArrayArb, (classes1, classes2) => {
        const result1 = cn(classes1.join(' '), classes2.join(' '))
        const result2 = cn(classes1.join(' '), classes2.join(' '))
        expect(result1).toBe(result2)
      }),
      { numRuns: 100 }
    )
  })

  it('resolves conflicting classes: later wins over earlier', () => {
    // Generate pairs of conflicting utilities (same prefix, different values)
    const conflictingPairArb = fc.tuple(
      fc.constantFrom(...spacingPrefixes),
      fc.constantFrom(...spacingValues),
      fc.constantFrom(...spacingValues)
    ).filter(([, v1, v2]) => v1 !== v2)

    fc.assert(
      fc.property(conflictingPairArb, ([prefix, earlier, later]) => {
        const earlierClass = `${prefix}-${earlier}`
        const laterClass = `${prefix}-${later}`
        const result = cn(earlierClass, laterClass)

        // Split into individual classes for exact matching
        const resultClasses = result.split(' ')

        // The later class should be in the result as an exact class
        expect(resultClasses).toContain(laterClass)
        // The earlier conflicting class should NOT be in the result as an exact class
        expect(resultClasses).not.toContain(earlierClass)
      }),
      { numRuns: 100 }
    )
  })

  it('output is always a valid space-separated class string (no double spaces, no leading/trailing spaces)', () => {
    fc.assert(
      fc.property(tailwindClassArrayArb, (classes) => {
        const result = cn(...classes)

        // No leading or trailing whitespace
        expect(result).toBe(result.trim())

        // No double spaces
        expect(result).not.toMatch(/  /)

        // If non-empty, every segment is a non-empty string
        if (result.length > 0) {
          const segments = result.split(' ')
          for (const segment of segments) {
            expect(segment.length).toBeGreaterThan(0)
          }
        }
      }),
      { numRuns: 100 }
    )
  })

  it('output is always a valid space-separated class string with mixed inputs', () => {
    // Test with various input patterns including empty strings and undefined-like values
    const mixedInputArb = fc.oneof(
      tailwindClassArb,
      fc.constant(''),
      fc.constant(undefined as unknown as string),
      fc.constant(null as unknown as string),
      fc.constant(false as unknown as string)
    )

    const mixedArrayArb = fc.array(mixedInputArb, { minLength: 0, maxLength: 10 })

    fc.assert(
      fc.property(mixedArrayArb, (inputs) => {
        const result = cn(...inputs)

        // No leading or trailing whitespace
        expect(result).toBe(result.trim())

        // No double spaces
        expect(result).not.toMatch(/  /)

        // Result is a string
        expect(typeof result).toBe('string')
      }),
      { numRuns: 100 }
    )
  })
})
