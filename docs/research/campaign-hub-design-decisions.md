# Campaign Hub — Design Decisions

## Purpose

This document captures design decisions made during conversations between the PO and UX team regarding the redesign of the Campaigns section from a rarely-used container into the primary orchestration hub for all marketing activities in UbiQuity 2.0.

---

## 1. The Hub Concept

### Decision

Campaigns becomes the primary navigation destination for orchestrating marketing activity. Instead of users bouncing between Email, TXT, Surveys, and Events sections to build and send individual items, they start in the Campaign Hub.

### Principles

- **Single place** — all active, planned, and completed communications are visible from one view
- **Campaign is one level of container** — no nesting. Journeys and objects live inside campaigns, but campaigns don't live inside other campaigns
- **Tags + search for discovery** — not infinite folders. Cross-campaign discovery happens through tagging and search, not hierarchy
- **Stepping stone to the journey builder** — the proto-journey visualisation ships first; the full visual canvas comes later

### What this replaces

The legacy system has two parallel organising systems (Campaigns at `/components/{id}` and Email Dashboard at `/email/dashboard/{id}`) that operate on overlapping content. Users must mentally track which navigation path to use. The Campaign Hub collapses this into a single entry point.

### Navigation position

Campaigns sits in the top-level nav bar as a primary destination. Sub-items in the dropdown:
- All Campaigns → `/automations/campaigns`
- All Journeys → `/automations/journeys`

---

## 2. Campaign Structure

### Container model

One level of container only:

```
Campaign
├── Journey A
├── Journey B
├── Mailout (standalone)
├── Automated Mailout
├── Form
├── Survey
├── Event
├── TXT Out
└── Push Notification
```

No sub-campaigns. No folders within campaigns. No nesting.

### Campaign metadata

| Field | Type | Notes |
|-------|------|-------|
| Name | Text (required) | Displayed in list views and breadcrumbs |
| Goal / Description | Text (optional) | Internal context — why this campaign exists |
| Date range | Start + end date | Planning dates, not execution dates |
| Owner | User reference | Accountable person |
| Tags | Multi-value | Primary discovery mechanism |
| Status | Enum | Draft → Active → Completed → Archived |

### Status lifecycle

```
┌───────┐     ┌────────┐     ┌───────────┐     ┌──────────┐
│ Draft │────▶│ Active │────▶│ Completed │────▶│ Archived │
└───────┘     └────────┘     └───────────┘     └──────────┘
```

- **Draft** — campaign exists but nothing is live
- **Active** — at least one object within the campaign is live or scheduled
- **Completed** — all objects have finished executing
- **Archived** — removed from active views, accessible via search/filter

### Objects within a campaign

A flat list of communication objects. Each object has its own type, status, and configuration:

| Object Type | Description |
|-------------|-------------|
| Mailout | One-time email send |
| Automated Mailout | Trigger-based email |
| Form | Data collection |
| Survey | Multi-question survey |
| Event | Event registration/attendance |
| TXT Out | One-time SMS |
| Automated TXT Out | Trigger-based SMS |
| Push Notification | Mobile push |

Eventually, these objects become journey steps. For now, they remain independently configured items grouped under the campaign umbrella.

### Discovery model

- **Tags** — applied at campaign level AND object level. Free-text with autocomplete from existing tags.
- **Search** — full-text across campaign names, descriptions, object names, and tags
- **Filters** — status, date range, owner, object type, tag
- **No folders** — campaigns are not organised into folders. Tags replace the folder metaphor.

### Namespace for the filter builder

The campaign provides hierarchical context for the filter builder's source picker:

```
Email > Summer Campaign > Welcome Series > [fields]
```

This gives filters a readable namespace when referencing objects within a campaign.

---

## 3. Proto-Journey: Relationship Visualisation

### Concept

A read-only directed graph that shows how objects within a campaign relate to each other based on their filter expressions. This is the core innovation for the stepping-stone phase — it makes implicit journey logic visible without building an orchestration engine.

### How it works

1. **System parses** the filter expression on each object within a campaign
2. **When a filter references another object** (e.g., "received Mailout A", "submitted Form B", "opened Email C"), an edge is drawn between them
3. **Result:** a directed graph showing Object A → Object B, meaning "B targets people who interacted with A"

### Key characteristics

| Characteristic | Detail |
|----------------|--------|
| **Auto-detected** | No user action needed. The system reads existing filters and infers relationships automatically. |
| **Read-only** | Users cannot create or modify relationships from the graph view. |
| **Scoped to campaign** | Only shows edges where BOTH source and target objects are within the same campaign. |
| **External references** | If an object's filter references something outside the campaign, show it as a ghost/dimmed node with a link to the source campaign. |

### Interactions

| Action | Result |
|--------|--------|
| Click a node | Opens the existing object editor (mailout editor, survey editor, etc.) |
| Click an edge | Shows the filter expression that creates the relationship |
| Hover a node | Highlights all connected edges and adjacent nodes |
| Click an external reference node | Navigates to the source campaign containing that object |

### Visualisation style

- **Layout direction:** Left-to-right or top-to-bottom flow (simple directed graph)
- **Nodes:** Icon + name + type badge + status indicator
- **Edges:** Directed arrows labelled with the relationship condition ("received", "opened", "submitted", "clicked", etc.)
- **External reference nodes:** Dimmed opacity + dashed border to indicate "lives elsewhere"
- **Not a drag-and-drop canvas** — purely a visual representation of existing relationships

### Node anatomy

```
┌─────────────────────────────┐
│ [icon]  Object Name         │
│         Type Badge  ● Status│
└─────────────────────────────┘
```

### Edge labels

The label on each edge describes the filter condition that creates the relationship:

- "received" — filter checks if contact received the source object
- "opened" — filter checks if contact opened the source object
- "clicked" — filter checks if contact clicked a link in the source object
- "submitted" — filter checks if contact submitted the source form/survey
- "attended" — filter checks if contact attended the source event
- "not received" — negative condition (exclusion relationship)

### What this achieves

- Makes implicit journey logic visible without building an orchestration engine
- Helps users understand how their communications relate to each other
- Provides a foundation for the full journey builder (the graph becomes editable later)
- Answers the question: "what happens after someone receives Email A?"

### Limitations (by design for v1)

| Limitation | Rationale |
|------------|-----------|
| No execution logic | Objects still run independently with their own schedules/triggers. The graph is informational only. |
| No timing/wait steps | The graph shows logical relationships, not temporal sequence. |
| No branching logic (AND/OR paths) | Only "references" are shown — not conditional branching. |
| Cannot create relationships from the graph | Must edit the filter on the individual object to establish a reference. |
| No layout persistence | Graph is auto-laid-out each time. Users cannot rearrange nodes. |

---

## 4. Start Step Model (Future — Journey Builder)

When the full journey builder ships, each journey has a "Start" step as its first node. This section documents the agreed design for future reference.

### Start step structure

The Start step has three sections:

#### A. Inherited Rules Badge

- Read-only indicator at the top of the Start step
- Shows account-level and channel-level rules: age gates, frequency caps, suppression lists
- Displayed as an icon/badge with click-to-reveal details panel
- **Cannot be edited at the journey level** — inherited from account settings
- Purpose: make governance visible without creating per-journey configuration burden

#### B. Trigger Section

What initiates entry into the journey:

| Trigger Type | Description | Example |
|--------------|-------------|---------|
| Segment-based | Contact matches a filter condition | "Region = Auckland AND age ≥ 25" (batch or continuous evaluation) |
| Event-based | A transactional event fires | Top-up, purchase, form submission |
| Schedule-based | Recurring time trigger | Daily at 9am, weekly on Monday, monthly on 1st |
| Manual | User pushes a list | Upload CSV, select segment, API call |

#### C. Condition Section

Who qualifies when the trigger fires. This is the journey-specific audience condition — equivalent to the legacy "campaign filter."

Uses the standard filter builder, scoped to the journey's campaign namespace.

### Filter layers (general to specific)

| Layer | Editable where | Examples | Applies to |
|-------|----------------|----------|------------|
| Account rules (global) | Account settings only | Age ≥ 18, contact status = active, suppression list | All journeys in the account |
| Channel rules | Channel configuration | Max 3 emails/week, quiet hours (no sends 9pm–7am) | All journeys using that channel |
| Journey entry condition | Start step (condition section) | Region = "Auckland", segment membership, tag match | This journey only |
| Step condition (branches) | Individual journey steps | Opened previous step, clicked link, waited 3 days | This step only |

Each layer narrows the audience further. A contact must pass ALL layers to receive a communication.

### Visibility of inherited rules

The Start step shows a summary badge:

```
🛡️ 3 account rules active  [View details]
```

Clicking reveals:
- Age gate: contacts must be ≥ 18
- Status: only active contacts
- Suppression: "Do Not Contact" list excluded

These cannot be overridden or disabled at the journey level.

---

## 5. Activation & Approval

### Activation flow

When a user activates a journey or sends a campaign:

1. System calculates estimated audience size
2. If audience is above the configured threshold → show "type ACCEPT" confirmation modal
3. User types ACCEPT to confirm
4. Journey/send is activated

### Confirmation modal

```
┌──────────────────────────────────────────┐
│  ⚠️  Confirm Activation                  │
│                                           │
│  This will send to ~45,000 contacts.      │
│                                           │
│  Type ACCEPT to confirm:                  │
│  ┌─────────────────────────────┐          │
│  │                             │          │
│  └─────────────────────────────┘          │
│                                           │
│              [Cancel]  [Activate]          │
└──────────────────────────────────────────┘
```

### Rules

| Rule | Detail |
|------|--------|
| Threshold trigger | Only shown when estimated audience exceeds the configured threshold |
| No external approver | The activating user is responsible. No multi-person approval workflow. |
| Event-triggered journeys | Warning focuses on scope: "This will send to anyone who [triggers the event]" rather than a fixed count |
| Consistent pattern | Matches existing UbiQuity destructive action pattern (used for delete, archive) |
| Below threshold | Activates immediately without the modal |

### Open decision: threshold value

The threshold that triggers the "type ACCEPT" modal is not yet decided. See Open Questions section.

---

## 6. Communications Visibility (Three Angles)

Three complementary views of the same underlying filter/journey/contact data, each serving a different user need.

### Angle 1: Overlap Awareness (Journey Builder / Start Step)

**Where:** Shown during journey creation, on or near the Start step.

**What it shows:**
```
Your audience: ~45,000 contacts
├── 12,400 are also in [Summer Sale Journey] (active)
├── 8,200 received [Welcome Series] in last 7 days
└── 3,100 are in [Re-engagement Journey] (active)
```

**Purpose:** Prevent over-communication before it happens. Catch audience overlap at design time, not after sends go out.

**Priority:** HIGH — prevents mistakes that damage sender reputation and subscriber trust.

**Interaction:** Each overlap line is clickable → navigates to the referenced journey.

---

### Angle 2: Contact Comms History (Contact Profile)

**Where:** Individual contact profile page, as a timeline/log.

**What it shows:**

| Date | Communication | Journey | Matched By |
|------|--------------|---------|------------|
| 2024-03-15 09:32 | Summer Sale Email #1 | Summer Sale | Segment: Gold Members |
| 2024-03-12 14:00 | Welcome SMS | Welcome Series | Event: Form Submit |
| 2024-03-10 11:15 | Survey Invite | NPS Campaign | Filter: Last Purchase > 30 days |

Each entry includes:
- Communication name
- Date/time sent
- Journey it belongs to
- What filter/trigger matched this contact

**Purpose:** Answer "what has this person been sent?" — essential for support, complaints, and compliance.

**Priority:** MEDIUM — operational/support use case.

---

### Angle 3: Filter Chain Debugger (Support/Admin)

**Where:** Accessible from a contact's comms log OR from the journey view. Admin/support tool.

**What it shows:** The full filter cascade for a specific contact + specific journey:

```
Contact: jane.smith@example.com
Journey: Summer Sale

Account rules:
  ✅ Age ≥ 18 (age: 34)
  ✅ Status = Active
  ✅ Not on suppression list

Channel rules (Email):
  ✅ Max 3 emails/week (sent this week: 1)
  ✅ Not in quiet hours

Journey entry condition:
  ✅ Region = "Auckland" (region: Auckland)
  ❌ Segment: Gold Members (not a member)

Result: NOT ENTERED — failed journey entry condition
```

**Purpose:** Answer "why did/didn't this person get this?" — essential for troubleshooting delivery questions and compliance audits.

**Priority:** MEDIUM — troubleshooting use case. High value but lower frequency.

**Possible outcomes:**
- SENT — passed all layers, communication delivered
- NOT ENTERED — failed journey entry condition
- EXCLUDED — passed entry but excluded by step condition or frequency cap
- SUPPRESSED — blocked by account-level rule

---

### Shared data requirement

All three angles require storing filter evaluation results alongside journey entry and send events. This is the foundational data layer prerequisite — without it, none of the three views can be built.

What must be stored per send event:
- Which filter conditions were evaluated
- The result of each condition (pass/fail)
- The values that were tested against
- The journey and step context
- Timestamp

---

## 7. Implementation Phases

| Phase | What Ships | User Value | Dependencies |
|-------|-----------|------------|--------------|
| **Phase 1: Campaign Hub** | Redesigned campaigns page as primary nav destination. One level of container. Objects listed with status/stats. Tags + search. | Users have a single place to see and manage all communications. Eliminates dual-navigation confusion. | None — can ship independently |
| **Phase 2: Proto-Journey** | Auto-detected relationship graph within campaigns. Read-only visualisation of filter-based connections between objects. | Users can see how their objects relate without opening each filter individually. Makes implicit logic visible. | Phase 1 (needs campaign container) |
| **Phase 3: Activation Controls** | "Type ACCEPT" approval for high-audience activations. Estimated audience size shown before send. | Safety net for mass sends. Prevents accidental large-scale communications. | Phase 1 |
| **Phase 4: Inherited Rules** | Account/channel-level rules visible on journey entry (badge with click-to-reveal). Rules enforced automatically and cannot be overridden at journey level. | Governance without per-journey configuration. Admins set rules once; all journeys comply. | Phase 1, account settings infrastructure |
| **Phase 5: Full Journey Builder** | Visual canvas with editable steps. Trigger + condition on Start step. Branch logic. Wait steps. Timing controls. | Full orchestration — the proto-journey graph becomes an editable canvas. Users build multi-step flows visually. | Phases 1–4 |
| **Phase 6: Comms Visibility** | Overlap awareness panel, contact comms history timeline, filter chain debugger. | Operational intelligence — prevent over-communication, support contacts, debug delivery issues. | Phase 5 (full value requires journey builder), filter evaluation storage |

### Phase relationships

```
Phase 1 ──┬──▶ Phase 2
           ├──▶ Phase 3
           └──▶ Phase 4 ──▶ Phase 5 ──▶ Phase 6
```

Phases 2, 3, and 4 can be developed in parallel once Phase 1 ships. Phase 5 depends on the patterns established in Phases 1–4. Phase 6 requires the data layer changes that Phase 5 motivates.

---

## 8. Open Questions

Decisions requiring further stakeholder input:

| # | Question | Options Under Consideration | Impact |
|---|----------|----------------------------|--------|
| 1 | What's the audience threshold for "type ACCEPT" activation approval? | 1,000 / 10,000 / Configurable per account | Determines how often the safety modal appears. Too low = friction. Too high = no protection. |
| 2 | Should the proto-journey graph update in real-time as filters are edited, or on-demand? | Real-time (auto-refresh) / On-demand (refresh button) / Hybrid (auto with debounce) | Real-time is better UX but requires more backend work. On-demand is simpler. |
| 3 | When the proto-journey graph shows an external reference, should users be able to "import" it into their campaign? | Import (copy into campaign) / Link only (navigate to source) / Move (transfer ownership) | Importing creates duplicates. Linking is simpler but less actionable. |
| 4 | Should the filter builder's source picker show all objects across all campaigns, or only objects within the current campaign? | Current campaign only / All campaigns with campaign namespace / All campaigns flat | Affects filter builder UX and the proto-journey graph scope. |
| 5 | How do we handle the transition from proto-journey to full journey builder? | Automatic migration (graph becomes editable) / Manual rebuild / Opt-in conversion wizard | Determines whether proto-journey work carries forward or is throwaway. |
| 6 | Should campaigns have their own audience definition (campaign-level filter), or does that concept disappear once journeys have Start steps? | Keep campaign filter (broad gate) / Remove entirely (journey handles it) / Deprecate gradually | Legacy system has campaign-level filters. Removing simplifies but may lose a governance layer. |
| 7 | For the proto-journey, what happens when objects have complex filter expressions with multiple references? | Show all edges (busy graph) / Show primary reference only / Collapse into grouped edge | Affects graph readability at scale. |
| 8 | Should the Campaign Hub default view be a list or a card/grid layout? | List (dense, scannable) / Cards (visual, spacious) / Toggle (user choice) | Affects information density and scanning behaviour. |

---

## Appendix A: Relationship to Legacy System

### What's preserved from the legacy Campaigns page

| Legacy Pattern | Kept in 2.0 | Rationale |
|----------------|-------------|-----------|
| Master-detail layout | Yes (adapted) | Efficient for browsing without full-page navigations |
| Component type icons | Yes | Quick visual identification of object types |
| Status + stats in list view | Yes | At-a-glance health check |
| Copy functionality | Yes | Most communications are iterations of previous ones |
| Drag reorder | No | Flat list with sort/filter replaces manual ordering |
| Campaign-level filters | TBD (Open Question #6) | May be replaced entirely by journey entry conditions |
| Shared Components | Replaced by Template Library | Clearer mental model |
| Dual hierarchy (campaigns + folders) | Eliminated | Single container model with tags |

### What's eliminated

| Legacy Pattern | Why |
|----------------|-----|
| Mailout Folders as separate navigation | Redundant — campaigns are the single organiser |
| Two-panel folder tree for email | Tags + search replace folder browsing |
| Campaign as a "loose container" for heterogeneous items | Campaign now has purpose: it's the orchestration context |
| Component drag handles for reordering | The proto-journey graph provides meaningful ordering (by relationship) |

---

## Appendix B: Terminology

| Term | Definition |
|------|------------|
| Campaign | A single-level container grouping related marketing objects. The primary organisational unit. |
| Journey | A multi-step orchestrated flow (future). In proto-journey phase, this term refers to the visualised relationships. |
| Object | Any communication or interaction item within a campaign (mailout, form, survey, event, TXT, push). |
| Proto-journey | The read-only relationship graph that shows how objects connect via their filters. Stepping stone to the full journey builder. |
| Start step | The entry node of a journey (future) defining who enters and when. |
| Filter chain | The layered evaluation from account rules → channel rules → journey condition → step condition. |
| Edge | A directed connection between two nodes in the proto-journey graph, representing a filter reference. |
| External reference | An object referenced in a filter that lives outside the current campaign. Shown as a ghost node. |
| Ghost node | A dimmed, dashed-border node in the proto-journey graph representing an external reference. |

---

## Appendix C: Design Conversation History

This document was authored based on design conversations between the PO and UX team. Key decisions were driven by:

1. **Team capacity constraint** — a full journey builder is too large for the current team size, leading to the proto-journey stepping stone approach
2. **Legacy audit findings** — the dual-hierarchy problem (campaigns vs mailout folders) identified in the campaigns-mailout-audit as a high-severity pain point
3. **Progressive disclosure principle** — complexity is revealed incrementally across phases rather than shipped as a monolith
4. **Governance without friction** — inherited rules provide compliance guardrails without requiring per-journey configuration from users
