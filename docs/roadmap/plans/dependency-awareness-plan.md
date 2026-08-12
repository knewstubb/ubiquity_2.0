# Dependency Awareness — Planning Doc

## Initiative: Object Dependency Visibility

Enable UbiQuity users to understand the relationships between database fields, filters, and communication objects (mailouts, TXT, push). Prevent accidental breakage from schema changes and surface implicit campaign relationships.

**Research:** [Campaign Visibility Gap Analysis](../research/campaign-visibility-gap-analysis.md)

---

## Problem Statement

When you change or delete something in UbiQuity, there's no way to know what else might break.

- **No reverse lookup** — Deleting a database field doesn't warn you which mailouts use it
- **No "Where Used" panel** — You can see what a filter contains, but not which objects use it
- **Duplicated logic** — Same targeting criteria copied into dozens of mailouts with no visibility
- **Implicit campaigns** — Objects targeting the same audience aren't shown as related

---

## Strategic Context

This is **Step 1** of the Journey Builder roadmap:

| Step | What It Enables | Feasible in Legacy? |
|------|-----------------|---------------------|
| **1. Dependency Awareness** | Pre-delete warnings, "Where Used" | Yes |
| 2. Centralised Segments | Reusable, referenced filters | Maybe |
| 3. Unified Campaigns | Cross-channel grouping | Difficult |
| 4. Triggered Sequences | Event-driven automation | No (greenfield) |
| 5. Visual Journey Builder | Drag-and-drop orchestration | No (greenfield) |
| 6. Journey Analytics | Conversion funnels, A/B testing | No (greenfield) |

Dependency awareness is foundation work. It's required for pre-delete safety, and the same data enables relationship views that inform later steps.

---

## Phase 1: Pre-Delete Impact Warnings

**Goal:** Warn users before they delete a database field that's referenced elsewhere.

**Stack:** Legacy (.NET, SQL Server)

### Scope

**In scope:**
- Pre-delete warning modal for database fields
- Query to find references in email mailout filters
- Simple list display of affected objects

**Out of scope (Phase 1):**
- Blocking deletion (warning only)
- References in TXT, Push, Survey, Forms (start with email mailouts)
- Merge field references (filters only)
- "Where Used" panel (Phase 2)

### How It Works

1. User clicks "Delete" on a database field
2. Backend scans mailout filter definitions for field references
3. If references found, modal displays: "This field is used in X mailouts. Deleting it may break these objects."
4. User confirms or cancels

### Technical Approach

**Filter storage:** Filters are embedded in each mailout as serialised data (XML/JSON in metadata column). No existing dependency index.

**Options:**
1. **On-demand scan** — Query and parse filters at delete-time. Slow on large accounts, but simplest.
2. **Background indexer** — Nightly job builds a dependency index table. Pre-delete reads from index. Faster, but stale data risk.
3. **Hybrid** — Index for speed, validate on-demand for accuracy.

**Recommendation:** Start with on-demand scan. Accept slower performance initially. Add indexer if latency becomes a problem.

### Dependencies

- Access to mailout filter storage schema (need to understand serialisation format)
- Database field delete API (where to hook the warning)

### Risks

| Risk | Mitigation | Likelihood |
|------|------------|------------|
| Filter format is complex/inconsistent | Start with common patterns; accept some false negatives | Medium |
| Performance on large accounts | Limit initial scan to most recent X mailouts; add indexer if needed | Medium |
| Scope creep (all modules at once) | Hard scope to email mailouts only for Phase 1 | Low |

---

## Phase 2: "Where Used" Panel — Database Fields

**Goal:** Show all objects that reference a database field without requiring a delete attempt.

**Stack:** Legacy (.NET, SQL Server)

### Scope

**In scope:**
- "Where Used" panel on database field detail view
- List of referencing mailouts with filter condition shown
- Link to navigate to each mailout

**Out of scope (Phase 2):**
- Merge field references (add in Phase 3)
- References in TXT, Push, Survey, Forms (add in Phase 3)
- Object clustering / implicit campaigns (Phase 4)

### Design

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

### Dependencies

- Phase 1 scanner (reuses query logic)
- UI slot on database field detail page

---

## Phase 3: "Where Used" Panel — Saved Filters + Expanded Coverage

**Goal:** Extend "Where Used" to saved filters and cover more object types.

**Stack:** Legacy (.NET, SQL Server)

### Scope

**In scope:**
- "Where Used" panel on saved filter detail view
- Expand field scanner to include TXT, Push programmes
- Merge field references (content, not just filters)

**Out of scope (Phase 3):**
- Survey/Form prelogic (complex, defer)
- Object clustering (Phase 4)

### Design — Saved Filter

```
┌─────────────────────────────────────────────────────────────┐
│  Saved Filter: High Value Customers                         │
├─────────────────────────────────────────────────────────────┤
│  Used by:                                                   │
│    • Mailout "VIP Newsletter" (audience filter)     [View]  │
│    • Automated Mailout "Monthly Digest" (if filter) [View]  │
│    • TXT Programme "Flash Sale" (recipient filter)  [View]  │
│                                                             │
│  3 objects use this filter                                  │
└─────────────────────────────────────────────────────────────┘
```

### Technical Notes

Saved filters are used by reference (filter ID), not by embedded copy. This makes the query simpler than Phase 1/2 — just search for filter ID in object metadata.

---

## Phase 4: Object Relationship View + Clustering

**Goal:** Show dependencies from the object's perspective and detect implicit campaigns.

**Stack:** Legacy or early greenfield (decision point)

### Scope

**In scope:**
- "Dependencies" panel on mailout detail view
- Cluster detection: objects sharing the same filter logic
- Suggested groupings: "These 4 mailouts target the same audience"

**Out of scope (Phase 4):**
- Graph visualisation (Phase 5)
- Automated campaign creation (Phase 5)

### Design — Object Dependencies

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

### Cluster Detection Algorithm

```
1. For each mailout, extract normalised filter signature
   (e.g. "Customer Tier=Gold AND Email!=empty")
2. Group objects by matching signatures
3. Surface clusters with 2+ objects as "implicit campaigns"
4. Offer to create an actual campaign from the cluster
```

### Decision Point

By Phase 4, evaluate whether to continue in legacy or pivot to greenfield Campaign Hub. The relationship data informs both paths.

---

## Phase 5: Graph Visualisation (Future)

**Goal:** Interactive visual canvas showing the dependency network.

**Stack:** Likely greenfield (modern frontend)

### Concept

```
                    ┌──────────────┐
                    │ Customer Tier │
                    └──────┬───────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │ VIP Offer   │ │ Loyalty     │ │ Flash Sale  │
    │ (Mailout)   │ │ (Mailout)   │ │ (TXT Out)   │
    └─────────────┘ └─────────────┘ └─────────────┘
```

- Click a node to see its connections
- Filter by object type, date range, campaign
- Highlight orphans, high-dependency fields, clusters

This phase aligns with Journey Builder greenfield work.

---

## Summary Timeline

| Phase | Focus | Cumulative Value |
|-------|-------|------------------|
| **1** | Pre-delete warnings (email mailouts) | Prevent accidental breakage |
| **2** | "Where Used" on database fields | Proactive dependency visibility |
| **3** | "Where Used" on saved filters + TXT/Push | Cross-module visibility |
| **4** | Object dependencies + clustering | Implicit campaign discovery |
| **5** | Graph visualisation | Full relationship map |

**Phase 1–3:** Feasible in legacy
**Phase 4:** Decision point — continue legacy or pivot to greenfield
**Phase 5:** Part of Journey Builder greenfield initiative

---

## Open Questions

1. **Filter serialisation format** — Need to document the exact structure of embedded filters to build the parser
2. **Performance baseline** — How many mailouts exist on the largest accounts? What's acceptable scan latency?
3. **TXT/Push filter storage** — Is it the same format as email, or different?
4. **UI integration** — Where exactly does the "Where Used" panel appear? New tab, side panel, modal?
5. **Saved filter linking** — Are saved filters actually linked by ID, or is the logic copied like inline filters?

---

## Next Steps

1. [ ] Confirm filter serialisation format with backend team
2. [ ] Identify database field delete hook point in legacy codebase
3. [ ] Prototype Phase 1 scanner query
4. [ ] Define UI mockup for pre-delete warning modal
5. [ ] Estimate account size / performance impact

---

## References

- [Campaign Visibility Gap Analysis](../research/campaign-visibility-gap-analysis.md) — Full research and current state documentation
- [Journey Builder Roadmap](../../.kiro/specs/journey-builder/requirements.md) — Strategic context
- [UbiQuity Architecture (Confluence)](https://sparknz.atlassian.net/spaces/UB/pages/194468708)
- [Filter Locations in UbiQuity (Confluence)](https://sparknz.atlassian.net/spaces/UB/pages/835682759)
