import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { componentRegistry } from '../data/componentRegistry'

/**
 * Feature: component-library-reorganisation, Property 1: Category validity
 *
 * For any component entry in the registry, its `category` field must be one of
 * the six valid values: 'tokens' | 'inputs' | 'display' | 'feedback' | 'navigation' | 'compositions'.
 * No other values are permitted.
 *
 * **Validates: Requirements 2.1, 2.10, 4.4**
 */
describe('Feature: component-library-reorganisation, Property 1: Category validity', () => {
  const validCategories = ['tokens', 'inputs', 'display', 'feedback', 'navigation', 'compositions'] as const

  it('every entry has a category from the valid set', () => {
    const arbEntry = fc.constantFrom(...componentRegistry)

    fc.assert(
      fc.property(arbEntry, (entry) => {
        expect(validCategories).toContain(entry.category)
      }),
      { numRuns: 100 }
    )
  })

  it('random subsets of entries all have valid categories', () => {
    const arbSubset = fc.subarray([...componentRegistry], { minLength: 1 })

    fc.assert(
      fc.property(arbSubset, (subset) => {
        for (const entry of subset) {
          expect(validCategories).toContain(entry.category)
        }
      }),
      { numRuns: 100 }
    )
  })
})

/**
 * Feature: component-library-reorganisation, Property 2: No legacy entries
 *
 * No entry has `foundations` or `custom` category, and no removed foundation slugs
 * exist (no entry with slug 'typography', 'colours', 'shadows', 'spacing-radius',
 * or 'tokens' combined with a `foundations` category).
 *
 * **Validates: Requirements 4.1, 4.2, 4.4**
 */
describe('Feature: component-library-reorganisation, Property 2: No legacy entries', () => {
  const legacyCategories = ['foundations', 'custom']
  const removedFoundationSlugs = ['typography', 'colours', 'shadows', 'spacing-radius', 'tokens']

  it('no entry has a legacy category (foundations or custom)', () => {
    const arbEntry = fc.constantFrom(...componentRegistry)

    fc.assert(
      fc.property(arbEntry, (entry) => {
        expect(legacyCategories).not.toContain(entry.category)
      }),
      { numRuns: 100 }
    )
  })

  it('no entry combines a removed foundation slug with the foundations category', () => {
    const arbEntry = fc.constantFrom(...componentRegistry)

    fc.assert(
      fc.property(arbEntry, (entry) => {
        const isLegacyFoundation =
          entry.category === 'foundations' && removedFoundationSlugs.includes(entry.slug)
        expect(isLegacyFoundation).toBe(false)
      }),
      { numRuns: 100 }
    )
  })

  it('random subsets confirm no legacy categories or foundation slug combinations', () => {
    const arbSubset = fc.subarray([...componentRegistry], { minLength: 1 })

    fc.assert(
      fc.property(arbSubset, (subset) => {
        for (const entry of subset) {
          // No legacy categories
          expect(legacyCategories).not.toContain(entry.category)
          // No removed foundation slug + foundations category combination
          const isLegacyFoundation =
            entry.category === 'foundations' && removedFoundationSlugs.includes(entry.slug)
          expect(isLegacyFoundation).toBe(false)
        }
      }),
      { numRuns: 100 }
    )
  })
})
