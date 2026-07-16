# Design: Account Sync

> Last updated: 2026-06-23
> Status: Documented from prototype
> Reference implementation: `/admin/account-sync`

---

## Design Goals

1. Make cross-account data synchronisation visible and manageable for global administrators
2. Communicate the parent-child relationship between contact and transaction sync rules through visual hierarchy
3. Ensure destructive or cascading actions are explicit — no silent side-effects
4. Keep the interface minimal: one page, no sub-navigation, cards + modal pattern

---

## Design Principles for This Feature

| Principle | Application |
|-----------|-------------|
| Progressive disclosure | Transaction rules only appear nested inside their parent contact rule — users don't see transaction configuration until a contact sync exists |
| Cascade transparency | Pausing/deleting a contact rule visually affects all children immediately — opacity dims, badges appear, switches disable |
| Context inheritance | Transaction modal inherits source/target from its parent contact rule and displays a locked, non-editable badge |
| Destructive safety | Every delete triggers a confirmation dialog with context-aware messaging (mentions child rules if applicable) |
| One-way directionality | Arrow iconography (→) reinforces that each rule is unidirectional |

---

## Screens & Components

### Page: Account Sync (`/admin/account-sync`)

**Layout:** Full-width (max 1440px), centred, standard page padding (py-7 px-6).

**Header:**
- Breadcrumb: Admin > Account Sync
- Title row: ArrowsClockwise icon (duotone, primary colour) + "Account Sync" (text-2xl semibold)
- Subtitle: "{n} sync rules · {n} active" (text-sm tertiary)
- Primary action: "New Contact Sync" button (top-right)

---

### State: Empty (no rules configured)

- Dashed border container (rounded-lg, bg-secondary/30)
- Centred content: circular icon holder (w-12 h-12, bg-secondary) with ArrowsClockwise icon
- Heading: "No sync rules configured" (text-sm font-medium)
- Description: "Create a contact sync rule to propagate data between accounts in this tree. Transaction syncs can be added once a contact sync exists." (text-xs muted)
- CTA: "Create Contact Sync" button (variant: outline, size: sm)

---

### State: Populated (rules exist)

Rules render as a vertical stack (gap-5) of **container cards**.

#### Container Card (one per contact rule)

- Outer wrapper: `border border-border rounded-xl bg-surface/50 p-4 space-y-3`
- Contains: 1 contact SyncRuleCard + nested transaction section

#### Nested Transaction Section

- Positioned inside the container card below the contact card
- Left border treatment: `ml-4 pl-4 border-l-2 border-border`
- Section label: "Transaction Syncs" (text-[10px] uppercase tracking-wide tertiary)
- Transaction SyncRuleCards stacked with gap-2
- "Add Transaction Sync" button at bottom of the bordered section

---

### Component: SyncRuleCard

A single-row card representing one sync rule. Renders identically for both contact and transaction rules with contextual differences.

**Base layout:** Flex row, items-center, gap-4, px-4 py-3, bg-surface, border, rounded-lg.

**Anatomy (left to right):**

1. **Icon** (w-8 h-8 rounded-md)
   - Contact: green background (`bg-success-subtle`), UsersThree icon (duotone)
   - Transaction: blue background (`bg-info-subtle`), NewspaperClipping icon (duotone)

2. **Direction label**
   - Contact rules: `{Source Account Name} → {Target Account Name}` (text-sm font-semibold)
   - Transaction rules (nested): `{Source List Name} → {Target List Name}` (text-sm font-semibold)
   - Arrow rendered with ArrowRight icon (14px, bold, muted)

3. **Badge row** (below direction label, mt-0.5)
   - Type badge: "Contacts" (variant: success-subtle) or "Transaction" (variant: info-subtle) — text-[10px]
   - Match key: "Match: {source} → {target}" (text-xs muted)
   - Column count: "· {n} columns mapped" (text-xs tertiary)

4. **Behaviour badges** (shrink-0, gap-1.5)
   - "Creates new" (variant: default-subtle) or "Skip missing" (variant: neutral-subtle)
   - "Mapped only" (variant: warning-subtle) — conditional, only when triggerOnMappedOnly is true
   - "Parent paused" (variant: neutral-subtle) — conditional, only when parent is paused and this rule is paused

5. **Toggle switch** (size: sm)
   - Active = checked (green), Paused = unchecked

6. **Three-dot actions menu** (DotsThree icon, 20px bold)
   - Menu items: Edit Rule, Pause/Resume, Delete Rule (destructive styling)

#### Card States

| State | Visual Treatment |
|-------|-----------------|
| **Active** | Full opacity, bg-surface, hover:shadow-md, hover:border-primary/40 |
| **Paused** | opacity-60, bg-secondary, border-border only, no hover shadow |
| **Paused + Parent paused** (transaction only) | Same as paused + switch disabled + "Parent paused" badge + tooltip on switch |

---

### Component: CreateSyncRuleModal

A dialog for creating or editing sync rules. Two modes: contact and transaction.

**Container:** Dialog (max-w-[680px], max-h-[85vh], flex column with scrollable body).

**Header:**
- Title: "New Contact Sync" / "Edit Contact Sync" / "New Transaction Sync" / "Edit Transaction Sync"
- Close button (X icon, top-right)

**Footer:**
- Cancel button (variant: secondaryGhost)
- Save button: "Create Contact Sync" / "Create Transaction Sync" / "Save Changes" — disabled until valid

---

#### Section: Source & Target

**Contact mode:**
- Grid layout: `[1fr auto 1fr]` — two Combobox pickers with ArrowRight icon between
- Source excludes the currently selected target from its options (and vice versa)
- Validation: if same account selected for both, destructive text appears: "Source and target must be different accounts."

**Transaction mode:**
- Locked display: single row with `bg-secondary/60 border rounded-md`, showing `{Source Name} → {Target Name}`
- Badge: "Inherited from contact sync" (variant: neutral-subtle, ml-auto)
- Not editable — context inherited from parent contact rule

---

#### Section: Transactional Lists (transaction mode only)

- Separated with `border-t` and `pt-5`
- Heading: "Transactional Lists"
- Description: "Select the source and target transactional lists to sync between."
- Two-column grid: Source List combobox + Target List combobox

---

#### Section: Match Key

- Separated with `border-t` and `pt-5`
- Heading: "Match Key"
- Description text differs by mode:
  - Contact: "The column used to find the corresponding contact in the target. Must be unique in the target account."
  - Transaction: "The column used to identify the same transaction in both lists."
- Grid layout: `[1fr auto 1fr]` — Source Column combobox, arrow, Target Column combobox
- Column options are dynamically populated from the selected account's schema (or selected list's columns for transactions)

---

#### Section: Column Mapping

- Separated with `border-t` and `pt-5`
- Header row: section title + "{n} mapped" badge (neutral-subtle)
- Description: "Map source columns to their corresponding target columns. Unmapped columns will not be synced."
- Column headers: "Source" and "Target" (text-[10px] uppercase tracking-wide tertiary)
- Each row: Source combobox → ArrowRight (12px) → Target combobox → Trash button (remove)
- Add button: "Add Column Mapping" (variant: outline, size: sm, Plus icon)
- Add button disabled when no columns are available (accounts/lists not yet selected)

---

#### Section: Behaviour

- Separated with `border-t` and `pt-5`

**On Missing (segmented toggle):**
- Label: "When target contact not found" (contact mode) / "When target transaction not found" (transaction mode)
- Two-option segmented button: "Create new" | "Skip"
- Active segment: bg-background, text-primary, shadow-sm
- Inactive segment: text-muted-foreground, hover:text-foreground

**Trigger on Mapped Only (switch):**
- Label: "Only trigger when mapped columns change" (text-sm font-medium)
- Description: "If enabled, changes to unmapped columns will not propagate." (text-xs muted)
- Switch (size: sm) on the right

---

#### Validation Rules

| Condition | Effect |
|-----------|--------|
| Source + Target both selected and different | Required for save |
| Match key source + target both selected | Required for save |
| Source list + Target list selected (transaction only) | Required for save |
| All conditions met | Save button enabled |
| Any condition unmet | Save button disabled |

---

### Component: AlertDialogComposed (Delete Confirmation)

- Intent: destructive
- Title: "Delete contact sync rule?" or "Delete transaction sync rule?"
- Confirm label: "Delete"

**Body copy (context-aware):**
- Contact rule with children: "This will permanently remove the contact sync rule and all associated transaction sync rules. Data propagation between these accounts will stop immediately."
- Contact rule without children / Transaction rule: "This will permanently remove the sync rule and stop data propagation for this table between these accounts."

---

## Interactions

### Toggle Switch (Pause/Resume)

| Action | Behaviour |
|--------|-----------|
| Toggle contact rule OFF | Rule pauses; all child transaction rules cascade to paused state |
| Toggle contact rule ON | Rule resumes; child transaction rules remain paused (manual reactivation required) |
| Toggle transaction rule OFF | Rule pauses independently |
| Toggle transaction rule ON (parent active) | Rule resumes |
| Toggle transaction rule ON (parent paused) | Switch is disabled; tooltip appears: "Resume the parent contact sync first" |

### Delete

- Click "Delete Rule" in dropdown menu → AlertDialogComposed opens
- Confirm → rule removed from state (and children if contact rule)
- Cancel / close → dialog dismissed, no action

### Add Transaction Sync

- Button rendered inside each contact container card's bordered section
- Click opens CreateSyncRuleModal in transaction mode with parentRule context
- Button is disabled when parent contact rule is paused
- Disabled state shows native title tooltip: "Resume the contact sync before adding transaction syncs"

### Modal Behaviour

- Opens as an overlay Dialog
- Scroll: body section scrolls independently (overflow-y-auto), header and footer fixed
- Close: X button or Cancel button dismisses
- Overlay click: does NOT dismiss (Dialog default for forms)
- Save: closes modal + adds/updates rule in state
- New rules start in "paused" status by default

### Account Selection (Contact Mode)

- Source combobox filters out the currently selected target account
- Target combobox filters out the currently selected source account
- If user somehow selects the same account: destructive validation message appears below the picker row

### Three-dot Menu

- Trigger: DotsThree icon button
- Menu items:
  - Edit Rule (PencilSimple icon) → opens CreateSyncRuleModal in edit mode
  - Pause / Resume (Pause or Play icon) → same behaviour as toggle switch
  - Separator
  - Delete Rule (Trash icon, destructive styling) → opens AlertDialogComposed
- "Pause/Resume" menu item is disabled when toggle would be disabled (transaction rule with paused parent)

---

## Cascade Behaviours (Visual Summary)

| Trigger | Visual Effect |
|---------|--------------|
| Contact rule paused | All nested transaction cards dim (opacity-60, bg-secondary, no hover shadow) |
| Contact rule resumed | Children remain dimmed (not auto-resumed) |
| Contact rule deleted | Confirmation mentions children; all children removed from DOM |
| Transaction rule paused (parent active) | Only that card dims |
| Transaction rule resumed | That card returns to full opacity |

---

## Accessibility Notes

- **Keyboard navigation:** All interactive elements (switches, buttons, comboboxes, dropdown menu items) are focusable via Tab
- **Switch disabled state:** When a transaction rule's switch is disabled, a Tooltip provides explanation ("Resume the parent contact sync first") — accessible via focus on the wrapping div
- **Dropdown menu:** Uses Radix DropdownMenu primitives — Escape closes, arrow keys navigate items
- **Dialog (modal):** Focus trapped inside when open; Escape does not dismiss (form protection); initial focus on first interactive element
- **Delete confirmation:** AlertDialog pattern — focus moves to dialog on open, returns to trigger on close
- **Icon semantics:** Icons are decorative (adjacent text provides meaning); action buttons have aria-label="Sync rule actions"
- **Badge semantics:** Badges are inline text — no special ARIA role needed
- **Form validation:** Save button disabled state communicates via `disabled` attribute; no error toast needed (visual state is sufficient for this prototype)

---

## Design Decisions & Alternatives

| Decision | Rationale | Alternative Considered |
|----------|-----------|----------------------|
| Container card wraps contact + children | Creates clear visual grouping of related rules; separates unrelated account pairs | Flat list with indent only — rejected: too subtle, loses grouping on scan |
| Left border-line for nested transactions | Standard hierarchy indicator (similar to threaded comments); cheap, clear | Tree lines with connectors — rejected: over-engineered for 1–3 children max |
| Toggle cascades pause but not resume | Prevents accidental bulk resumption of transaction syncs that may have been individually paused for good reasons | Auto-resume children on parent resume — rejected: dangerous for data integrity |
| "Add Transaction Sync" inside the container | Reinforces that transactions belong to a specific contact pair; inherits context naturally | Top-level "New Transaction Sync" button with parent picker — rejected: extra step, loses spatial context |
| New rules start paused | Safe default — user must explicitly activate after reviewing configuration | Start active immediately — rejected: risk of unintended data propagation before review |
| Source/target pickers exclude each other | Prevents impossible same-account configuration at selection time rather than only at save | Allow selection, validate at save — rejected: worse UX, fixable earlier |
| Locked source/target in transaction modal | Transaction rules must inherit the account pair from their parent — editing would break the hierarchy | Allow override — rejected: violates domain model constraint |
| No bulk actions | Feature targets small rule counts (typically 2–10 per tree); bulk operations add complexity without value | Multi-select + bulk pause/delete — deferred: add if usage patterns justify |
| Single page, no tabs | Rule count is low; all rules visible at once aids comprehension | Tabs for contact vs transaction — rejected: breaks the visual parent-child relationship |


---

## Architecture

### Overview

Account Sync is a rule-based data propagation feature that keeps contact and transaction records synchronised between accounts within the same account tree. The prototype implements a fully interactive UI layer with local state management and seed data to simulate real-world schema diversity. The production architecture (designed but not built) uses CDC via Kinesis, an ECS-hosted worker, and SQS-backed writes through the existing list service.

---

### System Context

#### Prototype (what exists)

The prototype is a client-side React application with no backend. All state is held in `useState` within the page component, seeded from static TypeScript data files. This approach enables rapid iteration on UX flows without infrastructure dependencies.

```
┌───────────────────────────────────────────────────────┐
│  Browser                                               │
│                                                        │
│  AccountSyncPage (useState: rules[])                   │
│    ├── SyncRuleCard × n                                │
│    ├── CreateSyncRuleModal                             │
│    └── AlertDialogComposed                             │
│                                                        │
│  Seed data: accountSchemas[], syncRules[]              │
│  Context: AccountContext (tree filtering)              │
└───────────────────────────────────────────────────────┘
```

#### Production (what's designed)

```
┌──────────────┐    CDC     ┌───────────────────┐    SQS     ┌──────────────────┐
│  Source DB   │──────────→ │  Kinesis Stream   │──────────→ │  AccountSync     │
│  (contact/   │            │  (shared w/       │            │  Worker (ECS     │
│   transaction)│            │   DataFlow)       │            │   Fargate)       │
└──────────────┘            └───────────────────┘            └────────┬─────────┘
                                                                      │
                                                              gRPC FindByUniqueColumn
                                                                      │
                                                              ┌───────▼─────────┐
                                                              │  Legacy List    │
                                                              │  Service (TVP   │
                                                              │  batch writes)  │
                                                              └────────┬────────┘
                                                                       │
                                                              ┌────────▼────────┐
                                                              │  Target DB      │
                                                              └─────────────────┘

Config store: PostgreSQL (sync_rules, column_mappings, reference_mappings)
Loop prevention: CallerType = 'AccountSync' tag on every write; worker skips tagged changes
```

---

### Components

#### Page Layer

| Component | Role | Location |
|-----------|------|----------|
| `AccountSyncPage` | Orchestrator — owns rules state, cascade logic, modal lifecycle, delete confirmation | `src/pages/AccountSyncPage.tsx` |
| `EmptyState` | Inline presentational component for zero-rules state | Same file (not exported) |

#### Feature Components

| Component | Role | Location |
|-----------|------|----------|
| `SyncRuleCard` | Presentational card for a single rule — renders status, direction, badges, actions menu | `src/components/account-sync/SyncRuleCard.tsx` |
| `CreateSyncRuleModal` | Form logic for create/edit — handles context-aware field population, column mapping rows, validation | `src/components/account-sync/CreateSyncRuleModal.tsx` |

#### Shared/Library Components Used

| Component | Source | Usage |
|-----------|--------|-------|
| `Dialog`, `DialogContent`, `DialogHeader`, `DialogBody`, `DialogFooter`, `DialogTitle` | `@/components/ui/dialog` | Modal container |
| `Combobox` | `@/components/ui/combobox` | Account picker, column picker, list picker |
| `Switch` | `@/components/ui/switch` | Active/paused toggle |
| `Badge` | `@/components/ui/badge` | Status and behaviour indicators |
| `Button` | `@/components/ui/button` | Actions |
| `AlertDialogComposed` | `@/components/composed/alert-dialog-composed` | Delete confirmation |
| `Breadcrumb` family | `@/components/ui/breadcrumb` | Navigation context |

#### Context Dependencies

| Context | Purpose |
|---------|---------|
| `AccountContext` | Provides `accounts` (all accounts) and `accountsInActiveTree` (tree-filtered subset) for rule visibility and account picker options |

---

### Data Model

#### Core Interfaces (`src/models/account-sync.ts`)

```typescript
SyncRule {
  id: string
  sourceAccountId: string
  targetAccountId: string
  tableType: 'contact' | 'transaction'
  sourceListName?: string          // Transaction rules only
  targetListName?: string          // Transaction rules only
  parentRuleId?: string            // Transaction → parent contact rule
  matchColumnSource: string
  matchColumnTarget: string
  onMissing: 'create' | 'skip'
  triggerOnMappedOnly: boolean
  excludedCallerTypes: string[]
  columnMappings: ColumnMapping[]
  status: 'active' | 'paused'
  createdAt: string
  updatedAt: string
}

ColumnMapping {
  id: string
  sourceColumn: string
  targetColumn: string
}

AccountSchema {
  accountId: string
  contactColumns: string[]
  transactionalLists: TransactionalList[]
}

TransactionalList {
  id: string
  name: string
  columns: string[]
}
```

#### Key Relationships

- **parentRuleId**: Transaction rules reference their parent contact rule. This creates a strict hierarchy: a transaction sync can only exist when a contact sync exists for the same source → target account pair. The parent relationship drives cascade behaviour (pause parent → pause children; delete parent → delete children).

- **accountSchemas pattern**: Each account has a unique schema defining its available contact columns and transactional lists. In the prototype, these are hardcoded in `src/data/account-sync.ts` to simulate the real-world scenario where different accounts have different column names for the same conceptual data (e.g. `email_address` vs `email` vs `email`). In production, these would come from a real-time schema API.

#### Seed Data (`src/data/account-sync.ts`)

The seed data provides:
- **6 account schemas** across two account trees (Serenity Spa Group + Christchurch City Council) — each with distinct column naming to demonstrate mapping complexity
- **5 sync rules** covering: parent-to-child, sibling, grandchild, transaction (nested), and paused rule states

---

### State Management

#### Page-Level State

```typescript
// In AccountSyncPage
const [rules, setRules] = useState<SyncRule[]>(seedRules);        // All rules
const [modalContext, setModalContext] = useState<ModalContext | null>(null);  // Modal open state + context
const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null); // Delete confirmation target
```

#### Derived State

- `treeAccountIds` — Set of account IDs in the active tree (from AccountContext)
- `visibleRules` — rules filtered to those involving accounts in the active tree
- `contactRules` — visible rules where `tableType === 'contact'`
- `transactionRules` — visible rules where `tableType === 'transaction'`

#### Cascade Logic

| Trigger | Behaviour | Implementation |
|---------|-----------|----------------|
| Pause contact rule | All child transaction rules cascade to paused | `handleToggleContactStatus`: maps over all rules, sets status to `'paused'` where `parentRuleId` matches |
| Resume contact rule | Only the contact rule resumes; children stay paused | Same handler: `newStatus === 'paused'` condition gates the cascade |
| Resume transaction rule | Blocked if parent is paused | `handleToggleTransactionStatus`: looks up parent, returns early if parent is paused |
| Delete contact rule | Contact rule + all child transaction rules removed | `handleDelete`: filters out rule AND all rules with matching `parentRuleId` |
| Delete transaction rule | Only that rule removed | Same handler: simple filter by ID |

#### Modal Context

```typescript
interface ModalContext {
  tableType: SyncTableType;
  parentRule?: SyncRule;   // For transaction modals — provides locked source/target
  editRule?: SyncRule;     // Editing an existing rule
}
```

The modal context determines:
- Whether source/target pickers are editable (contact) or locked (transaction)
- Which column sets to load from accountSchemas
- Whether transactional list selectors appear
- The save button label and modal title

#### Tree Filtering

Rules are filtered by the active account tree (from `AccountContext`). A rule is visible if either its `sourceAccountId` or `targetAccountId` is in the current tree. This means switching trees in the account switcher immediately filters the rule list — no reload needed.

---

### Production Architecture (Designed, Not Built)

Based on the [overview doc](../../docs/account-sync-overview.md), the production system would work as follows:

#### Event Pipeline

1. **CDC source**: Changes to contact/transaction tables emit events to a Kinesis stream (shared with DataFlow — no additional infrastructure cost)
2. **AccountSync Worker** (ECS Fargate, auto-scales 1–4 tasks): consumes from Kinesis, evaluates sync rules, resolves target contacts via gRPC `FindByUniqueColumn`, and enqueues write intents to SQS
3. **Legacy List Service**: Dequeues from SQS and performs batched TVP writes to the target database

#### Persistence Layer

| Table | Purpose |
|-------|---------|
| `sync_rules` | Rule configuration (source, target, match key, behaviour settings) |
| `column_mappings` | Source → target column translations per rule |
| `reference_mappings` | Source contact ID → target contact ID lookup cache (built on first match, speeds subsequent syncs) |

#### Loop Prevention

Every write made by the AccountSync Worker is tagged with `CallerType = 'AccountSync'`. The worker skips any CDC event that carries this tag, breaking any potential A→B→A loop.

#### What Would Change from Prototype to Production

| Concern | Prototype | Production |
|---------|-----------|------------|
| Rule storage | `useState` seeded from static TypeScript | PostgreSQL `sync_rules` + `column_mappings` tables |
| Schema discovery | Hardcoded `accountSchemas` array | Real-time API: fetch actual account columns per account |
| Rule CRUD | Immediate state mutation | API calls to a rules management service |
| Cascade enforcement | Client-side state mapping in handlers | Backend enforces cascade (pause/delete propagation) with DB constraints |
| Data sync execution | Not implemented (UI-only) | CDC → Worker → SQS → List Service pipeline |
| CallerType filtering | Simulated via `excludedCallerTypes` field in UI | Worker-level filtering on CDC event metadata |
| Status persistence | Lost on page refresh | Database-backed, survives deploys |

---

### Trade-offs & Alternatives

| Decision | Chosen | Alternative | Rationale |
|----------|--------|-------------|-----------|
| Local state vs Supabase persistence | Local `useState` | Supabase tables for rules | Prototype speed — no migration needed, instant iteration. Trade-off: state lost on refresh. |
| Dynamic schema from seed data vs API | Hardcoded `accountSchemas` | Supabase schema API or dynamic fetch | Demonstrates the UX of heterogeneous schemas without backend dependency. Realistic column names prove the mapping UI works. |
| Cascade in UI state vs backend enforcement | UI-only (handler logic) | Server-side cascade with DB triggers/constraints | Prototype doesn't need durability. Demonstrates the correct cascade UX for stakeholder review. |
| Container card pattern vs flat list | Container cards with nested sections | Flat list with indent markers | Container cards create scannable groupings. At typical rule counts (2–10), a flat list would lose visual hierarchy. |
| New rules start paused vs active | Paused | Active | Safe default — prevents unintended data propagation before the user reviews the full configuration. |
| Single page vs tabbed interface | Single page | Tabs: Contacts / Transactions | Rule count is low; tabs would break the parent-child visual relationship that's central to comprehension. |

---

### Open Questions

1. **Backfill strategy**: When a new rule is created in production, should there be a one-time backfill of existing contacts, or only forward-looking sync? The overview doc states no backfill in v1 — confirm this is acceptable for launch.
2. **Schema caching**: How frequently should the UI refresh account schemas? Schemas change rarely (field additions) but stale schemas would cause mapping failures.
3. **Conflict resolution**: If the same contact is modified in both source and target simultaneously (before sync completes), which write wins? Current design is last-write-wins via the queue ordering.
4. **Rule limits**: Should there be a cap on rules per account tree? At scale, many rules could create write amplification via the queue.
5. **Audit visibility**: The overview doc mentions a contact timeline entry for synced changes — should the sync rule management page also surface recent sync activity (success/failure counts)?
