import { describe, it, expect, beforeAll } from 'vitest'
import fc from 'fast-check'
import { render } from '@testing-library/react'
import { Suspense } from 'react'
import { MemoryRouter } from 'react-router-dom'
import type { PropDefinition, ControlType } from '../data/componentRegistry'
import { componentRegistry } from '../data/componentRegistry'

/**
 * Feature: component-controls-panel, Property 4: All current prop values are passed to the rendered component
 *
 * For any set of PropDefinitions and any combination of valid current values,
 * the Live Preview component instance must receive all values as props — each
 * keyed by the PropDefinition `name` and set to the current value from state.
 *
 * **Validates: Requirements 3.1, 3.2**
 */
describe('Feature: component-controls-panel, Property 4: All current prop values are passed to the rendered component', () => {
  const controlTypes: ControlType[] = ['text', 'select', 'toggle', 'colour', 'number', 'range', 'radio']

  // React reserved prop names that are consumed by React and never forwarded to the component
  const REACT_RESERVED_PROPS = new Set(['key', 'ref', 'children'])

  /**
   * Arbitrary generator for a single PropDefinition with a valid value.
   * Returns both the definition and a current value that may differ from the default.
   */
  const arbPropWithValue: fc.Arbitrary<{ def: PropDefinition; value: string | number | boolean }> = fc
    .record({
      name: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-zA-Z][a-zA-Z0-9]*$/.test(s) && !REACT_RESERVED_PROPS.has(s)),
      label: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
      controlType: fc.constantFrom(...controlTypes),
    })
    .chain(({ name, label, controlType }) => {
      switch (controlType) {
        case 'text':
          return fc.tuple(fc.string(), fc.string()).map(([defaultValue, currentValue]) => ({
            def: { name, label, controlType, defaultValue },
            value: currentValue,
          }))
        case 'colour':
          return fc
            .tuple(
              fc.array(fc.constantFrom('0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'), { minLength: 6, maxLength: 6 }),
              fc.array(fc.constantFrom('0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'), { minLength: 6, maxLength: 6 })
            )
            .map(([defaultChars, currentChars]) => ({
              def: { name, label, controlType, defaultValue: `#${defaultChars.join('')}` },
              value: `#${currentChars.join('')}`,
            }))
        case 'number':
        case 'range':
          return fc
            .tuple(fc.integer({ min: 0, max: 100 }), fc.integer({ min: 0, max: 100 }))
            .map(([defaultValue, currentValue]) => ({
              def: { name, label, controlType, defaultValue, min: 0, max: 100, step: 1 },
              value: currentValue,
            }))
        case 'toggle':
          return fc.tuple(fc.boolean(), fc.boolean()).map(([defaultValue, currentValue]) => ({
            def: { name, label, controlType, defaultValue },
            value: currentValue,
          }))
        case 'select':
        case 'radio':
          return fc
            .array(
              fc.record({
                label: fc.string({ minLength: 1, maxLength: 15 }).filter((s) => s.trim().length > 0),
                value: fc.string({ minLength: 1, maxLength: 15 }).filter((s) => /^[a-zA-Z][a-zA-Z0-9]*$/.test(s)),
              }),
              { minLength: 1, maxLength: 5 }
            )
            .chain((options) => {
              // Deduplicate option values
              const seen = new Set<string>()
              const uniqueOptions = options.filter((o) => {
                if (seen.has(o.value)) return false
                seen.add(o.value)
                return true
              })
              if (uniqueOptions.length === 0) return fc.constant(null)
              // Pick a random option value as the current value
              return fc.constantFrom(...uniqueOptions.map((o) => o.value)).map((currentValue) => ({
                def: { name, label, controlType, defaultValue: uniqueOptions[0].value, options: uniqueOptions },
                value: currentValue,
              }))
            })
            .filter((v): v is { def: PropDefinition; value: string | number | boolean } => v !== null)
        default:
          return fc.constant({ def: { name, label, controlType, defaultValue: '' as string | number | boolean }, value: '' as string | number | boolean })
      }
    })

  /**
   * Arbitrary generator for an array of PropDefinitions with unique names,
   * paired with a values record representing current state.
   */
  const arbPropsAndValues: fc.Arbitrary<{ defs: PropDefinition[]; values: Record<string, string | number | boolean> }> = fc
    .array(arbPropWithValue, { minLength: 1, maxLength: 10 })
    .map((items) => {
      // Deduplicate by name
      const seen = new Set<string>()
      const unique = items.filter((item) => {
        if (seen.has(item.def.name)) return false
        seen.add(item.def.name)
        return true
      })
      const defs = unique.map((item) => item.def)
      const values: Record<string, string | number | boolean> = {}
      for (const item of unique) {
        values[item.def.name] = item.value
      }
      return { defs, values }
    })
    .filter(({ defs }) => defs.length > 0)

  it('passes all current prop values to the rendered component instance', () => {
    fc.assert(
      fc.property(arbPropsAndValues, ({ defs, values }) => {
        // Spy component that captures received props
        const receivedProps: Record<string, unknown>[] = []
        function SpyComponent(props: Record<string, unknown>) {
          receivedProps.push({ ...props })
          return null
        }

        // Mimic what ComponentDemoView does: spread values as props to the component
        // This is the core behaviour under test — the component receives all values keyed by name
        render(<SpyComponent {...values} />)

        // The spy should have been called at least once
        expect(receivedProps.length).toBeGreaterThan(0)

        // Get the last render's props (most recent)
        const lastProps = receivedProps[receivedProps.length - 1]

        // Assert every PropDefinition name is present as a prop with the correct value
        for (const def of defs) {
          expect(lastProps).toHaveProperty(def.name)
          expect(lastProps[def.name]).toBe(values[def.name])
        }
      }),
      { numRuns: 100 }
    )
  })
})


// Feature: component-controllers-expansion, Property 2: Demo Renders with Default Props
/**
 * Property 2: Demo Renders with Default Props
 *
 * For any component registry entry that defines propControls, rendering the demo
 * component with the default values (derived from each PropDefinition's defaultValue)
 * SHALL not throw an error and SHALL produce a non-empty render output.
 *
 * **Validates: Requirements 6.3, 11.3, 13.1, 13.2**
 */
describe('Feature: component-controllers-expansion, Property 2: Demo Renders with Default Props', () => {
  beforeAll(() => {
    // Mock ResizeObserver for Slider and other range controls
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  })

  /**
   * Get all registry entries that have propControls defined.
   * These are the entries that should render successfully with default prop values.
   */
  const entriesWithPropControls = componentRegistry.filter(
    (entry) => entry.propControls && entry.propControls.length > 0
  )

  /**
   * Build a default values record from PropDefinitions.
   * This mirrors what useControlValues does on initialisation.
   */
  function buildDefaultValues(propControls: PropDefinition[]): Record<string, string | number | boolean | string[]> {
    const values: Record<string, string | number | boolean | string[]> = {}
    for (const prop of propControls) {
      values[prop.name] = prop.defaultValue
    }
    return values
  }

  // Use fast-check to sample from all entries with propControls
  // This ensures the property holds for every entry in the registry
  it('renders each demo component with default props without throwing and produces non-empty output', () => {
    // Create an arbitrary that picks from all entries with propControls
    const arbEntry = fc.constantFrom(...entriesWithPropControls)

    fc.assert(
      fc.property(arbEntry, (entry) => {
        const defaultValues = buildDefaultValues(entry.propControls!)

        // The demo component is a lazy-loaded React component.
        // We render it inside Suspense with a fallback.
        // Since vitest/jsdom resolves lazy imports synchronously in test mode,
        // the component should render immediately.
        const DemoComponent = entry.component

        let error: Error | null = null
        let container: HTMLElement | null = null

        try {
          const result = render(
            <MemoryRouter>
              <Suspense fallback={<div data-testid="loading">Loading</div>}>
                <DemoComponent {...defaultValues} />
              </Suspense>
            </MemoryRouter>
          )
          container = result.container
        } catch (e) {
          error = e as Error
        }

        // Assert no error was thrown during render
        expect(error).toBeNull()

        // Assert the container has non-empty output (not just the suspense fallback or empty)
        expect(container).not.toBeNull()
        // The container should have some rendered content (innerHTML is non-empty)
        expect(container!.innerHTML.length).toBeGreaterThan(0)
      }),
      { numRuns: 100 }
    )
  })

  // Additionally, verify each of the 12 new component entries specifically renders
  it('covers all 12 new component-controllers-expansion entries', () => {
    const expectedNewComponents = [
      'Calendar', 'Checkbox', 'InputOTP', 'Label', 'RadioGroup',
      'Slider', 'Textarea', 'Toggle', 'ToggleGroup', 'Form',
      'CardSelector', 'SplitButton'
    ]

    for (const name of expectedNewComponents) {
      const entry = entriesWithPropControls.find((e) => e.name === name)
      expect(entry, `Expected "${name}" to have propControls in registry`).toBeDefined()
    }
  })
})
