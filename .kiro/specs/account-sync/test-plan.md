# Test Plan: Account Sync

> Author: James (Tester)
> Date: 2026-06-23
> Status: Draft — prototype testing scope
> Source: `.kiro/specs/account-sync/requirements.md` (18 user stories, EARS acceptance criteria)

---

## 1. Scripted Coverage Map

Each acceptance criterion from `requirements.md` mapped to a test scenario.

### US-5.1.1 — Access Control

| AC Reference | Test Scenario | Type | Automatable? |
|---|---|---|---|
| US-5.1.1 AC-1 | Navigate to Admin > Account Sync as global admin; verify page renders with rule count and active count summary | UI interaction | Yes |
| US-5.1.1 AC-2 | Attempt to access Account Sync page as non-global-admin; verify access denied | State management | Future (requires auth backend) |

### US-5.2.1 — Contact Sync Rule Creation

| AC Reference | Test Scenario | Type | Automatable? |
|---|---|---|---|
| US-5.2.1 AC-1 | Click "New Contact Sync" button; verify modal opens with all required fields (source, target, match key, column mapping, on-missing, trigger toggle) | UI interaction | Yes |
| US-5.2.1 AC-2 | Open creation modal; verify source account dropdown only shows accounts in active tree, excluding selected target | Validation | Yes |
| US-5.2.1 AC-3 | Open creation modal; verify target account dropdown only shows accounts in active tree, excluding selected source | Validation | Yes |
| US-5.2.1 AC-4 | Select same account for source and target; verify validation error "Source and target must be different accounts" | Validation | Yes |
| US-5.2.1 AC-5 | Select source and target accounts; verify match key dropdowns populate with respective schema columns | State management | Yes |
| US-5.2.1 AC-6 | Leave required fields incomplete; verify save button is disabled | Validation | Yes |
| US-5.2.1 AC-7 | Complete all required fields and click Create; verify rule appears in list with status "paused" | UI interaction | Yes |

### US-5.3.1 — Match Key Configuration

| AC Reference | Test Scenario | Type | Automatable? |
|---|---|---|---|
| US-5.3.1 AC-1 | Verify match key section requires exactly one source column and one target column selection | Validation | Yes |
| US-5.3.1 AC-2 | Verify descriptive text about uniqueness requirement is displayed in match key section | UI interaction | Yes |
| US-5.3.1 AC-3 | Select an account with no schema columns; verify match key dropdowns are disabled | State management | Yes |

### US-5.4.1 — Column Mapping

| AC Reference | Test Scenario | Type | Automatable? |
|---|---|---|---|
| US-5.4.1 AC-1 | Click "Add Column Mapping"; verify new empty mapping row appears with source/target dropdowns | UI interaction | Yes |
| US-5.4.1 AC-2 | Complete a mapping row (both columns selected); verify mapped count badge updates | State management | Yes |
| US-5.4.1 AC-3 | Click remove button on a mapping row; verify it is removed from the list | UI interaction | Yes |
| US-5.4.1 AC-4 | With no accounts selected; verify "Add Column Mapping" button is disabled | Validation | Yes |
| US-5.4.1 AC-5 | Save rule with incomplete mapping rows; verify only complete rows are persisted | Validation | Yes |

### US-5.5.1 — On-Missing Behaviour

| AC Reference | Test Scenario | Type | Automatable? |
|---|---|---|---|
| US-5.5.1 AC-1 | Verify on-missing section shows exactly two options: "Create new" and "Skip" | UI interaction | Yes |
| US-5.5.1 AC-2 | Select "Create new"; verify saved rule has onMissing = 'create' | State management | Future (requires backend) |
| US-5.5.1 AC-3 | Select "Skip"; verify saved rule has onMissing = 'skip' | State management | Future (requires backend) |
| US-5.5.1 AC-4 | Open new rule modal; verify on-missing defaults to "Create new" | State management | Yes |

### US-5.6.1 — Trigger on Mapped Only

| AC Reference | Test Scenario | Type | Automatable? |
|---|---|---|---|
| US-5.6.1 AC-1 | With toggle off (default); verify rule triggers on any change (backend behaviour) | Backend | Future |
| US-5.6.1 AC-2 | Enable toggle; verify rule only triggers on mapped column changes (backend behaviour) | Backend | Future |
| US-5.6.1 AC-3 | Open new rule modal; verify trigger-on-mapped-only toggle defaults to off | State management | Yes |

### US-5.7.1 — Contact Sync Rule Status Management

| AC Reference | Test Scenario | Type | Automatable? |
|---|---|---|---|
| US-5.7.1 AC-1 | Toggle paused contact rule to active; verify status changes to active | UI interaction | Yes |
| US-5.7.1 AC-2 | Toggle active contact rule to paused; verify status changes to paused and all child transaction rules cascade to paused | Cascade logic | Yes |
| US-5.7.1 AC-3 | Verify cascade: pausing contact rule sets all children to paused | Cascade logic | Yes |
| US-5.7.1 AC-4 | Resume contact rule; verify child transaction rules remain paused (no auto-resume) | Cascade logic | Yes |

### US-5.8.1 — Contact Sync Rule Editing

| AC Reference | Test Scenario | Type | Automatable? |
|---|---|---|---|
| US-5.8.1 AC-1 | Click edit on a contact rule; verify modal opens pre-populated with current configuration | UI interaction | Yes |
| US-5.8.1 AC-2 | Edit and save changes; verify rule updates and updatedAt timestamp changes | State management | Yes |
| US-5.8.1 AC-3 | Edit an active rule; verify status remains active after save | State management | Yes |

### US-5.9.1 — Contact Sync Rule Deletion

| AC Reference | Test Scenario | Type | Automatable? |
|---|---|---|---|
| US-5.9.1 AC-1 | Click delete on a contact rule; verify confirmation dialog appears with permanent deletion warning | UI interaction | Yes |
| US-5.9.1 AC-2 | Delete contact rule with child transaction rules; verify dialog warns about associated transaction rules being deleted | UI interaction | Yes |
| US-5.9.1 AC-3 | Confirm deletion of contact rule with children; verify contact rule AND all child transaction rules are removed | Cascade logic | Yes |
| US-5.9.1 AC-4 | Cancel deletion; verify dialog closes and rule remains unchanged | UI interaction | Yes |

### US-5.10.1 — Transaction Sync Rule Creation

| AC Reference | Test Scenario | Type | Automatable? |
|---|---|---|---|
| US-5.10.1 AC-1 | Click "Add Transaction Sync" on a contact rule; verify modal opens with source/target locked and labelled "Inherited from contact sync" | UI interaction | Yes |
| US-5.10.1 AC-2 | In transaction modal; verify source and target transactional list selectors are required | Validation | Yes |
| US-5.10.1 AC-3 | Select source/target lists; verify match key and column mapping dropdowns populate with list columns (not contact columns) | State management | Yes |
| US-5.10.1 AC-4 | With parent contact rule paused; verify "Add Transaction Sync" button is disabled with tooltip | UI interaction | Yes |
| US-5.10.1 AC-5 | Save transaction rule; verify parentRuleId is stored correctly | State management | Yes |
| US-5.10.1 AC-6 | Save transaction rule; verify it is created with status "paused" | State management | Yes |

### US-5.11.1 — Transaction Sync Rule Status Management

| AC Reference | Test Scenario | Type | Automatable? |
|---|---|---|---|
| US-5.11.1 AC-1 | Attempt to resume transaction rule whose parent is paused; verify resume is prevented | Cascade logic | Yes |
| US-5.11.1 AC-2 | Resume transaction rule with active parent; verify status changes to active | UI interaction | Yes |
| US-5.11.1 AC-3 | Pause an active transaction rule; verify status changes to paused | UI interaction | Yes |

### US-5.12.1 — Transaction Sync Rule Editing and Deletion

| AC Reference | Test Scenario | Type | Automatable? |
|---|---|---|---|
| US-5.12.1 AC-1 | Edit a transaction rule; verify modal opens with source/target accounts locked and pre-populated from parent | UI interaction | Yes |
| US-5.12.1 AC-2 | Delete a transaction rule; verify confirmation and only that rule is removed (parent and siblings remain) | UI interaction | Yes |

### US-5.13.1 — Loop Prevention

| AC Reference | Test Scenario | Type | Automatable? |
|---|---|---|---|
| US-5.13.1 AC-1 | Verify sync worker tags writes with CallerType = AccountSync | Backend | Future |
| US-5.13.1 AC-2 | Verify sync worker skips events tagged with CallerType = AccountSync | Backend | Future |
| US-5.13.1 AC-3 | Verify bidirectional sync (A→B and B→A) does not bounce back | Backend | Future |

### US-5.14.1 — Rules Display and Hierarchy

| AC Reference | Test Scenario | Type | Automatable? |
|---|---|---|---|
| US-5.14.1 AC-1 | Verify contact rules render as top-level cards within bordered containers | UI interaction | Yes |
| US-5.14.1 AC-2 | Verify transaction rules render indented beneath parent with left border | UI interaction | Yes |
| US-5.14.1 AC-3 | With no rules; verify empty state renders with explanatory text and create button | UI interaction | Yes |
| US-5.14.1 AC-4 | Verify page header shows total rule count and active count | UI interaction | Yes |

### US-5.15.1 — Excluded Caller Types

| AC Reference | Test Scenario | Type | Automatable? |
|---|---|---|---|
| US-5.15.1 AC-1 | Verify excluded caller types list causes matching events to be skipped | Backend | Future |
| US-5.15.1 AC-2 | Verify empty excluded list processes all non-AccountSync events | Backend | Future |

### US-5.16.1 — Audit Trail

| AC Reference | Test Scenario | Type | Automatable? |
|---|---|---|---|
| US-5.16.1 AC-1 | Verify sync writes create a history entry on target contact showing source account, action type, and timestamp | Backend | Future |

### US-5.17.1 — Tree Constraint Enforcement

| AC Reference | Test Scenario | Type | Automatable? |
|---|---|---|---|
| US-5.17.1 AC-1 | Verify account selectors only present accounts from the active account tree | Validation | Yes |
| US-5.17.1 AC-2 | Verify visible rules are filtered to those involving accounts in the active tree | State management | Yes |

### US-5.18.1 — Transaction Sync Prerequisite

| AC Reference | Test Scenario | Type | Automatable? |
|---|---|---|---|
| US-5.18.1 AC-1 | Verify transaction sync creation is only possible via "Add Transaction Sync" button on an existing contact rule | UI interaction | Yes |
| US-5.18.1 AC-2 | With no contact rules; verify no standalone transaction sync creation mechanism exists | UI interaction | Yes |

---

## 2. State Coverage

### Page States

| State | Condition | Expected |
|---|---|---|
| Empty | No sync rules exist for active tree | Empty state illustration, explanatory text, "Create Contact Sync" button |
| Populated | One or more rules visible | Rules list with contact rules at top level, transaction rules nested |
| Mixed visibility | Some rules involve accounts outside active tree | Only rules involving in-tree accounts are shown |

### Card States (SyncRuleCard)

| State | Visual Indicators |
|---|---|
| Active (contact) | Full opacity, hover shadow, green icon bg, switch ON |
| Paused (contact) | 60% opacity, secondary bg, no hover shadow, switch OFF |
| Active (transaction) | Full opacity, blue icon bg, switch ON, nested with left border |
| Paused (transaction, self-paused) | 60% opacity, switch OFF, can be resumed if parent active |
| Paused (transaction, parent-paused) | 60% opacity, switch DISABLED, "Parent paused" badge, tooltip on switch |
| Nested layout | Indented with left border, "Transaction Syncs" label above group |

### Modal States (CreateSyncRuleModal)

| State | Condition | Expected |
|---|---|---|
| New contact mode | Opened via "New Contact Sync" | Empty form, account pickers editable, title "New Contact Sync" |
| New transaction mode | Opened via "Add Transaction Sync" | Accounts locked with "Inherited from contact sync" badge, list selectors visible |
| Edit contact mode | Opened via Edit action | Pre-populated form, title "Edit Contact Sync" |
| Edit transaction mode | Opened via Edit action on transaction | Accounts locked, pre-populated lists and mappings |
| Validation error: same account | Source == target | Red error text below account selectors |
| Disabled save button | Missing required fields | Save/Create button disabled (not clickable) |
| No schema available | Account has no columns in schema | Match key dropdowns disabled, "Add Column Mapping" disabled |
| Column mapping empty | No mappings added | "0 mapped" badge, mapping section empty |
| Column mapping partial | Some rows incomplete | Badge shows only complete mapping count |

### Delete Dialog States

| State | Condition | Expected |
|---|---|---|
| Contact rule, no children | Deleting contact rule with 0 transaction children | Generic deletion warning about stopping propagation |
| Contact rule, with children | Deleting contact rule that has transaction children | Enhanced warning mentioning associated transaction rules will also be deleted |
| Transaction rule | Deleting a transaction rule | Generic deletion warning, no mention of children |
| Cancelled | User clicks cancel or closes dialog | Dialog closes, rule unchanged |

---

## 3. Exploratory Charters

### Charter 1: Cascade Semantics Under Rapid State Changes (Time + Function)

**Mission:** Explore how the cascade pause/resume logic behaves when the user performs rapid sequential actions.

**Duration:** 30 minutes

**Focus areas:**
- Pause a contact rule, then immediately try to resume a child transaction rule before the UI has fully updated
- Resume a contact rule, then rapidly toggle multiple child transaction rules
- Pause contact rule → delete a child → resume contact rule — does the deleted child reappear?
- Toggle a contact rule active/paused/active rapidly — do counters (active count) stay accurate?

**Oracle:** The active count in the page header should always match the actual number of rules with status "active". Cascade semantics should be deterministic regardless of action speed.

---

### Charter 2: Account Selector Boundaries and Data Integrity (Data + Structure)

**Mission:** Explore how the account selectors behave with unusual account tree configurations and edge-case data.

**Duration:** 25 minutes

**Focus areas:**
- Switch the active account tree while rules exist — do the visible rules update correctly?
- What happens if an account used in an existing rule is removed from the tree? (data consistency)
- Accounts with very long names — does the UI truncate gracefully in cards and comboboxes?
- Accounts with special characters in names
- What happens if the schema data for an account is empty or missing?

**Oracle:** Account selectors should only ever show in-tree accounts. UI should handle all string lengths without layout breakage.

---

### Charter 3: Modal Form Validation and Recovery (Function + Operations)

**Mission:** Explore edge cases in the creation/edit modal's validation logic and state persistence.

**Duration:** 30 minutes

**Focus areas:**
- Open modal, partially fill, close without saving, reopen — is state reset?
- Add 10+ column mappings — does the modal scroll correctly?
- Add mappings, then change the source account — do existing mappings become invalid?
- Select a source list, add mappings based on its columns, then change the source list — what happens to mappings?
- Create a rule with 0 column mappings (only match key) — is this allowed?
- Edit a rule and change only the on-missing toggle — verify no other fields are affected

**Oracle:** Modal should always reset to a clean state on open (new) or to the rule's current state (edit). Changing upstream selections should not leave orphaned or invalid downstream selections visible.

---

### Charter 4: Hierarchy Display at Scale (Platform + Structure)

**Mission:** Explore how the rules list renders and performs when many rules exist.

**Duration:** 20 minutes

**Focus areas:**
- Seed 10+ contact rules, each with 3-5 transaction children — does the page remain responsive?
- Scroll behaviour with many rules — does the layout remain stable?
- Visual hierarchy clarity — can a user quickly identify which transaction rules belong to which contact rule?
- Delete a contact rule in the middle of the list — does the remaining list re-render correctly with no visual glitches?
- Does the "Add Transaction Sync" button per contact rule remain correctly positioned after scrolling?

**Oracle:** The page should maintain visual hierarchy clarity and interactive responsiveness regardless of rule count. No layout shifts or orphaned visual elements.

---

## 4. Edge Cases

| # | Edge Case | Expected Behaviour | Priority |
|---|---|---|---|
| 1 | Same account selected for source and target | Validation error displayed, save button remains disabled | High |
| 2 | No schema available for selected account | Match key dropdowns disabled, "Add Column Mapping" disabled | High |
| 3 | Parent paused → try to resume child transaction rule | Switch disabled, tooltip "Resume the parent contact sync first" | High |
| 4 | Delete contact rule with multiple transaction children | Warning mentions associated rules, all children deleted on confirm | High |
| 5 | Create rule with 0 column mappings | Rule saves successfully — mappings are optional, only match key is required | Medium |
| 6 | Very long account names (truncation) | Names truncate with ellipsis in cards and combobox options; no layout overflow | Medium |
| 7 | Rapid toggle (pause/resume quickly on contact rule) | Final state is deterministic; cascade runs for each toggle; active count accurate | Medium |
| 8 | All rules paused → counter shows "0 active" | Page header subtitle reads "X sync rules · 0 active" | Medium |
| 9 | Switching active account tree while rules are displayed | visibleRules re-filters; rules for out-of-tree accounts disappear | Medium |
| 10 | Save with incomplete mapping rows (one column selected, other empty) | Incomplete rows silently discarded; only complete mappings saved | Medium |
| 11 | Open edit modal on active rule, change nothing, click save | Rule's updatedAt changes but status and config remain the same | Low |
| 12 | Delete all contact rules → page returns to empty state | Empty state component renders with create button | Low |
| 13 | Transaction list selector shows no options (account has no transactional lists) | Combobox shows empty state, save button disabled due to missing required field | Medium |
| 14 | Two contact rules between the same pair of accounts (different direction) | Both rules visible, independent cascade, no interference | Low |

---

## 5. Out of Scope / Accepted Risk

| Item | Reason for Exclusion | Risk Level |
|---|---|---|
| Loop prevention (CallerType tagging) | Requires backend sync worker — not testable in prototype | Accepted (architecture spec'd, verified at integration phase) |
| Audit trail creation | Requires backend write to contact timeline — no UI for this in prototype | Accepted (spec'd in requirements) |
| Excluded caller types configuration | Data model supports it but no UI input exists in the modal | Accepted (open question #2 in requirements) |
| Non-unique match key behaviour | Requires live data + backend logic to test | Accepted (open question #3) |
| Idempotency of sync writes | Backend behaviour — NFR-3 | Accepted (verified in integration tests) |
| SQS dead-letter retry logic | Infrastructure — NFR-2 | Accepted (verified in DevOps testing) |
| Role-based access control | Prototype does not enforce roles — all users see the page | Low risk (auth layer is separate concern) |
| Concurrent multi-user editing | Prototype is single-user session only | Accepted (standard for prototype phase) |
| Performance under 100K contact load | NFR-1 — requires backend with real data volume | Accepted (load testing phase) |
| Cross-browser rendering | Prototype tested in Chrome only | Low risk (standard Tailwind/React renders consistently) |

---

## 6. Release Recommendation (Prototype)

**Verdict: Ready for stakeholder demo and dev team handoff.**

The prototype demonstrates all user-facing interactions defined in the requirements:

- Rule creation (contact and transaction) with full modal workflow
- Cascade pause/resume semantics working correctly
- Cascade delete with appropriate confirmation dialogs
- Visual hierarchy (contact → transaction nesting) is clear and functional
- Empty state, validation states, and disabled states are all implemented
- Account tree filtering is operational

**Gaps noted for handoff documentation:**
- Excluded caller types has no UI (acknowledged as open question)
- Edit modal re-populates correctly but there is no visual diff / "unsaved changes" indicator
- The "Add Transaction Sync" disabled state tooltip requires hover — not keyboard accessible

**Recommendation:** Demo as-is. Include the gaps list in the dev handoff spec so the implementation team can address them during build.
