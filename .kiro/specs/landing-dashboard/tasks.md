# Tasks: Landing Dashboard

> Feature: Landing Dashboard
> Spec: `.kiro/specs/landing-dashboard/`
> Status: Ready for implementation

---

## Phase 1: Route Restructure

### 1.1 Rename DashboardPage to ConnectorsPage
- [ ] Rename `src/pages/DashboardPage.tsx` → `src/pages/ConnectorsPage.tsx`
- [ ] Update component name inside file
- [ ] Update breadcrumb to show "Audience > Connectors"

### 1.2 Update Routes
- [ ] Change route for ConnectorsPage from `/dashboard` to `/audiences/connectors`
- [ ] Create new route `/dashboard` for HomePage (landing dashboard)
- [ ] Update any navigation links that point to old `/dashboard`

### 1.3 Update Navigation
- [ ] Update `AppNavBar.tsx` — "Integrations" dropdown item should go to `/audiences/connectors`
- [ ] Verify "Home" nav item points to `/dashboard`

---

## Phase 2: Seed Data

### 2.1 Dashboard Stats Data
- [ ] Create `src/data/dashboardStats.ts` with:
  - Total contacts (60,705, +1.2%)
  - Contactable (40,709, 67%)
  - Active mailouts (3)
  - Engagement rate (24.3%)

### 2.2 Activity Feed Data
- [ ] Create `src/data/activityFeed.ts` with:
  - 8-10 sample events (mix of success, warning, error)
  - Event types: import, mailout, segment, connection
  - Timestamps spanning last 7 days

### 2.3 Pillar Summary Data
- [ ] Add to dashboardStats or separate file:
  - Acquire: connection count, last import timestamp, error count
  - Analyse: segment count, top 2 segments with counts
  - Act: active mailout count, next scheduled send

---

## Phase 3: Components

### 3.1 StatCard Component
- [ ] Create `src/components/dashboard/StatCard.tsx`
- [ ] Props: label, value, trend (up/down/flat), trendValue, onClick
- [ ] Render: label, large value, trend indicator with arrow
- [ ] Add to component library demo page

### 3.2 PillarCard Component
- [ ] Create `src/components/dashboard/PillarCard.tsx`
- [ ] Props: title, subtitle, icon, statusItems[], primaryAction, secondaryAction
- [ ] Render: icon + heading, status list, action buttons
- [ ] Empty state variant (illustration, headline, description, single CTA)
- [ ] Add to component library demo page

### 3.3 ActivityFeedItem Component
- [ ] Create `src/components/dashboard/ActivityFeedItem.tsx`
- [ ] Props: status (success/warning/error), timestamp, description, onClick
- [ ] Render: status dot, relative time, description text

### 3.4 ActivityFeed Component
- [ ] Create `src/components/dashboard/ActivityFeed.tsx`
- [ ] Props: items[], emptyMessage
- [ ] Logic: sort errors/warnings to top, then by timestamp
- [ ] Render: list of ActivityFeedItem, empty state when no items

---

## Phase 4: Landing Dashboard Page

### 4.1 Create HomePage
- [ ] Create `src/pages/HomePage.tsx`
- [ ] Use PageShell with title "Dashboard"
- [ ] Import seed data from data files

### 4.2 Hero Stats Row
- [ ] Render 4 StatCard components in a row
- [ ] Wire up click handlers to navigate to detail pages
- [ ] Handle empty state (no contacts → onboarding prompt)

### 4.3 AAA Pillar Cards Row
- [ ] Render 3 PillarCard components in equal columns
- [ ] Acquire: connectors context
- [ ] Analyse: segments context
- [ ] Act: mailouts context
- [ ] Wire up action buttons to navigate/open modals
- [ ] Handle empty states per card

### 4.4 Activity Feed Section
- [ ] Render ActivityFeed with seed data
- [ ] Section heading "Recent Activity"
- [ ] Handle empty state

---

## Phase 5: Polish & Verify

### 5.1 Keyboard Accessibility
- [ ] All cards focusable and clickable
- [ ] Activity items focusable
- [ ] Focus order logical (stats → pillars → feed)

### 5.2 Build & Test
- [ ] Run build, verify no TypeScript errors
- [ ] Manual test navigation flows
- [ ] Verify empty states display correctly

### 5.3 Commit
- [ ] Stage all new/modified files
- [ ] Commit with proper message referencing spec

---

## Dependencies

- Phase 2 depends on Phase 1 (routes must be in place)
- Phase 4 depends on Phase 2 (need data) and Phase 3 (need components)
- Phase 5 depends on Phase 4

## Refs

- Requirements: `.kiro/specs/landing-dashboard/requirements.md`
- Design: `.kiro/specs/landing-dashboard/design.md`
