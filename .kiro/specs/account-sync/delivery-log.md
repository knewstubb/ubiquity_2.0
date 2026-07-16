# Delivery Log — Account Sync

> Feature: Account Sync
> Status: Prototype complete — spec documentation outstanding
> Audit date: 2026-07-14
> Audited by: Gene (Delivery Lead)

---

## Audit Summary

The Account Sync feature has been built as a functional prototype and is working in the UI at `/admin/account-sync`. The prototype covers the full creation, editing, pausing, resuming, and deletion of both contact and transaction sync rules, including cascading behaviours and the nested parent/child relationship.

A reference document (`docs/account-sync-overview.md`) provides a thorough plain-English explanation of the feature's backend architecture, data flow, loop prevention, and v1 limitations. This document is well-written and would serve as a strong input to requirements authoring.

However, **no formal spec folder exists**. The feature has bypassed the standard spec structure entirely — there are no requirements, design, or task documents. This means the feature cannot be formally handed off to a development team without additional documentation work.

---

## What Exists

| Artifact | Location | Quality |
|----------|----------|---------|
| Plain-English overview (architecture + behaviour) | `docs/account-sync-overview.md` | Excellent — comprehensive, covers edge cases, limitations |
| Data model | `src/models/account-sync.ts` | Complete — all types well-defined |
| Seed data (6 schemas, 5 sync rules) | `src/data/account-sync.ts` | Good — demonstrates multiple scenarios |
| Page component | `src/pages/AccountSyncPage.tsx` | Complete — list view, empty state, cascading logic |
| SyncRuleCard component | `src/components/account-sync/SyncRuleCard.tsx` | Complete — status toggle, actions menu, nested display |
| CreateSyncRuleModal component | `src/components/account-sync/CreateSyncRuleModal.tsx` | Complete — full wizard: accounts, match key, column mapping, behaviour |
| Confluence backend spec | Referenced but not in codebase | Not assessed (external) |

## What's Missing

| Artifact | Status | Impact |
|----------|--------|--------|
| `requirements.md` | Does not exist | Cannot formally validate scope, AC, or success metrics |
| `design.md` | Does not exist | No UX state documentation, no architecture decision record for the prototype |
| `tasks.md` | Does not exist | No implementation checklist — though the prototype is already built |
| Route in App.tsx | Exists (`/admin/account-sync`) | Confirmed working |
| Nav entry | Under Admin dropdown | Confirmed accessible |

---

## Assessment

### Prototype Quality: Strong

The prototype demonstrates:
- Full CRUD lifecycle for sync rules
- Parent/child relationship (contact → transaction)
- Cascade behaviours (pause parent → pause children; delete parent → delete children)
- Resume constraint (can't resume child while parent paused)
- Column mapping with dynamic schema loading
- Proper form validation
- Empty states
- Confirm-before-delete with context-aware messaging

### Documentation Gap: Significant

The feature is well-built but undocumented in the spec structure. For handoff to a dev team, the following must be produced:

1. **requirements.md** — EARS-format acceptance criteria covering all user stories and edge cases
2. **design.md** — UX states, interaction patterns, architecture decisions (referencing the Confluence backend spec)
3. **tasks.md** — Not strictly needed since the prototype is complete, but useful as a retroactive record of what was built

---

## Task Assignments

### 1. PM (Marty) — Write `requirements.md`

**Priority:** High
**Input:** `docs/account-sync-overview.md`, the working prototype, Confluence backend spec
**Deliverable:** `.kiro/specs/account-sync/requirements.md`

Scope:
- Define user stories (global admin configuring sync rules)
- Write EARS acceptance criteria for:
  - Creating a contact sync rule (source/target selection, match key, column mapping, behaviour options)
  - Creating a transaction sync rule (inherits context from parent contact rule)
  - Editing an existing rule
  - Pausing/resuming rules (including cascade constraint)
  - Deleting rules (including cascade delete with confirmation)
  - "On missing" behaviour (create vs skip)
  - "Trigger on mapped only" behaviour
  - Excluded caller types
  - Loop prevention (CallerType tagging)
  - Tree constraint (only accounts in same tree)
  - Transaction rule requires parent contact rule
- Define success metrics
- Define explicit out-of-scope (per v1 limitations in overview doc):
  - No deletes propagation
  - No contact filtering
  - No backfill
  - No cross-tenant sync
- Define NFRs (throughput: 100K in 1-2 min, near real-time propagation)

### 2. Designer (Dieter) — Write `design.md` UX section

**Priority:** High
**Input:** Working prototype, `docs/account-sync-overview.md`
**Deliverable:** `.kiro/specs/account-sync/design.md` (UX section)

Scope:
- Document all UI states:
  - Page: populated list, empty state
  - Sync rule cards: active, paused, nested transaction, parent-paused constraint
  - Create modal: contact mode vs transaction mode, validation states, disabled states
  - Delete confirmation: standard vs cascade (with children warning)
- Document interaction patterns:
  - Toggle switch for pause/resume
  - Cascade behaviour (pause parent → pause children visually)
  - "Add Transaction Sync" contextual button
  - Column mapping add/remove rows
  - Account selection (can't select same source and target)
- Document responsive behaviour (if applicable)
- Document keyboard/a11y expectations (modal focus trap, escape to close)

### 3. Developer (Margaret) — Write `design.md` Architecture section

**Priority:** Medium
**Input:** `src/models/account-sync.ts`, `docs/account-sync-overview.md`, Confluence spec
**Deliverable:** `.kiro/specs/account-sync/design.md` (Architecture section, appended after UX)

Scope:
- Document data model decisions (SyncRule, ColumnMapping, AccountSchema)
- Document state management approach (local state in page component)
- Reference backend architecture from Confluence (CDC → Worker → SQS → Write)
- Document cascade logic implementation (pause/resume/delete)
- Document the prototype's data layer (seed data, no persistence)
- Note what would change for production (Supabase persistence, real schema API, real CDC integration)

### 4. Tester (James) — Write test plan outline

**Priority:** Low (post-requirements)
**Input:** `requirements.md` (once written), prototype
**Deliverable:** Test scenarios (can be added to `requirements.md` or separate)
**Blocked by:** Task 1 (requirements must exist first)

Scope:
- Identify key test scenarios from AC
- Note edge cases visible in prototype (same source/target prevention, empty column lists, parent-paused constraint)
- Flag any AC that require manual testing vs automatable

---

## Sequence

```
1. PM writes requirements.md (can start immediately — all inputs exist)
2. Designer writes design.md UX section (can start immediately — prototype is the reference)
3. Developer writes design.md Architecture section (can start in parallel with 2)
4. Tester reviews requirements + prototype for test plan (blocked by 1)
```

Tasks 1, 2, and 3 are parallelisable. Task 4 depends on Task 1 completion.

---

## Notes

- The `docs/account-sync-overview.md` file is an unusually strong input document. It covers the backend architecture, data flow, edge cases, and limitations in plain English. This should be referenced heavily in both requirements and design docs rather than duplicated.
- The Confluence page (referenced in the overview doc) contains the full technical backend spec. The PM and Developer should cross-reference it when writing their respective sections.
- No route or navigation changes are needed — the feature is already accessible under Admin → Account Sync.
- The prototype uses local state only (no Supabase persistence). This is acceptable for a prototype but should be noted in the design.md architecture section as a known gap.

---

## Open Questions

1. Should the living spec (`specs/product-spec.md`) be updated with an Account Sync entry once requirements are written? → **Yes, per convention, but only after requirements.md is complete.**
2. Does this feature have any tech debt entries to log? → **Not yet — the prototype is clean. Potential debt item: local-state-only persistence (no Supabase integration for this feature).**
3. Is there an ADO work item for this feature? → **Unknown. PM to confirm and link if so.**
