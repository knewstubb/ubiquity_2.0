# Campaign & Object Visibility Gap Analysis

> **Status:** Draft  
> **Author:** Gene (Delivery Lead)  
> **Created:** 2026-07-28  
> **Last updated:** 2026-07-28  
> **UI Review:** Completed on staging (stagingengage.ubiquity.nz)

## Purpose

Document the current state of campaign/mailout functionality in legacy UbiQuity, identify the visibility gaps between related objects, and outline what a modernised approach would need to solve.

---

## 1. Current Legacy UbiQuity Campaign Structure

### 1.1 Data Model

**Two-tier hierarchy:**

| Table | Database | Description |
|-------|----------|-------------|
| `Campaign` | `u3_mail.dbo.Campaign` | One row per marketing campaign |
| `Mailout` | `u3_mail.dbo.Mailout` | One row per send execution, linked via `CampaignID` FK |

This is a simple parent-child relationship: **Campaign → Mailout**. A campaign groups related mailouts together for reporting purposes.

### 1.2 Folder System

Mailouts are organised into **folders** using the IDSpace system:

- `ServiceID` = GUID of the mailout folder
- Folders appear in the Email module UI
- Folders allow comparison reports across mailouts in the same folder
- Folders can be soft-deleted and restored (support procedure exists)

**IDSpace structure:**
```
{applicationID}.{serviceID}.{serviceItemID}.{fieldID}
```

- `applicationID` — Static GUID for the UbiQuity product (Forms, Email, Survey, etc.)
- `serviceID` — GUID of the form, survey, or mailout folder
- `serviceItemID` — Individual form, mailout, or triggered email
- `fieldID` — Survey question, database field, etc.

### 1.3 Mailout Types

| Type | Description | Trigger |
|------|-------------|---------|
| **Static mailout** | One-off campaign | Manual send |
| **Automated mailout** | Scheduled recurring sends | Time-based scheduler |
| **Triggered mailout** | Event-driven sends | API import, form submission, etc. |

### 1.4 Module Architecture

Each channel is a separate service with its own database:

| Service | Database | Purpose |
|---------|----------|---------|
| `u3_mail` | `u3_mail` | Email mailouts (static + automated) |
| `u3_txt` | `u3_txt` | TXT/SMS programmes and sends |
| `u3_push` | `u3_push` | Push notifications |
| `u3_forms` | `u3_forms` | Web forms |
| `u3_survey` | `u3_survey` | Surveys |
| `u3_event` | `u3_event` | Events/registrations |

**Key observation:** These modules operate independently. There's no unified "campaign" that spans email + SMS + push.

---

## 2. Filter Builder Locations

The filter builder appears in **50+ locations** across the platform. Each instance is independent — filters are defined inline, not referenced from a central library.

### 2.1 By Module

| Module | Filter Locations |
|--------|------------------|
| **Database** | View contacts, Update contacts, Segment contacts, Delete contacts, Manage filters |
| **Transactional** | View & edit, Update, Delete |
| **Forms** | Merge field selector, Form validation |
| **Survey** | Prelogic, Page introduction, Question, Postlogic, View responses |
| **Events** | Registration fields, Confirmation page, Validation |
| **Email Static** | Folder filter, Header merge fields, Content merge fields, Content filter, Mailout filter, Preview filter |
| **Email Automated** | Folder filter, Header/Content merge fields, If filter, When filter, View recipients |
| **Email Triggered** | Edit conditions |
| **TXT** | Inbound programme, TXT Out recipients, Preview filter, Automated TXT filter |
| **Push** | Notification templates, Notifications filter, Automated notifications filter |
| **Web Tracking** | View contacts, Goal conditions |
| **Social** | Audience filter |
| **API** | API Filter Condition |

### 2.2 Filter Storage

Filters are **embedded** in each object's metadata, not stored as reusable entities. This means:

- No "saved segments" that can be referenced by multiple mailouts
- No way to see which objects use a particular filter criteria
- No impact analysis when database fields change

---

## 3. The Visibility Gap

### 3.1 Problem Statement

> "Lack of visibility between objects (emails, SMS, etc.) that are linked by a filter but that is not shown anywhere"

**Current state:**
- A mailout has a filter definition embedded in it
- That filter references database fields, behavioural data, or criteria
- There is **no reverse index** — you cannot query "which mailouts would be affected if I change/delete this field?"
- Deleting a database field could silently break multiple mailouts' filters

### 3.2 Missing Capabilities

| Capability | Current State | Impact |
|------------|---------------|--------|
| **Dependency tracking** | None | Objects reference each other but no visibility |
| **Shared segments** | None | Each mailout defines filters inline |
| **Where Used lookup** | None | Can't see which objects use a field/criteria |
| **Pre-delete warnings** | None | Silent breakage risk |
| **Cross-channel view** | None | Email, TXT, Push are separate modules |
| **Campaign hierarchy** | Flat (Campaign → Mailout only) | No grouping of related journeys/assets |

### 3.3 User Pain Points

1. **Accidental breakage** — Deleting or renaming a database field can break mailouts without warning
2. **Duplication** — Same audience criteria re-built in multiple mailouts
3. **No audit trail** — Can't see how a contact ended up in a particular send
4. **Siloed reporting** — Email performance separate from SMS/Push
5. **No journey view** — Can't see the full customer experience across touchpoints

---

## 4. What a Modernised Approach Would Need

### 4.1 Incremental Steps (from prior analysis)

| Step | Capability | Complexity | Value |
|------|------------|------------|-------|
| 1 | **Pre-delete impact warnings** | Low | Prevents accidental breakage |
| 2 | **"Where Used" panel** | Medium | Shows reverse dependencies |
| 3 | **Campaign hub with shared assets** | Medium-High | Groups related objects |
| 4 | **Full dependency graph** | High | Complete object relationship map |

### 4.2 Core Requirements

**Centralised segments:**
- Define audience criteria once, reference it from multiple objects
- Changes propagate automatically
- Version history for audit

**Dependency registry:**
- Track which objects reference which fields/segments
- Pre-delete impact analysis
- Orphan detection

**Unified campaign model:**
- Campaign as a container for related assets across channels
- Email + SMS + Push under one umbrella
- Shared reporting view

**Journey orchestration:**
- Multi-step, multi-channel sequences
- Conditional branching based on behaviour
- Wait steps and timing control

---

## 5. Current UI Review

**Reviewed:** 2026-07-28 on staging (stagingengage.ubiquity.nz), Chenchen AWS Test account

### 5.1 Email Module Structure

**Navigation:** Dashboard → Email → [Mailouts | Automated mailouts | Email templates]

**Folder sidebar:** Mailouts are organised into folders (e.g., ".Net Uplift", "Campaign 1", "Random", "Release Test", "Test"). Each folder is clickable and filters the mailout list.

**Mailout list view shows:**
- Mailout name
- Type badge: "Marketing" or "Service"
- Folder assignment (e.g., "Random", "Test")
- Status: "In Design", "Complete", "Failed", "Cancelled"
- Send stats when complete (e.g., "5 sent at 14:52PM, 24 Jun, 2026")

### 5.2 Mailout Details Page

**Breadcrumb:** `Random / AB Testing / Mailout Details`

**Filter display:** The filter is embedded inline in the mailout details:
```
IF
- "[Email] from Database contains "chenchen.zhao""
- and "[ID] from Database is less than "100""
```

**Observation:** The filter is shown as a read-only display. There's no link to a "saved filter" — the criteria is stored directly on the mailout.

**Other details shown:**
- Name, Description, Tags
- Status, Number of emails
- From address, Subject lines (A/B)
- Link tracking settings
- Dedupe column
- Version split (A/B percentages)
- Send timing, Send rate

### 5.3 Campaigns Module

**Navigation:** Dashboard → Campaigns

**Sidebar:** List of campaigns + "Shared Components" + "Archive"

**Campaign view:** A grid of component cards showing:
- Component name + type badge (MAILOUT, AUTOMATED MAILOUT, SURVEY, TRIGGERED EMAIL)
- Status (IN DESIGN, ACTIVE, Sent date)
- Quick stats (X Sent, Y Read, Z Responses)
- Action icons: Preview, Edit, Report

**Actions available:**
- "New Component" — create new item directly in campaign
- "Add Existing" — link an existing mailout/survey/etc to this campaign
- "Add Shared Component" — add from shared library
- "Filters" button — (opens campaign-level filter view)
- "Reports" button — (opens campaign-level reporting)

**Key observation:** Campaigns are a **manual grouping**. You add objects to a campaign by explicitly selecting them. There's no automatic detection of related objects based on shared filters or data relationships.

### 5.4 Database Filters Module

**Navigation:** Database → Manage Filters

**Saved filters list:**
| Filter Name | Created | Modified |
|-------------|---------|----------|
| Chenchen Spark | 2 months ago | 2 months ago |
| Chenchen Test | 9 months ago | 9 months ago |
| GNA | 1 year ago | 1 year ago |

**Filter editor shows:**
- Filter criteria with AND/OR logic
- Live preview of matching contacts
- Statement sources: Database, Forms, Mailout Folders, Surveys, Events, TXT Programmes, Filters (nested)

**Missing capability:** No "Where Used" panel. You can create and edit saved filters, but there's no indication of which mailouts, surveys, or other objects reference this filter.

### 5.5 UI Observations Summary

| Feature | Current State | Gap |
|---------|---------------|-----|
| **Folder organisation** | Exists for mailouts | Folders are independent of Campaigns |
| **Campaign grouping** | Manual add of components | No auto-detection of related objects |
| **Saved filters** | Exist in Database module | No "where used" visibility |
| **Mailout filter** | Embedded inline | Not linked to saved filter |
| **Dependency view** | None | No way to see what uses what |
| **Pre-delete warning** | None visible | Silent breakage risk |
| **Cross-channel view** | Separate modules | Email, TXT, Push not unified |

---

## 6. References

**Confluence sources:**
- [UbiQuity Architecture](https://sparknz.atlassian.net/spaces/UB/pages/194468708)
- [UbiQuity Data Structure](https://sparknz.atlassian.net/spaces/UB/pages/12359106704)
- [Filter locations in UbiQuity](https://sparknz.atlassian.net/spaces/UB/pages/835682759)
- [UbiQuity Modules: Benefits + Use Cases](https://sparknz.atlassian.net/spaces/UB/pages/704970847)
- [Journey Builder Legacy Mailout Integration](https://sparknz.atlassian.net/spaces/UB/pages/12630458369)

---

## 7. Next Steps

1. [x] Click through current UbiQuity UI to capture campaign/filter UX
2. [ ] Document user journey for creating a campaign with multiple mailouts
3. [ ] Identify quick wins that could be implemented in current stack
4. [ ] Scope the modernised Campaign Hub as a net-new build
5. [ ] Define requirements for "Where Used" panel MVP
6. [ ] Assess if saved filters could be linked (rather than embedded) in mailouts


---

## 8. Executive Summary

> **Author:** Ed (Software Educator)  
> **Added:** 2026-07-28

### 8.1 Current State — Plain Language

UbiQuity has a lot of moving parts that talk to each other, but nobody keeps a map of who's talking to whom.

**What exists today:**

- **Campaigns module** — A folder where you can manually group mailouts, surveys, and triggered emails together. Think of it like a box where you throw related things, but the box doesn't know why they're related.

- **Saved filters** — You can create reusable audience definitions in the Database module (e.g., "all customers in Auckland who opened an email last month"). These filters work, and you can use them across the platform.

- **Mailout filters** — Each email, SMS, or push notification has its own copy of the targeting rules baked directly into it. Even if you created a saved filter, the mailout doesn't link to it — it copies the logic and stores its own version.

- **Separate modules** — Email lives in one place, SMS in another, Push in a third. They don't share a common view of campaigns or customer journeys.

### 8.2 The Problem — In One Sentence

**When you change or delete something in UbiQuity, there's no way to know what else might break.**

Expanded:

1. **No reverse lookup** — If you delete a database field, you won't know which mailouts use that field in their filters until they fail silently.

2. **No "Where Used" panel** — You can see what a filter contains, but you can't see which objects use it.

3. **Manual grouping only** — The Campaigns module requires you to manually add related objects. If two mailouts target the same audience, the system doesn't know they're related unless you tell it.

4. **Duplicated logic** — The same targeting criteria gets copied into dozens of mailouts. Update one, and you have to remember to update all the others.

### 8.3 What to Fix First — Smallest Viable Scope

**Recommendation: Pre-delete impact warnings for database fields.**

Why this first:

| Criterion | Assessment |
|-----------|------------|
| **User pain** | High — accidental breakage is the #1 risk |
| **Scope** | Small — single feature, read-only |
| **Backend change** | Minimal — query existing data, no schema changes |
| **Frontend change** | Minimal — warning modal before delete |
| **Risk** | Low — doesn't change existing behaviour, just adds a warning |

**How it would work:**

1. User clicks "Delete" on a database field
2. System queries all mailout filters, survey logic, form validation, etc. for references to that field
3. If references found, show a warning: "This field is used in 3 mailouts and 1 survey. Deleting it may break these objects."
4. User confirms or cancels

**What it doesn't do (intentionally):**

- Doesn't prevent deletion — just warns
- Doesn't fix the underlying problem of embedded filters
- Doesn't add "Where Used" panels elsewhere (that's step 2)

### 8.4 Major Blockers

| Blocker | Description | Mitigation |
|---------|-------------|------------|
| **No dependency index** | There's no table that tracks "object X references field Y". The filter logic is embedded in each object's metadata as serialised data. | Will need to parse filter definitions at query time, or build a background indexer. |
| **50+ filter locations** | Filters appear in mailouts, surveys, forms, events, TXT, push, web tracking, social, and API. Each has its own storage format. | Start with email mailouts only (highest volume). Expand incrementally. |
| **Legacy stack** | The current system is .NET on SQL Server. Any new features must integrate with this or wait for a full rewrite. | Target the existing stack for quick wins. Reserve greenfield work for Campaign Hub. |
| **Performance** | Scanning all objects for field references could be slow on large accounts. | Use database indexes on common filter patterns. Consider async background scan with cached results. |
| **False negatives** | Filters can reference fields via dynamic expressions (ESL scripting). A simple text search might miss some. | Accept some false negatives initially. Improve parser over time. |

### 8.5 Sequenced Roadmap

| Phase | Deliverable | Effort | Dependencies |
|-------|-------------|--------|--------------|
| **1** | Pre-delete impact warnings for database fields | Small | None |
| **2** | "Where Used" panel on saved filters | Medium | Phase 1 (reuses query logic) |
| **3** | "Where Used" panel on database fields | Medium | Phase 2 |
| **4** | Campaign hub with shared assets (greenfield) | Large | Business case approval |
| **5** | Full dependency graph visualisation | Large | Phase 4 |

### 8.6 Decision Point

Before proceeding, the team needs to decide:

1. **Fix in legacy or wait for rewrite?** — Pre-delete warnings can be added to the existing system. A full Campaign Hub likely needs to be greenfield.

2. **Email-only or cross-channel?** — Starting with email mailouts is simplest. Expanding to TXT/Push multiplies the work.

3. **Warning or prevention?** — Do we just warn users, or actively prevent deletion of in-use fields?

---

*This summary is intended to give stakeholders a clear picture of the current state without requiring them to read the full technical analysis. For implementation details, refer to sections 1–5 above.*

---

## 9. Relationship Views — What Dependency Data Enables

> **Author:** Ed (Software Educator)  
> **Added:** 2026-07-28

Once you build a dependency scanner (required for pre-delete warnings), you have the raw data to generate relationship views. This section explores what those views could look like and what value they provide.

### 9.1 What the Dependency Data Contains

When you scan filters across the system, you build a graph of relationships:

```
Database Field: "Customer Tier"
  ├── used by: Mailout "VIP Exclusive Offer" (filter: Customer Tier = "Gold")
  ├── used by: Mailout "Loyalty Reminder" (filter: Customer Tier in ["Gold", "Silver"])
  └── used by: TXT Out "Flash Sale" (filter: Customer Tier = "Gold")

Database Field: "Email"
  ├── used by: Mailout "Welcome Series - Day 1" (filter: Email contains "@gmail.com")
  ├── used by: Mailout "Welcome Series - Day 3" (filter: Email contains "@gmail.com")
  ├── used by: Automated Mailout "Re-engagement" (filter: Email is not empty)
  └── used by: Survey "NPS Q4" (prelogic: Email equals [form.email])
```

This is a **dependency index**. It answers: "What uses this field?"

### 9.2 Flipping the Relationship: Object Clustering

You can also ask the reverse: **"Which objects share the same filter criteria?"**

If two mailouts both filter on `Customer Tier = "Gold"`, they're implicitly related—they target the same audience. The system doesn't know this today, but with dependency data, you can infer it:

```
Cluster: "Gold Tier Customers"
  ├── Mailout "VIP Exclusive Offer"
  ├── TXT Out "Flash Sale"
  └── (no saved segment—these just happen to use the same logic)
```

**Key insight:** Objects sharing the same filter are implicitly part of the same customer journey, even if nobody explicitly grouped them.

### 9.3 Three Relationship View Options

#### Option A: Field-Centric View ("Where Used")

*"Show me everything that touches this database field."*

```
┌─────────────────────────────────────────────────────────────┐
│  Field: Customer Tier                                       │
├─────────────────────────────────────────────────────────────┤
│  Used in Filters:                                           │
│    • Mailout "VIP Exclusive Offer" — equals "Gold"          │
│    • Mailout "Loyalty Reminder" — in ["Gold", "Silver"]     │
│    • TXT Out "Flash Sale" — equals "Gold"                   │
│    • Saved Filter "High Value" — equals "Gold"              │
│                                                             │
│  Used in Merge Fields:                                      │
│    • Email Template "Tier Badge" — [Customer Tier]          │
│                                                             │
│  ⚠️ Deleting this field will affect 5 objects              │
└─────────────────────────────────────────────────────────────┘
```

**Use case:** Database administrators managing schema changes.

#### Option B: Object-Centric View ("Dependencies")

*"Show me what this mailout depends on."*

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
│  Related Objects (same filter logic):                       │
│    • TXT Out "Flash Sale" — also targets Gold tier          │
└─────────────────────────────────────────────────────────────┘
```

**Use case:** Marketers understanding what a mailout depends on before editing.

#### Option C: Graph View (Visual)

*"Show me the web of relationships interactively."*

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

Could be an interactive canvas where clicking a node highlights its connections.

**Use case:** System architects and power users auditing campaign structure.

### 9.4 What Relationship Views Enable

| Capability | Value |
|------------|-------|
| **Impact analysis** | "If I change Customer Tier values, what breaks?" |
| **Implicit campaign discovery** | "These 5 mailouts all target the same audience—should they be grouped?" |
| **Orphan detection** | "This saved filter isn't used anywhere—safe to delete?" |
| **Audit trail** | "Show me every touchpoint a Gold customer might receive" |
| **Segment promotion** | "These 3 mailouts use the same inline filter—want to convert it to a saved segment?" |
| **Conflict detection** | "You're about to send 'Flash Sale' to Gold customers, but 'VIP Offer' is scheduled for the same audience tomorrow" |

### 9.5 Implementation Effort

| Component | Effort | Notes |
|-----------|--------|-------|
| **Dependency scanner** | Medium | Parse filters, build index (required for pre-delete warnings anyway) |
| **Relationship API** | Small | Expose the index via endpoints |
| **Field-centric panel** | Small | List view, straightforward UI |
| **Object-centric panel** | Small | List view, straightforward UI |
| **Graph visualisation** | Medium | Interactive canvas, more complex frontend |
| **Cluster detection** | Medium | Algorithm to find objects with matching filter logic |
| **Suggested groupings** | Medium | UI to surface clusters and act on them |

### 9.6 Incremental Approach

**Start with:**
1. "Where Used" list panel on database fields (Phase 2/3 from roadmap)
2. "Dependencies" list panel on mailouts

**Add later:**
3. Cluster detection ("these objects target the same audience")
4. Suggested groupings ("create a campaign from these related objects?")
5. Graph visualisation (interactive canvas)

### 9.7 Connection to Journey Builder Roadmap

The relationship view is the **bridge between "safer operations" (Step 1) and "smarter campaigns" (Step 3+)**.

| Roadmap Step | How Relationship Views Help |
|--------------|----------------------------|
| **Step 1: Dependency Awareness** | Pre-delete warnings use the same underlying data |
| **Step 2: Centralised Segments** | "Where Used" shows which objects could benefit from shared segments |
| **Step 3: Unified Campaigns** | Cluster detection suggests which objects should be grouped together |
| **Step 4+: Journey Builder** | Understanding relationships is prerequisite for orchestrating them |

**Bottom line:** You don't need to build the full graph visualisation on day one. Start with simple list-based panels—high value, low risk—and they pave the way for everything else.
