import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import fs from 'node:fs'
import path from 'node:path'
import { DEFAULT_TOKEN_CONFIG } from '../data/defaultTokenConfig'

/**
 * Feature: tailwind-token-migration, Property 3: Token Coverage Completeness
 *
 * For any token defined in DEFAULT_TOKEN_CONFIG.colours, there SHALL exist a
 * corresponding CSS variable --{tokenName} in the globals.css :root selector,
 * AND a corresponding --color-{tokenName}: var(--{tokenName}) entry in the
 * @theme inline block.
 *
 * Now that VARIABLE_MAP has been removed, all tokens in DEFAULT_TOKEN_CONFIG
 * are canonical and inject directly as --{tokenName}.
 *
 * **Validates: Requirements 2.1, 2.2**
 */
describe('Feature: tailwind-token-migration, Property 3: Token Coverage Completeness', () => {
  // Read globals.css once at test time
  const globalsPath = path.resolve(__dirname, '../styles/globals.css')
  const globalsContent = fs.readFileSync(globalsPath, 'utf-8')

  // Extract the :root block content
  const rootMatch = globalsContent.match(/:root\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/s)
  const rootContent = rootMatch ? rootMatch[1] : ''

  // Extract the @theme inline block content
  const themeMatch = globalsContent.match(/@theme\s+inline\s*\{([\s\S]*?)\n\}/s)
  const themeContent = themeMatch ? themeMatch[1] : ''

  // All tokens in DEFAULT_TOKEN_CONFIG are now canonical
  const canonicalTokenNames = Object.keys(DEFAULT_TOKEN_CONFIG.colours)

  it('every token in DEFAULT_TOKEN_CONFIG.colours has a --{tokenName} entry in :root', () => {
    expect(canonicalTokenNames.length).toBeGreaterThan(0)
    const arbTokenName = fc.constantFrom(...canonicalTokenNames)

    fc.assert(
      fc.property(arbTokenName, (tokenName) => {
        // :root should contain --{tokenName}: (with some value after the colon)
        const rootVarPattern = new RegExp(`--${escapeRegex(tokenName)}\\s*:`)
        expect(rootContent).toMatch(rootVarPattern)
      }),
      { numRuns: 100 }
    )
  })

  it('every token in DEFAULT_TOKEN_CONFIG.colours has a --color-{tokenName}: var(--{tokenName}) entry in @theme inline', () => {
    expect(canonicalTokenNames.length).toBeGreaterThan(0)
    const arbTokenName = fc.constantFrom(...canonicalTokenNames)

    fc.assert(
      fc.property(arbTokenName, (tokenName) => {
        // @theme inline should contain --color-{tokenName}: var(--{tokenName})
        const themeVarPattern = new RegExp(
          `--color-${escapeRegex(tokenName)}\\s*:\\s*var\\(\\s*--${escapeRegex(tokenName)}\\s*\\)`
        )
        expect(themeContent).toMatch(themeVarPattern)
      }),
      { numRuns: 100 }
    )
  })

  it('random subsets of tokens all satisfy both :root and @theme inline coverage', () => {
    const arbTokenSubset = fc.subarray(canonicalTokenNames, { minLength: 1 })

    fc.assert(
      fc.property(arbTokenSubset, (subset) => {
        for (const tokenName of subset) {
          // Verify :root entry
          const rootVarPattern = new RegExp(`--${escapeRegex(tokenName)}\\s*:`)
          expect(rootContent).toMatch(rootVarPattern)

          // Verify @theme inline entry
          const themeVarPattern = new RegExp(
            `--color-${escapeRegex(tokenName)}\\s*:\\s*var\\(\\s*--${escapeRegex(tokenName)}\\s*\\)`
          )
          expect(themeContent).toMatch(themeVarPattern)
        }
      }),
      { numRuns: 100 }
    )
  })
})

/** Escape special regex characters in a string */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
