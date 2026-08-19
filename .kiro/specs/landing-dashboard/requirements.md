# Requirements: Landing Dashboard

## 1. Problem Statement

The current dashboard (production) is a greeting page that shows:
- A personalised "Hi [Name]!" header that wastes prime screen space after the first visit
- Recent mailouts with no status context (are they active? finished? failed?)
- A vanity contact count (60,705) with an unreadable sparkline
- A sparse Delivered/Read/Clicked chart with no actionable insight
- No clear actions — users don't know what to *do* next

Users hate it because it doesn't help them understand what's happening or what needs attention.

## 2. Outcome

A landing dashboard that gives users an instant pulse on their data, campaigns, and system health — with clear paths to action. Within 5 seconds of landing, a user should know:
- How many contacts they can reach
- What's running right now
- Whether anything needs attention
- What they can do next

## 3. Users

| User | Role |
|------|------|
| Marketing Manager | Checks daily for campaign status, engagement trends, and system health |
| Marketing Coordinator | Uses quick actions to create mailouts, import data, or build segments |
| Account Admin | Monitors connection health and data flow |

## 4. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | Dashboard loads in under 2 seconds (prototype: static data, no API calls) |
| NFR-2 | Works at 1280px+ viewport width (standard desktop) |
| NFR-3 | All interactive elements keyboard accessible |
| NFR-4 | Activity feed shows last 7 days of events, max 10 items |

## 5. User Stories & Acceptance Criteria

### 5.1 Hero Stats Row

**US-5.1.1** As a marketing manager, I want to see key metrics at a glance so I can quickly assess my audience health.

#### Acceptance Criteria
- WHEN the dashboard loads, THE SYSTEM SHALL display 4 stat cards in a horizontal row:
  1. **Total Contacts** — count with % change from last month
  2. **Contactable** — count and % of total (contacts with valid email, not suppressed/bounced/unsubscribed)
  3. **Active Mailouts** — count of currently sending/scheduled mailouts
  4. **Engagement Rate** — combined open + click rate (last 30 days)
- WHEN a stat has a positive trend, THE SYSTEM SHALL display a green up arrow
- WHEN a stat has a negative trend, THE SYSTEM SHALL display a red down arrow
- WHEN a stat has no change, THE SYSTEM SHALL display "No change" in muted text

### 5.2 AAA Pillar Cards

**US-5.2.1** As a marketing coordinator, I want to see the status of each pillar (Acquire, Analyse, Act) so I can quickly navigate to what I need.

#### Acceptance Criteria
- WHEN the dashboard loads, THE SYSTEM SHALL display 3 equal-width cards:
  1. **Acquire** — data coming in
  2. **Analyse** — understanding it
  3. **Act** — doing something with it
- EACH card SHALL display:
  - Pillar name and subtitle
  - 2-3 relevant status items (e.g., "2 connections active", "Last import: 2h ago")
  - 2 action buttons (primary + secondary)

#### Acquire Card Content
- Status: connection count, last import timestamp, any errors
- Actions: "View Connectors" (secondary), "Import Data" (primary)

#### Analyse Card Content
- Status: segment count, top 2 segments by name + count
- Actions: "View Segments" (secondary), "Build Segment" (primary)

#### Act Card Content
- Status: active mailout count, next scheduled send
- Actions: "View Mailouts" (secondary), "Create Mailout" (primary)

### 5.3 Activity Feed

**US-5.3.1** As a marketing manager, I want to see recent activity so I can understand what's happened without digging through logs.

#### Acceptance Criteria
- WHEN the dashboard loads, THE SYSTEM SHALL display a "Recent Activity" section with the last 7 days of events
- THE SYSTEM SHALL show max 10 events
- EACH event SHALL display:
  - Status indicator (green = success, yellow = warning, red = error)
  - Relative timestamp (e.g., "2h ago", "Yesterday", "3 days ago")
  - Event description (e.g., "Import completed: 1,234 contacts from Shopify")
- WHEN there are error/warning events, THE SYSTEM SHALL display them at the top regardless of timestamp
- WHEN there are no events, THE SYSTEM SHALL display an empty state message

#### Event Types
- Import completed/failed
- Mailout sent/scheduled/failed
- Segment updated
- Connection status change (connected/failed)
- Export completed/failed

### 5.4 Empty States

**US-5.4.1** As a new user, I want to understand what to do first so I can get value from the platform quickly.

#### Acceptance Criteria
- WHEN there are no contacts, THE SYSTEM SHALL show an onboarding state in the Hero Stats section with a prompt to import data
- WHEN there are no connections, THE Acquire card SHALL show: illustration, "Connect your data" headline, "Set up your first connection to start importing contacts" description, "Create Connection" primary button
- WHEN there are no segments, THE Analyse card SHALL show: illustration, "Build your first segment" headline, "Group contacts by behavior or attributes" description, "Create Segment" primary button
- WHEN there are no mailouts, THE Act card SHALL show: illustration, "Send your first mailout" headline, "Reach your audience with targeted communications" description, "Create Mailout" primary button
- WHEN there are no activity events, THE feed SHALL show: "No recent activity" with subtle prompt to take first action

## 6. In Scope

- Static prototype dashboard with seed data
- Hero stats row (4 cards)
- AAA pillar cards (3 cards)
- Activity feed (7 days, max 10 items)
- Empty states for each section
- Route change: `/dashboard` becomes landing dashboard, connectors move to `/audiences/connectors`

## 7. Out of Scope

| Item | Reason |
|------|--------|
| Live data from Supabase | Prototype uses static seed data |
| Personalised greeting | Deliberately removed — wastes space |
| Sparkline charts | Add in V2 if users want trends visualised |
| Customisable dashboard | Deferred — keep it simple |
| Mobile responsive | Prototype is desktop-only (1280px+) |
| Dark mode | Existing token system handles this automatically |

## 8. Open Questions

| # | Question | Status |
|---|----------|--------|
| 1 | What makes a contact "contactable"? (valid email + not suppressed + not bounced + not unsubscribed?) | Assumed: valid email AND not globally suppressed AND email not hard-bounced AND not unsubscribed |
| 2 | Should "Engagement Rate" be opens only, or opens + clicks? | Decided: opens + unique clicks combined |
| 3 | Route for connectors page after dashboard takes `/dashboard`? | Proposed: `/audiences/connectors` |
