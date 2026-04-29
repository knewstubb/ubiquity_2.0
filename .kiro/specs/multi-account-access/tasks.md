# Implementation Plan: Multi-Account Access

## Overview

Extend the UbiQuity 2.0 prototype to support multi-account access patterns: single-account users (unchanged), multi-account users (root switching via AccountSwitcher), and platform admins (root switching via avatar dropdown with All Accounts mode). Introduces PlatformAdminContext, refactors AccountContext for root-account awareness, modifies PermissionsContext for per-root permission resolution, and updates the nav bar UI. All data is mock/seed data.

## Tasks

- [x] 1. Seed data and utility foundations
  - [x] 1.1 Add multi-account user and CCC/STC assignments to seed data
    - Add `usr-012` ("Jordan Blake", `jordan@ubiquity.io`) to `src/data/users.ts`
    - Add assignments for `usr-012`: `grp-admin` on `acc-master`, `grp-viewer` on `acc-ccc`
    - Add assignments for existing CCC users (`usr-006` through `usr-008`) across CCC account tree
    - Add assignments for existing STC users (`usr-009` through `usr-011`) across STC account tree
    - Preserve all existing Serenity Spa assignments unchanged
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 1.2 Create `resolveAccessibleRoots` utility function
    - Create `src/lib/account-utils.ts`
    - Implement `resolveAccessibleRoots(assignments, allAccounts, userId)` that traces each assigned account to its root ancestor
    - Implement `getAccountTree(rootId, allAccounts)` that returns root + all descendants
    - Export both functions
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ]* 1.3 Write property test for root resolution completeness
    - Property 1: Root Account Resolution Completeness
    - Generate random assignment sets with fast-check, verify resolved roots match expected set
    - _Validates: Requirements 1.1, 1.2, 1.3_

  - [x] 1.4 Create `resolveEffectivePermissions` utility function
    - Add to `src/lib/account-utils.ts`
    - Implement permission union logic: for each functional group, OR all CRUD booleans across assignments within the account tree
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 1.5 Write property test for permission union correctness
    - Property 6: Permission Union Within Tree
    - Generate multiple assignments with varying permissions, verify OR logic holds
    - _Validates: Requirements 4.1, 4.2, 4.3_

- [x] 2. PlatformAdminContext
  - [x] 2.1 Create `src/contexts/PlatformAdminContext.tsx`
    - Define `PLATFORM_ADMIN_EMAILS` list (include `knewstubb@gmail.com` and `local@ubiquity.dev`)
    - Create `PlatformAdminProvider` that reads `user.email` from `useAuth()`
    - Expose `isPlatformAdmin` boolean via `usePlatformAdmin()` hook
    - Handle empty/misconfigured email list (all users non-admin)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 2.2 Write unit tests for PlatformAdminContext
    - Test: matching email returns `isPlatformAdmin: true`
    - Test: non-matching email returns `isPlatformAdmin: false`
    - Test: empty email list returns `isPlatformAdmin: false` for all
    - Test: case-insensitive email matching
    - _Validates: Requirements 5.1, 5.4_

- [x] 3. Refactor AccountContext for root-account awareness
  - [x] 3.1 Extend `SessionState` in `src/lib/session-store.ts`
    - Add `selectedRootAccountId: string | null` field to `SessionState` interface
    - Update `saveSession` and `loadSession` to handle the new field
    - Use `'__all__'` as the stored string for All Accounts Mode (null in-memory)
    - _Requirements: 10.1, 10.2_

  - [x] 3.2 Refactor `src/contexts/AccountContext.tsx`
    - Add `usePlatformAdmin()` dependency
    - Compute `accessibleRootAccounts` using `resolveAccessibleRoots` (or all roots if platform admin)
    - Derive `accessPattern`: `'platform-admin'` | `'multi-account'` | `'single-account'`
    - Add `activeRootAccountId` state with session persistence (restore on mount, save on change)
    - Add `isAllAccountsMode` derived from `activeRootAccountId === null`
    - Add `accountsInActiveTree` computed from active root (or all accounts in All Accounts Mode)
    - Reset `selectedAccountId` to root ID when `activeRootAccountId` changes
    - Implement fallback: if stored root ID is no longer accessible, use first accessible root
    - Default `activeRootAccountId` to first accessible root on initial load (or null for platform admin if stored as All Accounts)
    - Preserve all existing interface methods (`filterByAccount`, `setSelectedAccountId`, etc.)
    - Update `filterByAccount` to return all items in All Accounts Mode
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.2, 3.3, 3.5, 7.3, 10.1, 10.2, 10.3_

  - [ ]* 3.3 Write unit tests for AccountContext root switching
    - Test: single-account user gets correct accessPattern and single root
    - Test: multi-account user gets correct accessPattern and multiple roots
    - Test: platform admin gets all roots
    - Test: root switch resets selectedAccountId to new root
    - Test: session persistence round-trip for root selection
    - Test: fallback when stored root is invalid
    - _Validates: Properties 1, 2, 3, 4, 9_

- [x] 4. Checkpoint
  - Verify all utility functions and contexts work correctly. Run tests. Confirm provider tree compiles.

- [x] 5. Refactor PermissionsContext for per-root permissions
  - [x] 5.1 Modify `src/contexts/PermissionsContext.tsx`
    - Add dependency on `useAccount()` to read `activeRootAccountId` and `accountsInActiveTree`
    - Add `effectivePermissions` to context value, computed via `resolveEffectivePermissions`
    - Re-resolve `effectivePermissions` when `activeRootAccountId` changes
    - In All Accounts Mode, compute union across all assignments
    - Preserve all existing CRUD methods and assignment management
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 5.2 Write unit test for per-root permission resolution
    - Test: user with Admin on root A and Viewer on root B gets Admin permissions when root A is active
    - Test: switching to root B yields Viewer permissions
    - Test: child-only assignments resolve correctly
    - _Validates: Properties 5, 6_

- [x] 6. Update App.tsx provider tree
  - [x] 6.1 Insert `PlatformAdminProvider` into the provider tree in `src/App.tsx`
    - Place between `RoleSimulatorProvider` and `AccountProvider` (after CollaborationProvider)
    - Import `PlatformAdminProvider` from `../contexts/PlatformAdminContext`
    - No other provider ordering changes
    - _Requirements: 5.1_

- [x] 7. UI: AccountSwitcher multi-account support
  - [x] 7.1 Modify `src/components/layout/AccountSwitcher.tsx`
    - Read `accessPattern`, `accessibleRootAccounts`, `activeRootAccountId`, `setActiveRootAccountId`, `isAllAccountsMode`, `accountsInActiveTree` from `useAccount()`
    - **Single-account**: Render unchanged (root + children in dropdown)
    - **Multi-account**: Add "Root Accounts" section at top of dropdown with divider. List accessible roots with active indicator (teal text + Check icon). Below divider, show active root's child/grandchild accounts
    - **Platform admin**: Show active root name in trigger (or "All Accounts"). In All Accounts Mode, disable dropdown (show "All Accounts" as trigger text, no child list)
    - Active root indicated by teal text and Phosphor `Check` icon
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 6.4, 7.1, 7.2_

  - [x] 7.2 Update `src/components/layout/AccountSwitcher.module.css`
    - Add `.rootSection` styles (padding, divider)
    - Add `.rootOption` styles (similar to `.option` but with left border or icon space)
    - Add `.sectionDivider` style
    - Add `.sectionLabel` style (uppercase, muted, xs font)
    - Add `.disabledTrigger` style for All Accounts Mode
    - _Requirements: 3.1, 3.4_

- [x] 8. UI: RootAccountSelector in avatar dropdown
  - [x] 8.1 Create `src/components/layout/RootAccountSelector.tsx`
    - Read all root accounts from `useAccount()`
    - Read `isPlatformAdmin` from `usePlatformAdmin()`
    - Render section header "Switch Account" (uppercase, muted, xs)
    - Render "All Accounts" option with `GlobeSimple` icon
    - Render each root account as a button
    - Active selection: teal text + `Check` icon
    - Call `setActiveRootAccountId` on selection, then call `onSelect` prop to close dropdown
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

  - [x] 8.2 Create `src/components/layout/RootAccountSelector.module.css`
    - Style section header, options, active state, icons
    - Match existing `AppNavBar` dropdown item styles
    - _Requirements: 6.1, 6.5_

  - [x] 8.3 Modify `src/components/layout/AppNavBar.tsx` avatar dropdown
    - Import `RootAccountSelector` and `usePlatformAdmin`
    - When `isPlatformAdmin` is true, render `RootAccountSelector` above existing avatar menu items with a divider below
    - When `isPlatformAdmin` is false, render avatar dropdown unchanged
    - Add admin-only items to the Admin dropdown in `NAV_ITEMS`: conditionally include "User Management" (`/admin/users`) when platform admin
    - _Requirements: 6.1, 6.6, 8.1, 8.2_

  - [ ]* 8.4 Write unit tests for RootAccountSelector
    - Test: renders all root accounts
    - Test: "All Accounts" option present
    - Test: active selection has teal styling
    - Test: clicking an option calls setActiveRootAccountId
    - _Validates: Requirements 6.1, 6.2, 6.3, 6.5_

- [x] 9. UI: AdminAccountBanner and route protection
  - [x] 9.1 Create `src/components/layout/AdminAccountBanner.tsx` and `.module.css`
    - Render only when `isAllAccountsMode` is true AND current route requires a specific account
    - Routes that support All Accounts Mode: `/admin/billing`, `/admin/activity`, `/dashboard`
    - All other routes show the banner: "Select a specific account to view this page"
    - Include a "Select Account" button
    - Use info colour (#38BDF8) with light background
    - _Requirements: 7.4_

  - [x] 9.2 Add admin-only route protection
    - Create `/admin/users` placeholder page (`src/pages/UserManagementPage.tsx`) with PageShell and empty state
    - In `App.tsx`, wrap admin-only routes (`/admin/users`) with a check: if not platform admin, redirect to `/dashboard`
    - _Requirements: 8.2, 8.3_

  - [x] 9.3 Render `AdminAccountBanner` in the layout
    - Import and render `AdminAccountBanner` in `App.tsx` between `AppNavBar` and `Routes`
    - _Requirements: 7.4_

- [x] 10. Final checkpoint
  - Run all tests. Verify each access pattern works end-to-end:
    - Single-account user: unchanged experience
    - Multi-account user (Jordan Blake): root switching in AccountSwitcher, permissions change per root
    - Platform admin (local mode / knewstubb@gmail.com): avatar dropdown root selector, All Accounts mode, admin nav items
  - Verify session persistence across page refreshes
  - Verify admin-only routes are protected

## Notes

- Tasks marked with `*` are test tasks that can be deferred for faster MVP but are recommended
- Each task references specific requirements for traceability
- The design specifies TypeScript throughout -- all code uses React 19 + TypeScript + CSS Modules
- Property tests validate the correctness properties defined in the design document
- This is a prototype -- all data is mock/seed, no backend APIs
- The existing RoleSimulatorContext is not modified -- it continues to override permissions globally when active
- Provider tree ordering after this feature: Auth > FeatureFlag > DataLayer > RoleSimulator > Collaboration > PlatformAdmin > Account > Campaigns > Journeys > Permissions > Assets > Connections > Connectors > Data
