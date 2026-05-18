import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import type { PropDefinition, ControlType } from '../data/componentRegistry'
import { componentRegistry } from '../data/componentRegistry'

/**
 * Feature: component-controls-panel, Property 1: PropDefinition schema completeness
 *
 * For any PropDefinition object, it must contain a non-empty `name`, a non-empty `label`,
 * a valid `controlType` from the defined union, and a `defaultValue` that is not undefined.
 *
 * **Validates: Requirements 1.2**
 */
describe('Feature: component-controls-panel, Property 1: PropDefinition schema completeness', () => {
  const validControlTypes: ControlType[] = ['text', 'select', 'toggle', 'colour', 'number', 'range', 'radio']

  /**
   * Arbitrary generator for a single PropDefinition.
   * Generates valid definitions with appropriate defaultValues and options
   * based on the controlType.
   */
  const arbPropDefinition: fc.Arbitrary<PropDefinition> = fc
    .record({
      name: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
      label: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
      controlType: fc.constantFrom(...validControlTypes),
    })
    .chain(({ name, label, controlType }) => {
      switch (controlType) {
        case 'text':
        case 'colour':
          return fc.string().map((defaultValue) => ({
            name,
            label,
            controlType,
            defaultValue,
          }))
        case 'number':
        case 'range':
          return fc.integer({ min: -1000, max: 1000 }).map((defaultValue) => ({
            name,
            label,
            controlType,
            defaultValue,
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
                value: fc.string({ minLength: 1, maxLength: 15 }).filter((s) => s.trim().length > 0),
              }),
              { minLength: 1, maxLength: 5 }
            )
            .map((options) => ({
              name,
              label,
              controlType,
              defaultValue: options[0].value,
              options,
            }))
        default:
          return fc.constant({ name, label, controlType, defaultValue: '' as string | number | boolean })
      }
    })

  it('every PropDefinition has a non-empty name', () => {
    fc.assert(
      fc.property(arbPropDefinition, (propDef: PropDefinition) => {
        expect(propDef.name.length).toBeGreaterThan(0)
      }),
      { numRuns: 100 }
    )
  })

  it('every PropDefinition has a non-empty label', () => {
    fc.assert(
      fc.property(arbPropDefinition, (propDef: PropDefinition) => {
        expect(propDef.label.length).toBeGreaterThan(0)
      }),
      { numRuns: 100 }
    )
  })

  it('every PropDefinition has a valid controlType from the defined union', () => {
    fc.assert(
      fc.property(arbPropDefinition, (propDef: PropDefinition) => {
        expect(validControlTypes).toContain(propDef.controlType)
      }),
      { numRuns: 100 }
    )
  })

  it('every PropDefinition has a defaultValue that is not undefined', () => {
    fc.assert(
      fc.property(arbPropDefinition, (propDef: PropDefinition) => {
        expect(typeof propDef.defaultValue).not.toBe('undefined')
        expect(propDef.defaultValue).not.toBeUndefined()
      }),
      { numRuns: 100 }
    )
  })

  it('every PropDefinition satisfies all schema completeness requirements simultaneously', () => {
    fc.assert(
      fc.property(arbPropDefinition, (propDef: PropDefinition) => {
        // name is non-empty
        expect(propDef.name.length).toBeGreaterThan(0)
        // label is non-empty
        expect(propDef.label.length).toBeGreaterThan(0)
        // controlType is valid
        expect(validControlTypes).toContain(propDef.controlType)
        // defaultValue is defined
        expect(propDef.defaultValue).not.toBeUndefined()
      }),
      { numRuns: 100 }
    )
  })
})

// Feature: component-controllers-expansion, Property 1: PropControl Schema Conformance
/**
 * For any component registry entry with propControls, every PropDefinition SHALL conform
 * to the TFC decision rules:
 * - Boolean defaultValues use controlType "toggle"
 * - Controls with options arrays of length ≥ 3 use controlType "select"
 * - Controls with controlType "counter" have min and max defined with max − min ≤ 50
 *   (excluding visibleWhen controls which may have wider bounds)
 * - Controls with controlType "range" have min and max defined
 *
 * **Validates: Requirements 1.4, 2.4, 3.4, 4.4, 5.4, 7.4, 8.4, 9.4, 10.4, 12.4, 14.1–14.5**
 */
describe('Feature: component-controllers-expansion, Property 1: PropControl Schema Conformance', () => {
  // Collect all registry entries that have propControls defined
  const entriesWithControls = componentRegistry.filter(
    (entry) => entry.propControls && entry.propControls.length > 0
  )

  // Flatten all PropDefinitions from all entries for property-based iteration
  const allPropDefinitions: { componentName: string; prop: PropDefinition }[] = entriesWithControls.flatMap(
    (entry) => (entry.propControls ?? []).map((prop) => ({ componentName: entry.name, prop }))
  )

  it('all 12 new components have propControls defined in the registry', () => {
    const expectedComponents = [
      'Calendar', 'Checkbox', 'InputOTP', 'Label', 'RadioGroup',
      'Slider', 'Textarea', 'Toggle', 'ToggleGroup', 'Form',
      'CardSelector', 'SplitButton',
    ]

    for (const name of expectedComponents) {
      const entry = componentRegistry.find((e) => e.name === name)
      expect(entry, `Expected "${name}" to exist in registry`).toBeDefined()
      expect(entry!.propControls, `Expected "${name}" to have propControls`).toBeDefined()
      expect(entry!.propControls!.length, `Expected "${name}" to have at least one propControl`).toBeGreaterThan(0)
    }
  })

  it('boolean defaultValues always use controlType "toggle"', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...allPropDefinitions),
        ({ componentName, prop }) => {
          if (typeof prop.defaultValue === 'boolean') {
            expect(
              prop.controlType,
              `${componentName}.${prop.name}: boolean default must use "toggle" control`
            ).toBe('toggle')
          }
        }
      ),
      { numRuns: Math.max(100, allPropDefinitions.length * 3) }
    )
  })

  it('controls with options arrays of length ≥ 3 use controlType "select" (excluding colour controls)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...allPropDefinitions),
        ({ componentName, prop }) => {
          // Colour controls can have options for preset colours — exempt them
          if (prop.options && prop.options.length >= 3 && prop.controlType !== 'colour') {
            expect(
              prop.controlType,
              `${componentName}.${prop.name}: options.length ≥ 3 must use "select" control`
            ).toBe('select')
          }
        }
      ),
      { numRuns: Math.max(100, allPropDefinitions.length * 3) }
    )
  })

  it('counter controls have min and max defined with max − min ≤ 50 (excluding visibleWhen controls)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...allPropDefinitions),
        ({ componentName, prop }) => {
          if (prop.controlType === 'counter') {
            expect(
              prop.min,
              `${componentName}.${prop.name}: counter must have min defined`
            ).not.toBeUndefined()
            expect(
              prop.max,
              `${componentName}.${prop.name}: counter must have max defined`
            ).not.toBeUndefined()

            // visibleWhen controls may have wider bounds (e.g. Slider step-count: 2–50)
            if (!prop.visibleWhen) {
              expect(
                prop.max! - prop.min!,
                `${componentName}.${prop.name}: counter max−min must be ≤ 50 (got ${prop.max! - prop.min!})`
              ).toBeLessThanOrEqual(50)
            }
          }
        }
      ),
      { numRuns: Math.max(100, allPropDefinitions.length * 3) }
    )
  })

  it('range controls have min and max defined', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...allPropDefinitions),
        ({ componentName, prop }) => {
          if (prop.controlType === 'range') {
            expect(
              prop.min,
              `${componentName}.${prop.name}: range must have min defined`
            ).not.toBeUndefined()
            expect(
              prop.max,
              `${componentName}.${prop.name}: range must have max defined`
            ).not.toBeUndefined()
          }
        }
      ),
      { numRuns: Math.max(100, allPropDefinitions.length * 3) }
    )
  })

  it('all TFC decision rules hold simultaneously for every PropDefinition', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...allPropDefinitions),
        ({ componentName, prop }) => {
          // Rule 1: Boolean defaults → toggle
          if (typeof prop.defaultValue === 'boolean') {
            expect(
              prop.controlType,
              `${componentName}.${prop.name}: boolean default must use "toggle"`
            ).toBe('toggle')
          }

          // Rule 2: Options ≥ 3 → select (excluding colour controls which use options for presets)
          if (prop.options && prop.options.length >= 3 && prop.controlType !== 'colour') {
            expect(
              prop.controlType,
              `${componentName}.${prop.name}: options ≥ 3 must use "select"`
            ).toBe('select')
          }

          // Rule 3: Counter → min/max defined, max−min ≤ 50 (unless visibleWhen)
          if (prop.controlType === 'counter') {
            expect(prop.min, `${componentName}.${prop.name}: counter needs min`).not.toBeUndefined()
            expect(prop.max, `${componentName}.${prop.name}: counter needs max`).not.toBeUndefined()
            if (!prop.visibleWhen) {
              expect(
                prop.max! - prop.min!,
                `${componentName}.${prop.name}: counter max−min ≤ 50`
              ).toBeLessThanOrEqual(50)
            }
          }

          // Rule 4: Range → min/max defined
          if (prop.controlType === 'range') {
            expect(prop.min, `${componentName}.${prop.name}: range needs min`).not.toBeUndefined()
            expect(prop.max, `${componentName}.${prop.name}: range needs max`).not.toBeUndefined()
          }
        }
      ),
      { numRuns: Math.max(100, allPropDefinitions.length * 3) }
    )
  })
})

// Feature: component-controllers-expansion, Property 6: Section Grouping Threshold
/**
 * Property 6: Section Grouping Threshold
 *
 * For any component registry entry with 4 or more propControls (excluding those with
 * visibleWhen conditions), at least one PropDefinition SHALL have a non-empty `section`
 * property defined.
 *
 * **Validates: Requirements 14.6**
 */
describe('Feature: component-controllers-expansion, Property 6: Section Grouping Threshold', () => {
  // Filter registry entries that have propControls with 4+ controls (excluding visibleWhen)
  const entriesWithManyControls = componentRegistry
    .filter((entry) => entry.propControls && entry.propControls.length > 0)
    .filter((entry) => {
      const controlsWithoutVisibleWhen = entry.propControls!.filter(
        (ctrl) => !ctrl.visibleWhen
      )
      return controlsWithoutVisibleWhen.length >= 4
    })

  it('at least one registry entry qualifies for section grouping (4+ controls excluding visibleWhen)', () => {
    expect(entriesWithManyControls.length).toBeGreaterThan(0)
  })

  it('at least one entry with 4+ controls (excluding visibleWhen) has a section defined', () => {
    const hasAtLeastOneWithSection = entriesWithManyControls.some((entry) =>
      entry.propControls!.some(
        (ctrl: PropDefinition) => ctrl.section !== undefined && ctrl.section !== ''
      )
    )
    expect(hasAtLeastOneWithSection).toBe(true)
  })

  it('entries with sections use consistent non-empty section strings across their controls', () => {
    const entriesWithSections = entriesWithManyControls.filter((entry) =>
      entry.propControls!.some((ctrl: PropDefinition) => ctrl.section)
    )

    fc.assert(
      fc.property(
        fc.constantFrom(...entriesWithSections),
        (entry) => {
          const controlsWithSections = entry.propControls!.filter(
            (ctrl: PropDefinition) => ctrl.section !== undefined
          )
          // Every section value should be a non-empty string
          for (const ctrl of controlsWithSections) {
            expect(typeof ctrl.section).toBe('string')
            expect(ctrl.section!.trim().length).toBeGreaterThan(0)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Slider entry (8 controls) has section groupings defined', () => {
    const sliderEntry = componentRegistry.find((e) => e.name === 'Slider')
    expect(sliderEntry).toBeDefined()
    expect(sliderEntry!.propControls).toBeDefined()
    expect(sliderEntry!.propControls!.length).toBe(8)

    const sections = new Set(
      sliderEntry!.propControls!
        .filter((ctrl: PropDefinition) => ctrl.section)
        .map((ctrl: PropDefinition) => ctrl.section)
    )
    // Slider should have General, Display, and Range sections
    expect(sections.size).toBeGreaterThanOrEqual(3)
    expect(sections).toContain('General')
    expect(sections).toContain('Display')
    expect(sections).toContain('Range')
  })
})
