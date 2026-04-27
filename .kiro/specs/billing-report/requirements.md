# Requirements Document

## Introduction

The Billing Report is a cross-account administrative view within the UbiQuity 2.0 prototype that replaces the existing usage summary page (`BillingPage.tsx` at `/analytics/billing`) with a comprehensive billing report accessible at `/admin/billing` under the Admin navigation dropdown.

Currently, billing reports are generated manually once a month by someone in accounts. This feature replaces that manual process with an interactive, filterable report page. The old `/analytics/billing` route under Reporting → Deliverability is removed; billing now lives exclusively under Admin → Billing.

The report displays individual billing line items (one row per item — per mailout send, per integration, per database, etc.) grouped by account in a collapsible tree structure supporting up to 3 levels (parent → child → grandchild). Parent and child account rows show rolled-up item count totals. Administrators can filter by date range (defaulting to the current billing cycle: 26th to 25th) and account, sort by any column, and download leaf-level line items as CSV.

This is a prototype feature — all data is mock/seed data including grandchild accounts to demonstrate the 3-level hierarchy. No real billing APIs are involved.

## Glossary

- **Billing_Report_Page**: The full-page view accessible via Admin → Billing at route `/admin/billing` that displays billing line items across all accounts in a hierarchical tree structure. Replaces the old BillingPage at `/analytics/billing`.
- **Account_Tree**: A collapsible hierarchical display of accounts (parent → child → grandchild, up to 3 levels deep) where parent and child rows show rolled-up item count totals and can be expanded to reveal descendant line items.
- **Billing_Line_Item**: A single row of billing data belonging to a leaf account, representing one individual item (one mailout send, one integration, one database, etc.), categorised by type.
- **Rolled_Up_Total**: An aggregated item count for a parent or child account that sums the item counts of all its descendant accounts within a billing category.
- **Billing_Cycle**: The billing period running from the 26th of one month to the 25th of the next month. Database Records are billed on this cycle basis.
- **Date_Range_Filter**: A control that allows the administrator to select a start date and end date to scope the billing data displayed. Defaults to the current Billing_Cycle (26th of previous month to 25th of current month).
- **Account_Filter**: A control that allows the administrator to filter the report to show data for a specific account or all accounts.
- **CSV_Export**: The action of downloading the currently filtered billing data as a CSV file containing only leaf-level line items (no rolled-up parent summary rows).
- **System_Admin**: A user with administrative privileges who has access to the Admin section of UbiQuity.
- **Mock_Data_Generator**: The module responsible for producing realistic billing seed data derived from existing prototype data (accounts, campaigns, journeys, connections), including grandchild accounts to demonstrate the 3-level hierarchy.

## Requirements

### Requirement 1: Navigation and Route Replacement

**User Story:** As a System_Admin, I want the billing report to live under Admin → Billing at `/admin/billing` and the old usage summary page removed, so that billing is consolidated in the admin context.

#### Acceptance Criteria

1. THE Billing_Report_Page SHALL be accessible at route `/admin/billing` via the Admin dropdown menu as a "Billing" item.
2. WHEN the System_Admin navigates to `/admin/billing`, THE Billing_Report_Page SHALL render within the standard PageShell layout with the title "Billing Report" and a subtitle describing the view.
3. WHILE the System_Admin is on the Billing_Report_Page, THE AppNavBar SHALL highlight the Admin navigation item as active.
4. THE Billing_Report_Page SHALL replace the existing BillingPage component at `src/pages/BillingPage.tsx` — the old usage summary page SHALL be removed.
5. THE `/analytics/billing` route under Reporting → Deliverability SHALL be removed from the router and the navigation dropdown.
6. THE Billing_Report_Page SHALL operate independently of the Account Switcher — the report displays cross-account data regardless of which account is currently selected.

### Requirement 2: Account Tree Display

**User Story:** As a System_Admin, I want to see billing data organised in a collapsible account hierarchy with up to 3 levels, so that I can view rolled-up totals for parent accounts and drill into child and grandchild account details.

#### Acceptance Criteria

1. THE Billing_Report_Page SHALL display accounts in a tree structure supporting up to 3 levels of hierarchy (parent, child, grandchild).
2. WHEN the Billing_Report_Page loads, THE Account_Tree SHALL display all parent accounts in a collapsed state showing Rolled_Up_Totals.
3. WHEN the System_Admin clicks an expand control on a parent account row, THE Account_Tree SHALL reveal the child accounts with their individual Billing_Line_Items.
4. WHEN the System_Admin clicks an expand control on a child account row that has grandchild accounts, THE Account_Tree SHALL reveal the grandchild accounts with their individual Billing_Line_Items.
5. WHEN the System_Admin clicks a collapse control on an expanded account row, THE Account_Tree SHALL hide the descendant rows for that account.
6. THE Account_Tree SHALL visually indent child rows and grandchild rows to communicate the hierarchy level.

### Requirement 3: Billing Line Item Categories and Row Grain

**User Story:** As a System_Admin, I want each row to represent one individual billing item categorised by type, so that I can see granular detail of what each account is being billed for.

#### Acceptance Criteria

1. THE Billing_Report_Page SHALL display Billing_Line_Items in the following categories: Database Records, Transactional Records, Mailouts, Automated Mailouts, Form Triggered Emails, and Integrations.
2. THE Billing_Report_Page SHALL display one row per individual item — one row per mailout send, one row per integration, one row per database, one row per transactional connector, one row per form triggered email configuration.
3. WHEN a Billing_Line_Item has category "Database Records", THE Billing_Report_Page SHALL display the contact count for that individual database as the item count.
4. WHEN a Billing_Line_Item has category "Transactional Records", THE Billing_Report_Page SHALL display the record count for that individual connector as the item count.
5. WHEN a Billing_Line_Item has category "Mailouts", THE Billing_Report_Page SHALL display the send date and recipient count for that individual one-off send as the item count.
6. WHEN a Billing_Line_Item has category "Automated Mailouts", THE Billing_Report_Page SHALL display the recipient count for that individual recurring send as the item count.
7. WHEN a Billing_Line_Item has category "Form Triggered Emails", THE Billing_Report_Page SHALL display the triggered email count for that individual form as the item count.
8. WHEN a Billing_Line_Item has category "Integrations", THE Billing_Report_Page SHALL display each individual integration as a row with its item count (no cost column).

### Requirement 4: Report Columns and Sorting

**User Story:** As a System_Admin, I want consistent sortable columns across all billing line items, so that I can scan, compare, and reorder data efficiently.

#### Acceptance Criteria

1. THE Billing_Report_Page SHALL display the following columns for each Billing_Line_Item: Account, Type, Description, Send Date, Items, Created/Activated Date, and User.
2. WHEN a column value does not apply to a particular Billing_Line_Item category, THE Billing_Report_Page SHALL display the cell as empty rather than showing placeholder text.
3. THE Billing_Report_Page SHALL render the "Items" column as a right-aligned numeric value representing counts only (no cost values).
4. THE Billing_Report_Page SHALL render date columns in a consistent format (DD MMM YYYY).
5. WHEN the System_Admin clicks a column header, THE Billing_Report_Page SHALL sort the table rows by that column in ascending order.
6. WHEN the System_Admin clicks the same column header again, THE Billing_Report_Page SHALL toggle the sort direction to descending order.
7. THE Billing_Report_Page SHALL display a visual indicator (arrow icon) on the currently sorted column header showing the sort direction.

### Requirement 5: Date Range Filtering with Billing Cycle Default

**User Story:** As a System_Admin, I want to filter the billing report by date range defaulting to the current billing cycle (26th to 25th), so that I can view billing data for the relevant billing period.

#### Acceptance Criteria

1. THE Billing_Report_Page SHALL display a Date_Range_Filter control above the Account_Tree.
2. WHEN the Billing_Report_Page loads, THE Date_Range_Filter SHALL default to the current Billing_Cycle (26th of the previous month to 25th of the current month).
3. WHEN the System_Admin selects a start date and end date, THE Billing_Report_Page SHALL update the Account_Tree to show only Billing_Line_Items that fall within the selected date range.
4. WHEN filtering Billing_Line_Items with category "Mailouts", "Automated Mailouts", or "Form Triggered Emails", THE Date_Range_Filter SHALL use the Send Date of each item for date comparison.
5. WHEN filtering Billing_Line_Items with category "Database Records", THE Date_Range_Filter SHALL include items whose Billing_Cycle overlaps with the selected date range.
6. WHEN the System_Admin clears the Date_Range_Filter, THE Billing_Report_Page SHALL revert to showing the default current Billing_Cycle range.
7. THE Date_Range_Filter SHALL prevent the System_Admin from selecting an end date that is before the start date.

### Requirement 6: Account Filtering

**User Story:** As a System_Admin, I want to filter the billing report to a specific account, so that I can focus on one account's billing data.

#### Acceptance Criteria

1. THE Billing_Report_Page SHALL display an Account_Filter control above the Account_Tree.
2. WHEN the Billing_Report_Page loads, THE Account_Filter SHALL default to "All Accounts".
3. WHEN the System_Admin selects a specific account from the Account_Filter, THE Billing_Report_Page SHALL display only the selected account and its descendants in the Account_Tree.
4. WHEN the System_Admin selects "All Accounts" from the Account_Filter, THE Billing_Report_Page SHALL display the full Account_Tree.
5. THE Account_Filter SHALL list all accounts from the account hierarchy, including parent, child, and grandchild accounts.

### Requirement 7: CSV Export (Leaf-Level Only)

**User Story:** As a System_Admin, I want to download the billing report as a CSV file containing only individual line items, so that I can share it with the accounts team without double-counting from rolled-up summary rows.

#### Acceptance Criteria

1. THE Billing_Report_Page SHALL display a "Download CSV" button in the page header action area.
2. WHEN the System_Admin clicks the "Download CSV" button, THE CSV_Export SHALL generate a CSV file containing only leaf-level Billing_Line_Items from the currently filtered data.
3. THE CSV_Export SHALL exclude all rolled-up parent and child account summary rows to prevent double-counting.
4. THE CSV_Export SHALL include all visible columns (Account, Type, Description, Send Date, Items, Created/Activated Date, User) as CSV headers.
5. THE CSV_Export SHALL flatten the line items into a flat list of rows, with the Account column indicating the full account name.
6. THE CSV_Export SHALL name the downloaded file using the pattern `billing-report-YYYY-MM-DD.csv` where the date is the current date.

### Requirement 8: Empty State

**User Story:** As a System_Admin, I want to see a clear message when no billing data exists for the selected filters, so that I understand the report is working but has no matching data.

#### Acceptance Criteria

1. WHEN the applied filters result in no Billing_Line_Items, THE Billing_Report_Page SHALL display an empty state message indicating no billing data was found for the selected criteria.
2. THE Billing_Report_Page SHALL continue to display the filter controls in the empty state so the System_Admin can adjust the filters.

### Requirement 9: Mock Data Generation with Grandchild Accounts

**User Story:** As a prototype user, I want the billing report to display realistic mock data including a 3-level account hierarchy with grandchild accounts, so that I can evaluate the report design with representative content.

#### Acceptance Criteria

1. THE Mock_Data_Generator SHALL produce Billing_Line_Items for each account in the account hierarchy, including grandchild accounts to demonstrate the 3-level hierarchy.
2. THE Mock_Data_Generator SHALL add grandchild accounts to the existing account data (e.g., sub-locations under child accounts) to enable the 3-level tree display.
3. THE Mock_Data_Generator SHALL generate Database Records line items derived from the existing contact/database data in the prototype, with one row per individual database.
4. THE Mock_Data_Generator SHALL generate Mailouts and Automated Mailouts line items derived from the existing campaign and journey data, with one row per individual send.
5. THE Mock_Data_Generator SHALL generate Integrations line items derived from the existing connection data, with one row per individual integration.
6. THE Mock_Data_Generator SHALL generate Transactional Records and Form Triggered Emails line items with realistic counts, one row per individual item.
7. THE Mock_Data_Generator SHALL assign realistic dates, user names, and descriptions to each Billing_Line_Item.
8. THE Mock_Data_Generator SHALL assign Billing_Cycle dates (26th to 25th) to Database Records line items.
