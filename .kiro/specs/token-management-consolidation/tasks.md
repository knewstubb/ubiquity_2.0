# Implementation Plan: Token Management Consolidation

## Overview

Extend the three data structures in `src/data/defaultTokenConfig.ts` to register all 24 missing CSS Module semantic tokens. The implementation is purely additive — no logic changes to `useTokenConfig.ts` or `ColourSection.tsx` are needed since both are already data-driven. The work is sequenced to add VARIABLE_MAP entries first (enabling dual injection), then DEFAULT_TOKEN_CONFIG colour entries, then COLOUR_TOKEN_GROUPS (enabling UI display).

## Tasks

- [x] 1. Extend VARIABLE_MAP with new CSS variable mappings
  - [x] 1.1 Add border, background, and text token mappings to VARIABLE_MAP
    - Add entries for `border-strong`, `border-focus`, `background-subtle`, `background-sunken`, `background-elevated`, `text-tertiary`, `text-disabled`, `text-inverse`, `text-on-accent`
    - Each entry maps to its `--color-{name}` CSS variable (e.g. `'border-strong': ['--color-border-strong']`)
    - _Requirements: 1.3, 1.4, 2.3, 2.4, 2.5, 3.3, 3.4, 3.5, 3.6, 8.1, 8.2_

  - [x] 1.2 Add accent, state, danger, and neutral token mappings to VARIABLE_MAP
    - Add entries for `accent-hover`, `accent-subtle`, `accent-text`, `accent-border`, `state-disabled-bg`, `state-disabled-text`, `danger-hover`, `danger-subtle`, `danger-text`, `danger-border`, `neutral-default`, `neutral-hover`, `neutral-subtle`, `neutral-text`, `neutral-border`
    - Each entry maps to its `--color-{name}` CSS variable
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 5.3, 5.4, 6.3, 6.4, 7.3, 8.1, 8.2_

- [x] 2. Add new colour token entries to DEFAULT_TOKEN_CONFIG
  - [x] 2.1 Add border and background token entries to DEFAULT_TOKEN_CONFIG.colours
    - Add `border-strong: { light: 'zinc-300', dark: 'zinc-600' }`
    - Add `border-focus: { light: 'mint-500', dark: 'mint-500' }`
    - Add `background-subtle: { light: 'zinc-100', dark: 'zinc-800' }`
    - Add `background-sunken: { light: 'zinc-200', dark: 'zinc-950' }`
    - Add `background-elevated: { light: 'zinc-300', dark: 'zinc-700' }`
    - _Requirements: 1.1, 2.1, 10.1, 10.2, 10.3_

  - [x] 2.2 Add text token entries to DEFAULT_TOKEN_CONFIG.colours
    - Add `text-tertiary: { light: 'zinc-400', dark: 'zinc-500' }`
    - Add `text-disabled: { light: 'zinc-300', dark: 'zinc-600' }`
    - Add `text-inverse: { light: 'white-50', dark: 'zinc-900' }`
    - Add `text-on-accent: { light: 'white-50', dark: 'white-50' }`
    - _Requirements: 3.1, 10.1, 10.2, 10.3_

  - [x] 2.3 Add accent token entries to DEFAULT_TOKEN_CONFIG.colours
    - Add `accent-hover: { light: 'mint-600', dark: 'mint-400' }`
    - Add `accent-subtle: { light: 'mint-50', dark: 'mint-950' }`
    - Add `accent-text: { light: 'mint-700', dark: 'mint-300' }`
    - Add `accent-border: { light: 'mint-500', dark: 'mint-500' }`
    - _Requirements: 4.1, 10.1, 10.2, 10.3_

  - [x] 2.4 Add state, danger, and neutral token entries to DEFAULT_TOKEN_CONFIG.colours
    - Add `state-disabled-bg: { light: 'zinc-200', dark: 'zinc-700' }`
    - Add `state-disabled-text: { light: 'zinc-400', dark: 'zinc-600' }`
    - Add `danger-hover: { light: 'red-600', dark: 'red-500' }`
    - Add `danger-subtle: { light: 'red-50', dark: 'red-950' }`
    - Add `danger-text: { light: 'red-700', dark: 'red-300' }`
    - Add `danger-border: { light: 'red-500', dark: 'red-400' }`
    - Add `neutral-default: { light: 'zinc-500', dark: 'zinc-400' }`
    - Add `neutral-hover: { light: 'zinc-600', dark: 'zinc-500' }`
    - Add `neutral-subtle: { light: 'zinc-50', dark: 'zinc-950' }`
    - Add `neutral-text: { light: 'zinc-600', dark: 'zinc-400' }`
    - Add `neutral-border: { light: 'zinc-400', dark: 'zinc-600' }`
    - _Requirements: 5.1, 6.1, 7.1, 10.1, 10.2, 10.3_

- [x] 3. Extend COLOUR_TOKEN_GROUPS with new and modified groups
  - [x] 3.1 Extend existing Border and Accent groups
    - Add `border-strong` and `border-focus` to the existing "Border" group (after `ring`)
    - Add `accent-hover`, `accent-subtle`, `accent-text`, `accent-border` to the existing "Accent" group (after `accent-foreground`)
    - _Requirements: 1.2, 4.2, 9.1, 9.3_

  - [x] 3.2 Add new Background, Text, State, Danger, and Neutral groups
    - Add "Background" group: `['background-subtle', 'background-sunken', 'background-elevated']`
    - Add "Text" group: `['text-tertiary', 'text-disabled', 'text-inverse', 'text-on-accent']`
    - Add "State" group: `['state-disabled-bg', 'state-disabled-text']`
    - Add "Danger" group: `['danger-hover', 'danger-subtle', 'danger-text', 'danger-border']`
    - Add "Neutral" group: `['neutral-default', 'neutral-hover', 'neutral-subtle', 'neutral-text', 'neutral-border']`
    - _Requirements: 2.2, 3.2, 5.2, 6.2, 7.2, 9.1, 9.3_

- [x] 4. Checkpoint — Verify build and existing tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Write tests for token consolidation
  - [x] 5.1 Write unit tests for VARIABLE_MAP, COLOUR_TOKEN_GROUPS, and DEFAULT_TOKEN_CONFIG completeness
    - Create `src/__tests__/token-consolidation.test.ts`
    - Verify VARIABLE_MAP contains all 24 new token entries with correct CSS variable names
    - Verify COLOUR_TOKEN_GROUPS contains all expected groups with expected tokens
    - Verify DEFAULT_TOKEN_CONFIG.colours contains all 24 new entries with valid light/dark refs
    - Verify all primitive refs resolve to hex via `resolveToHex`
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2, 6.1, 6.2, 7.1, 7.2, 8.1, 8.3–8.7_

  - [x] 5.2 Write property test for CSS Variable Injection Correctness (Property 1)
    - **Property 1: CSS Variable Injection Correctness**
    - Generate random token names from `DEFAULT_TOKEN_CONFIG.colours`, verify that for each token: if VARIABLE_MAP has an entry, all listed variables would be set; otherwise `--{tokenName}` would be set
    - **Validates: Requirements 1.3, 1.4, 2.3, 2.4, 2.5, 3.3, 3.4, 3.5, 3.6, 4.3, 4.4, 4.5, 4.6, 5.3, 5.4, 6.3, 6.4, 7.3, 8.2**

  - [x] 5.3 Write property test for Export Structure Invariant (Property 4)
    - **Property 4: Export Structure Invariant**
    - For every colour token in DEFAULT_TOKEN_CONFIG, verify the entry has `{ light, dark }` structure where both values are valid PrimitiveRefs that resolve to hex via `resolveToHex`
    - **Validates: Requirements 12.1, 12.2, 12.3**

- [x] 6. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Only `src/data/defaultTokenConfig.ts` is modified — no logic changes needed
- The `useTokenConfig` hook and `ColourSection` component are data-driven and automatically pick up new entries
- Property tests use `fast-check` (already a dev dependency)
- Unit tests use Vitest (project test framework)
- Requirements 9.3, 11.1–11.3, and 12.1–12.3 are satisfied automatically by the data-driven architecture — no additional code needed beyond the data entries

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3", "2.4"] },
    { "id": 2, "tasks": ["3.1", "3.2"] },
    { "id": 3, "tasks": ["5.1"] },
    { "id": 4, "tasks": ["5.2", "5.3"] }
  ]
}
```
