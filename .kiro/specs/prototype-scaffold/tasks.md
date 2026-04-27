# Implementation Plan: Prototype Scaffold

## Overview

Stand up the Phase 1 skeleton scaffold for UbiQuity 2.0: shared TypeScript data models, NZ spa chain sample data, AccountContext with switcher, shared layout components (PageShell, MetricCard, DataTable), 16 placeholder pages with realistic content, and explicit React Router routes. The existing Integrations section (`/` and `/connector/:id`) remains untouched.

## Tasks

- [x] 1. Create new data model interfaces and barrel file
  - [x] 1.1 Create `src/models/account.ts` with the `Account` interface
    - Fields: id, name, parentId (nullable), childIds, region, status
    - _Requirements: 1.1_
  - [x] 1.2 Create `src/models/contact.ts` with `ActivityEvent` and `Contact` interfaces
    - `Contact` extends the existing `ContactRecord` from `./data`
    - Adds accountId, segmentIds, journeyIds, activityTimeline
    - _Requirements: 1.2_
  - [x] 1.3 Create `src/models/segment.ts` with `FilterRule` and `Segment` interfaces
    - _Requirements: 1.3_
  - [x] 1.4 Create `src/models/campaign.ts` with `Campaign`, `Journey`, `CampaignStatus`, and `JourneyType`
    - _Requirements: 1.4, 1.5_
  - [x] 1.5 Create `src/models/asset.ts` with the `Asset` interface
    - _Requirements: 1.6_
  - [x] 1.6 Create `src/models/notification.ts` with the `Notification` interface
    - _Requirements: 1.7_
  - [x] 1.7 Create `src/models/index.ts` barrel file
    - Re-export all existing model types (Connection, Connector, ContactRecord, etc.)
    - Export all new model types (Account, Contact, Segment, Campaign, Journey, Asset, Notification, etc.)
    - _Requirements: 1.8_

- [x] 2. Create NZ spa chain sample data files
  - [x] 2.1 Create `src/data/accounts.ts`
    - 1 master account "Serenity Spa Group" (region: National) + 4 child accounts (Auckland, Wellington, Christchurch, Queenstown)
    - Master account's childIds references the 4 children; children have parentId pointing to master
    - _Requirements: 2.1_
  - [x] 2.2 Create `src/data/spaContacts.ts`
    - ~50 Contact records with NZ-appropriate names (e.g., Aroha Tūhoe, Nikau Patel, Tāne Williams, Maia Chen)
    - Distributed roughly evenly across the 4 child account IDs
    - Varied membership tiers (Bronze, Silver, Gold, Platinum)
    - Each contact has segmentIds, journeyIds, and a short activityTimeline array
    - _Requirements: 2.2_
  - [x] 2.3 Create `src/data/segments.ts`
    - At least 4 segments: "Gold Members", "New This Month", "At Risk", "Auckland Region"
    - Each with id, name, accountId, type (smart/manual), rules array, memberCount
    - Some segments at master level (shared), some regional
    - _Requirements: 2.3_
  - [x] 2.4 Create `src/data/campaigns.ts`
    - 3-4 campaigns with varied statuses (draft, active, completed) across accounts
    - 2-3 journeys per campaign with varied statuses and types
    - Export both `campaigns` and `journeys` arrays
    - _Requirements: 2.4, 2.5_
  - [x] 2.5 Create `src/data/assets.ts`
    - At least 8 asset records across image, template, and snippet types
    - Realistic names and usage counts, distributed across accounts
    - _Requirements: 2.6_
  - [x] 2.6 Create `src/data/notifications.ts`
    - At least 6 notification records with varied types (info, warning, success, error) and read states
    - Some with linkTo route paths
    - _Requirements: 2.7_

- [x] 3. Checkpoint — Verify models and data compile
  - Ensure all TypeScript files compile without errors. Run `npx tsc --noEmit` to verify. Ask the user if questions arise.

- [x] 4. Create AccountContext and AccountSwitcher
  - [x] 4.1 Create `src/contexts/AccountContext.tsx`
    - `AccountProvider` component wrapping children with context
    - Stores `selectedAccountId`, defaults to master account on initial load
    - Exposes: accounts, selectedAccountId, selectedAccount, setSelectedAccountId, filterByAccount
    - `filterByAccount` returns all items when master is selected, filters by accountId for child accounts
    - Invalid account ID falls back to master account
    - `useAccount()` hook that throws if called outside provider
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [ ]* 4.2 Write property test for account filtering (Property 1)
    - **Property 1: Account filtering returns correct subset**
    - Generate random arrays of objects with `accountId` fields and random account selections
    - Verify `filterByAccount` returns correct subset for child accounts and all items for master
    - **Validates: Requirements 2.8, 3.3, 3.4**
  - [x] 4.3 Create `src/components/layout/AccountSwitcher.tsx` and `AccountSwitcher.module.css`
    - Dropdown showing current account name, list of all accounts
    - Master account shown with "(All Locations)" suffix
    - Child accounts shown with region label
    - Clicking an account calls setSelectedAccountId
    - _Requirements: 3.5, 3.6_
  - [x] 4.4 Modify `src/components/layout/AppNavBar.tsx` to include AccountSwitcher
    - Insert `<AccountSwitcher />` between the logo div and primaryItems div
    - Add corresponding styles to `AppNavBar.module.css`
    - _Requirements: 3.5_

- [x] 5. Create shared layout components
  - [x] 5.1 Create `src/components/layout/PageShell.tsx` and `PageShell.module.css`
    - Props: title, subtitle (optional), action (optional ReactNode), children
    - Layout: max-width 1440px, padding using design tokens, zinc-50 background
    - _Requirements: 6.1, 6.2_
  - [x] 5.2 Create `src/components/shared/MetricCard.tsx` and `MetricCard.module.css`
    - Props: label, value, subtitle (optional)
    - Styled with shadow-sm, border, border-radius, white background using design tokens
    - _Requirements: 6.5_
  - [x] 5.3 Create `src/components/shared/DataTable.tsx` and `DataTable.module.css`
    - Generic component with Column<T> and DataTableProps<T>
    - Sticky header, zebra striping with zinc-50, established border/shadow tokens
    - Renders emptyMessage when data array is empty
    - _Requirements: 6.4_

- [x] 6. Checkpoint — Verify context and shared components render
  - Ensure all tests pass and the app compiles. Ask the user if questions arise.

- [x] 7. Implement placeholder pages — Dashboard and Audiences section
  - [x] 7.1 Create `src/pages/OverviewDashboardPage.tsx`
    - 4× MetricCard grid: total contacts, active campaigns, active journeys, total segments
    - Uses `useAccount()` and `filterByAccount` to scope data
    - Wrapped in PageShell
    - _Requirements: 4.1_
  - [x] 7.2 Create `src/pages/SegmentsPage.tsx`
    - DataTable with columns: name, type badge, memberCount
    - Uses filterByAccount on segments data
    - _Requirements: 4.2_
  - [x] 7.3 Create `src/pages/DatabasesPage.tsx`
    - DataTable with columns: name, email, membership tier badge, account
    - Uses filterByAccount on spaContacts data
    - _Requirements: 4.3_
  - [x] 7.4 Create `src/pages/AttributesPage.tsx`
    - DataTable with columns: field name, data type, source
    - Uses field definitions from the existing fieldRegistry or a static list
    - _Requirements: 4.4_

- [x] 8. Implement placeholder pages — Automations section
  - [x] 8.1 Create `src/pages/CampaignsPage.tsx`
    - DataTable grouped by status (active, draft, paused, completed)
    - Columns: name, date range, journey count, status badge
    - Status badges use correct colour coding (teal/amber/zinc/green)
    - _Requirements: 4.5, 6.6_
  - [x] 8.2 Create `src/pages/JourneysPage.tsx`
    - DataTable with columns: name, campaign name, status badge, type, entry count
    - _Requirements: 4.6_

- [x] 9. Implement placeholder pages — Content section
  - [x] 9.1 Create `src/pages/TemplatesPage.tsx`
    - CSS Grid of cards showing asset records filtered to type "template"
    - Each card: name, tags, usage count
    - _Requirements: 4.8_
  - [x] 9.2 Create `src/pages/EmailsPage.tsx`
    - DataTable with columns: name, status badge, last modified
    - _Requirements: 4.9_
  - [x] 9.3 Create `src/pages/FormsPage.tsx`
    - DataTable with columns: name, status badge, response count
    - _Requirements: 4.10_
  - [x] 9.4 Create `src/pages/SmsPage.tsx`
    - DataTable with columns: name, status badge, send count
    - _Requirements: 4.11_

- [x] 10. Implement placeholder pages — Analytics and Settings
  - [x] 10.1 Create `src/pages/AnalyticsDashboardsPage.tsx`
    - 4× MetricCard grid with KPI summaries
    - _Requirements: 4.12_
  - [x] 10.2 Create `src/pages/ReportsPage.tsx`
    - DataTable with columns: name, type, date range
    - _Requirements: 4.13_
  - [x] 10.3 Create `src/pages/ActivityPage.tsx`
    - Chronological feed list of recent activity events
    - Uses notification/activity data
    - _Requirements: 4.14_
  - [x] 10.4 Create `src/pages/BillingPage.tsx`
    - MetricCards for plan info + summary table for usage metrics
    - _Requirements: 4.15_
  - [x] 10.5 Create `src/pages/SettingsPage.tsx`
    - Sections for workspace config (name, timezone) and users/permissions placeholder list
    - _Requirements: 4.16_
  - [x] 10.6 Create `src/pages/pages.module.css` for any shared page-level styles
    - Status badge colour classes: teal for active, amber for paused, zinc for draft, green for completed
    - _Requirements: 6.3, 6.6_

- [x] 11. Checkpoint — Verify all pages render in isolation
  - Ensure all page components compile and render without errors. Ask the user if questions arise.

- [x] 12. Update App.tsx routing and wire AccountProvider
  - [x] 12.1 Update `src/App.tsx`
    - Wrap everything inside `<AccountProvider>` (inside AppProvider, outside AppNavBar)
    - Remove the inline `PlaceholderPage` component
    - Replace wildcard routes (`/audiences/*`, `/automations/*`, `/content/*`, `/analytics/*`) with explicit routes for each page
    - Preserve existing `/` route for DashboardPage (Integrations) and `/connector/:id` for ConnectorDetailPage
    - Add explicit routes: `/dashboard`, `/audiences/segments`, `/audiences/databases`, `/audiences/attributes`, `/automations/campaigns`, `/automations/journeys`, `/content/templates`, `/content/emails`, `/content/forms`, `/content/sms`, `/analytics/dashboards`, `/analytics/reports`, `/analytics/activity`, `/analytics/billing`, `/settings`
    - _Requirements: 4.7, 5.1, 5.2, 5.4, 5.6_

- [ ] 13. Final verification and tests
  - [ ]* 13.1 Write property test for navigation routing (Property 2)
    - **Property 2: Navigation item click routes to correct path**
    - For any nav item from NAV_ITEMS config, simulate click and verify resulting route
    - **Validates: Requirements 5.1, 5.2**
  - [ ]* 13.2 Write property test for active nav highlighting (Property 3)
    - **Property 3: Active navigation highlighting matches current route**
    - For any valid route, verify exactly one primary and one sub-item are marked active
    - **Validates: Requirements 5.3, 5.5**
  - [ ]* 13.3 Write property test for status badge colour mapping (Property 4)
    - **Property 4: Status badge colour mapping**
    - For any valid status value, verify the correct CSS class is applied
    - **Validates: Requirements 6.6**
  - [ ]* 13.4 Write unit tests for sample data shape
    - Verify account hierarchy (1 master + 4 children), contact count (~50), segment count (≥4), campaign count (3-4), asset count (≥8), notification count (≥6)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6, 2.7_
  - [ ]* 13.5 Write unit tests for AccountContext default state
    - Verify initial selection is the master account
    - _Requirements: 3.2_
  - [ ]* 13.6 Write unit tests for route preservation
    - Verify `/` renders Integrations DashboardPage, `/connector/:id` renders ConnectorDetailPage
    - Verify no wildcard routes exist in the route configuration
    - _Requirements: 4.7, 5.6_

- [x] 14. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass and the full app compiles cleanly. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Existing Integrations code (DashboardPage, ConnectorDetailPage, contexts, data files) is never modified
- All new components use CSS Modules and the established design token system
- Property tests validate universal correctness properties from the design document
