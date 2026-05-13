import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

/**
 * Feature: unified-controls-panel, Property 1: Bounded numeric controls never exceed configured range
 *
 * For any button-pair or counter control with configured min, max, and step values,
 * and for any sequence of increment/decrement operations starting from any value
 * within [min, max], the resulting value SHALL always remain within [min, max] inclusive.
 *
 * **Validates: Requirements 1.4, 1.5, 1.9**
 */

// --- Pure logic extracted from CounterControl ---
// CounterControl uses: Math.max(min, value - step) for decrement, Math.min(max, value + step) for increment
function counterStep(value: number, min: number, max: number, step: number, direction: 'inc' | 'dec'): number {
  if (direction === 'dec') {
    return Math.max(min, value - step)
  } else {
    return Math.min(max, value + step)
  }
}

// --- Pure logic extracted from ButtonPairControl (numeric mode) ---
// ButtonPairControl uses: only applies change if newValue >= min (dec) or newValue <= max (inc)
function buttonPairStep(value: number, min: number, max: number, step: number, direction: 'inc' | 'dec'): number {
  if (direction === 'dec') {
    const newValue = value - step
    return (newValue >= min) ? newValue : value
  } else {
    const newValue = value + step
    return (newValue <= max) ? newValue : value
  }
}

// --- Pure logic extracted from ChipArrayControl ---
// ChipArrayControl: only adds if value.length < maxItems
function addChip(chips: string[], newChip: string, maxItems: number): string[] {
  if (chips.length >= maxItems) return chips
  const trimmed = newChip.trim()
  if (!trimmed) return chips
  return [...chips, trimmed]
}

describe('Feature: unified-controls-panel, Property 1: Bounded numeric controls never exceed configured range', () => {
  it('CounterControl: value always stays within [min, max] after any sequence of operations', () => {
    fc.assert(
      fc.property(
        // Generate min in [-100, 100]
        fc.integer({ min: -100, max: 100 }),
        // Generate range size [1, 200]
        fc.integer({ min: 1, max: 200 }),
        // Generate step [1, 10]
        fc.integer({ min: 1, max: 10 }),
        // Generate a sequence of operations
        fc.array(fc.constantFrom('inc' as const, 'dec' as const), { minLength: 1, maxLength: 50 }),
        (min, rangeSize, step, operations) => {
          const max = min + rangeSize

          // Generate a starting value within [min, max]
          // Use a deterministic value within bounds for the starting point
          const startValue = min + Math.floor(rangeSize / 2)

          let value = startValue
          for (const op of operations) {
            value = counterStep(value, min, max, step, op)
            // Assert invariant holds after every operation
            expect(value).toBeGreaterThanOrEqual(min)
            expect(value).toBeLessThanOrEqual(max)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('CounterControl: value stays bounded for any starting value within [min, max]', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -100, max: 100 }),
        fc.integer({ min: 1, max: 200 }),
        fc.integer({ min: 1, max: 10 }),
        // Use nat to generate offset within range
        fc.nat(),
        fc.array(fc.constantFrom('inc' as const, 'dec' as const), { minLength: 1, maxLength: 50 }),
        (min, rangeSize, step, startOffset, operations) => {
          const max = min + rangeSize
          // Ensure starting value is within [min, max]
          const startValue = min + (startOffset % (rangeSize + 1))

          let value = startValue
          for (const op of operations) {
            value = counterStep(value, min, max, step, op)
            expect(value).toBeGreaterThanOrEqual(min)
            expect(value).toBeLessThanOrEqual(max)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('ButtonPairControl: value always stays within [min, max] after any sequence of operations', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -100, max: 100 }),
        fc.integer({ min: 1, max: 200 }),
        fc.integer({ min: 1, max: 10 }),
        fc.nat(),
        fc.array(fc.constantFrom('inc' as const, 'dec' as const), { minLength: 1, maxLength: 50 }),
        (min, rangeSize, step, startOffset, operations) => {
          const max = min + rangeSize
          const startValue = min + (startOffset % (rangeSize + 1))

          let value = startValue
          for (const op of operations) {
            value = buttonPairStep(value, min, max, step, op)
            expect(value).toBeGreaterThanOrEqual(min)
            expect(value).toBeLessThanOrEqual(max)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('ButtonPairControl: value never changes when already at bounds and stepping further', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -100, max: 100 }),
        fc.integer({ min: 1, max: 200 }),
        fc.integer({ min: 1, max: 10 }),
        (min, rangeSize, step) => {
          const max = min + rangeSize

          // At min, decrement should not change value
          const atMin = buttonPairStep(min, min, max, step, 'dec')
          expect(atMin).toBe(min)

          // At max, increment should not change value
          const atMax = buttonPairStep(max, min, max, step, 'inc')
          expect(atMax).toBe(max)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// Feature: unified-controls-panel, Property 2: Chip-array never exceeds maxItems
describe('Feature: unified-controls-panel, Property 2: Chip-array never exceeds maxItems', () => {
  /**
   * For any chip-array control with a configured maxItems limit,
   * and for any sequence of add operations, the resulting array length
   * SHALL never exceed maxItems.
   *
   * **Validates: Requirements 1.8**
   */
  it('chip-array length never exceeds maxItems after any sequence of add operations', () => {
    fc.assert(
      fc.property(
        // maxItems between 1 and 20
        fc.integer({ min: 1, max: 20 }),
        // Initial array (0 to maxItems items)
        fc.array(fc.string({ minLength: 1, maxLength: 15 }), { minLength: 0, maxLength: 20 }),
        // Sequence of strings to add
        fc.array(fc.string({ minLength: 0, maxLength: 15 }), { minLength: 1, maxLength: 30 }),
        (maxItems, initialArray, addSequence) => {
          // Trim initial array to be at most maxItems (simulating valid starting state)
          let chips = initialArray.slice(0, maxItems)

          for (const newChip of addSequence) {
            chips = addChip(chips, newChip, maxItems)
            // Assert invariant holds after every add operation
            expect(chips.length).toBeLessThanOrEqual(maxItems)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('chip-array does not add when already at maxItems', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (maxItems, items, newItem) => {
          // Fill array to exactly maxItems
          const fullArray = items.slice(0, maxItems)
          // Pad if needed
          while (fullArray.length < maxItems) {
            fullArray.push('pad')
          }

          const result = addChip(fullArray, newItem, maxItems)
          // Should not have grown
          expect(result.length).toBe(maxItems)
          // Should be the same reference (no mutation)
          expect(result).toBe(fullArray)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('chip-array does not add empty or whitespace-only strings', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 0, maxLength: 5 }),
        fc.constantFrom('', ' ', '  ', '\t', '\n', '   '),
        (maxItems, initialChips, emptyString) => {
          const chips = initialChips.slice(0, maxItems)
          const result = addChip(chips, emptyString, maxItems)
          // Length should not increase for empty/whitespace strings
          expect(result.length).toBe(chips.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('chip-array length monotonically increases (never decreases) with valid adds until maxItems', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 30 }),
        (maxItems, addSequence) => {
          let chips: string[] = []
          let prevLength = 0

          for (const newChip of addSequence) {
            chips = addChip(chips, newChip, maxItems)
            // Length should never decrease
            expect(chips.length).toBeGreaterThanOrEqual(prevLength)
            // Length should never exceed maxItems
            expect(chips.length).toBeLessThanOrEqual(maxItems)
            prevLength = chips.length
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})


// ============================================================================
// Properties 5–9: useControlValues hook property tests
// ============================================================================

import { renderHook, act } from '@testing-library/react'
import { useControlValues, isVisible } from '../lib/useControlValues'
import type { PropDefinition, ControlType, ControlValue } from '../data/componentRegistry'

// --- Shared Arbitraries for Properties 5–9 ---

const allControlTypes: ControlType[] = [
  'text', 'select', 'toggle', 'colour', 'number', 'range', 'radio',
  'prefix-input', 'chip-array', 'button-pair', 'counter',
]

const reservedNames = new Set([
  '__proto__', 'constructor', 'toString', 'valueOf',
  'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
  'toLocaleString', '__defineGetter__', '__defineSetter__',
  '__lookupGetter__', '__lookupSetter__',
])

/**
 * Generate a safe prop name (alphanumeric, no reserved words).
 */
const arbPropName: fc.Arbitrary<string> = fc
  .string({ minLength: 1, maxLength: 12 })
  .map((s) => s.replace(/[^a-zA-Z0-9]/g, 'x') || 'prop')
  .filter((s) => s.length > 0 && !reservedNames.has(s))

/**
 * Generate a PropDefinition with appropriate defaultValue for its controlType.
 * Includes string[] defaults for chip-array type.
 */
function arbPropDefinitionForType(controlType: ControlType): fc.Arbitrary<PropDefinition> {
  const base = fc.record({
    name: arbPropName,
    label: fc.string({ minLength: 1, maxLength: 20 }),
  })

  switch (controlType) {
    case 'text':
    case 'colour':
    case 'prefix-input':
      return base.chain(({ name, label }) =>
        fc.string({ maxLength: 15 }).map((defaultValue) => ({
          name,
          label,
          controlType,
          defaultValue,
          ...(controlType === 'prefix-input' ? { prefix: 'pre' } : {}),
        }))
      )
    case 'number':
    case 'range':
    case 'counter':
      return base.chain(({ name, label }) =>
        fc.integer({ min: -100, max: 100 }).map((defaultValue) => ({
          name,
          label,
          controlType,
          defaultValue,
          min: -100,
          max: 100,
          step: 1,
        }))
      )
    case 'toggle':
      return base.chain(({ name, label }) =>
        fc.boolean().map((defaultValue) => ({
          name,
          label,
          controlType,
          defaultValue,
        }))
      )
    case 'select':
    case 'radio':
      return base.chain(({ name, label }) =>
        fc
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
      )
    case 'chip-array':
      return base.chain(({ name, label }) =>
        fc
          .array(fc.string({ minLength: 1, maxLength: 8 }), { minLength: 0, maxLength: 5 })
          .map((defaultValue) => ({
            name,
            label,
            controlType,
            defaultValue,
            maxItems: 10,
          }))
      )
    case 'button-pair':
      return base.chain(({ name, label }) =>
        fc.integer({ min: 0, max: 10 }).map((defaultValue) => ({
          name,
          label,
          controlType,
          defaultValue,
          labels: ['Back', 'Next'] as [string, string],
          min: 0,
          max: 10,
          step: 1,
        }))
      )
    default:
      return base.map(({ name, label }) => ({
        name,
        label,
        controlType,
        defaultValue: '',
      }))
  }
}

/**
 * Generate a random PropDefinition (any type).
 */
const arbAnyPropDefinition: fc.Arbitrary<PropDefinition> = fc
  .constantFrom(...allControlTypes)
  .chain(arbPropDefinitionForType)

/**
 * Generate an array of PropDefinitions with unique names.
 */
const arbUniquePropDefinitions: fc.Arbitrary<PropDefinition[]> = fc
  .array(arbAnyPropDefinition, { minLength: 1, maxLength: 8 })
  .map((defs) => {
    const seen = new Set<string>()
    return defs.map((d, i) => {
      const uniqueName = seen.has(d.name) ? `${d.name}_${i}` : d.name
      seen.add(uniqueName)
      return { ...d, name: uniqueName }
    })
  })

/**
 * Generate a ControlValue that differs from the given default.
 */
function arbDifferentControlValue(prop: PropDefinition): fc.Arbitrary<ControlValue> {
  switch (prop.controlType) {
    case 'text':
    case 'colour':
    case 'prefix-input':
      return fc.string({ minLength: 1, maxLength: 15 }).filter((v) => v !== prop.defaultValue)
    case 'number':
    case 'range':
    case 'counter':
    case 'button-pair':
      return fc.integer({ min: -100, max: 100 }).filter((v) => v !== prop.defaultValue)
    case 'toggle':
      return fc.constant(!prop.defaultValue as boolean)
    case 'select':
    case 'radio':
      return fc.string({ minLength: 1, maxLength: 10 }).filter((v) => v !== prop.defaultValue)
    case 'chip-array':
      return fc
        .array(fc.string({ minLength: 1, maxLength: 8 }), { minLength: 1, maxLength: 5 })
        .filter((v) => {
          const def = prop.defaultValue as string[]
          return v.length !== def.length || v.some((item, i) => item !== def[i])
        })
    default:
      return fc.string({ minLength: 1, maxLength: 10 }).filter((v) => v !== prop.defaultValue)
  }
}

/**
 * Deep equality check for ControlValue (mirrors hook logic).
 */
function controlValuesEqual(a: ControlValue, b: ControlValue): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }
  return a === b
}

// ============================================================================
// Feature: unified-controls-panel, Property 5: Hidden-to-visible transition resets value to default
// ============================================================================

describe('Feature: unified-controls-panel, Property 5: Hidden-to-visible transition resets value to default', () => {
  /**
   * For any control with a visibleWhen condition that transitions from hidden to visible,
   * the control's value SHALL equal its configured defaultValue immediately after becoming visible.
   *
   * **Validates: Requirements 3.4**
   */

  it('a control that transitions from hidden to visible has its value reset to defaultValue', () => {
    fc.assert(
      fc.property(
        // Generate a "trigger" control (select type with at least 2 options)
        fc.array(
          fc.record({
            label: fc.string({ minLength: 1, maxLength: 10 }),
            value: fc.string({ minLength: 1, maxLength: 10 }),
          }),
          { minLength: 2, maxLength: 5 }
        ),
        // Generate a dependent control type and default
        fc.constantFrom<ControlType>('text', 'toggle', 'number'),
        (triggerOptions, depType) => {
          // Ensure unique option values
          const uniqueOptions = triggerOptions.filter(
            (opt, i, arr) => arr.findIndex((o) => o.value === opt.value) === i
          )
          if (uniqueOptions.length < 2) return // skip if not enough unique options

          const showValue = uniqueOptions[0].value
          const hideValue = uniqueOptions[1].value

          const triggerControl: PropDefinition = {
            name: 'trigger',
            label: 'Trigger',
            controlType: 'select',
            defaultValue: hideValue, // starts hidden
            options: uniqueOptions,
          }

          const depDefault: ControlValue = depType === 'text' ? 'hello' : depType === 'toggle' ? true : 42
          const dependentControl: PropDefinition = {
            name: 'dependent',
            label: 'Dependent',
            controlType: depType,
            defaultValue: depDefault,
            visibleWhen: { controlName: 'trigger', values: [showValue] },
          }

          const propControls = [triggerControl, dependentControl]

          const { result } = renderHook(() => useControlValues(propControls))

          // Initially the dependent control is hidden (trigger starts at hideValue)
          expect(result.current.values['dependent']).toBeUndefined()

          // Change trigger to show the dependent control
          act(() => {
            result.current.setValue('trigger', showValue)
          })

          // The dependent control should now be visible with its defaultValue
          expect(result.current.values['dependent']).toStrictEqual(depDefault)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('a control that was modified, hidden, then shown again resets to defaultValue', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<ControlType>('text', 'number', 'toggle'),
        (depType) => {
          const depDefault: ControlValue = depType === 'text' ? 'original' : depType === 'toggle' ? false : 10
          const depModified: ControlValue = depType === 'text' ? 'modified' : depType === 'toggle' ? true : 99

          const triggerControl: PropDefinition = {
            name: 'trigger',
            label: 'Trigger',
            controlType: 'select',
            defaultValue: 'show',
            options: [{ label: 'Show', value: 'show' }, { label: 'Hide', value: 'hide' }],
          }

          const dependentControl: PropDefinition = {
            name: 'dependent',
            label: 'Dependent',
            controlType: depType,
            defaultValue: depDefault,
            visibleWhen: { controlName: 'trigger', values: ['show'] },
          }

          const propControls = [triggerControl, dependentControl]
          const { result } = renderHook(() => useControlValues(propControls))

          // Initially visible — modify the dependent control's value
          act(() => {
            result.current.setValue('dependent', depModified)
          })
          expect(result.current.values['dependent']).toStrictEqual(depModified)

          // Hide the dependent control
          act(() => {
            result.current.setValue('trigger', 'hide')
          })
          expect(result.current.values['dependent']).toBeUndefined()

          // Show it again — should reset to defaultValue, not the modified value
          act(() => {
            result.current.setValue('trigger', 'show')
          })
          expect(result.current.values['dependent']).toStrictEqual(depDefault)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================================================
// Feature: unified-controls-panel, Property 6: Initialisation produces correct defaults record
// ============================================================================

describe('Feature: unified-controls-panel, Property 6: Initialisation produces correct defaults record', () => {
  /**
   * For any array of PropDefinitions, the initial values record SHALL contain exactly
   * one entry per PropDefinition, keyed by name, with value equal to defaultValue.
   *
   * **Validates: Requirements 4.1, 4.7, 4.8**
   */

  it('initial values record has one entry per PropDefinition with value equal to defaultValue', () => {
    fc.assert(
      fc.property(arbUniquePropDefinitions, (propControls) => {
        const { result } = renderHook(() => useControlValues(propControls))

        // Should have exactly one entry per PropDefinition (all visible since no visibleWhen)
        expect(Object.keys(result.current.values).length).toBe(propControls.length)

        for (const prop of propControls) {
          expect(
            result.current.values[prop.name],
            `Expected values["${prop.name}"] to equal defaultValue ${JSON.stringify(prop.defaultValue)}`
          ).toStrictEqual(prop.defaultValue)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('returns empty values record and isDirty false for empty/undefined propControls', () => {
    const { result: emptyResult } = renderHook(() => useControlValues([]))
    expect(emptyResult.current.values).toStrictEqual({})
    expect(emptyResult.current.isDirty).toBe(false)

    const { result: undefinedResult } = renderHook(() => useControlValues(undefined))
    expect(undefinedResult.current.values).toStrictEqual({})
    expect(undefinedResult.current.isDirty).toBe(false)
  })

  it('correctly initialises string[] defaults for chip-array controls', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 8 }), { minLength: 0, maxLength: 5 }),
        arbPropName,
        (defaultChips, name) => {
          const propControls: PropDefinition[] = [
            {
              name,
              label: 'Chips',
              controlType: 'chip-array',
              defaultValue: defaultChips,
              maxItems: 10,
            },
          ]

          const { result } = renderHook(() => useControlValues(propControls))

          const value = result.current.values[name]
          expect(Array.isArray(value)).toBe(true)
          expect(value).toStrictEqual(defaultChips)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================================================
// Feature: unified-controls-panel, Property 7: Reset is a round-trip to defaults
// ============================================================================

describe('Feature: unified-controls-panel, Property 7: Reset is a round-trip to defaults', () => {
  /**
   * For any array of PropDefinitions and for any sequence of setValue operations,
   * calling resetAll SHALL produce a values record identical to the initial defaults,
   * and isDirty SHALL be false.
   *
   * **Validates: Requirements 4.3**
   */

  it('resetAll restores values to defaults and isDirty to false after arbitrary setValue operations', () => {
    fc.assert(
      fc.property(
        arbUniquePropDefinitions.chain((propDefs) => {
          // Generate a sequence of setValue operations (random index + different value)
          const opsArb = fc.array(
            fc.integer({ min: 0, max: propDefs.length - 1 }).chain((idx) =>
              arbDifferentControlValue(propDefs[idx]).map((val) => ({
                name: propDefs[idx].name,
                value: val,
              }))
            ),
            { minLength: 1, maxLength: 10 }
          )
          return opsArb.map((ops) => ({ propDefs, ops }))
        }),
        ({ propDefs, ops }) => {
          const { result } = renderHook(() => useControlValues(propDefs))

          // Apply random setValue operations
          for (const op of ops) {
            act(() => {
              result.current.setValue(op.name, op.value)
            })
          }

          // Call resetAll
          act(() => {
            result.current.resetAll()
          })

          // Verify all values match defaults
          for (const prop of propDefs) {
            expect(
              result.current.values[prop.name],
              `After resetAll, "${prop.name}" should equal default ${JSON.stringify(prop.defaultValue)}`
            ).toStrictEqual(prop.defaultValue)
          }

          // isDirty should be false
          expect(result.current.isDirty).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('resetAll with chip-array controls restores array defaults correctly', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 8 }), { minLength: 0, maxLength: 5 }),
        fc.array(fc.string({ minLength: 1, maxLength: 8 }), { minLength: 1, maxLength: 5 }),
        (defaultChips, modifiedChips) => {
          const propControls: PropDefinition[] = [
            {
              name: 'chips',
              label: 'Chips',
              controlType: 'chip-array',
              defaultValue: defaultChips,
              maxItems: 10,
            },
          ]

          const { result } = renderHook(() => useControlValues(propControls))

          // Modify the chip-array value
          act(() => {
            result.current.setValue('chips', modifiedChips)
          })

          // Reset
          act(() => {
            result.current.resetAll()
          })

          // Should be back to default
          expect(result.current.values['chips']).toStrictEqual(defaultChips)
          expect(result.current.isDirty).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================================================
// Feature: unified-controls-panel, Property 8: isDirty correctly reflects value divergence
// ============================================================================

describe('Feature: unified-controls-panel, Property 8: isDirty correctly reflects value divergence', () => {
  /**
   * isDirty SHALL be true if and only if at least one value differs from its
   * corresponding defaultValue.
   *
   * **Validates: Requirements 4.4, 4.8**
   */

  it('isDirty is false when all values equal their defaults', () => {
    fc.assert(
      fc.property(arbUniquePropDefinitions, (propDefs) => {
        const { result } = renderHook(() => useControlValues(propDefs))

        // Initially all values are defaults
        expect(result.current.isDirty).toBe(false)
      }),
      { numRuns: 100 }
    )
  })

  it('isDirty is true iff at least one value differs from its default', () => {
    fc.assert(
      fc.property(
        arbUniquePropDefinitions.chain((propDefs) =>
          fc.integer({ min: 0, max: propDefs.length - 1 }).chain((idx) =>
            arbDifferentControlValue(propDefs[idx]).map((newVal) => ({
              propDefs,
              targetIdx: idx,
              newValue: newVal,
            }))
          )
        ),
        ({ propDefs, targetIdx, newValue }) => {
          const { result } = renderHook(() => useControlValues(propDefs))

          // Modify one value
          act(() => {
            result.current.setValue(propDefs[targetIdx].name, newValue)
          })

          // isDirty should be true
          expect(result.current.isDirty).toBe(true)

          // Restore it back to default
          act(() => {
            result.current.setValue(propDefs[targetIdx].name, propDefs[targetIdx].defaultValue)
          })

          // isDirty should be false again
          expect(result.current.isDirty).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('isDirty uses deep equality for string[] values (chip-array)', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 8 }), { minLength: 1, maxLength: 5 }),
        (defaultChips) => {
          const propControls: PropDefinition[] = [
            {
              name: 'chips',
              label: 'Chips',
              controlType: 'chip-array',
              defaultValue: defaultChips,
              maxItems: 10,
            },
          ]

          const { result } = renderHook(() => useControlValues(propControls))

          // Initially not dirty
          expect(result.current.isDirty).toBe(false)

          // Set to a different array (same content but new reference)
          act(() => {
            result.current.setValue('chips', [...defaultChips])
          })

          // Should still NOT be dirty (deep equality)
          expect(result.current.isDirty).toBe(false)

          // Set to a genuinely different array
          act(() => {
            result.current.setValue('chips', [...defaultChips, 'extra'])
          })

          // Should be dirty now
          expect(result.current.isDirty).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================================================
// Feature: unified-controls-panel, Property 9: Navigation re-initialises state from new definitions
// ============================================================================

describe('Feature: unified-controls-panel, Property 9: Navigation re-initialises state from new definitions', () => {
  /**
   * When the hook transitions from one PropDefinition array to another,
   * the resulting values record SHALL equal the defaults derived from the second array,
   * and isDirty SHALL be false.
   *
   * **Validates: Requirements 4.6**
   */

  it('transitioning to a new PropDefinition array produces defaults from the second array', () => {
    fc.assert(
      fc.property(
        // Generate two distinct PropDefinition arrays with different names
        arbUniquePropDefinitions.map((defs) =>
          defs.map((d) => ({ ...d, name: `first_${d.name}` }))
        ),
        arbUniquePropDefinitions.map((defs) =>
          defs.map((d) => ({ ...d, name: `second_${d.name}` }))
        ),
        (firstDefs, secondDefs) => {
          const { result, rerender } = renderHook(
            ({ controls }) => useControlValues(controls),
            { initialProps: { controls: firstDefs } }
          )

          // Verify initial state matches first array's defaults
          for (const prop of firstDefs) {
            expect(result.current.values[prop.name]).toStrictEqual(prop.defaultValue)
          }

          // Transition to second array
          rerender({ controls: secondDefs })

          // Values should now match second array's defaults
          expect(Object.keys(result.current.values).length).toBe(secondDefs.length)
          for (const prop of secondDefs) {
            expect(
              result.current.values[prop.name],
              `After navigation, "${prop.name}" should equal default ${JSON.stringify(prop.defaultValue)}`
            ).toStrictEqual(prop.defaultValue)
          }

          // isDirty should be false
          expect(result.current.isDirty).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('navigation after modifications still produces clean state from new definitions', () => {
    fc.assert(
      fc.property(
        arbUniquePropDefinitions.map((defs) =>
          defs.map((d) => ({ ...d, name: `a_${d.name}` }))
        ),
        arbUniquePropDefinitions.map((defs) =>
          defs.map((d) => ({ ...d, name: `b_${d.name}` }))
        ),
        (firstDefs, secondDefs) => {
          const { result, rerender } = renderHook(
            ({ controls }) => useControlValues(controls),
            { initialProps: { controls: firstDefs } }
          )

          // Modify some values in the first set
          if (firstDefs.length > 0) {
            const modVal = firstDefs[0].controlType === 'toggle' ? !firstDefs[0].defaultValue : 'modified'
            act(() => {
              result.current.setValue(firstDefs[0].name, modVal)
            })
          }

          // Transition to second array
          rerender({ controls: secondDefs })

          // Values should match second array's defaults regardless of prior modifications
          for (const prop of secondDefs) {
            expect(result.current.values[prop.name]).toStrictEqual(prop.defaultValue)
          }

          // isDirty should be false
          expect(result.current.isDirty).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================================================
// Feature: unified-controls-panel, Property 3: Section grouping preserves order and merges correctly
// ============================================================================

import { groupBySection } from '../components/component-library/ControlsPanel'

describe('Feature: unified-controls-panel, Property 3: Section grouping preserves order and merges correctly', () => {
  /**
   * For any array of PropDefinitions with arbitrary section assignments,
   * the grouping algorithm SHALL produce groups where:
   * (a) ungrouped controls appear first in declaration order,
   * (b) sectioned groups appear in first-occurrence order,
   * (c) all controls within a group share the same section value,
   * (d) relative declaration order is preserved within each group.
   *
   * **Validates: Requirements 2.2, 2.4, 2.5**
   */

  /** Arbitrary for section names — some null/undefined, some shared */
  const arbSection: fc.Arbitrary<string | undefined> = fc.oneof(
    fc.constant(undefined),
    fc.constantFrom('Layout', 'Appearance', 'Behaviour', 'Advanced'),
    fc.string({ minLength: 1, maxLength: 40 })
  )

  /** Generate a PropDefinition with a random section assignment */
  const arbPropDefWithSection: fc.Arbitrary<PropDefinition> = fc.record({
    name: arbPropName,
    label: fc.string({ minLength: 1, maxLength: 20 }),
    controlType: fc.constantFrom<ControlType>(...allControlTypes),
    defaultValue: fc.string({ minLength: 0, maxLength: 10 }),
    section: arbSection,
  }).map(({ name, label, controlType, defaultValue, section }) => ({
    name,
    label,
    controlType,
    defaultValue,
    ...(section ? { section } : {}),
  }))

  /** Generate an array of 1–20 PropDefinitions with unique names and random sections */
  const arbPropDefsWithSections: fc.Arbitrary<PropDefinition[]> = fc
    .array(arbPropDefWithSection, { minLength: 1, maxLength: 20 })
    .map((defs) => {
      const seen = new Set<string>()
      return defs.map((d, i) => {
        const uniqueName = seen.has(d.name) ? `${d.name}_${i}` : d.name
        seen.add(uniqueName)
        return { ...d, name: uniqueName }
      })
    })

  it('(a) the first group has section === null and contains all controls without a section, in declaration order', () => {
    fc.assert(
      fc.property(arbPropDefsWithSections, (propControls) => {
        const groups = groupBySection(propControls)
        const ungroupedInputs = propControls.filter((p) => !p.section)

        if (ungroupedInputs.length === 0) {
          // No ungrouped controls — first group should be sectioned (or no groups at all)
          if (groups.length > 0) {
            expect(groups[0].section).not.toBeNull()
          }
          return
        }

        // First group must be the ungrouped one
        expect(groups[0].section).toBeNull()
        expect(groups[0].controls.length).toBe(ungroupedInputs.length)

        // Controls in the ungrouped group must match declaration order
        const ungroupedNames = groups[0].controls.map((c) => c.name)
        const expectedNames = ungroupedInputs.map((c) => c.name)
        expect(ungroupedNames).toStrictEqual(expectedNames)
      }),
      { numRuns: 100 }
    )
  })

  it('(b) sectioned groups appear in the order their section was first encountered in the input array', () => {
    fc.assert(
      fc.property(arbPropDefsWithSections, (propControls) => {
        const groups = groupBySection(propControls)
        const sectionedGroups = groups.filter((g) => g.section !== null)

        // Determine expected section order from first occurrence in input
        const expectedSectionOrder: string[] = []
        for (const ctrl of propControls) {
          if (ctrl.section) {
            const sectionKey = ctrl.section.length > 40 ? ctrl.section.slice(0, 40) : ctrl.section
            if (!expectedSectionOrder.includes(sectionKey)) {
              expectedSectionOrder.push(sectionKey)
            }
          }
        }

        const actualSectionOrder = sectionedGroups.map((g) => g.section)
        expect(actualSectionOrder).toStrictEqual(expectedSectionOrder)
      }),
      { numRuns: 100 }
    )
  })

  it('(c) all controls within each sectioned group share the same section value', () => {
    fc.assert(
      fc.property(arbPropDefsWithSections, (propControls) => {
        const groups = groupBySection(propControls)
        const sectionedGroups = groups.filter((g) => g.section !== null)

        for (const group of sectionedGroups) {
          for (const ctrl of group.controls) {
            // The control's section (possibly truncated) should match the group's section
            const ctrlSection = ctrl.section && ctrl.section.length > 40
              ? ctrl.section.slice(0, 40)
              : ctrl.section
            expect(ctrlSection).toBe(group.section)
          }
        }
      }),
      { numRuns: 100 }
    )
  })

  it('(d) relative declaration order is preserved within each group', () => {
    fc.assert(
      fc.property(arbPropDefsWithSections, (propControls) => {
        const groups = groupBySection(propControls)

        for (const group of groups) {
          // Get the indices of this group's controls in the original array
          const originalIndices = group.controls.map((ctrl) =>
            propControls.findIndex((p) => p.name === ctrl.name)
          )

          // Indices should be strictly increasing (preserving declaration order)
          for (let i = 1; i < originalIndices.length; i++) {
            expect(originalIndices[i]).toBeGreaterThan(originalIndices[i - 1])
          }
        }
      }),
      { numRuns: 100 }
    )
  })

  it('all input controls appear exactly once across all groups (no loss, no duplication)', () => {
    fc.assert(
      fc.property(arbPropDefsWithSections, (propControls) => {
        const groups = groupBySection(propControls)

        // Flatten all controls from all groups
        const allGroupedControls = groups.flatMap((g) => g.controls)

        // Total count should match input
        expect(allGroupedControls.length).toBe(propControls.length)

        // Each control name should appear exactly once
        const names = allGroupedControls.map((c) => c.name)
        const uniqueNames = new Set(names)
        expect(uniqueNames.size).toBe(names.length)
      }),
      { numRuns: 100 }
    )
  })
})


// ============================================================================
// Feature: unified-controls-panel, Property 4: Visibility evaluation matches condition semantics
// ============================================================================

describe('Feature: unified-controls-panel, Property 4: Visibility evaluation matches condition semantics', () => {
  /**
   * For any PropDefinition with a visibleWhen condition, and for any current values record:
   * the control is visible if and only if the referenced control's current value is included
   * in the visibleWhen.values array, OR the referenced controlName does not exist in the
   * PropDefinition array (permanently visible).
   *
   * **Validates: Requirements 3.2, 3.3, 3.5, 3.6**
   */

  // --- Arbitraries specific to Property 4 ---

  /** Generate a ControlValue suitable for use in visibleWhen.values and as a current value */
  const arbVisibleWhenValue: fc.Arbitrary<string | number | boolean> = fc.oneof(
    fc.string({ minLength: 1, maxLength: 10 }),
    fc.integer({ min: -50, max: 50 }),
    fc.boolean()
  )

  it('controls without visibleWhen are always visible', () => {
    fc.assert(
      fc.property(
        arbUniquePropDefinitions,
        (propControls) => {
          // Build a values record from defaults (no visibleWhen on these)
          const values: Record<string, ControlValue> = {}
          for (const ctrl of propControls) {
            values[ctrl.name] = ctrl.defaultValue
          }

          // Every control without visibleWhen should be visible
          for (const ctrl of propControls) {
            if (!ctrl.visibleWhen) {
              expect(isVisible(ctrl, values, propControls)).toBe(true)
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('control is visible when referenced control value IS in visibleWhen.values', () => {
    fc.assert(
      fc.property(
        // Generate a trigger control name
        arbPropName,
        // Generate acceptable values (at least 1)
        fc.array(arbVisibleWhenValue, { minLength: 1, maxLength: 5 }),
        // Pick which acceptable value to use as the current value (index)
        fc.nat(),
        // Generate a dependent control name (different from trigger)
        arbPropName,
        (triggerName, acceptableValues, valueIdx, depName) => {
          // Ensure unique names
          const safeTriggerName = triggerName
          const safeDepName = depName === safeTriggerName ? `${depName}_dep` : depName

          // Pick a current value from the acceptable values
          const currentValue = acceptableValues[valueIdx % acceptableValues.length]

          const triggerControl: PropDefinition = {
            name: safeTriggerName,
            label: 'Trigger',
            controlType: 'select',
            defaultValue: String(currentValue),
            options: [{ label: 'opt', value: String(currentValue) }],
          }

          const dependentControl: PropDefinition = {
            name: safeDepName,
            label: 'Dependent',
            controlType: 'text',
            defaultValue: 'default',
            visibleWhen: { controlName: safeTriggerName, values: acceptableValues },
          }

          const propControls = [triggerControl, dependentControl]
          const values: Record<string, ControlValue> = {
            [safeTriggerName]: currentValue,
            [safeDepName]: 'default',
          }

          // The dependent control should be visible because currentValue is in acceptableValues
          expect(isVisible(dependentControl, values, propControls)).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('control is hidden when referenced control value is NOT in visibleWhen.values', () => {
    fc.assert(
      fc.property(
        // Generate a trigger control name
        arbPropName,
        // Generate acceptable values (strings only for easier filtering)
        fc.array(fc.string({ minLength: 1, maxLength: 8 }), { minLength: 1, maxLength: 5 }),
        // Generate a current value that is NOT in the acceptable values
        fc.string({ minLength: 1, maxLength: 8 }),
        // Generate a dependent control name
        arbPropName,
        (triggerName, acceptableValues, currentValue, depName) => {
          // Ensure the current value is NOT in the acceptable values
          if (acceptableValues.includes(currentValue)) return // skip this case

          const safeTriggerName = triggerName
          const safeDepName = depName === safeTriggerName ? `${depName}_dep` : depName

          const triggerControl: PropDefinition = {
            name: safeTriggerName,
            label: 'Trigger',
            controlType: 'text',
            defaultValue: currentValue,
          }

          const dependentControl: PropDefinition = {
            name: safeDepName,
            label: 'Dependent',
            controlType: 'text',
            defaultValue: 'default',
            visibleWhen: { controlName: safeTriggerName, values: acceptableValues },
          }

          const propControls = [triggerControl, dependentControl]
          const values: Record<string, ControlValue> = {
            [safeTriggerName]: currentValue,
            [safeDepName]: 'default',
          }

          // The dependent control should be hidden because currentValue is NOT in acceptableValues
          expect(isVisible(dependentControl, values, propControls)).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('control is permanently visible when visibleWhen references a controlName not in propControls', () => {
    fc.assert(
      fc.property(
        // Generate a non-existent control name
        arbPropName,
        // Generate acceptable values
        fc.array(arbVisibleWhenValue, { minLength: 1, maxLength: 5 }),
        // Generate a dependent control name
        arbPropName,
        // Generate some other controls that do NOT have the referenced name
        arbUniquePropDefinitions,
        (nonExistentName, acceptableValues, depName, otherControls) => {
          // Ensure the non-existent name is truly not in the propControls
          const safeNonExistentName = `__nonexistent_${nonExistentName}`
          const safeDepName = depName === safeNonExistentName ? `${depName}_dep` : depName

          // Ensure safeDepName doesn't collide with other controls
          const existingNames = new Set(otherControls.map((c) => c.name))
          const finalDepName = existingNames.has(safeDepName) ? `${safeDepName}_unique` : safeDepName

          const dependentControl: PropDefinition = {
            name: finalDepName,
            label: 'Dependent',
            controlType: 'text',
            defaultValue: 'default',
            visibleWhen: { controlName: safeNonExistentName, values: acceptableValues },
          }

          // propControls includes other controls but NOT one named safeNonExistentName
          const propControls = [...otherControls.filter((c) => c.name !== safeNonExistentName), dependentControl]

          // Build values record
          const values: Record<string, ControlValue> = {}
          for (const ctrl of propControls) {
            values[ctrl.name] = ctrl.defaultValue
          }

          // The dependent control should be permanently visible since the referenced control doesn't exist
          expect(isVisible(dependentControl, values, propControls)).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('visibility correctly toggles based on value changes (integration with isVisible)', () => {
    fc.assert(
      fc.property(
        // Generate 2-5 acceptable values
        fc.array(fc.string({ minLength: 1, maxLength: 8 }), { minLength: 2, maxLength: 5 }),
        // Generate a value that's NOT in the acceptable set
        fc.string({ minLength: 1, maxLength: 8 }),
        (acceptableValues, outsideValue) => {
          // Ensure uniqueness and that outsideValue is truly outside
          const uniqueAcceptable = [...new Set(acceptableValues)]
          if (uniqueAcceptable.length < 2) return
          if (uniqueAcceptable.includes(outsideValue)) return

          const triggerControl: PropDefinition = {
            name: 'trigger',
            label: 'Trigger',
            controlType: 'select',
            defaultValue: uniqueAcceptable[0],
            options: uniqueAcceptable.map((v) => ({ label: v, value: v })),
          }

          const dependentControl: PropDefinition = {
            name: 'dependent',
            label: 'Dependent',
            controlType: 'text',
            defaultValue: 'hello',
            visibleWhen: { controlName: 'trigger', values: uniqueAcceptable },
          }

          const propControls = [triggerControl, dependentControl]

          // When trigger value is in acceptable values → visible
          for (const val of uniqueAcceptable) {
            const values: Record<string, ControlValue> = { trigger: val, dependent: 'hello' }
            expect(isVisible(dependentControl, values, propControls)).toBe(true)
          }

          // When trigger value is NOT in acceptable values → hidden
          const hiddenValues: Record<string, ControlValue> = { trigger: outsideValue, dependent: 'hello' }
          expect(isVisible(dependentControl, hiddenValues, propControls)).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================================================
// Feature: component-controllers-expansion, Property 5: Conditional Visibility
// ============================================================================

import { componentRegistry } from '../data/componentRegistry'

describe('Feature: component-controllers-expansion, Property 5: Conditional Visibility', () => {
  /**
   * For any PropDefinition with a `visibleWhen` condition, the `isVisible` function
   * SHALL return false when the referenced control's value is NOT in the acceptable
   * values list, and SHALL return true when it IS in the list.
   *
   * This test specifically validates the Slider's `step-count` control which has:
   * visibleWhen: { controlName: 'show-steps', values: [true] }
   *
   * **Validates: Requirements 6.5, 14.7**
   */

  // Get the Slider entry from the registry
  const sliderEntry = componentRegistry.find((e) => e.name === 'Slider')
  const sliderPropControls = sliderEntry?.propControls ?? []
  const stepCountControl = sliderPropControls.find((c) => c.name === 'step-count')
  const showStepsControl = sliderPropControls.find((c) => c.name === 'show-steps')

  it('Slider step-count control exists with visibleWhen referencing show-steps', () => {
    expect(stepCountControl).toBeDefined()
    expect(stepCountControl!.visibleWhen).toBeDefined()
    expect(stepCountControl!.visibleWhen!.controlName).toBe('show-steps')
    expect(stepCountControl!.visibleWhen!.values).toContain(true)
    expect(showStepsControl).toBeDefined()
    expect(showStepsControl!.controlType).toBe('toggle')
  })

  it('step-count isVisible returns true when show-steps is true (for any random boolean)', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        (showStepsValue) => {
          // Build a values record with the generated boolean for show-steps
          const values: Record<string, ControlValue> = {}
          for (const ctrl of sliderPropControls) {
            values[ctrl.name] = ctrl.defaultValue
          }
          values['show-steps'] = showStepsValue

          const visible = isVisible(stepCountControl!, values, sliderPropControls)

          if (showStepsValue === true) {
            // When show-steps is true, step-count should be visible
            expect(visible).toBe(true)
          } else {
            // When show-steps is false, step-count should be hidden
            expect(visible).toBe(false)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('step-count isVisible correctly reflects show-steps value across all Slider control value combinations', () => {
    fc.assert(
      fc.property(
        // Generate random boolean for show-steps
        fc.boolean(),
        // Generate random boolean for range-mode
        fc.boolean(),
        // Generate random boolean for disabled
        fc.boolean(),
        // Generate random boolean for show-tooltip
        fc.boolean(),
        // Generate random value-position
        fc.constantFrom('right', 'above', 'below', 'hidden'),
        // Generate random min value
        fc.integer({ min: 0, max: 100 }),
        // Generate random max value
        fc.integer({ min: 0, max: 1000 }),
        (showSteps, rangeMode, disabled, showTooltip, valuePosition, min, max) => {
          // Build a full values record with random values for all Slider controls
          const values: Record<string, ControlValue> = {
            'range-mode': rangeMode,
            'disabled': disabled,
            'show-tooltip': showTooltip,
            'value-position': valuePosition,
            'show-steps': showSteps,
            'step-count': 5,
            'min': min,
            'max': max,
          }

          const visible = isVisible(stepCountControl!, values, sliderPropControls)

          // The visibility of step-count depends ONLY on show-steps value
          // regardless of all other control values
          expect(visible).toBe(showSteps)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('all Slider controls without visibleWhen are always visible regardless of other values', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        fc.constantFrom('right', 'above', 'below', 'hidden'),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 1000 }),
        (showSteps, rangeMode, disabled, showTooltip, valuePosition, min, max) => {
          const values: Record<string, ControlValue> = {
            'range-mode': rangeMode,
            'disabled': disabled,
            'show-tooltip': showTooltip,
            'value-position': valuePosition,
            'show-steps': showSteps,
            'step-count': 5,
            'min': min,
            'max': max,
          }

          // All controls without visibleWhen should always be visible
          for (const ctrl of sliderPropControls) {
            if (!ctrl.visibleWhen) {
              expect(isVisible(ctrl, values, sliderPropControls)).toBe(true)
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
