import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

/**
 * Unit tests for ComponentDemoView integration.
 *
 * Validates:
 * - Requirement 2.10: Component without propControls renders no panel
 * - Requirement 6.2: "View in context" links render when usedIn is provided
 * - Requirement 6.4: "View in context" section omitted when usedIn is absent
 */

// Mock the componentRegistry to control entries for each test
vi.mock('../data/componentRegistry', () => ({
  componentRegistry: [
    {
      name: 'NoPropComponent',
      slug: 'no-prop',
      category: 'display',
      description: 'A component with no prop controls.',
      component: (() => {
        const Comp = () => <div data-testid="no-prop-demo">No Prop Demo</div>
        Comp.displayName = 'NoPropComponent'
        return Comp
      })(),
    },
    {
      name: 'WithPropComponent',
      slug: 'with-prop',
      category: 'display',
      description: 'A component with prop controls.',
      component: (() => {
        const Comp = (props: Record<string, unknown>) => {
          const hasProps = Object.keys(props).length > 0
          return hasProps
            ? <div data-testid="with-prop-preview">{JSON.stringify(props)}</div>
            : <div data-testid="with-prop-demo">Showcase</div>
        }
        Comp.displayName = 'WithPropComponent'
        return Comp
      })(),
      propControls: [
        {
          name: 'label',
          label: 'Label',
          controlType: 'text',
          defaultValue: 'Hello',
        },
        {
          name: 'size',
          label: 'Size',
          controlType: 'select',
          defaultValue: 'md',
          options: [
            { label: 'Small', value: 'sm' },
            { label: 'Medium', value: 'md' },
            { label: 'Large', value: 'lg' },
          ],
        },
      ],
    },
    {
      name: 'WithUsedInComponent',
      slug: 'with-used-in',
      category: 'display',
      description: 'A component with usedIn links.',
      component: (() => {
        const Comp = (props: Record<string, unknown>) => {
          const hasProps = Object.keys(props).length > 0
          return hasProps
            ? <div data-testid="with-used-in-preview">{JSON.stringify(props)}</div>
            : <div data-testid="with-used-in-demo">Showcase</div>
        }
        Comp.displayName = 'WithUsedInComponent'
        return Comp
      })(),
      propControls: [
        {
          name: 'variant',
          label: 'Variant',
          controlType: 'text',
          defaultValue: 'primary',
        },
      ],
      usedIn: [
        { label: 'Dashboard', route: '/dashboard' },
        { label: 'Settings Page', route: '/settings' },
      ],
    },
    {
      name: 'WithPropNoUsedIn',
      slug: 'with-prop-no-used-in',
      category: 'display',
      description: 'A component with prop controls but no usedIn.',
      component: (() => {
        const Comp = (props: Record<string, unknown>) => {
          const hasProps = Object.keys(props).length > 0
          return hasProps
            ? <div data-testid="prop-no-used-in-preview">{JSON.stringify(props)}</div>
            : <div data-testid="prop-no-used-in-demo">Showcase</div>
        }
        Comp.displayName = 'WithPropNoUsedIn'
        return Comp
      })(),
      propControls: [
        {
          name: 'disabled',
          label: 'Disabled',
          controlType: 'toggle',
          defaultValue: false,
        },
      ],
    },
  ],
}))

// Import after mock so the mock is applied
import { ComponentDemoView } from '../pages/ComponentLibraryPage'

/**
 * Helper to render ComponentDemoView with route params.
 */
function renderWithRoute(category: string, slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/admin/components/${category}/${slug}`]}>
      <Routes>
        <Route
          path="/admin/components/:category/:slug"
          element={<ComponentDemoView />}
        />
      </Routes>
    </MemoryRouter>
  )
}

describe('ComponentDemoView integration', () => {
  beforeAll(() => {
    // Mock ResizeObserver for any range/slider controls
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  })

  describe('Requirement 2.10: No panel when propControls absent', () => {
    it('renders no ControlsPanel when component has no propControls', () => {
      renderWithRoute('display', 'no-prop')

      // The demo should render
      expect(screen.getByTestId('no-prop-demo')).toBeInTheDocument()

      // No "Controls" heading should be present
      expect(screen.queryByText('Controls')).not.toBeInTheDocument()

      // No Reset button should be present
      expect(screen.queryByRole('button', { name: /reset/i })).not.toBeInTheDocument()
    })
  })

  describe('Requirement 2.10: Panel renders when propControls present', () => {
    it('renders ControlsPanel when component has propControls', () => {
      renderWithRoute('display', 'with-prop')

      // The demo should render
      expect(screen.getByTestId('with-prop-demo')).toBeInTheDocument()

      // "Controls" heading should be present (from ControlsPanel)
      expect(screen.getByText('Controls')).toBeInTheDocument()
    })
  })

  describe('Requirement 6.2: View in context links render when usedIn provided', () => {
    it('renders "View in context" section with links when usedIn is provided', () => {
      renderWithRoute('display', 'with-used-in')

      // The demo should render
      expect(screen.getByTestId('with-used-in-demo')).toBeInTheDocument()

      // "Used in:" label should be present
      expect(screen.getByText('Used in:')).toBeInTheDocument()

      // Links should render with correct labels
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Settings Page')).toBeInTheDocument()

      // Links should have correct href attributes
      const dashboardLink = screen.getByText('Dashboard').closest('a')
      expect(dashboardLink).toHaveAttribute('href', '/dashboard')

      const settingsLink = screen.getByText('Settings Page').closest('a')
      expect(settingsLink).toHaveAttribute('href', '/settings')
    })
  })

  describe('Requirement 6.4: View in context omitted when usedIn absent', () => {
    it('does not render "View in context" section when usedIn is absent', () => {
      renderWithRoute('display', 'with-prop-no-used-in')

      // The demo should render
      expect(screen.getByTestId('prop-no-used-in-demo')).toBeInTheDocument()

      // Controls panel should be present (has propControls)
      expect(screen.getByText('Controls')).toBeInTheDocument()

      // "Used in:" label should NOT be present
      expect(screen.queryByText('Used in:')).not.toBeInTheDocument()
    })
  })
})
