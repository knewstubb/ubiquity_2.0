import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { renderHook } from '@testing-library/react'
import { useControlValues } from '../lib/useControlValues'
import type { PropDefinition, ControlType } from '../data/componentRegistry'

/**
 * Feature: component-controls-panel, Property 5: Initial state matches defaults
 *
 * For any array of PropDefinitions, when the `useControlValues` hook initialises,
 * the resulting `values` record must map each `PropDefinition.name` to its
 * corresponding `defaultValue`.
 *
 * **Validates: Requirements 3.3**
 */
describe('Feature: component-controls-panel, Property 5: Initial state matches defaults', () => {
  const controlTypes: ControlType[] = ['text', 'select', 'toggle', 'colour', 'number', 'range', 'radio']

  /**
   * Arbitrary generator for a single PropDefinition.
   * Generates valid definitions with appropriate defaultValues and options
   * based on the controlType.
   */
  // Names that collide with Object.prototype and are not valid prop identifiers
  const reservedNames = new Set(['__proto__', 'constructor', 'toString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__'])

  const arbPropDefinition: fc.Arbitrary<PropDefinition> = fc
    .record({
      name: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0 && !reservedNames.has(s)),
      label: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
      controlType: fc.constantFrom(...controlTypes),
    })
    .chain(({ name, label, controlType }) => {
      // Generate appropriate defaultValue and options based on controlType
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

  /**
   * Arbitrary generator for an array of PropDefinitions with unique names.
   * Ensures no duplicate names which would cause key collisions in the values record.
   */
  const arbPropDefinitions: fc.Arbitrary<PropDefinition[]> = fc
    .array(arbPropDefinition, { minLength: 0, maxLength: 10 })
    .map((defs) => {
      // Deduplicate by name to avoid key collisions
      const seen = new Set<string>()
      return defs.filter((d) => {
        if (seen.has(d.name)) return false
        seen.add(d.name)
        return true
      })
    })

  it('initialises values mapping each name to its defaultValue for any PropDefinitions array', () => {
    fc.assert(
      fc.property(arbPropDefinitions, (propControls) => {
        const { result } = renderHook(() => useControlValues(propControls))

        // The values record should have an entry for each PropDefinition
        for (const prop of propControls) {
          expect(
            result.current.values[prop.name],
            `Expected values["${prop.name}"] to equal defaultValue ${JSON.stringify(prop.defaultValue)}`
          ).toStrictEqual(prop.defaultValue)
        }

        // The values record should have exactly the same number of keys as propControls
        expect(Object.keys(result.current.values).length).toBe(propControls.length)
      }),
      { numRuns: 100 }
    )
  })

  it('initialises with an empty values record when given an empty array', () => {
    const { result } = renderHook(() => useControlValues([]))
    expect(result.current.values).toStrictEqual({})
    expect(Object.keys(result.current.values).length).toBe(0)
  })
})
