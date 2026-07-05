/**
 * @context PrototypePhaseContext
 * @description Manages prototype phase toggles for phased feature rollouts.
 * Each feature area (exporters, filter builder, etc.) has a phase number
 * that controls what functionality is visible in the prototype.
 *
 * Stored in localStorage so it persists across page refreshes.
 * Toggled via the nav bar role/admin switcher.
 *
 * This is NOT the production feature flag system (FeatureFlagContext) —
 * it's a prototype-specific mechanism for demo control.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export interface PrototypePhases {
  exporterPhase: 1 | 2 | 3
}

interface PrototypePhaseContextValue {
  phases: PrototypePhases
  setExporterPhase: (phase: 1 | 2 | 3) => void
}

const STORAGE_KEY = 'ubiquity-prototype-phases'

const DEFAULT_PHASES: PrototypePhases = {
  exporterPhase: 2, // Default to current state (Phase 2 — MVP with multi-source)
}

function loadPhases(): PrototypePhases {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...DEFAULT_PHASES, ...parsed }
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_PHASES
}

function savePhases(phases: PrototypePhases) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(phases))
  } catch {
    // Ignore storage errors
  }
}

const PrototypePhaseContext = createContext<PrototypePhaseContextValue | undefined>(undefined)

export function PrototypePhaseProvider({ children }: { children: ReactNode }) {
  const [phases, setPhases] = useState<PrototypePhases>(loadPhases)

  const setExporterPhase = useCallback((phase: 1 | 2 | 3) => {
    setPhases((prev) => {
      const next = { ...prev, exporterPhase: phase }
      savePhases(next)
      return next
    })
  }, [])

  return (
    <PrototypePhaseContext.Provider value={{ phases, setExporterPhase }}>
      {children}
    </PrototypePhaseContext.Provider>
  )
}

export function usePrototypePhases(): PrototypePhaseContextValue {
  const context = useContext(PrototypePhaseContext)
  if (!context) {
    throw new Error('usePrototypePhases must be used within a PrototypePhaseProvider')
  }
  return context
}
