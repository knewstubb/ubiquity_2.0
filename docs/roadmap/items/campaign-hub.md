# Campaign Hub

> **Status:** Planning
> **Pain Point:** "Lack of visibility between objects linked by a filter"
> **Last updated:** 2026-08-11

---

## Outcome

> Make the platform safer to change and reveal the implicit campaign structure that already exists.

Campaign Hub is foundation work that enables:
1. **Safer operations** — Know what will break before you change it
2. **Unified campaigns** — Group related assets across channels (email, SMS, push)
3. **Centralised segments** — Define audience logic once, use everywhere
4. **Journey containment** — Journeys become children of campaigns

---

## Problems Addressed

| Problem | Evidence | Source |
|---------|----------|--------|
| No reverse lookup — deleting a field doesn't warn which mailouts use it | Silent breakage risk | Gap Analysis |
| No "Where Used" panel — can see filter contents but not what uses it | Manual impact analysis | Gap Analysis |
| Duplicated logic — same targeting criteria copied into dozens of mailouts | Maintenance burden | Gap Analysis |
| Implicit campaigns — objects targeting same audience aren't shown as related | Discovery Canvas, UTTPMO |
| Siloed channels — email, SMS, push are separate modules | No unified campaign view | Gap Analysis |

---

## Strategic Context

Campaign Hub is the **foundation layer** that Journey Builder sits on:

| Layer | What It Provides | Status |
|-------|------------------|--------|
| **Campaign Hub** | Dependency awareness, unified campaigns, shared segments | This doc |
| **Journey Builder** | Visual orchestration, triggers, automation | Separate item |

Journeys will be children of campaigns. A campaign groups all the assets (emails, SMS, push templates, segments) and journeys orchestrate the sequence.

```
Campaign: "VIP Loyalty Programme"
├── Assets
│   ├── Email: "Welcome to VIP"
│   ├── Email: "Your VIP Benefits"
│   ├── SMS: "Flash Sale Alert"
│   └── Segment: "Gold Tier Customers"
└── Journeys
    ├── Journey: "VIP Onboarding Sequence"
    └── Journey: "Re-engagement Flow"
```

---

## Phased Roadmap

### Phase 1: Pre-Delete Impact Warnings

**Goal:** Warn users before they delete a database field that's referenced elsewhere.

**Effort:** 1–2 sprints

**Stack:** Legacy (.NET, SQL Server) — can start immediately

| Capability | Description |
|------------|-------------|
| Pre-delete modal | "This field is used in X mailouts. Deleting it may break these objects." |
| Reference scanner | Query mailout filter definitions for field references |
| Affected object list | Simple list of objects that would be impacted |

**Scope boundaries:**
- Warning only (not blocking)
- Email mailouts only (start simple)
- Filter references only (not merge fields)

**Technical approach:**
1. Hook into database field delete action
2. Parse embedded filter definitions (XML/JSON in metadata)
3. Display warning modal with affected objects

**Why this first:** Highest pain (accidental breakage), lowest effort, zero migration risk.

---

### Phase 2: "Where Used" on Database Fields

**Goal:** Show dependencies proactively, not just at delete time.

**Effort:** 1–2 sprints

**Stack:** Legacy (.NET, SQL Server)

| Capability | Description |
|------------|-------------|
| "Where Used" panel | List of objects referencing this field |
| Navigation links | Click through to each affected object |
| Filter condition preview | Show how the field is used (equals, contains, etc.) |

**UI sketch:**
```
┌─────────────────────────────────────────────────────────────┐
│  Field: Customer Tier                                       │
├─────────────────────────────────────────────────────────────┤
│  Referenced in Mailout Filters:                             │
│    • "VIP Exclusive Offer" — equals "Gold"          [View]  │
│    • "Loyalty Reminder" — in ["Gold", "Silver"]     [View]  │
│    • "Flash Sale Alert" — equals "Gold"             [View]  │
│                                                             │
│  3 mailouts reference this field                            │
└─────────────────────────────────────────────────────────────┘
```

**Dependencies:** Phase 1 scanner (reuses query logic)

---

### Phase 3: "Where Used" on Saved Filters + Expanded Coverage

**Goal:** Extend visibility to saved filters and more object types.

**Effort:** 2–3 sprints

**Stack:** Legacy (.NET, SQL Server)

| Capability | Description |
|------------|-------------|
| "Where Used" on saved filters | Which mailouts/programmes use this filter? |
| TXT programme coverage | Scan TXT Out recipient filters |
| Push notification coverage | Scan push notification filters |
| Merge field references | Track field usage in content, not just filters |

**Technical note:** Saved filters are referenced by ID, not copied. This makes the query simpler than inline filter scanning.

---

### Phase 4: Object Dependency View + Clustering

**Goal:** Show dependencies from the object's perspective and detect implicit campaigns.

**Effort:** 3–4 sprints

**Stack:** Decision point — continue legacy or pivot to greenfield

| Capability | Description |
|------------|-------------|
| "Dependencies" panel on mailouts | Show all fields/filters this object depends on |
| Cluster detection | Find objects sharing the same filter logic |
| Suggested groupings | "These 4 mailouts target the same audience — create a campaign?" |

**UI sketch — Object Dependencies:**
```
┌─────────────────────────────────────────────────────────────┐
│  Mailout: VIP Exclusive Offer                               │
├─────────────────────────────────────────────────────────────┤
│  Filter Dependencies:                                       │
│    • Database.Customer Tier — equals "Gold"                 │
│    • Database.Email — is not empty                          │
│    • Database.Opted In — equals true                        │
│                                                             │
│  Merge Field Dependencies:                                  │
│    • Database.First Name                                    │
│    • Database.Customer Tier                                 │
│                                                             │
│  Related Objects (same audience):                           │
│    • TXT Out "Flash Sale" — also targets Gold tier  [View]  │
│    • Mailout "Loyalty Reminder" — similar filter    [View]  │
└─────────────────────────────────────────────────────────────┘
```

**Cluster detection algorithm:**
1. Extract normalised filter signature for each object
2. Group objects by matching signatures
3. Surface clusters with 2+ objects as "implicit campaigns"
4. Offer to create an actual campaign from the cluster

---

### Phase 5: Campaign Container Model (Greenfield)

**Goal:** Unified campaign that holds assets and journeys across channels.

**Effort:** 4–6 sprints

**Stack:** Greenfield (new .NET service, PostgreSQL)

| Capability | Description |
|------------|-------------|
| Campaign entity | Container for related assets and journeys |
| Cross-channel grouping | Email + SMS + Push under one umbrella |
| Campaign-level permissions | Control access at campaign level |
| Campaign-level reporting | Aggregated performance across all assets |
| Journey containment | Journeys are children of campaigns |

**Data model:**
```
Campaign
├── id, name, description, status
├── accountId
├── createdAt, updatedAt
└── metadata (tags, etc.)

CampaignAsset (junction table)
├── campaignId
├── assetType (email_template, sms_template, segment, etc.)
├── assetId
└── createdAt

CampaignJourney
├── campaignId
├── journeyId
└── createdAt
```

**Why greenfield:** The current Campaign table is email-only. A true cross-channel campaign requires a new data model that can reference assets from any module.

---

### Phase 6: Centralised Segments

**Goal:** Define audience logic once, reference from any object.

**Effort:** 3–4 sprints

**Stack:** Greenfield (or hybrid with legacy sync)

| Capability | Description |
|------------|-------------|
| Segment entity | Reusable audience definition stored by reference |
| Segment usage tracking | "Where Used" is built-in (references tracked) |
| Segment versioning | Change history for audit |
| Legacy sync | Segments can be used by legacy mailouts |
| Real-time membership | Segment membership updates with contact changes |

**Current state:** Filters are embedded in each mailout as serialised data. No reference to a shared segment.

**Target state:** Mailouts reference segment IDs. Changes to segment criteria propagate automatically.

**Challenge:** Legacy mailouts expect embedded filters. Options:
1. Keep legacy as-is, new Campaign Hub uses segments
2. Build a sync layer that keeps embedded filters in sync with segment definitions
3. Migrate legacy mailouts to segment references (high risk)

**Recommendation:** Option 1 for MVP. Legacy stays separate; new campaigns use segments.

---

## Dependency Graph

```
Campaign Hub
├── Phase 1: Pre-delete warnings ──────────── Legacy, can start NOW
├── Phase 2: "Where Used" on fields ───────── Legacy, after Phase 1
├── Phase 3: "Where Used" + expanded ──────── Legacy, after Phase 2
├── Phase 4: Object clustering ────────────── Decision point
├── Phase 5: Campaign container ───────────── Greenfield
└── Phase 6: Centralised segments ─────────── Greenfield

Journey Builder (separate item)
├── Depends on: Campaign Hub Phase 5 ──────── Journeys live inside campaigns
└── Can start Phase 1 in parallel ─────────── Walking skeleton is independent
```

---

## Technical Architecture

### Phase 1–3: Legacy Scanner

```
┌─────────────────────────────────────────────────────────────┐
│                  Database Field Detail                       │
│  [ Delete ] → triggers scanner                              │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│              Dependency Scanner Service                      │
│  - Query u3_mail.dbo.Mailout for filter metadata            │
│  - Parse embedded XML/JSON filter definitions               │
│  - Extract field references                                 │
│  - Return list of affected objects                          │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                 Warning Modal                                │
│  "This field is used in 3 mailouts..."                      │
│  [ Cancel ]                            [ Delete Anyway ]    │
└─────────────────────────────────────────────────────────────┘
```

**Performance consideration:** On-demand scan initially. If latency is a problem on large accounts, add a background indexer.

### Phase 5–6: Greenfield Services

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Campaign.Api    │────▶│ Segment.Api     │────▶│ Legacy Bridge   │
│ (new .NET svc)  │     │ (new .NET svc)  │     │ (RemotingBridge)│
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│ PostgreSQL      │     │ PostgreSQL      │
│ (campaigns)     │     │ (segments)      │
└─────────────────┘     └─────────────────┘
```

---

## Competitor Landscape

| Capability | Mailchimp | HubSpot | Klaviyo | UbiQuity (Current) | UbiQuity (Target) |
|------------|-----------|---------|---------|-------------------|-------------------|
| Unified campaigns | ✅ | ✅ | ✅ | ⚠️ Email-only | Phase 5 |
| Shared segments | ✅ | ✅ | ✅ | ❌ Embedded | Phase 6 |
| "Where Used" | ✅ | ✅ | ⚠️ | ❌ | Phase 2 |
| Pre-delete warnings | ✅ | ✅ | ⚠️ | ❌ | Phase 1 |
| Cross-channel reporting | ✅ | ✅ | ✅ | ❌ Siloed | Phase 5 |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Filter format is complex/inconsistent | Scanner misses references | Start with common patterns; accept false negatives |
| Performance on large accounts | Slow delete operations | On-demand first; add indexer if needed |
| Legacy/greenfield integration | Two systems, two truths | Clear boundary: legacy stays separate, new campaigns use new model |
| Scope creep to full rewrite | Delays value delivery | Hard phase boundaries; ship each phase independently |

---

## Success Metrics

| Phase | Metric | Target |
|-------|--------|--------|
| Phase 1 | Pre-delete warnings shown | 100% of field deletes |
| Phase 2 | "Where Used" panel usage | 50+ views/month |
| Phase 4 | Implicit campaigns detected | 20+ clusters per account |
| Phase 5 | Cross-channel campaigns created | 10+ within 3 months |
| Phase 6 | Segments referenced (vs embedded) | 50% of new campaigns |

---

## Open Questions

| # | Question | Impact | Owner |
|---|----------|--------|-------|
| 1 | Filter serialisation format — exact XML/JSON structure? | Scanner implementation | Backend |
| 2 | How many mailouts on the largest accounts? | Performance baseline | Data |
| 3 | TXT/Push filter storage — same format as email? | Phase 3 scope | Backend |
| 4 | Where does "Where Used" panel appear? Tab, side panel, modal? | UX design | Designer |
| 5 | Legacy sync strategy for segments — option 1, 2, or 3? | Phase 6 architecture | Architect |

---

## Deliberate Scope Boundaries

We will NOT build (in Campaign Hub):

| Feature | Reason | Where It Lives |
|---------|--------|----------------|
| Visual journey canvas | Automation, not structure | Journey Builder |
| Triggers and wait steps | Automation, not structure | Journey Builder |
| A/B testing orchestration | Journey concern | Journey Builder |
| Journey-level analytics | Journey concern | Journey Builder |
| Blocking deletion | Phase 1 is warning only; blocking is Phase 2+ consideration |

---

## Relationship to Journey Builder

Campaign Hub and Journey Builder are **complementary but separate initiatives**:

| Concern | Campaign Hub | Journey Builder |
|---------|--------------|-----------------|
| Focus | Structure & visibility | Automation & orchestration |
| Stack | Legacy first, then greenfield | Greenfield only |
| Can start | Immediately (Phase 1) | Immediately (Phase 1) |
| Converge at | Phase 5 (journeys inside campaigns) | Phase 2+ (needs campaign context) |

**Parallel execution:** Campaign Hub Phases 1–3 and Journey Builder Phase 1 can run in parallel. They converge when journeys need to live inside campaigns.

---

## Refs

- **Research:** `docs/audits/campaign-visibility-gap-analysis.md`
- **Planning:** `docs/roadmap/plans/dependency-awareness-plan.md`
- **Architecture:** `docs/roadmap/architecture-informed-roadmap.md`
- **Related:** `docs/roadmap/items/journey-builder.md` (automation layer)

---

## Provenance

- **Authored:** 2026-08-11
- **Based on:** Campaign Visibility Gap Analysis, Dependency Awareness Plan
- **Split from:** Journey Builder roadmap item (dependency awareness phases moved here)
- **Key insight:** Dependency awareness + campaign structure is foundation work that enables safer operations AND journey orchestration

