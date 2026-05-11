# Implementation Plan: Tailwind Token Migration

## Overview

Migrate UbiQuity from a dual styling system (CSS Modules + Tailwind) to a single Tailwind-based system across 4 phases. Each phase produces a working build. The migration consolidates ~129 CSS Module files into Tailwind utility classes, removes the VARIABLE_MAP dual injection layer, and makes `globals.css` the single source of truth for design tokens.

## Tasks

- [x] 1. Phase 1 — Token Foundation
  - [x] 1.1 Restructure globals.css with consolidated token set
    - Add all canonical tokens to `:root` (core surfaces, primary, secondary, muted, accent, destructive, warning, success, info, border, disabled, extended, sidebar, charts)
    - Add mint palette CSS variables (mint-50 through mint-950)
    - Add dark mode overrides in `[data-theme="dark"]` for every token
    - Expose all tokens in `@theme inline` block so Tailwind utilities are generated
    - _Requirements: 1.1, 2.1, 2.2, 2.5, 5.1, 5.2, 5.3, 5.4, 7.1, 8.1, 8.2_

  - [x] 1.2 Add backward-compatible aliases in tokens.css
    - For each removed UDS variable (e.g. `--color-accent-default`), add an alias pointing to the new canonical token (e.g. `var(--primary)`)
    - Ensure all existing CSS Module `var(--color-*)` references still resolve correctly
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10_

  - [x] 1.3 Write property test: Token Coverage Completeness (Property 3)
    - **Property 3: Token Coverage Completeness**
    - Parse globals.css at test time, for each token in DEFAULT_TOKEN_CONFIG verify `:root` and `@theme inline` entries exist
    - **Validates: Requirements 2.1, 2.2**

  - [x] 1.4 Write unit test: Mint palette in globals.css
    - Verify all 11 mint variables (mint-50 through mint-950) are defined in `:root`
    - Verify dark mode overrides exist for every `:root` token
    - **Validates: Requirements 2.5, 7.1, 8.1**

- [x] 2. Checkpoint — Phase 1 complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify the build compiles without errors
  - Verify both light and dark modes render correctly with no visual changes

- [x] 3. Phase 2 — Token Manager Simplification
  - [x] 3.1 Remove VARIABLE_MAP from defaultTokenConfig.ts
    - Delete the `VARIABLE_MAP` export entirely
    - Remove all UDS-named tokens from `DEFAULT_TOKEN_CONFIG.colours` (e.g. `accent-hover`, `danger-subtle`, `neutral-*`, `state-*`)
    - Add new canonical tokens that weren't previously in the config (`disabled`, `disabled-foreground`, `border-strong`, `tertiary-foreground`)
    - _Requirements: 4.1, 4.5_

  - [x] 3.2 Update COLOUR_TOKEN_GROUPS and TOKEN_DESCRIPTIONS
    - Rewrite `COLOUR_TOKEN_GROUPS` to reference only canonical shadcn-named tokens (per design document section 4)
    - Update `TOKEN_DESCRIPTIONS` to remove `duplicateOf` annotations and UDS-named entries
    - _Requirements: 4.5, 5.5, 5.6_

  - [x] 3.3 Simplify useTokenConfig.ts injection logic
    - Remove the `VARIABLE_MAP` import
    - Simplify `injectColourVariables` to always use `--${tokenName}` format (single variable per token)
    - Ensure Token Manager still previews colour changes in real time
    - _Requirements: 4.2, 4.3, 4.4_

  - [x] 3.4 Write property test: Single-Variable Injection Correctness (Property 2)
    - **Property 2: Single-Variable Injection Correctness**
    - Generate random token names from config keys and random valid PrimitiveRefs using fast-check
    - Call injection function, assert exactly one CSS variable set per call
    - Minimum 100 iterations
    - **Validates: Requirements 4.2, 4.3, 4.4**

  - [x] 3.5 Write property test: No UDS Naming in Canonical Config (Property 4)
    - **Property 4: No UDS Naming in Canonical Config**
    - Iterate all keys in DEFAULT_TOKEN_CONFIG.colours, assert none match forbidden UDS patterns (`color-`, `state-`, `danger-` prefix except `danger-hover`/`danger-text`, `text-` prefix except `text-inverse`)
    - **Validates: Requirements 5.5, 5.6**

  - [x] 3.6 Write property test: Token Group Consistency (Property 5)
    - **Property 5: Token Group Consistency**
    - For each token name listed in any group within COLOUR_TOKEN_GROUPS, assert it exists as a key in DEFAULT_TOKEN_CONFIG.colours
    - **Validates: Requirements 4.5**

  - [x] 3.7 Write property test: Foreground Pairing Invariant (Property 6)
    - **Property 6: Foreground Pairing Invariant**
    - For each token ending with `-foreground`, assert the base token (without suffix) exists in DEFAULT_TOKEN_CONFIG.colours
    - **Validates: Requirements 5.1**

  - [x] 3.8 Write unit test: No VARIABLE_MAP export
    - Verify `defaultTokenConfig.ts` does not export VARIABLE_MAP
    - Verify Token Manager injection sets exactly one CSS variable per token update
    - **Validates: Requirements 4.1, 4.3**

- [x] 4. Checkpoint — Phase 2 complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify Token Manager still functions: change a colour, confirm it applies immediately
  - Verify build compiles without errors

- [x] 5. Phase 3a — Migrate simple cards, badges, and pills
  - [x] 5.1 Migrate shared leaf components (StatusBadge, DataTypeBadge, MetricCard, CardSelector, RadioCard, ProtocolIcon, ComingSoonPlaceholder, Toast, Toggle)
    - Convert each `.module.css` to Tailwind utilities in JSX
    - Use `cn()` for conditional/dynamic classes
    - Delete `.module.css` files and remove imports
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7_

  - [x] 5.2 Migrate campaign cards (CampaignFolderCard, JourneyCard, TagFilter)
    - Convert each `.module.css` to Tailwind utilities in JSX
    - Delete `.module.css` files and remove imports
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

  - [x] 5.3 Migrate asset components (AssetCard, AssetDetailPanel, CampaignPicker, ScopeSelector, SearchInput, TypeFilter, UploadDialog)
    - Convert each `.module.css` to Tailwind utilities in JSX
    - Delete `.module.css` files and remove imports
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

  - [x] 5.4 Migrate dashboard components (ActivityLogModal, AutomationSettingsModal, DeleteConfirmModal, HistoryModal, OverflowMenu)
    - Convert each `.module.css` to Tailwind utilities in JSX
    - Delete `.module.css` files and remove imports
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [x] 6. Phase 3b — Migrate form inputs, filters, and search
  - [x] 6.1 Migrate shared form components (Button, Checkbox, TextField, ValueInput, Dropdown, OperatorDropdown, DragHandle, FeedbackWidget)
    - Convert each `.module.css` to Tailwind utilities in JSX
    - Use `cn()` for variant/state-based styling (hover, focus, disabled)
    - Handle focus-visible ring with Tailwind `focus-visible:ring-2 focus-visible:ring-ring`
    - Delete `.module.css` files and remove imports
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 6.2 Migrate filter components (FilterBuilder, FilterGroup, FilterRuleRow, CombinatorToggle)
    - Convert each `.module.css` to Tailwind utilities in JSX
    - Delete `.module.css` files and remove imports
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

  - [x] 6.3 Migrate billing components (BillingFilters, BillingTreeTable, DateRangePicker)
    - Convert each `.module.css` to Tailwind utilities in JSX
    - Delete `.module.css` files and remove imports
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [x] 7. Checkpoint — Phase 3a+3b complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify build compiles without errors
  - Verify migrated components render correctly in both light and dark modes

- [x] 8. Phase 3c — Migrate tables, lists, and panels
  - [x] 8.1 Migrate shared table/panel components (DataTable, Modal)
    - Convert each `.module.css` to Tailwind utilities in JSX
    - Handle complex layout patterns (scrollable areas, sticky headers)
    - Delete `.module.css` files and remove imports
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 8.2 Migrate permissions components (AccountPermissionsTab, AccountTree, AccountTreeNode, DeleteGroupDialog, GroupSidebar, ManageUsersDialog, PermissionCard, PermissionEditPanel, PermissionGroupsTab, TabBar, UserAccessCard, UserPermissionsTab, UserSidebar)
    - Convert each `.module.css` to Tailwind utilities in JSX
    - Delete `.module.css` files and remove imports
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

  - [x] 8.3 Migrate token manager components (ActionBar, ColourPicker, ColourSection, IconSection, RadiusSection, SpacingSection, TypographySection)
    - Convert each `.module.css` to Tailwind utilities in JSX
    - Delete `.module.css` files and remove imports
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [x] 9. Phase 3d — Migrate modals, dialogs, and wizard overlays
  - [x] 9.1 Migrate campaign dialogs (BreadcrumbBar, CreateCampaignDialog, CreateJourneyDialog, DeleteConfirmDialog)
    - Convert each `.module.css` to Tailwind utilities in JSX
    - Delete `.module.css` files and remove imports
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

  - [x] 9.2 Migrate wizard components (WizardModal, WizardStepper, WizardNavButtons, DataPreview, DataSourceStep, DataTypeStep, DeliveryStep, ExporterScheduleStep, FieldMappingStep, FieldSelectionStep, FileNamingInput, KeyFieldPicker, OutputConfigStep, ReviewStep)
    - Convert each `.module.css` to Tailwind utilities in JSX
    - Handle stepper active/complete states with `cn()`
    - Delete `.module.css` files and remove imports
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 9.3 Migrate importer components (FileSettingsStep, ImportConfigStep, ImporterReviewStep, ImporterWizardModal, ImportMappingStep, NotificationsStep, placeholderStep)
    - Convert each `.module.css` to Tailwind utilities in JSX
    - Delete `.module.css` files and remove imports
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [x] 10. Checkpoint — Phase 3c+3d complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify build compiles without errors
  - Verify all modals and wizard flows render correctly in both light and dark modes

- [x] 11. Phase 3e — Migrate page layouts, nav, and shells
  - [x] 11.1 Migrate layout components (AppNavBar, AccountSwitcher, AdminAccountBanner, ChangelogBanner, ChangePasswordModal, FeatureFlagsModal, PageShell, RoleSimulator, RootAccountSelector, WhatsNewPanel)
    - Convert each `.module.css` to Tailwind utilities in JSX
    - Handle nav active states, dropdown positioning, and z-index with Tailwind
    - Delete `.module.css` files and remove imports
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 11.2 Migrate journey canvas components (CanvasToolbar, ContentModal, InspectorPanel, JourneyCanvas, NodePalette, ValidationSummary, nodeStyles)
    - Convert each `.module.css` to Tailwind utilities in JSX
    - Handle canvas-specific positioning and node styling
    - Delete `.module.css` files and remove imports
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 12. Phase 3f — Migrate page-level styles
  - [x] 12.1 Migrate page CSS Modules batch 1 (ActivityLogPage, AssetsPage, AttributesPage, BillingReportPage, CampaignDetailPage, CampaignsPage, ComponentLibraryPage, DashboardPage, DatabasesPage)
    - Convert each `.module.css` to Tailwind utilities in JSX
    - Delete `.module.css` files and remove imports
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

  - [x] 12.2 Migrate page CSS Modules batch 2 (EmailsPage, FormsPage, HeaderPlaygroundPage, JourneyCanvasPage, JourneysPage, LoginPage, OverviewDashboardPage, PageComponentsPage, pages.module.css)
    - Convert each `.module.css` to Tailwind utilities in JSX
    - Delete `.module.css` files and remove imports
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

  - [x] 12.3 Migrate page CSS Modules batch 3 (PermissionsPage, PricingPage, SegmentDetailPage, SegmentsPage, SmsPage, TemplatesPage, UserManagementPage)
    - Convert each `.module.css` to Tailwind utilities in JSX
    - Delete `.module.css` files and remove imports
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.7_

- [x] 13. Checkpoint — Phase 3 complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify zero `.module.css` files remain in the project
  - Verify build compiles without errors
  - Verify all pages render correctly in both light and dark modes

- [x] 14. Phase 4 — Cleanup and steering file updates
  - [x] 14.1 Delete tokens.css and remove all references
    - Delete `src/styles/tokens.css`
    - Remove any import of `tokens.css` from the project (check `index.html`, `main.tsx`, `globals.css`)
    - Remove backward-compatible aliases from globals.css if any remain
    - _Requirements: 2.3, 2.4, 6.5_

  - [x] 14.2 Delete generate-tokens.mjs script
    - Remove `scripts/generate-tokens.mjs` (no longer needed)
    - _Requirements: 2.3_

  - [x] 14.3 Update tech-stack.md steering file
    - Replace CSS Modules description with Tailwind CSS as the single styling mechanism for all components
    - State that `src/styles/globals.css` is the single source of truth for design tokens
    - Remove references to `tokens.css`
    - _Requirements: 6.1, 6.4_

  - [x] 14.4 Update project-structure.md steering file
    - Remove references to CSS Modules as the default styling approach
    - Remove the co-location rule for `.module.css` files
    - Document that all components use Tailwind utility classes and `cn()` for conditional styling
    - Update the directory map to remove `.module.css` file references
    - _Requirements: 6.2, 6.3_

  - [x] 14.5 Write property test: Zero CSS Modules Remaining (Property 1)
    - **Property 1: Zero CSS Modules Remaining**
    - Scan `src/components/` and `src/pages/` directories, verify no `.module.css` files exist
    - Verify no `.tsx` file contains an import referencing a `.module.css` file
    - **Validates: Requirements 3.1, 3.2, 3.4, 3.7, 8.3**

  - [x] 14.6 Write unit tests: Final migration verification
    - Verify zero `.module.css` files exist in `src/`
    - Verify `src/styles/tokens.css` does not exist
    - Verify `tech-stack.md` mentions "single styling mechanism"
    - Verify `project-structure.md` does not reference CSS Modules
    - **Validates: Requirements 2.3, 3.7, 6.1, 6.2, 6.3**

- [x] 15. Final checkpoint — Migration complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify build compiles without errors
  - Verify all pages render correctly in both light and dark modes
  - Verify Token Manager functions correctly with single injection

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation — each phase produces a working build
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The component migration batches (Phase 3a–3f) follow dependency order: leaf components first, layout/page components last
- Use the Variable-to-Utility Mapping table in the design document as the primary reference during component migration
- All components should use `cn()` from `src/lib/utils.ts` for conditional class composition

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3", "1.4"] },
    { "id": 3, "tasks": ["3.1"] },
    { "id": 4, "tasks": ["3.2", "3.3"] },
    { "id": 5, "tasks": ["3.4", "3.5", "3.6", "3.7", "3.8"] },
    { "id": 6, "tasks": ["5.1", "5.2", "5.3", "5.4"] },
    { "id": 7, "tasks": ["6.1", "6.2", "6.3"] },
    { "id": 8, "tasks": ["8.1", "8.2", "8.3"] },
    { "id": 9, "tasks": ["9.1", "9.2", "9.3"] },
    { "id": 10, "tasks": ["11.1", "11.2"] },
    { "id": 11, "tasks": ["12.1", "12.2", "12.3"] },
    { "id": 12, "tasks": ["14.1", "14.2"] },
    { "id": 13, "tasks": ["14.3", "14.4"] },
    { "id": 14, "tasks": ["14.5", "14.6"] }
  ]
}
```
