---
inclusion: manual
---

# Backend Constraints

This steering file encodes the real-world architectural constraints of the UbiQuity backend. When designing or building new features in the prototype, these constraints must be respected to ensure the design is feasible in production.

For full technical details, see `docs/backend-architecture.md`.

## Account Model

- Every piece of data belongs to exactly one account. There is no global/cross-account data access unless explicitly via Account Sync.
- Accounts exist in trees: root → child (max 2 levels in practice, though backend supports deeper).
- Settings inherit downward. Child account settings override parent. Unsetting falls back to parent then to global default.
- Users work with one account at a time. Account switching is an explicit action (changes session context).
- A user may have permissions in multiple accounts but can only be "in" one at any moment.
- Account IDs are UUIDs. The root account ID is used for feature flag hashing.

## Data Isolation

- In the legacy system, each account has its own SQL tables (e.g., `ListData_{accountGuidHex}`). This means cross-account queries are impossible without the CDC replication pipeline.
- In the new platform (Aurora PostgreSQL), shared tables with `account_id` column + Row-Level Security enforce isolation.
- In our prototype (Supabase), always include `account_id` on every table and enforce RLS. Never query without account context.
- Contact data columns are dynamic (customer-defined). The legacy system creates actual SQL columns; the new system stores custom fields as JSONB.

## Feature Flags

- Features are gated per-account, not per-user.
- Resolution order: globally disabled → globally enabled → per-account override → percentage rollout (MurmurHash3 of feature + root account ID).
- New features must always have a flag. The prototype should show the "flag off" state (what does the user see if they don't have this feature?).
- Fail-safe closed: if flag check fails, the feature is OFF (user sees the old/fallback UI, never a broken new UI).

## Job Processing

- Long-running operations (imports, email sends, bulk updates, billing, reports) go through a job queue.
- The legacy system is effectively single-threaded for jobs. One job ticks at a time across ALL accounts.
- Design implication: any feature that triggers a long-running operation should show queue position, progress, and allow cancellation.
- Jobs work in "ticks" (configurable block size). A single tick should be small enough to not starve other jobs.
- SideLoad imports bypass the job engine but are being constrained to max 4 concurrent threads.
- In the prototype, represent job states (Queued → Running → Complete/Failed) but don't implement actual async processing.

## Email and Messaging

- Email templates use ESL (Engage Scripting Language) — a proprietary template language with merge fields, conditionals, loops.
- In the prototype, we use simple merge syntax (e.g., `{{first_name}}`). Don't try to replicate ESL.
- Emails are rendered individually per recipient (personalisation requires per-contact data lookup + template evaluation).
- Email sending is batched through the SMTA. A 50,000-recipient mailout processes in blocks, not all at once.
- All tracked links are encrypted. In the prototype, use plain URLs — link encryption is a production security concern, not a design concern.
- GNA (Gone No Address): contacts that hard-bounce 3+ times are automatically suppressed from future sends.

## Filters and Queries

- The filter builder converts visual conditions into SQL. Different products (mail, survey, database) have different filter implementations.
- Filter definitions are stored as XML with IDSpace references.
- In the prototype, model filters as a JSON AST (conditions, groups, AND/OR logic). This maps cleanly to the real system.
- Adding new filterable fields requires a "schema rebuild" in production (expensive, cached). Design should not imply instant availability of new fields for filtering.
- SqlWriter is considered high-risk in the real system — any change requires thorough cross-product testing.

## Schema and Metadata

- Every account has a "Global Schema" containing all service schemas (metadata about what's filterable).
- Schema generation is expensive and cached. Changes trigger rebuilds.
- Service schemas describe the structure of each product's data (survey questions, form fields, mailout metrics).
- IDSpace is the universal identifier: `{applicationID}.{serviceID}.{serviceItemID}.{fieldID}`.
- In the prototype, we don't need IDSpace complexity. Use simple UUIDs. But be aware that the real system's filter/schema model is hierarchical and cached.

## Session and State

- DataStoreItems (DSI) represent in-progress work (e.g., editing a mailout design). They persist in cache for 36 hours.
- Users edit a DSI in memory. Changes only save to the database when the user explicitly clicks "Save".
- This means: if you close the browser and come back within 36 hours, your unsaved work is still there.
- In the prototype, we can simplify to auto-save or explicit save — but be aware the real system has this "draft in cache" concept.

## Billing

- Billing data is generated by a nightly batch job (runs at 4:30am).
- It aggregates usage per service per account for the previous day.
- If a day is missed, the next run catches up.
- In the prototype, we calculate usage in real-time. But designs should not imply instant billing visibility — the real system has up to 24-hour delay.

## Account Sync

- Sync is one-way per rule (source → target). Bidirectional requires two rules.
- Only between accounts in the same tree. Cross-tenant sync is not supported.
- Loop prevention: writes tagged with `CallerType=AccountSync` are skipped by the sync consumer.
- Sync is eventually consistent (seconds under normal conditions, but not guaranteed).
- Delete propagation is NOT supported in v1.
- Historical data is NOT backfilled — sync only captures changes from activation onwards.

## Navigation and Permissions

- Three user types: Administrator (god mode, Ubiquity staff), Account Admin (super user for an account tree), Standard User (granular permissions).
- Permissions are stored as concatenated permission strings in the database.
- The real system uses a legacy permission model. The prototype's role-based system is a simplification.
- Navigation items should respect permissions — if a user can't access a module, don't show it.

## API and Service Boundaries

- Legacy services communicate via .NET Remoting (proprietary, synchronous).
- New services communicate via gRPC (efficient, typed, streaming-capable).
- The RemotingBridge translates between the two worlds.
- In the prototype, all "backend" calls go to Supabase or Edge Functions. But when designing API shapes, think about which real service would own the data.
- Service boundaries in production:
  - `u3_system` owns: accounts, users, sessions, billing, feature flags, filters, layouts
  - `u3_list` owns: contact data, transactional data, imports, schema
  - `u3_mail` owns: mailout templates, campaigns, send history
  - `DataFlow` owns: read-optimised replicas of u3_data (contacts, transactions, mail logs)
  - `AccountSync` owns: sync rules, reference mappings

## Infrastructure Constraints (for future approximation)

- Production uses MSSQL for legacy data and Aurora PostgreSQL for new services.
- Our prototype uses Supabase (PostgreSQL). This is a good match for the new-world patterns (RLS, JSONB, etc.).
- The CDC pipeline (Debezium → Kinesis → workers) could be approximated with Supabase Realtime or database triggers if we need event-driven behaviour.
- Feature flags could be a simple Supabase table with the same resolution logic.
- The job engine could be approximated with a `jobs` table + state machine (no actual background workers needed for design purposes).

## What's Actually Live vs. What's Designed

This distinction is critical. Many Confluence docs describe solutions that are designed but not yet deployed.

**Actually running in production today:**
- All 13 legacy u3_* services (Windows containers, .NET 4.8)
- Legacy MVC frontend (ASP.NET)
- Next.js frontend (ubiquity-webapps) — Connectors page, dashboard widgets
- Billing domain (platform-api, gRPC + Temporal)
- Connectors (Python/FastAPI, feature-flagged)
- RemotingBridge (5.4% of legacy surface mapped)
- Temporal cluster (self-hosted on ECS Fargate)
- Aurora PostgreSQL cluster (shared by platform-api domains)
- Couchbase for caching (migrating to Valkey — not yet done)
- Feature flags (u3_system database, custom resolution logic)
- MSSQL RDS (all legacy data)
- Azure WebJobs (email rendering, web tracking, webhooks)
- Amazon SES (email sending via ubi-mailer Lambdas)

**Designed but NOT yet deployed:**
- DataFlow CDC pipeline (Debezium → Kinesis → Aurora PG)
- Account Sync worker
- Valkey cache replacement
- Job processor overhaul (incremental fixes being shipped)
- Platform Filter Builder
- Email Pipeline Modernisation (Azure → AWS)
- Webhooks Azure → AWS migration
- S3 file storage migration
- Smart Segments (paused — data pipeline built, UI not started)
- Terraform infrastructure decomposition (in progress)

**When designing features in the prototype**, do NOT assume anything from the "designed but not deployed" list is available. These represent the direction the platform is heading, but they aren't real today.

## Service Module Layer (`src/lib/services/`)

The prototype includes a service layer that mirrors production service boundaries. Each module re-exports from existing adapters but adds documentation about which real service owns the data and what constraints apply.

**When building a new feature, start here:**

| Service module | Real service | What it owns | gRPC coverage |
|---|---|---|---|
| `system-service.ts` | u3_system | Accounts, users, permissions, feature flags, billing, filters | 13.5% |
| `list-service.ts` | u3_list | Contacts, transactions, imports, segments, schema | 6.3% |
| `mail-service.ts` | u3_mail | Campaigns, mailouts, templates, assets, send reporting | 4.0% |
| `connectors-service.ts` | Connectors (Python) | Connections, automations, import/export scheduling | 100% |
| `journey-service.ts` | JourneyBuilder (platform-api) | Journey definitions, nodes, edges, execution | 100% |
| `job-service.ts` | JobProcessor (cross-service) | Job queue, status tracking, progress | N/A |
| `feature-flags.ts` | u3_system | Feature flag resolution (production-accurate logic) | Via bridge |
| `account-hierarchy.ts` | u3_system | Account tree traversal, settings inheritance | Via bridge |

### How to use the service layer

```typescript
// Import from the domain-aligned service, not directly from adapters
import { getContacts } from '../lib/services/list-service';
import { isFeatureEnabled } from '../lib/services/feature-flags';
import { createJob } from '../lib/services/job-service';
import { areInSameTree } from '../lib/services/account-hierarchy';
```

### Feature flag usage

```typescript
import { isFeatureEnabled } from '../lib/services/feature-flags';

// Check before showing a feature
if (isFeatureEnabled('JourneyBuilder', currentAccountId)) {
  // Show journey builder UI
}
```

### Job queue usage

```typescript
import { createJob, getQueue } from '../lib/services/job-service';

// Create a queued operation (imports, mailouts, bulk updates)
const job = createJob({
  accountId: 'acc-master',
  jobType: 'import',
  metadata: { fileName: 'contacts.csv', totalItems: 5000 },
});

// Show queue position in UI
const queue = getQueue('acc-master');
```

### Cross-service data access

When a feature needs data from multiple services, note that in production this requires:
- **Same service:** Direct database query (fast, single transaction)
- **Cross-service (both modern):** gRPC call between services
- **Cross-service (legacy involved):** RemotingBridge call (requires explicit method mapping)

Example: "Show mail stats on contact profile" requires data from both `list-service` (contact) and `mail-service` (mail logs). In production, the new frontend would need BOTH services accessible via gRPC.

### Services NOT represented in this prototype (0% gRPC)

If a proposed feature touches any of these, flag it — the new frontend has NO way to access this data without someone mapping the methods to gRPC first:

- u3_survey — surveys, responses, triggered emails
- u3_forms — web forms, submissions, triggered emails
- u3_event — events, registrations, triggered emails
- u3_txt — SMS programmes, TXT Out
- u3_push — push notifications
- u3_webtracking — website visitor tracking, goals
- u3_webhooks — outbound webhook delivery
- u3_smta — email/SMS/push sending engine

## What NOT to Build in the Prototype

- Do not build ESL rendering. Use simple template variables.
- Do not build the ObjectSpace ORM. Use Supabase client directly.
- Do not build link encryption. Use plain URLs.
- Do not build the SMTA sending engine. Simulate send states.
- Do not build Azure WebJob pipelines. Show the result, not the process.
- Do not build Windows container infrastructure. Everything runs on Vercel/Supabase.

## What TO Model Accurately

- Account hierarchy and data isolation (RLS)
- Feature flags with per-account resolution
- Job states and queue concepts (even if simulated)
- Filter builder AST (conditions, groups, AND/OR)
- User permissions and navigation gating
- Campaign/journey structure and states
- Settings inheritance (root → child → override)
- The "one account at a time" session model
- Billing as a periodic aggregation (not real-time ledger)
