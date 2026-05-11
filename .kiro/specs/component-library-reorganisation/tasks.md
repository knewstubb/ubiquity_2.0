# Implementation Plan: Component Library Reorganisation

## Overview

Restructure the Component Library page across three axes: replace the custom sidebar with the shadcn Sidebar component, restructure categories from abstraction-level to purpose-driven taxonomy, and split the monolithic Token Manager into individual routed sub-pages. Each task builds incrementally — types and data first, then layout, then routing, then cleanup.

## Tasks

- [x] 1. Update component registry types and data
  - [x] 1.1 Update `ComponentCategory` type and reassign all entries in `src/data/componentRegistry.ts`
    - Change `ComponentCategory` type to `'tokens' | 'inputs' | 'display' | 'feedback' | 'navigation' | 'composed'`
    - Remove all `foundations` and `custom` category entries (Typography, Colours, Shadows, Spacing & Radius, Design Tokens)
    - Add new `tokens` category entries: Colours, Typography, Shadows, Spacing & Radius, Icons — each pointing to a new `TokenSubPage` lazy import
    - Reassign all existing primitives to their new categories (`inputs`, `display`, `feedback`, `navigation`) per the design mapping table
    - Keep `composed` entries unchanged
    - Update the `CATEGORIES` constant in `ComponentLibraryPage.tsx` to match the new six categories in order: Tokens, Inputs, Display, Feedback, Navigation, Composed
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 4.1, 4.2, 4.4_

  - [x] 1.2 Write property tests for category validity and no-legacy entries
    - **Property 1: Category validity** — For any component entry, its `category` field must be one of the six valid values
    - **Property 2: No legacy entries** — No entry has `foundations` or `custom` category, and no removed foundation slugs exist
    - **Validates: Requirements 2.1, 2.10, 4.1, 4.2, 4.4**

- [x] 2. Create TokenConfigContext and TokenSubPage
  - [x] 2.1 Create `src/contexts/TokenConfigContext.tsx`
    - Lift the `useTokenConfig()` hook state into a React context provider
    - Export `TokenConfigProvider` and `useTokenConfigContext` hook
    - Provider wraps all token sub-pages so edits persist across navigation
    - Interface: `config`, `updateColour`, `updateSpacing`, `updateRadius`, `updateFontSize`, `reset`, `exportJSON`
    - _Requirements: 3.8_

  - [x] 2.2 Create `src/pages/component-demos/TokenSubPage.tsx`
    - Use `useParams()` to read `:tokenSlug` from the URL
    - Map slug to the correct section component: `colours` → ColourSection, `typography` → TypographySection, `shadows` → ShadowsDemo, `spacing-radius` → SpacingSection + RadiusSection, `icons` → IconSection
    - Consume `useTokenConfigContext()` for config and update functions
    - Render the ActionBar with reset/export at the bottom
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [x] 2.3 Write property test for token state preservation across navigation
    - **Property 12: Token state preservation** — For any token edit made on a sub-page, navigating away and returning preserves the edited value
    - **Validates: Requirements 3.8**

- [x] 3. Install and integrate shadcn Sidebar
  - [x] 3.1 Install the shadcn Sidebar component
    - Run `npx shadcn@latest add sidebar` to add `src/components/ui/sidebar.tsx`
    - Verify the component exports: `SidebarProvider`, `Sidebar`, `SidebarContent`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupContent`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`
    - _Requirements: 1.1_

  - [x] 3.2 Rewrite `ComponentLibraryPage.tsx` layout to use shadcn Sidebar
    - Replace the custom `<aside>` with `SidebarProvider` + `Sidebar` + `SidebarContent`
    - Render one `SidebarGroup` per category with `SidebarGroupLabel` as the collapsible heading
    - Use `NavLink` inside `SidebarMenuButton` for each component item
    - Implement collapsible groups with local `useState(true)` per group — clicking the label toggles visibility
    - Add CaretRight/CaretDown Phosphor icon on group headings to indicate collapse state
    - Apply active styling: `text-primary font-medium border-l-primary bg-accent` via `cn()` and NavLink `isActive`
    - Maintain fixed positioning (220px width) and independent scroll
    - Token items link to `/admin/components/tokens/:slug`, all others to `/admin/components/:category/:slug`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

  - [x] 3.3 Write property tests for sidebar behaviour
    - **Property 3: Sidebar item order matches registry** — Items rendered under each category heading appear in registry order
    - **Property 4: Sidebar group toggle** — Clicking a group heading toggles child item visibility
    - **Validates: Requirements 2.3, 1.7, 1.8**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Update route structure in App.tsx
  - [x] 5.1 Update routes in `src/App.tsx` for the new category taxonomy
    - Change the index redirect from `/admin/components/foundations` to `/admin/components/tokens`
    - Add nested route for `tokens/:tokenSlug` rendering `TokenSubPage`
    - Add redirect from `/admin/components/tokens` (no slug) to `/admin/components/tokens/colours`
    - Keep `:category` → `CategoryOverview` and `:category/:slug` → `ComponentDemoView` routes
    - Wrap token sub-page routes with `TokenConfigProvider`
    - _Requirements: 6.1, 6.2, 6.3, 3.1, 3.9_

  - [x] 5.2 Add legacy route redirects
    - `/admin/components/foundations` → `/admin/components/tokens`
    - `/admin/components/foundations/colours` → `/admin/components/tokens/colours`
    - `/admin/components/foundations/typography` → `/admin/components/tokens/typography`
    - `/admin/components/foundations/shadows` → `/admin/components/tokens/shadows`
    - `/admin/components/foundations/spacing-radius` → `/admin/components/tokens/spacing-radius`
    - `/admin/components/foundations/tokens` → `/admin/components/tokens`
    - Invalid category/slug → redirect to `/admin/components/tokens`
    - _Requirements: 4.3, 4.5, 6.5_

  - [x] 5.3 Write property test for route structure consistency
    - **Property 5: Route structure consistency** — For any non-token entry, its navigable route is `/admin/components/${entry.category}/${entry.slug}`
    - **Validates: Requirements 6.1, 1.3**

- [x] 6. Verify Controls Panel and CategoryOverview preservation
  - [x] 6.1 Verify `ComponentDemoView` and `ControlsPanel` work with new categories
    - Ensure `ComponentDemoView` still reads `:category` and `:name` params correctly
    - Confirm `ControlsPanel` renders for entries with `propControls` and hides for those without
    - Confirm `usedIn` links still render and navigate correctly
    - No code changes expected — this is a verification step; fix any breakage from the category rename
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 6.2 Write property tests for ControlsPanel behaviour
    - **Property 8: ControlsPanel rendering predicate** — Panel renders iff `propControls` is defined and non-empty; renders one control per PropDefinition
    - **Property 9: Control value propagation** — Changing a control passes the new value to the demo component
    - **Property 10: Control reset round-trip** — Reset restores all values to defaults
    - **Property 11: UsedIn links rendering** — One navigable link per UsedInLink entry
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

- [x] 7. Clean up and remove legacy code
  - [x] 7.1 Remove legacy demo files and unused imports
    - Delete `src/pages/component-demos/TokenManagerDemo.tsx` (replaced by TokenSubPage)
    - Remove the old `foundations` category entries from any remaining references
    - Remove unused imports in `App.tsx` and `ComponentLibraryPage.tsx`
    - Verify no dead code references to the old `foundations` or `custom` categories
    - _Requirements: 4.1, 4.2_

  - [x] 7.2 Write property tests for category overview and lazy loading
    - **Property 6: Category overview completeness** — Navigating to `/admin/components/:category` lists every component in that category
    - **Property 7: Lazy loading** — Every entry's `component` field is a `LazyExoticComponent`
    - **Validates: Requirements 6.3, 6.4**

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- The shadcn Sidebar installation (3.1) is a prerequisite for the layout rewrite (3.2)
- TokenConfigContext (2.1) must exist before TokenSubPage (2.2) can consume it
- Route changes (5.x) depend on both the registry update (1.1) and the new components (2.x, 3.x)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "3.1"] },
    { "id": 1, "tasks": ["1.2", "2.2", "3.2"] },
    { "id": 2, "tasks": ["2.3", "3.3", "5.1"] },
    { "id": 3, "tasks": ["5.2", "5.3", "6.1"] },
    { "id": 4, "tasks": ["6.2", "7.1"] },
    { "id": 5, "tasks": ["7.2"] }
  ]
}
```
