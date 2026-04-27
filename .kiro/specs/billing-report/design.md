# Design Document

## Overview

The Billing Report feature replaces the existing `BillingPage.tsx` usage summary with a comprehensive, filterable billing report at `/admin/billing`. It introduces a hierarchical tree table displaying individual billing line items per account (up to 3 levels deep), with date range filtering (defaulting to the 26th–25th billing cycle), account filtering, column sorting, and leaf-level CSV export.

All data is mock/seed data. No backend APIs are involved.

## Architecture

### Component Hierarchy

```
BillingReportPage (src/pages/BillingReportPage.tsx)
├── PageShell (existing, title="Billing Report", action=DownloadCSV button)
├── BillingFilters (src/components/billing/BillingFilters.tsx)
│   ├── DateRangePicker (start/end date inputs, defaults to billing cycle)
│   └── AccountSelect (dropdown, defaults to "All Accounts")
└── BillingTreeTable (src/components/billing/BillingTreeTable.tsx)
    ├── SortableColumnHeader (click to sort asc/desc with arrow indicator)
    └── BillingTreeRow (recursive, handles expand/collapse + indentation)
```

### File Structure

```
src/
├── models/
│   └── billing.ts              # BillingLineItem, BillingCategory types
├── data/
│   ├── accounts.ts             # Updated: add grandchild accounts
│   └── billingData.ts          # Mock billing line items generator
├── components/
│   └── billing/
│       ├── BillingFilters.tsx
│       ├── BillingFilters.module.css
│       ├── BillingTreeTable.tsx
│       ├── BillingTreeTable.module.css
│       └── useBillingReport.ts # Hook: filtering, sorting, tree logic
├── pages/
│   ├── BillingReportPage.tsx   # New page component
│   └── BillingPage.tsx         # DELETED (replaced)
└── utils/
    └── billingCsv.ts           # CSV generation (leaf-level only)
```

## Data Models

### BillingLineItem

```typescript
type BillingCategory =
  | 'Database Records'
  | 'Transactional Records'
  | 'Mailouts'
  | 'Automated Mailouts'
  | 'Form Triggered Emails'
  | 'Integrations';

interface BillingLineItem {
  id: string;
  accountId: string;
  category: BillingCategory;
  description: string;
  sendDate: string | null;       // ISO date, used for Mailouts/Automated/Form Triggered
  items: number;                  // count only, no cost
  createdDate: string;            // ISO date — Created/Activated Date
  user: string;                   // user display name
  billingCycleStart?: string;     // ISO date, for Database Records only (26th)
  billingCycleEnd?: string;       // ISO date, for Database Records only (25th)
}
```

### Account (updated)

The existing `Account` model and `accounts.ts` data file are extended with grandchild accounts. Two child accounts (Auckland and Wellington) each get 2 grandchild sub-location accounts to demonstrate the 3-level hierarchy.

```typescript
// Existing interface unchanged — already supports parentId/childIds
// New accounts added to src/data/accounts.ts:
// acc-akl-cbd       → "Serenity Spa Auckland CBD"      (parent: acc-auckland)
// acc-akl-newmarket → "Serenity Spa Auckland Newmarket" (parent: acc-auckland)
// acc-wlg-cbd       → "Serenity Spa Wellington CBD"     (parent: acc-wellington)
// acc-wlg-petone    → "Serenity Spa Wellington Petone"  (parent: acc-wellington)
```

### BillingCycle Utility

```typescript
// Returns { start: string, end: string } for the current billing cycle
// If today is before the 26th: start = 26th of (current month - 1), end = 25th of current month
// If today is on/after the 26th: start = 26th of current month, end = 25th of (current month + 1)
function getCurrentBillingCycle(): { start: string; end: string };
```

## Component Design

### BillingReportPage

- Uses `PageShell` with `title="Billing Report"`, `subtitle="Cross-account billing data for the current period"`.
- Passes a "Download CSV" button as the `action` prop.
- Renders `BillingFilters` and `BillingTreeTable`.
- Uses the `useBillingReport` hook for all state management.

### BillingFilters

- Two controls in a horizontal row: date range picker (two date inputs) and account dropdown.
- Date range defaults to current billing cycle (26th–25th) via `getCurrentBillingCycle()`.
- Account dropdown lists all accounts (flat list with indentation hints via `—` prefix for children, `——` for grandchildren).
- Clearing date range resets to default billing cycle.
- End date input has `min` attribute set to start date to prevent invalid ranges.

### BillingTreeTable

- Custom table (not using existing `DataTable` — needs tree expand/collapse, sorting, indentation).
- Columns: Account, Type, Description, Send Date, Items, Created/Activated Date, User.
- Column headers are clickable for sorting. Active sort column shows an arrow (▲/▼).
- Rows are structured as:
  - **Level 0 (parent account)**: Bold row with expand/collapse chevron, shows rolled-up item totals per category. Background: `var(--color-zinc-50)`.
  - **Level 1 (child account)**: Indented (24px), expand/collapse if has grandchildren, shows rolled-up totals or individual items.
  - **Level 2 (grandchild account / leaf items)**: Indented (48px), individual line items.
  - For accounts without children, the leaf line items appear directly under the account row.
- Expand/collapse uses local component state (a `Set<string>` of expanded account IDs).
- Initially all accounts are collapsed.

### useBillingReport Hook

Manages:
1. **Date range state** — `startDate`, `endDate` (defaults from `getCurrentBillingCycle()`).
2. **Account filter state** — `selectedAccountId` (default: `null` = all).
3. **Sort state** — `sortColumn`, `sortDirection` (`'asc' | 'desc'`).
4. **Filtered data** — applies date range filter:
   - For Mailouts, Automated Mailouts, Form Triggered Emails: filter by `sendDate`.
   - For Database Records: include if billing cycle overlaps with selected date range.
   - For Transactional Records, Integrations: filter by `createdDate`.
5. **Account-filtered data** — if an account is selected, include only that account and its descendants.
6. **Sorted data** — sort leaf items by the selected column.
7. **Tree structure** — groups filtered items by account hierarchy for rendering.
8. **Rolled-up totals** — computes sum of `items` for each parent/child account across their descendants.

### CSV Export (billingCsv.ts)

- Takes the currently filtered `BillingLineItem[]` array (leaf-level only, no summary rows).
- Produces CSV with headers: `Account,Type,Description,Send Date,Items,Created/Activated Date,User`.
- Account column uses the full account name (looked up from accounts data).
- Dates formatted as `DD MMM YYYY`.
- Triggers browser download with filename `billing-report-YYYY-MM-DD.csv`.

## Mock Data Generation

`src/data/billingData.ts` generates `BillingLineItem[]` by deriving from existing prototype data:

| Category | Source | Row Grain | Items Value |
|---|---|---|---|
| Database Records | `contacts.ts` grouped by account | One row per database per account | Contact count |
| Transactional Records | `transactionalData.ts` + `connections.ts` | One row per connector | Record count |
| Mailouts | `campaigns.ts` journeys with type `promotional` | One row per send (2–3 sends per journey) | Recipient count |
| Automated Mailouts | `campaigns.ts` journeys with type `welcome`/`re-engagement`/`transactional` | One row per recurring send | Recipient count |
| Form Triggered Emails | Synthetic (2–3 per child account) | One row per form | Trigger count |
| Integrations | `connections.ts` | One row per connection per account | Sync count |

Dates are distributed across recent billing cycles. Users are randomly assigned from `users.ts`.

## Routing Changes

1. **Add**: `/admin/billing` → `BillingReportPage` (already exists in router, just change the component import).
2. **Remove**: `/analytics/billing` route from `App.tsx`.
3. **Remove**: "Deliverability" item (`/analytics/billing`) from the Reporting dropdown in `AppNavBar.tsx`.
4. **Delete**: `src/pages/BillingPage.tsx`.

## Correctness Properties

### Property 1: Date Formatting Consistency
FOR ALL valid Date values, the `formatDate` utility SHALL produce a string matching the pattern `DD MMM YYYY` (e.g., "01 Jan 2025").

### Property 2: Sort Stability — Ascending
FOR ALL sets of BillingLineItems, sorting by any column in ascending order SHALL produce a sequence where each element is less than or equal to the next element by the sorted column's value.

### Property 3: Sort Toggle — Descending is Reverse of Ascending
FOR ALL sets of BillingLineItems and any column, sorting ascending then toggling to descending SHALL produce the reverse order of the ascending sort.

### Property 4: Date Range Filter Correctness
FOR ALL sets of BillingLineItems and any valid date range, every item in the filtered result SHALL have its relevant date (sendDate for Mailouts/Automated/Form Triggered, billingCycleStart–End overlap for Database Records, createdDate for others) within the selected range.

### Property 5: Account Filter Correctness
FOR ALL sets of BillingLineItems and any selected account, every item in the filtered result SHALL belong to the selected account or one of its descendant accounts.

### Property 6: CSV Contains Only Leaf Items
FOR ALL filtered datasets, the CSV export row count SHALL equal the count of leaf-level BillingLineItems (excluding rolled-up summary rows). No account ID in the CSV SHALL correspond to a parent account that has children with their own line items in the dataset.

### Property 7: Rolled-Up Totals Equal Sum of Descendants
FOR ALL parent/child accounts in the tree, the rolled-up item total for a category SHALL equal the sum of `items` values across all descendant leaf-level BillingLineItems in that category.

### Property 8: Row Grain — One Row Per Individual Item
FOR ALL BillingLineItems in the dataset, each row SHALL have a unique `id`. The total row count SHALL equal the number of individual billing items generated (no summary-only rows in the raw data).
