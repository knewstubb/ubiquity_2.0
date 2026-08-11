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

### Phase 2: Core Automation

| Capability | Notes |
|------------|-------|
| Scheduled triggers | Time-based journey initiation |
| Wait nodes | Delay between steps |
| Branching | Simple if/else based on contact fields |
| SMS node | Leverage existing TXT infrastructure |

### Phase 3: Intelligence & Content

| Capability | Notes |
|------------|-------|
| Content creation | Build forms/surveys within Journey Builder |
| A/B testing | Split paths with performance comparison |
| Goal tracking | Conversion events within journeys |
| Reporting | Journey-level performance dashboards |

### Phase 4: Advanced Orchestration

| Capability | Notes |
|------------|-------|
| Real-time triggers | Instant journey initiation from user events |
| Multi-channel | Push notifications, WhatsApp |
| Journey versioning | Edit live journeys safely |
| Folders/tags | Manage high volumes of journeys |

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

---

## Refs

- **U.Lab:** [Journey Builder Feature Roadmap Outline](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12671156493/Journey+Builder+Feature+Roadmap+Outline)
- **U.Lab:** [Walking Skeleton Scope](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12510200112/Journey+Builder+Walking+Skeleton+Scope)
- **U.Lab:** [Proposed Phasing & Technical Context](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12681544239/Journey+Builder+Proposed+Phasing+Technical+Context)
- **Technical:** [State of Journey Builder](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12671320074/State+of+Journey+builder)
- **Technical:** [Journey Builder Engine](https://sparknz.atlassian.net/wiki/spaces/UB/pages/11924308123/Journey+Builder+Engine)
- **Infrastructure:** [Modern .NET & Journey Builder Infrastructure](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12632031452/Modern+.NET+Journey+Builder+Infrastructure)
- **Prototype:** `src/pages/JourneyBuilderPage.tsx`

---

## Provenance

- **Authored:** 2026-08-11
- **Based on:** Confluence documentation, prototype implementation, Discovery Canvas analysis
