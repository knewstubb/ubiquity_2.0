# Exporters — Rollout Plan

## Initiative: Connectors Export

Enable UbiQuity customers to configure automated data exports from the platform to external destinations (S3, SFTP, Azure Blob). Exports deliver delta-based CSV files on a scheduled cadence, pulling from the platform's replicated data (contacts, transactions, mail recipients, mail events).

---

## Epic 1: Walking Skeleton (Phase 1)

**Goal:** Prove the end-to-end pipeline works — from wizard configuration through to a scheduled CSV landing in a destination folder.

**Estimate:** ~4 sprints

**Source:** Contacts only (unenriched)

**Dependencies:**
- gRPC route migration (remove UbiQuity public API usage — biggest backend blocker)
- Existing Prefect scheduling logic (needs sense-check for delta tracking bug)

### Features

#### 1.1 Exporter Wizard — File Settings
- Name the export
- Configure file naming prefix + timestamp format
- Select destination (connection folder path — S3/SFTP/Azure)

#### 1.2 Exporter Wizard — Data Source (Basic)
- Single mode: "All changed records" (contacts modified since last export)
- First export uses 24-hour lookback window
- No filter builder, no enrichment
- Delta tracking: last modified date comparison (reuses existing Prefect logic)

#### 1.3 Exporter Wizard — Field Mapping
- Display all contact database fields
- Checkboxes to include/exclude columns
- Default fields include unique IDs
- Allow user to pick which date field drives the comparison (default: Last Modified > Last Run Date)
- Reorder columns via drag-and-drop
- Rename column headers

#### 1.4 Exporter Wizard — Schedule
- Frequency: hourly, daily, weekly, monthly
- Day-of-week picker (weekly)
- Day-of-month picker (monthly)
- System assigns execution time automatically

#### 1.5 Exporter Wizard — Notifications
- Failure alerts (required, email list)
- Success alerts (optional, email list)

#### 1.6 Backend — gRPC Migration
- Replace UbiQuity public API calls with gRPC routes
- Config updates for new routing
- Safeguards for user-facing execution (previously developer-configured custom apps)

#### 1.7 Backend — Delta Export Pipeline
- Prefect flow: query contacts modified since last run
- Generate CSV with selected columns in defined order
- Deliver to configured destination path
- Record last run timestamp for next delta

---

## Epic 2: MVP (Phase 2)

**Goal:** Deliver enough functionality for the first real customer use cases. Users can choose contacts OR mailout recipients as the source, and enrich mailout data with contact fields.

**Estimate:** ~3 sprints

**Source:** Contacts or Mail Recipients

**Dependencies:**
- Enrichment strategy research (Stuart — how joins work, what's available)
- Security assessment for production deployment (data replication involves PII)
- Filter builder backend solution (basic vertical slice)

### Features

#### 2.1 Data Source — Source Selection
- Choose primary source: Contacts or Mailout Recipients
- Contacts: all changed records (same as Phase 1)
- Mailout Recipients: pick relevant mailout(s), filter by delivery status (Sent, Soft Bounce, Hard Bounce, Delivered, Read, Clicked)

#### 2.2 Data Source — Enrichment
- When Mailout Recipients is the source, optionally enrich with contact data
- User picks which contact fields to include alongside recipient data
- Output is recipient rows enriched with contact columns (name, email, phone, etc.)
- Contacts source does not require enrichment (it IS the base)

#### 2.3 Field Mapping — Multi-Source
- Source chips row: shows active sources (e.g. "Recipients" + "Contacts")
- Add source modal for enrichment selection
- Fields from all active sources appear in the mapping list with source badges
- Reorder across source boundaries

#### 2.4 Exporter Wizard — Review Step
- Summary of all configuration before saving
- Edit links to jump back to specific steps

#### 2.5 Backend — Mail Recipient Export Pipeline
- Query mail recipients by mailout + status filters since last delta
- JOIN contact data when enrichment is enabled
- Complexity scoring (basic) to prevent expensive queries

#### 2.6 UI Polish Pass
- Tighten wizard interactions based on Walking Skeleton learnings
- Error states, validation, edge cases

---

## Epic 3: Additional Sources (Phase 3)

**Goal:** Extend the exporter to support surveys/forms as a source, driven by customer demand.

**Estimate:** TBD (likely 2–3 sprints per source)

**Source:** Surveys (first), then Forms, Events as demand dictates

**Dependencies:**
- Data replication: survey response tables must be replicated to Postgres before they can be exported
- Filter builder UI integration (if ready by this phase)

### Features

#### 3.1 Survey Source
- "Include all contacts who completed Form A or Survey B" pattern
- Contacts who match a saved filter since Last Run Date
- Extract does not include raw survey responses — just matching contact data
- Allow user to pick which fields to extract

#### 3.2 Filter Builder Integration (if ready)
- Replace basic "all changes" / source selection with full filter builder
- Complex conditions across multiple source categories
- Saved filter references
- Complexity scoring enforcement

#### 3.3 Additional Sources (TBD)
- Forms, Events, Push, TXT — each a deliberate decision based on customer need
- Each requires: data replication, schema definition, field list curation, enrichment rules

---

## Parallel Workstream: Filter Builder

**Owner:** Stuart (Architect)

**Timeline:** Starts early in the quarter, runs in parallel with Exporter phases

### Filter Builder — Backend Design + Implementation
- Filtering.Core: validator, complexity scorer, domain models
- Filtering.Api: schema endpoint, saved filter CRUD
- DataFlow.Api: FilterExecutor implementation (contacts first, then expand)
- gRPC services: GetSchema, ValidateFilter, Execute, Stream, Count
- Can be developed and tested independently (no frontend dependency)
- Initial vertical slice: contacts only, basic operators (equals, contains, last modified)

### Filter Builder — Frontend UI
- Starts later in the quarter once backend is in MVP state
- Progressive card-based filter builder (prototype already validates UX approach)
- Schema-driven: renders based on what the backend provides
- Initial integration: standalone test page for validation
- Production integration: replaces the basic "all changes" selector in the exporter wizard

---

## Key Decisions

| Decision | Outcome |
|---|---|
| Primary source for Phase 1 | Contacts only |
| Enrichment model | Source + optional enrichment from one other table (not arbitrary cross-join) |
| Source availability | Deliberate per-source decisions — not "every table is a source" |
| Complexity protection | Filter builder's complexity scoring is the guardrail (once integrated) |
| Export type | Delta-only (changes since last run). No full-database dumps. |
| Filter builder dependency | Phase 1–2 work without it. Phase 3+ integrates it. Backend starts immediately. |

---

## Risks

| Risk | Mitigation | Likelihood |
|---|---|---|
| gRPC migration blocks exporter pipeline | Start migration early; it's the critical path | High |
| Enrichment strategy unclear | Stuart researching; hard-restrict to "enrich with contacts" for MVP | Medium |
| Security assessment delays production | Not a dev blocker — barrier to deployment only | Medium |
| Capacity constraints (George leave, team size) | Walking skeleton is intentionally minimal; MVP builds incrementally | High |
| Filter builder not ready for Phase 3 | Phase 3 can proceed with basic source selection; full filter builder enhances later | Low |

---

## Customer Use Cases Driving Priorities

| Use Case | Phase | Source | Enrichment |
|---|---|---|---|
| **Database Updates Extractor** — contacts who have updated preferences or contact details | Phase 1 | Contacts | None |
| **Mail House Engagement Extractor** — contacts sent a specific mailout who bounced/didn't read | Phase 2 | Mail Recipients | Contact data (name, address, phone) |
| **Generic Database Extractor** — contacts matching a saved filter (e.g. completed Form A, received Welcome Email) | Phase 3 | Contacts (filtered) | Filter builder integration |

---

## Timeline (indicative)

| Phase | Estimated Start | Duration | Key Output |
|---|---|---|---|
| Walking Skeleton | Early Q1 (post-importers crossover) | ~4 sprints | End-to-end pipeline: contacts delta → CSV → destination |
| MVP | Mid Q1 | ~3 sprints | Contact or Mailout source, enrichment, real customer value |
| Filter Builder BE | Starts in parallel (early Q1) | Ongoing through quarter | gRPC APIs ready for FE integration |
| Filter Builder UI | Late Q1 / early next quarter | TBD | Full filter builder replaces basic source selection |
| Additional Sources | Next quarter | TBD per source | Surveys, then Forms/Events as needed |
