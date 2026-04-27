# Implementation Plan: Permissions Management

## Overview

Implement a three-tab permissions management page at `/settings/permissions` with Permission Groups (master-detail CRUD), User Permissions (account tree with cascading access), and Account Permissions (account-centric user management). All state is local via React context + localStorage. The implementation builds incrementally: data models → shared data → context → shared components → tab-by-tab UI → routing/wiring.

## Tasks

- [x] 1. Create data models and shared data files
  - [x] 1.1 Create permission data models
    - Create `src/models/permissions.ts` with `CrudPermission`, `FunctionalPermissions`, `PermissionGroup`, `PermissionUser`, and `UserAccountAssignment` interfaces/types
    - _Requirements: 10.4, 3.3_
  - [x] 1.2 Create shared users data file
    - Create `src/data/users.ts` exporting the 5 `PermissionUser` objects (Aroha, Nikau, Maia, Tāne, Isla)
    - _Requirements: 11.1_
  - [x] 1.3 Create permissions seed data file
    - Create `src/data/permissions.ts` with `FUNCTIONAL_GROUPS` constant, `getHierarchyIcon` utility, default permission groups (Admin, Editor, Viewer) with correct CRUD toggle definitions per the design table, and seed `UserAccountAssignment` records for all 5 users including cascading assignments
    - _Requirements: 10.1, 10.2, 10.3, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_
  - [x] 1.4 Update SettingsPage to import from shared users file
    - Modify `src/pages/SettingsPage.tsx` to import users from `src/data/users.ts` instead of defining them inline. Derive the `role` field from the user's permission group assignment or keep a local mapping for display purposes.
    - _Requirements: 11.2_

- [x] 2. Extend Checkbox component with indeterminate support
  - [x] 2.1 Add indeterminate prop to Checkbox
    - Add `indeterminate?: boolean` prop to `src/components/shared/Checkbox.tsx`. Use a `ref` + `useEffect` to set `inputRef.current.indeterminate`. Add CSS for `input:indeterminate + .checkmark::after` to show a horizontal dash.
    - _Requirements: 6.7_
  - [ ]* 2.2 Write unit tests for Checkbox indeterminate
    - Test that the indeterminate visual state renders correctly, that checked/unchecked/indeterminate are mutually exclusive visually, and that the prop updates the DOM element's indeterminate property
    - _Requirements: 6.7_

- [x] 3. Create PermissionsContext
  - [x] 3.1 Implement PermissionsContext provider
    - Create `src/contexts/PermissionsContext.tsx` with the full `PermissionsContextValue` interface: permission group CRUD (`addPermissionGroup`, `updatePermissionGroup`, `deletePermissionGroup`), user list, assignment CRUD (`setAssignmentsForUser`, `setAssignmentForUserAccount`, `removeAssignment`, `getAssignmentsForUser`, `getAssignmentsForAccount`), account hierarchy helpers (`getChildAccounts`, `getAllDescendantIds`, `getRootAccounts`), and utilities (`resolveGroupName`, `matchPermissionsToGroup`). Initialise from seed data, persist to `localStorage` under key `ubiquity-permissions`, fall back to seed data on parse failure.
    - _Requirements: 4.5, 4.6, 4.7, 7.2, 7.5, 7.6, 10.3_
  - [ ]* 3.2 Write unit tests for PermissionsContext
    - Test addGroup, updateGroup, deleteGroup (converts assignments to Custom with preserved permissions), assignment CRUD, cascading logic helpers, `matchPermissionsToGroup` auto-detection, and localStorage persistence/fallback
    - _Requirements: 4.2, 4.5, 4.6, 4.7, 7.5, 7.6_

- [x] 4. Checkpoint — Verify foundation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement Permission Groups Tab components
  - [x] 5.1 Create TabBar component
    - Create `src/components/permissions/TabBar.tsx` and `TabBar.module.css`. Render horizontal tab buttons with `role="tab"`, `aria-selected`, teal underline/text for active tab. Accept `tabs`, `activeKey`, `onTabChange` props.
    - _Requirements: 1.3, 1.5, 1.6_
  - [ ]* 5.2 Write unit tests for TabBar
    - Test renders all tabs, active state styling, click fires onTabChange
    - _Requirements: 1.3, 1.5, 1.6_
  - [x] 5.3 Create PermissionCard component
    - Create `src/components/permissions/PermissionCard.tsx` and `PermissionCard.module.css`. Card with functional group name heading, 4 Toggle components (Create/Read/Update/Delete). Support `editable` prop to toggle read-only vs interactive mode.
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [ ]* 5.4 Write property test for PermissionCard
    - **Property 2: Selected group detail shows correct permission cards**
    - **Validates: Requirements 2.3, 2.5, 3.1, 3.2, 3.3**
  - [x] 5.5 Create GroupSidebar component
    - Create `src/components/permissions/GroupSidebar.tsx` and `GroupSidebar.module.css`. Render "+ Create" button, scrollable list of group items (name bold, description muted), selected item with teal background highlight.
    - _Requirements: 2.1, 2.2, 2.6_
  - [ ]* 5.6 Write property test for GroupSidebar
    - **Property 1: Permission Groups sidebar renders one item per group**
    - **Validates: Requirement 2.1**
  - [x] 5.7 Create DeleteGroupDialog component
    - Create `src/components/permissions/DeleteGroupDialog.tsx` and `DeleteGroupDialog.module.css`. Confirmation dialog with group name, affected user count warning, red "Delete" button, and "Cancel" button.
    - _Requirements: 4.6_
  - [x] 5.8 Create PermissionGroupsTab component
    - Create `src/components/permissions/PermissionGroupsTab.tsx` and `PermissionGroupsTab.module.css`. Master-detail layout with CSS Grid (`280px 1fr`). Left: GroupSidebar. Right: group heading with Edit/Delete buttons, PermissionCardGrid, or empty state prompt. Manage local editing state for create/edit flows including inline form with name, description, and permission cards.
    - _Requirements: 2.3, 2.4, 2.5, 2.7, 4.1, 4.2, 4.3, 4.4_

- [x] 6. Implement Permission Group CRUD operations
  - [x] 6.1 Wire create, edit, delete flows in PermissionGroupsTab
    - Connect PermissionGroupsTab to PermissionsContext. Implement: "+ Create" shows inline form with all toggles off, submit validates non-empty name + at least one permission, "Edit" makes fields editable, "Save" calls `updatePermissionGroup`, "Delete" opens DeleteGroupDialog then calls `deletePermissionGroup`.
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  - [ ]* 6.2 Write property test for group creation validation
    - **Property 3: Creating a group with valid name adds it to state**
    - **Validates: Requirement 4.2**
  - [ ]* 6.3 Write property test for empty name rejection
    - **Property 4: Empty or whitespace group name prevents submission**
    - **Validates: Requirement 4.3**
  - [ ]* 6.4 Write property test for group deletion
    - **Property 5: Deleting a group converts assignments to Custom with preserved permissions**
    - **Validates: Requirements 4.6, 4.7**
  - [ ]* 6.5 Write property test for group edit propagation
    - **Property 6: Editing a group propagates to all assigned users**
    - **Validates: Requirement 4.5**

- [x] 7. Checkpoint — Permission Groups Tab complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement User Permissions Tab components
  - [x] 8.1 Create UserSidebar component
    - Create `src/components/permissions/UserSidebar.tsx` and `UserSidebar.module.css`. Render "Users" heading, scrollable list of user items with avatar circle (initials, teal background), name, and email. Selected user gets light background highlight.
    - _Requirements: 5.1, 5.2, 5.3_
  - [ ]* 8.2 Write property test for UserSidebar
    - **Property 7: User sidebar renders all users with required fields**
    - **Validates: Requirements 5.1, 5.2**
  - [x] 8.3 Create AccountTreeNode component
    - Create `src/components/permissions/AccountTreeNode.tsx` and `AccountTreeNode.module.css`. Render hierarchy icon (Buildings/GlobeHemisphereWest/MapPin from Phosphor based on account position), Checkbox with indeterminate support, account name, conditional permission group Dropdown + PencilSimple edit icon when checked. Support `showCheckbox` prop (false for Account Permissions sidebar). CSS `::before` pseudo-elements for visual connecting lines.
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.8_
  - [ ]* 8.4 Write property test for hierarchy icons
    - **Property 10: Hierarchy icons match account tree position**
    - **Validates: Requirements 6.2, 11.4**
  - [x] 8.5 Create AccountTree component
    - Create `src/components/permissions/AccountTree.tsx` and `AccountTree.module.css`. Recursively render AccountTreeNode components from root accounts (`parentId === null`) through children via `childIds`. Implement cascading check/uncheck logic: checking parent checks all descendants with same group, unchecking parent unchecks all descendants, partial children → indeterminate parent. Compute indeterminate state from checked children count vs total children.
    - _Requirements: 6.1, 6.4, 6.5, 6.6, 6.7, 6.9, 6.10, 11.5_
  - [ ]* 8.6 Write property test for account tree rendering
    - **Property 9: Account tree renders all accounts from any valid hierarchy**
    - **Validates: Requirements 6.1, 6.4, 6.10, 11.5**
  - [ ]* 8.7 Write property test for cascading check
    - **Property 11: Checking a parent cascades to all descendants with same group**
    - **Validates: Requirements 6.5, 6.9**
  - [ ]* 8.8 Write property test for cascading uncheck
    - **Property 12: Unchecking a parent unchecks all descendants**
    - **Validates: Requirement 6.6**
  - [ ]* 8.9 Write property test for indeterminate state
    - **Property 13: Partial child selection shows indeterminate parent**
    - **Validates: Requirement 6.7**
  - [x] 8.10 Create PermissionEditPanel component
    - Create `src/components/permissions/PermissionEditPanel.tsx` and `PermissionEditPanel.module.css`. Slide-over or modal panel showing full set of PermissionCards in editable mode for a specific user-account combination. Display resolved group name or "Custom" based on current toggle state using `matchPermissionsToGroup`.
    - _Requirements: 7.4_
  - [x] 8.11 Create UserPermissionsTab component
    - Create `src/components/permissions/UserPermissionsTab.tsx` and `UserPermissionsTab.module.css`. Master-detail layout: left UserSidebar, right area with "Permissions for {User Name}" heading + subtitle, AccountTree with checkboxes and dropdowns, "Save Changes" button (teal, floppy disk icon). Wire to PermissionsContext for reading/writing assignments. Empty state when no user selected.
    - _Requirements: 5.4, 5.5, 7.1, 7.2, 7.3, 7.7, 7.8_
  - [ ]* 8.12 Write property test for permission group dropdown
    - **Property 14: Permission group dropdown lists all groups plus Custom**
    - **Validates: Requirement 7.1**
  - [ ]* 8.13 Write property test for auto-detection
    - **Property 15: Custom permissions auto-detect matching group**
    - **Validates: Requirements 7.5, 7.6**
  - [ ]* 8.14 Write property test for selected user heading
    - **Property 8: Selected user heading shows correct name**
    - **Validates: Requirement 5.4**

- [x] 9. Checkpoint — User Permissions Tab complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement Account Permissions Tab components
  - [x] 10.1 Create UserAccessCard component
    - Create `src/components/permissions/UserAccessCard.tsx` and `UserAccessCard.module.css`. Card displaying user avatar (initials), name, email, permission group Dropdown, and PencilSimple edit icon. Cards stack vertically.
    - _Requirements: 9.1, 9.2_
  - [ ]* 10.2 Write property test for UserAccessCard
    - **Property 17: Account Permissions user cards show all required fields**
    - **Validates: Requirements 9.1, 9.2**
  - [x] 10.3 Create ManageUsersDialog component
    - Create `src/components/permissions/ManageUsersDialog.tsx` and `ManageUsersDialog.module.css`. Modal dialog listing all users with checkboxes. Checked users get a permission group dropdown. Save commits changes. Show "All users already have access" when applicable.
    - _Requirements: 9.6_
  - [x] 10.4 Create AccountPermissionsTab component
    - Create `src/components/permissions/AccountPermissionsTab.tsx` and `AccountPermissionsTab.module.css`. Master-detail layout: left AccountSidebar (AccountTreeNode reused without checkboxes via `showCheckbox={false}`), right area with "Users with Access to {Account Name}" heading + "{N} user(s) have access" subtitle, vertically stacked UserAccessCards, "+ Manage Users" button (teal). Wire to PermissionsContext. Empty state when no account selected.
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_
  - [ ]* 10.5 Write property test for account permissions heading
    - **Property 16: Account Permissions heading shows correct user count**
    - **Validates: Requirement 8.4**

- [x] 11. Create PermissionsPage and wire routing
  - [x] 11.1 Create PermissionsPage
    - Create `src/pages/PermissionsPage.tsx` and `PermissionsPage.module.css`. Render PageShell with title "Permissions", TabBar with three tabs, and conditionally render the active tab component. Manage active tab state via `useState<'groups' | 'users' | 'accounts'>('groups')`.
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 1.6_
  - [x] 11.2 Add route and PermissionsContext provider to App.tsx
    - Import PermissionsPage and PermissionsContext.Provider in `src/App.tsx`. Add `<Route path="/settings/permissions" element={<PermissionsPage />} />`. Wrap with PermissionsContext.Provider alongside existing providers.
    - _Requirements: 1.1_
  - [x] 11.3 Add "Manage Permissions" link to SettingsPage
    - Add a navigation link/button in the "Users & Permissions" section of `src/pages/SettingsPage.tsx` that navigates to `/settings/permissions`.
    - _Requirements: 1.2_

- [x] 12. Final checkpoint — Full integration
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using fast-check
- Unit tests validate specific examples and edge cases using Vitest + React Testing Library
- The design uses TypeScript + React throughout — all code examples should use this stack
- CSS Modules are used for all component styling, consistent with the existing codebase
