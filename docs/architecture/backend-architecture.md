# UbiQuity Backend Architecture — Technical Reference

> Last updated: 2026-07-23
> Source: Confluence space UB — pages: UbiQuity Architecture, UbiQuity Infrastructure, DataFlow - Data Replication, Account Sync, Terraform Infrastructure Decomposition, Feature flags in Ubiquity, Job Processing System Analysis, Common Terminologies, System service documentation.

---

## 1. System Overview

UbiQuity (also called "Engage") is a multi-tiered .NET application comprising SQL databases, Windows services, cloud services (Azure + AWS), and web applications. It operates as a multi-tenant SaaS platform where each tenant ("account") has isolated data but shares compute infrastructure.

### Repositories

| Repo | Purpose |
|------|---------|
| `QT-Ubi-UbiquityBackend` | Legacy .NET 4.8 backend services (u3_*), Windows containers on ECS |
| `ubiquity-platform-api` | New .NET 10 platform services (gRPC, Fargate, Linux ARM64) — Billing, JourneyBuilder, DataFlow, Connectors, AccountSync |
| `QT-Ubi-UbiquityInfra` | Shared infrastructure Terraform (VPC, RDS, Aurora, ECR, ALB) |
| `ubiquity-webapps` | Next.js frontend (App Router) |
| `ubiquity-protos` | Shared protobuf definitions for gRPC services |
| `Ubiquity-Connectors-Prefect` | Python/FastAPI connectors service (Prefect for orchestration) |

---

## 2. Service Architecture

### Status Key

Throughout this document:
- **LIVE** = Running in production today
- **IN PROGRESS** = Actively being built, partially deployed
- **PROPOSED** = Solution designed, not yet started
- **PAUSED** = Work started then stopped

### 2.1 Legacy Backend Services (u3_*) — LIVE

All written in C# 7 on .NET 4.7.2 (now 4.8), running as Windows containers on ECS (EC2 launch type). They communicate with the web layer via **.NET Remoting with a custom ProtoBuf serialiser**.

| Service | Database | Purpose |
|---------|----------|---------|
| `u3_system` | `u3_system` | Core: session management, authentication, error logging, admin, billing, feature flags, account management, user/member CRUD, filter management |
| `u3_list` | `u3_list` + `u3_data` | Contact databases, transactional databases, imports, data queries, schema management |
| `u3_mail` | `u3_mail` | Mailout creation, automated mailouts, reporting, link tracking, view-online |
| `u3_survey` | `u3_survey` | Survey creation, completion, reporting |
| `u3_forms` | `u3_forms` | Web form creation, completion, reporting |
| `u3_event` | `u3_event` | Event creation, completion, reporting |
| `u3_txt` | `u3_txt` | SMS programmes, TXT Out, automated TXT |
| `u3_push` | `u3_push` | Push messaging, automated push |
| `u3_webtracking` | `u3_webtracking` | Web tracking goals, reporting (Azure CDN + EventHub) |
| `u3_webhooks` | `u3_webhooks` | Webhook creation, event processing (Azure WebJobs) |
| `u3_share` | `u3_share` | Social media activity recording |
| `u3_smta` | `u3_smta` (on SQL-3) | Email/SMS/Push sending and receiving engine |
| `u3_social` | — | Facebook Audience integration |

### 2.2 Platform API Services (New Stack)

.NET 10 services running on Fargate (Linux ARM64), communicating via gRPC. Uses Terragrunt for IaC, domain-driven folder structure. Each domain follows a standardised structure: `{Domain}.Api` (gRPC), `{Domain}.Worker` (background), `{Domain}.Migrate` (schema), `{Domain}.Core` (interfaces), `{Domain}.Infrastructure` (EF Core).

| Domain | Services | Purpose | Status |
|--------|----------|---------|--------|
| `Billing` | Billing.Api, Billing.Worker | Usage tracking, invoice generation | **LIVE** |
| `JourneyBuilder` | JourneyBuilder.Api, JourneyBuilder.Worker | Campaign journey orchestration (Temporal workflows) | **IN PROGRESS** (walking skeleton, gRPC CRUD working, Temporal prototype done, frontend canvas active) |
| `DataFlow` | DataFlow.Api, DataFlow.Worker | CDC replication from MSSQL to Aurora PostgreSQL | **PROPOSED** (solution designed, CDC enablement confirmed, not yet deployed) |
| `AccountSync` | AccountSync.Worker | Cross-account contact/transaction synchronisation | **PROPOSED** (solution designed and approved, depends on DataFlow Kinesis stream) |
| `Connectors` | External (Python/FastAPI + Prefect) | Data import/export connectors | **LIVE** (feature-flagged, v1.0 released) |
| `RemotingBridge` | Bridge service | gRPC-to-.NET Remoting translator (allows new services to call legacy) | **LIVE** (~5.4% of 1,101 legacy methods mapped: 59 RPCs across 12 gRPC services) |
| `Temporal` | 5 ECS services (frontend, history, matching, worker, UI) | Self-hosted workflow orchestration engine | **LIVE** (infrastructure deployed, used by JourneyBuilder) |

**Remoting Bridge coverage (as of March 2026):**
- SYSTEM: 13.5% (46/341 methods)
- MAIL: 4.0% (5/125)
- LIST: 6.3% (8/127)
- SURVEY, EVENT, FORMS, SMTA, TXT, PUSH: 0%

**Key infrastructure decisions (LIVE):**
- Aurora PostgreSQL with IAM auth (no passwords in config)
- ECS Service Connect for service discovery
- Temporal for long-running workflows (per-domain task queues)
- SSM Parameter Store for runtime config (`/ubiquity/{domain}/`)
- Snake-case naming convention on all PostgreSQL schemas

### 2.2.1 Proposed/In-Flight Modernisation (NOT YET LIVE)

These are documented solutions that have not yet shipped:

| Initiative | Status | Key Doc |
|-----------|--------|---------|
| DataFlow CDC pipeline (Debezium → Kinesis → Aurora PG) | Designed, not deployed | "DataFlow - Data Replication" |
| Account Sync (CDC → SQS → list service bulk writes) | Designed, approved by Gary Sin | "Account Sync" |
| Terraform Infrastructure Decomposition (monolith → stacks) | In progress (Phase 1) | "Terraform Infrastructure Decomposition" |
| Valkey migration (replace Couchbase) | Designed, S-sized | "ElastiCache Valkey Caching Layer" |
| Job Processor overhaul (concurrent execution) | Designed, incremental fixes shipping | "Job Processing System Analysis" |
| S3 File Storage Migration (u3_data_files → S3) | Designed | "S3 File Storage Migration" |
| Import scratch table → In-Memory OLTP | Designed | "Replace Import Scratch Table" |
| Email Pipeline Modernisation (Azure → AWS Mail Worker) | Designed | "Email Pipeline Modernisation" |
| Webhooks Azure → AWS migration | Designed | "Webhooks Platform Migration" |
| Serverless email tracking (open/click via Lambda) | Designed | "Serverless Email Open and Click Tracking" |
| Platform Filter Builder (new AST-based filter) | Designed, frontend analysis done | "Platform Filter Builder" |
| Smart Segments (AI affinity scoring via Snowflake) | **PAUSED** (data pipeline built, scoring model trained, UI not started) | "Smart Segments - Project Status Summary" |
| Signed tracking personalisation | Designed | "Signed Tracking Personalisation" |

### 2.3 Communication Patterns

```
┌─────────────────────────────────────────────────────────┐
│ Web Layer (Next.js + Legacy MVC)                        │
│                                                         │
│  Next.js ──── gRPC ────→ Platform API (Fargate)        │
│  Next.js ──── gRPC ────→ RemotingBridge ──→ u3_*       │
│  MVC ──── .NET Remoting (ProtoBuf) ────→ u3_*          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Inter-Service Communication                             │
│                                                         │
│  u3_* ←──── .NET Remoting ────→ u3_* (cross-service)   │
│  Platform API ←── gRPC ──→ Platform API                 │
│  Platform API ←── gRPC (RemotingBridge) ──→ u3_*       │
│  DataFlow.Worker ←── Kinesis ──→ MSSQL (CDC)           │
│  AccountSync.Worker ←── Kinesis + SQS ──→ u3_list      │
└─────────────────────────────────────────────────────────┘
```

**Key protocols:**
- **Legacy ↔ Legacy**: .NET Remoting with custom ProtoBuf channel sink
- **New ↔ Legacy**: gRPC via RemotingBridge service
- **New ↔ New**: gRPC (direct, via Service Connect namespace)
- **CDC events**: Debezium → Amazon Kinesis Data Streams
- **Async writes**: Amazon SQS (e.g., AccountSync → list-service-bulk-writes queue)
- **Email rendering**: Azure Storage queues + blob containers
- **WebTracking**: Azure EventHub → WebJobs → Blob Storage

---

## 3. Database Architecture

### 3.1 MSSQL (Legacy — RDS SQL Server, Sydney region)

**SQL-1** — Primary database server holding all metadata and customer data:

| Database | Contents |
|----------|----------|
| `u3_system` | Accounts, users, sessions, permissions, billing, feature flags, filters, layouts, data definitions, service schemas |
| `u3_data` | ALL customer data — contacts (ListData_*), transactions (List_TransactionalData_*), survey responses, email logs, form submissions. **Per-account tables** with naming pattern `data.{TableType}_{AccountGuidHex}` |
| `u3_data_files` | Uploaded files stored as varbinary |
| `u3_data_scratch` | Temporary data for email sending and imports |
| `u3_mail` | Mailout metadata, campaign folders, templates |
| `u3_survey` | Survey metadata |
| `u3_forms` | Form metadata |
| `u3_event` | Event metadata |
| `u3_list` | Database/list metadata, column definitions |
| `u3_txt` | SMS programme metadata |
| `u3_push` | Push notification metadata |
| `u3_share` | Social share metadata |
| `u3_web` | Web application configuration |
| `u3_webhooks` | Webhook metadata |
| `u3_webtracking` | WebTracking goal metadata |
| `u3_audit` | Platform activity logs |

**SQL-3** — SMTA database server:

| Database | Contents |
|----------|----------|
| `u3_smta` | Current and recent email/push/SMS message state for sending engine |

### 3.2 Aurora PostgreSQL (New — shared cluster)

Used by platform-api services:

| Schema/Database | Owner | Purpose |
|-----------------|-------|---------|
| `dataflow` | DataFlow.Api/Worker | Read-optimised replica of u3_data (contacts, transactions, mail logs, etc.) with RLS |
| `account_sync` | AccountSync.Worker | Sync rules, column mappings, reference mappings |
| `billing` | Billing.Api | Usage records, invoice data |
| `journey_builder` | JourneyBuilder.Api | Journey definitions, step configurations |

**Key characteristics:**
- Row-Level Security (RLS) enforced on all tenant-facing tables
- Three DB roles per domain: `{domain}_owner` (migrations), `{domain}_sync` (bypasses RLS for workers), `{domain}_app` (API reads, RLS enforced)
- Dynamic customer columns stored as `jsonb`
- Time-partitioned tables (mail_logs, mail_events) via `pg_partman`

### 3.3 Other Data Stores

| Store | Purpose | Location |
|-------|---------|----------|
| Couchbase | Session data (DataStoreItems), cached schemas | ECS service on EC2 + EFS (migrating to Valkey) |
| Valkey (ElastiCache) | Replacement for Couchbase (in progress) | AWS managed |
| Azure Blob Storage | Rendered emails, WebTracking data, webhook payloads, file uploads | Azure (legacy) |
| Azure Table Storage | WebTracking blob tracking, throughput telemetry | Azure (legacy) |
| Azure SQL | WebTracking summaries and indexing | Azure (legacy) |
| Redis | WebTracking/Webhooks throughput telemetry | Azure (legacy) |
| S3 | Filedrop bucket, filesystem bucket, Lambda artifacts, Debezium offsets | AWS |
| DynamoDB | Debezium offset storage (CDC position tracking) | AWS |

### 3.4 Data Model Concepts

**Account hierarchy:**
- Root account → child accounts (2 levels supported, though backend is not restricted)
- All accounts in a tree share the same SQL user (`u3data_{root_account_guid}`)
- Account settings use inheritance: child → parent → default

**Per-account data isolation:**
- Every account gets its own set of SQL objects (tables, stored procedures, views)
- Contact table: `u3_data.data.ListData_{AccountGuidHex}`
- Transaction table: `u3_data.data.List_TransactionalData_{ListGuidHex}_{TransListGuidHex}`
- Created on-demand when modules are provisioned

**IDSpace (universal object identifier):**
```
{applicationID}.{serviceID}.{serviceItemID}.{fieldID}
```
- ApplicationID: static GUID per product (Forms, Mail, Survey, etc.)
- ServiceID: GUID of the form/survey/mailout folder
- ServiceItemID: GUID of the specific item (mailout, triggered email)
- FieldID: GUID of the database field or survey question

**ObjectSpace ORM:**
- Proprietary ORM generated by `u2DataGen` tool
- Classes generated as partial classes against dev databases
- Lacks support for aggregation and joins
- All queries are logged
- Some operations use stored procedures for efficiency

---

## 4. Infrastructure

### 4.1 AWS (Current Production — Sydney `ap-southeast-2`)

| Component | Technology | Notes |
|-----------|-----------|-------|
| Compute (legacy) | ECS on EC2 (Windows containers) | u3_* services, single cluster |
| Compute (new) | ECS Fargate (Linux ARM64) | Platform-api services, 0.5 vCPU / 1GB typical |
| Networking | VPC with public/private subnets, NAT gateways, VPC endpoints | Managed in UbiquityInfra repo |
| Load balancing | NLB (u3 services), ALB (platform-api gRPC) | |
| Service discovery | AWS Cloud Map (Service Connect namespace) | Platform-api services |
| Database (legacy) | RDS SQL Server Standard | `db.r5d.4xlarge` class |
| Database (new) | Aurora PostgreSQL | Shared cluster for all platform-api domains |
| Cache | Couchbase on ECS + EFS → migrating to Valkey (ElastiCache) | |
| Streaming | Amazon Kinesis Data Streams | CDC events (Debezium → consumers) |
| CDC | Debezium Server (Fargate) | MSSQL connector, offset in DynamoDB |
| Queues | Amazon SQS | AccountSync bulk writes, dead-letter queues |
| Email | SES (ubi-mailer) | With SQS/SNS for events |
| Storage | S3 | Filedrop, filesystem, artifacts, CDC offsets |
| IaC | Terraform + Terragrunt | Infra repo uses plain TF; platform-api uses Terragrunt |
| CI/CD | GitHub Actions | workflow_dispatch for deploys |
| Monitoring | CloudWatch + Datadog | Metric alarms, synthetic monitoring |
| Secrets | AWS Secrets Manager + SSM Parameter Store | Cross-repo contract via SSM params |

### 4.2 Azure (Legacy — still in use)

| Component | Purpose |
|-----------|---------|
| Azure Storage (Blobs/Queues) | Email rendering pipeline, WebTracking, Webhooks |
| Azure WebJobs | Email rendering workers, WebTracking processors, Webhook outbound |
| Azure CDN | WebTracking script hosting |
| Azure EventHub | WebTracking raw data ingestion |
| Azure SQL | WebTracking summaries |
| Azure Redis | Throughput telemetry |
| Azure Key Vault | Secret management (link encryption keys, legacy secrets) |

### 4.3 Infrastructure Decomposition (In Progress)

The monolithic Terraform in `QT-Ubi-UbiquityBackend` is being split into independent stacks:

| Stack | Repo | Contents |
|-------|------|----------|
| `ubiquity-platform` | UbiquityInfra | VPC, RDS, Aurora, Valkey, ECR, ALB, ECS clusters, Service Connect |
| `u3` | Backend | EC2 ASG, IAM, security groups, log groups, Couchbase |
| `u3-services` | Backend | ECS task definitions, services, NLB target groups (changes every deploy) |
| `web` / `web-services` | Backend | Same pattern as u3 |
| `ubi-mailer` | Backend | SES, SQS, SNS, Route53, S3, IAM |
| `ubi-mailer-services` | Backend | Lambda functions |
| `common` | Backend | Filedrop S3 bucket, shared SSM parameters |

---

## 5. Key Subsystems

### 5.1 Job Processing Engine

Single-threaded-per-account-level scheduler. In production, all accounts share one thread (AccountLevel=Normal). Jobs implement `IJobImplementation.Tick()` and are processed in round-robin fashion.

**Job types by service:**
- List: ImportJob, BulkUpdateJob, DownloadQueryJob, CleanJob
- Mail: MailoutJob, RecurringMailoutJob, StaticMailoutJob
- TXT: TxtOutJob, RecurringTxtOutJob
- Push: NotificationJob, RecurringNotificationJob
- System: BillingCollatorJob

**SideLoad imports** bypass the job engine entirely, spawning unbounded threads (being fixed with semaphore limiting).

**Block size** (configurable in settings.xml) determines how much work happens per tick.

### 5.2 Email Sending Pipeline (SMTA)

1. Mailout triggered → Job engine processes in ticks
2. Email template (ESL) + customer data written to Azure Storage container
3. Azure WebJobs render individual emails (ESL → HTML with merged data)
4. Rendered emails written back to Azure blobs
5. Queue messages sent to SMTA with pointers to rendered emails
6. SMTA persists to `u3_smta` database, then sends via configured channel
7. Post-send: link clicks tracked via encrypted link URLs, delivery status via callbacks

**ESL (Engage Scripting Language):** Proprietary templating language for merge fields, conditionals, loops, RSS, JSON insertion.

### 5.3 DataFlow (CDC Pipeline)

```
MSSQL (u3_data) → CDC (transaction log)
    → Debezium Server (MSSQL connector)
    → Amazon Kinesis Data Streams
    → DataFlow.Worker (Transform, .NET Fargate)
    → Aurora PostgreSQL (with RLS)
    → DataFlow.Api (gRPC, read-only)
```

**Multiple consumers on the same Kinesis stream:**
- DataFlow.Worker — replicates to PostgreSQL
- AccountSync.Worker — propagates contact changes between accounts

### 5.4 Account Sync

Propagates contact/transaction changes between accounts in the same tree:
1. CDC event from Kinesis (skip if CallerType=AccountSync to prevent loops)
2. Match target contact via gRPC `FindByUniqueColumn`
3. Build write intent (INSERT or UPDATE)
4. Publish to SQS `list-service-bulk-writes`
5. Legacy list service polls SQS, executes bulk writes via TVP

### 5.5 Feature Flags

Per-account system stored in `u3_system`:
- `dbo.Feature` — global flag definition (State: Disabled/Enabled/EnabledGlobally, RolloutPercentage)
- `dbo.AccountFeature` — per-account overrides

Resolution precedence:
1. Feature disabled globally → OFF everywhere
2. Feature enabled globally → ON everywhere
3. AccountFeature row exists → use that
4. No override → MurmurHash3(featureId + rootAccountId) % 100 < RolloutPercentage

Consumed via:
- Next.js: server-side gRPC call (fail-safe closed)
- MVC: `[FeatureAccess]` attribute or inline `Remote<IFeatureManager>.Execute()`
- Python/Connectors: FastAPI dependency injection via gRPC

### 5.6 Session Management

- Sessions stored in-memory (`SessionServer` dictionary) + persisted to `u3_system.dbo.Session`
- One active session per user per browser (cookie-based)
- Each session has an "active account" — user works with one account at a time
- DataStoreItems (DSI): strongly-typed session state, BinaryFormatter-serialised, cached in Couchbase for 36 hours
- DSIs represent in-progress work (editing a mailout, designing a form) and are only saved to DB on explicit save

### 5.7 Filter Builder (SqlWriter)

Converts user-defined filter conditions into SQL statements:
- Different implementations per product (database, mail, survey, etc.)
- Fields → SELECT clause
- Tables behind fields → FROM clause
- Conditions → WHERE clause
- **High-risk area** — changes require thorough cross-product testing
- New platform-level filter builder being built for Next.js stack (FilterDefinition AST → SQL)

---

## 6. Data Flow Patterns

### 6.1 Contact Import Flow
```
CSV/API → u3_list service → SideLoad thread → bulk SQL INSERT into ListData_{account}
    → CDC event → Kinesis → DataFlow.Worker → Aurora PostgreSQL
    → (if sync rule exists) AccountSync.Worker → SQS → list service → target account
```

### 6.2 Email Send Flow
```
User triggers mailout → Job Engine (u3_mail) → ticks through recipient list
    → For each block: write customer data to Azure Queue
    → Azure WebJobs render (ESL + data → HTML)
    → Rendered email → Azure Blob
    → Queue message back to SMTA → writes to u3_smta DB
    → SMTA sends via configured channel (SES / direct SMTP)
    → Delivery status callbacks → update u3_data mail log tables
```

### 6.3 Form/Survey Submission Flow
```
Public link (encrypted) → form/survey rendered with layout + ESL
    → User submits → response written to u3_data (per-account table)
    → Triggered email fired (if configured) → enters Job Engine
    → Contact history updated (XyzUsage/XyzUsageData tables)
```

### 6.4 WebTracking Flow
```
JavaScript (Azure CDN) → SAS token from WebTracking WebAPI
    → Raw tracking data → Azure EventHub
    → WebJob 1: buffer → queue messages
    → WebJob 2: persist to Blob Storage, process goals, handle anonymisation
    → u3_webtracking service periodically pulls updates via API blobs
```

---

## 7. Security Model

### 7.1 Authentication
- Legacy: MD5 password hash salted with UserID
- Sessions: cookie-based, one session per browser
- API: token-based (stored in u3_system.dbo.Member with API authorization string)
- Platform API: session context passed via gRPC metadata

### 7.2 Data Isolation
- MSSQL: per-account tables with account-specific SQL user
- Aurora PostgreSQL: Row-Level Security (RLS) with `account_id = current_setting('app.current_account_id')`
- Account tree constraint: sync rules only between accounts in same tree

### 7.3 Link Encryption
- All tracked links encrypted with Rijndael symmetric encryption
- Link ID + message ID → encrypted GUID in URL
- Two key sets with rotation (old key retirement date in Key Vault)
- Decryption resolves: product, account, original URL, recipient

---

## 8. Deployment

### 8.1 Environments
- **Dev**: Individual AWS sandbox accounts per developer
- **QA/Test**: Shared environment (`qa.uq.nz`)
- **Staging**: Pre-production (`staging.ubiquity.co.nz`)
- **Production**: Live (`engage.ubiquity.co.nz`)

### 8.2 Deploy Process (Backend)
1. Build → container image pushed to ECR
2. Lambda ZIPs uploaded to S3 artifact cache
3. (Optional) Site down
4. Terraform plan/apply for infrastructure stacks
5. Database migrations via ephemeral SSM EC2 instance
6. ECS service update (rolling deployment)
7. Stability verification
8. (Optional) Site up

### 8.3 Deploy Process (Platform API)
1. Tag-driven (`{domain}/v{semver}`)
2. Verify ECR image exists
3. Terragrunt plan/apply for domain infrastructure
4. Schema migration via `aws ecs run-task` (ephemeral migrate container)
5. Terragrunt plan/apply for domain services
6. `aws ecs wait services-stable`

---

## 9. Approximation Strategy for Prototype

### What we CAN approximate in Supabase/Vercel:

| Real Component | Prototype Approximation |
|----------------|------------------------|
| u3_system accounts/sessions | Supabase auth + account context |
| u3_data per-account tables | Supabase tables with account_id column + RLS |
| Feature flags | Supabase table with same resolution logic |
| Filter builder | Client-side AST → Supabase PostgREST queries |
| Job engine | Simulated with state machine (no actual async processing) |
| CDC/Kinesis | Supabase realtime subscriptions (approximate) |
| Account sync | Supabase Edge Function triggered by DB changes |
| Email rendering (ESL) | Static templates with simple merge (no ESL engine) |
| gRPC services | Supabase Edge Functions or Next.js API routes |

### What we CANNOT approximate:

| Real Component | Why |
|----------------|-----|
| .NET Remoting | Proprietary protocol — no equivalent |
| ObjectSpace ORM | Custom code generation tool |
| ESL scripting language | Proprietary, complex |
| Azure email rendering pipeline | Distributed WebJob architecture |
| SMTA sending engine | Complex multi-channel delivery |
| Couchbase/DataStoreItem session model | Would need Redis + custom serialisation |
| Link encryption (Rijndael with rotating keys) | Security-sensitive, not needed for design |
| Windows containers / IIS | Different OS entirely |

### What we SHOULD model structurally:

1. **Account hierarchy** — root → child accounts, inheritance of settings
2. **Per-account data isolation** — RLS in Supabase mirrors the real pattern
3. **Service boundaries** — keep the domain separation (system, list, mail, etc.) visible
4. **Feature flags** — simple table + resolution logic
5. **Job states** — represent the concept of queued/running/complete jobs
6. **Filter definitions** — AST structure that could translate to real SQL
7. **IDSpace concept** — how objects are universally identified
8. **Navigation/permissions** — user types and what they can access

---

## 10. Key Constraints for Feature Design

When designing new features in the prototype, consider:

1. **Single-threaded job engine**: Long operations block others. New features that trigger long-running work need to consider queue priority.
2. **Per-account data isolation**: Every data query must be scoped to an account. Cross-account access only via explicit sync rules.
3. **Session model**: User works with one account at a time. Switching accounts affects all tabs.
4. **Schema system**: Adding filterable fields requires schema rebuilds (expensive, cached).
5. **Dependency tracking**: Services track dependencies between objects. Deleting something that's referenced elsewhere is blocked.
6. **ESL in everything**: Email templates, forms, surveys, events all use ESL. Any content rendering feature must consider ESL compatibility.
7. **Feature flags are per-account**: Rollout is controlled at account level, not user level.
8. **CDC latency**: Changes propagate to PostgreSQL/AccountSync within seconds, but it's eventually consistent — not synchronous.
9. **RemotingBridge bottleneck**: New services calling legacy must go through the bridge. Each call has serialisation overhead.
10. **Billing runs daily at 4:30am**: Usage data is aggregated nightly. Real-time billing is not available.
