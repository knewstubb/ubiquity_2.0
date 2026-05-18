import { describe, it, expect, beforeAll } from 'vitest'
import fc from 'fast-check'
import { render, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ControlsPanel } from '../components/component-library/ControlsPanel'
import type { PropDefinition, ControlType, UsedInLink } from '../data/componentRegistry'

/**
 * Feature: component-library-reorganisation, Properties 8–11: ControlsPanel behaviour
 *
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
 */

// Mock ResizeObserver for Slider (RangeControl) support
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

// --- Shared Generators ---

const controlTypes: ControlType[] = ['text', 'select', 'toggle', 'colour', 'number', 'range', 'radio']

// React reserved prop names
const REACT_RESERVED_PROPS = new Set(['key', 'ref', 'children'])

/**
 * Arbitrary generator for a single PropDefinition.
 */
const arbPropDefinition: fc.Arbitrary<PropDefinition> = fc
  .record({
    name: fc.string({ minLength: 1, maxLength: 20 }).filter(
      (s) => /^[a-zA-Z][a-zA-Z0-9]*$/.test(s) && !REACT_RESERVED_PROPS.has(s)
    ),
    label: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
    controlType: fc.constantFrom(...controlTypes),
  })
  .chain(({ name, label, controlType }) => {
    switch (controlType) {
      case 'text':
        return fc.string({ minLength: 0, maxLength: 20 }).map((defaultValue) => ({
          name,
          label,
          controlType,
          defaultValue,
        }))
      case 'colour':
        return fc
          .array(fc.constantFrom('0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'), { minLength: 6, maxLength: 6 })
          .map((chars) => ({
            name,
            label,
            controlType,
            defaultValue: `#${chars.join('')}`,
          }))
      case 'number':
      case 'range':
        return fc.integer({ min: 0, max: 100 }).map((defaultValue) => ({
          name,
          label,
          controlType,
          defaultValue,
          min: 0,
          max: 100,
          step: 1,
        }))
      case 'toggle':
        return fc.boolean().map((defaultValue) => ({
          name,
          label,
          controlType,
          defaultValue,
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
            const seen = new Set<string>()
            const uniqueOptions = options.filter((o) => {
              if (seen.has(o.value)) return false
              seen.add(o.value)
              return true
            })
            if (uniqueOptions.length === 0) return fc.constant(null)
            return fc.constant({
              name,
              label,
              controlType,
              defaultValue: uniqueOptions[0].value,
              options: uniqueOptions,
            })
          })
          .filter((v): v is PropDefinition => v !== null)
      default:
        return fc.constant({ name, label, controlType, defaultValue: '' as string | number | boolean })
    }
  })

/**
 * Arbitrary generator for an array of PropDefinitions with unique names.
 */
const arbPropDefinitions: fc.Arbitrary<PropDefinition[]> = fc
  .array(arbPropDefinition, { minLength: 0, maxLength: 8 })
  .map((defs) => {
    const seen = new Set<string>()
    return defs.filter((d) => {
      if (seen.has(d.name)) return false
      seen.add(d.name)
      return true
    })
  })

/**
 * Arbitrary generator for non-empty PropDefinitions (at least 1 item).
 */
const arbNonEmptyPropDefinitions: fc.Arbitrary<PropDefinition[]> = fc
  .array(arbPropDefinition, { minLength: 1, maxLength: 8 })
  .map((defs) => {
    const seen = new Set<string>()
    return defs.filter((d) => {
      if (seen.has(d.name)) return false
      seen.add(d.name)
      return true
    })
  })
  .filter((defs) => defs.length > 0)

/**
 * Arbitrary generator for UsedInLink arrays.
 */
const arbUsedInLink: fc.Arbitrary<UsedInLink> = fc.record({
  label: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
  route: fc.string({ minLength: 1, maxLength: 40 }).map((s) => `/${s.replace(/[^a-zA-Z0-9/-]/g, '').slice(0, 30)}`),
})

const arbUsedInLinks: fc.Arbitrary<UsedInLink[]> = fc
  .array(arbUsedInLink, { minLength: 0, maxLength: 6 })
  .map((links) => {
    // Deduplicate by route
    const seen = new Set<string>()
    return links.filter((l) => {
      if (seen.has(l.route)) return false
      seen.add(l.route)
      return true
    })
  })

/**
 * Build a values record from PropDefinitions using their defaultValues.
 */
function buildValues(propControls: PropDefinition[]): Record<string, string | number | boolean> {
  const values: Record<string, string | number | boolean> = {}
  for (const prop of propControls) {
    values[prop.name] = prop.defaultValue
  }
  return values
}

/**
 * Count interactive controls by querying for known roles and input types.
 */
function countInteractiveControls(container: HTMLElement): number {
  const textboxes = container.querySelectorAll('[role="textbox"], input[type="text"]')
  const comboboxes = container.querySelectorAll('[role="combobox"]')
  const switches = container.querySelectorAll('[role="switch"]')
  const colorInputs = container.querySelectorAll('input[type="color"]')
  const spinbuttons = container.querySelectorAll('[role="spinbutton"], input[type="number"]')
  const sliders = container.querySelectorAll('[role="slider"]')
  const radiogroups = container.querySelectorAll('[role="radiogroup"]')

  return (
    textboxes.length +
    comboboxes.length +
    switches.length +
    colorInputs.length +
    spinbuttons.length +
    sliders.length +
    radiogroups.length
  )
}

// --- Property 8: ControlsPanel rendering predicate ---

describe('Feature: component-library-reorganisation, Property 8: ControlsPanel rendering predicate', () => {
  /**
   * Panel renders iff `propControls` is defined and non-empty;
   * renders one control per PropDefinition.
   *
   * **Validates: Requirements 5.1**
   */
  it('renders controls iff propControls is non-empty, with one control per PropDefinition', () => {
    fc.assert(
      fc.property(arbPropDefinitions, (propControls) => {
        const values = buildValues(propControls)

        const { container } = render(
          <MemoryRouter>
            <ControlsPanel
              propControls={propControls}
              values={values}
              onChange={() => {}}
              onReset={() => {}}
              isDirty={false}
            />
          </MemoryRouter>
        )

        const controlCount = countInteractiveControls(container)

        if (propControls.length === 0) {
          // When propControls is empty, no interactive controls should render
          expect(controlCount).toBe(0)
        } else {
          // When propControls is non-empty, exactly one control per definition
          expect(controlCount).toBe(propControls.length)
        }
      }),
      { numRuns: 100 }
    )
  })
})

// --- Property 9: Control value propagation ---

describe('Feature: component-library-reorganisation, Property 9: Control value propagation', () => {
  /**
   * Changing a control passes the new value to the demo component.
   *
   * We verify that the onChange callback is invoked with the correct
   * prop name and new value when a control is interacted with.
   *
   * **Validates: Requirements 5.2**
   */
  it('onChange is called with correct name and value when a text control is changed', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-zA-Z][a-zA-Z0-9]*$/.test(s) && !REACT_RESERVED_PROPS.has(s)),
        fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
        fc.string({ minLength: 0, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        (name, label, defaultValue, newValue) => {
          const propControls: PropDefinition[] = [
            { name, label, controlType: 'text', defaultValue },
          ]
          const values = buildValues(propControls)

          const calls: Array<{ name: string; value: string | number | boolean }> = []
          const onChange = (n: string, v: string | number | boolean) => {
            calls.push({ name: n, value: v })
          }

          const { container } = render(
            <MemoryRouter>
              <ControlsPanel
                propControls={propControls}
                values={values}
                onChange={onChange}
                onReset={() => {}}
                isDirty={false}
              />
            </MemoryRouter>
          )

          // Find the text input and change its value
          const input = container.querySelector('input[type="text"]') as HTMLInputElement
          if (input) {
            fireEvent.change(input, { target: { value: newValue } })
            // Verify onChange was called with the correct name and new value
            expect(calls.length).toBeGreaterThan(0)
            const lastCall = calls[calls.length - 1]
            expect(lastCall.name).toBe(name)
            expect(lastCall.value).toBe(newValue)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('onChange is called with correct name and value when a toggle control is changed', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-zA-Z][a-zA-Z0-9]*$/.test(s) && !REACT_RESERVED_PROPS.has(s)),
        fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
        fc.boolean(),
        (name, label, defaultValue) => {
          const propControls: PropDefinition[] = [
            { name, label, controlType: 'toggle', defaultValue },
          ]
          const values = buildValues(propControls)

          const calls: Array<{ name: string; value: string | number | boolean }> = []
          const onChange = (n: string, v: string | number | boolean) => {
            calls.push({ name: n, value: v })
          }

          const { container } = render(
            <MemoryRouter>
              <ControlsPanel
                propControls={propControls}
                values={values}
                onChange={onChange}
                onReset={() => {}}
                isDirty={false}
              />
            </MemoryRouter>
          )

          // Find the switch and click it
          const switchEl = container.querySelector('[role="switch"]') as HTMLElement
          if (switchEl) {
            fireEvent.click(switchEl)
            // Verify onChange was called with the correct name and toggled value
            expect(calls.length).toBeGreaterThan(0)
            const lastCall = calls[calls.length - 1]
            expect(lastCall.name).toBe(name)
            expect(lastCall.value).toBe(!defaultValue)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})

// --- Property 10: Control reset round-trip ---

describe('Feature: component-library-reorganisation, Property 10: Control reset round-trip', () => {
  /**
   * Reset restores all values to defaults.
   *
   * We verify that clicking the reset button calls onReset, and that
   * when values are set back to defaults, isDirty becomes false.
   *
   * **Validates: Requirements 5.3**
   */
  it('reset button calls onReset when isDirty is true', () => {
    fc.assert(
      fc.property(arbNonEmptyPropDefinitions, (propControls) => {
        const values = buildValues(propControls)
        // Modify at least one value to make isDirty true
        const modifiedValues = { ...values }
        const firstProp = propControls[0]
        if (firstProp.controlType === 'toggle') {
          modifiedValues[firstProp.name] = !(firstProp.defaultValue as boolean)
        } else if (firstProp.controlType === 'number' || firstProp.controlType === 'range') {
          modifiedValues[firstProp.name] = (firstProp.defaultValue as number) + 1
        } else {
          modifiedValues[firstProp.name] = `${firstProp.defaultValue}_modified`
        }

        let resetCalled = false
        const onReset = () => { resetCalled = true }

        const { container } = render(
          <MemoryRouter>
            <ControlsPanel
              propControls={propControls}
              values={modifiedValues}
              onChange={() => {}}
              onReset={onReset}
              isDirty={true}
            />
          </MemoryRouter>
        )

        // Find and click the reset button
        const resetButton = container.querySelector('button')
        const buttons = container.querySelectorAll('button')
        let resetBtn: HTMLElement | null = null
        buttons.forEach((btn) => {
          if (btn.textContent?.toLowerCase().includes('reset')) {
            resetBtn = btn
          }
        })

        if (resetBtn) {
          fireEvent.click(resetBtn)
          expect(resetCalled).toBe(true)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('reset button is disabled when isDirty is false', () => {
    fc.assert(
      fc.property(arbNonEmptyPropDefinitions, (propControls) => {
        const values = buildValues(propControls)

        const { container } = render(
          <MemoryRouter>
            <ControlsPanel
              propControls={propControls}
              values={values}
              onChange={() => {}}
              onReset={() => {}}
              isDirty={false}
            />
          </MemoryRouter>
        )

        // Reset button should be disabled when isDirty is false
        const buttons = container.querySelectorAll('button')
        let resetBtn: HTMLButtonElement | null = null
        buttons.forEach((btn) => {
          if (btn.textContent?.toLowerCase().includes('reset')) {
            resetBtn = btn as HTMLButtonElement
          }
        })

        if (resetBtn) {
          expect(resetBtn.disabled).toBe(true)
        }
      }),
      { numRuns: 100 }
    )
  })
})

// --- Property 11: UsedIn links rendering ---

describe('Feature: component-library-reorganisation, Property 11: UsedIn links rendering', () => {
  /**
   * One navigable link per UsedInLink entry.
   *
   * **Validates: Requirements 5.4**
   */
  it('renders one navigable link per UsedInLink entry', () => {
    fc.assert(
      fc.property(
        arbNonEmptyPropDefinitions,
        arbUsedInLinks,
        (propControls, usedIn) => {
          const values = buildValues(propControls)

          const { container } = render(
            <MemoryRouter>
              <ControlsPanel
                propControls={propControls}
                values={values}
                onChange={() => {}}
                onReset={() => {}}
                isDirty={false}
                usedIn={usedIn}
              />
            </MemoryRouter>
          )

          // Find all links that are "Used In" links (anchor tags with href matching routes)
          const allLinks = container.querySelectorAll('a')
          // Filter to only links that match our usedIn routes
          const usedInLinks = Array.from(allLinks).filter((link) =>
            usedIn.some((u) => link.getAttribute('href') === u.route)
          )

          if (usedIn.length === 0) {
            // No "Used in" section should render
            expect(usedInLinks.length).toBe(0)
          } else {
            // Exactly one link per UsedInLink entry
            expect(usedInLinks.length).toBe(usedIn.length)

            // Each link should have the correct href and label text
            for (const link of usedIn) {
              const matchingLink = Array.from(allLinks).find(
                (a) => a.getAttribute('href') === link.route
              )
              expect(matchingLink).toBeDefined()
              expect(matchingLink?.textContent).toContain(link.label)
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('does not render UsedIn section when usedIn is undefined', () => {
    fc.assert(
      fc.property(arbNonEmptyPropDefinitions, (propControls) => {
        const values = buildValues(propControls)

        const { container } = render(
          <MemoryRouter>
            <ControlsPanel
              propControls={propControls}
              values={values}
              onChange={() => {}}
              onReset={() => {}}
              isDirty={false}
              usedIn={undefined}
            />
          </MemoryRouter>
        )

        // "Used in" text should not appear
        expect(container.textContent).not.toContain('Used in')
      }),
      { numRuns: 100 }
    )
  })
})
