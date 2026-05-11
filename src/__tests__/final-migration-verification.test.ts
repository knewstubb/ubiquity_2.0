import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { globSync } from 'fs'
import path from 'path'

/**
 * Final Migration Verification
 *
 * Validates: Requirements 2.3, 3.7, 6.1, 6.2, 6.3
 *
 * Verifies the Tailwind token migration is complete:
 * - Zero .module.css files in src/
 * - tokens.css removed
 * - Steering files updated to reflect single styling system
 */

const ROOT_DIR = path.resolve(__dirname, '../..')

describe('Final migration verification', () => {
  it('should have zero .module.css files in src/', () => {
    const moduleCssFiles = globSync('src/**/*.module.css', {
      cwd: ROOT_DIR,
      absolute: true,
    })

    if (moduleCssFiles.length > 0) {
      const relativePaths = moduleCssFiles.map((f) =>
        path.relative(ROOT_DIR, f)
      )
      expect.fail(
        `Found ${moduleCssFiles.length} .module.css file(s) that should have been removed:\n  ${relativePaths.join('\n  ')}`
      )
    }

    expect(moduleCssFiles).toHaveLength(0)
  })

  it('should not have src/styles/tokens.css', () => {
    const tokensPath = path.resolve(ROOT_DIR, 'src/styles/tokens.css')
    expect(existsSync(tokensPath)).toBe(false)
  })

  it('tech-stack.md should mention "single styling mechanism"', () => {
    const techStackPath = path.resolve(ROOT_DIR, '.kiro/steering/tech-stack.md')
    expect(existsSync(techStackPath)).toBe(true)

    const content = readFileSync(techStackPath, 'utf-8')
    expect(content.toLowerCase()).toContain('single styling mechanism')
  })

  it('project-structure.md should not reference CSS Modules as a styling approach', () => {
    const projectStructurePath = path.resolve(
      ROOT_DIR,
      '.kiro/steering/project-structure.md'
    )
    expect(existsSync(projectStructurePath)).toBe(true)

    const content = readFileSync(projectStructurePath, 'utf-8')

    // Should NOT contain CSS Modules as a recommended/active styling approach
    // It's acceptable to mention it in a "don't use" context (e.g. "no CSS Modules")
    // but it should not describe CSS Modules as the co-located styling pattern
    expect(content).not.toMatch(/\.module\.css/)
    expect(content).not.toMatch(
      /CSS Modules.*co-locat/i
    )

    // Verify it now describes Tailwind as the styling approach
    expect(content.toLowerCase()).toContain('tailwind')
  })
})
