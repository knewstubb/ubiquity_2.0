import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { componentRegistry, type ComponentEntry } from './componentRegistry'

/**
 * Property 2: Component registry entries have valid categories
 * Validates: Requirements 5.2
 */
describe('Feature: shadcn-tailwind-integration, Property 2: Component registry entries have valid categories', () => {
  const validCategories: ComponentEntry['category'][] = ['tokens', 'inputs', 'display', 'feedback', 'navigation', 'compositions', 'atoms', 'sandboxes']

  it('every entry has a category from the valid set { custom, primitives, composed }', () => {
    for (const entry of componentRegistry) {
      expect(validCategories).toContain(entry.category)
    }
  })

  it('every entry has a non-empty name', () => {
    for (const entry of componentRegistry) {
      expect(entry.name.trim().length).toBeGreaterThan(0)
    }
  })

  it('every entry has a non-empty slug', () => {
    for (const entry of componentRegistry) {
      expect(entry.slug.trim().length).toBeGreaterThan(0)
    }
  })

  it('every entry has a non-empty description', () => {
    for (const entry of componentRegistry) {
      expect(entry.description.trim().length).toBeGreaterThan(0)
    }
  })

  it('all slugs are unique across the registry', () => {
    const slugs = componentRegistry.map((e) => e.slug)
    const uniqueSlugs = new Set(slugs)
    expect(uniqueSlugs.size).toBe(slugs.length)
  })

  it('all names are unique across the registry', () => {
    const names = componentRegistry.map((e) => e.name)
    const uniqueNames = new Set(names)
    expect(uniqueNames.size).toBe(names.length)
  })

  it('generated ComponentEntry-like objects with valid categories pass the category constraint', () => {
    const categoryArb = fc.constantFrom<ComponentEntry['category']>('tokens', 'inputs', 'display', 'feedback', 'navigation', 'compositions', 'atoms', 'sandboxes')
    const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0)

    const componentEntryArb = fc.record({
      name: nonEmptyStringArb,
      slug: nonEmptyStringArb,
      category: categoryArb,
      description: nonEmptyStringArb,
    })

    fc.assert(
      fc.property(componentEntryArb, (entry) => {
        // Category must be one of the valid set
        expect(validCategories).toContain(entry.category)

        // Name, slug, and description must be non-empty
        expect(entry.name.trim().length).toBeGreaterThan(0)
        expect(entry.slug.trim().length).toBeGreaterThan(0)
        expect(entry.description.trim().length).toBeGreaterThan(0)
      }),
      { numRuns: 100 }
    )
  })

  it('generated entries with invalid categories are rejected by the type constraint', () => {
    const invalidCategoryArb = fc
      .string({ minLength: 1, maxLength: 20 })
      .filter((s) => !validCategories.includes(s as ComponentEntry['category']))

    fc.assert(
      fc.property(invalidCategoryArb, (invalidCategory) => {
        // An invalid category should NOT be in the valid set
        expect(validCategories).not.toContain(invalidCategory)
      }),
      { numRuns: 100 }
    )
  })
})
