# Account Sync — How It Works

A plain-English guide to the Account Sync feature for anyone who needs to understand what it does, why it exists, and how the pieces fit together.

---

## The Problem It Solves

UbiQuity supports multi-location businesses — a spa group with branches, a council with departments, a charity with programme teams. Each location (account) has its own contact database with its own column names and structure.

The problem: when Head Office updates a customer's details, those changes don't automatically flow to the branch accounts. Staff end up with stale data, or worse, manually re-entering changes across accounts.

**Account Sync fixes this.** It watches for changes in one account and automatically pushes them to another account — in near real-time, with no manual effort.

---

## The Core Concept: Sync Rules

A **sync rule** is a configured link between two accounts that says:

> "When data changes in Account A, push those changes to Account B."

Each rule specifies:

| Setting | What it means |
|---------|--------------|
| **Source account** | Where the change originates |
| **Target account** | Where the change gets pushed to |
| **Data type** | Contacts or Transactions |
| **Match key** | How to find the same person in both accounts (e.g. email address) |
| **Column mapping** | Which source fields map to which target fields |
| **On missing** | What to do if the person doesn't exist in the target yet (create them, or skip) |

### One-way only

Each rule is one-directional. If you want changes to flow both ways (Head Office ↔ Auckland), you create two separate rules.

### Tree constraint

Rules can only exist between accounts in the same "tree" (tenant). You can't sync between completely unrelated organisations.

---

## How Changes Flow

Here's the journey of a single contact update, in plain steps:

```
1. A staff member updates a contact in Account A (e.g. changes their phone number)

2. That change gets picked up by UbiQuity's change stream
   (a live feed of every database change, called CDC)

3. The Account Sync Worker sees the change and checks:
   "Are there any sync rules for Account A?"

4. For each matching rule, it:
   a. Extracts the match key value (e.g. the email address)
   b. Looks up the same person in Account B using that key
   c. Applies the column mapping to translate field names
   d. Sends a "write intent" to a queue

5. The legacy list service picks up the write intent and
   performs the actual database write in Account B

6. Done — the target account now has the updated data
```

### Why the queue?

The system doesn't write directly to the target database. Instead it puts a message on a queue (SQS), and a separate service does the actual write. This means:

- Bulk changes (like importing 100K contacts) don't overwhelm the system — they just queue up and get processed in efficient batches
- If a write fails, it retries automatically
- The sync worker stays fast and lightweight

---

## Loop Prevention

The obvious question: "If Account A syncs to Account B, and Account B syncs back to Account A... won't it loop forever?"

No. Every write made by Account Sync is tagged with `CallerType = AccountSync`. The sync worker **skips** any change that has this tag. So:

```
Account A change (CallerType = User)     → syncs to B ✓
Account B change (CallerType = AccountSync) → skipped ✓
```

Simple, reliable, no loops possible.

---

## Contact Sync vs Transaction Sync

### Contact Sync
Syncs the contact record itself — name, email, phone, preferences, etc.

### Transaction Sync
Syncs transactional data (bookings, purchases, event registrations) that belongs to a contact.

**Transaction sync requires a contact sync rule to exist first** for the same account pair. This is because transactions need to be linked to a contact in the target account — if the contact hasn't been synced yet, there's nowhere to attach the transaction.

Transaction rules are always tied to their parent contact rule:

- **Pausing** the contact rule automatically pauses all its transaction rules
- **Deleting** the contact rule deletes all its transaction rules
- **Resuming** the contact rule does NOT auto-resume transactions — they must be manually reactivated (this prevents accidental bulk resumption)
- A transaction rule **cannot be resumed** while its parent contact rule is paused

In the UI, transaction rules appear nested inside their parent contact rule's card. New transaction syncs are created via a button within the contact card, so the source/target account context is inherited automatically.

---

## Column Mapping — Why It's Needed

Different accounts often have different column names for the same data:

| Head Office | Auckland Branch | Wellington Branch |
|---|---|---|
| `email_address` | `email` | `email_address` |
| `first_name` | `given_name` | `first_name` |
| `phone_number` | `mobile` | `contact_phone` |
| `membership_tier` | `loyalty_level` | `tier` |

Column mapping tells the system: "When you see `phone_number` in the source, write it to `mobile` in the target."

Only mapped columns are synced. If a column isn't mapped, changes to it are ignored.

---

## Behaviour Options

### On Missing: Create vs Skip

- **Create**: If the person doesn't exist in the target account, create them as a new contact
- **Skip**: If the person doesn't exist in the target, do nothing (useful when you only want to keep existing shared contacts in sync, not replicate the entire database)

### Trigger on Mapped Only

- **Off** (default): Any change to a source contact triggers a sync, even if the changed column isn't mapped
- **On**: Only changes to mapped columns trigger a sync (reduces noise when source accounts have lots of activity on irrelevant fields)

### Excluded Caller Types

Optionally ignore changes from specific sources. For example, you might exclude `BulkImport` so that a big CSV import in the source doesn't flood the target with sync writes.

---

## What It Doesn't Do (v1 Limitations)

- **No deletes**: If you delete a contact in the source, it's NOT deleted in the target
- **No filtering**: All contacts that match the rule are synced — you can't say "only sync Gold members"
- **No backfill**: The system only syncs changes going forward. If you enable a rule today, existing contacts won't automatically appear in the target — you'd need to seed them via CSV import first
- **No cross-tenant sync**: Only accounts within the same organisation tree

---

## Who Can Configure It

Global administrators only (initial release). The page lives under **Admin → Account Sync**.

---

## The Audit Trail

Every synced contact gets a history entry visible in the contact timeline:

| Date | Application | Service | Action |
|---|---|---|---|
| 17 Jun 2026 13:20 | Database | Synced from Head Office | Inserted |
| 17 Jun 2026 13:20 | Database | Synced from Head Office | Updated |

So staff can always see where a change came from and when.

---

## Infrastructure (for the technically curious)

- **Event source**: Kinesis stream (shared with DataFlow — no extra cost)
- **Worker**: ECS Fargate, 0.5 vCPU, auto-scales 1–4 tasks based on lag
- **Config store**: PostgreSQL (rules, mappings, reference lookups)
- **Write queue**: SQS → legacy list service (batched TVP writes)
- **Throughput**: A 100K contact import processes in ~1–2 minutes via batching

---

## Quick Reference

| Term | Meaning |
|------|---------|
| Sync rule | A configured link: source account → target account |
| Match key | The column used to find the same person in both accounts |
| Column mapping | Source field → target field translation |
| CDC | Change Data Capture — the live stream of database changes |
| CallerType | A tag on every write that identifies who made the change |
| Reference mapping | Internal lookup table linking source contact IDs to target contact IDs |
| On missing | What happens when a synced contact doesn't exist in the target |
| TVP | Table-Valued Parameter — SQL Server's bulk write mechanism |
| DLQ | Dead Letter Queue — where failed messages go for investigation |
