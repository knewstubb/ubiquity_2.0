# Implementation Plan: Billing Report

## Overview

Replace the existing BillingPage usage summary with a comprehensive, filterable billing report at `/admin/billing`. Implements a hierarchical tree table with 3-level account structure, date range and account filtering, column sorting, and leaf-level CSV export. All data is mock/seed data.

## Tasks

- [x] 1. Create data models and account hierarchy
  - [x] 1.1 Create BillingLineItem model and BillingCategory type in `src/models/billing.ts`
    - Define `BillingCategory` union type with all 6 categories
    - Define `BillingLineItem` interface with all fields (id, accountId, category, description, sendDate, items, createdDate, user, billingCycleStart, billingCycleEnd)
    - Export `getCurrentBillingCycle()` utility function (26th–25th logic)
    - _Requirements: 3.1, 3.2, 5.2_

  - [x] 1.2 Add grandchild accounts to `src/data/accounts.ts`
    - Add 4 grandchild accounts: acc-akl-cbd, acc-akl-newmarket (under acc-auckland), acc-wlg-cbd, acc-wlg-petone (under acc-wellington)
    - Update parent account `childIds` arrays to include new grandchild IDs
    - _Requirements: 9.2, 2.1_

  - [ ]* 1.3 Write property test for billing cycle calculation
    - **Property 1: Date Formatting Consistency**
    - **Validates: Requirements 4.4, 5.2**

- [x] 2. Create mock data generator
  - [x] 2.1 Create `src/data/billingData.ts` mock data generator
    - Generate Database Records line items (one row per database per account) with billing cycle dates
    - Generate Transactional Records (one row per connector)
    - Generate Mailouts and Automated Mailouts from campaign/journey data (one row per send)
    - Generate Form Triggered Emails (2–3 per child account)
    - Generate Integrations (one row per connection per account)
    - Assign realistic dates, user names, and descriptions
    - Export the generated `BillingLineItem[]` array
    - _Requirements: 9.1, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

  - [ ]* 2.2 Write property test for row grain uniqueness
    - **Property 8: Row Grain — One Row Per Individual Item**
    - **Validates: Requirements 3.2, 9.1**

- [x] 3. Implement useBillingReport hook and CSV export
  - [x] 3.1 Create `src/components/billing/useBillingReport.ts` hook
    - Manage date range state (defaults from `getCurrentBillingCycle()`)
    - Manage account filter state (default: null = all accounts)
    - Manage sort state (sortColumn, sortDirection)
    - Implement date range filtering: sendDate for Mailouts/Automated/Form Triggered, billing cycle overlap for Database Records, createdDate for others
    - Implement account filtering: selected account + all descendants
    - Implement sorting by any column (asc/desc toggle)
    - Build tree structure grouping filtered items by account hierarchy
    - Compute rolled-up totals for parent/child accounts
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.1, 6.2, 6.3, 6.4, 4.5, 4.6, 2.2_

  - [ ]* 3.2 Write property test for date range filter correctness
    - **Property 4: Date Range Filter Correctness**
    - **Validates: Requirements 5.3, 5.4, 5.5**

  - [ ]* 3.3 Write property test for account filter correctness
    - **Property 5: Account Filter Correctness**
    - **Validates: Requirements 6.3, 6.4**

  - [ ]* 3.4 Write property tests for sort behaviour
    - **Property 2: Sort Stability — Ascending**
    - **Property 3: Sort Toggle — Descending is Reverse of Ascending**
    - **Validates: Requirements 4.5, 4.6**

  - [ ]* 3.5 Write property test for rolled-up totals
    - **Property 7: Rolled-Up Totals Equal Sum of Descendants**
    - **Validates: Requirements 2.2**

  - [x] 3.6 Create `src/utils/billingCsv.ts` CSV export utility
    - Accept filtered `BillingLineItem[]` (leaf-level only)
    - Generate CSV with headers: Account, Type, Description, Send Date, Items, Created/Activated Date, User
    - Look up full account name from accounts data
    - Format dates as DD MMM YYYY
    - Trigger browser download with filename `billing-report-YYYY-MM-DD.csv`
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ]* 3.7 Write property test for CSV leaf-only export
    - **Property 6: CSV Contains Only Leaf Items**
    - **Validates: Requirements 7.2, 7.3**

- [x] 4. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Build billing UI components
  - [x] 5.1 Create `src/components/billing/BillingFilters.tsx` and `BillingFilters.module.css`
    - Two controls in a horizontal row: date range picker (two date inputs) and account dropdown
    - Date range defaults to current billing cycle via `getCurrentBillingCycle()`
    - Account dropdown lists all accounts with indentation hints (— for children, —— for grandchildren)
    - End date input has `min` set to start date to prevent invalid ranges
    - Clearing resets to default billing cycle
    - _Requirements: 5.1, 5.2, 5.6, 5.7, 6.1, 6.2, 6.5_

  - [x] 5.2 Create `src/components/billing/BillingTreeTable.tsx` and `BillingTreeTable.module.css`
    - Custom tree table (not using existing DataTable — needs expand/collapse, indentation, sorting)
    - Columns: Account, Type, Description, Send Date, Items (right-aligned), Created/Activated Date, User
    - Sortable column headers with arrow indicator (▲/▼) on active sort column
    - Level 0 (parent): bold row, expand/collapse chevron, rolled-up totals, zinc-50 background
    - Level 1 (child): 24px indent, expand/collapse if has grandchildren
    - Level 2 (grandchild/leaf): 48px indent, individual line items
    - Expand/collapse via local `Set<string>` state, initially all collapsed
    - Empty cells for non-applicable column values (no placeholder text)
    - Dates formatted as DD MMM YYYY
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 8.1, 8.2_

  - [ ]* 5.3 Write unit tests for BillingTreeTable
    - Test expand/collapse toggling
    - Test indentation levels render correctly
    - Test empty state message displays when no data
    - _Requirements: 2.3, 2.5, 8.1_

- [x] 6. Create BillingReportPage and wire routing
  - [x] 6.1 Create `src/pages/BillingReportPage.tsx`
    - Use `PageShell` with title="Billing Report", subtitle="Cross-account billing data for the current period"
    - Pass "Download CSV" button as the `action` prop
    - Render `BillingFilters` and `BillingTreeTable`
    - Use `useBillingReport` hook for all state management
    - Wire CSV download button to `billingCsv.ts` export utility
    - _Requirements: 1.2, 1.6, 7.1_

  - [x] 6.2 Update `src/App.tsx` routing
    - Replace `BillingPage` import with `BillingReportPage` for `/admin/billing` route
    - Remove the `/analytics/billing` route entirely
    - Remove the `BillingPage` import
    - _Requirements: 1.1, 1.4, 1.5_

  - [x] 6.3 Update `src/components/layout/AppNavBar.tsx` navigation
    - Remove the "Deliverability" sub-item (`/analytics/billing`) from the Reporting dropdown in `NAV_ITEMS`
    - _Requirements: 1.5_

  - [x] 6.4 Delete `src/pages/BillingPage.tsx`
    - Remove the old usage summary page file
    - _Requirements: 1.4_

- [x] 7. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The design specifies TypeScript throughout — all code uses React 19 + TypeScript + CSS Modules
- Property tests validate the 8 correctness properties defined in the design document
- This is a prototype — all data is mock/seed, no backend APIs
