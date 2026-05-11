import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useTokenConfig } from '../useTokenConfig'
import { DEFAULT_TOKEN_CONFIG } from '../../data/defaultTokenConfig'

/**
 * Task 10.1: Verify live preview and single variable injection
 *
 * Confirms:
 * - Colour changes propagate to the canonical CSS variable (--{tokenName})
 * - Changes apply immediately without page reload
 * - Mode-aware injection (light/dark) works correctly with data-theme attribute
 *
 * Validates: Requirements 3.3, 9.1, 9.2
 */
describe('Live Preview — Single Variable Injection', () => {
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

  it('updateColour("primary", "light", "blue-500") sets --primary to #3B82F6', () => {
    const { result } = renderHook(() => useTokenConfig())

    act(() => {
      result.current.updateColour('primary', 'light', 'blue-500')
    })

    const primary = document.documentElement.style.getPropertyValue('--primary')
    expect(primary).toBe('#3B82F6')
  })

  it('updateColour("background", "light", "zinc-100") sets --background to #F4F4F5', () => {
    const { result } = renderHook(() => useTokenConfig())

    act(() => {
      result.current.updateColour('background', 'light', 'zinc-100')
    })

    const background = document.documentElement.style.getPropertyValue('--background')
    expect(background).toBe('#F4F4F5')
  })

  it('dark mode injection: setting data-theme="dark" and updating dark value injects correctly', () => {
    // Set dark mode
    document.documentElement.setAttribute('data-theme', 'dark')

    const { result } = renderHook(() => useTokenConfig())

    act(() => {
      result.current.updateColour('primary', 'dark', 'red-600')
    })

    // In dark mode, the injected value should be the dark mode hex
    const primary = document.documentElement.style.getPropertyValue('--primary')
    expect(primary).toBe('#DC2626')
  })

  it('changes are immediate — CSS variables are set synchronously after updateColour', () => {
    const { result } = renderHook(() => useTokenConfig())

    act(() => {
      result.current.updateColour('primary', 'light', 'blue-500')
    })

    // Immediately after the act() call, the value should be available
    const value = document.documentElement.style.getPropertyValue('--primary')
    expect(value).toBe('#3B82F6')
  })

  it('each token injects as --{tokenName} on the document root', () => {
    const { result } = renderHook(() => useTokenConfig())

    const testCases: Array<{ token: string; ref: string; expectedHex: string }> = [
      { token: 'foreground', ref: 'zinc-800', expectedHex: '#27272A' },
      { token: 'border', ref: 'zinc-200', expectedHex: '#E4E4E7' },
      { token: 'destructive', ref: 'red-500', expectedHex: '#EF4444' },
    ]

    for (const { token, ref, expectedHex } of testCases) {
      act(() => {
        result.current.updateColour(token, 'light', ref)
      })

      const actual = document.documentElement.style.getPropertyValue(`--${token}`)
      expect(actual, `--${token} should be ${expectedHex}`).toBe(expectedHex)
    }
  })

  it('mode switch re-injects colours for the new mode', async () => {
    const { result } = renderHook(() => useTokenConfig())

    // Set different values for light and dark
    act(() => {
      result.current.updateColour('primary', 'light', 'blue-500')
      result.current.updateColour('primary', 'dark', 'red-600')
    })

    // In light mode (default), should show light value
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('#3B82F6')

    // Switch to dark mode — the MutationObserver in the hook re-injects
    act(() => {
      document.documentElement.setAttribute('data-theme', 'dark')
    })

    // MutationObserver fires asynchronously — wait for the re-injection
    await waitFor(() => {
      expect(document.documentElement.style.getPropertyValue('--primary')).toBe('#DC2626')
    })
  })
})
