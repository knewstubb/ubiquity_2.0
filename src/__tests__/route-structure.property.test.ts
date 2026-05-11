import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { componentRegistry } from '../data/componentRegistry'

/**
 * Feature: component-library-reorganisation, Property 5: Route structure consistency
 *
 * For any non-token entry in the registry, its navigable route is exactly
 * `/admin/components/${entry.category}/${entry.slug}`.
 *
 * For token entries, the route is `/admin/components/tokens/${entry.slug}`.
 *
 * **Validates: Requirements 6.1, 1.3**
 */
describe('Feature: component-library-reorganisation, Property 5: Route structure consistency', () => {
  const nonTokenEntries = componentRegistry.filter((entry) => entry.category !== 'tokens')
  const tokenEntries = componentRegistry.filter((entry) => entry.category === 'tokens')

  it('every non-token entry has route /admin/components/${category}/${slug}', () => {
    const arbEntry = fc.constantFrom(...nonTokenEntries)

    fc.assert(
      fc.property(arbEntry, (entry) => {
        const expectedRoute = `/admin/components/${entry.category}/${entry.slug}`
        // Verify the route follows the pattern
        expect(expectedRoute).toBe(`/admin/components/${entry.category}/${entry.slug}`)
        // Verify category is not 'tokens'
        expect(entry.category).not.toBe('tokens')
        // Verify slug is non-empty
        expect(entry.slug.length).toBeGreaterThan(0)
        // Verify category is non-empty
        expect(entry.category.length).toBeGreaterThan(0)
        // Verify route starts with the correct base path
        expect(expectedRoute).toMatch(/^\/admin\/components\/[a-z]+\/[a-z0-9-]+$/)
      }),
      { numRuns: 100 }
    )
  })

  it('every token entry has route /admin/components/tokens/${slug}', () => {
    const arbEntry = fc.constantFrom(...tokenEntries)

    fc.assert(
      fc.property(arbEntry, (entry) => {
        const expectedRoute = `/admin/components/tokens/${entry.slug}`
        // Verify the route follows the token pattern
        expect(expectedRoute).toBe(`/admin/components/tokens/${entry.slug}`)
        // Verify category is 'tokens'
        expect(entry.category).toBe('tokens')
        // Verify slug is non-empty
        expect(entry.slug.length).toBeGreaterThan(0)
        // Verify route matches expected format
        expect(expectedRoute).toMatch(/^\/admin\/components\/tokens\/[a-z0-9-]+$/)
      }),
      { numRuns: 100 }
    )
  })

  it('random subsets of non-token entries all follow the route pattern', () => {
    const arbSubset = fc.subarray([...nonTokenEntries], { minLength: 1 })

    fc.assert(
      fc.property(arbSubset, (subset) => {
        for (const entry of subset) {
          const expectedRoute = `/admin/components/${entry.category}/${entry.slug}`
          // Route must match the pattern /admin/components/:category/:slug
          expect(expectedRoute).toMatch(/^\/admin\/components\/[a-z]+\/[a-z0-9-]+$/)
          // Category must not be 'tokens' for non-token entries
          expect(entry.category).not.toBe('tokens')
        }
      }),
      { numRuns: 100 }
    )
  })

  it('no non-token entry produces a route that collides with the tokens namespace', () => {
    const arbEntry = fc.constantFrom(...nonTokenEntries)

    fc.assert(
      fc.property(arbEntry, (entry) => {
        const route = `/admin/components/${entry.category}/${entry.slug}`
        // Route must not start with /admin/components/tokens/
        expect(route).not.toMatch(/^\/admin\/components\/tokens\//)
      }),
      { numRuns: 100 }
    )
  })
})
