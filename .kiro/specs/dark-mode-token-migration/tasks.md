# Implementation Plan: Dark Mode Token Migration

## Overview

Migrate ~95 CSS Module files from hardcoded hex values and primitive palette variables to semantic design tokens, and replace the dark mode text button with a toggle switch. The migration is mechanical — context-sensitive find-and-replace using the mapping table from the design document. Files are processed in batches by component area to allow incremental verification.

## Tasks

- [x] 1. Replace dark mode text button with toggle switch in AppNavBar
  - [x] 1.1 Update AppNavBar.tsx to use shadcn Switch component
    - Import `Switch` from `src/components/ui/switch`
    - Replace the dark mode `<button>` in the avatar dropdown with a `<div>` containing a "Dark Mode" label and `<Switch checked={darkMode} onCheckedChange={setDarkMode} />`
    - Remove the conditional "Light Mode" / "Dark Mode" text
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 1.2 Add toggle switch styles to AppNavBar.module.css
    - Add `.darkModeToggle` class: flex, align-items center, justify-content space-between, padding 8px 12px, border-radius 4px
    - Add `.darkModeLabel` class: Inter 13px, font-weight 500, color var(--color-text-primary)
    - _Requirements: 5.6_

  - [x] 1.3 Write unit tests for dark mode toggle switch
    - Test that avatar dropdown renders Switch component with "Dark Mode" label
    - Test that Switch is checked when darkMode state is true
    - Test that clicking Switch toggles data-theme on document root
    - Test that no text button with "Light Mode"/"Dark Mode" text exists in dropdown
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 2. Migrate `src/components/layout/` CSS modules (excluding AppNavBar)
  - [x] 2.1 Migrate layout CSS modules to semantic tokens
    - Files: `AccountSwitcher.module.css`, `AdminAccountBanner.module.css`, `ChangePasswordModal.module.css`, `ChangelogBanner.module.css`, `FeatureFlagsModal.module.css`, `PageShell.module.css`, `RoleSimulator.module.css`, `RootAccountSelector.module.css`, `WhatsNewPanel.module.css`
    - Use the mapping table from the design document to replace hex values and primitive variables
    - Only replace values in colour-accepting CSS properties (color, background, background-color, border, border-color, border-top, border-bottom, border-left, border-right, outline, outline-color, box-shadow, fill, stroke, accent-color)
    - Apply context-sensitive mapping: zinc-200 in border → border-default, zinc-200 in background → background-sunken
    - Reference AppNavBar.module.css as the canonical example of correct token usage
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 3.1, 6.1, 6.5, 6.6_

- [x] 3. Migrate `src/components/billing/` CSS modules
  - [x] 3.1 Migrate billing CSS modules to semantic tokens
    - Files: `BillingFilters.module.css`, `BillingTreeTable.module.css`, `DateRangePicker.module.css`
    - Use the mapping table from the design document to replace hex values and primitive variables
    - Only replace values in colour-accepting CSS properties
    - Apply context-sensitive mapping per the design document
    - _Requirements: 1.1, 1.5, 2.1, 2.2, 2.3, 3.1, 6.1, 6.5, 6.6_

- [x] 4. Migrate `src/components/campaign/` CSS modules
  - [x] 4.1 Migrate campaign CSS modules to semantic tokens
    - Files: `BreadcrumbBar.module.css`, `CampaignFolderCard.module.css`, `CreateCampaignDialog.module.css`, `CreateJourneyDialog.module.css`, `DeleteConfirmDialog.module.css`, `JourneyCard.module.css`, `TagFilter.module.css`
    - Use the mapping table from the design document to replace hex values and primitive variables
    - Only replace values in colour-accepting CSS properties
    - Apply context-sensitive mapping per the design document
    - _Requirements: 1.1, 1.5, 2.1, 2.2, 2.3, 3.1, 6.1, 6.5, 6.6_

- [x] 5. Migrate `src/components/shared/` CSS modules
  - [x] 5.1 Migrate shared CSS modules to semantic tokens
    - Files: `Button.module.css`, `CardSelector.module.css`, `Checkbox.module.css`, `CombinatorToggle.module.css`, `ComingSoonPlaceholder.module.css`, `DataTable.module.css`, `DataTypeBadge.module.css`, `DragHandle.module.css`, `Dropdown.module.css`, `FeedbackWidget.module.css`, `FilterBuilder.module.css`, `FilterGroup.module.css`, `FilterRuleRow.module.css`, `MetricCard.module.css`, `Modal.module.css`, `OperatorDropdown.module.css`, `ProtocolIcon.module.css`, `RadioCard.module.css`, `StatusBadge.module.css`, `TextField.module.css`, `Toast.module.css`, `Toggle.module.css`, `ValueInput.module.css`
    - Use the mapping table from the design document to replace hex values and primitive variables
    - Only replace values in colour-accepting CSS properties
    - Apply context-sensitive mapping per the design document
    - _Requirements: 1.1, 1.5, 2.1, 2.2, 2.3, 3.1, 6.1, 6.5, 6.6_

- [x] 6. Migrate `src/components/dashboard/` CSS modules
  - [x] 6.1 Migrate dashboard CSS modules to semantic tokens
    - Files: `ActivityLogModal.module.css`, `AutomationSettingsModal.module.css`, `DeleteConfirmModal.module.css`, `HistoryModal.module.css`, `OverflowMenu.module.css`
    - Use the mapping table from the design document to replace hex values and primitive variables
    - Only replace values in colour-accepting CSS properties
    - Apply context-sensitive mapping per the design document
    - _Requirements: 1.1, 1.5, 2.1, 2.2, 2.3, 3.1, 6.1, 6.5, 6.6_

- [x] 7. Migrate `src/components/journey/` CSS modules
  - [x] 7.1 Migrate journey CSS modules to semantic tokens
    - Files: `CanvasToolbar.module.css`, `ContentModal.module.css`, `InspectorPanel.module.css`, `JourneyCanvas.module.css`, `NodePalette.module.css`, `ValidationSummary.module.css`, `config/configStyles.module.css`, `nodes/nodeStyles.module.css`
    - Use the mapping table from the design document to replace hex values and primitive variables
    - Only replace values in colour-accepting CSS properties
    - Apply context-sensitive mapping per the design document
    - _Requirements: 1.1, 1.5, 2.1, 2.2, 2.3, 3.1, 6.1, 6.5, 6.6_

- [x] 8. Checkpoint — Verify component migrations
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Migrate remaining `src/components/` subdirectories
  - [x] 9.1 Migrate assets CSS modules to semantic tokens
    - Files: `AssetCard.module.css`, `AssetDetailPanel.module.css`, `CampaignPicker.module.css`, `ScopeSelector.module.css`, `SearchInput.module.css`, `TypeFilter.module.css`, `UploadDialog.module.css`
    - Use the mapping table from the design document to replace hex values and primitive variables
    - Only replace values in colour-accepting CSS properties
    - Apply context-sensitive mapping per the design document
    - _Requirements: 1.1, 1.5, 2.1, 2.2, 2.3, 3.1, 6.1, 6.5, 6.6_

  - [x] 9.2 Migrate importer CSS modules to semantic tokens
    - Files: `FileSettingsStep.module.css`, `ImportConfigStep.module.css`, `ImportMappingStep.module.css`, `ImporterReviewStep.module.css`, `ImporterWizardModal.module.css`, `NotificationsStep.module.css`, `placeholderStep.module.css`
    - Use the mapping table from the design document to replace hex values and primitive variables
    - Only replace values in colour-accepting CSS properties
    - Apply context-sensitive mapping per the design document
    - _Requirements: 1.1, 1.5, 2.1, 2.2, 2.3, 3.1, 6.1, 6.5, 6.6_

  - [x] 9.3 Migrate permissions CSS modules to semantic tokens
    - Files: `AccountPermissionsTab.module.css`, `AccountTree.module.css`, `AccountTreeNode.module.css`, `DeleteGroupDialog.module.css`, `GroupSidebar.module.css`, `ManageUsersDialog.module.css`, `PermissionCard.module.css`, `PermissionEditPanel.module.css`, `PermissionGroupsTab.module.css`, `TabBar.module.css`, `UserAccessCard.module.css`, `UserPermissionsTab.module.css`, `UserSidebar.module.css`
    - Use the mapping table from the design document to replace hex values and primitive variables
    - Only replace values in colour-accepting CSS properties
    - Apply context-sensitive mapping per the design document
    - _Requirements: 1.1, 1.5, 2.1, 2.2, 2.3, 3.1, 6.1, 6.5, 6.6_

  - [x] 9.4 Migrate wizard CSS modules to semantic tokens
    - Files: `DataPreview.module.css`, `DataSourceStep.module.css`, `DataTypeStep.module.css`, `DeliveryStep.module.css`, `ExporterScheduleStep.module.css`, `FieldMappingStep.module.css`, `FieldSelectionStep.module.css`, `FileNamingInput.module.css`, `KeyFieldPicker.module.css`, `OutputConfigStep.module.css`, `ReviewStep.module.css`, `WizardModal.module.css`, `WizardNavButtons.module.css`, `WizardStepper.module.css`
    - Use the mapping table from the design document to replace hex values and primitive variables
    - Only replace values in colour-accepting CSS properties
    - Apply context-sensitive mapping per the design document
    - _Requirements: 1.1, 1.5, 2.1, 2.2, 2.3, 3.1, 6.1, 6.5, 6.6_

  - [x] 9.5 Migrate tokens CSS modules to semantic tokens
    - Files: `ActionBar.module.css`, `ColourPicker.module.css`, `ColourSection.module.css`, `IconSection.module.css`, `RadiusSection.module.css`, `SpacingSection.module.css`, `TypographySection.module.css`
    - Use the mapping table from the design document to replace hex values and primitive variables
    - Only replace values in colour-accepting CSS properties
    - Apply context-sensitive mapping per the design document
    - _Requirements: 1.1, 1.5, 2.1, 2.2, 2.3, 3.1, 6.1, 6.5, 6.6_

- [x] 10. Migrate `src/pages/` CSS modules
  - [x] 10.1 Migrate page CSS modules to semantic tokens
    - Files: `ActivityLogPage.module.css`, `AssetsPage.module.css`, `AttributesPage.module.css`, `BillingReportPage.module.css`, `CampaignDetailPage.module.css`, `CampaignsPage.module.css`, `ComponentLibraryPage.module.css`, `DashboardPage.module.css`, `DatabasesPage.module.css`, `EmailsPage.module.css`, `FormsPage.module.css`, `HeaderPlaygroundPage.module.css`, `JourneyCanvasPage.module.css`, `JourneysPage.module.css`, `LoginPage.module.css`, `OverviewDashboardPage.module.css`, `PageComponentsPage.module.css`, `PermissionsPage.module.css`, `PricingPage.module.css`, `SegmentDetailPage.module.css`, `SegmentsPage.module.css`, `SmsPage.module.css`, `TemplatesPage.module.css`, `UserManagementPage.module.css`, `pages.module.css`
    - Use the mapping table from the design document to replace hex values and primitive variables
    - Only replace values in colour-accepting CSS properties
    - Apply context-sensitive mapping per the design document
    - _Requirements: 1.1, 1.5, 2.1, 2.2, 2.3, 3.1, 6.1, 6.5, 6.6_

- [x] 11. Write property-based validation tests
  - [x] 11.1 Write property test for zero hardcoded hex colours
    - **Property 1: Zero hardcoded hex colours in colour-accepting properties**
    - Create a Vitest test that globs all `.module.css` files in scope (`src/components/**/*.module.css` excluding `src/components/ui/`, and `src/pages/**/*.module.css`)
    - Parse each file to extract colour-accepting property declarations
    - Assert zero matches for case-insensitive regex `#[0-9a-fA-F]{3,8}` within those declarations
    - **Validates: Requirements 1.1, 1.5**

  - [x] 11.2 Write property test for zero primitive palette variable references
    - **Property 2: Zero primitive palette variable references in colour-accepting properties**
    - Create a Vitest test that globs all `.module.css` files in scope
    - Parse each file to extract colour-accepting property declarations
    - Assert zero matches for `var(--color-zinc-*)`, `var(--color-primary-*)`, and `var(--color-grey-*)` within those declarations
    - **Validates: Requirements 2.1, 2.2, 2.3**

- [ ] 12. Final checkpoint — Build passes, all tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - Verify no changes to `src/styles/tokens.css`, `src/styles/globals.css`, or `src/components/ui/`
  - Confirm scope boundaries per Requirement 6

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each migration task references the mapping table in the design document — implementers should have `design.md` open as reference
- AppNavBar.module.css is already fully migrated and serves as the canonical example of correct semantic token usage
- Context matters: the same primitive maps to different semantic tokens depending on the CSS property (e.g. `--color-zinc-200` in border → `--color-border-default`, in background → `--color-background-sunken`)
- Only colour-accepting CSS properties should be changed — leave spacing, font-size, border-radius, transitions, etc. untouched
- Known deviations: `#FFFFFF` (background) → `--color-background-default` (#FAFAFA, ΔL ≈ 0.4%), `--color-zinc-600` (text) → `--color-text-secondary` (#71717A, lighter by 1 step)
- Scope exclusions: `src/components/ui/` (shadcn/Tailwind), `tokens.css`, `globals.css`, non-module CSS files

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "3.1", "4.1"] },
    { "id": 1, "tasks": ["1.2", "5.1", "6.1", "7.1"] },
    { "id": 2, "tasks": ["1.3", "9.1", "9.2", "9.3"] },
    { "id": 3, "tasks": ["9.4", "9.5", "10.1"] },
    { "id": 4, "tasks": ["11.1", "11.2"] }
  ]
}
```
