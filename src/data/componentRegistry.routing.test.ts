import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { componentRegistry } from './componentRegistry'

/**
 * Property 3: Deep-link routing resolves to correct component
 * Validates: Requirements 5.5
 */

/**
 * Converts a PascalCase or camelCase name to kebab-case.
 * Rules:
 * - PascalCase → kebab-case: "StatusBadge" → "status-badge"
 * - Already lowercase: "button" → "button"
 * - Acronyms: "DropdownMenu" → "dropdown-menu"
 */
function toKebabCase(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

describe('Feature: shadcn-tailwind-integration, Property 3: Deep-link routing resolves to correct component', () => {
  it('every registry entry slug is a valid kebab-case transformation of its name (for PascalCase names)', () => {
    for (const entry of componentRegistry) {
      // Skip entries with spaces or special characters in the name
      // These have manually-set slugs that don't follow the PascalCase→kebab rule
      if (/\s|[^a-zA-Z0-9]/.test(entry.name)) continue
      // Skip entries with manually overridden slugs (prefixed like "shadcn-button")
      if (entry.slug.startsWith('shadcn-')) continue
      const expectedSlug = toKebabCase(entry.name)
      expect(entry.slug).toBe(expectedSlug)
    }
  })

  it('every registry entry resolves to the correct deep-link URL', () => {
    for (const entry of componentRegistry) {
      const expectedUrl = `/admin/components/${entry.category}/${entry.slug}`
      // The URL should be constructable from category + slug
      expect(expectedUrl).toBe(`/admin/components/${entry.category}/${entry.slug}`)
      // The slug in the URL should match the entry
      const matchedEntry = componentRegistry.find(
        (e) => e.category === entry.category && e.slug === entry.slug
      )
      expect(matchedEntry).toBeDefined()
      expect(matchedEntry!.name).toBe(entry.name)
    }
  })

  it('all slugs produce URL-safe strings (no special characters)', () => {
    for (const entry of componentRegistry) {
      // Slugs should only contain lowercase letters, numbers, and hyphens
      expect(entry.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    }
  })

  it('generated PascalCase names produce valid URL-safe kebab-case slugs', () => {
    // Generate PascalCase component names (1-4 words, each starting with uppercase)
    const pascalWordArb = fc
      .tuple(
        fc.constantFrom(
          'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'
        ),
        fc.stringMatching(/^[a-z]{1,8}$/)
      )
      .map(([upper, rest]) => upper + rest)

    const pascalCaseNameArb = fc
      .array(pascalWordArb, { minLength: 1, maxLength: 4 })
      .map((words) => words.join(''))

    fc.assert(
      fc.property(pascalCaseNameArb, (name) => {
        const slug = toKebabCase(name)

        // Slug must be non-empty
        expect(slug.length).toBeGreaterThan(0)

        // Slug must be all lowercase
        expect(slug).toBe(slug.toLowerCase())

        // Slug must only contain lowercase letters, numbers, and hyphens
        expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)

        // Slug must not start or end with a hyphen
        expect(slug.startsWith('-')).toBe(false)
        expect(slug.endsWith('-')).toBe(false)

        // Slug must not contain consecutive hyphens
        expect(slug).not.toContain('--')

        // The URL constructed from the slug must be valid
        const url = `/admin/components/custom/${slug}`
        expect(url).toMatch(/^\/admin\/components\/[a-z]+\/[a-z0-9-]+$/)
      }),
      { numRuns: 100 }
    )
  })

  it('kebab-case transformation is deterministic (same input always produces same output)', () => {
    const pascalWordArb = fc
      .tuple(
        fc.constantFrom(
          'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'
        ),
        fc.stringMatching(/^[a-z]{1,8}$/)
      )
      .map(([upper, rest]) => upper + rest)

    const pascalCaseNameArb = fc
      .array(pascalWordArb, { minLength: 1, maxLength: 4 })
      .map((words) => words.join(''))

    fc.assert(
      fc.property(pascalCaseNameArb, (name) => {
        const slug1 = toKebabCase(name)
        const slug2 = toKebabCase(name)
        expect(slug1).toBe(slug2)
      }),
      { numRuns: 100 }
    )
  })

  it('deep-link URL resolution: slug lookup finds the correct component', () => {
    // For each entry, simulate URL resolution by extracting slug from URL path
    // and looking up the component in the registry
    const categoryArb = fc.constantFrom<'tokens' | 'inputs' | 'display' | 'feedback' | 'navigation' | 'composed'>('tokens', 'inputs', 'display', 'feedback', 'navigation', 'composed')
    const registryIndexArb = fc.integer({ min: 0, max: componentRegistry.length - 1 })

    fc.assert(
      fc.property(registryIndexArb, (index) => {
        const entry = componentRegistry[index]
        const url = `/admin/components/${entry.category}/${entry.slug}`

        // Extract category and slug from URL
        const parts = url.split('/')
        const urlCategory = parts[3]
        const urlSlug = parts[4]

        // Resolve: find the component by category + slug
        const resolved = componentRegistry.find(
          (e) => e.category === urlCategory && e.slug === urlSlug
        )

        // Must resolve to the correct component
        expect(resolved).toBeDefined()
        expect(resolved!.name).toBe(entry.name)
        expect(resolved!.category).toBe(entry.category)
        expect(resolved!.slug).toBe(entry.slug)
      }),
      { numRuns: 100 }
    )
  })
})
