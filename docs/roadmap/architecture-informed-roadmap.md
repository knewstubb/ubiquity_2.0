# Architecture-Informed Roadmap

> **Purpose:** Map the Platform Feature Vision against technical architecture constraints to identify sequencing, dependencies, and feasibility.
> 
> **Source docs:**
> - [The North Star](https://app.notion.com/p/2d2287ec439980008c95d7c33ff27a9d) — Vision, philosophy, AAA framework
> - [Platform Feature Vision](https://app.notion.com/p/3895abdbd98d4e9e8a563c3e2dbdadf4) — Complete functionality inventory
> - `docs/architecture/backend-architecture.md` — Technical reference
> - `docs/architecture/system-summary.md` — Prototype architecture
>
> **Last updated:** 2026-08-11
> **Status reconciliation:** 2026-08-11
> **Reporting section added:** 2026-08-11

---

## Status Reconciliation Summary

Cross-reference of feature status across sources (reconciled 2026-08-11).

| Feature | ADO | Confluence | User Input | Reconciled Status |
|---------|-----|------------|------------|-------------------|
| **DataFlow CDC** | Done (#3551021, #3551054-105) | Live in prod (1.179.0) | Correct | **LIVE** ✅ |
| **AccountSync** | New (#3615121), Design Done (#3622626), Impl Committed (#3622663) | Design approved | In development | **IN DEVELOPMENT** |
| **Smart Segments** | REMOVED (#3306805, #3409237) | Status page exists | Paused — staging JB first, high priority but lots of work | **PAUSED** (high priority) |
| **Journey Builder** | Phase 1 items Done (#3428655, #3428643, #3448775, #3450290) | Phase 1 complete | Correct | **Phase 1 DONE** ✅ |
| **RemotingBridge** | Done (#3249149), DoS fix Done (#3486447) | — | Partial coverage, new features need new endpoints | **LIVE** (partial) |
| **Aurora 18.3** | Done (#3577947) | Shipped 1.180.0 | Unknown | **DONE** ✅ |
| **Platform Filter** | — | — | In backlog, after Connectors Exporter | **BACKLOG** |
| **Connectors Importer** | — | Feature-flagged | Should be in production today | **LIVE** ✅ |
| **Connectors Exporter** | — | — | Next in backlog, about to start | **NEXT** |
| **Email Pipeline** | — | — | Unknown | **DESIGNED** (unconfirmed) |

### Key Findings (2026-08-11)

1. **DataFlow CDC is LIVE** — Shipped in 1.179.0. Unblocks event triggers, AccountSync, Aurora replica.

2. **AccountSync is IN DEVELOPMENT** — Not just designed, actively being built.

3. **Smart Segments is PAUSED, not cancelled** — ADO shows REMOVED but that reflects prioritisation not cancellation. High priority on roadmap, but staged behind Journey Builder supporting functionality. Lots of work involved.

4. **RemotingBridge is LIVE but partial** — Core infrastructure works, but new features frequently require new endpoint mappings.

5. **Connectors pipeline:**
   - Importer: **LIVE** (in production)
   - Exporter: **NEXT** (about to start)
   - Platform Filter: **BACKLOG** (after Exporter)

---

## Executive Summary

The Platform Feature Vision describes 26 feature areas with hundreds of individual capabilities. The North Star establishes the AAA framework (Acquire, Analyse, Act) as the organising principle. This document maps those against the actual technical architecture to answer:

1. **What can be built on the existing legacy stack?**
2. **What requires the new platform services (gRPC, Aurora, Temporal)?**
3. **What depends on infrastructure that doesn't exist yet?**
4. **What's the optimal build sequence to avoid rework?**

### Key Findings

| Category | Count | Examples |
|----------|-------|----------|
| **Legacy-feasible** | ~15% | Dependency awareness, pre-delete warnings, expanded connector types |
| **Requires RemotingBridge expansion** | ~25% | Filter builder enhancements, saved segments, RBAC refinements |
| **Requires new platform services** | ~40% | Journey Builder, real-time triggers, event-driven automation |
| **Requires infrastructure not yet deployed** | ~20% | AI/LLM features, mobile app, real-time collaboration |

> **Note (2026-08-11):** DataFlow CDC is now LIVE. Features previously blocked by CDC infrastructure are now unblocked. Smart Segments status changed from PAUSED to REMOVED in ADO — clarification needed.

---

## Part 1: Technical Architecture Constraints

Before sequencing features, we must understand what the system can and cannot do today.

### 1.1 The Legacy Stack (What Exists)

**Services (LIVE):**
- 13 legacy services (u3_system, u3_list, u3_mail, etc.) running as Windows containers on ECS
- Communicate via .NET Remoting with custom ProtoBuf serialiser
- All tied to MSSQL databases (u3_system, u3_data, u3_mail, etc.)
- Single-threaded job engine per account level (long operations block each other)

**Data model:**
- Per-account table isolation (`ListData_{AccountGuidHex}`)
- ObjectSpace ORM (proprietary, code-generated)
- ESL (Engage Scripting Language) for all content rendering
- Feature flags per account with rollout percentages

**What this means:**
- Any feature touching customer data, filters, mailouts, forms, or surveys **must** go through legacy services
- Performance is constrained by the job engine — no true parallelism for long-running operations
- Schema changes (adding filterable fields) are expensive — trigger full schema rebuilds

### 1.2 The New Platform Services (Partially LIVE)

| Domain | Status | What It Does |
|--------|--------|--------------|
| **Billing** | LIVE | Usage tracking, invoice generation |
| **RemotingBridge** | LIVE (partial) | gRPC → .NET Remoting translator — new features often require new endpoint mappings |
| **Connectors Importer** | LIVE | Python/FastAPI + Prefect for data import (in production) |
| **Connectors Exporter** | NEXT | Data export — about to start development |
| **Temporal** | LIVE | Self-hosted workflow orchestration (infrastructure deployed) |
| **JourneyBuilder** | PHASE 1 DONE | gRPC CRUD working, Temporal prototype done, frontend canvas active |
| **DataFlow** | LIVE | CDC pipeline (Debezium → Kinesis → Aurora PG) — deployed in 1.179.0 |
| **AccountSync** | IN DEVELOPMENT | Cross-account contact sync — design approved, implementation underway |

**What this means:**
- Journey Builder Phase 1 is complete; Phase 2+ can proceed with content nodes
- Event triggers and real-time automation are now unblocked (DataFlow is live)
- AccountSync is actively being built (not just designed)
- Smart Segments is paused but high priority — staged behind JB supporting functionality
- RemotingBridge is live but coverage is partial — expect endpoint work for new features

### 1.3 Infrastructure Gaps

| Capability | Current State | Required For |
|------------|---------------|--------------|
| **CDC Pipeline (DataFlow)** | ✅ LIVE (1.179.0) | Event triggers, AccountSync, Aurora replica |
| **Aurora PostgreSQL read replica** | ⚠️ Cluster exists, schemas deploying | Reporting performance, audience counts |
| **Aurora 18.3 upgrade** | ✅ DONE (1.180.0) | Platform stability |
| **Valkey (cache migration)** | Designed, S-sized | Session performance, schema caching |
| **Email Pipeline Modernisation** | Designed | AWS-native email rendering (currently Azure) |
| **Serverless tracking** | Designed | Email open/click via Lambda |
| **AI/LLM infrastructure** | Not designed | Natural language filters, AI-assisted content, unified AI platform |

---

## Part 2: Feature Area Analysis

For each major feature area from the Platform Feature Vision, I'll assess:
- **Technical feasibility** — What stack does it require?
- **Dependencies** — What must be built first?
- **Effort category** — Legacy patch / RemotingBridge extension / New service / Greenfield

### 2.1 Journey Builder (Vision Section 1)

The central feature. Already IN PROGRESS with walking skeleton.

| Capability Cluster | Technical Feasibility | Dependencies |
|-------------------|----------------------|--------------|
| **Canvas & Building** (visual canvas, node library, undo/redo, autosave) | ✅ Greenfield (Next.js + Temporal) | JourneyBuilder.Api ✅ DONE |
| **Organisation & Management** (list, folders, tags, cloning) | ✅ New service | JourneyBuilder CRUD ✅ DONE |
| **Content Nodes** (Email, SMS, Push, WhatsApp) | ⚠️ Requires RemotingBridge expansion | u3_mail, u3_txt, u3_push mapping |
| **Scheduling & Manual Triggers** | ✅ Temporal workflows | JourneyBuilder.Worker |
| **Event-Based Triggers** | ✅ DataFlow CDC LIVE | DataFlow ✅ DONE |
| **Real-Time Triggers** | ✅ DataFlow + Kinesis consumers | DataFlow ✅ DONE, consumer work needed |
| **Smart Segment Entry** | ❌ Smart Segments REMOVED | Clarification needed |
| **Filtering & Audience** (start filters, splits) | ⚠️ Requires Platform Filter Builder | RemotingBridge OR new filter service |
| **Dynamic Audience Volumes** | ⚠️ Requires Aurora read replica | DataFlow → Aurora replication (in progress) |
| **A/B Testing** | ✅ Temporal workflows + stats | JourneyBuilder.Worker |
| **Simulation Mode** | ⚠️ Complex | Full journey logic in memory |
| **Real-Time Collaboration** | ❌ Not designed | Operational Transform / CRDT infra |
| **AI-Powered Journey Creation** | ❌ Requires LLM infrastructure | AI platform not designed |

**Sequencing recommendation (updated 2026-08-11):**
1. ✅ **Phase 1 (DONE):** Canvas, basic nodes, save/load, manual triggers
2. ⚠️ **Phase 2 (NEXT):** Content nodes via RemotingBridge expansion (email, SMS)
3. ⚠️ **Phase 3:** Scheduling, audience filtering (depends on filter service)
4. ✅ **Phase 4 (UNBLOCKED):** Event triggers, real-time (DataFlow now live)

### 2.2 Email Builder (Vision Section 2)

Opens as modal within Journey Builder.

| Capability | Technical Feasibility | Dependencies |
|------------|----------------------|--------------|
| **Inline Modal Experience** | ✅ Frontend only | None |
| **Block Library, Layout Control** | ✅ Frontend + new data model | Content storage schema |
| **Subject Line & Preheader** | ✅ Maps to u3_mail | RemotingBridge (mailout metadata) |
| **Merge Tags** | ⚠️ Requires ESL compatibility | ESL parser/emitter OR new merge engine |
| **Liquid Support** | ❌ ESL is proprietary, Liquid is different | Either migrate ESL → Liquid OR build transpiler |
| **Conditional Block Visibility** | ⚠️ ESL conditionals | ESL or new engine |
| **Template Management** | ⚠️ u3_mail templates | RemotingBridge expansion |
| **Reusable Content Blocks (COPE)** | ❌ New concept | Content block storage + reference tracking |
| **Cross-Browser Preview** | ✅ Third-party service (Litmus, Email on Acid) | Integration |
| **AI-Assisted Copy Generation** | ❌ Requires LLM | AI platform |
| **AI Image Generation** | ❌ Requires LLM | AI platform |

**Key constraint:** ESL (Engage Scripting Language) is proprietary and embedded everywhere. Full Liquid support would require either:
- A Liquid → ESL transpiler (complex, error-prone)
- A parallel rendering path (new emails use Liquid, old use ESL)
- Migrate ESL to Liquid across the platform (major undertaking)

**Sequencing recommendation:**
1. ✅ **Phase 1:** Block editor with static content, basic merge tags
2. ⚠️ **Phase 2:** ESL-compatible merge fields via RemotingBridge
3. ❌ **Phase 3+:** Liquid conditionals, COPE, AI features (architectural decisions required)

### 2.3 Form & Survey Builder (Vision Section 3)

Similar constraints to Email Builder — ESL-based rendering.

| Capability | Technical Feasibility | Dependencies |
|------------|----------------------|--------------|
| **Inline Modal Experience** | ✅ Frontend only | None |
| **Field Library** | ✅ Frontend + data model | Form definition schema |
| **Data Mapping to Contacts** | ⚠️ u3_list via RemotingBridge | RemotingBridge expansion for contact writes |
| **Multi-Step/Pagination** | ✅ Frontend | None |
| **Conditional Visibility** | ⚠️ ESL or new engine | Same as email |
| **Hosted Page URL** | ⚠️ u3_forms hosting | Legacy service or new hosting |
| **Webhook on Submit** | ⚠️ u3_webhooks | RemotingBridge OR event architecture |
| **Double Opt-In Workflows** | ⚠️ Journey + u3_mail | Journey Builder + email sending |
| **Partial Submission Capture** | ❌ Not in legacy | New service |
| **AI-Assisted Questions** | ❌ Requires LLM | AI platform |

### 2.4 Filter Builder (Vision Section 4)

This is a **critical dependency** for multiple features. The Platform Feature Vision describes a sophisticated filter system that doesn't fully exist.

| Capability | Technical Feasibility | Dependencies |
|------------|----------------------|--------------|
| **Simple Mode (flat AND)** | ✅ Already exists in legacy | u3_system SqlWriter |
| **Saved Segments (save/load)** | ⚠️ Partially exists | u3_system filter storage |
| **Relative Dates** | ✅ Legacy supports | SqlWriter |
| **Advanced Mode (nested AND/OR)** | ✅ Legacy supports | SqlWriter |
| **Cross-Object Queries** | ⚠️ Complex in legacy | SqlWriter for each service type |
| **Behavioural Logic** | ⚠️ u3_mail, u3_webtracking | RemotingBridge + multiple services |
| **Real-Time Audience Count** | ❌ Requires Aurora read replica | DataFlow replication |
| **Natural Language → Filter (AI)** | ❌ Requires LLM | AI platform |

**Architecture note:** The Platform Feature Vision describes a "Platform Filter Builder" as a new AST-based system. This is documented in Confluence as **DESIGNED but not built**. The decision: extend legacy SqlWriter via RemotingBridge, or build new?

**Sequencing recommendation:**
1. ✅ **Phase 1:** Expose legacy filter capabilities via RemotingBridge
2. ⚠️ **Phase 2:** Build frontend filter builder that compiles to legacy SqlWriter format
3. ❌ **Phase 3+:** New filter service (greenfield) for cross-object, behavioural, AI features

### 2.5 Asset Manager (Vision Section 5)

Centralised library for images, templates, content blocks.

| Capability | Technical Feasibility | Dependencies |
|------------|----------------------|--------------|
| **Media Library (images, docs)** | ⚠️ u3_data_files + S3 | S3 migration + new UI |
| **CDN Delivery** | ⚠️ Needs CDN setup | CloudFront or similar |
| **Template Library** | ⚠️ u3_mail templates | RemotingBridge |
| **Component Library (COPE)** | ❌ New concept | New storage + reference tracking |
| **Brand Kit** | ⚠️ New data model | Account-level settings |
| **"Where Used" Analysis** | ⚠️ Dependency tracking | See dependency-awareness-plan.md |
| **Asset Performance Tracking** | ⚠️ u3_mail reporting | RemotingBridge for mail stats |
| **Approval Workflows** | ❌ Not in legacy | New service |

### 2.6 Smart Segments (Vision Section 14)

**STATUS: PAUSED (high priority).** The ML pipeline was built and the scoring model trained. UI work never started. Currently staged behind Journey Builder supporting functionality — lots of work involved, but remains high priority on the roadmap.

> **Note:** ADO shows REMOVED status on Epic #3306805 and MVP #3409237, but this reflects prioritisation/staging rather than cancellation.

| Capability | Technical Feasibility | Dependencies |
|------------|----------------------|--------------|
| **Propensity Filtering** | ⚠️ ML scores exist, need UI | Resume work when JB foundation complete |
| **Goal Tracking** | ❌ New concept | New service |
| **Segment Triggers** | ✅ DataFlow now LIVE | CDC + event architecture available |
| **Explainability** | ⚠️ Model provides factors | UI to surface them |

**Key insight:** Segment triggers are now unblocked by DataFlow. When Smart Segments resumes, the infrastructure dependency is resolved.

### 2.7 Connectors / Data Import (Vision Section 11)

**Importer STATUS: LIVE** — In production.
**Exporter STATUS: NEXT** — About to start development.

| Capability | Technical Feasibility | Dependencies | Status |
|------------|----------------------|--------------|--------|
| **Flat File Import (S3/SFTP/Azure)** | ✅ | Connectors service | **LIVE** |
| **Import Wizard** | ✅ In prototype | Frontend | **LIVE** |
| **Scheduling** | ✅ Prefect orchestration | Connectors service | **LIVE** |
| **No-File Alerting** | ⚠️ Needs implementation | Connectors service enhancement | Backlog |
| **Flat File Export** | ✅ | Connectors service | **NEXT** |
| **Scheduled Exports** | ✅ Prefect orchestration | Connectors service | **NEXT** |
| **API Connectors** | ❌ Not built | New connector types | Future |
| **Database Connectors (Snowflake, etc.)** | ❌ Not built | New connector types | Future |
| **Webhook Receivers** | ⚠️ u3_webhooks | Legacy service OR new | Future |
| **Sales Tool Integrations (CRM, POS)** | ❌ Not built | New connector types per integration | Future |

### 2.8 Data Export / Extractors (Vision Section 12)

**STATUS: NEXT** — About to start development. Follows Connectors Importer (now live).

| Capability | Technical Feasibility | Dependencies | Status |
|------------|----------------------|--------------|--------|
| **Flat File Export** | ✅ | Connectors service | **NEXT** |
| **Scheduled Exports** | ✅ Prefect orchestration | Connectors service | **NEXT** |
| **Filtered Exports (Saved Segments)** | ⚠️ Requires filter integration | Saved segments + connectors | After Platform Filter |
| **Export History** | ⚠️ Needs tracking | Connectors service enhancement | Backlog |

### 2.9 Ad Audiences (Vision Section 20)

Sync segments to ad platforms (Meta, Google).

| Capability | Technical Feasibility | Dependencies |
|------------|----------------------|--------------|
| **Platform Connections (OAuth)** | ❌ New service | Ad platform APIs |
| **Audience Sync** | ❌ New service | Saved segments + ad APIs |
| **Automatic Hashing** | ✅ Standard SHA-256 | Implementation detail |
| **Consent Enforcement** | ⚠️ Depends on consent model | See Section 23 below |

**Dependency:** Requires saved segments AND consent management to be mature.

### 2.10 AI Features (Vision Sections 2, 3, 4, 6, 17, 25)

Multiple features depend on AI/LLM capabilities that don't exist.

| Feature Area | AI Capability | Infrastructure Needed |
|--------------|---------------|----------------------|
| Email Builder | AI-assisted copy, image generation | LLM API, image model |
| Form Builder | AI question suggestions | LLM API |
| Filter Builder | Natural language → filter | LLM + filter AST compiler |
| Audience Explorer | NL query, predictive insights | LLM + data access |
| Help & Onboarding | AI help agent | LLM + product knowledge |
| Unified AI Platform | Cross-feature intelligence | Full AI orchestration layer |

**Assessment:** None of this is designed. No LLM infrastructure exists. This is a significant gap between vision and architecture.

**Sequencing:** AI features should be treated as a separate workstream that layers on top of core functionality. Don't block core features waiting for AI.

### 2.11 Mobile Experience (Vision Section 26)

Native mobile app for monitoring and approvals.

| Capability | Technical Feasibility | Dependencies |
|------------|----------------------|--------------|
| **Native Mobile App** | ❌ Not started | React Native or native dev |
| **Push Notifications** | ⚠️ Needs infrastructure | Push service + mobile app |
| **Dashboard View** | ⚠️ Needs mobile-optimised API | API design |
| **Approval Workflows** | ❌ Not in legacy | New service |
| **AI Chat Interface** | ❌ Requires AI platform | LLM + mobile integration |

**Assessment:** Mobile is a separate product track, not an incremental feature. Should be planned as its own initiative.

### 2.12 Accessibility (Vision Section 24)

WCAG compliance for platform UI and created content.

| Capability | Technical Feasibility | Dependencies |
|------------|----------------------|--------------|
| **Platform WCAG 2.1 AA** | ⚠️ Ongoing work | Frontend audit + fixes |
| **Keyboard Navigation** | ⚠️ Ongoing work | Component library updates |
| **Screen Reader Support** | ⚠️ Ongoing work | ARIA labelling |
| **Content Alt Text Enforcement** | ✅ Validation rules | Email/Form builders |
| **Colour Contrast Checker** | ✅ Can embed tools | Builder enhancement |
| **Accessibility Score** | ⚠️ Needs scoring logic | New feature |

**Assessment:** Accessibility is cross-cutting. Should be built into component library and enforced in builders from the start.

### 2.13 Consent & Preference Management (Vision Section 23)

First-class consent framework.

| Capability | Technical Feasibility | Dependencies |
|------------|----------------------|--------------|
| **Hosted Preference Page** | ⚠️ New page type | New or extend u3_forms |
| **Channel Opt-In/Out** | ⚠️ Contact attributes | u3_list schema extension |
| **Topic-Based Preferences** | ⚠️ New data model | Contact schema + UI |
| **Purpose-Based Consent** | ⚠️ New data model | Contact schema |
| **Full Audit Trail** | ⚠️ ServiceHistory | Legacy audit tables |
| **Consent as Filter Attribute** | ⚠️ SqlWriter extension | Filter builder |
| **Regional Compliance Rulesets** | ❌ New logic | Rules engine |
| **Geo-Based Consent Logic** | ❌ New logic | Rules engine + geo data |

**Assessment:** Consent is foundational for GDPR/CCPA compliance. Should be higher priority than many features.

---

## Part 3: Recommended Sequencing

Based on the analysis above, here's a recommended build sequence that respects dependencies:

### Tier 1: Infrastructure Prerequisites

Status updated 2026-08-11:

| Initiative | Status | Effort | Unblocks |
|------------|--------|--------|----------|
| **DataFlow CDC Pipeline** | ✅ LIVE | — | Event triggers, real-time, AccountSync, Aurora replica |
| **Aurora Read Replica Population** | ⚠️ In progress | Medium | Real-time audience counts, reporting performance |
| **Aurora 18.3 Upgrade** | ✅ DONE | — | Platform stability |
| **RemotingBridge Expansion** | ⚠️ Ongoing | Medium | Content nodes, filter integration, template access |
| **Platform Filter Service (decision)** | ⚠️ Designed | Medium | Journey splits, saved segments, cross-object queries |

### Tier 2: Core Journey Builder Path

Build journey builder capabilities in dependency order:

| Phase | Features | Dependencies | Status |
|-------|----------|--------------|--------|
| **JB Phase 1** | Canvas, basic nodes, CRUD, manual triggers | JourneyBuilder.Api | ✅ DONE |
| **JB Phase 2** | Email/SMS nodes via RemotingBridge | RemotingBridge expansion | ⚠️ NEXT |
| **JB Phase 3** | Scheduling (Temporal), start filters | JourneyBuilder.Worker, filter integration | ⚠️ Planned |
| **JB Phase 4** | Event triggers, delay/wait nodes | DataFlow CDC | ✅ UNBLOCKED |
| **JB Phase 5** | Smart segment entry, A/B testing | Smart Segments (paused, high priority) | ⏸️ After Smart Segments resumes |
| **JB Phase 6** | Advanced analytics, goal tracking | Reporting infrastructure | ⚠️ Planned |

### Tier 3: Content Builders (Parallel Track)

Can proceed alongside Journey Builder:

| Phase | Features | Dependencies |
|-------|----------|--------------|
| **Content Phase 1** | Block editor, static content, basic merge | Frontend, data model |
| **Content Phase 2** | ESL-compatible merge fields | RemotingBridge (u3_mail fields) |
| **Content Phase 3** | Template management, form builder | RemotingBridge expansion |
| **Content Phase 4** | COPE (reusable blocks) | Reference tracking system |
| **Content Phase 5** | Liquid conditionals | Architecture decision (ESL migration?) |

### Tier 4: Data & Consent Foundation

Essential for compliance and advanced features:

| Phase | Features | Dependencies |
|-------|----------|--------------|
| **Data Phase 1** | Consent as contact attribute | u3_list schema |
| **Data Phase 2** | Channel opt-in/out tracking | Contact schema |
| **Data Phase 3** | Preference centre (hosted page) | Forms infrastructure |
| **Data Phase 4** | Consent audit trail | ServiceHistory integration |
| **Data Phase 5** | Consent in filters | Filter builder enhancement |

### Tier 5: Intelligence & Analytics

| Phase | Features | Dependencies | Status |
|-------|----------|--------------|--------|
| **Intel Phase 1** | Smart Segments UI | JB supporting functionality | ⏸️ PAUSED (high priority) |
| **Intel Phase 2** | Propensity filtering in journey splits | Smart Segments + JB integration | ⏸️ After Smart Segments |
| **Intel Phase 3** | Journey analytics dashboard | Reporting infrastructure | ⚠️ Planned |
| **Intel Phase 4** | Anomaly detection, automated insights | ML pipeline, DataFlow ✅ | ⚠️ Unblocked |

### Tier 6: AI Capabilities (Future Track)

Requires LLM infrastructure decisions:

| Phase | Features | Dependencies |
|-------|----------|--------------|
| **AI Phase 1** | LLM infrastructure design | Architecture decision |
| **AI Phase 2** | AI-assisted content generation | LLM API integration |
| **AI Phase 3** | Natural language → filter | LLM + filter compiler |
| **AI Phase 4** | Unified AI platform | Full orchestration layer |

### Tier 7: Extended Capabilities (Future Track)

Lower priority or separate initiatives:

- Mobile app (separate product track)
- Real-time collaboration (complex, low priority)
- Ad Audiences (requires consent + segments maturity)
- Language regionalisation (internationalisation effort)
- Trial & sandbox (GTM initiative)

---

## Part 4: Critical Path Analysis

### What Blocks the Most?

1. ~~**DataFlow CDC Pipeline**~~ ✅ **DONE** — Shipped in 1.179.0. Event triggers, AccountSync, and Aurora replica are now unblocked.

2. **Platform Filter Service** — In backlog, sequenced after Connectors Exporter. Many features need filter capabilities. Decision: extend legacy via RemotingBridge, or build new?

3. **Smart Segments** — Paused but high priority. Staged behind Journey Builder supporting functionality. Lots of work involved. Infrastructure dependency (DataFlow) is now resolved.

4. **ESL Migration Decision** — Email Builder vision describes Liquid support. ESL is deeply embedded. This is a multi-year decision point.

5. **LLM Infrastructure** — ~20% of vision features require AI. None of this is designed. Needs dedicated architecture work.

### What Can Proceed Now?

With DataFlow live and AccountSync in development:

- ✅ **Event-based triggers** for Journey Builder (unblocked)
- ✅ **AccountSync** (in development)
- ✅ **Aurora read replica population** (in progress)
- ✅ **Connectors Exporter** (about to start)

Continuing without infrastructure blockers:

- Journey Builder Phase 2 (content nodes via RemotingBridge)
- Email/Form builders for static content
- Connectors enhancement (more file types, better error handling)
- Dependency awareness (Phase 1-2, legacy only)
- Accessibility improvements (component library)
- Consent data model (contact schema extension)

---

## Part 5: Recommendations

### Immediate Actions (Updated 2026-08-11)

1. ~~**Prioritise DataFlow CDC deployment**~~ ✅ **DONE** — Shipped in 1.179.0.

2. **Complete Connectors Exporter** — Next in backlog, about to start. Foundation for filtered exports.

3. **Continue AccountSync development** — In progress, design approved, DataFlow dependency resolved.

4. **Plan Smart Segments resumption** — High priority but staged behind JB supporting functionality. Document the trigger for resumption.

5. **Begin consent data model** — GDPR/CCPA compliance is table stakes. Don't wait for full preference centre to start tracking consent.

6. **Document ESL migration path** — Even if we don't migrate immediately, document what it would take. Inform Email Builder architecture.

### Medium-Term Planning

1. **Sequence Journey Builder around DataFlow** — Phase 1-3 can proceed. Phase 4+ needs CDC.

2. **Treat AI as separate workstream** — Don't let AI features block core functionality. Layer them on later.

3. **Plan mobile as separate initiative** — This is a new product surface, not an incremental feature.

4. **Build accessibility into components** — Don't retrofit. Build it in from the start.

### Risk Callouts (Updated 2026-08-11)

| Risk | Impact | Status | Mitigation |
|------|--------|--------|------------|
| ~~DataFlow deployment delays~~ | ~~Blocks event triggers, smart segments, real-time~~ | ✅ Resolved | Shipped 1.179.0 |
| Smart Segments scope | Large body of work, competes with JB | ⏸️ Paused | Stage behind JB foundation, plan resumption trigger |
| RemotingBridge coverage | New features blocked until endpoints mapped | ⚠️ Active | Budget endpoint work per feature |
| ESL migration scope creep | Years of work, may never complete | ⚠️ Active | Decide: parallel paths vs migration |
| AI infrastructure not designed | 20% of vision blocked indefinitely | ⚠️ Active | Start architecture work now |
| Consent model insufficient | Compliance gaps, blocked features | ⚠️ Active | Start data model now |

---

## Appendix: Feature-to-Stack Mapping

Quick reference for which stack each major capability requires:

| Feature Area | Legacy | RemotingBridge | New Platform | Greenfield | Status |
|--------------|--------|----------------|--------------|------------|--------|
| Journey Canvas | | | | ✅ | Phase 1 Done |
| Journey CRUD | | | ✅ | | Phase 1 Done |
| Content Nodes (send) | | ✅ | | | Next (needs endpoints) |
| Event Triggers | | | | | ✅ Unblocked |
| Email Builder (static) | | | | ✅ | Planned |
| Email Builder (merge) | | ✅ | | | Needs endpoints |
| Email Builder (Liquid) | | | | | ⚠️ ESL decision |
| Filter Builder (basic) | ✅ | | | | Backlog |
| Filter Builder (cross-object) | | | | | ⚠️ After Exporter |
| Smart Segments | | | | | ⏸️ Paused (high priority) |
| Connectors Importer | | | ✅ | | ✅ LIVE |
| Connectors Exporter | | | ✅ | | NEXT |
| AccountSync | | | | ✅ | IN DEVELOPMENT |
| Consent Tracking | ✅ | | | | Planned |
| Preference Centre | | ✅ | | | Planned |
| Ad Audiences | | | | ✅ | Future |
| AI Features | | | | | ⚠️ LLM infra |
| Mobile App | | | | | ⚠️ New product |
| Real-time Collab | | | | | ⚠️ CRDT/OT infra |

---

## Part 6: Reporting Infrastructure

> **Pain Score:** 54 (tied highest in pain-themes.md)  
> **User Quote:** "Our reports are awful... maybe this could be made easier using the new separate read-only data source"

Reporting is a critical gap. The legacy ObjectSpace ORM cannot perform aggregations or JOINs efficiently, forcing N+1 queries for basic metrics. DataFlow CDC (now LIVE) replicates u3_data to Aurora PostgreSQL, enabling proper SQL-based reporting.

### Competitor Landscape

Research across Mailchimp, HubSpot, and Klaviyo reveals these standard reporting capabilities:

| Category | Core Metrics | Competitor Coverage |
|----------|-------------|---------------------|
| **Delivery** | Sent, delivered, delivery rate, bounces (hard/soft) | All three — table stakes |
| **Engagement** | Opens, clicks, click rate, click-through rate, unsubscribes, spam complaints | All three — table stakes |
| **Advanced Engagement** | Opens by email client/device, top clicked links, engagement over time, time spent viewing | Klaviyo/HubSpot strong, Mailchimp basic |
| **Revenue** | Revenue per email, conversion rate, orders attributed, AOV, ROI | Klaviyo excels, HubSpot via CRM, Mailchimp limited |
| **Audience** | List growth rate, segment comparison, top engaged contacts | All three, varying depth |
| **Deliverability** | Domain health, inbox placement, sender reputation | Mailchimp strong, others via third-party |
| **Comparison** | Campaign benchmarking, A/B results, industry benchmarks | All three, Mailchimp strongest on benchmarks |

### UbiQuity Feasibility Assessment

| Metric Type | Data Available in Aurora? | Implementation Complexity |
|-------------|---------------------------|---------------------------|
| **Delivery metrics** | ✅ Yes (`mail_logs`, `mail_events`) | Low — single SQL query vs N ObjectSpace calls |
| **Engagement metrics** | ✅ Yes (`mail_events` for opens/clicks) | Low — already tracked, just aggregation |
| **Opens by client/device** | ⚠️ Partial (user agent in events) | Medium — needs parsing, may need schema extension |
| **Top clicked links** | ✅ Yes (click URL in events) | Low — GROUP BY aggregation |
| **Engagement over time** | ✅ Yes (event timestamps) | Low — time-series aggregation |
| **Revenue attribution** | ❌ Not in CDP scope | N/A — requires CRM integration or e-commerce connector |
| **Audience growth** | ✅ Yes (contact created_at) | Low — COUNT with date filters |
| **Segment comparison** | ⚠️ Depends on segment storage | Medium — requires segment membership in Aurora |
| **Deliverability/reputation** | ❌ External data | Medium — requires third-party integration |
| **Industry benchmarks** | ❌ External data | Low if purchased/partnered |

### Individual Roadmap Items

#### R1: Campaign Performance Dashboard (Aurora-Backed)

**What:** Single-view dashboard showing delivery, engagement, and conversion metrics for any campaign/mailout.

**Why:** Current reports require N ObjectSpace queries per metric. Aurora enables single SQL with JOINs and aggregations. This is the most impactful "low-hanging fruit" — data already exists, just needs proper querying.

| Competitor Feature | Mailchimp | HubSpot | Klaviyo | UbiQuity Feasibility |
|-------------------|-----------|---------|---------|---------------------|
| Sent/delivered/bounced | ✅ | ✅ | ✅ | ✅ Trivial — `mail_logs` |
| Open rate | ✅ | ✅ | ✅ | ✅ Trivial — `mail_events` |
| Click rate / CTR | ✅ | ✅ | ✅ | ✅ Trivial — `mail_events` |
| Top clicked links | ✅ | ✅ | ✅ | ✅ Medium — GROUP BY URL |
| Unsubscribe rate | ✅ | ✅ | ✅ | ✅ Trivial — event type |
| Spam complaints | ✅ | ✅ | ✅ | ✅ Trivial — event type |
| Opens by hour/day | ✅ | ✅ | ✅ | ✅ Medium — time bucketing |
| Device/client breakdown | ⚠️ | ✅ | ✅ | ⚠️ Medium — UA parsing |
| Geo breakdown | ⚠️ | ✅ | ✅ | ⚠️ Medium — IP geo lookup |

**Effort:** Medium  
**Impact:** High — addresses primary pain point  
**Dependencies:** Aurora read replica population (in progress)  
**Competitive parity:** Can match Mailchimp/HubSpot core metrics; device/geo need additional work

---

#### R2: Cross-Campaign Aggregations

**What:** Totals and averages across multiple campaigns, folders, date ranges, or the entire account.

**Why:** Impossible in legacy (each query is per-mailout). Trivial in Aurora with proper indexing. Enables "how did Q2 perform vs Q1?" and "what's our average open rate?"

| Competitor Feature | Mailchimp | HubSpot | Klaviyo | UbiQuity Feasibility |
|-------------------|-----------|---------|---------|---------------------|
| Date range totals | ✅ | ✅ | ✅ | ✅ Trivial — WHERE date BETWEEN |
| Folder/campaign type rollups | ✅ | ✅ | ⚠️ | ✅ Trivial — GROUP BY folder |
| Account-wide metrics | ✅ | ✅ | ✅ | ✅ Trivial — no filter |
| Trend over time (weekly/monthly) | ✅ | ✅ | ✅ | ✅ Medium — time-series buckets |
| Comparison (A vs B) | ✅ | ✅ | ✅ | ✅ Medium — parallel queries |

**Effort:** Low  
**Impact:** High — frequently requested, currently impossible  
**Dependencies:** R1 (Campaign Performance Dashboard) for query patterns  
**Competitive parity:** Can fully match all competitors

---

#### R3: Real-Time Audience Counts

**What:** Instant count of contacts matching filter criteria, updated as filters change.

**Why:** Current audience counts run through the legacy job engine, which is single-threaded and slow. Platform Filter AST can compile directly to Aurora SQL, bypassing the job engine entirely.

| Competitor Feature | Mailchimp | HubSpot | Klaviyo | UbiQuity Feasibility |
|-------------------|-----------|---------|---------|---------------------|
| Instant segment count | ✅ | ✅ | ✅ | ⚠️ Medium — needs filter → SQL compiler |
| Count while building filter | ✅ | ✅ | ✅ | ⚠️ Medium — same dependency |
| Segment overlap analysis | ⚠️ | ✅ | ✅ | ⚠️ Medium — INTERSECT/EXCEPT queries |

**Effort:** Medium (depends on Platform Filter work)  
**Impact:** Medium — improves UX, not currently a blocker  
**Dependencies:** Platform Filter Builder (in backlog), Aurora replica  
**Competitive parity:** Can match once filter service exists

---

#### R4: Enhanced Export (Aurora-Direct)

**What:** CSV/Excel export of report data, streaming directly from Aurora.

**Why:** Current exports run through the job engine, timing out on large datasets. Aurora can stream results directly, supporting arbitrary row counts.

| Competitor Feature | Mailchimp | HubSpot | Klaviyo | UbiQuity Feasibility |
|-------------------|-----------|---------|---------|---------------------|
| Export campaign report | ✅ | ✅ | ✅ | ✅ Low — stream SQL results |
| Export contact list | ✅ | ✅ | ✅ | ✅ Low — already planned in Connectors Exporter |
| Scheduled exports | ✅ | ✅ | ✅ | ✅ Medium — ties to Connectors Exporter |
| Custom export fields | ✅ | ✅ | ✅ | ⚠️ Medium — needs field picker UI |

**Effort:** Low  
**Impact:** Medium — removes job engine bottleneck for exports  
**Dependencies:** Connectors Exporter (NEXT), Aurora replica  
**Competitive parity:** Can fully match

---

#### R5: TXT/SMS Programme Metrics

**What:** Delivery and engagement reporting for SMS campaigns (TXT Programme in UbiQuity).

**Why:** If SMS events are in CDC scope, same pattern as email reporting applies.

| Competitor Feature | Mailchimp | HubSpot | Klaviyo | UbiQuity Feasibility |
|-------------------|-----------|---------|---------|---------------------|
| SMS sent/delivered | ✅ | ✅ | ✅ | ⚠️ Depends on CDC scope |
| SMS click rate | ⚠️ | ✅ | ✅ | ⚠️ Depends on link tracking |
| SMS unsubscribe rate | ⚠️ | ✅ | ✅ | ⚠️ Depends on data model |
| SMS vs Email comparison | ❌ | ✅ | ✅ | ⚠️ Medium — cross-service query |

**Effort:** Medium (if SMS data is in Aurora), High (if not)  
**Impact:** Medium — SMS is growing channel  
**Dependencies:** Confirm SMS events in CDC scope, Aurora replica  
**Competitive parity:** Can match Mailchimp; Klaviyo/HubSpot are stronger on SMS

---

#### R6: Deliverability Dashboard

**What:** Domain reputation, inbox placement, bounce trends, and actionable recommendations.

**Why:** Deliverability is critical for email ROI. Competitors provide this; we currently don't surface this data well.

| Competitor Feature | Mailchimp | HubSpot | Klaviyo | UbiQuity Feasibility |
|-------------------|-----------|---------|---------|---------------------|
| Bounce rate trends | ✅ | ✅ | ✅ | ✅ Low — `mail_events` aggregation |
| Hard vs soft bounce split | ✅ | ✅ | ✅ | ✅ Low — event type |
| Bounce by domain | ✅ | ⚠️ | ✅ | ✅ Low — GROUP BY domain |
| Inbox placement rate | ✅ | ✅ | ⚠️ | ❌ Requires seed testing (external) |
| Sender reputation score | ✅ | ⚠️ | ⚠️ | ❌ Requires external data (Google Postmaster, etc.) |
| Authentication status (SPF/DKIM/DMARC) | ✅ | ✅ | ✅ | ⚠️ Medium — needs DNS checks or header parsing |
| Actionable recommendations | ✅ | ✅ | ⚠️ | ⚠️ Medium — rules-based suggestions |

**Effort:** Medium (internal data), High (external integrations)  
**Impact:** High — deliverability directly affects ROI  
**Dependencies:** Aurora replica; external API integrations for full feature  
**Competitive parity:** Can match internal metrics; Mailchimp leads on external data

---

#### R7: Engagement Over Time Reports

**What:** Time-series visualisation of opens, clicks, and other engagement by hour, day, week, month.

**Why:** Helps users understand when their audience engages, informing send-time optimisation.

| Competitor Feature | Mailchimp | HubSpot | Klaviyo | UbiQuity Feasibility |
|-------------------|-----------|---------|---------|---------------------|
| Opens by hour of day | ✅ | ✅ | ✅ | ✅ Low — time-bucket aggregation |
| Opens by day of week | ✅ | ✅ | ✅ | ✅ Low — time-bucket aggregation |
| Engagement heatmap | ✅ | ⚠️ | ✅ | ⚠️ Medium — UI complexity |
| Best send time recommendation | ✅ | ✅ | ✅ | ⚠️ Medium — analysis + ML |
| Engagement decay curve | ⚠️ | ✅ | ✅ | ⚠️ Medium — time-series analysis |

**Effort:** Low (basic), Medium (recommendations)  
**Impact:** Medium — actionable insights for users  
**Dependencies:** R1 (for query patterns), Aurora replica  
**Competitive parity:** Can match basic features; recommendations need additional work

---

### Reporting Roadmap Summary

| ID | Item | Effort | Impact | Dependencies | Competitor Parity |
|----|------|--------|--------|--------------|-------------------|
| R1 | Campaign Performance Dashboard | Medium | High | Aurora replica | ✅ Core metrics match all |
| R2 | Cross-Campaign Aggregations | Low | High | R1 | ✅ Full match |
| R3 | Real-Time Audience Counts | Medium | Medium | Platform Filter, Aurora | ⚠️ Needs filter service |
| R4 | Enhanced Export (Aurora-Direct) | Low | Medium | Connectors Exporter, Aurora | ✅ Full match |
| R5 | TXT/SMS Programme Metrics | Medium–High | Medium | Confirm CDC scope | ⚠️ Depends on data |
| R6 | Deliverability Dashboard | Medium–High | High | Aurora; external APIs | ⚠️ Internal only initially |
| R7 | Engagement Over Time | Low–Medium | Medium | R1, Aurora | ✅ Basic match |

### Recommended Sequencing

1. **R1 + R2** (immediate) — Highest impact, data exists, just needs querying. Start here.
2. **R4** (with Connectors Exporter) — Natural extension of exporter work.
3. **R7** (after R1) — Builds on same query patterns, low incremental effort.
4. **R6** (internal metrics first) — Bounce trends and domain breakdown. External integrations later.
5. **R3** (after Platform Filter) — Blocked by filter service architecture.
6. **R5** (confirm scope first) — Spike to confirm SMS data is in CDC scope before committing.

### What We Won't Match (and Why)

| Competitor Feature | Why We Can't/Shouldn't |
|-------------------|------------------------|
| **Revenue attribution** | Requires e-commerce/CRM integration; not in CDP core scope |
| **Industry benchmarks** | Requires external data purchase/partnership |
| **Inbox placement testing** | Requires seed testing infrastructure (Litmus, etc.) |
| **AI-powered insights** | Requires LLM infrastructure (separate workstream) |
| **Predictive send time** | Requires ML model; future enhancement on R7 |

These are deliberate scope boundaries, not gaps. Revenue attribution and predictive features can be added later as the platform matures.

---

## References

- [The North Star (Notion)](https://app.notion.com/p/2d2287ec439980008c95d7c33ff27a9d)
- [Platform Feature Vision (Notion)](https://app.notion.com/p/3895abdbd98d4e9e8a563c3e2dbdadf4)
- `docs/architecture/backend-architecture.md`
- `docs/architecture/backend-overview.md`
- `docs/architecture/system-summary.md`
- `docs/roadmap/plans/dependency-awareness-plan.md`
- [Confluence — Journey Builder Feature Roadmap](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12671156493)
- [Confluence — Product Roadmap (WIP)](https://sparknz.atlassian.net/wiki/spaces/UB/pages/11514183710)
