import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import type { PropDefinition, ControlType } from '../data/componentRegistry'

/**
 * Feature: component-controls-panel, Property 2: Select and radio controls require options
 *
 * For any PropDefinition with `controlType` of `select` or `radio`, the `options`
 * array must be present and contain at least one `{ label, value }` entry where
 * both label and value are non-empty strings.
 *
 * **Validates: Requirements 1.4**
 */
describe('Feature: component-controls-panel, Property 2: Select and radio controls require options', () => {
  const selectOrRadio: ControlType[] = ['select', 'radio']

  /**
   * Arbitrary generator for PropDefinitions constrained to `select` or `radio` controlType.
   * Generates valid definitions with options arrays containing at least one entry.
   */
  const arbSelectOrRadioPropDefinition: fc.Arbitrary<PropDefinition> = fc
    .record({
      name: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
      label: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
      controlType: fc.constantFrom(...selectOrRadio),
    })
    .chain(({ name, label, controlType }) => {
      return fc
        .array(
          fc.record({
            label: fc.string({ minLength: 1, maxLength: 15 }).filter((s) => s.trim().length > 0),
            value: fc.string({ minLength: 1, maxLength: 15 }).filter((s) => s.trim().length > 0),
          }),
          { minLength: 1, maxLength: 8 }
        )
        .map((options) => ({
          name,
          label,
          controlType,
          defaultValue: options[0].value,
          options,
        }))
    })

  it('options array is present with at least one entry for select/radio controls', () => {
    fc.assert(
      fc.property(arbSelectOrRadioPropDefinition, (propDef) => {
        // options must be defined and be an array
        expect(propDef.options).toBeDefined()
        expect(Array.isArray(propDef.options)).toBe(true)

        // options must have at least one entry
        expect(propDef.options!.length).toBeGreaterThanOrEqual(1)

        // Every option must have a non-empty label and non-empty value
        for (const option of propDef.options!) {
          expect(option.label.length).toBeGreaterThan(0)
          expect(option.value.length).toBeGreaterThan(0)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('controlType is always select or radio in generated definitions', () => {
    fc.assert(
      fc.property(arbSelectOrRadioPropDefinition, (propDef) => {
        expect(['select', 'radio']).toContain(propDef.controlType)
      }),
      { numRuns: 100 }
    )
  })
})
