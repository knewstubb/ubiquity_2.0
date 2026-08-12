# Journey Builder

> **Status:** Validating (in U.Lab)
> **Last updated:** 2026-08-11
> **U.Lab:** [Journey Builder Feature Roadmap Outline](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12671156493/Journey+Builder+Feature+Roadmap+Outline)
> **Prototype:** This repo (`src/pages/JourneyBuilderPage.tsx`, `src/components/journey/`)

---

## Outcome

> Increase the total number of campaigns sent across our customer base.

Journey Builder enables multi-touch, automated campaign orchestration — replacing manual mailout scheduling with visual, trigger-based journeys. This unlocks campaign complexity that users currently can't manage.

---

## Problems Addressed

| Problem | Evidence | Source |
|---------|----------|--------|
| "I can't effectively manage multi-touch campaigns" | Users coordinate manual mailouts for drip sequences, birthday journeys, etc. | Discovery Canvas, UTTPMO |
| "Scheduling and mailout workflows are powerful but difficult to operate at scale" | Time slider complaints, future date scheduling gaps | UTTPMO |
| "Form and event modules lack logic functionality" | Teams use JS workarounds for conditional flows | UTTPMO |
| "Email-triggered workflows are an important differentiator" | Cited as key value prop vs competitors | UTTPMO |

---

## Proposed Solutions

| Solution | Addresses Problems | Experiment Status |
|----------|-------------------|-------------------|
| **Canvas-based Journey Builder** | Multi-touch management, scheduling at scale, logic gaps | Prototype in this repo |
| **Ability to group and view objects by Campaign** | Multi-touch management | Not started |

This item focuses on the Canvas-based Journey Builder as the primary solution.

---

## Opportunity Sizing

| Problem | Prevalence | Severity | Frequency | Total Pain | Addressability | Final Score |
|---------|------------|----------|-----------|------------|----------------|-------------|
| Can't manage multi-touch campaigns | 2 | 3 | 2 | 12 | 3 | 36 |
| Scheduling workflows difficult at scale | 3 | 2 | 3 | 18 | 3 | 54 |
| Logic gaps in forms/events | 2 | 2 | 2 | 8 | 2 | 16 |
| **Aggregate** | | | | **38** | | **106** |

Journey Builder addresses multiple high-pain problems, making it a high-leverage investment.

---

## Solution Assessment

| Dimension | Score/Status | Rationale |
|-----------|--------------|-----------|
| Initial Pain | 38 | Sum of addressed problems |
| Residual Pain | 8 | Some complexity remains for advanced use cases |
| Value | 30 | Significant pain reduction |
| Usability | Conditional | New paradigm requires onboarding; canvas UX must be excellent |
| Feasibility | Pass | Modern .NET service architecture proven; prototype validates UX |
| Viability | Pass | Strategic priority, differentiator |
| Effort | Quarters | Multi-phase rollout over 6+ months |
| **Decision** | **Build (phased)** | High value justifies high effort; phased approach manages risk |

---

## Strategic Context: The Journey to Journey Builder

Journey Builder is the destination, but getting there safely requires foundational work. The strategic progression:

| Step | What It Enables | Feasible in Legacy? | Status |
|------|-----------------|---------------------|--------|
| **0. Dependency Awareness** | Pre-delete warnings, "Where Used" | Yes | Planning |
| 1. Centralised Segments | Reusable, referenced filters | Maybe | Future |
| 2. Unified Campaigns | Cross-channel grouping | Difficult | Future |
| 3. Triggered Sequences | Event-driven automation | No (greenfield) | Future |
| 4. Visual Journey Builder | Drag-and-drop orchestration | No (greenfield) | In progress |
| 5. Journey Analytics | Conversion funnels, A/B testing | No (greenfield) | Future |

**Dependency Awareness is Step 0** — foundation work that enables safe schema changes, surfaces implicit relationships, and informs later steps. See [Dependency Awareness Plan](../plans/dependency-awareness-plan.md).

---

## Phased Roadmap

Based on [Journey Builder Feature Roadmap Outline](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12671156493/Journey+Builder+Feature+Roadmap+Outline) and [Proposed Phasing & Technical Context](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12681544239/Journey+Builder+Proposed+Phasing+Technical+Context).

### Phase 0: Dependency Awareness (Foundation)

**Goal:** Enable safe changes to database fields and filters by surfacing dependencies.

**Effort:** 5–7 sprints (Phases 1–3 of dependency plan)

**Stack:** Legacy (.NET, SQL Server) — can start immediately

| Sub-phase | Capability | Effort | Value |
|-----------|------------|--------|-------|
| **0.1** | Pre-delete warnings for database fields | 1–2 sprints | Prevent accidental breakage |
| **0.2** | "Where Used" panel on database fields | 1–2 sprints | Proactive dependency visibility |
| **0.3** | "Where Used" on saved filters + TXT/Push | 2–3 sprints | Cross-module visibility |
| **0.4** | Object dependencies + clustering | 3–4 sprints | Implicit campaign discovery |

**Why this matters for Journey Builder:**
- Journey Builder will create complex dependencies between objects
- Without visibility, users will break journeys by changing upstream objects
- The dependency data informs the "Unified Campaigns" concept
- Same patterns apply to journey dependencies later

**Technical approach:**
1. On-demand scan of filter definitions for field references
2. Build dependency index for performance (if latency is a problem)
3. Surface "Where Used" panels on field and filter detail views
4. Cluster detection for objects sharing the same audience

See [Dependency Awareness Plan](../plans/dependency-awareness-plan.md) for full details.

---

### Phase 1: Walking Skeleton (MVP)

**Goal:** Prove the concept works end-to-end with minimal feature surface.

| Capability | Notes |
|------------|-------|
| List journeys | Newest first, create/delete, empty state |
| Visual builder | Drag-and-drop, auto-connect, auto-heal, real-time validation |
| Trigger node | Entry point for journey |
| Email node | Select from existing "Journey Emails" |
| Autosave | Changes saved immediately |
| Manual trigger | Start a journey and generate output |

**Status:** Walking skeleton scope defined. Infrastructure work in progress.

**Dependencies:** None — greenfield service.

---

### Phase 2: Core Automation

**Goal:** Enable practical automated journeys with timing and logic.

| Capability | Notes | Dependencies |
|------------|-------|--------------|
| Scheduled triggers | Time-based journey initiation | Temporal workflows |
| Wait nodes | Delay between steps | Temporal workflows |
| Branching | Simple if/else based on contact fields | RemotingBridge (field access) |
| SMS node | Leverage existing TXT infrastructure | RemotingBridge (u3_txt) |

**Dependencies:** RemotingBridge expansion for contact field access and TXT integration.

---

### Phase 3: Event Triggers (Unblocked by DataFlow)

**Goal:** React to real-time events with instant journey initiation.

| Capability | Notes | Dependencies |
|------------|-------|--------------|
| Event-based triggers | Form submit, email open, page visit | DataFlow CDC ✅ LIVE |
| Real-time triggers | Sub-second response to events | Kinesis consumer (needs work) |
| Delay/wait nodes | Wait for event OR timeout | Temporal workflows |

**Status:** DataFlow CDC shipped in 1.179.0. Event triggers are now **unblocked**.

**Key insight:** This was previously blocked by CDC infrastructure. Now that DataFlow is live, this phase can proceed.

---

### Phase 4: Intelligence & Content

**Goal:** Enable content creation and experimentation within journeys.

| Capability | Notes | Dependencies |
|------------|-------|--------------|
| Content creation | Build forms/surveys within Journey Builder | Email/Form builder integration |
| A/B testing | Split paths with performance comparison | Temporal + analytics |
| Goal tracking | Conversion events within journeys | DataFlow (for event capture) |
| Reporting | Journey-level performance dashboards | Reporting Infrastructure (R1) |

**Cross-dependency:** Journey reporting ties into the broader Reporting Infrastructure initiative. See [Reporting Infrastructure](./reporting-infrastructure.md).

---

### Phase 5: Advanced Orchestration

**Goal:** Enterprise-grade journey management and multi-channel reach.

| Capability | Notes | Dependencies |
|------------|-------|--------------|
| Real-time triggers | Instant journey initiation from user events | DataFlow + Kinesis consumers |
| Multi-channel | Push notifications, WhatsApp | RemotingBridge (u3_push) + new channels |
| Journey versioning | Edit live journeys safely | Temporal workflow versioning |
| Folders/tags | Manage high volumes of journeys | JourneyBuilder.Api extension |

---

### Phase 6: Smart Segments Integration (Paused)

**Goal:** Use ML-powered propensity scores in journey entry and branching.

| Capability | Notes | Dependencies |
|------------|-------|--------------|
| Propensity filtering | Enter journey based on ML scores | Smart Segments (⏸️ PAUSED) |
| Segment triggers | Journey initiates when contact enters segment | DataFlow ✅ + segment membership tracking |
| Explainability | Show why contact is in segment | Smart Segments UI |

**Status:** Smart Segments is paused (high priority but staged behind JB foundation). The infrastructure dependency (DataFlow) is now resolved. Resume this phase when Smart Segments work restarts.

---

### Future: AI & Collaboration

| Capability | Dependencies | Status |
|------------|--------------|--------|
| AI-powered journey creation | LLM infrastructure | ❌ Not designed |
| Natural language → journey | LLM + journey compiler | ❌ Not designed |
| Real-time collaboration | OT/CRDT infrastructure | ❌ Not designed |
| Journey simulation mode | Full journey logic in memory | ❌ Complex |

These require significant infrastructure that doesn't exist. They should be treated as a separate workstream.

---

## Technical Architecture

From [State of Journey Builder](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12671320074/State+of+Journey+builder):

- **First modern .NET service** in UbiQuity platform
- **Temporal** for workflow orchestration
- **gRPC** API with auto-generated SDK
- **React frontend** (standalone app, proxied into main platform)
- **PostgreSQL** for journey definitions
- **Legacy integration** via Remoting Bridge for mailout execution

### Key Infrastructure

- New internal ALB configured for gRPC
- ECS services for Journey Builder API
- SDK published to GitHub Packages as `@qriousnz/journey-builder-sdk`

---

## Prototype Status (This Repo)

The UbiQuity 2.0 prototype includes a Journey Builder canvas implementation:

| Component | Location | Status |
|-----------|----------|--------|
| Page | `src/pages/JourneyBuilderPage.tsx` | Built |
| Canvas | `src/components/journey/JourneyCanvas.tsx` | Built |
| Node types | `src/components/journey/nodes/` | Partial |
| Data model | `src/models/journey.ts` | Built |

The prototype validates UX patterns before production implementation. It is not connected to the production Journey Builder API.

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| UX complexity overwhelms users | Phase 1 is deliberately simple; user testing before Phase 2 |
| Legacy mailout integration becomes bottleneck | Rate limiter in Temporal worker; monitor bridge performance |
| Feature scope creep | Strict phase boundaries; each phase must ship before next begins |
| Parallel development with legacy maintenance | Dedicated JB team; legacy work handled separately |

---

## Success Metrics

| Phase | Metric | Target |
|-------|--------|--------|
| Phase 1 | Journeys created | 50+ across 10+ accounts |
| Phase 2 | Journeys with branches | 30% of all journeys |
| Phase 3 | A/B tests run | 20+ per quarter |
| Overall | Campaigns sent via JB vs manual | 25% of all campaigns within 12 months |

---

## Open Questions

| # | Question | Impact | Owner |
|---|----------|--------|-------|
| 1 | How do we migrate existing automated mailouts to journeys? | User adoption, data migration | PM |
| 2 | What's the pricing model for Journey Builder? | Commercial viability | Product |
| 3 | Do we need journey templates for quick starts? | Time to first journey | UX |
| 4 | Filter serialisation format — how are embedded filters stored? | Dependency awareness implementation | Backend |
| 5 | Performance on large accounts — how many mailouts exist? | Dependency scan latency | Data |

---

## Dependency Awareness Detail

> Full plan: [Dependency Awareness Plan](../plans/dependency-awareness-plan.md)

Dependency awareness is foundational work that should begin before or alongside Journey Builder Phase 1. It addresses a fundamental platform gap and directly supports journey safety.

### The Problem

When you change or delete something in UbiQuity, there's no way to know what else might break:

- **No reverse lookup** — Deleting a database field doesn't warn which mailouts use it
- **No "Where Used" panel** — You can see what a filter contains, but not which objects use it
- **Duplicated logic** — Same targeting criteria copied into dozens of mailouts
- **Implicit campaigns** — Objects targeting the same audience aren't shown as related

### Why It Matters for Journey Builder

1. **Journey dependencies will be complex** — A journey references triggers, filters, content, and channels. Changing any of these could break the journey.
2. **Schema changes will break journeys** — Without warnings, users will delete fields used in journey branching conditions.
3. **"Where Used" patterns apply to journeys** — "Which journeys use this email template?" is the same pattern as "Which mailouts use this field?"
4. **Implicit campaign discovery informs journey design** — Clusters of objects targeting the same audience suggest journey candidates.

### Sequencing

```
Dependency Awareness (Phase 0)
├── 0.1 Pre-delete warnings ─────────────── Can start NOW
├── 0.2 "Where Used" on fields ───────────── After 0.1
├── 0.3 "Where Used" on filters + TXT ────── After 0.2
└── 0.4 Object clustering ────────────────── Decision point (legacy vs greenfield)

Journey Builder
├── Phase 1: Walking Skeleton ────────────── Parallel with 0.1–0.2
├── Phase 2: Core Automation ─────────────── After Phase 1
├── Phase 3: Event Triggers ──────────────── After Phase 2 (DataFlow ✅)
├── Phase 4: Intelligence & Content ──────── After Phase 3
├── Phase 5: Advanced Orchestration ──────── After Phase 4
└── Phase 6: Smart Segments ──────────────── After Smart Segments resumes
```

**Key insight:** Dependency Awareness 0.1–0.3 is legacy work that can proceed in parallel with Journey Builder Phase 1. The same patterns will later apply to journey dependencies.

### Technical Approach (Summary)

**Filter storage:** Filters are embedded in each mailout as serialised data (XML/JSON). No existing dependency index.

**Options:**
1. **On-demand scan** — Query and parse filters at delete-time. Slow on large accounts, but simplest.
2. **Background indexer** — Nightly job builds dependency index. Pre-delete reads from index. Faster, but stale data risk.
3. **Hybrid** — Index for speed, validate on-demand for accuracy.

**Recommendation:** Start with on-demand scan. Accept slower performance initially. Add indexer if latency becomes a problem.

See [Dependency Awareness Plan](../plans/dependency-awareness-plan.md) for full technical details, UI mockups, and open questions.

---

## Refs

- **U.Lab:** [Journey Builder Feature Roadmap Outline](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12671156493/Journey+Builder+Feature+Roadmap+Outline)
- **U.Lab:** [Walking Skeleton Scope](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12510200112/Journey+Builder+Walking+Skeleton+Scope)
- **U.Lab:** [Proposed Phasing & Technical Context](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12681544239/Journey+Builder+Proposed+Phasing+Technical+Context)
- **Technical:** [State of Journey Builder](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12671320074/State+of+Journey+builder)
- **Technical:** [Journey Builder Engine](https://sparknz.atlassian.net/wiki/spaces/UB/pages/11924308123/Journey+Builder+Engine)
- **Infrastructure:** [Modern .NET & Journey Builder Infrastructure](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12632031452/Modern+.NET+Journey+Builder+Infrastructure)
- **Foundation:** [Dependency Awareness Plan](../plans/dependency-awareness-plan.md)
- **Research:** [Campaign Visibility Gap Analysis](../audits/campaign-visibility-gap-analysis.md)
- **Related:** [Reporting Infrastructure](./reporting-infrastructure.md) (for journey analytics)
- **Prototype:** `src/pages/JourneyBuilderPage.tsx`

---

## Provenance

- **Authored:** 2026-08-11
- **Updated:** 2026-08-11 (added dependency awareness research, expanded phasing)
- **Based on:** Confluence documentation, prototype implementation, Discovery Canvas analysis, dependency awareness research
