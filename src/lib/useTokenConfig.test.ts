import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTokenConfig } from './useTokenConfig'
import { DEFAULT_TOKEN_CONFIG } from '../data/defaultTokenConfig'

const STORAGE_KEY = 'ubiquity-token-config'

describe('useTokenConfig', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('style')
    document.documentElement.removeAttribute('data-theme')
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('style')
    document.documentElement.removeAttribute('data-theme')
  })

  it('initialises with default config when localStorage is empty', () => {
    const { result } = renderHook(() => useTokenConfig())
    expect(result.current.config).toEqual(DEFAULT_TOKEN_CONFIG)
  })

  it('reads saved config from localStorage on mount', () => {
    const customConfig = {
      ...DEFAULT_TOKEN_CONFIG,
      spacing: { ...DEFAULT_TOKEN_CONFIG.spacing, xxs: 10 },
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customConfig))

    const { result } = renderHook(() => useTokenConfig())
    expect(result.current.config.spacing.xxs).toBe(10)
  })

  it('falls back to defaults when localStorage contains corrupted JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json!!!')

    const { result } = renderHook(() => useTokenConfig())
    expect(result.current.config).toEqual(DEFAULT_TOKEN_CONFIG)
    // Corrupted key should be removed
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('updateColour persists to localStorage and injects CSS variable', () => {
    const { result } = renderHook(() => useTokenConfig())

    act(() => {
      result.current.updateColour('primary', 'light', 'red-500')
    })

    expect(result.current.config.colours.primary.light).toBe('red-500')
    // Check localStorage was updated
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(stored.colours.primary.light).toBe('red-500')
    // Check CSS variable was injected (light mode is default)
    const cssValue = document.documentElement.style.getPropertyValue('--primary')
    expect(cssValue).toBe('#EF4444')
  })

  it('updateColour rejects invalid primitive references', () => {
    const { result } = renderHook(() => useTokenConfig())

    act(() => {
      result.current.updateColour('primary', 'light', 'invalid-ref')
    })

    // Should remain unchanged
    expect(result.current.config.colours.primary.light).toBe('mint-500')
  })

  it('updateColour does not change the opposite mode value', () => {
    const { result } = renderHook(() => useTokenConfig())
    const originalDark = result.current.config.colours.primary.dark

    act(() => {
      result.current.updateColour('primary', 'light', 'blue-600')
    })

    expect(result.current.config.colours.primary.dark).toBe(originalDark)
  })

  it('updateColour injects single canonical CSS variable (no dual injection)', () => {
    const { result } = renderHook(() => useTokenConfig())

    act(() => {
      result.current.updateColour('primary', 'light', 'blue-500')
    })

    // Single injection: only --primary is set, no legacy aliases
    const primary = document.documentElement.style.getPropertyValue('--primary')
    expect(primary).toBe('#3B82F6')
    // Legacy alias should NOT be set (VARIABLE_MAP removed)
    const accent = document.documentElement.style.getPropertyValue('--color-accent-default')
    expect(accent).toBe('')
  })

  it('updateSpacing persists and injects CSS variable', () => {
    const { result } = renderHook(() => useTokenConfig())

    act(() => {
      result.current.updateSpacing('md', 20)
    })

    expect(result.current.config.spacing.md).toBe(20)
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(stored.spacing.md).toBe(20)
    const cssValue = document.documentElement.style.getPropertyValue('--spacing-md')
    expect(cssValue).toBe('20px')
  })

  it('updateSpacing rejects negative values', () => {
    const { result } = renderHook(() => useTokenConfig())

    act(() => {
      result.current.updateSpacing('md', -5)
    })

    expect(result.current.config.spacing.md).toBe(16) // unchanged
  })

  it('updateRadius persists and injects derived CSS variables', () => {
    const { result } = renderHook(() => useTokenConfig())

    act(() => {
      result.current.updateRadius(10)
    })

    expect(result.current.config.radius.base).toBe(10)
    expect(document.documentElement.style.getPropertyValue('--radius')).toBe('10px')
    expect(document.documentElement.style.getPropertyValue('--radius-sm')).toBe('6px')
    expect(document.documentElement.style.getPropertyValue('--radius-md')).toBe('8px')
    expect(document.documentElement.style.getPropertyValue('--radius-lg')).toBe('10px')
    expect(document.documentElement.style.getPropertyValue('--radius-xl')).toBe('14px')
    expect(document.documentElement.style.getPropertyValue('--radius-full')).toBe('9999px')
  })

  it('updateFontSize persists and injects CSS variable', () => {
    const { result } = renderHook(() => useTokenConfig())

    act(() => {
      result.current.updateFontSize('base', 16)
    })

    expect(result.current.config.typography.fontSizes.base).toBe(16)
    const cssValue = document.documentElement.style.getPropertyValue('--font-size-base')
    expect(cssValue).toBe('16px')
  })

  it('reset clears localStorage, resets state, and clears inline styles', () => {
    const { result } = renderHook(() => useTokenConfig())

    // Make a change first
    act(() => {
      result.current.updateColour('primary', 'light', 'red-500')
    })
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
    expect(result.current.config.colours.primary.light).toBe('red-500')

    // Reset
    act(() => {
      result.current.reset()
    })

    expect(result.current.config).toEqual(DEFAULT_TOKEN_CONFIG)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    // Inline styles should be cleared (page falls back to stylesheet defaults)
    expect(document.documentElement.getAttribute('style')).toBeNull()
  })

  it('exportJSON triggers a file download', () => {
    const { result } = renderHook(() => useTokenConfig())

    // Mock URL and link click
    const createObjectURL = vi.fn(() => 'blob:test')
    const revokeObjectURL = vi.fn()
    global.URL.createObjectURL = createObjectURL
    global.URL.revokeObjectURL = revokeObjectURL

    const clickSpy = vi.fn()
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      if (node instanceof HTMLAnchorElement) {
        node.click = clickSpy
      }
      return node
    })
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node)

    act(() => {
      result.current.exportJSON()
    })

    expect(createObjectURL).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalled()

    appendChildSpy.mockRestore()
    removeChildSpy.mockRestore()
  })

  it('injects dark mode values when data-theme is dark', () => {
    document.documentElement.setAttribute('data-theme', 'dark')
    const { result } = renderHook(() => useTokenConfig())

    // In dark mode, background should use the dark value
    act(() => {
      result.current.updateColour('background', 'dark', 'zinc-950')
    })

    const cssValue = document.documentElement.style.getPropertyValue('--background')
    expect(cssValue).toBe('#09090B')
  })

  it('merges partial localStorage config with defaults', () => {
    // Store only a partial config
    const partial = { colours: { primary: { light: 'blue-500', dark: 'blue-400' } } }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(partial))

    const { result } = renderHook(() => useTokenConfig())

    // Should have the override
    expect(result.current.config.colours.primary.light).toBe('blue-500')
    // Should still have defaults for other tokens
    expect(result.current.config.spacing).toEqual(DEFAULT_TOKEN_CONFIG.spacing)
    expect(result.current.config.radius).toEqual(DEFAULT_TOKEN_CONFIG.radius)
  })
})
