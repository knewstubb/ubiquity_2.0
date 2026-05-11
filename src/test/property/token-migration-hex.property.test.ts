import { describe, it, expect } from 'vitest';
import { readFileSync, globSync } from 'node:fs';
import path from 'node:path';

/**
 * Property 1: Zero hardcoded hex colours in colour-accepting properties
 *
 * For any CSS Module file in scope (src/components/**\/*.module.css excluding
 * src/components/ui/, and src/pages/**\/*.module.css), a case-insensitive regex
 * scan for #[0-9a-fA-F]{3,8} within colour-accepting CSS property declarations
 * SHALL return zero matches.
 *
 * **Validates: Requirements 1.1, 1.5**
 *
 * Feature: dark-mode-token-migration, Property 1: Zero hardcoded hex colours in colour-accepting properties
 */

/** Colour-accepting CSS properties that should not contain hardcoded hex values */
const COLOUR_PROPERTIES = [
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
];

/** Regex to match a CSS property declaration with a colour-accepting property */
const PROPERTY_PATTERN = new RegExp(
  `^\\s*(${COLOUR_PROPERTIES.join('|')})\\s*:(.+)$`,
  'i',
);

/** Regex to detect hardcoded hex colour values */
const HEX_COLOUR_PATTERN = /#[0-9a-fA-F]{3,8}/g;

interface Violation {
  file: string;
  line: number;
  property: string;
  value: string;
  hexMatch: string;
}

function findHexViolations(filePath: string, rootDir: string): Violation[] {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const violations: Violation[] = [];
  const relativePath = path.relative(rootDir, filePath);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = PROPERTY_PATTERN.exec(line);
    if (!match) continue;

    const property = match[1];
    const value = match[2];

    // Find all hex colour matches in the value portion
    const hexMatches = value.match(HEX_COLOUR_PATTERN);
    if (hexMatches) {
      for (const hexMatch of hexMatches) {
        violations.push({
          file: relativePath,
          line: i + 1,
          property,
          value: value.trim(),
          hexMatch,
        });
      }
    }
  }

  return violations;
}

function getInScopeFiles(rootDir: string): string[] {
  const componentFiles = globSync('src/components/**/*.module.css', { cwd: rootDir })
    .filter((f: string) => !f.includes('/components/ui/'))
    .map((f: string) => path.resolve(rootDir, f));

  const pageFiles = globSync('src/pages/**/*.module.css', { cwd: rootDir })
    .map((f: string) => path.resolve(rootDir, f));

  return [...componentFiles, ...pageFiles].sort();
}

describe('Property 1: Zero hardcoded hex colours in colour-accepting properties', () => {
  it('should have zero CSS module files remaining after Tailwind migration', () => {
    const rootDir = process.cwd();
    const files = getInScopeFiles(rootDir);
    // After the Tailwind migration, all CSS modules have been removed.
    // Zero files in scope means zero possible violations — the property holds trivially.
    expect(files).toHaveLength(0);
  });

  it('all in-scope CSS module files contain zero hardcoded hex colour values in colour-accepting properties', () => {
    const rootDir = process.cwd();
    const files = getInScopeFiles(rootDir);

    // If no CSS modules exist, the property holds trivially
    if (files.length === 0) {
      return;
    }

    const allViolations: Violation[] = [];

    for (const file of files) {
      const violations = findHexViolations(file, rootDir);
      allViolations.push(...violations);
    }

    if (allViolations.length > 0) {
      const report = allViolations
        .map(
          (v) =>
            `  ${v.file}:${v.line} — property "${v.property}" contains hex "${v.hexMatch}" in value: ${v.value}`,
        )
        .join('\n');

      expect.fail(
        `Found ${allViolations.length} hardcoded hex colour(s) in colour-accepting properties:\n${report}`,
      );
    }
  });
});
