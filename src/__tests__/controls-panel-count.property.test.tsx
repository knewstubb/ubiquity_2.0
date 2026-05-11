import { describe, it, expect, beforeAll } from 'vitest'
import fc from 'fast-check'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ControlsPanel } from '../components/component-library/ControlsPanel'
import type { PropDefinition, ControlType } from '../data/componentRegistry'

/**
 * Feature: component-controls-panel, Property 3: Control count matches definitions
 *
 * For any array of PropDefinitions passed to the ControlsPanel, the number of
 * rendered interactive controls must equal the length of the array.
 *
 * **Validates: Requirements 2.2**
 */
describe('Feature: component-controls-panel, Property 3: Control count matches definitions', () => {
  // Mock ResizeObserver for Slider (RangeControl) support
  beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  })

  const controlTypes: ControlType[] = ['text', 'select', 'toggle', 'colour', 'number', 'range', 'radio']

  /**
   * Arbitrary generator for a single PropDefinition.
   * Generates valid definitions with appropriate defaultValues and options
   * based on the controlType.
   */
  const arbPropDefinition: fc.Arbitrary<PropDefinition> = fc
    .record({
      name: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-zA-Z][a-zA-Z0-9]*$/.test(s)),
      label: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
      controlType: fc.constantFrom(...controlTypes),
    })
    .chain(({ name, label, controlType }) => {
      switch (controlType) {
        case 'text':
          return fc.string().map((defaultValue) => ({
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
              // Deduplicate option values
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
   * Ensures no duplicate names which would cause key collisions.
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
   * Each control type renders exactly one primary interactive element:
   * - text → textbox role
   * - select → combobox role (SelectTrigger)
   * - toggle → switch role
   * - colour → input[type="color"]
   * - number → spinbutton role
   * - range → slider role
   * - radio → radiogroup role
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

  it('renders exactly one interactive control per PropDefinition for any array', () => {
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

        expect(controlCount).toBe(
          propControls.length
        )
      }),
      { numRuns: 100 }
    )
  })
})
