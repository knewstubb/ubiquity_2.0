import { useState, useEffect, useCallback, useRef } from 'react'
import type { TokenConfig, PrimitiveRef, UseTokenConfigReturn } from '../models/tokenConfig'
import { resolveToHex } from '../data/tailwindPalette'
import { DEFAULT_TOKEN_CONFIG } from '../data/defaultTokenConfig'

const STORAGE_KEY = 'ubiquity-token-config'

/**
 * Reads and parses the token config from localStorage.
 * Falls back to defaults if the stored value is missing or corrupted.
 */
function readFromStorage(): TokenConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(DEFAULT_TOKEN_CONFIG)
    const parsed = JSON.parse(raw) as TokenConfig
    // Merge with defaults to ensure all keys exist
    return mergeWithDefaults(parsed)
  } catch {
    // Corrupted JSON — remove bad key and fall back to defaults
    localStorage.removeItem(STORAGE_KEY)
    return structuredClone(DEFAULT_TOKEN_CONFIG)
  }
}

/**
 * Deep-merges a partial config with defaults so that missing keys
 * are filled in from DEFAULT_TOKEN_CONFIG.
 * Also migrates deprecated primitive references (e.g. white-50 → white).
 */
function mergeWithDefaults(partial: Partial<TokenConfig>): TokenConfig {
  const defaults = structuredClone(DEFAULT_TOKEN_CONFIG)
  const merged = {
    colours: { ...defaults.colours, ...(partial.colours ?? {}) },
    spacing: { ...defaults.spacing, ...(partial.spacing ?? {}) },
    radius: { base: partial.radius?.base ?? defaults.radius.base },
    typography: {
      fontSizes: {
        ...defaults.typography.fontSizes,
        ...(partial.typography?.fontSizes ?? {}),
      },
    },
  }

  // Migrate deprecated references
  for (const [key, value] of Object.entries(merged.colours)) {
    if (value.light === 'white-50') value.light = 'white'
    if (value.dark === 'white-50') value.dark = 'white'
  }

  return merged
}

/**
 * Writes the config to localStorage.
 */
function writeToStorage(config: TokenConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

/**
 * Determines the current theme mode from the document root.
 */
function getCurrentMode(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

/**
 * Injects a single CSS variable onto the document root.
 */
function setCSSVariable(name: string, value: string): void {
  document.documentElement.style.setProperty(name, value)
}

/**
 * Injects all colour CSS variables for the current mode.
 */
function injectColourVariables(config: TokenConfig): void {
  const mode = getCurrentMode()

  for (const [tokenName, colourValue] of Object.entries(config.colours)) {
    const ref = colourValue[mode]
    const hex = resolveToHex(ref)
    if (!hex) continue

    setCSSVariable(`--${tokenName}`, hex)
  }
}

/**
 * Injects spacing CSS variables.
 */
function injectSpacingVariables(config: TokenConfig): void {
  for (const [tokenName, value] of Object.entries(config.spacing)) {
    setCSSVariable(`--spacing-${tokenName}`, `${value}px`)
  }
}

/**
 * Injects radius CSS variables (base + derived).
 */
function injectRadiusVariables(config: TokenConfig): void {
  const base = config.radius.base
  setCSSVariable('--radius', `${base}px`)
  setCSSVariable('--radius-none', '0px')
  setCSSVariable('--radius-sm', `${base * 0.6}px`)
  setCSSVariable('--radius-md', `${base * 0.8}px`)
  setCSSVariable('--radius-lg', `${base}px`)
  setCSSVariable('--radius-xl', `${base * 1.4}px`)
  setCSSVariable('--radius-full', '9999px')
}

/**
 * Injects font size CSS variables.
 */
function injectFontSizeVariables(config: TokenConfig): void {
  for (const [tokenName, value] of Object.entries(config.typography.fontSizes)) {
    setCSSVariable(`--font-size-${tokenName}`, `${value}px`)
  }
}

/**
 * Injects all CSS variables from the config.
 */
function injectAllVariables(config: TokenConfig): void {
  injectColourVariables(config)
  injectSpacingVariables(config)
  injectRadiusVariables(config)
  injectFontSizeVariables(config)
}

/**
 * Clears all inline styles set by the token manager on the document root.
 */
function clearAllInlineStyles(): void {
  document.documentElement.removeAttribute('style')
}

/**
 * Custom hook for managing design token configuration.
 *
 * Reads from localStorage on mount, merges with defaults, and injects
 * CSS variables. On every change: updates state → writes to localStorage
 * → re-injects CSS variables.
 */
export function useTokenConfig(): UseTokenConfigReturn {
  const [config, setConfig] = useState<TokenConfig>(readFromStorage)
  const configRef = useRef(config)
  const isResetRef = useRef(false)

  // Keep ref in sync with state
  useEffect(() => {
    configRef.current = config
  }, [config])

  // Inject all CSS variables on mount and whenever config changes
  // Skip injection after a reset (styles were already cleared)
  useEffect(() => {
    if (isResetRef.current) {
      isResetRef.current = false
      return
    }
    injectAllVariables(config)
  }, [config])

  // Listen for theme changes (data-theme attribute) and re-inject colours
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-theme'
        ) {
          injectColourVariables(configRef.current)
        }
      }
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    return () => observer.disconnect()
  }, [])

  const updateColour = useCallback(
    (tokenName: string, mode: 'light' | 'dark', value: PrimitiveRef) => {
      // Validate the primitive reference resolves to a hex value
      const hex = resolveToHex(value)
      if (!hex) return // Reject invalid references

      setConfig((prev) => {
        const existing = prev.colours[tokenName]
        if (!existing) return prev

        const updated: TokenConfig = {
          ...prev,
          colours: {
            ...prev.colours,
            [tokenName]: {
              ...existing,
              [mode]: value,
            },
          },
        }
        writeToStorage(updated)
        return updated
      })
    },
    []
  )

  const updateSpacing = useCallback((tokenName: string, value: number) => {
    if (value < 0 || !Number.isFinite(value)) return

    setConfig((prev) => {
      const updated: TokenConfig = {
        ...prev,
        spacing: {
          ...prev.spacing,
          [tokenName]: value,
        },
      }
      writeToStorage(updated)
      return updated
    })
  }, [])

  const updateRadius = useCallback((base: number) => {
    if (base < 0 || !Number.isFinite(base)) return

    setConfig((prev) => {
      const updated: TokenConfig = {
        ...prev,
        radius: { base },
      }
      writeToStorage(updated)
      return updated
    })
  }, [])

  const updateFontSize = useCallback((tokenName: string, value: number) => {
    if (value < 0 || !Number.isFinite(value)) return

    setConfig((prev) => {
      const updated: TokenConfig = {
        ...prev,
        typography: {
          ...prev.typography,
          fontSizes: {
            ...prev.typography.fontSizes,
            [tokenName]: value,
          },
        },
      }
      writeToStorage(updated)
      return updated
    })
  }, [])

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    clearAllInlineStyles()
    isResetRef.current = true
    setConfig(structuredClone(DEFAULT_TOKEN_CONFIG))
  }, [])

  const exportJSON = useCallback(() => {
    const json = JSON.stringify(config, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'token-config.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [config])

  return {
    config,
    updateColour,
    updateSpacing,
    updateRadius,
    updateFontSize,
    reset,
    exportJSON,
  }
}
