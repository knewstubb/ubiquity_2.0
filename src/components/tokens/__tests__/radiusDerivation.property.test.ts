import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

/**
 * Property 5: Radius Derivation Formula
 *
 * For any positive base radius value B (where B > 0), the derived radius values
 * SHALL be: sm = B × 0.6, md = B × 0.8, lg = B, xl = B × 1.4.
 * The `none` value is always 0 and `full` is always 9999.
 *
 * **Validates: Requirements 6.3**
 */

interface DerivedRadius {
  name: string
  value: number
}

function deriveRadiusValues(base: number): DerivedRadius[] {
  return [
    { name: 'none', value: 0 },
    { name: 'sm', value: base * 0.6 },
    { name: 'md', value: base * 0.8 },
    { name: 'lg', value: base },
    { name: 'xl', value: base * 1.4 },
    { name: 'full', value: 9999 },
  ]
}

describe('Feature: token-management-ui, Property 5: Radius Derivation Formula', () => {
  /** Generate positive base values: integers 1–100 and positive floats */
  const positiveBaseArb = fc.oneof(
    fc.integer({ min: 1, max: 100 }),
    fc.double({ min: 0.1, max: 100, noNaN: true, noDefaultInfinity: true })
  )

  it('sm equals base × 0.6 for any positive base', () => {
    fc.assert(
      fc.property(positiveBaseArb, (base) => {
        const derived = deriveRadiusValues(base)
        const sm = derived.find((d) => d.name === 'sm')!
        expect(sm.value).toBeCloseTo(base * 0.6, 10)
      }),
      { numRuns: 100 }
    )
  })

  it('md equals base × 0.8 for any positive base', () => {
    fc.assert(
      fc.property(positiveBaseArb, (base) => {
        const derived = deriveRadiusValues(base)
        const md = derived.find((d) => d.name === 'md')!
        expect(md.value).toBeCloseTo(base * 0.8, 10)
      }),
      { numRuns: 100 }
    )
  })

  it('lg equals base for any positive base', () => {
    fc.assert(
      fc.property(positiveBaseArb, (base) => {
        const derived = deriveRadiusValues(base)
        const lg = derived.find((d) => d.name === 'lg')!
        expect(lg.value).toBe(base)
      }),
      { numRuns: 100 }
    )
  })

  it('xl equals base × 1.4 for any positive base', () => {
    fc.assert(
      fc.property(positiveBaseArb, (base) => {
        const derived = deriveRadiusValues(base)
        const xl = derived.find((d) => d.name === 'xl')!
        expect(xl.value).toBeCloseTo(base * 1.4, 10)
      }),
      { numRuns: 100 }
    )
  })

  it('none is always 0 regardless of base', () => {
    fc.assert(
      fc.property(positiveBaseArb, (base) => {
        const derived = deriveRadiusValues(base)
        const none = derived.find((d) => d.name === 'none')!
        expect(none.value).toBe(0)
      }),
      { numRuns: 100 }
    )
  })

  it('full is always 9999 regardless of base', () => {
    fc.assert(
      fc.property(positiveBaseArb, (base) => {
        const derived = deriveRadiusValues(base)
        const full = derived.find((d) => d.name === 'full')!
        expect(full.value).toBe(9999)
      }),
      { numRuns: 100 }
    )
  })

  it('all derived values satisfy the complete formula simultaneously', () => {
    fc.assert(
      fc.property(positiveBaseArb, (base) => {
        const derived = deriveRadiusValues(base)
        const byName = Object.fromEntries(derived.map((d) => [d.name, d.value]))

        expect(byName['none']).toBe(0)
        expect(byName['sm']).toBeCloseTo(base * 0.6, 10)
        expect(byName['md']).toBeCloseTo(base * 0.8, 10)
        expect(byName['lg']).toBe(base)
        expect(byName['xl']).toBeCloseTo(base * 1.4, 10)
        expect(byName['full']).toBe(9999)
      }),
      { numRuns: 100 }
    )
  })
})
