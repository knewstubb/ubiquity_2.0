import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { globSync } from 'fs'
import path from 'path'

/**
 * Feature: dark-mode-token-migration
 * Property 2: Zero primitive palette variable references in colour-accepting properties
 *
 * Validates: Requirements 2.1, 2.2, 2.3
 *
 * For any CSS Module file in scope (src/components/**\/*.module.css excluding
 * src/components/ui/, and src/pages/**\/*.module.css), scanning for references to
 * var(--color-zinc-*), var(--color-primary-*), or var(--color-grey-*) within
 * colour-accepting CSS property declarations SHALL return zero matches.
 */

const COLOUR_ACCEPTING_PROPERTIES = [
  'color',
  'background-color',
  'background',
  'border-color',
  'border',
  'border-top',
  'border-bottom',
  'border-left',
  'border-right',
  'outline-color',
  'outline',
  'box-shadow',
  'fill',
  'stroke',
  'accent-color',
]

/** Matches var(--color-zinc-*), var(--color-primary-*), var(--color-grey-*) */
const PRIMITIVE_VARIABLE_PATTERN = /var\(--color-(zinc|primary|grey)-[^)]+\)/gi

interface Violation {
  file: string
  line: number
  property: string
  value: string
  match: string
}

function getFilesInScope(): string[] {
  const rootDir = path.resolve(__dirname, '../..')

  const componentFiles = globSync('src/components/**/*.module.css', {
    cwd: rootDir,
    absolute: true,
  }).filter((f) => !f.includes('/components/ui/'))

  const pageFiles = globSync('src/pages/**/*.module.css', {
    cwd: rootDir,
    absolute: true,
  })

  return [...componentFiles, ...pageFiles]
}

function findPrimitiveVariableViolations(filePath: string): Violation[] {
  const content = readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const violations: Violation[] = []
  const relativePath = path.relative(path.resolve(__dirname, '../..'), filePath)

  // Build a regex that matches colour-accepting property declarations
  const propertyPattern = new RegExp(
    `^\\s*(${COLOUR_ACCEPTING_PROPERTIES.join('|')})\\s*:(.+)$`,
    'i'
  )

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const propertyMatch = line.match(propertyPattern)

    if (propertyMatch) {
      const property = propertyMatch[1]
      const value = propertyMatch[2]

      // Reset regex lastIndex for global search
      PRIMITIVE_VARIABLE_PATTERN.lastIndex = 0
      let match: RegExpExecArray | null

      while ((match = PRIMITIVE_VARIABLE_PATTERN.exec(value)) !== null) {
        violations.push({
          file: relativePath,
          line: i + 1,
          property,
          value: value.trim(),
          match: match[0],
        })
      }
    }
  }

  return violations
}

describe('Feature: dark-mode-token-migration, Property 2: Zero primitive palette variable references in colour-accepting properties', () => {
  it('should have zero CSS module files remaining after Tailwind migration (no primitive palette references possible)', () => {
    const files = getFilesInScope()
    // After the Tailwind migration, all CSS modules have been removed.
    // Zero files in scope means zero possible violations — the property holds trivially.
    expect(files).toHaveLength(0)
  })

  it('should have zero primitive palette variable references if any CSS module files exist', () => {
    const files = getFilesInScope()

    // If no CSS modules exist, the property holds trivially
    if (files.length === 0) {
      return
    }

    const allViolations: Violation[] = []

    for (const file of files) {
      const violations = findPrimitiveVariableViolations(file)
      allViolations.push(...violations)
    }

    if (allViolations.length > 0) {
      const report = allViolations
        .map(
          (v) =>
            `  ${v.file}:${v.line} — ${v.property}: found "${v.match}" in "${v.value}"`
        )
        .join('\n')

      expect.fail(
        `Found ${allViolations.length} primitive palette variable reference(s) in colour-accepting properties:\n${report}`
      )
    }

    expect(allViolations).toHaveLength(0)
  })
})
