# Configurable Data Deletion

> **Status:** Discovery
> **Last updated:** 2026-08-11 (single-contact deletion confirmed)
> **Priority:** High (operational pain — bulk/automated deletion requires dev team involvement)
> **Pain source:** User feedback — "I can't automate my data retention policy" (mapped to "reduce dev reliance")

---

## Outcome

> Give customers self-service control over **bulk** data retention and deletion so they don't need to involve our team for routine cleanup.

Customers need to:
- Delete contacts who haven't engaged in X months (bulk, criteria-based)
- Delete old transactional data beyond a retention period (scheduled)
- Comply with data minimisation requirements (GDPR, Privacy Act)
- Clean up test data or duplicates (bulk selection)
- Remove contacts at their request (right to erasure) — **✅ this exists today**

**Currently:** 
- **Individual deletion exists** — users can right-click a contact row and select "Delete" to remove a single record
- **Bulk/automated deletion doesn't exist** — deleting by criteria, scheduled retention, or batch operations requires our team to run manual scripts

---

## Information Gaps

### Current State (Partially Known from Confluence)

| Question | Status | What We Know |
|----------|--------|--------------|
| What deletion requests does our team handle today? | ⚠️ Partial | Privacy Act erasure requests documented in "UbiQuity Customer Data Deletion/Access Requests" (Confluence 11921457579) — involves transfer to data controller, then Qrious deletes from UbiQuity |
| How long does a typical deletion request take? | ⚠️ Partial | Manual process involving multiple handoffs. Must notify data subject within 10 days per legal requirement. |
| What's the SLA expectation for GDPR erasure requests? | ✅ Known | Privacy Act 2020 (NZ): "without undue delay", within 10 days for acknowledgment. GDPR Art. 17: within 1 month. |
| What data types do customers most often want to delete? | ❓ Unknown | Need support ticket analysis |
| What criteria do they use? | ❓ Unknown | Need support ticket analysis |
| Account-level deletion process? | ✅ Known | Documented in "Delete Account" page (Confluence 885719095) — stored procedure `DeleteAccount_Live`, must run during maintenance window, cannot lock tables mid-process |

### Technical Architecture (Partially Known from Confluence)

| Question | Status | What We Know |
|----------|--------|--------------|
| Is there a soft-delete mechanism today? | ⚠️ Partial | Account deletion is hard delete (per Confluence 885719095: "hard to rollback, would need to restore database from backup") |
| What cascade behaviours exist on contact delete? | ⚠️ Partial | Account deletion cascades to webhooks, DTEs, scripts, microsites (must be deleted first). Contact-level cascade unknown. |
| Is deletion auditable? | ✅ Known | `DeleteAccount..DeleteAccountHistory` table holds deletion history (per Confluence 885719095) |
| How does deletion interact with multi-account sync? | ⚠️ Partial | **Need production audit — delete propagation unknown** |
| What's the job queue impact of bulk deletions? | ✅ Known | Process can cause table deadlocks. **Must run during maintenance window** — previous incident required database reboot. (Confluence 885719095) |
| Is there a "recycle bin" or undo period? | ❌ No | Per Confluence 885719095: "hard to rollback, would need to restore database from backup" |
| Pre-deletion requirements? | ✅ Known | Must delete DTEs, SFTP folders, scripts, wrappers, microsites, deactivate webhooks/webtracking goals first |

### Compliance Requirements (Known from Confluence)

| Question | Status | What We Know |
|----------|--------|--------------|
| NZ Privacy Act requirements? | ✅ Known | Section 43 enables transfer of requests to data controller. Acknowledgment required within 10 days. (Confluence 11921457579) |
| AU Privacy Act requirements? | ⚠️ Partial | APP 11: Agencies must destroy or de-identify when no longer needed |
| GDPR Art. 17 (Right to Erasure)? | ✅ Known | Must delete "without undue delay" when requested. Current process documented with handoff to data controller. |
| What constitutes "deletion" vs "anonymisation"? | ⚠️ Partial | Current process is full deletion; legal review needed for anonymisation acceptability |
| Audit trail requirements for deletions? | ✅ Known | `DeleteAccountHistory` table exists. Per Privacy Act, must be able to confirm deletion to data subject. |
| Current erasure request process? | ✅ Known | Multi-step: Qrious receives → transfers to client (data controller) → client cleans source systems → Qrious deletes from UbiQuity → confirms completion. (Confluence 11921457579) |

### Customer Requirements (Unknown)

| Question | Status | How to Validate |
|----------|--------|-----------------|
| What retention periods do customers typically want? | ❓ Unknown | Customer interviews |
| Do they want scheduled/automated deletions? | ❓ Unknown | Customer interviews |
| Do they need ad-hoc deletion (select contacts → delete)? | ⚠️ Likely | Industry standard |
| Do they need filter-based deletion (delete all matching X)? | ❓ Unknown | Customer interviews |
| Do they want soft-delete with recovery period? | ❓ Unknown | Customer interviews |
| What data do they want to preserve vs delete? | ❓ Unknown | Aggregate stats? Audit logs? |

### Multi-Account Complexity (Unknown)

| Question | Status | What We Know |
|----------|--------|--------------|
| How does deletion work in multi-account setups? | ❓ Unknown | Need production audit |
| If HQ deletes a contact, what happens in branches? | ❓ Unknown | Need production audit |
| Should deletion cascade via multi-account sync? | ❓ Unknown | Architecture decision |
| What if branches have the contact but HQ doesn't? | ❓ Unknown | Orphan handling |

---

## Potential Capability Layers

Based on common patterns in the space:

### Layer 1: Right to Erasure (Individual Deletion) — ✅ EXISTS

**Use case:** A contact requests deletion of their data (GDPR Art. 17)

**Current state:** Individual contact deletion is available via right-click → Delete on contact rows in the database view.

| Capability | Status | Notes |
|------------|--------|-------|
| Delete single contact by ID/email | ✅ Exists | Right-click → Delete in contact grid |
| Cascade to transactions | ⚠️ Unknown | Need to verify cascade behaviour |
| Cascade to mail history | ⚠️ Unknown | Need to verify cascade behaviour |
| Cascade to form submissions | ⚠️ Unknown | Need to verify cascade behaviour |
| Audit trail of deletion | ⚠️ Unknown | Need to verify if logged |
| Confirmation workflow | ⚠️ Unknown | Need to verify if impact preview shown |

**Gap:** The capability exists but we need to understand cascade behaviour, audit trail, and what exactly gets deleted.

**Effort:** Documentation + possible UX improvements to show impact preview

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

### Layer 5: Multi-Account Delete Propagation

**Use case:** "When HQ deletes a contact, branches should too"

| Capability | Notes |
|------------|-------|
| Delete events in change stream | Need to understand current CDC capabilities |
| Sync rule option: propagate deletes | Opt-in behaviour |
| Cascading behaviour definition | What happens in target account |
| Audit trail | Which delete came from which account |

**Effort:** Unknown — depends on production sync infrastructure audit

**Note:** Multi-account delete propagation capabilities are unknown. This would need a production audit before scoping.

---

## Technical Considerations

### Current Backend Constraints

Based on production system knowledge:

- **Job queue:** Bulk operations must go through job engine (single-threaded across all accounts)
- **Data isolation:** Each account has separate tables in legacy system
- **Multi-account sync:** Delete propagation capabilities unknown — needs production audit
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

### Phase 1: Right to Erasure (Individual) — ✅ MOSTLY EXISTS

**Goal:** Self-service single-contact deletion for compliance.

**Current state:** Individual deletion available via right-click → Delete. 

**Remaining work:** Small (0.5–1 sprint)

| Capability | Status | Notes |
|------------|--------|-------|
| Delete contact button with confirmation | ✅ Exists | Right-click → Delete in contact grid |
| Impact preview | ⚠️ Unknown | Verify if shown before delete |
| Cascade configuration | ⚠️ Unknown | Verify current behaviour |
| Audit trail | ⚠️ Unknown | Verify if deletion logged |

**Next step:** Document current behaviour and identify UX gaps (impact preview, confirmation copy).

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

### Phase 5: Multi-Account Delete Propagation

**Goal:** Consistent deletion across account tree.

**Effort:** Unknown — needs production audit

| Capability | Notes |
|------------|-------|
| Delete events in change stream | Audit current CDC capabilities |
| Propagation rule option | Opt-in per sync rule |
| Cascade behaviour | Configurable per target |

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Backend deletion audit | Not started | Need to understand current state |
| Filter Builder | Exists | For bulk deletion criteria |
| Job Queue | Exists | For async bulk operations |
| Multi-account sync | Unknown | Need production audit for delete propagation |
| Legal/compliance review | Not started | Required before Phase 1 |

---

## Risks & Concerns

| Risk | Impact | Mitigation |
|------|--------|------------|
| Irreversible data loss | Customer trust, compliance | Soft-delete + recovery period (Phase 4) |
| Performance impact of bulk deletes | Job queue starvation | Rate limiting, off-peak scheduling |
| Cascade behaviour surprises | "I didn't mean to delete all their transactions" | Clear impact preview, configurable cascades |
| Multi-account gap | Branches out of sync with HQ | Document limitation; audit production sync capabilities |
| Compliance timing | GDPR requires action "without undue delay" | Priority queue for erasure requests |

---

## Open Questions

| # | Question | Impact | Owner |
|---|----------|--------|-------|
| 1 | ~~Backend deletion capability~~ | ✅ Resolved — `DeleteAccount_Live` stored procedure exists (Confluence 885719095). Runs during maintenance window. | Dev |
| 2 | ~~Deletion SLA for erasure requests~~ | ✅ Resolved — 10 days to acknowledge under NZ Privacy Act. Process documented in Confluence 11921457579. | Legal |
| 3 | What volume of deletion requests does our team handle? | Prioritisation — is this really a pain point? | Support |
| 4 | Do customers want scheduled retention or is ad-hoc sufficient? | Scope — Phase 3 may not be needed | PM |
| 5 | Should multi-account sync propagate deletes? | Architecture — significant scope | PM + Dev |
| 6 | What happens to aggregate reporting when contacts are deleted? | Data integrity — may need anonymisation path | PM |
| 7 | Is soft-delete legally sufficient, or must data be purged? | Compliance — current process is hard delete | Legal |
| 8 | How do we handle deletion of contacts who are mid-journey? | Edge case — journey execution | Dev |
| 9 | Can deletion run outside maintenance window safely? | Operational — current constraint is significant | Dev |

---

## Recommendation

**The operational pain is specifically bulk/automated deletion** — individual contact deletion already exists (right-click → Delete).

**Recommended sequence:**
1. Run Phase 0 Discovery (document current single-delete behaviour, support ticket analysis for bulk patterns)
2. Build Phase 2 (Bulk Deletion) as the primary new capability — this is the actual gap
3. Decide on Phase 3–5 based on customer demand data from Phase 0
4. Consider Phase 4 (Soft Delete) earlier if risk of user error is high
5. Phase 5 (multi-account delete propagation) requires production sync audit

**Key insight:** Individual deletion exists — the pain is "delete 10,000 inactive contacts" not "delete one contact". Focus on bulk operations, criteria-based deletion, and scheduled retention.

---

## Refs

- **Discovery Canvas:** `docs/roadmap/discovery-canvas-framework.md` — "Configurable data deletion / soft delete"
- **Pain Themes:** `docs/roadmap/pain-themes.md` — "I can't automate my data retention policy"
- **Confluence:** "Delete Account" (885719095) — account-level deletion process and constraints
- **Confluence:** "UbiQuity Customer Data Deletion/Access Requests" (11921457579) — erasure request workflow

---

## Provenance

- **Authored:** 2026-08-11
- **Motivated by:** User feedback — "We currently have to do a lot of this with our team"
- **Status:** Discovery — significant information gaps on current backend state
