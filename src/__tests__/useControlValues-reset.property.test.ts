import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { renderHook, act } from '@testing-library/react'
import { useControlValues } from '../lib/useControlValues'
import type { PropDefinition, ControlType } from '../data/componentRegistry'

/**
 * Feature: component-controls-panel, Property 6: Reset restores all values to defaults
 *
 * For any set of PropDefinitions and any modified state (where at least one value
 * differs from its default), calling `resetAll` must produce a state where every
 * value equals its corresponding `defaultValue`.
 *
 * **Validates: Requirements 4.2**
 */

// --- Arbitraries ---

const HEX_CHARS = '0123456789abcdef'

/** Generate a 6-character hex colour string prefixed with # */
const arbHexColour: fc.Arbitrary<string> = fc
  .array(fc.constantFrom(...HEX_CHARS.split('')), { minLength: 6, maxLength: 6 })
  .map((chars) => `#${chars.join('')}`)

const arbControlType: fc.Arbitrary<ControlType> = fc.constantFrom(
  'text',
  'select',
  'toggle',
  'colour',
  'number',
  'range',
  'radio'
)

/**
 * Generate a valid PropDefinition with a defaultValue matching the controlType.
 * Uses a unique name suffix to avoid duplicate keys.
 */
function arbPropDefinition(index: number): fc.Arbitrary<PropDefinition> {
  return arbControlType.chain((controlType) => {
    const name = `prop_${index}`
    const label = `Prop ${index}`

    switch (controlType) {
      case 'text':
        return fc.string({ minLength: 0, maxLength: 20 }).map((defaultValue) => ({
          name,
          label,
          controlType,
          defaultValue,
        }))
      case 'colour':
        return arbHexColour.map((defaultValue) => ({
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
      case 'number':
      case 'range':
        return fc.integer({ min: -1000, max: 1000 }).map((defaultValue) => ({
          name,
          label,
          controlType,
          defaultValue,
          min: -1000,
          max: 1000,
          step: 1,
        }))
      case 'select':
      case 'radio':
        return fc
          .array(
            fc.record({
              label: fc.string({ minLength: 1, maxLength: 10 }),
              value: fc.string({ minLength: 1, maxLength: 10 }),
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
        return fc.constant({
          name,
          label,
          controlType,
          defaultValue: '' as string | number | boolean,
        })
    }
  })
}

/**
 * Generate an array of PropDefinitions with at least 1 entry.
 */
const arbPropDefinitions: fc.Arbitrary<PropDefinition[]> = fc
  .integer({ min: 1, max: 8 })
  .chain((length) => fc.tuple(...Array.from({ length }, (_, i) => arbPropDefinition(i))))

/**
 * Generate a modified value that differs from the default for a given PropDefinition.
 */
function arbModifiedValue(prop: PropDefinition): fc.Arbitrary<string | number | boolean> {
  switch (prop.controlType) {
    case 'text':
      return fc
        .string({ minLength: 1, maxLength: 20 })
        .filter((v) => v !== prop.defaultValue)
    case 'colour':
      return arbHexColour.filter((v) => v !== prop.defaultValue)
    case 'toggle':
      return fc.constant(!prop.defaultValue as boolean)
    case 'number':
    case 'range':
      return fc
        .integer({ min: -1000, max: 1000 })
        .filter((v) => v !== prop.defaultValue)
    case 'select':
    case 'radio':
      if (prop.options && prop.options.length > 1) {
        return fc.constantFrom(
          ...prop.options.filter((o) => o.value !== prop.defaultValue).map((o) => o.value)
        )
      }
      return fc
        .string({ minLength: 1, maxLength: 10 })
        .filter((v) => v !== prop.defaultValue)
    default:
      return fc
        .string({ minLength: 1, maxLength: 10 })
        .filter((v) => v !== prop.defaultValue)
  }
}

// --- Tests ---

describe('Feature: component-controls-panel, Property 6: Reset restores all values to defaults', () => {
  it('resetAll produces state where every value equals its defaultValue', () => {
    fc.assert(
      fc.property(arbPropDefinitions, (propDefs) => {
        const { result } = renderHook(() => useControlValues(propDefs))

        // Modify at least one value (modify the first prop)
        const firstProp = propDefs[0]
        const modifiedValue = fc.sample(arbModifiedValue(firstProp), 1)[0]

        act(() => {
          result.current.setValue(firstProp.name, modifiedValue)
        })

        // Verify state is dirty
        expect(result.current.values[firstProp.name]).not.toBe(firstProp.defaultValue)

        // Call resetAll
        act(() => {
          result.current.resetAll()
        })

        // Assert every value equals its defaultValue
        for (const prop of propDefs) {
          expect(
            result.current.values[prop.name],
            `Expected "${prop.name}" to be reset to default "${prop.defaultValue}" but got "${result.current.values[prop.name]}"`
          ).toBe(prop.defaultValue)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('resetAll restores defaults even when multiple values are modified', () => {
    fc.assert(
      fc.property(arbPropDefinitions, (propDefs) => {
        const { result } = renderHook(() => useControlValues(propDefs))

        // Modify all props
        for (const prop of propDefs) {
          const modifiedValue = fc.sample(arbModifiedValue(prop), 1)[0]
          act(() => {
            result.current.setValue(prop.name, modifiedValue)
          })
        }

        // Call resetAll
        act(() => {
          result.current.resetAll()
        })

        // Assert every value equals its defaultValue
        for (const prop of propDefs) {
          expect(
            result.current.values[prop.name],
            `Expected "${prop.name}" to be reset to default "${prop.defaultValue}" but got "${result.current.values[prop.name]}"`
          ).toBe(prop.defaultValue)
        }

        // isDirty should be false after reset
        expect(result.current.isDirty).toBe(false)
      }),
      { numRuns: 100 }
    )
  })
})
