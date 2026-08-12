# Reporting Infrastructure

> **Status:** Planning
> **Pain Score:** 54 (tied highest)
> **Last updated:** 2026-08-11 (Confluence gaps resolved)
> **User Quote:** "Our reports are awful... maybe this could be made easier using the new separate read-only data source"

---

## Outcome

> Provide users with accurate, fast, and actionable campaign performance insights.

Reporting is a foundational capability that affects user confidence, decision-making, and perceived platform value. The current reports are widely cited as "awful" — this is a trust and retention risk.

---

## Problems Addressed

| Problem | Evidence | Root Cause |
|---------|----------|------------|
| "Our reports are awful" | Direct user feedback, pain-themes.md | Legacy ObjectSpace ORM cannot aggregate efficiently |
| Reports are slow | Job engine bottleneck | Single-threaded job queue, N+1 queries |
| Can't see cross-campaign totals | Missing capability | ObjectSpace queries are per-mailout |
| Audience counts take too long | Filters run through job engine | No direct SQL path for counts |
| Exports time out on large datasets | Job engine constraints | No streaming export capability |

---

## Information Gaps

> **Status key:** ❓ Unknown | ⚠️ Partial | ✅ Known
>
> Reporting Infrastructure is in **Planning** status — architecture is clear (Aurora replica), but some operational and scope gaps remain.

### Technical Architecture

| Question | Status | What We Know |
|----------|--------|--------------|
| Aurora replica latency in production? | ✅ Known | **<1 minute data freshness** under normal conditions per DataFlow design. See Confluence "DataFlow - Data Replication" (13001654502). |
| Largest account by mail_logs volume? | ❓ Unknown | Performance baseline for R1 queries; noted in Open Questions |
| Is SMS event data in CDC scope? | ✅ Known | **Yes — Phase 3 of DataFlow delivery.** Phase 1 = Contacts & Transactions, Phase 2 = Mail logs & events, **Phase 3 = SMS, survey responses, event registrations**. See Confluence 13001654502. |
| Platform Filter service: extend legacy or build new? | ❓ Unknown | Unblocks R3; noted in Open Questions |
| CDC pipeline architecture? | ✅ Known | Debezium Server → Kinesis → Aurora PostgreSQL; uses PostgreSQL RLS for tenant isolation. |

### Customer Requirements

| Question | Status | What We Know |
|----------|--------|--------------|
| What report formats do customers expect? | ✅ Known | Dashboard views, CSV exports, time-series charts |
| Cross-campaign aggregation needed? | ✅ Known | Yes — currently impossible |
| Real-time vs near-real-time expectations? | ⚠️ Partial | Accept 15-min lag documented; need to confirm |

### Scope Decisions

| Question | Status | What We Know |
|----------|--------|--------------|
| Do we want external deliverability integrations? | ❓ Unknown | Affects R6 Phase 2 scope; noted in Open Questions |
| Revenue attribution in scope? | ✅ Known | No — requires CRM/e-commerce; out of scope |
| AI-powered insights? | ✅ Known | No — requires LLM infrastructure; future workstream |

---

## Architecture Context

### The Problem: ObjectSpace ORM

The legacy stack uses ObjectSpace, a proprietary ORM that:
- Cannot perform aggregations or JOINs natively
- Requires N queries for N mailouts to build reports
- Forces all operations through a single-threaded job engine

### The Solution: Aurora Read Replica

DataFlow CDC (shipped in 1.179.0) replicates `u3_data` to Aurora PostgreSQL:
- Proper SQL with JOINs and aggregations
- Time-partitioned `mail_logs`/`mail_events` via `pg_partman`
- Row-level security (RLS) for account isolation
- Can stream large result sets directly

**Key insight:** The data already exists in Aurora. Reporting improvements are about building query patterns and UI, not data infrastructure.

---

## Competitor Landscape

Research across Mailchimp, HubSpot, and Klaviyo reveals standard expectations:

| Category | Competitor Standard | UbiQuity Gap |
|----------|--------------------|--------------| 
| **Core delivery metrics** | Sent, delivered, bounced, delivery rate | Data exists, UI poor |
| **Engagement metrics** | Opens, clicks, CTR, unsubscribes, spam | Data exists, aggregation missing |
| **Time-series analysis** | Opens by hour/day, engagement decay | Query possible, no UI |
| **Comparison features** | A/B results, campaign benchmarking | Missing entirely |
| **Audience metrics** | List growth, segment comparison | Slow, incomplete |
| **Revenue attribution** | Revenue per email, conversion rate | Out of scope (requires CRM) |
| **Deliverability** | Domain health, inbox placement | Partial (internal only) |

### Competitive Positioning

| Capability | Mailchimp | HubSpot | Klaviyo | UbiQuity (Current) | UbiQuity (Target) |
|------------|-----------|---------|---------|-------------------|-------------------|
| Campaign dashboard | ✅ | ✅ | ✅ | ❌ Poor | ✅ R1 |
| Cross-campaign totals | ✅ | ✅ | ✅ | ❌ None | ✅ R2 |
| Real-time audience counts | ✅ | ✅ | ✅ | ❌ Slow | ⚠️ R3 (needs filter service) |
| Large exports | ✅ | ✅ | ✅ | ❌ Timeout | ✅ R4 |
| SMS reporting | ✅ | ✅ | ✅ | ⚠️ Partial | ⚠️ R5 (needs CDC scope check) |
| Deliverability dashboard | ✅ | ✅ | ⚠️ | ❌ None | ⚠️ R6 (internal first) |
| Engagement time-series | ✅ | ✅ | ✅ | ❌ None | ✅ R7 |
| Revenue attribution | ⚠️ | ✅ | ✅ | ❌ | ❌ Out of scope |
| AI-powered insights | ⚠️ | ✅ | ✅ | ❌ | ❌ Future (LLM infra) |

---

## Phased Roadmap

### Phase 1: Core Campaign Reporting (R1 + R2)

**Goal:** Replace "awful" reports with accurate, fast campaign performance data.

**Effort:** Medium (3–4 sprints)

**Dependencies:** Aurora read replica population (in progress)

#### R1: Campaign Performance Dashboard

Single-view dashboard for any campaign/mailout showing:

| Metric | Source | Query Complexity |
|--------|--------|------------------|
| Sent / Delivered / Bounced | `mail_logs` | Low — COUNT |
| Delivery rate | `mail_logs` | Low — calculated |
| Opens / Open rate | `mail_events` (type='open') | Low — COUNT |
| Clicks / Click rate / CTR | `mail_events` (type='click') | Low — COUNT |
| Unsubscribes | `mail_events` (type='unsub') | Low — COUNT |
| Spam complaints | `mail_events` (type='spam') | Low — COUNT |
| Top clicked links | `mail_events` | Medium — GROUP BY URL |
| Opens by hour | `mail_events` | Medium — TIME_BUCKET |

**Technical approach:**
1. Create reporting API service (gRPC or REST)
2. Aurora connection with RLS for account isolation
3. Parameterised queries for campaign ID
4. Cache layer for repeat queries (Valkey when available)
5. Frontend dashboard component

#### R2: Cross-Campaign Aggregations

Roll-ups across multiple campaigns, folders, or date ranges:

| View | Query Pattern |
|------|---------------|
| Date range totals | `WHERE sent_at BETWEEN $start AND $end` |
| Folder/type rollups | `GROUP BY folder_id` |
| Account-wide metrics | No campaign filter |
| Trend over time | `GROUP BY DATE_TRUNC('week', sent_at)` |
| A vs B comparison | Parallel queries, combined result |

**Technical approach:**
- Same API service as R1
- Additional endpoints for aggregation modes
- Query builder for dynamic filtering
- Frontend comparison UI

---

### Phase 2: Export & Audience (R3 + R4)

**Goal:** Remove job engine bottlenecks for exports and audience counts.

**Effort:** Medium (2–3 sprints)

**Dependencies:** R1 (query patterns), Connectors Exporter (NEXT), Platform Filter (backlog)

#### R4: Enhanced Export (Aurora-Direct)

Stream report data directly from Aurora, bypassing job engine:

| Capability | Current State | Target State |
|------------|---------------|--------------|
| Campaign report export | Job engine, times out | Aurora stream, unlimited |
| Contact list export | Job engine, slow | Connectors Exporter (separate track) |
| Scheduled exports | None | Prefect orchestration |
| Custom field selection | Hardcoded | Field picker UI |

**Technical approach:**
- Streaming CSV/Excel endpoint
- Pagination for very large datasets
- Background job for scheduled exports (Prefect)
- Ties naturally into Connectors Exporter work

#### R3: Real-Time Audience Counts

Instant segment counts while building filters:

| Capability | Current State | Target State |
|------------|---------------|--------------|
| Segment count | Job engine, 10–60s | Aurora query, <2s |
| Count while editing | Refresh button | Real-time as filter changes |
| Segment overlap | N/A | INTERSECT/EXCEPT queries |

**Technical approach:**
- Platform Filter AST → Aurora SQL compiler
- Debounced count queries as filter changes
- Cache recent count results

**Blocker:** Depends on Platform Filter service architecture decision.

---

### Phase 3: Deliverability & Engagement (R6 + R7)

**Goal:** Help users understand engagement patterns and inbox health.

**Effort:** Medium (2–3 sprints)

**Dependencies:** R1 (query patterns)

#### R7: Engagement Over Time Reports

Time-series visualisation of engagement:

| View | Value |
|------|-------|
| Opens by hour of day | Find optimal send times |
| Opens by day of week | Identify patterns |
| Engagement heatmap | Visual send-time planning |
| Engagement decay curve | Understand response window |

**Technical approach:**
- Time-bucket aggregation queries (already proven in R1)
- Charting library integration (existing in prototype)
- Optional: ML-based send time recommendation (future)

#### R6: Deliverability Dashboard

Internal delivery health metrics:

| Metric | Source | External Required? |
|--------|--------|-------------------|
| Bounce rate trends | `mail_events` | No |
| Hard vs soft split | `mail_events` | No |
| Bounce by domain | `mail_events` | No |
| Inbox placement rate | Seed testing | Yes (Litmus, etc.) |
| Sender reputation | Google Postmaster API | Yes |
| SPF/DKIM/DMARC status | DNS checks / headers | Partial |

**Technical approach (internal first):**
- Aggregate bounce data by domain, type, trend
- Surface actionable patterns (e.g., "Gmail bounces up 20%")
- Add external integrations later

---

### Phase 4: SMS Metrics (R5)

**Goal:** Extend reporting to TXT Programme (SMS).

**Effort:** Medium (2–3 sprints) — data confirmed in CDC scope

**Dependencies:** Phase 3 CDC delivery (SMS in DataFlow Phase 3), R1 query patterns

**CDC Status:** ✅ Confirmed in scope — SMS, survey responses, and event registrations are scheduled for DataFlow Phase 3 delivery. See Confluence "DataFlow - Data Replication" (13001654502).

#### R5: TXT/SMS Programme Metrics

| Metric | Feasibility |
|--------|-------------|
| SMS sent/delivered | ✅ In scope via CDC Phase 3 |
| SMS click rate | Depends on link tracking implementation |
| SMS unsubscribe rate | ✅ In scope via CDC Phase 3 |
| SMS vs Email comparison | Cross-channel query once data lands |

---

## Technical Architecture

### New Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Reporting Service                        │
│  (gRPC/REST API, connects to Aurora with RLS)              │
├─────────────────────────────────────────────────────────────┤
│  Endpoints:                                                 │
│    /campaigns/{id}/metrics    — R1                          │
│    /campaigns/aggregate       — R2                          │
│    /audiences/{filter}/count  — R3                          │
│    /exports/campaigns         — R4                          │
│    /deliverability/summary    — R6                          │
│    /engagement/timeseries     — R7                          │
│    /programmes/txt/{id}/metrics — R5                        │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                     Aurora PostgreSQL                        │
│  (Read replica via DataFlow CDC)                            │
├─────────────────────────────────────────────────────────────┤
│  Tables:                                                    │
│    dataflow.mail_logs      — delivery records               │
│    dataflow.mail_events    — opens, clicks, unsubs, etc.    │
│    dataflow.contacts       — audience data                  │
│    (partitioned by time via pg_partman)                     │
└─────────────────────────────────────────────────────────────┘
```

### Query Patterns

**R1 — Campaign metrics:**
```sql
SELECT
  COUNT(*) AS sent,
  COUNT(*) FILTER (WHERE status = 'delivered') AS delivered,
  COUNT(*) FILTER (WHERE status = 'bounced') AS bounced
FROM dataflow.mail_logs
WHERE campaign_id = $1 AND account_id = $2;

SELECT
  event_type,
  COUNT(*) AS count
FROM dataflow.mail_events
WHERE campaign_id = $1 AND account_id = $2
GROUP BY event_type;
```

**R2 — Cross-campaign:**
```sql
SELECT
  DATE_TRUNC('week', sent_at) AS week,
  COUNT(*) AS sent,
  COUNT(*) FILTER (WHERE status = 'delivered') AS delivered
FROM dataflow.mail_logs
WHERE account_id = $1 AND sent_at BETWEEN $2 AND $3
GROUP BY 1 ORDER BY 1;
```

**R7 — Engagement by hour:**
```sql
SELECT
  EXTRACT(HOUR FROM event_at) AS hour,
  COUNT(*) AS opens
FROM dataflow.mail_events
WHERE campaign_id = $1 AND event_type = 'open'
GROUP BY 1 ORDER BY 1;
```

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large account query performance | Slow dashboards | Index tuning; query timeouts; pagination |
| R3 blocked by filter service | Can't deliver audience counts | Sequence R3 after Platform Filter decision |
| External integration complexity (R6) | Scope creep | Ship internal metrics first; external is Phase 5+ |
| R5 blocked by CDC Phase 3 timing | SMS metrics delayed | Sequence after DataFlow Phase 3 ships |

---

## Success Metrics

| Phase | Metric | Target |
|-------|--------|--------|
| R1 | Dashboard load time | <2s for 90th percentile |
| R1 | User satisfaction | Qualitative improvement in feedback |
| R2 | Cross-campaign queries used | 50+ users within 3 months |
| R4 | Export success rate | 99% (vs current ~70%) |
| Overall | Pain score reduction | From 54 to <20 |

---

## Deliberate Scope Boundaries

We will NOT build:

| Feature | Reason |
|---------|--------|
| **Revenue attribution** | Requires CRM/e-commerce integration; out of CDP core scope |
| **Industry benchmarks** | Requires external data purchase/partnership |
| **Inbox placement testing** | Requires seed testing infrastructure (Litmus, etc.) |
| **AI-powered insights** | Requires LLM infrastructure (separate workstream) |
| **Predictive send time** | Requires ML model; future enhancement on R7 |

These are product scope decisions, not technical limitations. They can be revisited when the platform matures.

---

## Sequencing Summary

```
R1 + R2 ────────────────────────────────────────────► HIGHEST IMPACT
   │                                                  (start here)
   │
   ├──► R4 (with Connectors Exporter) ──────────────► NATURAL TIE-IN
   │
   ├──► R7 (after R1) ──────────────────────────────► LOW INCREMENTAL
   │
   ├──► R6 (internal metrics first) ────────────────► MEDIUM EFFORT
   │
   ├──► R3 (after Platform Filter) ─────────────────► BLOCKED ON FILTER SVC
   │
   └──► R5 (after CDC Phase 3) ─────────────────────► BLOCKED ON CDC PHASE 3
```

**Recommended order:** R1 → R2 → R4 → R7 → R6 → R3 → R5

---

## Open Questions

| # | Question | Impact | Owner |
|---|----------|--------|-------|
| 1 | ~~Aurora replica latency~~ | ✅ Resolved — <1 min freshness per DataFlow design (Confluence 13001654502) | DevOps |
| 2 | ~~SMS event data in CDC scope~~ | ✅ Resolved — Phase 3 of DataFlow (Confluence 13001654502) | Backend |
| 3 | What's the largest account by mail_logs volume? | Performance baseline for R1 queries | Data |
| 4 | Platform Filter service: extend legacy or build new? | Unblocks R3 | Architect |
| 5 | Do we want external deliverability integrations? | Scope for R6 Phase 2 | PM |

---

## Refs

- **Pain themes:** `docs/roadmap/pain-themes.md` (score 54)
- **Architecture:** `docs/architecture/backend-architecture.md` (DataFlow CDC, Aurora replica)
- **Architecture:** `docs/architecture/backend-overview.md` (ObjectSpace limitations)
- **Competitor research:** Klaviyo custom reports, Mailchimp email reports, HubSpot email analytics
- **Roadmap context:** `docs/roadmap/architecture-informed-roadmap.md` (Part 6)

---

## Provenance

- **Authored:** 2026-08-11
- **Motivated by:** User pain ("our reports are awful"), pain score 54 (tied highest)
- **Research:** Competitor analysis of Mailchimp, HubSpot, Klaviyo reporting features

