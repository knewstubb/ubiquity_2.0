# Requirements Document

## Introduction

This spec covers the Phase 1 skeleton scaffold for the UbiQuity 2.0 interactive design prototype. The goal is to stand up shared TypeScript data models, realistic NZ spa chain sample data, placeholder pages for every navigation sub-item, working end-to-end click-through navigation, and an account context switcher — so that all 13 feature specs have a foundation to build on. The Integrations section is already fully built and must remain untouched.

## Glossary

- **Prototype**: The UbiQuity 2.0 interactive design prototype — a React 19 + TypeScript + Vite application using CSS Modules, React Router, and local state only
- **Account**: A hierarchical business entity representing a master organisation or regional child location within the Serenity Spa Group
- **Account_Switcher**: A UI control in the navigation bar that allows the user to select which Account's data is displayed across all pages
- **Account_Context**: A React Context provider that holds the currently selected Account and exposes account-filtered data to all child components
- **Contact**: A customer record with profile information, membership tier, activity history, segment membership, and journey participation
- **Segment**: A named group of Contacts defined by either smart rules or manual selection, with a computed member count
- **Campaign**: A marketing initiative that groups related Journeys under a shared goal, date range, and status
- **Journey**: An automated workflow within a Campaign, with a status, node count, entry count, and type
- **Asset**: A reusable content item (image, template, or snippet) with tags and usage tracking
- **Notification**: An in-app notification with type, message, timestamp, read state, and optional navigation link
- **Placeholder_Page**: A page that renders realistic headers, metric cards, data lists, or empty states using sample data — not a "coming soon" stub
- **Nav_Bar**: The existing AppNavBar component providing primary and secondary navigation across all sections
- **Sample_Data**: Pre-seeded realistic data for the NZ Serenity Spa Group scenario including ~50 contacts with NZ names, 4 regional child accounts, campaigns, journeys, segments, and assets

## Requirements

### Requirement 1: Shared Data Models

**User Story:** As a prototype developer, I want a complete set of TypeScript interfaces for all platform entities, so that every feature spec builds on a consistent, shared type system.

#### Acceptance Criteria

1. THE Prototype SHALL define an `Account` interface with fields: id, name, parentId (nullable), childIds, region, and status
2. THE Prototype SHALL extend the existing `ContactRecord` interface into a richer `Contact` interface that includes accountId, segmentIds, journeyIds, activityTimeline (array of timestamped events), and all existing fields
3. THE Prototype SHALL define a `Segment` interface with fields: id, name, accountId, type (smart or manual), rules (array of filter rule objects), and memberCount
4. THE Prototype SHALL define a `Campaign` interface with fields: id, name, accountId, goal, dateRange (start and end dates), status (draft, active, paused, completed), journeyIds, and tags
5. THE Prototype SHALL define a `Journey` interface with fields: id, name, campaignId, accountId, status (draft, active, paused, completed), nodeCount, entryCount, and type (welcome, re-engagement, transactional, promotional)
6. THE Prototype SHALL define an `Asset` interface with fields: id, name, accountId, type (image, template, snippet), tags, createdAt, and usageCount
7. THE Prototype SHALL define a `Notification` interface with fields: id, type (info, warning, success, error), message, timestamp, read (boolean), and linkTo (optional route path)
8. THE Prototype SHALL export all new interfaces from a single models barrel file alongside existing model exports

### Requirement 2: NZ Spa Chain Sample Data

**User Story:** As a prototype reviewer, I want realistic pre-seeded data for a NZ spa chain scenario, so that every page feels like a real product with believable content.

#### Acceptance Criteria

1. THE Sample_Data SHALL include a master Account named "Serenity Spa Group" with region "National" and four child Accounts for Auckland, Wellington, Christchurch, and Queenstown
2. THE Sample_Data SHALL include approximately 50 Contact records using NZ-appropriate names, distributed across the four regional Accounts with varied membership tiers (Bronze, Silver, Gold, Platinum)
3. THE Sample_Data SHALL include at least four Segment records: "Gold Members", "New This Month", "At Risk", and "Auckland Region", each with appropriate type and memberCount values
4. THE Sample_Data SHALL include three to four Campaign records with varied statuses (draft, active, completed) distributed across Accounts
5. THE Sample_Data SHALL include two to three Journey records per Campaign with varied statuses and types
6. THE Sample_Data SHALL include at least eight Asset records across image, template, and snippet types with realistic names and usage counts
7. THE Sample_Data SHALL include at least six Notification records with varied types and read states
8. WHEN the Account_Switcher selects a specific child Account, THE Sample_Data SHALL be filterable by accountId so that only data belonging to that Account (or the master Account for shared data) is displayed

### Requirement 3: Account Context and Switcher

**User Story:** As a prototype user, I want to switch between the master account and regional child accounts, so that I can see how data filtering works across the platform.

#### Acceptance Criteria

1. THE Account_Context SHALL be a React Context provider that stores the currently selected Account and provides it to all child components
2. THE Account_Context SHALL default to the master "Serenity Spa Group" Account on initial load, showing data from all Accounts
3. WHEN the user selects a child Account in the Account_Switcher, THE Account_Context SHALL update the selected Account and all pages SHALL display only data belonging to that Account
4. WHEN the user selects the master Account in the Account_Switcher, THE Account_Context SHALL show aggregated data from all child Accounts
5. THE Account_Switcher SHALL render as a dropdown control within the Nav_Bar, positioned to the right of the logo and before the primary navigation items
6. THE Account_Switcher SHALL display the currently selected Account name and visually distinguish the master Account from child Accounts in the dropdown list

### Requirement 4: Placeholder Pages for All Navigation Sub-Items

**User Story:** As a prototype reviewer, I want every navigation sub-item to lead to a realistic-looking page with appropriate headers and sample data, so that the prototype feels like a complete product.

#### Acceptance Criteria

1. THE Prototype SHALL render a Dashboard page at `/dashboard` displaying overview metric cards (total contacts, active campaigns, active journeys, total segments) using data from the Account_Context
2. THE Prototype SHALL render a Segments page at `/audiences/segments` displaying a list of Segment records with name, type badge, and member count
3. THE Prototype SHALL render a Databases page at `/audiences/databases` displaying a searchable list of Contact records with name, email, membership tier, and account columns
4. THE Prototype SHALL render an Attributes page at `/audiences/attributes` displaying a list of field definitions with name, data type, and source columns
5. THE Prototype SHALL render a Campaigns page at `/automations/campaigns` displaying Campaign records grouped by status (active, draft, paused, completed) with name, date range, and journey count
6. THE Prototype SHALL render a Journeys page at `/automations/journeys` displaying a list of Journey records with name, campaign name, status badge, type, and entry count
7. THE Prototype SHALL preserve the existing Integrations page at the `/` route and the `/connector/:id` route without modification
8. THE Prototype SHALL render a Templates page at `/content/templates` displaying a grid of Asset records filtered to type "template" with name, tags, and usage count
9. THE Prototype SHALL render an Emails page at `/content/emails` displaying a list of email content items with name, status, and last modified date
10. THE Prototype SHALL render a Forms page at `/content/forms` displaying a list of form items with name, status, and response count
11. THE Prototype SHALL render an SMS page at `/content/sms` displaying a list of SMS content items with name, status, and send count
12. THE Prototype SHALL render an Analytics Dashboards page at `/analytics/dashboards` displaying overview metric cards for key performance indicators
13. THE Prototype SHALL render a Reports page at `/analytics/reports` displaying a list of available reports with name, type, and date range
14. THE Prototype SHALL render an Activity page at `/analytics/activity` displaying a chronological feed of recent activity events
15. THE Prototype SHALL render a Billing page at `/analytics/billing` displaying a billing summary with usage metrics and plan information
16. THE Prototype SHALL render a Settings page at `/settings` displaying sections for workspace configuration and a users/permissions placeholder list

### Requirement 5: End-to-End Navigation

**User Story:** As a prototype user, I want to click any navigation item and arrive at the correct page with working back-navigation, so that the prototype feels like a real application.

#### Acceptance Criteria

1. THE Nav_Bar SHALL route to the correct Placeholder_Page for every primary and secondary navigation item defined in the navigation structure
2. WHEN the user clicks a primary navigation item that has sub-items, THE Nav_Bar SHALL navigate to the first sub-item of that section
3. WHEN the user navigates to any page, THE Nav_Bar SHALL visually highlight the active primary item and active sub-item using the existing teal underline pattern
4. THE Prototype SHALL define explicit React Router routes for every Placeholder_Page path instead of using wildcard catch-all routes
5. WHEN the user navigates directly to a URL (deep link), THE Prototype SHALL render the correct page and highlight the correct navigation items
6. THE Prototype SHALL preserve the existing `/` route for the Integrations DashboardPage and the `/connector/:id` route for ConnectorDetailPage without modification

### Requirement 6: Visual Consistency

**User Story:** As a prototype reviewer, I want all new pages to follow the established design system, so that the prototype looks and feels like a cohesive product.

#### Acceptance Criteria

1. THE Prototype SHALL use the existing CSS custom properties for colours, typography, spacing, shadows, and border radius on all new pages
2. THE Prototype SHALL use the zinc-50 background, Inter font family, and teal accent colour consistently across all Placeholder_Pages
3. THE Prototype SHALL use CSS Modules for all new component and page styles, following the existing `*.module.css` naming convention
4. WHEN a page displays a data list, THE Prototype SHALL use a consistent table or card layout pattern with the established border, shadow, and spacing tokens
5. WHEN a page displays metric cards, THE Prototype SHALL use a consistent card layout with the established shadow and border radius tokens
6. THE Prototype SHALL use status badges with consistent colour coding: teal for active, amber for paused, zinc for draft, and green for completed
