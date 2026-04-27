#!/usr/bin/env node
/**
 * Generates src/styles/tokens.css from Figma token JSON files.
 * Run: node scripts/generate-tokens.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const lightJson = JSON.parse(readFileSync(resolve(root, 'src/styles/Light Mode.tokens.json'), 'utf8'));

// Step 1: Extract base colour hex values
const baseColors = {};
if (lightJson['base colors']) {
  for (const [palette, shades] of Object.entries(lightJson['base colors'])) {
    baseColors[palette] = {};
    for (const [shade, token] of Object.entries(shades)) {
      if (token.$value?.hex) {
        baseColors[palette][shade] = token.$value.hex;
      }
    }
  }
}

// Step 2: Resolve references like {base colors.zinc.500}
function resolveRef(val) {
  if (typeof val === 'string' && val.startsWith('{')) {
    const path = val.slice(1, -1).split('.');
    if (path[0] === 'base colors' && baseColors[path[1]]) {
      return baseColors[path[1]][path[2]] || val;
    }
  }
  if (typeof val === 'object' && val?.hex) {
    const alpha = val.alpha ?? 1;
    if (alpha < 1) {
      const [r, g, b] = val.components.map(c => Math.round(c * 255));
      return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
    }
    return val.hex;
  }
  return val;
}

// Step 3: Build CSS custom properties
const lines = ['/* Auto-generated from Figma tokens — do not edit manually */', '/* Run: node scripts/generate-tokens.mjs */', ':root {'];

// Base colour palettes
for (const [palette, shades] of Object.entries(baseColors)) {
  lines.push(`  /* ── ${palette} ── */`);
  for (const [shade, hex] of Object.entries(shades)) {
    lines.push(`  --color-${palette}-${shade}: ${hex};`);
  }
  lines.push('');
}

// Semantic colour scheme
function addSection(title, obj, prefix) {
  lines.push(`  /* ── ${title} ── */`);
  for (const [key, token] of Object.entries(obj)) {
    if (token.$type === 'color') {
      const val = resolveRef(token.$value);
      const cssKey = key.replace(/\s+/g, '-');
      lines.push(`  --${prefix}-${cssKey}: ${val};`);
    }
  }
  lines.push('');
}

const cs = lightJson['color scheme'] || {};
if (cs.primaries) addSection('Primaries', cs.primaries, 'color');
if (cs.semantic) addSection('Semantic', cs.semantic, 'color');
if (cs.text) addSection('Text', cs.text, 'color-text');
if (cs.surfaces) addSection('Surfaces', cs.surfaces, 'color-surface');
if (cs.borders) addSection('Borders', cs.borders, 'color-border');

if (lightJson['action colours']) addSection('Action Colours', lightJson['action colours'], 'action');
if (lightJson['icon colours']) addSection('Icon Colours', lightJson['icon colours'], 'icon');
if (lightJson['status colours']) addSection('Status Colours', lightJson['status colours'], 'status');

// Spacing
if (lightJson.spacing) {
  lines.push('  /* ── Spacing ── */');
  for (const [key, token] of Object.entries(lightJson.spacing)) {
    lines.push(`  --space-${key}: ${token.$value}px;`);
  }
  lines.push('');
}

// Radius
if (lightJson.radius) {
  lines.push('  /* ── Radius ── */');
  for (const [key, token] of Object.entries(lightJson.radius)) {
    const val = token.$value === 9999 ? '9999px' : `${token.$value}px`;
    lines.push(`  --radius-${key}: ${val};`);
  }
  lines.push('');
}

// Typography
const typo = lightJson.typography || {};
if (typo['font-family']) {
  lines.push('  /* ── Font Family ── */');
  for (const [key, token] of Object.entries(typo['font-family'])) {
    lines.push(`  --font-family-${key}: '${token.$value}', sans-serif;`);
  }
  lines.push('');
}
if (typo['font-size']) {
  lines.push('  /* ── Font Size ── */');
  for (const [key, token] of Object.entries(typo['font-size'])) {
    lines.push(`  --font-${key}: ${token.$value}px;`);
  }
  lines.push('');
}
if (typo['font-weight']) {
  lines.push('  /* ── Font Weight ── */');
  for (const [key, token] of Object.entries(typo['font-weight'])) {
    lines.push(`  --weight-${key}: ${token.$value};`);
  }
  lines.push('');
}

// Line height
if (lightJson['line-height']) {
  lines.push('  /* ── Line Height ── */');
  for (const [key, token] of Object.entries(lightJson['line-height'])) {
    lines.push(`  --leading-${key}: ${token.$value};`);
  }
  lines.push('');
}

// Shadows
if (lightJson.shadows) {
  lines.push('  /* ── Shadows ── */');
  for (const [key, token] of Object.entries(lightJson.shadows)) {
    lines.push(`  --shadow-${key}: ${token.$value};`);
  }
  lines.push('');
}

// Border width
if (lightJson['border-width']) {
  lines.push('  /* ── Border Width ── */');
  for (const [key, token] of Object.entries(lightJson['border-width'])) {
    lines.push(`  --border-${key}: ${token.$value}px;`);
  }
  lines.push('');
}

lines.push('}');

// Step 4: Backward-compatible aliases (old names → new Figma names)
// These let existing components keep working without renaming every CSS var reference.
// Remove these once all components are migrated to the new token names.
const aliases = [
  '',
  '/* ══ Backward-compatible aliases ══ */',
  '/* Map old --color-grey-* to Figma --color-zinc-* */',
  '/* Map old --color-primary-* to Figma --color-mint-* */',
  '/* Remove these once components are migrated to new names */',
  ':root {',
];

// grey → zinc
if (baseColors.zinc) {
  for (const [shade, hex] of Object.entries(baseColors.zinc)) {
    aliases.push(`  --color-grey-${shade}: var(--color-zinc-${shade});`);
  }
}
aliases.push('');

// primary → mint
if (baseColors.mint) {
  for (const [shade, hex] of Object.entries(baseColors.mint)) {
    aliases.push(`  --color-primary-${shade}: var(--color-mint-${shade});`);
  }
}
aliases.push('');

// Semantic aliases used by existing components
aliases.push('  /* Semantic aliases */');
aliases.push('  --color-bg: var(--color-zinc-50);');
aliases.push('  --color-surface: var(--color-zinc-100);');
aliases.push('  --color-border: var(--color-zinc-300);');
aliases.push('  --color-text-primary: var(--color-zinc-800);');
aliases.push('  --color-text-secondary: var(--color-zinc-600);');
aliases.push('  --color-text-muted: var(--color-zinc-500);');
aliases.push('  --color-text-inverse: var(--color-zinc-50);');
aliases.push('  --color-success: var(--color-mint-500);');
aliases.push('  --color-success-light: var(--color-mint-50);');
aliases.push('  --color-warning: var(--color-amber-500, #F59E0B);');
aliases.push('  --color-warning-light: var(--color-amber-50, #FFFBEB);');
aliases.push('  --color-error: var(--color-red-500);');
aliases.push('  --color-error-light: var(--color-red-50);');
aliases.push('  --color-info: var(--color-sky-400, #38BDF8);');
aliases.push('  --color-info-light: var(--color-sky-50, #F0F9FF);');
aliases.push('  --color-focus: var(--color-mint-500);');
aliases.push('  --shadow-focus: 0 0 0 2px rgba(20, 184, 138, 0.2);');
aliases.push('');

// Spacing numeric aliases (--space-1 through --space-10)
aliases.push('  /* Numeric spacing aliases */');
aliases.push('  --space-0: 0;');
aliases.push('  --space-1: var(--space-xs);');
aliases.push('  --space-2: var(--space-sm);');
aliases.push('  --space-3: 12px;');
aliases.push('  --space-4: var(--space-md);');
aliases.push('  --space-5: 20px;');
aliases.push('  --space-6: var(--space-lg);');
aliases.push('  --space-7: var(--space-xl);');
aliases.push('  --space-8: 40px;');
aliases.push('  --space-9: 48px;');
aliases.push('  --space-10: 64px;');
aliases.push('  --space-15: 15px;');
aliases.push('');

// Transition aliases
aliases.push('  /* Transitions */');
aliases.push('  --transition-fast: 150ms ease;');
aliases.push('  --transition-base: 200ms ease-in-out;');
aliases.push('  --transition-slow: 300ms ease;');

aliases.push('}');

const output = lines.join('\n') + '\n' + aliases.join('\n') + '\n';
writeFileSync(resolve(root, 'src/styles/tokens.css'), output);
console.log('✓ tokens.css generated from Figma JSON');
