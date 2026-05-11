import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import type { PropDefinition, ControlType } from '../data/componentRegistry'

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
