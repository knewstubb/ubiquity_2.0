# Configurable Data Deletion

> **Status:** Discovery
> **Last updated:** 2026-08-11
> **Priority:** High (operational pain — currently requires dev team involvement)
> **Pain source:** User feedback — "I can't automate my data retention policy" (mapped to "reduce dev reliance")

---

## Outcome

> Give customers self-service control over data retention and deletion so they don't need to involve our team for routine cleanup.

Customers need to:
- Delete contacts who haven't engaged in X months
- Delete old transactional data beyond a retention period
- Comply with data minimisation requirements (GDPR, Privacy Act)
- Clean up test data or duplicates
- Remove contacts at their request (right to erasure)

**Currently:** Customers contact our team, we run manual scripts. This doesn't scale and creates compliance risk (delays in responding to erasure requests).

---

## Information Gaps

### Current State (Partially Known)

| Question | Status | What We Know |
|----------|--------|--------------|
| What deletion requests does our team handle today? | ⚠️ Partial | User feedback suggests "a lot" — need volume data |
| How long does a typical deletion request take? | ❓ Unknown | Days? Hours? |
| What's the SLA expectation for GDPR erasure requests? | ⚠️ Partial | GDPR: "without undue delay" and within 1 month |
| What data types do customers most often want to delete? | ❓ Unknown | Contacts? Transactions? Mail history? |
| What criteria do they use? | ❓ Unknown | Age? Engagement? Specific contacts? |

### Technical Architecture (Partially Known)

| Question | Status | What We Know |
|----------|--------|--------------|
| Is there a soft-delete mechanism today? | ❓ Unknown | Need backend audit |
| What cascade behaviours exist on contact delete? | ❓ Unknown | Transactions? Mail history? Form responses? |
| Is deletion auditable? | ⚠️ Partial | ServiceHistory exists but may not cover deletions |
| How does deletion interact with AccountSync? | ✅ Known | **AccountSync v1 does NOT propagate deletes** |
| What's the job queue impact of bulk deletions? | ⚠️ Partial | Bulk operations go through job engine |
| Is there a "recycle bin" or undo period? | ❓ Unknown | Need backend audit |

### Compliance Requirements (Partially Known)

| Question | Status | What We Know |
|----------|--------|--------------|
| NZ Privacy Act requirements? | ⚠️ Partial | Principle 9: Agencies must not keep personal info longer than needed |
| AU Privacy Act requirements? | ⚠️ Partial | APP 11: Agencies must destroy or de-identify when no longer needed |
| GDPR Art. 17 (Right to Erasure)? | ⚠️ Partial | Must delete "without undue delay" when requested |
| What constitutes "deletion" vs "anonymisation"? | ❓ Unknown | Is soft-delete sufficient? |
| Audit trail requirements for deletions? | ❓ Unknown | Must we prove what was deleted and when? |

### Customer Requirements (Unknown)

| Question | Status | How to Validate |
|----------|--------|-----------------|
| What retention periods do customers typically want? | ❓ Unknown | Customer interviews |
| Do they want scheduled/automated deletions? | ❓ Unknown | Customer interviews |
| Do they need ad-hoc deletion (select contacts → delete)? | ⚠️ Likely | Industry standard |
| Do they need filter-based deletion (delete all matching X)? | ❓ Unknown | Customer interviews |
| Do they want soft-delete with recovery period? | ❓ Unknown | Customer interviews |
| What data do they want to preserve vs delete? | ❓ Unknown | Aggregate stats? Audit logs? |

### Multi-Account Complexity (Known Gap)

| Question | Status | What We Know |
|----------|--------|--------------|
| How does deletion work in multi-account setups? | ⚠️ Gap | AccountSync v1 does NOT propagate deletes |
| If HQ deletes a contact, what happens in branches? | ❓ Unknown | Currently nothing |
| Should deletion cascade via AccountSync? | ❓ Unknown | Architecture decision |
| What if branches have the contact but HQ doesn't? | ❓ Unknown | Orphan handling |

---

## Potential Capability Layers

Based on common patterns in the space:

### Layer 1: Right to Erasure (Individual Deletion)

**Use case:** A contact requests deletion of their data (GDPR Art. 17)

| Capability | Notes |
|------------|-------|
| Delete single contact by ID/email | Immediate action |
| Cascade to transactions | Configurable per account |
| Cascade to mail history | Configurable per account |
| Cascade to form submissions | Configurable per account |
| Audit trail of deletion | Prove compliance |
| Confirmation workflow | "Are you sure?" with impact preview |

**Effort:** Medium

### Layer 2: Bulk Deletion (Filter-Based)

**Use case:** Delete all contacts matching a filter (e.g., "not engaged in 2 years")

| Capability | Notes |
|------------|-------|
| Use filter builder to define criteria | Reuse existing UI |
| Preview count before execution | "This will delete 12,453 contacts" |
| Job queue execution | Bulk operations are long-running |
| Progress tracking | "Deleted 5,000 of 12,453" |
| Cancellation | Stop mid-job if needed |
| Audit trail | Record criteria + result |

**Effort:** Medium-High (job engine integration)

### Layer 3: Scheduled Retention Policies

**Use case:** "Automatically delete contacts with no activity after 36 months"

| Capability | Notes |
|------------|-------|
| Define retention rules | Per data type (contacts, transactions) |
| Retention criteria | Age, engagement, custom conditions |
| Schedule (daily, weekly, monthly) | Cron-style execution |
| Preview/dry-run mode | "This would delete 8,234 contacts" |
| Notifications | Alert before execution, summary after |
| Pause/resume policies | Temporarily disable without deleting rule |

**Effort:** High (new scheduling + rules engine)

### Layer 4: Soft Delete with Recovery

**Use case:** "I deleted contacts by mistake, can I undo?"

| Capability | Notes |
|------------|-------|
| Soft delete (mark as deleted, don't purge) | Configurable retention period |
| Recycle bin view | See deleted items |
| Restore individual items | Undo mistake |
| Bulk restore | Recover from bad filter |
| Auto-purge after retention | "Delete permanently after 30 days" |

**Effort:** Medium-High (new data model for soft-delete state)

### Layer 5: AccountSync Delete Propagation

**Use case:** "When HQ deletes a contact, branches should too"

| Capability | Notes |
|------------|-------|
| Delete events in CDC stream | Currently not captured |
| Sync rule option: propagate deletes | Off by default |
| Cascading behaviour definition | What happens in target account |
| Audit trail | Which delete came from which account |

**Effort:** High (requires AccountSync v2 design)

**Note:** AccountSync v1 explicitly does NOT support delete propagation. This would be a significant scope extension.

---

## Technical Considerations

### Current Backend Constraints

From `.kiro/steering/backend-constraints.md`:

- **Job queue:** Bulk operations must go through job engine (single-threaded across all accounts)
- **Data isolation:** Each account has separate tables in legacy system
- **AccountSync:** Delete propagation NOT supported in v1
- **Audit:** ServiceHistory records changes but may not cover deletions
- **Cascade:** Unknown what currently happens when a contact is deleted

### Open Architecture Questions

| Question | Impact |
|----------|--------|
| Where does the deletion logic live? u3_list? New service? | Architecture decision |
| Do we need a new "retention" service? | Service boundary decision |
| How do deletions interact with the CDC pipeline? | Event sourcing question |
| Do we need a "deletion queue" separate from job queue? | Compliance timing requirements |

---

## Competitor Landscape (Unknown)

| Question | Status |
|----------|--------|
| How does Mailchimp handle contact deletion? | ❓ Unknown |
| How does HubSpot handle GDPR erasure? | ❓ Unknown |
| How does Klaviyo handle data retention? | ❓ Unknown |
| What's the baseline feature set? | ❓ Unknown |

---

## Potential Phasing (Speculative)

### Phase 0: Discovery

**Goal:** Fill information gaps, understand current state.

**Effort:** 1–2 sprints

| Activity | Output |
|----------|--------|
| Backend audit | Current deletion capabilities |
| Support ticket analysis | Volume and patterns of deletion requests |
| Customer interviews | Requirements definition |
| Compliance review | Legal requirements |
| Competitor audit | Feature parity baseline |

### Phase 1: Right to Erasure (Individual)

**Goal:** Self-service single-contact deletion for compliance.

**Effort:** Medium (2–3 sprints)

| Capability | Notes |
|------------|-------|
| Delete contact button with confirmation | Exists in legacy? Expose in new UI |
| Impact preview | Show what will be deleted |
| Cascade configuration | Account-level settings |
| Audit trail | Prove deletion happened |

**Compliance value:** High — enables GDPR Art. 17 self-service

### Phase 2: Bulk Deletion

**Goal:** Delete contacts by filter criteria.

**Effort:** Medium-High (3–4 sprints)

| Capability | Notes |
|------------|-------|
| Filter builder integration | Reuse existing UI |
| Preview mode | Show count and sample |
| Job execution | Async with progress |
| Audit trail | Record criteria + result |

### Phase 3: Scheduled Retention

**Goal:** Automate data minimisation.

**Effort:** High (4–5 sprints)

| Capability | Notes |
|------------|-------|
| Retention rule builder | Define criteria + schedule |
| Dry-run mode | Preview before execution |
| Notifications | Before + after |
| Dashboard | See all policies and last run |

### Phase 4: Soft Delete / Recovery

**Goal:** Safety net for mistakes.

**Effort:** Medium-High (3 sprints)

| Capability | Notes |
|------------|-------|
| Soft-delete flag | New data model |
| Recycle bin UI | List + restore + purge |
| Retention period | Auto-purge after N days |

### Phase 5: AccountSync Delete Propagation

**Goal:** Consistent deletion across account tree.

**Effort:** High (requires AccountSync v2 scope)

| Capability | Notes |
|------------|-------|
| Delete events in CDC | New event type |
| Propagation rule option | Opt-in per sync rule |
| Cascade behaviour | Configurable per target |

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Backend deletion audit | Not started | Need to understand current state |
| Filter Builder | Exists | For bulk deletion criteria |
| Job Queue | Exists | For async bulk operations |
| AccountSync | In development | v1 doesn't support deletes |
| Legal/compliance review | Not started | Required before Phase 1 |

---

## Risks & Concerns

| Risk | Impact | Mitigation |
|------|--------|------------|
| Irreversible data loss | Customer trust, compliance | Soft-delete + recovery period (Phase 4) |
| Performance impact of bulk deletes | Job queue starvation | Rate limiting, off-peak scheduling |
| Cascade behaviour surprises | "I didn't mean to delete all their transactions" | Clear impact preview, configurable cascades |
| AccountSync gap | Branches out of sync with HQ | Documented limitation until v2 |
| Compliance timing | GDPR requires action "without undue delay" | Priority queue for erasure requests |

---

## Open Questions

| # | Question | Impact | Owner |
|---|----------|--------|-------|
| 1 | What deletion capability exists in the backend today? | Scope — may already have primitives | Dev |
| 2 | What volume of deletion requests does our team handle? | Prioritisation — is this really a pain point? | Support |
| 3 | What's the legal minimum for "right to erasure" timing? | SLA — may need priority queue | Legal |
| 4 | Do customers want scheduled retention or is ad-hoc sufficient? | Scope — Phase 3 may not be needed | PM |
| 5 | Should AccountSync propagate deletes in v2? | Architecture — significant scope | PM + Dev |
| 6 | What happens to aggregate reporting when contacts are deleted? | Data integrity — may need anonymisation path | PM |
| 7 | Is soft-delete legally sufficient, or must data be purged? | Compliance — affects architecture | Legal |
| 8 | How do we handle deletion of contacts who are mid-journey? | Edge case — journey execution | Dev |

---

## Recommendation

**This is a real operational pain** — the user explicitly mentioned involving the team for data deletions. Prioritise accordingly.

**Recommended sequence:**
1. Run Phase 0 Discovery (backend audit + support ticket analysis)
2. Build Phase 1 (Right to Erasure) as quickly as possible — compliance value
3. Decide on Phase 2–5 based on customer demand data from Phase 0
4. Consider Phase 4 (Soft Delete) earlier if risk of user error is high
5. Phase 5 (AccountSync delete propagation) is a v2 scope decision

**Key insight:** The hardest part isn't the deletion itself — it's the cascade behaviour, audit trail, and multi-account consistency. Start with single-contact deletion, learn from that, then expand.

---

## Refs

- **Discovery Canvas:** `docs/roadmap/discovery-canvas-framework.md` — "Configurable data deletion / soft delete"
- **Pain Themes:** `docs/roadmap/pain-themes.md` — "I can't automate my data retention policy"
- **Backend Constraints:** `.kiro/steering/backend-constraints.md` — AccountSync limitations
- **AccountSync Spec:** `.kiro/specs/account-sync/` — delete propagation NOT in v1

---

## Provenance

- **Authored:** 2026-08-11
- **Motivated by:** User feedback — "We currently have to do a lot of this with our team"
- **Status:** Discovery — significant information gaps on current backend state
