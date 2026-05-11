import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

/**
 * Feature: tailwind-token-migration
 * Unit test: Mint palette in globals.css
 *
 * Validates: Requirements 2.5, 7.1, 8.1
 *
 * Verifies:
 * 1. All 11 mint variables (mint-50 through mint-950) are defined in :root
 * 2. Dark mode overrides exist for every :root token
 * 3. All 11 mint variables are exposed in @theme inline as --color-mint-*
 */

const GLOBALS_CSS_PATH = path.resolve(__dirname, '../styles/globals.css')

const MINT_SHADES = [
  '50', '100', '200', '300', '400', '500',
  '600', '700', '800', '900', '950',
] as const

function readGlobalsCss(): string {
  return readFileSync(GLOBALS_CSS_PATH, 'utf-8')
}

/**
 * Extract the content of a CSS block by its selector.
 * Returns the text between the opening `{` and the matching closing `}`.
 */
function extractBlock(css: string, selectorPattern: RegExp): string | null {
  const match = css.match(selectorPattern)
  if (!match) return null

  const startIndex = css.indexOf('{', match.index!)
  if (startIndex === -1) return null

  let depth = 0
  let endIndex = startIndex
  for (let i = startIndex; i < css.length; i++) {
    if (css[i] === '{') depth++
    if (css[i] === '}') depth--
    if (depth === 0) {
      endIndex = i
      break
    }
  }

  return css.slice(startIndex + 1, endIndex)
}

/**
 * Extract all CSS variable names (--*) defined in a block.
 */
function extractVariableNames(blockContent: string): string[] {
  const varPattern = /^\s*(--[\w-]+)\s*:/gm
  const names: string[] = []
  let match: RegExpExecArray | null
  while ((match = varPattern.exec(blockContent)) !== null) {
    names.push(match[1])
  }
  return names
}

describe('Feature: tailwind-token-migration — Mint palette in globals.css', () => {
  const css = readGlobalsCss()
  const rootBlock = extractBlock(css, /^:root\s*\{/m)
  const darkBlock = extractBlock(css, /\[data-theme="dark"\]\s*\{/)
  const themeBlock = extractBlock(css, /@theme\s+inline\s*\{/)

  describe('Mint palette completeness in :root', () => {
    it('should have all 11 mint variables defined in :root', () => {
      expect(rootBlock).not.toBeNull()

      const rootVars = extractVariableNames(rootBlock!)
      const missingMintVars: string[] = []

      for (const shade of MINT_SHADES) {
        const varName = `--mint-${shade}`
        if (!rootVars.includes(varName)) {
          missingMintVars.push(varName)
        }
      }

      if (missingMintVars.length > 0) {
        expect.fail(
          `Missing mint variables in :root: ${missingMintVars.join(', ')}`
        )
      }

      expect(missingMintVars).toHaveLength(0)
    })
  })

  describe('Dark mode completeness', () => {
    it('should have a dark mode override for every :root token', () => {
      expect(rootBlock).not.toBeNull()
      expect(darkBlock).not.toBeNull()

      const rootVars = extractVariableNames(rootBlock!)
      const darkVars = extractVariableNames(darkBlock!)

      // Exclude --radius from the check — it's a non-colour token that
      // doesn't need a dark override (same value in both modes)
      const NON_COLOUR_TOKENS = ['--radius']
      const rootColourVars = rootVars.filter(
        (v) => !NON_COLOUR_TOKENS.includes(v)
      )

      const missingDarkOverrides: string[] = []
      for (const varName of rootColourVars) {
        if (!darkVars.includes(varName)) {
          missingDarkOverrides.push(varName)
        }
      }

      if (missingDarkOverrides.length > 0) {
        expect.fail(
          `Missing dark mode overrides for ${missingDarkOverrides.length} token(s):\n` +
            missingDarkOverrides.map((v) => `  ${v}`).join('\n')
        )
      }

      expect(missingDarkOverrides).toHaveLength(0)
    })
  })

  describe('Mint palette in @theme inline', () => {
    it('should expose all 11 mint variables in @theme inline as --color-mint-*', () => {
      expect(themeBlock).not.toBeNull()

      const themeVars = extractVariableNames(themeBlock!)
      const missingThemeVars: string[] = []

      for (const shade of MINT_SHADES) {
        const varName = `--color-mint-${shade}`
        if (!themeVars.includes(varName)) {
          missingThemeVars.push(varName)
        }
      }

      if (missingThemeVars.length > 0) {
        expect.fail(
          `Missing mint variables in @theme inline: ${missingThemeVars.join(', ')}`
        )
      }

      expect(missingThemeVars).toHaveLength(0)
    })
  })
})
