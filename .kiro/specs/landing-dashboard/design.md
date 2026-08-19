# Design: Landing Dashboard

> Last updated: 2026-08-13
> Status: Draft
> Reference implementation: `src/pages/HomePage.tsx` (to be created)

## Design Goals

- **Instant comprehension** — user understands system status within 5 seconds
- **Action-oriented** — every section has a clear "what to do next"
- **Problems surface** — errors and warnings bubble up, not buried
- **No vanity metrics** — every number shown is actionable or contextual
- **Consistent with AAA framework** — reinforces Acquire/Analyse/Act mental model

## Design Principles for This Feature

| Principle | Application |
|-----------|-------------|
| Progressive disclosure | Hero stats → pillar detail → activity feed |
| Problems first | Errors/warnings appear at top of activity feed |
| One primary action per section | Each pillar card has one prominent CTA |
| No dead ends | Empty states guide users to their first action |

---

## Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Page Shell (no breadcrumb — this is home)                                  │
│  Title: "Dashboard" | Subtitle: account-specific tagline                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ STAT CARD 1 │ │ STAT CARD 2 │ │ STAT CARD 3 │ │ STAT CARD 4 │           │
│  │ Total       │ │ Contactable │ │ Active      │ │ Engagement  │           │
│  │ Contacts    │ │             │ │ Mailouts    │ │ Rate        │           │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                                             │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐         │
│  │    ACQUIRE        │ │    ANALYSE        │ │    ACT            │         │
│  │                   │ │                   │ │                   │         │
│  │  • 2 connections  │ │  • 12 segments    │ │  • 3 active       │         │
│  │  • Last import:   │ │  • Gold: 892      │ │  • Next send:     │         │
│  │    2h ago         │ │  • Lapsed: 2,341  │ │    Tomorrow 9am   │         │
│  │                   │ │                   │ │                   │         │
│  │  [Secondary]      │ │  [Secondary]      │ │  [Secondary]      │         │
│  │  [  Primary  ]    │ │  [  Primary  ]    │ │  [  Primary  ]    │         │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘         │
│                                                                             │
│  RECENT ACTIVITY                                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ 🔴 3 days   Connection 'SFTP Warehouse' failed — needs attention        ││
│  │ 🟢 2h ago   Import completed: 1,234 contacts from Shopify               ││
│  │ 🟢 Yesterday Mailout 'June Newsletter' sent to 2,340 (24% opened)       ││
│  │ 🟡 2 days   Segment 'Lapsed' updated: 2,341 contacts                    ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Components

### Hero Stat Card

A compact card showing a single metric with trend.

**Anatomy:**
```
┌─────────────────────┐
│ Label          [i]  │  ← muted text, optional info tooltip
│ 60,705              │  ← large number (text-2xl semibold)
│ +1.2% ↑ this month  │  ← trend line (green/red/muted)
└─────────────────────┘
```

**States:**
- Default — shows metric with trend
- Loading — skeleton pulse
- Empty — shows "—" with prompt text
- Error — shows "!" icon with "Unable to load"

**Tokens:**
- Card: `bg-card`, `border border-border`, `rounded-lg`, `p-4`
- Label: `text-sm text-muted-foreground`
- Value: `text-2xl font-semibold text-foreground`
- Trend up: `text-sm text-success` (green)
- Trend down: `text-sm text-destructive` (red)
- Trend flat: `text-sm text-muted-foreground`

### Pillar Card

A larger card representing one AAA pillar with status and actions.

**Anatomy:**
```
┌─────────────────────────────┐
│ Icon   PILLAR NAME          │  ← icon + heading
│        Subtitle text        │  ← muted description
│                             │
│ • Status item 1             │  ← bullet list
│ • Status item 2             │
│ • Status item 3             │
│                             │
│ [View All]  [Primary CTA]   │  ← secondary + primary buttons
└─────────────────────────────┘
```

**Empty State Anatomy:**
```
┌─────────────────────────────┐
│        [Illustration]       │  ← centered illustration
│                             │
│     Headline text           │  ← centered, semibold
│     Description text        │  ← centered, muted
│                             │
│       [Primary CTA]         │  ← centered primary button
└─────────────────────────────┘
```

**Tokens:**
- Card: `bg-card`, `border border-border`, `rounded-lg`, `p-5`
- Icon: 24px Phosphor icon, `text-primary`
- Heading: `text-lg font-semibold text-foreground`
- Subtitle: `text-sm text-muted-foreground`
- Status items: `text-sm text-foreground`, bullet is `text-muted-foreground`
- Error status: `text-sm text-destructive`

### Activity Feed Item

A single row in the activity feed.

**Anatomy:**
```
┌────────────────────────────────────────────────────────────────┐
│ ●  2h ago   Import completed: 1,234 contacts from Shopify      │
│ ↑  ↑        ↑                                                  │
│ dot time   description                                         │
└────────────────────────────────────────────────────────────────┘
```

**Status Indicators:**
- 🟢 Success: `bg-success` (green dot)
- 🟡 Warning: `bg-warning` (amber dot)
- 🔴 Error: `bg-destructive` (red dot)

**Tokens:**
- Row: `py-3 px-4`, `border-b border-border last:border-b-0`
- Dot: `w-2 h-2 rounded-full`
- Timestamp: `text-sm text-muted-foreground w-20` (fixed width for alignment)
- Description: `text-sm text-foreground`

---

## Interactions

### Stat Card Click
- Clicking a stat card navigates to the relevant detail page
- Total Contacts → `/audiences/databases`
- Contactable → `/audiences/databases` (filtered?)
- Active Mailouts → `/automations/campaigns`
- Engagement Rate → `/analytics/reports`

### Pillar Card Actions
- Primary button: starts creation flow (modal or navigate)
- Secondary button: navigates to list view

| Card | Secondary | Primary |
|------|-----------|---------|
| Acquire | View Connectors → `/audiences/connectors` | Import Data → opens import modal or `/audiences/connectors` |
| Analyse | View Segments → `/audiences/segments` | Build Segment → `/audiences/segments/new` |
| Act | View Mailouts → `/automations/campaigns` | Create Mailout → `/automations/campaigns/new` |

### Activity Feed Click
- Clicking an activity item navigates to the relevant detail
- Import → connector detail
- Mailout → mailout detail/report
- Segment → segment detail
- Connection → connector settings

---

## Empty States

### No Contacts (affects entire hero row)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Illustration: empty database]                                             │
│                                                                             │
│  Get started by importing your contacts                                     │
│  Connect a data source or upload a file to begin.                          │
│                                                                             │
│  [Import Contacts]                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### No Connections (Acquire card)
- Icon: PlugsConnected (Phosphor)
- Headline: "Connect your data"
- Description: "Set up your first connection to start importing contacts."
- CTA: "Create Connection"

### No Segments (Analyse card)
- Icon: UsersThree (Phosphor)
- Headline: "Build your first segment"
- Description: "Group contacts by behavior or attributes for targeted campaigns."
- CTA: "Create Segment"

### No Mailouts (Act card)
- Icon: PaperPlaneTilt (Phosphor)
- Headline: "Send your first mailout"
- Description: "Reach your audience with targeted email communications."
- CTA: "Create Mailout"

### No Activity
- Simple text: "No recent activity"
- Subtle: "Events from the last 7 days will appear here."

---

## Accessibility Notes

- All stat cards are focusable and clickable (button or link role)
- Activity feed items are focusable for keyboard navigation
- Status indicators have aria-label ("Success", "Warning", "Error")
- Empty state CTAs are the first focusable element when no content exists
- Trend arrows have aria-hidden="true" with text description for screen readers

---

## Design Decisions & Alternatives

| Decision | Chosen | Alternative | Rationale |
|----------|--------|-------------|-----------|
| 4 hero stats | Fixed 4 | 3 or 5 | 4 fits well at 1280px, covers key metrics without overwhelming |
| AAA pillar cards | Equal width, 3 columns | Tabbed or accordion | Visual reinforcement of AAA framework; all visible at once |
| Activity feed at bottom | Below pillars | Sidebar | Most important info (stats + actions) above fold; feed is secondary |
| Errors at top of feed | Always | Chronological only | Problems need attention first; don't bury them |
| No greeting | Removed | "Hi Brad!" | Wastes space after first visit; not actionable |
| No sparklines V1 | Deferred | Include | Adds complexity; revisit if users request trends |

---

## Architecture

### Page Component
- `src/pages/HomePage.tsx` — new landing dashboard
- Current `DashboardPage.tsx` renamed to `ConnectorsPage.tsx` and moved to `/audiences/connectors`

### New Components
- `src/components/dashboard/StatCard.tsx` — hero stat card
- `src/components/dashboard/PillarCard.tsx` — AAA pillar card
- `src/components/dashboard/ActivityFeed.tsx` — recent activity list
- `src/components/dashboard/ActivityFeedItem.tsx` — single activity row

### Data
- `src/data/dashboardStats.ts` — seed data for prototype stats
- `src/data/activityFeed.ts` — seed data for activity events

### Routes
- `/dashboard` → `HomePage.tsx` (new landing dashboard)
- `/audiences/connectors` → `ConnectorsPage.tsx` (current dashboard content)

---

## Open Questions

| # | Question | Status |
|---|----------|--------|
| 1 | Should pillar cards have icons? | Proposed: yes, subtle icon next to heading |
| 2 | Activity feed pagination or "View all"? | Proposed: "View all" link to full activity log (future) |
