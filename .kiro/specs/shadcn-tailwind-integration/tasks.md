# Implementation Plan: shadcn + Tailwind Integration

## Overview

Integrate Tailwind CSS v4 and shadcn/ui into the existing UbiQuity prototype alongside CSS Modules. The implementation follows an additive approach — install tooling, configure the build pipeline, add shadcn components styled with UDS tokens, verify no regressions, then upgrade the Component Library page to handle the expanded component set.

## Tasks

- [x] 1. Install dependencies and configure build pipeline
  - [x] 1.1 Install Tailwind CSS v4 and related dependencies
    - Run `npm install tailwindcss @tailwindcss/vite tailwindcss-animate`
    - Run `npm install clsx tailwind-merge class-variance-authority`
    - Verify all packages appear in `package.json`
    - _Requirements: 1.1, 1.8, 3.3, 7.1_

  - [x] 1.2 Configure Vite with Tailwind plugin and path alias
    - Add `@tailwindcss/vite` plugin to `vite.config.ts` (after `react()`)
    - Add `resolve.alias` mapping `@` to `path.resolve(__dirname, './src')`
    - Import `path` and `tailwindcss` at top of config
    - _Requirements: 1.1, 3.5, 7.1, 7.2_

  - [x] 1.3 Configure TypeScript path alias
    - Add `"baseUrl": "."` and `"paths": { "@/*": ["./src/*"] }` to `tsconfig.app.json` compilerOptions
    - _Requirements: 3.5_

  - [x] 1.4 Create `src/styles/globals.css` with Tailwind directives and theme mapping
    - Import only Tailwind utilities and theme (no preflight/base layer)
    - Add `@custom-variant dark (&:where([data-theme="dark"]))` for dark mode
    - Add `@theme` block mapping spacing, radius, font, colour, and shadow tokens from `tokens.css`
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.4_

  - [x] 1.5 Import `globals.css` in `src/main.tsx`
    - Add `import './styles/globals.css'` after the existing `tokens.css` import
    - _Requirements: 1.1, 7.1_

  - [x] 1.6 Create `src/lib/utils.ts` with the `cn()` utility function
    - Export `cn()` using `clsx` + `tailwind-merge` for conditional class merging
    - _Requirements: 3.3_

- [x] 2. Checkpoint — Verify build pipeline
  - Ensure `npm run build` completes without errors
  - Ensure existing CSS Modules components are unaffected (no global resets applied)
  - Ask the user if questions arise.

- [x] 3. Configure shadcn/ui and install initial components
  - [x] 3.1 Create `components.json` at project root
    - Set `style: "default"`, `rsc: false`, `tsx: true`
    - Set `tailwind.css` to `src/styles/globals.css`, `cssVariables: true`
    - Set aliases: `components: "@/components"`, `utils: "@/lib/utils"`, `ui: "@/components/ui"`, `lib: "@/lib"`, `hooks: "@/hooks"`
    - Set `iconLibrary: "lucide"`
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 7.5_

  - [x] 3.2 Install initial shadcn components
    - Run `npx shadcn@latest add dialog tabs tooltip popover select sheet accordion dropdown-menu command separator`
    - Verify all 10 components exist in `src/components/ui/`
    - _Requirements: 3.1, 3.4, 4.7_

  - [x] 3.3 Restyle shadcn components to use UDS tokens
    - Update CSS variable references in shadcn components to use `--color-accent-default` (#14B88A) as primary
    - Ensure `--font-family-primary` (Inter) is the base font
    - Ensure `--radius-lg` (8px) is the default border radius for interactive elements
    - Ensure `--space-sm`/`--space-md` for internal padding
    - Ensure `--shadow-s` through `--shadow-xl` for elevation
    - Verify dark mode works via `dark:` variant utilities picking up token overrides
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 4. Checkpoint — Verify coexistence
  - Run `npm run build` and confirm output contains both CSS Modules and Tailwind CSS
  - Verify no class name collisions between Tailwind utilities and CSS Modules scoped names
  - Verify existing components (Button, TextField, CardSelector, Modal, Toggle, Dropdown, DataTable, Checkbox, RadioCard, StatusBadge, Toast, MetricCard) render identically
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 5. Upgrade Component Library page
  - [x] 5.1 Create component registry data structure
    - Define `ComponentEntry` interface with `name`, `slug`, `category`, `description`, `component` fields
    - Create registry array with all existing custom components and new shadcn primitives
    - Categories: `custom`, `primitives`, `composed`
    - _Requirements: 5.2_

  - [x] 5.2 Implement tabbed/sidebar navigation for Component Library
    - Update `ComponentLibraryPage.tsx` to use sidebar or tab navigation listing categories
    - Implement React Router nested routes: `/admin/components/:category/:name`
    - Add `React.lazy()` code-splitting for each component demo section
    - Redirect `/admin/components` to `/admin/components/custom`
    - Support deep-linking to specific components via URL
    - _Requirements: 5.1, 5.3, 5.4, 5.5_

  - [x] 5.3 Write property test for component registry validity
    - **Property 2: Component registry entries have valid categories**
    - Generate component entries and verify each belongs to exactly one category from `{ 'custom', 'primitives', 'composed' }` with non-empty `name`, `slug`, and `description`
    - **Validates: Requirements 5.2**

  - [x] 5.4 Write property test for deep-link routing
    - **Property 3: Deep-link routing resolves to correct component**
    - Generate valid slugs from component names via kebab-case transformation and verify URL resolution matches
    - **Validates: Requirements 5.5**

- [x] 6. Write tests for cn() utility
  - [x] 6.1 Write property test for cn() determinism and conflict resolution
    - **Property 1: cn() utility is deterministic and handles conflicts**
    - Generate random arrays of Tailwind class strings (including conflicting utilities like `p-2` and `p-4`)
    - Verify output is deterministic (same input → same output)
    - Verify later conflicting classes override earlier ones
    - Verify result is always a valid space-separated class string
    - Use `fast-check` with minimum 100 iterations
    - **Validates: Requirements 3.3**

  - [x] 6.2 Write unit tests for cn() utility
    - Test empty inputs return empty string
    - Test single class passthrough
    - Test conditional classes with falsy values
    - Test Tailwind conflict resolution (e.g., `cn('p-2', 'p-4')` → `'p-4'`)
    - _Requirements: 3.3_

- [x] 7. Update steering files
  - [x] 7.1 Update `tech-stack.md` steering file
    - Document coexistence of CSS Modules and Tailwind CSS
    - Specify CSS Modules remain default for existing components
    - Specify Tailwind is used for shadcn/ui components in `src/components/ui/`
    - _Requirements: 8.1, 8.2_

  - [x] 7.2 Update `project-structure.md` steering file
    - Document `src/components/ui/` as the shadcn registry location
    - Document `src/lib/utils.ts` as the cn() utility location
    - Document `src/styles/globals.css` as the Tailwind entry point
    - _Requirements: 8.3_

- [x] 8. Final checkpoint
  - Run `npm run build` — no errors
  - Run `npm run test` — all tests pass
  - Verify all 10 shadcn components exist in `src/components/ui/`
  - Verify `@/` path alias resolves in both TypeScript and Vite
  - Verify preflight is disabled (no global resets in output CSS)
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The project already has `fast-check` installed for property-based testing
- CSS Modules components must remain completely unaffected throughout the integration
- Tailwind v4 uses `@tailwindcss/vite` plugin (no PostCSS config needed)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["1.4", "1.5", "1.6"] },
    { "id": 3, "tasks": ["3.1"] },
    { "id": 4, "tasks": ["3.2"] },
    { "id": 5, "tasks": ["3.3"] },
    { "id": 6, "tasks": ["5.1", "6.1", "6.2"] },
    { "id": 7, "tasks": ["5.2", "5.3"] },
    { "id": 8, "tasks": ["5.4", "7.1", "7.2"] }
  ]
}
```
