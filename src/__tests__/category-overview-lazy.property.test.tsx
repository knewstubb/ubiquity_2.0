import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import fc from 'fast-check'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { componentRegistry } from '../data/componentRegistry'
import type { ComponentCategory } from '../data/componentRegistry'
import { CategoryOverview } from '../pages/ComponentLibraryPage'

/**
 * Feature: component-library-reorganisation, Property 6: Category overview completeness
 *
 * For any valid category, navigating to `/admin/components/:category` without a slug
 * renders a category overview that lists every component registered in that category
 * (by name and description).
 *
 * **Validates: Requirements 6.3**
 */

/**
 * Feature: component-library-reorganisation, Property 7: Lazy loading
 *
 * For any component entry in the registry, its `component` field is a
 * `LazyExoticComponent` (created via `React.lazy()`).
 *
 * **Validates: Requirements 6.4**
 */

const VALID_CATEGORIES: ComponentCategory[] = [
  'tokens',
  'inputs',
  'display',
  'feedback',
  'navigation',
  'compositions',
]

beforeAll(() => {
  // Mock ResizeObserver for any components that need it
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

afterEach(() => {
  cleanup()
})

function renderCategoryOverview(category: string) {
  return render(
    <MemoryRouter initialEntries={[`/admin/components/${category}`]}>
      <Routes>
        <Route path="/admin/components/:category" element={<CategoryOverview />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Feature: component-library-reorganisation, Property 6: Category overview completeness', () => {
  it('every component in a category is listed by name and description', () => {
    const arbCategory = fc.constantFrom(...VALID_CATEGORIES)

    fc.assert(
      fc.property(arbCategory, (category) => {
        const { unmount } = renderCategoryOverview(category)

        const expectedEntries = componentRegistry.filter((c) => c.category === category)

        // Every entry's name should appear in the rendered output
        for (const entry of expectedEntries) {
          const nameEl = screen.getByText(entry.name)
          expect(nameEl).toBeInTheDocument()
        }

        // Every entry's description should appear in the rendered output
        for (const entry of expectedEntries) {
          const descEl = screen.getByText(entry.description)
          expect(descEl).toBeInTheDocument()
        }

        unmount()
      }),
      { numRuns: 100 }
    )
  })

  it('the number of listed items matches the registry count for that category', () => {
    const arbCategory = fc.constantFrom(...VALID_CATEGORIES)

    fc.assert(
      fc.property(arbCategory, (category) => {
        const { unmount } = renderCategoryOverview(category)

        const expectedEntries = componentRegistry.filter((c) => c.category === category)

        // Each entry renders as a link in the overview grid
        const links = screen.getAllByRole('link')
        expect(links.length).toBe(expectedEntries.length)

        unmount()
      }),
      { numRuns: 100 }
    )
  })

  it('random subsets of categories all list their complete set of components', () => {
    const arbSubset = fc.subarray([...VALID_CATEGORIES], { minLength: 1 })

    fc.assert(
      fc.property(arbSubset, (subset) => {
        for (const category of subset) {
          const { unmount } = renderCategoryOverview(category)

          const expectedEntries = componentRegistry.filter((c) => c.category === category)

          for (const entry of expectedEntries) {
            expect(screen.getByText(entry.name)).toBeInTheDocument()
            expect(screen.getByText(entry.description)).toBeInTheDocument()
          }

          unmount()
        }
      }),
      { numRuns: 20 }
    )
  }, 10000)
})

describe('Feature: component-library-reorganisation, Property 7: Lazy loading', () => {
  // The React.lazy() symbol marker
  const REACT_LAZY_TYPE = Symbol.for('react.lazy')

  it('every registry entry has a component field with $$typeof equal to Symbol.for("react.lazy")', () => {
    const arbEntry = fc.constantFrom(...componentRegistry)

    fc.assert(
      fc.property(arbEntry, (entry) => {
        // React.lazy() components have $$typeof set to the react.lazy symbol
        const component = entry.component as unknown as { $$typeof: symbol }
        expect(component.$$typeof).toBe(REACT_LAZY_TYPE)
      }),
      { numRuns: 100 }
    )
  })

  it('random subsets of entries all have lazy-loaded components', () => {
    const arbSubset = fc.subarray([...componentRegistry], { minLength: 1 })

    fc.assert(
      fc.property(arbSubset, (subset) => {
        for (const entry of subset) {
          const component = entry.component as unknown as { $$typeof: symbol }
          expect(component.$$typeof).toBe(REACT_LAZY_TYPE)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('entries filtered by random category all have lazy-loaded components', () => {
    const arbCategory = fc.constantFrom(...VALID_CATEGORIES)

    fc.assert(
      fc.property(arbCategory, (category) => {
        const entries = componentRegistry.filter((c) => c.category === category)
        for (const entry of entries) {
          const component = entry.component as unknown as { $$typeof: symbol }
          expect(component.$$typeof).toBe(REACT_LAZY_TYPE)
        }
      }),
      { numRuns: 100 }
    )
  })
})
