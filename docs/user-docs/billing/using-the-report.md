# Using the Billing Report

Here's how to navigate the billing report, filter the data you need, and export it.

---

## Getting to the report

1. Click **Admin** in the top navigation bar.
2. Select **Billing** from the dropdown menu.

The report opens showing the current billing cycle by default, with all accounts visible.

---

## Understanding the layout

The billing report page has three main areas:

1. **Header** — the page title ("Billing Report"), a subtitle showing the report scope, and a **Download CSV** button.
2. **Filters** — date range and account selectors that control what data appears.
3. **Report table** — a hierarchical tree table showing accounts, line items, and costs.

---

## Filtering the report

### By date range

The date range picker controls which billing period you're looking at.

1. Click the date range button (shows the currently selected range, e.g. "26 Apr 2025 — 25 May 2025").
2. A panel opens with a calendar and a list of presets on the right.

**Using presets (fastest):**
- Click **Current Billing Cycle** to see the active period.
- Click any month name (e.g. "April 2025") to jump to that billing cycle.
- Click **Today** to see only today's activity.

**Using the calendar:**
- Click a start date, then click an end date. The panel closes and the report updates.

The presets show the current cycle plus the previous 11 months, each aligned to the 26th–25th billing cycle.

### By account

Use the **Account** dropdown to focus on a specific account and its children.

1. Click the Account dropdown (shows "All Accounts" by default).
2. Select an account from the list.

The list is indented to show the hierarchy:
- Top-level accounts appear flush left.
- Child accounts are prefixed with "—".
- Grandchild accounts are prefixed with "——".

When you select an account, the report shows that account plus all accounts beneath it in the hierarchy. Select "All Accounts" to return to the full view.

---

## Reading the report table

The report uses a tree structure — accounts are collapsible rows that expand to show their line items and child accounts.

### Account rows

Each account appears as a summary row showing:

| Column | What it shows |
|--------|---------------|
| Account | The account name (with an expand/collapse arrow) |
| Items | The total item count rolled up across all line items and child accounts |
| Total | The total cost rolled up across all line items and child accounts |

The other columns (Type, Description, Send Date, Created/Activated, User, Unit Price) are blank on account rows — they only apply to individual line items.

### Expanding an account

Click any account row to expand it. You'll see:

1. **Line items** belonging directly to that account.
2. **Child account rows** beneath it (which you can expand further).

Click the row again to collapse it.

### Line item rows

When an account is expanded, each line item shows:

| Column | What it shows |
|--------|---------------|
| Type | The billing category (e.g. "Mailouts", "Database Records") |
| Description | A specific label (e.g. "Summer Promo — Send 1", "Contacts Database") |
| Send Date | When the item was sent (blank for storage items) |
| Created/Activated | When the record was created or the connector activated |
| User | Who triggered or owns the item |
| Items | The quantity (e.g. 4,280 contacts, 800 recipients) |
| Unit Price | The per-unit cost (e.g. $0.008) |
| Total | Items × Unit Price (e.g. $6.40) |

---

## Sorting the report

Click any column header to sort the table by that column. Click the same header again to reverse the sort direction.

An arrow icon (↑ or ↓) appears next to the active sort column showing the current direction.

You can sort by any column: Account, Type, Description, Send Date, Created/Activated, User, Items, Unit Price, or Total.

---

## Exporting the report

To download the current view as a CSV file:

1. Apply any filters you need (date range, account) so the report shows the data you want.
2. Click the **Download CSV** button in the top-right corner of the page.
3. A file downloads immediately to your computer.

The CSV file:
- Is named `billing-report-YYYY-MM-DD.csv` (using today's date).
- Contains one row per line item (not the rolled-up account totals).
- Includes all columns: Account, Type, Description, Send Date, Created/Activated, User, Items, Unit Price, Total.
- Reflects whatever filters are currently applied — if you've filtered to a single account, the CSV only includes that account's data.

---

## Empty state

If no billing data exists for your selected filters, the table area shows the message:

> "No billing data found for the selected criteria."

Try adjusting your date range or account filter to find data.

---

## Quick reference

| Task | How |
|------|-----|
| View current billing cycle | Open Admin > Billing (default view) |
| View a previous month | Click date range → select month from presets |
| View a custom date range | Click date range → pick start and end dates on calendar |
| Focus on one account | Select it from the Account dropdown |
| See all accounts again | Select "All Accounts" from the dropdown |
| Expand an account | Click the account row |
| Sort by cost | Click the "Total" column header |
| Download data | Click "Download CSV" |
