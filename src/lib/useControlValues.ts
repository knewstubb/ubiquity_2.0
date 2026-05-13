import { useState, useCallback, useMemo, useRef } from 'react'
import type { PropDefinition, ControlValue } from '../data/componentRegistry'

export type { ControlValue }

export interface UseControlValuesReturn {
  values: Record<string, ControlValue>
  setValue: (name: string, value: ControlValue) => void
  resetAll: () => void
  isDirty: boolean
}

/**
 * Compares two ControlValue values for equality.
 * Uses strict equality for primitives and element-by-element comparison for arrays.
 */
function valuesEqual(a: ControlValue, b: ControlValue): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }
  return a === b
}

/**
 * Builds a defaults record from an array of PropDefinitions,
 * mapping each `name` to its `defaultValue`.
 * Handles all ControlValue types including string[].
 */
function buildDefaults(propControls: PropDefinition[]): Record<string, ControlValue> {
  const defaults: Record<string, ControlValue> = {}
  for (const prop of propControls) {
    defaults[prop.name] = prop.defaultValue
  }
  return defaults
}

/**
 * Evaluates whether a control should be visible based on its `visibleWhen` condition.
 *
 * A control is visible if:
 * - It has no `visibleWhen` property
 * - Its `visibleWhen.controlName` doesn't exist in the propControls array (permanently visible)
 * - The referenced control's current value is included in `visibleWhen.values`
 */
export function isVisible(
  ctrl: PropDefinition,
  values: Record<string, ControlValue>,
  propControls: PropDefinition[]
): boolean {
  if (!ctrl.visibleWhen) return true

  const { controlName, values: acceptableValues } = ctrl.visibleWhen

  // If the referenced control doesn't exist in propControls, treat as permanently visible
  const referencedControlExists = propControls.some((p) => p.name === controlName)
  if (!referencedControlExists) return true

  // Check if the referenced control's current value is in the acceptable values
  const currentValue = values[controlName]
  return acceptableValues.includes(currentValue as string | number | boolean)
}

/**
 * Custom hook for managing component prop control values.
 *
 * Initialises state from `propControls[].defaultValue` entries.
 * Re-initialises when the `propControls` reference changes (component navigation).
 * Exposes a `setValue` function for individual updates, a `resetAll` to restore defaults,
 * and an `isDirty` flag that is true when any value differs from its default.
 *
 * Supports array-typed values (string[]) for chip-array controls, using deep equality
 * (element-by-element comparison) for dirty checking.
 *
 * Handles conditional visibility:
 * - Hidden controls' values are excluded from the exposed `values` record
 * - When a control transitions from hidden → visible, its value resets to `defaultValue`
 */
export function useControlValues(propControls: PropDefinition[] | undefined): UseControlValuesReturn {
  const safeControls = propControls ?? []

  const prevControlsRef = useRef(safeControls)
  const defaultsRef = useRef(buildDefaults(safeControls))

  // Re-initialise only when the propControls array actually changes (by content)
  const controlsChanged = safeControls !== prevControlsRef.current &&
    (safeControls.length !== prevControlsRef.current.length ||
     safeControls.some((p, i) => p.name !== prevControlsRef.current[i]?.name))

  if (controlsChanged) {
    prevControlsRef.current = safeControls
    defaultsRef.current = buildDefaults(safeControls)
  }

  const defaults = defaultsRef.current

  const [values, setValues] = useState<Record<string, ControlValue>>(defaults)

  // Re-initialise state when controls change (component navigation)
  const [prevDefaults, setPrevDefaults] = useState(defaults)
  if (defaults !== prevDefaults) {
    setPrevDefaults(defaults)
    setValues(defaults)
  }

  // Track previous visibility state to detect hidden → visible transitions
  const prevVisibilityRef = useRef<Record<string, boolean>>({})

  // Compute current visibility for each control
  const currentVisibility = useMemo(() => {
    const vis: Record<string, boolean> = {}
    for (const ctrl of safeControls) {
      vis[ctrl.name] = isVisible(ctrl, values, safeControls)
    }
    return vis
  }, [safeControls, values])

  // Detect hidden → visible transitions and reset values to defaults
  const transitionResets = useMemo(() => {
    const resets: Record<string, ControlValue> = {}
    const prevVis = prevVisibilityRef.current

    for (const ctrl of safeControls) {
      const wasVisible = prevVis[ctrl.name]
      const nowVisible = currentVisibility[ctrl.name]

      // Only trigger reset when transitioning from hidden → visible
      // (wasVisible === false means it was previously hidden)
      if (wasVisible === false && nowVisible === true) {
        resets[ctrl.name] = ctrl.defaultValue
      }
    }

    return resets
  }, [safeControls, currentVisibility])

  // Apply transition resets to state
  if (Object.keys(transitionResets).length > 0) {
    // Update the ref before triggering state update to avoid loops
    prevVisibilityRef.current = currentVisibility
    setValues((prev) => ({ ...prev, ...transitionResets }))
  } else {
    // Always keep the ref in sync
    prevVisibilityRef.current = currentVisibility
  }

  const setValue = useCallback((name: string, value: ControlValue) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }, [])

  const resetAll = useCallback(() => {
    setValues(defaults)
  }, [defaults])

  // Filter exposed values to only include visible controls + any dynamic keys
  const exposedValues = useMemo(() => {
    const filtered: Record<string, ControlValue> = {}
    // Include all values from state (covers dynamic renderControls keys)
    for (const [key, val] of Object.entries(values)) {
      filtered[key] = val
    }
    // Remove hidden propControls values
    for (const ctrl of safeControls) {
      if (!currentVisibility[ctrl.name]) {
        delete filtered[ctrl.name]
      }
    }
    return filtered
  }, [safeControls, currentVisibility, values])

  // isDirty is computed against ALL values (including hidden), comparing to defaults
  const isDirty = useMemo(() => {
    const keys = Object.keys(defaults)
    return keys.some((key) => !valuesEqual(values[key], defaults[key]))
  }, [values, defaults])

  return { values: exposedValues, setValue, resetAll, isDirty }
}
