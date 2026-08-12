# Journey Builder

> **Status:** Validating (in U.Lab)
> **Last updated:** 2026-08-11
> **U.Lab:** [Journey Builder Feature Roadmap Outline](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12671156493/Journey+Builder+Feature+Roadmap+Outline)
> **Foundation:** [Campaign Hub](./campaign-hub.md) (dependency awareness, unified campaigns)

---

## Outcome

> Increase the total number of campaigns sent across our customer base.

Journey Builder enables multi-touch, automated campaign orchestration — replacing manual mailout scheduling with visual, trigger-based journeys. This unlocks campaign complexity that users currently can't manage.

**Journeys are children of campaigns.** The [Campaign Hub](./campaign-hub.md) provides the structure (dependency awareness, unified campaigns, shared segments); Journey Builder provides the automation (triggers, orchestration, branching).

---

## Problems Addressed

| Problem | Evidence | Source |
|---------|----------|--------|
| "I can't effectively manage multi-touch campaigns" | Users coordinate manual mailouts for drip sequences, birthday journeys, etc. | Discovery Canvas, UTTPMO |
| "Scheduling and mailout workflows are powerful but difficult to operate at scale" | Time slider complaints, future date scheduling gaps | UTTPMO |
| "Form and event modules lack logic functionality" | Teams use JS workarounds for conditional flows | UTTPMO |
| "Email-triggered workflows are an important differentiator" | Cited as key value prop vs competitors | UTTPMO |

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

## Strategic Context: Two Parallel Tracks

Journey Builder and Campaign Hub are **complementary initiatives** that can run in parallel:

| Track | Focus | Stack | Status |
|-------|-------|-------|--------|
| **[Campaign Hub](./campaign-hub.md)** | Dependency awareness, unified campaigns, shared segments | Legacy first → Greenfield | Planning |
| **Journey Builder** | Visual orchestration, triggers, automation | Greenfield only | In progress |

**Convergence point:** Journey Builder Phase 2+ benefits from Campaign Hub infrastructure. Journeys will live inside campaigns once the Campaign Hub container model ships (Campaign Hub Phase 5).

```
Campaign Hub (structure & visibility)
├── Phase 1–3: Dependency awareness ─────── Legacy, can start NOW
├── Phase 4: Object clustering ──────────── Decision point
├── Phase 5: Campaign container ─────────── Greenfield ◄── convergence
└── Phase 6: Centralised segments ───────── Greenfield

Journey Builder (automation & orchestration)
├── Phase 1: Walking Skeleton ───────────── Greenfield, can start NOW
├── Phase 2: Core Automation ────────────── After Phase 1
├── Phase 3: Event Triggers ─────────────── After Phase 2 (DataFlow ✅)
├── Phase 4: Intelligence & Content ─────── After Phase 3 ◄── uses Campaign Hub
└── Phase 5: Advanced Orchestration ─────── After Phase 4
```

---

## Phased Roadmap

Based on [Journey Builder Feature Roadmap Outline](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12671156493/Journey+Builder+Feature+Roadmap+Outline) and [Proposed Phasing & Technical Context](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12681544239/Journey+Builder+Proposed+Phasing+Technical+Context).

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

## Refs

- **Foundation:** [Campaign Hub](./campaign-hub.md) (dependency awareness, unified campaigns, shared segments)
- **U.Lab:** [Journey Builder Feature Roadmap Outline](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12671156493/Journey+Builder+Feature+Roadmap+Outline)
- **U.Lab:** [Walking Skeleton Scope](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12510200112/Journey+Builder+Walking+Skeleton+Scope)
- **U.Lab:** [Proposed Phasing & Technical Context](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12681544239/Journey+Builder+Proposed+Phasing+Technical+Context)
- **Technical:** [State of Journey Builder](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12671320074/State+of+Journey+builder)
- **Technical:** [Journey Builder Engine](https://sparknz.atlassian.net/wiki/spaces/UB/pages/11924308123/Journey+Builder+Engine)
- **Infrastructure:** [Modern .NET & Journey Builder Infrastructure](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12632031452/Modern+.NET+Journey+Builder+Infrastructure)
- **Research:** [Campaign Visibility Gap Analysis](../../audits/campaign-visibility-gap-analysis.md)
- **Related:** [Reporting Infrastructure](./reporting-infrastructure.md) (for journey analytics)

---

## Provenance

- **Authored:** 2026-08-11
- **Updated:** 2026-08-11 (split dependency awareness to Campaign Hub; Journey Builder now focuses on automation only)
- **Based on:** Confluence documentation, Discovery Canvas analysis
- **Key insight:** Campaign Hub provides structure (dependency awareness, unified campaigns); Journey Builder provides automation (triggers, orchestration). Journeys are children of campaigns.
