import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest'
import fc from 'fast-check'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { componentRegistry } from '../data/componentRegistry'
import type { ComponentCategory } from '../data/componentRegistry'

/**
 * Feature: component-library-reorganisation, Property 3: Sidebar item order matches registry
 *
 * For any category, the sidebar items rendered under that category heading appear
 * in the same order as the entries are defined in the `componentRegistry` array
 * for that category.
 *
 * **Validates: Requirements 2.3**
 */

/**
 * Feature: component-library-reorganisation, Property 4: Sidebar group toggle
 *
 * For any category group in the sidebar, clicking the group heading toggles the
 * visibility of its child items — if expanded, items become hidden; if collapsed,
 * items become visible.
 *
 * **Validates: Requirements 1.7, 1.8**
 */

// We need to import the SidebarNav indirectly via ComponentLibraryPage
// Since SidebarNav is not exported, we render the full page layout
import ComponentLibraryPage from '../pages/ComponentLibraryPage'

const CATEGORIES: { id: ComponentCategory; label: string }[] = [
  { id: 'tokens', label: 'Tokens' },
  { id: 'inputs', label: 'Inputs' },
  { id: 'display', label: 'Display' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'compositions', label: 'Compositions' },
]

// Only categories that have items in the registry
const categoriesWithItems = CATEGORIES.filter(
  (cat) => componentRegistry.filter((c) => c.category === cat.id).length > 0
)

function renderSidebar() {
  return render(
    <MemoryRouter initialEntries={['/admin/components']}>
      <ComponentLibraryPage />
    </MemoryRouter>
  )
}

beforeAll(() => {
  // Mock ResizeObserver for sidebar components
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  // Mock window.matchMedia for the useIsMobile hook used by shadcn Sidebar
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
})

afterEach(() => {
  cleanup()
})

describe('Feature: component-library-reorganisation, Property 3: Sidebar item order matches registry', () => {
  it('items under each category heading appear in registry order', () => {
    // Generate random categories from those that have items
    const arbCategory = fc.constantFrom(...categoriesWithItems)

    fc.assert(
      fc.property(arbCategory, (cat) => {
        const { unmount } = renderSidebar()

        // Get the expected items from the registry in order
        const expectedItems = componentRegistry
          .filter((c) => c.category === cat.id)
          .map((c) => c.name)

        // Find all links in the sidebar — NavLink elements render the item names
        const allLinks = screen.getAllByRole('link')
        
        // Filter links to those that belong to this category
        // Items in this category will have href matching the category pattern
        const categoryLinks = allLinks.filter((link) => {
          const href = link.getAttribute('href') || ''
          if (cat.id === 'tokens') {
            return href.startsWith('/admin/components/tokens/')
          }
          return href.startsWith(`/admin/components/${cat.id}/`)
        })

        const renderedNames = categoryLinks.map((link) => link.textContent?.trim())

        // Verify order matches
        expect(renderedNames).toEqual(expectedItems)

        unmount()
      }),
      { numRuns: 100 }
    )
  })

  it('random subsets of categories all maintain registry order', () => {
    const arbSubset = fc.subarray([...categoriesWithItems], { minLength: 1 })

    fc.assert(
      fc.property(arbSubset, (subset) => {
        const { unmount } = renderSidebar()

        for (const cat of subset) {
          const expectedItems = componentRegistry
            .filter((c) => c.category === cat.id)
            .map((c) => c.name)

          const allLinks = screen.getAllByRole('link')
          const categoryLinks = allLinks.filter((link) => {
            const href = link.getAttribute('href') || ''
            if (cat.id === 'tokens') {
              return href.startsWith('/admin/components/tokens/')
            }
            return href.startsWith(`/admin/components/${cat.id}/`)
          })

          const renderedNames = categoryLinks.map((link) => link.textContent?.trim())
          expect(renderedNames).toEqual(expectedItems)
        }

        unmount()
      }),
      { numRuns: 100 }
    )
  })
})

describe('Feature: component-library-reorganisation, Property 4: Sidebar group toggle', () => {
  it('clicking a group heading hides its items when expanded', () => {
    // Use sequences of random categories to test toggle within fewer renders
    const arbCategories = fc.array(fc.constantFrom(...categoriesWithItems), { minLength: 1, maxLength: 3 })

    fc.assert(
      fc.property(arbCategories, (cats) => {
        const { unmount } = renderSidebar()

        for (const cat of cats) {
          // All groups start expanded — verify items are visible
          const expectedItems = componentRegistry
            .filter((c) => c.category === cat.id)
            .map((c) => c.name)

          // Items should be visible initially (or after re-expand from previous iteration)
          for (const itemName of expectedItems) {
            expect(screen.getByRole('link', { name: itemName })).toBeInTheDocument()
          }

          // Click the category heading to collapse
          const heading = screen.getByText(cat.label)
          fireEvent.click(heading)

          // Items should now be hidden
          for (const itemName of expectedItems) {
            expect(screen.queryByRole('link', { name: itemName })).not.toBeInTheDocument()
          }

          // Re-expand for next iteration within same render
          fireEvent.click(heading)
        }

        unmount()
      }),
      { numRuns: 100 }
    )
  }, 30000)

  it('clicking a collapsed group heading shows its items', () => {
    const arbCategories = fc.array(fc.constantFrom(...categoriesWithItems), { minLength: 1, maxLength: 3 })

    fc.assert(
      fc.property(arbCategories, (cats) => {
        const { unmount } = renderSidebar()

        for (const cat of cats) {
          const expectedItems = componentRegistry
            .filter((c) => c.category === cat.id)
            .map((c) => c.name)

          // Click to collapse
          const heading = screen.getByText(cat.label)
          fireEvent.click(heading)

          // Verify collapsed
          for (const itemName of expectedItems) {
            expect(screen.queryByRole('link', { name: itemName })).not.toBeInTheDocument()
          }

          // Click again to expand
          fireEvent.click(heading)

          // Items should be visible again
          for (const itemName of expectedItems) {
            expect(screen.getByRole('link', { name: itemName })).toBeInTheDocument()
          }
        }

        unmount()
      }),
      { numRuns: 100 }
    )
  }, 30000)

  it('toggling one group does not affect other groups', () => {
    // Pick two different categories
    const arbTwoCategories = fc.tuple(
      fc.constantFrom(...categoriesWithItems),
      fc.constantFrom(...categoriesWithItems)
    ).filter(([a, b]) => a.id !== b.id)

    fc.assert(
      fc.property(arbTwoCategories, ([catA, catB]) => {
        const { unmount } = renderSidebar()

        const itemsA = componentRegistry
          .filter((c) => c.category === catA.id)
          .map((c) => c.name)
        const itemsB = componentRegistry
          .filter((c) => c.category === catB.id)
          .map((c) => c.name)

        // Collapse catA
        const headingA = screen.getByText(catA.label)
        fireEvent.click(headingA)

        // catA items should be hidden
        for (const itemName of itemsA) {
          expect(screen.queryByRole('link', { name: itemName })).not.toBeInTheDocument()
        }

        // catB items should still be visible
        for (const itemName of itemsB) {
          expect(screen.getByRole('link', { name: itemName })).toBeInTheDocument()
        }

        unmount()
      }),
      { numRuns: 100 }
    )
  }, 30000)
})
