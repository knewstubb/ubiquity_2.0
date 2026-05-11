import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Feature: tailwind-token-migration, Property 1: Zero CSS Modules Remaining
 *
 * For any file in src/components/ or src/pages/, the file SHALL NOT be a
 * .module.css file, and no .tsx file SHALL contain an import statement
 * referencing a .module.css file.
 *
 * **Validates: Requirements 3.1, 3.2, 3.4, 3.7, 8.3**
 */

const SRC_ROOT = path.resolve(__dirname, '..')

/** Recursively collect all files under a directory */
function collectFiles(dir: string): string[] {
  const results: string[] = []
  if (!fs.existsSync(dir)) return results

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath))
    } else {
      results.push(fullPath)
    }
  }
  return results
}

/** Get all files in src/components/ and src/pages/ */
function getFilesInScope(): string[] {
  const componentsDir = path.join(SRC_ROOT, 'components')
  const pagesDir = path.join(SRC_ROOT, 'pages')
  return [...collectFiles(componentsDir), ...collectFiles(pagesDir)]
}

/** Get all .tsx files in src/components/ and src/pages/ */
function getTsxFiles(): string[] {
  return getFilesInScope().filter((f) => f.endsWith('.tsx'))
}

/** Get all .module.css files in src/components/ and src/pages/ */
function getModuleCssFiles(): string[] {
  return getFilesInScope().filter((f) => f.endsWith('.module.css'))
}

/** Pattern matching import of a .module.css file */
const MODULE_CSS_IMPORT_PATTERN = /import\s+\w+\s+from\s+['"][^'"]*\.module\.css['"]/

describe('Feature: tailwind-token-migration, Property 1: Zero CSS Modules Remaining', () => {
  const allFiles = getFilesInScope()
  const moduleCssFiles = getModuleCssFiles()
  const tsxFiles = getTsxFiles()

  it('no .module.css files exist in src/components/ or src/pages/', () => {
    if (moduleCssFiles.length > 0) {
      const relativePaths = moduleCssFiles.map((f) =>
        path.relative(SRC_ROOT, f)
      )
      expect.fail(
        `Found ${moduleCssFiles.length} .module.css file(s):\n  ${relativePaths.join('\n  ')}`
      )
    }
    expect(moduleCssFiles).toHaveLength(0)
  })

  it('no .tsx file contains an import referencing a .module.css file', () => {
    const violations: { file: string; line: number; content: string }[] = []

    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, 'utf-8')
      const lines = content.split('\n')

      for (let i = 0; i < lines.length; i++) {
        if (MODULE_CSS_IMPORT_PATTERN.test(lines[i])) {
          violations.push({
            file: path.relative(SRC_ROOT, file),
            line: i + 1,
            content: lines[i].trim(),
          })
        }
      }
    }

    if (violations.length > 0) {
      const report = violations
        .map((v) => `  ${v.file}:${v.line} — ${v.content}`)
        .join('\n')
      expect.fail(
        `Found ${violations.length} .module.css import(s) in .tsx files:\n${report}`
      )
    }
    expect(violations).toHaveLength(0)
  })

  it('property holds for random subsets of files — no .module.css files exist', () => {
    // Use fast-check to verify the property across random subsets of all files
    if (allFiles.length === 0) return

    const arbFileSubset = fc.subarray(allFiles, { minLength: 1 })

    fc.assert(
      fc.property(arbFileSubset, (subset) => {
        for (const file of subset) {
          expect(file.endsWith('.module.css')).toBe(false)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('property holds for random subsets of .tsx files — no .module.css imports', () => {
    if (tsxFiles.length === 0) return

    const arbTsxSubset = fc.subarray(tsxFiles, { minLength: 1 })

    fc.assert(
      fc.property(arbTsxSubset, (subset) => {
        for (const file of subset) {
          const content = fs.readFileSync(file, 'utf-8')
          const lines = content.split('\n')

          for (const line of lines) {
            expect(MODULE_CSS_IMPORT_PATTERN.test(line)).toBe(false)
          }
        }
      }),
      { numRuns: 100 }
    )
  })
})
