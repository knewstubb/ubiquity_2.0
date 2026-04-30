# Page Header Audit

An inventory of what each page header requires — covering the current prototype state and what the complete production system would need. This informs the design of a reusable `PageHeader` component.

---

## Header Anatomy

Every page header can contain up to 5 rows/zones:

1. **Breadcrumb row** — contextual navigation (e.g. Campaigns > Summer Glow)
2. **Title row** — page title, optional subtitle/status badge, primary action button(s)
3. **Tab row** — horizontal tabs for sub-views within the page
4. **Filter row** — dropdowns, segmented controls, search, date pickers
5. **Bulk action row** — appears when items are selected (select all, delete, move, etc.)

Not every page uses all rows. The component should render only what's needed.

---

## Page-by-Page Requirements

### Home / Overview Dashboard
| Element | Current | Production |
|---------|---------|------------|
| Title | "Dashboard" | "Dashboard" |
| Subtitle | "Overview of your workspace" | Account name or "All Accounts" |
| Actions | — | Date range selector, Export PDF |
| Filters | — | — |
| Tabs | — | — |

---

### Integrations (Connections & Automations)
| Element | Current | Production |
|---------|---------|------------|
| Title | "Integrations" | "Integrations" |
| Subtitle | — | Connection count summary (e.g. "4 connections · 12 automations") |
| Actions | "New Connection" button | "New Connection" button |
| Filters | — | Search (by name), Status filter (Active/Error/All), Direction filter (Import/Export) |
| Tabs | — | — |

---

### All Campaigns
| Element | Current | Production |
|---------|---------|------------|
| Title | "Campaigns" | "Campaigns" |
| Subtitle | "Campaign containers grouping related journeys" | — |
| Actions | "New Campaign" button | "New Campaign" button |
| Filters | — | Search, Status filter (Active/Draft/Completed/All), Tag filter |
| Tabs | — | — |

---

### Campaign Detail
| Element | Current | Production |
|---------|---------|------------|
| Breadcrumb | BreadcrumbBar | Campaigns > [Campaign Name] |
| Title | Campaign name (dynamic) | Campaign name + status badge |
| Subtitle | — | Goal text, date range |
| Actions | "Create Journey" button | "Create Journey", "Edit Campaign", "Archive" |
| Filters | TagFilter (journey types) | Journey type filter, status filter |
| Tabs | — | Journeys, Settings, Analytics |

---

### All Journeys
| Element | Current | Production |
|---------|---------|------------|
| Title | "All Journeys" | "All Journeys" |
| Subtitle | "All journey flows across campaigns" | — |
| Actions | — | "Create Journey" button |
| Filters | TagFilter (journey types) | Search, Type filter, Status filter, Campaign filter |
| Tabs | — | — |

---

### Journey Canvas
| Element | Current | Production |
|---------|---------|------------|
| Title | — (canvas toolbar) | Journey name (editable inline) + status badge |
| Subtitle | — | Campaign name (link back) |
| Actions | — | Save, Publish/Pause toggle, Settings, Validate |
| Filters | — | — |
| Tabs | — | Canvas, Analytics, History |

---

### Databases
| Element | Current | Production |
|---------|---------|------------|
| Title | "Databases" | "Databases" |
| Subtitle | "Contact and transactional databases" | — |
| Actions | — | "Import Data", "Create Database" |
| Filters | — | Search |
| Tabs | Contacts + transactional DBs | Contacts, Transactional (dynamic per source) |

---

### Segments
| Element | Current | Production |
|---------|---------|------------|
| Title | "Segments" | "Segments" |
| Subtitle | "Smart and manual audience segments" | — |
| Actions | — | "Create Segment" button |
| Filters | — | Search, Type filter (Smart/Manual), Status filter |
| Tabs | — | — |

---

### Segment Detail
| Element | Current | Production |
|---------|---------|------------|
| Breadcrumb | Back link | Segments > [Segment Name] |
| Title | Segment name (dynamic) | Segment name + type badge + member count |
| Subtitle | — | Last refreshed timestamp |
| Actions | — | "Edit Rules", "Refresh", "Export", "Delete" |
| Filters | — | — |
| Tabs | — | Members, Rules, History |

---

### Fields & Config
| Element | Current | Production |
|---------|---------|------------|
| Title | "Attributes" | "Fields & Configuration" |
| Subtitle | "Field definitions and custom attributes" | — |
| Actions | — | "Create Field" button |
| Filters | — | Search, Type filter (Contact/Transactional/Custom), Source filter |
| Tabs | — | Contact Fields, Transactional Fields, Custom Fields |

---

### Email Templates
| Element | Current | Production |
|---------|---------|------------|
| Title | "Templates" | "Email Templates" |
| Subtitle | "Reusable email and content templates" | — |
| Actions | — | "Create Template" button |
| Filters | — | Search, Category filter, Tag filter |
| Tabs | — | All, Promotional, Transactional, System |

---

### Brand Assets
| Element | Current | Production |
|---------|---------|------------|
| Title | "Assets" | "Brand Assets" |
| Subtitle | — | — |
| Actions | "Upload Asset" button | "Upload Asset" button |
| Filters | ScopeSelector, CampaignPicker, SearchInput, TypeFilter | Same + Tag filter |
| Tabs | — | — |

---

### Forms & Surveys
| Element | Current | Production |
|---------|---------|------------|
| Title | "Forms" | "Forms & Surveys" |
| Subtitle | "Form builder and response tracking" | — |
| Actions | — | "Create Form", "Create Survey" (split button) |
| Filters | — | Search, Type filter (Form/Survey), Status filter |
| Tabs | — | Forms, Surveys |

---

### Media Library
| Element | Current | Production |
|---------|---------|------------|
| Title | "Emails" | "Media Library" |
| Subtitle | "Standalone email content management" | — |
| Actions | — | "Upload" button |
| Filters | — | Search, Type filter (Image/Document/Video), Sort |
| Tabs | — | — |

---

### SMS & Push Templates
| Element | Current | Production |
|---------|---------|------------|
| Title | "SMS" | "SMS & Push" |
| Subtitle | "SMS content management" | — |
| Actions | — | "Create Template" button |
| Filters | — | Search, Channel filter (SMS/Push), Status filter |
| Tabs | — | SMS, Push Notifications |

---

### Reporting Overview
| Element | Current | Production |
|---------|---------|------------|
| Title | "Analytics Dashboards" | "Reporting Overview" |
| Subtitle | "Key performance indicators across your workspace" | — |
| Actions | — | "Export Report", Date range selector |
| Filters | — | Date range, Account filter |
| Tabs | — | — |

---

### Campaign Results
| Element | Current | Production |
|---------|---------|------------|
| Title | "Reports" | "Campaign Results" |
| Subtitle | "Journey and campaign performance reports" | — |
| Actions | — | "Export" button |
| Filters | — | Date range, Campaign filter, Journey filter |
| Tabs | — | — |

---

### Audience Growth
| Element | Current | Production |
|---------|---------|------------|
| Title | "Activity" | "Audience Growth" |
| Subtitle | "Audit log and recent activity feed" | — |
| Actions | — | "Export" button, Date range selector |
| Filters | — | Date range, Source filter (Organic/Import/Form) |
| Tabs | — | — |

---

### Billing Report
| Element | Current | Production |
|---------|---------|------------|
| Title | "Billing Report" | "Billing Report" |
| Subtitle | "Cross-account billing data for the current period" | — |
| Actions | "Download CSV" button | "Download CSV", "Download PDF" |
| Filters | DateRangePicker, Account dropdown, Category segmented control, Reset | Same |
| Tabs | — | — |

---

### Pricing
| Element | Current | Production |
|---------|---------|------------|
| Title | "Pricing" | "Pricing" |
| Subtitle | "Unit prices for all billable items in your account" | — |
| Actions | "Reset to Defaults" button | "Reset to Defaults" |
| Filters | — | — |
| Tabs | — | — |

---

### Brand Configuration (Admin)
| Element | Current | Production |
|---------|---------|------------|
| Title | "Settings" | "Brand Configuration" |
| Subtitle | "Workspace configuration and user management" | — |
| Actions | — | "Save Changes" button |
| Filters | — | — |
| Tabs | — | Logo & Colours, Typography, Email Footer, Social Links |

---

### Business Rules (Admin)
| Element | Current | Production |
|---------|---------|------------|
| Title | — | "Business Rules" |
| Subtitle | — | — |
| Actions | — | "Create Rule" button |
| Filters | — | Search, Category filter |
| Tabs | — | Suppression, Frequency Caps, Compliance |

---

### Users & Permissions (Admin)
| Element | Current | Production |
|---------|---------|------------|
| Title | "Permissions" | "Users & Permissions" |
| Subtitle | — | — |
| Actions | — | "Invite User" button |
| Filters | — | Search, Role filter |
| Tabs | Permission Groups, User Permissions, Account Permissions | Users, Permission Groups, Roles |

---

### Sending Domains (Admin)
| Element | Current | Production |
|---------|---------|------------|
| Title | — | "Sending Domains" |
| Subtitle | — | — |
| Actions | — | "Add Domain" button |
| Filters | — | Status filter (Verified/Pending/Failed) |
| Tabs | — | — |

---

### API & Webhooks (Admin)
| Element | Current | Production |
|---------|---------|------------|
| Title | — | "API & Webhooks" |
| Subtitle | — | — |
| Actions | — | "Create API Key", "Add Webhook" |
| Filters | — | — |
| Tabs | — | API Keys, Webhooks, Logs |

---

### User Management (Platform Admin)
| Element | Current | Production |
|---------|---------|------------|
| Title | "User Management" | "User Management" |
| Subtitle | — | — |
| Actions | — | "Create User" button |
| Filters | — | Search, Role filter, Account filter, Status filter |
| Tabs | — | — |

---

## Component Requirements Summary

Based on this audit, the `PageHeader` component needs to support:

### Props
| Prop | Type | Description |
|------|------|-------------|
| `title` | string | Required. Page heading. |
| `subtitle` | string | Optional. Secondary text below title. |
| `statusBadge` | ReactNode | Optional. Status chip next to title (Active, Draft, etc.) |
| `breadcrumbs` | Array<{label, path}> | Optional. Breadcrumb trail above title. |
| `primaryAction` | ReactNode | Optional. Primary button (right-aligned). |
| `secondaryActions` | ReactNode[] | Optional. Additional action buttons. |
| `tabs` | Array<{label, value}> | Optional. Tab bar below title row. |
| `activeTab` | string | Required if tabs provided. |
| `onTabChange` | (value) => void | Required if tabs provided. |
| `filters` | ReactNode | Optional. Filter row below tabs. |
| `bulkActions` | ReactNode | Optional. Shown when items are selected. |
| `selectedCount` | number | Optional. Drives bulk action row visibility. |

### Layout Variants
1. **Simple** — Title + optional action (most pages)
2. **With tabs** — Title + tabs + content per tab
3. **With filters** — Title + action + filter bar
4. **Detail page** — Breadcrumb + title + status + multiple actions
5. **Canvas** — Minimal toolbar (Journey Builder)

### Responsive Behaviour
- Filters wrap on narrow screens
- Actions collapse into overflow menu on mobile
- Tabs become scrollable on narrow screens
