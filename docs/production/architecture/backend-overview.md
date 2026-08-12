# UbiQuity Backend — How It Works (Plain English)

> This document explains the UbiQuity backend in non-technical terms. For the full technical reference, see `backend-architecture.md`.

---

## What Is UbiQuity?

UbiQuity is a marketing automation platform. Businesses use it to:
- Store customer data (like a database of email addresses, names, preferences)
- Send emails, SMS messages, and push notifications to those customers
- Create web forms and surveys to collect data
- Track what customers do on websites
- Automate marketing campaigns (e.g., "send a welcome email 3 days after someone signs up")

Think of it as Mailchimp or HubSpot, but built specifically for New Zealand businesses and owned by Spark.

---

## The Big Picture

UbiQuity is made up of about 13 separate "services" that each handle one part of the product. They all talk to each other and share a central database. Imagine it like a business with specialist departments — there's a "Mail Department" that handles email, a "Database Department" that manages customer lists, a "System Department" that handles logins and accounts, and so on.

```
┌─────────────────────────────────────────────────────┐
│                   USERS                              │
│  (marketers logging in to manage campaigns)         │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              WEBSITE LAYER                           │
│  (what users see — the buttons, forms, dashboards)  │
│                                                     │
│  OLD: .NET MVC web app (legacy)                     │
│  NEW: Next.js app (modern, what we're building)     │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│           BACKEND SERVICES                          │
│  (the brains — 13 services doing the work)          │
│                                                     │
│  System, List, Mail, Survey, Forms, Events,         │
│  TXT, Push, WebTracking, Webhooks, SMTA...          │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              DATABASES                              │
│  (where everything is stored)                       │
│                                                     │
│  16+ SQL databases holding accounts, contacts,      │
│  emails, surveys, forms, tracking data...           │
└─────────────────────────────────────────────────────┘
```

---

## How Accounts Work

Every client (like Auckland Transport, or KiwiRail) has their own "account" in UbiQuity. Accounts are organised in trees:

```
Root Account (e.g., "KiwiRail")
├── Child Account (e.g., "KiwiRail Marketing")
└── Child Account (e.g., "KiwiRail HR")
```

**Key rules:**
- Each account has its own completely separate set of customer data. KiwiRail can never see Auckland Transport's customers.
- Settings flow downward — if the root account sets something, child accounts inherit it unless they override it.
- Users log in and work with one account at a time. They can switch between accounts they have access to.

---

## The Services — What Each One Does

### System (the foundation)
Everything else depends on this. It handles:
- User logins and sessions
- Account creation and management
- Permissions (who can do what)
- Billing calculations (runs at 4:30am every day)
- Feature flags (turning features on/off for specific accounts)

### List (customer data)
Manages the actual customer databases:
- Stores contacts (names, emails, phone numbers, custom fields)
- Handles imports (uploading CSV files of contacts)
- Manages "transactional data" (purchase history, event attendance)
- Processes bulk updates and downloads

### Mail (email campaigns)
Everything about sending emails:
- Creating and designing email templates
- Scheduling and sending mailouts
- Tracking opens, clicks, bounces
- Managing "triggered" emails (automated sends based on events)
- Automated/recurring mailouts

### SMTA (the sending engine)
The actual machinery that delivers messages:
- Renders personalised emails (inserts customer names, etc.)
- Sends emails, SMS, and push notifications
- Receives delivery status updates
- Manages sending speed and queues

### Survey, Forms, Events
Each handles its respective product:
- Creating and publishing surveys/forms/events
- Collecting responses
- Reporting on results
- Triggered emails (e.g., "send confirmation when form submitted")

### TXT and Push
SMS and mobile push notifications:
- Creating message campaigns
- Scheduling sends
- Tracking delivery

### WebTracking
Monitors what contacts do on client websites:
- JavaScript snippet on client's website sends data to Azure
- Matches web activity to known contacts
- Fires "goals" when specific pages are visited

### Webhooks
Sends data to external systems when things happen in UbiQuity:
- "When someone submits this form, send their data to Salesforce"
- Manages retries, rate limiting, and delivery tracking

---

## How Data Flows — Real Examples

### "I want to import 10,000 contacts from a CSV"

1. You upload the CSV file via the website
2. The **List service** creates an import job
3. The **Job Engine** picks it up (but it has to wait its turn — only one job runs at a time!)
4. A separate "SideLoad" thread does the heavy lifting — parsing rows and inserting into the database
5. Each contact gets stored in a per-account table (completely separate from other clients' data)
6. If Account Sync is configured, changes flow to related accounts within seconds via a CDC pipeline (Change Data Capture — it watches the database transaction log)

### "I want to send an email to 50,000 contacts"

1. You design the email using the template builder (with merge fields like `[First Name]`)
2. You click "Send" → a mailout job enters the Job Engine queue
3. The job works through the recipient list in "ticks" (blocks of contacts at a time)
4. For each block: customer data is sent to Azure cloud workers
5. Azure workers render each individual email (replacing merge fields with actual data)
6. Rendered emails come back and get queued for sending
7. The SMTA sends them out via the configured channel (currently Amazon SES)
8. Delivery receipts come back and update the mail log tables

### "I want to see who clicked a link in my email"

1. Every link in a sent email is encrypted and wrapped in a tracking URL
2. When someone clicks, UbiQuity decrypts the link to identify: which email, which recipient, which original URL
3. The click is logged in the mail events table
4. The contact is redirected to the actual destination URL
5. Reports aggregate these events for the campaign dashboard

---

## The Two Worlds: Old and New

UbiQuity is in transition. There are two technology stacks running side by side:

### The Old World (Legacy)
- Written in C# on .NET Framework 4.8 (started ~2007)
- Runs on Windows containers
- Services communicate using ".NET Remoting" (a Microsoft protocol from the early 2000s)
- Uses a proprietary ORM called "ObjectSpace" (custom-built, generates code from database schemas)
- Frontend is ASP.NET MVC with jQuery
- Hosted originally on-premises, then moved to AWS

### The New World (Platform API)
- Written in C# on .NET 10 (modern, cross-platform)
- Runs on Linux containers (cheaper, faster)
- Services communicate using gRPC (modern, efficient protocol)
- Uses Entity Framework Core (standard .NET ORM)
- Frontend is Next.js (React, what we're building the prototype in)
- Designed with proper domain separation

### The Bridge
A special service called "RemotingBridge" translates between the two worlds. When the new frontend needs data from an old service, it calls the bridge via gRPC, and the bridge translates that into the old Remoting protocol.

---

## Feature Flags — How Features Get Rolled Out

New features aren't turned on for everyone at once. The system supports:
- **Disabled globally**: Off for everyone, no exceptions
- **Enabled globally**: On for everyone, no exceptions
- **Percentage rollout**: Turned on for X% of accounts (deterministic — same accounts always get the same result)
- **Per-account override**: Manually enable or disable for specific accounts

This is how new features like "Connectors" get gradually rolled out without risk.

---

## The Job Engine — Why Things Queue

One of the most important things to understand: **long-running operations (imports, email sends, reports) all go through a single-threaded job queue.**

This means:
- If KiwiRail is importing 500,000 contacts, and Auckland Transport wants to send an email, AT has to wait
- Jobs work in "ticks" — small units of work — so they share time, but a large job still dominates
- This is being improved with priority scheduling and concurrency, but the constraint is real today

**Why this matters for design:** Any feature that triggers a long-running operation needs to consider that it will queue behind other work. The UI should show queue position and progress.

---

## Databases — Where Everything Lives

The main customer data database (`u3_data`) is unusual: **every account gets its own set of tables**.

If you have 200 accounts, there are 200+ `ListData_` tables, 200+ sets of stored procedures, etc. This provides strong isolation but makes cross-account queries impossible without the CDC replication pipeline.

The new PostgreSQL database (Aurora) takes a different approach: shared tables with a mandatory `account_id` column and Row-Level Security (RLS) that automatically filters queries to the current account.

---

## Infrastructure — Where It All Runs

**Current hosting:** AWS Sydney region

| What | Where |
|------|-------|
| Legacy backend services | Windows containers on AWS ECS (EC2) |
| New platform services | Linux containers on AWS Fargate |
| Main databases (MSSQL) | AWS RDS SQL Server |
| New databases (PostgreSQL) | AWS Aurora PostgreSQL |
| Email rendering | Azure WebJobs (legacy, still running) |
| Web tracking | Azure EventHub + WebJobs (legacy) |
| Email sending | Amazon SES |
| File storage | AWS S3 |
| Change Data Capture | Debezium → Amazon Kinesis |
| Infrastructure as Code | Terraform (+ Terragrunt for new services) |

The platform is mid-migration from Azure to AWS. Email rendering and web tracking still run on Azure, but new services are all AWS-native.

---

## What This Means for Our Prototype

### Things we model accurately:
- **Account hierarchy and data isolation** — our Supabase RLS mirrors the real pattern perfectly
- **Feature flags** — simple table + logic, same concept
- **Navigation and permissions** — user types, what they see
- **Filter builder** — the concept of building queries visually translates directly
- **Campaign/journey structure** — the workflows and states are the same

### Things we simulate (good enough for design):
- **Job processing** — we show queue states but don't actually run async jobs
- **Email rendering** — we show previews with simple merge, not full ESL
- **Data sync between accounts** — we can simulate the delay and eventual consistency
- **Billing** — we calculate in real-time rather than nightly batch

### Things we can't replicate (and don't need to):
- The actual email sending infrastructure
- The .NET Remoting protocol
- The proprietary ObjectSpace ORM
- Windows containers and IIS
- The Azure-based rendering pipeline
- Link encryption for tracking

### Key design constraints to keep in mind:
1. **Users work with one account at a time** — account switching is a deliberate action
2. **Long operations queue** — design should show progress and queue position
3. **Settings inherit** — child accounts get parent settings unless overridden
4. **Data is per-account** — never show cross-account data unless explicitly syncing
5. **Features roll out gradually** — always consider "what if this account doesn't have this feature yet?"
6. **Schema changes are expensive** — adding new filterable fields isn't free; it triggers rebuilds
7. **Billing is batch** — usage data is aggregated overnight, not in real-time

---

## Glossary

| Term | Meaning |
|------|---------|
| Account | A client's workspace in UbiQuity (e.g., "KiwiRail Marketing") |
| Root account | The top-level account in a client's hierarchy |
| ESL | Engage Scripting Language — the template language for emails/forms/surveys |
| IDSpace | A multi-part GUID that uniquely identifies any object in UbiQuity |
| ObjectSpace | The proprietary ORM (database access layer) |
| DataStoreItem (DSI) | Temporary session state (like a draft of work in progress) |
| SMTA | The sending engine for emails, SMS, and push |
| Tick | One unit of work in the job engine |
| Block size | How much work happens in one tick |
| GNA | Gone No Address — a contact marked as undeliverable |
| Migrate | A database schema change applied during deployment |
| Content push | Pushing configuration/definition data from code to database |
| Service schema | Metadata describing what's filterable in a service |
| Global schema | All service schemas for an entire account combined |
| CDC | Change Data Capture — watching the database transaction log for changes |
| RLS | Row-Level Security — database-enforced data isolation |
| RemotingBridge | Service that translates between old (Remoting) and new (gRPC) protocols |
| Debezium | Open-source tool that captures database changes and streams them |
| Kinesis | AWS service for streaming real-time data |
| Fargate | AWS serverless container hosting (no servers to manage) |
