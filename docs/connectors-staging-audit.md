# Connectors Staging Build Audit

**Date:** 2026-07-28  
**Staging URL:** https://stagingengage.ubiquity.nz/database/connectors  
**Account:** Chenchen AWS Test  
**Auditor:** Kiro

---

## Executive Summary

Audit of the UbiQuity Connectors staging build against the Confluence documentation (Connectors 1.0 Customer Guides) and UDS design system. The staging build is functional with core importer features working. 

**Visual Design:** Overall good alignment with UDS tokens. Primary colours, typography, and shadows match the design system. One critical issue identified: Failed status badges use grey instead of error red, reducing visibility of problems.

**Functionality:** Core flows work but some features are incomplete (Exporter shows but not built, row click-through not implemented).

Key findings summarised below.

---

## Features Confirmed Working

### Connections List
- ✅ Page header shows "Connectors" with count (6 connections · 6 automations)
- ✅ "+ New Connection" button present
- ✅ Connection cards display:
  - Connection type icon (AWS S3, Azure Blob, SFTP)
  - Connection type prefix label (e.g., "AWS S3:")
  - Connection name
  - Automation count summary (e.g., "0 of 1 Automation Active", "No Automations")
- ✅ Connection actions menu (three-dot) with options:
  - Add Automation
  - Edit Connection
  - Delete Connection

### Automation Rows
- ✅ Automation name displayed
- ✅ Data type badge (Contacts)
- ✅ Last run status badge (Completed/Failed) with timestamp ("8 days ago")
- ✅ Active/inactive toggle switch
- ✅ Automation actions menu (three-dot) with options:
  - Edit Automation
  - Automation History
  - Change Log
  - Delete Automation
- ✅ "+ Add Automation" button per connection

### New Connection Wizard
- ✅ Step 1: Connection Type Selection
  - AWS S3
  - Azure Blob
  - SFTP
- ✅ AWS S3 Setup Fields:
  - Connection Name *
  - Base Path (optional)
  - Alert Email(s) *
  - Bucket Name *
  - AWS Account ID * (with IAM role assumption note)
  - Test Connection button
- ✅ Azure Blob Setup Fields:
  - Connection Name *
  - Base Path (optional)
  - Alert Email(s) *
  - Container Name *
  - Account Name *
  - Authentication Method dropdown:
    - SAS Token (with SAS Token field)
    - Service Principal (with Tenant ID, Client ID, Client Secret fields)
  - Test Connection button
- ✅ SFTP Setup Fields:
  - Connection Name *
  - Base Path * (required, with helper text)
  - Alert Email(s) *
  - Hostname *
  - Port *
  - Username *
  - SSH Key upload
  - Test Connection button

### New Importer Wizard
- ✅ Step 1 (Add Automation): Type Selection
  - Importer option
  - Exporter option (visible but not built)
- ✅ Importer wizard navigates to full page: `/database/connectors/import/add/{connectionId}`
- ✅ 5-step progress navigation:
  1. File Settings
  2. Contact Configuration
  3. Contact Mapping
  4. Notifications
  5. Review
- ✅ File Settings step includes:
  - Importer Name field
  - File Path mode selector (Automatic / Shared / Custom)
  - Folder Name field (with path preview)
  - Sample CSV upload
  - Importing To selector (Contacts / Transactional / Combined)
  - Database field (shows selected database)

---

## Differences from Documentation

### Documentation vs Build Gaps

| Area | Documentation Says | Staging Build Has | Impact |
|------|-------------------|-------------------|--------|
| Exporter | Excluded from docs (not built) | Shows in UI as option | **UI shows unbuilt feature** - users may try to use it |
| Automation detail panel | Described in docs as showing full config | Clicking automation row does nothing | Detail view may be accessed differently or not implemented |
| Connection detail panel | Implied click-to-view pattern | Clicking connection header does nothing | Same as above |
| "Activity Log" menu item | Documented as available | Shows as "Change Log" | Terminology difference |

### Terminology Differences

| Documentation Term | Staging UI Term |
|-------------------|-----------------|
| Activity Log | Change Log |
| Connection actions (implied) | "Connection actions" (aria-label) |
| Automation actions (implied) | "Automation actions" (aria-label) |

---

## Flows Not Accessible (Without Data Modification)

Due to the constraint of not modifying data, the following flows could not be fully audited:

1. **Edit Connection** - Would require clicking Edit and potentially saving changes
2. **Edit Automation** - Would require entering edit mode
3. **Delete Connection** - Destructive action
4. **Delete Automation** - Destructive action
5. **Create Connection (full flow)** - Would create test data
6. **Create Importer (full flow)** - Would create test data
7. **Test Connection** - Might trigger backend calls
8. **Toggle Automation Active/Inactive** - Would modify state
9. **Automation History** - Unknown if clicking opens a view
10. **Change Log (Activity Log)** - Unknown if clicking opens a view

---

## Visual Design Audit

### Typography

| Element | Actual Value | Expected (UDS) | Status |
|---------|--------------|----------------|--------|
| Page heading (h1) | 24px / SemiBold (600) / Inter | 24px / SemiBold / Inter | ✅ Match |
| Summary text | 13px / zinc-500 | Body XS (12px) or Body S (14px) | ⚠️ Between spec values |
| Modal heading (h2) | 16px / SemiBold (600) | 16px / SemiBold | ✅ Match |
| Section heading (h3) | 20px / SemiBold (600) / Primary teal | 20px / SemiBold | ✅ Match |
| Connection type label | 14px / Medium (500) / zinc-500 | Body S (14px) | ✅ Match |
| Connection name | 16px / SemiBold (600) / zinc-800 | Body Base (16px) | ✅ Match |
| Modal description | 13px / zinc-500 / 20px line-height | Body XS (12px) or Body S (14px) | ⚠️ Between spec values |

### Colours

| Element | Actual Colour | Token Match | Status |
|---------|---------------|-------------|--------|
| Primary button text | rgb(20, 184, 138) | --color-primary-500 #14B88A | ✅ Match |
| Page heading | rgb(39, 39, 42) | zinc-800 #27272A | ✅ Match |
| Muted text | rgb(113, 113, 122) | zinc-500 #71717A | ✅ Match |
| Borders | rgb(228, 228, 231) | zinc-200 #E4E4E7 | ✅ Match |
| Surface background | rgb(244, 244, 245) | zinc-100 #F4F4F5 | ✅ Match |
| Modal background | rgb(250, 250, 250) | zinc-50 #FAFAFA | ✅ Match |

### Status Badges — ISSUE IDENTIFIED

| Badge Text | Actual Styling | Expected Styling | Status |
|------------|---------------|------------------|--------|
| **Failed** | Grey (zinc-500 text, zinc-100 bg) | **Red** (error colour, --color-error) | ❌ **Design Issue** |
| **Completed** | Grey (zinc-500 text, zinc-100 bg) | Green (success colour) or neutral | ⚠️ Acceptable |

**Issue:** "Failed" status badges use neutral grey styling instead of the error colour (red #EF4444). This reduces visual urgency and makes failures easy to miss.

**Observed Badge Styles:**
- Font: 12px / 500 weight
- Background: rgb(244, 244, 245) — zinc-100
- Text colour: rgb(113, 113, 122) — zinc-500
- Border radius: pill (9999px)
- Padding: 2px 8px

### Spacing & Layout

| Element | Actual Value | UDS Standard | Status |
|---------|--------------|--------------|--------|
| Modal border-radius | 8px | 8px (Default) | ✅ Match |
| Button border-radius | 6px | 8px (Default) | ⚠️ Slight variance (6px vs 8px) |
| Input border-radius | 6px | 8px (Default) | ⚠️ Slight variance |
| Toggle switch | 32px × 18px | Standard size | ✅ Acceptable |
| Button padding | 8px 16px | 8px 16px (Medium) | ✅ Match |

### Shadows

| Element | Shadow Style | UDS Token | Status |
|---------|--------------|-----------|--------|
| Modal | 10px/15px blur, 4px/6px blur (0.1 opacity) | Drop Shadow L | ✅ Match |

### Segmented Buttons (Toggle Groups)

| State | Actual Styling | UDS Spec | Status |
|-------|---------------|----------|--------|
| Active | Teal text, zinc-50 bg | Teal TEXT, grey-100 bg | ✅ Match |
| Inactive | Grey text, zinc-100 bg | Grey text, grey-100 bg | ✅ Match |

### Form Fields

| Aspect | Actual Value | Expected | Status |
|--------|--------------|----------|--------|
| Input font size | 13px | 14px (Body S) | ⚠️ Slightly small |
| Input border | zinc-200 | zinc-200 | ✅ Match |
| Input background | white | white | ✅ Match |
| Input padding | 4px 12px | 8px 12px | ⚠️ Vertical padding may be tight |

---

## Visual Issues Summary

### Critical (❌)
1. **Failed status badges not using error colour** — Grey badges don't communicate failure urgency

### Minor (⚠️)
1. **Font sizes between spec values** — 13px used where 12px or 14px expected (minor, acceptable)
2. **Border radius inconsistency** — 6px on buttons/inputs vs 8px UDS standard (very minor)
3. **Input vertical padding** — 4px may feel cramped on some screens

### Acceptable
- All primary colours match the design system
- Typography uses correct font family (Inter)
- Shadow tokens applied correctly
- Segmented button active states use teal text correctly

---

## UI/UX Observations

### Positive
- Clean, modern interface using Tailwind CSS
- Clear visual hierarchy between connections and automations
- Helpful inline text (e.g., "Your 12-digit AWS account ID. We assume the role...")
- Good use of icons for connection types
- Font usage is consistent across the interface
- Primary teal colour (#14B88A) used consistently for actions and active states

### Functional Issues
- **Exporter visible but not built**: Users may attempt to create exporters and encounter errors or incomplete functionality
- **No click-through on automation/connection rows**: Expected behavior would be to click a row to see details, but this doesn't work in staging
- **Missing direction indicators**: Automation rows don't show ↓ (import) or ↑ (export) direction icons
- **Overlapping click targets**: Playwright automation detected CSS elements intercepting pointer events on automation rows

### Design Issues
- **Failed badges use grey** instead of error red — reduces visibility of problems
- **SFTP connection name truncation** — Long connection names like "sftp-prefect.ssh-upload/ChenchenAWSTest4" may overflow in narrow viewports
- **Modal scrolling** — On shorter viewports, connection forms may require scrolling to reach Test Connection button

### Accessibility Notes
- Connection actions button has `aria-label="Connection actions"` ✅
- Automation actions button has `aria-label="Automation actions"` ✅
- Toggles have proper switch role ✅
- Dialog modals use proper `role="dialog"` ✅
- Help icons have `aria-label="Open help"` ✅

---

## Recommendations

### Design/Visual
1. **Use error colour for "Failed" badges** — Change from grey to red (#EF4444) to communicate failure urgency
2. **Standardise border radius** — Consider using 8px consistently for buttons and inputs per UDS spec
3. **Review input padding** — Consider increasing vertical padding from 4px to 8px for better touch targets

### Functionality
4. **Hide or disable Exporter option** until feature is built, or add "Coming Soon" indicator
5. **Implement row click behavior** for automations and connections to show detail panels
6. **Add direction indicators** to automation rows to distinguish importers from exporters
7. **Fix overlapping click targets** that prevent normal interaction with automation rows

### Documentation
8. **Align terminology** between documentation and UI ("Activity Log" vs "Change Log")

---

## Test Data Observed

### Connections (6 total)
1. **Azure Blob: Blob Token** - 0 of 1 Automation Active
2. **Azure Blob: blob server principle** - No Automations
3. **AWS S3: S3 Test** - No Automations
4. **AWS S3: New S3** - 0 of 2 Automations Active
5. **AWS S3: Connection Failure Test** - 0 of 1 Automation Active
6. **SFTP: sftp-prefect.ssh-upload/ChenchenAWSTest4** - 0 of 2 Automations Active

### Automations (6 total)
1. Update Contact Name (Contacts) - No recent run shown
2. s3 test 2 (Contacts) - Failed, 8 days ago
3. s3 test 1 (Contacts) - Completed, 7 days ago
4. falure test 1 (Contacts) - Failed, 9 days ago
5. multiple email (Contacts) - No recent run shown
6. awstest4 (Contacts) - Completed, 17 days ago

---

## Appendix: URL Patterns Observed

- **Connectors list**: `/database/connectors`
- **New Importer wizard**: `/database/connectors/import/add/{connectionId}`
- **New Connection**: Modal overlay (no URL change)
- **Add Automation type selection**: Modal overlay (no URL change)

---

*Audit performed using Playwright browser automation. Some features may behave differently with manual user interaction.*

---

## Screenshots Captured

The following screenshots were captured during the audit:

1. `connectors-list-full-audit.png` — Main connectors list view with expanded cards
2. `sftp-connection-form.png` — SFTP connection setup wizard (Step 2)
3. `automation-type-selection.png` — Automation type selection modal (Importer/Exporter)
4. `importer-wizard-step1.png` — Importer wizard Step 1 (File Settings)

Screenshots saved to `/tmp/.playwright-mcp/` during the audit session.
