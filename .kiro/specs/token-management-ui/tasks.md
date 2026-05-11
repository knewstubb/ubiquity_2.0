# Implementation Plan: Token Management UI

## Overview

Build a Token Management page within the Component Library that provides a visual interface for viewing and editing all design tokens. The page uses shadcn/ui components (Tabs, Popover, Input, Button), stores token assignments as Tailwind primitive references, persists to localStorage, and applies changes live via CSS custom property injection.

## Tasks

- [x] 1. Set up data layer and interfaces
  - [x] 1.1 Create TypeScript interfaces for TokenConfig
    - Create `src/models/tokenConfig.ts` with `PrimitiveRef`, `ColourTokenValue`, and `TokenConfig` interfaces
    - Define the `PaletteLookup` type
    - _Requirements: 10.1, 10.2_

  - [x] 1.2 Create Tailwind palette lookup table
    - Create `src/data/tailwindPalette.ts` with full palette data for all standard Tailwind colours + mint
    - Export `PALETTE_NAMES`, `SHADE_STEPS` constants
    - Export `resolveToHex(ref: string): string | null` function
    - Include the custom mint palette values from `tokens.css`
    - _Requirements: 10.2, 10.4_

  - [x] 1.3 Create default token config data
    - Create `src/data/defaultTokenConfig.ts` with the default `TokenConfig` object derived from current `globals.css` values
    - Export the `VARIABLE_MAP` for dual CSS variable injection
    - Define colour token groups (Core Surfaces, Primary, Secondary, etc.)
    - _Requirements: 2.4, 4.3_

  - [x] 1.4 Write property test for primitive resolution (Property 1)
    - **Property 1: Primitive Resolution Correctness**
    - For any valid `{palette}-{shade}` where palette ∈ PALETTE_NAMES and shade ∈ SHADE_STEPS, `resolveToHex` returns a valid 7-char hex string matching `/^#[0-9A-Fa-f]{6}$/`; for invalid refs it returns `null`
    - **Validates: Requirements 2.5, 10.2**

  - [x] 1.5 Write property test for token format invariant (Property 6)
    - **Property 6: Token Format Invariant**
    - Every colour value in a `TokenConfig` produced by the editor is a string matching `{palette}-{shade}` where palette ∈ PALETTE_NAMES and shade ∈ SHADE_STEPS
    - **Validates: Requirements 10.1, 3.2**

- [x] 2. Implement useTokenConfig hook
  - [x] 2.1 Create the useTokenConfig custom hook
    - Create `src/lib/useTokenConfig.ts` implementing the `UseTokenConfigReturn` interface
    - Read from `localStorage['ubiquity-token-config']` on mount
    - Merge overrides with defaults from `defaultTokenConfig`
    - On every change: update state → write to localStorage → inject CSS variables
    - Implement `updateColour`, `updateSpacing`, `updateRadius`, `updateFontSize`, `reset`, `exportJSON`
    - Handle corrupted localStorage gracefully (catch parse errors, fall back to defaults)
    - Implement mode-aware injection (check `data-theme` attribute)
    - Implement dual variable injection using `VARIABLE_MAP`
    - _Requirements: 3.3, 4.1, 4.2, 4.3, 4.4, 9.1, 9.2, 9.3_

  - [x] 2.2 Write property test for serialization round-trip (Property 2)
    - **Property 2: Token Config Serialization Round-Trip**
    - For any valid `TokenConfig`, serializing to JSON and parsing back produces a deeply equal object
    - **Validates: Requirements 4.1, 4.2, 4.4**

  - [x] 2.3 Write property test for CSS injection correctness (Property 3)
    - **Property 3: CSS Injection Correctness**
    - After calling `updateColour(tokenName, mode, primitiveRef)`, `document.documentElement.style.getPropertyValue('--' + tokenName)` equals `resolveToHex(primitiveRef)`. All mapped variables in VARIABLE_MAP are also set.
    - **Validates: Requirements 3.3, 9.1, 9.2**

  - [x] 2.4 Write property test for light/dark mode independence (Property 4)
    - **Property 4: Light/Dark Mode Independence**
    - Updating light mode value does not change dark mode value, and vice versa
    - **Validates: Requirements 3.4**

- [x] 3. Checkpoint — Ensure data layer tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Build the Colour Section components
  - [x] 4.1 Create ColourSection component
    - Create `src/components/tokens/ColourSection.tsx` and `ColourSection.module.css`
    - Display token rows grouped by subsection (Core Surfaces, Primary, Secondary, etc.) with `TokenGroupHeader` per group
    - Each row shows: token name, light mode swatch + primitive name + hex, dark mode swatch + primitive name + hex
    - Clicking a swatch or primitive name opens the ColourPicker popover
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.4_

  - [x] 4.2 Create ColourPicker popover component
    - Create `src/components/tokens/ColourPicker.tsx` and `ColourPicker.module.css`
    - Use shadcn `Popover` / `PopoverTrigger` / `PopoverContent`
    - Display a grid of all palettes × shades (PALETTE_NAMES rows × SHADE_STEPS columns)
    - Each cell is a colour swatch button; currently selected value gets a ring indicator
    - Clicking a cell closes the popover and calls `onSelect(primitiveRef)`
    - Show "Selected: {ref} {hex}" at the bottom
    - _Requirements: 3.1, 3.2, 10.4_

- [x] 5. Build the Spacing Section
  - [x] 5.1 Create SpacingSection component
    - Create `src/components/tokens/SpacingSection.tsx` and `SpacingSection.module.css`
    - Display each spacing token (xxs–xxl) with name, editable numeric Input (type="number", min=0), and a horizontal bar whose width is proportional to the value
    - Display tokens in ascending order by pixel value
    - Changes update the bar width immediately and call `updateSpacing`
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 5.2 Write property test for spacing ordering (Property 7)
    - **Property 7: Spacing Ordering Invariant**
    - For displayed tokens at indices i and j where i < j, `value[i] <= value[j]`
    - **Validates: Requirements 5.2**

- [x] 6. Build the Radius Section
  - [x] 6.1 Create RadiusSection component
    - Create `src/components/tokens/RadiusSection.tsx` and `RadiusSection.module.css`
    - Display base radius with editable Input (type="number", min=1)
    - Display derived values (none=0, sm=base×0.6, md=base×0.8, lg=base, xl=base×1.4, full=9999) as read-only
    - Each token shows a 48×48 square preview with the corresponding border-radius
    - Editing base recalculates all derived values reactively
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 6.2 Write property test for radius derivation (Property 5)
    - **Property 5: Radius Derivation Formula**
    - For any positive base B: sm = B×0.6, md = B×0.8, lg = B, xl = B×1.4; none = 0, full = 9999
    - **Validates: Requirements 6.3**

- [x] 7. Build the Typography and Icon Sections
  - [x] 7.1 Create TypographySection component
    - Create `src/components/tokens/TypographySection.tsx` and `TypographySection.module.css`
    - Display font families (Inter, JetBrains Mono) with sample text rendered in each
    - Display font size scale (xxs–5xl) with editable numeric Input and sample text at that size
    - Display font weights (Light 300, Normal 400, Medium 500, SemiBold 600, Bold 700) with sample text
    - Editing a font size calls `updateFontSize` and updates the preview
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 7.2 Create IconSection component
    - Create `src/components/tokens/IconSection.tsx` and `IconSection.module.css`
    - Display "Phosphor Icons" as the library name, "Regular weight" as the style
    - Render a grid of sample Phosphor icons (MagnifyingGlass, GearSix, X, Check, ArrowRight, Plus, Trash, ClipboardText, User, EnvelopeSimple, Bell, Folder, DownloadSimple, ArrowSquareOut, Star, ChatCircle)
    - Read-only display section
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 8. Build the ActionBar and wire up the page
  - [x] 8.1 Create ActionBar component
    - Create `src/components/tokens/ActionBar.tsx` and `ActionBar.module.css`
    - "Reset to Defaults" button calls `reset()` from useTokenConfig
    - "Export JSON" button calls `exportJSON()` from useTokenConfig
    - Use shadcn `Button` (variant="outline" for Reset, variant="default" for Export)
    - _Requirements: 4.3, 4.4_

  - [x] 8.2 Create TokenManagerDemo page component
    - Create `src/pages/component-demos/TokenManagerDemo.tsx`
    - Use shadcn `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` for section navigation
    - Tabs: Colours, Spacing, Border Radius, Typography, Icons
    - Wire `useTokenConfig` hook and pass config + update functions to each section
    - Include `ActionBar` at the bottom
    - _Requirements: 1.3_

  - [x] 8.3 Register in componentRegistry and verify routing
    - Add "Design Tokens" entry to `src/data/componentRegistry.ts` under `foundations` category with slug `tokens`
    - Verify the page is accessible at `/admin/components/foundations/tokens`
    - Verify it appears in the Component Library sidebar under "Foundations"
    - _Requirements: 1.1, 1.2_

- [x] 9. Checkpoint — Ensure build passes and all sections render
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Integration and final verification
  - [x] 10.1 Verify live preview and dual variable injection
    - Confirm colour changes propagate to both `globals.css` semantic tokens and `tokens.css` variables via VARIABLE_MAP
    - Confirm changes apply immediately without page reload
    - Confirm mode-aware injection (light/dark) works correctly with `data-theme` attribute
    - _Requirements: 3.3, 9.1, 9.2_

  - [x] 10.2 Verify persistence and error handling
    - Confirm localStorage read/write works across page reloads
    - Confirm Reset to Defaults restores original values
    - Confirm Export downloads a valid JSON file
    - Confirm corrupted localStorage is handled gracefully
    - Confirm invalid primitive references are rejected with error feedback
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 9.3_

  - [x] 10.3 Write unit tests for key interactions
    - Test route renders correctly at `/admin/components/foundations/tokens`
    - Test colour picker popover opens with all palettes
    - Test reset action restores defaults
    - Test token group headings are present
    - Test icon section displays library name and grid
    - Test mint palette is present in picker
    - _Requirements: 1.1, 1.2, 1.3, 3.1, 4.3, 2.4, 8.1, 8.2, 8.3, 10.4_

- [x] 11. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using Vitest + fast-check
- Unit tests validate specific examples and edge cases
- The design uses TypeScript throughout — all implementations use `.ts` / `.tsx` files
- CSS Modules are used for custom token components (not in `src/components/ui/`)
- shadcn/ui components (Tabs, Popover, Button, Input) use Tailwind as per project conventions
- The `useTokenConfig` hook is the single source of truth for token state, persistence, and CSS injection

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["1.4", "1.5", "2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4"] },
    { "id": 3, "tasks": ["4.1", "4.2", "5.1", "6.1", "7.1", "7.2"] },
    { "id": 4, "tasks": ["5.2", "6.2", "8.1", "8.2"] },
    { "id": 5, "tasks": ["8.3"] },
    { "id": 6, "tasks": ["10.1", "10.2"] },
    { "id": 7, "tasks": ["10.3"] }
  ]
}
```
