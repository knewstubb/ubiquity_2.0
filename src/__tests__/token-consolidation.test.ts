import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { COLOUR_TOKEN_GROUPS, DEFAULT_TOKEN_CONFIG } from '../data/defaultTokenConfig'
import { resolveToHex } from '../data/tailwindPalette'

/**
 * Feature: token-management-consolidation
 * Updated after VARIABLE_MAP removal (tailwind-token-migration task 3.1)
 *
 * Tests that COLOUR_TOKEN_GROUPS and DEFAULT_TOKEN_CONFIG are consistent
 * and that all colour entries have valid structure.
 */

describe('Feature: token-management-consolidation — COLOUR_TOKEN_GROUPS completeness', () => {
  function findGroup(name: string) {
    return COLOUR_TOKEN_GROUPS.find((g) => g.name === name)
  }

  it('contains a "Border" group with border-strong', () => {
    const group = findGroup('Border')
    expect(group).toBeDefined()
    expect(group!.tokens).toContain('border-strong')
  })

  it('contains a "Destructive" group with destructive, destructive-foreground, destructive-subtle, destructive-border', () => {
    const group = findGroup('Destructive')
    expect(group).toBeDefined()
    expect(group!.tokens).toContain('destructive')
    expect(group!.tokens).toContain('destructive-foreground')
    expect(group!.tokens).toContain('destructive-subtle')
    expect(group!.tokens).toContain('destructive-border')
  })

  it('contains a "Warning" group with warning, warning-foreground, warning-subtle, warning-border', () => {
    const group = findGroup('Warning')
    expect(group).toBeDefined()
    expect(group!.tokens).toContain('warning')
    expect(group!.tokens).toContain('warning-foreground')
    expect(group!.tokens).toContain('warning-subtle')
    expect(group!.tokens).toContain('warning-border')
  })

  it('contains a "Success" group with success, success-foreground, success-subtle, success-border', () => {
    const group = findGroup('Success')
    expect(group).toBeDefined()
    expect(group!.tokens).toContain('success')
    expect(group!.tokens).toContain('success-foreground')
    expect(group!.tokens).toContain('success-subtle')
    expect(group!.tokens).toContain('success-border')
  })

  it('contains an "Info" group with info, info-foreground, info-subtle, info-border', () => {
    const group = findGroup('Info')
    expect(group).toBeDefined()
    expect(group!.tokens).toContain('info')
    expect(group!.tokens).toContain('info-foreground')
    expect(group!.tokens).toContain('info-subtle')
    expect(group!.tokens).toContain('info-border')
  })
})

describe('Feature: token-management-consolidation — DEFAULT_TOKEN_CONFIG.colours completeness', () => {
  it('contains core canonical tokens with valid { light, dark } structure', () => {
    const coreTokens = [
      'background', 'foreground', 'card', 'card-foreground',
      'primary', 'primary-foreground',
      'secondary', 'secondary-foreground',
      'muted', 'muted-foreground', 'tertiary-foreground',
      'accent', 'accent-foreground', 'accent-hover',
      'destructive', 'destructive-foreground', 'destructive-subtle', 'destructive-border',
      'warning', 'warning-foreground', 'warning-subtle', 'warning-border',
      'success', 'success-foreground', 'success-subtle', 'success-border',
      'info', 'info-foreground', 'info-subtle', 'info-border',
      'border', 'input', 'ring', 'border-strong',
      'disabled', 'disabled-foreground',
      'background-sunken', 'background-elevated', 'text-inverse',
      'danger-hover', 'danger-text',
      'neutral-hover', 'neutral-subtle', 'neutral-text', 'neutral-border',
    ]

    for (const token of coreTokens) {
      const entry = DEFAULT_TOKEN_CONFIG.colours[token]
      expect(entry, `Missing entry for "${token}"`).toBeDefined()
      expect(entry).toHaveProperty('light')
      expect(entry).toHaveProperty('dark')
      expect(typeof entry.light).toBe('string')
      expect(typeof entry.dark).toBe('string')
    }
  })

  it('all primitive refs resolve to hex via resolveToHex', () => {
    for (const [token, entry] of Object.entries(DEFAULT_TOKEN_CONFIG.colours)) {
      const lightHex = resolveToHex(entry.light)
      const darkHex = resolveToHex(entry.dark)
      expect(lightHex, `"${token}" light ref "${entry.light}" did not resolve to hex`).not.toBeNull()
      expect(darkHex, `"${token}" dark ref "${entry.dark}" did not resolve to hex`).not.toBeNull()
    }
  })

  it('does NOT contain removed UDS-named tokens', () => {
    const removedTokens = [
      'accent-subtle', 'accent-text', 'accent-border',
      'border-focus', 'background-subtle',
      'text-tertiary', 'text-disabled', 'text-on-accent',
      'state-disabled-bg', 'state-disabled-text',
      'danger-subtle', 'danger-border',
      'neutral-default',
    ]

    for (const token of removedTokens) {
      expect(DEFAULT_TOKEN_CONFIG.colours[token], `"${token}" should have been removed`).toBeUndefined()
    }
  })
})

/**
 * Feature: token-management-consolidation, Property 4: Export Structure Invariant
 *
 * For every colour token in DEFAULT_TOKEN_CONFIG, verify the entry has
 * { light, dark } structure where both values are valid PrimitiveRefs
 * that resolve to hex via resolveToHex.
 *
 * Validates: Requirements 12.1, 12.2, 12.3
 */
describe('Feature: token-management-consolidation, Property 4: Export Structure Invariant', () => {
  it('every colour token has a valid { light, dark } structure with resolvable refs', () => {
    const tokenNames = Object.keys(DEFAULT_TOKEN_CONFIG.colours)

    fc.assert(
      fc.property(
        fc.constantFrom(...tokenNames),
        (tokenName: string) => {
          const entry = DEFAULT_TOKEN_CONFIG.colours[tokenName]

          // Entry must have a `light` property that is a string
          expect(entry).toHaveProperty('light')
          expect(typeof entry.light).toBe('string')

          // Entry must have a `dark` property that is a string
          expect(entry).toHaveProperty('dark')
          expect(typeof entry.dark).toBe('string')

          // resolveToHex(entry.light) returns a non-null hex string
          const lightHex = resolveToHex(entry.light)
          expect(lightHex, `"${tokenName}" light ref "${entry.light}" did not resolve to hex`).not.toBeNull()
          expect(typeof lightHex).toBe('string')
          expect(lightHex!).toMatch(/^#[0-9A-Fa-f]{6}$/)

          // resolveToHex(entry.dark) returns a non-null hex string
          const darkHex = resolveToHex(entry.dark)
          expect(darkHex, `"${tokenName}" dark ref "${entry.dark}" did not resolve to hex`).not.toBeNull()
          expect(typeof darkHex).toBe('string')
          expect(darkHex!).toMatch(/^#[0-9A-Fa-f]{6}$/)
        }
      ),
      { numRuns: 100 }
    )
  })
})


/**
 * Feature: tailwind-token-migration, Task 3.8: No VARIABLE_MAP export
 *
 * 1. Verify defaultTokenConfig.ts does NOT export VARIABLE_MAP
 * 2. Verify Token Manager injection sets exactly one CSS variable per token update
 *
 * **Validates: Requirements 4.1, 4.3**
 */
describe('Feature: tailwind-token-migration — No VARIABLE_MAP export', () => {
  it('defaultTokenConfig.ts does not export VARIABLE_MAP', () => {
    const filePath = resolve(__dirname, '../data/defaultTokenConfig.ts')
    const source = readFileSync(filePath, 'utf-8')

    // Check for various export patterns
    expect(source).not.toMatch(/export\s+const\s+VARIABLE_MAP/)
    expect(source).not.toMatch(/export\s+\{[^}]*VARIABLE_MAP[^}]*\}/)
    expect(source).not.toMatch(/export\s+default\s+VARIABLE_MAP/)
    expect(source).not.toMatch(/export\s+let\s+VARIABLE_MAP/)
    expect(source).not.toMatch(/export\s+var\s+VARIABLE_MAP/)
  })

  it('defaultTokenConfig.ts does not define VARIABLE_MAP at all', () => {
    const filePath = resolve(__dirname, '../data/defaultTokenConfig.ts')
    const source = readFileSync(filePath, 'utf-8')

    // Should not contain any VARIABLE_MAP definition
    expect(source).not.toMatch(/\bVARIABLE_MAP\b/)
  })
})

describe('Feature: tailwind-token-migration — Single CSS variable injection per token update', () => {
  let setPropertySpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    document.documentElement.removeAttribute('style')
    document.documentElement.removeAttribute('data-theme')
    setPropertySpy = vi.spyOn(document.documentElement.style, 'setProperty')
  })

  afterEach(() => {
    setPropertySpy.mockRestore()
    document.documentElement.removeAttribute('style')
    document.documentElement.removeAttribute('data-theme')
  })

  it('injectColourVariables sets exactly one CSS variable per token (no aliases)', async () => {
    // Dynamically import to get the injection function indirectly via the hook
    const { renderHook, act } = await import('@testing-library/react')
    const { useTokenConfig } = await import('../lib/useTokenConfig')

    const { result } = renderHook(() => useTokenConfig())

    // Clear spy calls from initial mount injection
    setPropertySpy.mockClear()

    // Pick a specific token and update it
    const tokenName = 'primary'
    const newRef = 'blue-500'

    act(() => {
      result.current.updateColour(tokenName, 'light', newRef)
    })

    // After updateColour, the hook re-injects ALL colour variables.
    // For each token in config, exactly one setProperty call should be made
    // with the pattern --{tokenName}. No legacy --color-* aliases should appear.
    const colourCalls = setPropertySpy.mock.calls.filter(
      ([name]) => typeof name === 'string' && !name.startsWith('--spacing-') && !name.startsWith('--radius') && !name.startsWith('--font-size-')
    )

    // Verify no legacy --color-* aliases were injected
    const legacyCalls = colourCalls.filter(
      ([name]) => typeof name === 'string' && name.startsWith('--color-')
    )
    expect(legacyCalls).toHaveLength(0)

    // Verify the updated token was set with the correct value
    const primaryCalls = colourCalls.filter(
      ([name]) => name === `--${tokenName}`
    )
    expect(primaryCalls).toHaveLength(1)
    expect(primaryCalls[0][1]).toBe('#3B82F6') // blue-500 hex
  })

  it('each token in config produces exactly one CSS variable call during injection', async () => {
    const { renderHook, act } = await import('@testing-library/react')
    const { useTokenConfig } = await import('../lib/useTokenConfig')

    const { result } = renderHook(() => useTokenConfig())

    // Clear spy calls from initial mount injection
    setPropertySpy.mockClear()

    // Trigger a re-injection by updating any token
    act(() => {
      result.current.updateColour('destructive', 'light', 'red-600')
    })

    // Count how many times each colour variable was set
    const colourCalls = setPropertySpy.mock.calls.filter(
      ([name]) => typeof name === 'string' && !name.startsWith('--spacing-') && !name.startsWith('--radius') && !name.startsWith('--font-size-')
    )

    // Each token name should appear at most once
    const varNameCounts = new Map<string, number>()
    for (const [name] of colourCalls) {
      const count = varNameCounts.get(name as string) ?? 0
      varNameCounts.set(name as string, count + 1)
    }

    for (const [varName, count] of varNameCounts) {
      expect(count, `CSS variable "${varName}" was set ${count} times, expected 1`).toBe(1)
    }
  })
})
