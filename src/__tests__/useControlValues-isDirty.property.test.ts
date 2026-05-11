import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { renderHook, act } from '@testing-library/react'
import { useControlValues } from '../lib/useControlValues'
import type { PropDefinition, ControlType } from '../data/componentRegistry'

/**
 * Feature: component-controls-panel, Property 7: Reset visibility tracks state divergence from defaults
 *
 * For any set of PropDefinitions and current values, `isDirty` must be `true`
 * if and only if at least one value in the current state differs from its
 * corresponding `defaultValue`. The Reset button visibility is driven by this flag.
 *
 * **Validates: Requirements 4.1, 4.3**
 */

// --- Arbitraries ---

const arbControlType: fc.Arbitrary<ControlType> = fc.constantFrom(
  'text',
  'select',
  'toggle',
  'colour',
  'number',
  'range',
  'radio'
)

function arbDefaultValueForType(controlType: ControlType): fc.Arbitrary<string | number | boolean> {
  switch (controlType) {
    case 'text':
    case 'colour':
      return fc.string({ minLength: 1, maxLength: 20 })
    case 'select':
    case 'radio':
      return fc.string({ minLength: 1, maxLength: 10 })
    case 'toggle':
      return fc.boolean()
    case 'number':
    case 'range':
      return fc.integer({ min: -100, max: 100 })
  }
}

function arbDifferentValue(
  controlType: ControlType,
  defaultValue: string | number | boolean
): fc.Arbitrary<string | number | boolean> {
  switch (controlType) {
    case 'text':
    case 'colour':
    case 'select':
    case 'radio':
      // Generate a string that differs from the default
      return fc
        .string({ minLength: 1, maxLength: 20 })
        .filter((v) => v !== defaultValue)
    case 'toggle':
      // Simply negate the boolean
      return fc.constant(!defaultValue)
    case 'number':
    case 'range':
      // Generate an integer that differs from the default
      return fc
        .integer({ min: -100, max: 100 })
        .filter((v) => v !== defaultValue)
  }
}

const arbPropDefinition: fc.Arbitrary<PropDefinition> = arbControlType.chain((controlType) =>
  fc.record({
    name: fc.string({ minLength: 1, maxLength: 15 }).map((s) => s.replace(/[^a-zA-Z0-9]/g, 'a') || 'prop'),
    label: fc.string({ minLength: 1, maxLength: 20 }),
    controlType: fc.constant(controlType),
    defaultValue: arbDefaultValueForType(controlType),
    options:
      controlType === 'select' || controlType === 'radio'
        ? fc.array(fc.record({ label: fc.string({ minLength: 1 }), value: fc.string({ minLength: 1 }) }), {
            minLength: 1,
            maxLength: 5,
          })
        : fc.constant(undefined),
  }) as fc.Arbitrary<PropDefinition>
)

// Generate an array of PropDefinitions with unique names
const arbPropDefinitions: fc.Arbitrary<PropDefinition[]> = fc
  .array(arbPropDefinition, { minLength: 1, maxLength: 6 })
  .map((defs) => {
    // Ensure unique names by appending index
    return defs.map((def, i) => ({ ...def, name: `${def.name}${i}` }))
  })

describe('Feature: component-controls-panel, Property 7: Reset visibility tracks state divergence from defaults', () => {
  it('isDirty is false when no values have been modified from defaults', () => {
    fc.assert(
      fc.property(arbPropDefinitions, (propDefs) => {
        const { result } = renderHook(() => useControlValues(propDefs))

        // Initially, no values are modified — isDirty should be false
        expect(result.current.isDirty).toBe(false)
      }),
      { numRuns: 100 }
    )
  })

  it('isDirty is true when at least one value differs from its default', () => {
    fc.assert(
      fc.property(
        arbPropDefinitions.chain((propDefs) => {
          // Pick a random index to modify
          const indexArb = fc.integer({ min: 0, max: propDefs.length - 1 })
          return indexArb.chain((idx) => {
            const target = propDefs[idx]
            return arbDifferentValue(target.controlType, target.defaultValue).map((newVal) => ({
              propDefs,
              targetName: target.name,
              newValue: newVal,
            }))
          })
        }),
        ({ propDefs, targetName, newValue }) => {
          const { result } = renderHook(() => useControlValues(propDefs))

          // Modify one value to differ from its default
          act(() => {
            result.current.setValue(targetName, newValue)
          })

          // isDirty should be true since at least one value differs
          expect(result.current.isDirty).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('isDirty reflects whether ANY value still differs after restoring one value to its default', () => {
    fc.assert(
      fc.property(
        arbPropDefinitions
          .filter((defs) => defs.length >= 2)
          .chain((propDefs) => {
            // Pick two distinct indices to modify
            return fc
              .tuple(
                fc.integer({ min: 0, max: propDefs.length - 1 }),
                fc.integer({ min: 0, max: propDefs.length - 1 })
              )
              .filter(([a, b]) => a !== b)
              .chain(([idxA, idxB]) => {
                const targetA = propDefs[idxA]
                const targetB = propDefs[idxB]
                return fc
                  .tuple(
                    arbDifferentValue(targetA.controlType, targetA.defaultValue),
                    arbDifferentValue(targetB.controlType, targetB.defaultValue)
                  )
                  .map(([valA, valB]) => ({
                    propDefs,
                    targetA: { name: targetA.name, defaultValue: targetA.defaultValue, newValue: valA },
                    targetB: { name: targetB.name, defaultValue: targetB.defaultValue, newValue: valB },
                  }))
              })
          }),
        ({ propDefs, targetA, targetB }) => {
          const { result } = renderHook(() => useControlValues(propDefs))

          // Modify two values
          act(() => {
            result.current.setValue(targetA.name, targetA.newValue)
            result.current.setValue(targetB.name, targetB.newValue)
          })

          expect(result.current.isDirty).toBe(true)

          // Restore targetA back to its default — targetB still differs
          act(() => {
            result.current.setValue(targetA.name, targetA.defaultValue)
          })

          // isDirty should still be true because targetB still differs
          expect(result.current.isDirty).toBe(true)

          // Now restore targetB back to its default too
          act(() => {
            result.current.setValue(targetB.name, targetB.defaultValue)
          })

          // isDirty should now be false — all values match defaults
          expect(result.current.isDirty).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })
})
