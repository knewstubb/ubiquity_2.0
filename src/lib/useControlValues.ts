import { useState, useCallback, useMemo, useRef } from 'react'
import type { PropDefinition } from '../data/componentRegistry'

export interface UseControlValuesReturn {
  values: Record<string, string | number | boolean>
  setValue: (name: string, value: string | number | boolean) => void
  resetAll: () => void
  isDirty: boolean
}

/**
 * Builds a defaults record from an array of PropDefinitions,
 * mapping each `name` to its `defaultValue`.
 */
function buildDefaults(propControls: PropDefinition[]): Record<string, string | number | boolean> {
  const defaults: Record<string, string | number | boolean> = {}
  for (const prop of propControls) {
    defaults[prop.name] = prop.defaultValue
  }
  return defaults
}

/**
 * Custom hook for managing component prop control values.
 *
 * Initialises state from `propControls[].defaultValue` entries.
 * Re-initialises when the `propControls` reference changes (component navigation).
 * Exposes a `setValue` function for individual updates, a `resetAll` to restore defaults,
 * and an `isDirty` flag that is true when any value differs from its default.
 */
export function useControlValues(propControls: PropDefinition[]): UseControlValuesReturn {
  const prevControlsRef = useRef(propControls)
  const defaultsRef = useRef(buildDefaults(propControls))

  // Re-initialise only when the propControls array actually changes (by content)
  const controlsChanged = propControls !== prevControlsRef.current &&
    (propControls.length !== prevControlsRef.current.length ||
     propControls.some((p, i) => p.name !== prevControlsRef.current[i]?.name))

  if (controlsChanged) {
    prevControlsRef.current = propControls
    defaultsRef.current = buildDefaults(propControls)
  }

  const defaults = defaultsRef.current

  const [values, setValues] = useState<Record<string, string | number | boolean>>(defaults)

  // Re-initialise state when controls change (component navigation)
  const [prevDefaults, setPrevDefaults] = useState(defaults)
  if (defaults !== prevDefaults) {
    setPrevDefaults(defaults)
    setValues(defaults)
  }

  const setValue = useCallback((name: string, value: string | number | boolean) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }, [])

  const resetAll = useCallback(() => {
    setValues(defaults)
  }, [defaults])

  const isDirty = useMemo(() => {
    const keys = Object.keys(defaults)
    return keys.some((key) => values[key] !== defaults[key])
  }, [values, defaults])

  return { values, setValue, resetAll, isDirty }
}
