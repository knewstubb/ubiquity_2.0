# Preference Centre

> **Status:** Discovery
> **Last updated:** 2026-08-11 (admin account sync approach added)
> **Priority:** Medium-term (per Architecture Roadmap)
> **Pre-requisite infrastructure:** Admin Account Sync (✅ exists), Consent Tracking (planned)

---

## Outcome

> Give contacts a self-service way to manage their communication preferences.

A preference centre is a hosted page where contacts can:
- Update their channel opt-ins (email, SMS, WhatsApp)
- Choose topics they want to hear about
- View/update their contact details
- Unsubscribe from specific communications or globally

This is table-stakes for GDPR/CCPA compliance and expected by customers who've used Mailchimp, HubSpot, or Klaviyo.

---

## Multi-Account Propagation Challenge

The hard problem with preference centres in multi-location setups is **propagation**: when a contact updates their preferences via Head Office's preference centre, those changes need to flow to every branch account.

### Existing Capability: Admin Account Sync

**Account sync exists today** — it's an admin-only feature that syncs contact data between accounts. This is a key enabler for preference centres.

**Early-phase idea:** Use admin account sync to be **prescriptive** about how customers set up their accounts. If we enforce a consistent schema across the account tree (same preference fields, same naming), a global preference centre becomes much simpler:

| Constraint | Benefit |
|------------|---------|
| Require standard preference columns in all accounts | No schema mapping complexity |
| Enforce bi-directional sync for preference fields | Changes propagate automatically |
| Prescribe account hierarchy patterns | Predictable routing |

This trades customer flexibility for development simplicity — a reasonable trade-off for an early phase.

### What Admin Account Sync Provides

| Capability | Status | Notes |
|------------|--------|-------|
| Contact sync across accounts | ✅ Exists | Admin-configured |
| Column mapping | ⚠️ Unknown | Need to verify if preference columns can be mapped |
| Bi-directional sync | ⚠️ Unknown | Need to verify sync direction options |
| Near-real-time propagation | ⚠️ Unknown | Need to verify latency |

### Prescriptive Setup Approach (Early Phase)

Instead of building for arbitrary multi-account configurations, we could:

1. **Define a "preference-centre-ready" account setup** — standard fields, standard sync rules
2. **Document the setup as a prerequisite** — "To use global preference centre, your accounts must be configured like X"
3. **Build the preference centre assuming this setup** — simpler code, fewer edge cases
4. **Expand flexibility in later phases** — once the core is proven

**Trade-off:** Customers with non-standard setups would need to reconfigure (admin task) or wait for later phases.

### What Admin Account Sync Doesn't Solve (Regardless)

| Still Needed | Notes |
|--------------|-------|
| Hosted preference page (UI) | New Forms-adjacent work |
| Preference data model (topics, purposes) | Schema extension — but can be standard across accounts |
| Unsubscribe link generation | Email/SMS integration |
| Topic/purpose-based consent model | New data model |
| Regional compliance rules | New logic |

---

## Architecture Roadmap Reference

Section 2.13 (Consent Management) outlines a phased approach:

| Phase | Capability | Dependencies |
|-------|------------|--------------|
| **Data Phase 1** | Consent as contact attribute | u3_list schema |
| **Data Phase 2** | Channel opt-in/out tracking | Contact schema |
| **Data Phase 3** | Preference centre (hosted page) | Forms infrastructure |
| **Data Phase 4** | Consent audit trail | ServiceHistory integration |
| **Data Phase 5** | Consent in filters | Filter builder enhancement |

The preference centre (this item) is **Phase 3** — depends on Phases 1 and 2 being complete.

---

## Information Gaps

### Customer Requirements (Unknown)

| Question | Status | How to Validate |
|----------|--------|-----------------|
| What preferences do customers need to capture? | ❓ Unknown | Customer interviews |
| Do they need topic-based preferences (e.g., "News", "Offers", "Events")? | ❓ Unknown | Customer interviews |
| Do they need purpose-based consent (GDPR-style)? | ❓ Unknown | Compliance review |
| Do they need per-channel preferences (email yes, SMS no)? | ⚠️ Likely | Industry standard |
| Do they need frequency preferences (weekly vs daily)? | ❓ Unknown | Customer interviews |
| How many topics/categories do typical customers have? | ❓ Unknown | Customer data analysis |

### Compliance Requirements (Partially Known)

| Question | Status | What We Know |
|----------|--------|--------------|
| GDPR requirements for NZ/AU? | ⚠️ Partial | Privacy Act 2020 (NZ), Privacy Act 1988 (AU) — not GDPR but similar principles |
| What audit trail is legally required? | ❓ Unknown | Legal review needed |
| What's the retention period for consent records? | ❓ Unknown | Legal review needed |
| Are "soft opt-outs" (unsubscribe from topic but not globally) compliant? | ❓ Unknown | Legal review needed |
| How do we handle existing contacts without explicit consent? | ❓ Unknown | Migration/compliance question |

### Technical Architecture (Partially Known)

| Question | Status | What We Know |
|----------|--------|--------------|
| Where does the hosted page live? | ⚠️ Partial | Architecture suggests "new or extend u3_forms" |
| How does the page authenticate the contact? | ❓ Unknown | Token in URL? Login? |
| How do we prevent abuse (someone changing others' prefs)? | ❓ Unknown | Security review needed |
| Do we need a database for consent records or just attributes? | ❓ Unknown | Architecture decision |
| How do preferences integrate with filter builder? | ⚠️ Partial | Phase 5 of consent roadmap |
| How do unsubscribe links work? | ⚠️ Partial | Needs email/SMS integration |

### Multi-Account Complexity (Unknown)

| Question | Status | What We Know |
|----------|--------|--------------|
| How do preferences sync across accounts? | ❓ Unknown | Need production audit |
| What happens if branches have different schemas? | ❓ Unknown | Need production audit |
| How do we prevent sync loops? | ❓ Unknown | Need production audit |
| How do we audit where a preference change came from? | ❓ Unknown | Need production audit |

### UX Design (Unknown)

| Question | Status | How to Validate |
|----------|--------|-----------------|
| What should the preference page look like? | ❓ Unknown | Design research, competitor audit |
| Should it be branded per-customer or platform-standard? | ❓ Unknown | Customer preference |
| What information should we show (current preferences, history)? | ❓ Unknown | Design decision |
| Should contacts be able to update profile data (name, email)? | ❓ Unknown | Scope decision |
| How do we handle contacts with multiple email addresses? | ❓ Unknown | Data model question |

### Competitor Landscape (Unknown)

| Question | Status | How to Validate |
|----------|--------|-----------------|
| What does Mailchimp's preference centre look like? | ❓ Unknown | Competitor research |
| What does HubSpot's preference centre look like? | ❓ Unknown | Competitor research |
| What does Klaviyo's preference centre look like? | ❓ Unknown | Competitor research |
| What features do they offer that we'd need to match? | ❓ Unknown | Competitor research |
| What's the baseline expectation for SME customers? | ❓ Unknown | Customer interviews |

---

## Potential Phasing (Speculative)

If we were to build this after resolving information gaps:

### Phase 0: Discovery

**Goal:** Fill information gaps, define requirements.

**Effort:** 1–2 sprints (research, not code)

| Activity | Output |
|----------|--------|
| Customer interviews | Requirements definition |
| Compliance review | Legal requirements |
| Competitor audit | Feature parity baseline |
| Technical spike | Architecture decision |
| Design research | UX patterns |

**Gate:** Proceed only with clear requirements and compliance guidance.

### Phase 1: Consent Data Model

**Goal:** Extend contact schema for consent tracking.

**Effort:** Low (1 sprint)

**Depends on:** Phase 0 (requirements)

| Capability | Notes |
|------------|-------|
| Channel opt-in/out attributes | Per-channel (email, SMS, WhatsApp) |
| Topic/category preferences | If required by customers |
| Consent timestamp tracking | When consent was given/withdrawn |
| Consent source tracking | Where consent was captured |

**Aligns with:** Architecture Roadmap Phase 1 & 2

### Phase 2: Basic Preference Page

**Goal:** Hosted page for contacts to manage preferences.

**Effort:** Medium (2–3 sprints)

**Depends on:** Phase 1 (data model), Forms infrastructure decision

| Capability | Notes |
|------------|-------|
| Hosted page with unique URL per contact | Token-based access |
| Display current preferences | Read from contact record |
| Update preferences | Write back to contact record |
| Confirmation/success feedback | UX requirement |

**Security considerations:**
- Token-based URL (no login required)
- Token expiry/rotation
- Rate limiting
- Audit logging

### Phase 3: Unsubscribe Integration

**Goal:** One-click unsubscribe links in emails and SMS.

**Effort:** Medium (2 sprints)

**Depends on:** Phase 2 (preference page)

| Capability | Notes |
|------------|-------|
| Unsubscribe link generation | Per-contact, per-message |
| One-click global unsubscribe | Required by CAN-SPAM |
| One-click topic unsubscribe | If topic preferences exist |
| Link to full preference page | For more granular control |

**Email integration:** u3_mail must include tokenised links
**SMS integration:** u3_txt must include short links

### Phase 4: Multi-Account Propagation

**Goal:** Preferences sync across account tree.

**Approach A: Prescriptive (Recommended for Early Phase)**

Leverage existing admin account sync with enforced schema consistency:

**Effort:** Low–Medium (1–2 sprints) — mostly configuration and documentation

| Capability | Notes |
|------------|-------|
| Define standard preference columns | Email opt-in, SMS opt-in, topic prefs |
| Document "preference-centre-ready" setup | Admin guide for account configuration |
| Configure sync rules for preference columns | Use existing admin account sync |
| Verify bi-directional sync behaviour | Test propagation |

**Trade-off:** Customers must adopt standard schema. Non-compliant accounts don't get global preference centre until reconfigured.

**Approach B: Flexible (Later Phase)**

Build custom preference sync that handles arbitrary schemas:

**Effort:** Medium-High (3–4 sprints) — requires mapping layer

| Capability | Notes |
|------------|-------|
| Preference column mapping UI | Map different field names across accounts |
| Custom sync rules for preferences | Beyond existing sync capabilities |
| Audit trail | Requires change source tracking |

**Recommendation:** Start with Approach A. Most customers will accept standard setup if it means faster delivery. Approach B can follow if customer demand for flexibility justifies the complexity.

### Phase 5: Consent in Filters

**Goal:** Filter by consent status in segments and journeys.

**Effort:** Low (1 sprint)

**Depends on:** Phase 1 (data model), Filter Builder

| Capability | Notes |
|------------|-------|
| "Is opted in to email" filter | Boolean field |
| "Has topic preference X" filter | If topic model exists |
| "Consent given after date" filter | For re-consent campaigns |

**Aligns with:** Architecture Roadmap Consent Phase 5

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Admin account sync | ✅ Exists | Admin-only feature — can enforce schema consistency |
| Forms infrastructure | Unknown | Hosting for preference page |
| Filter Builder | Exists | Needs consent field support |
| u3_mail integration | Exists | Needs unsubscribe link generation |
| u3_txt integration | Exists | Needs unsubscribe link generation |
| Legal/compliance review | Not started | Required before Phase 1 |

---

## Risks & Concerns

| Risk | Impact | Mitigation |
|------|--------|------------|
| Compliance requirements unclear | Build wrong thing | Legal review in Phase 0 |
| Existing contacts lack explicit consent | Migration problem | Define "grandfathering" policy |
| Multi-account complexity | Scope creep | Depends on production sync infrastructure |
| Security of preference URLs | Privacy breach | Token-based access, expiry, audit |
| Integration with legacy email system | Delivery complexity | Spike u3_mail integration early |

---

## Open Questions

| # | Question | Impact | Owner |
|---|----------|--------|-------|
| 1 | Do customers actually need topic-based preferences, or is channel opt-in sufficient? | Scope — topic model is significant work | PM |
| 2 | What's the legal minimum for consent audit trail in NZ/AU? | Compliance — defines data model | Legal |
| 3 | Where should the preference page be hosted — extend u3_forms or new service? | Architecture — affects infrastructure | Dev |
| 4 | How do we handle contacts who never gave explicit consent (pre-GDPR)? | Migration — could affect whole database | PM + Legal |
| 5 | Should contacts be able to update profile data (name, email) via preference page? | Scope — adds complexity | PM |
| 6 | How long should preference page tokens be valid? | Security vs UX trade-off | Dev |
| 7 | Do competitors charge extra for preference centre, or is it table-stakes? | Commercial — pricing decision | PM |
| 8 | Should the preference page be brandable/customisable? | UX — affects effort significantly | Designer |

---

## Recommendation

**Admin account sync exists and can be leveraged** — the prescriptive approach (enforce schema consistency upfront) significantly reduces development complexity for multi-account preference propagation.

**Early-phase strategy:**
1. Define standard preference columns (email opt-in, SMS opt-in, topic preferences)
2. Document "preference-centre-ready" account setup requirements
3. Use existing admin account sync to propagate preference changes
4. Build the preference centre assuming standard schema

**Trade-off:** Customers with non-standard setups must reconfigure or wait for later phases. This is acceptable for an early phase — most customers will accept standardisation for faster delivery.

**Recommended sequence:**
1. Run Phase 0 Discovery (1–2 sprints) — requirements, compliance, competitor baseline
2. Build Phases 1–3 as a unit (consent model + page + unsubscribe)
3. Phase 4 uses prescriptive approach (Approach A) — low effort if schema is standardised
4. Phase 5 follows naturally once data model exists
5. Flexible multi-account support (Approach B) can follow if customer demand justifies complexity

---

## Refs

- **Architecture Roadmap:** `docs/roadmap/architecture-informed-roadmap.md` Section 2.13 (Consent Management)
- **Discovery Canvas:** `docs/roadmap/discovery-canvas-framework.md` — listed as idea
- **Priority Matrix:** Medium-term, Planned status

---

## Provenance

- **Authored:** 2026-08-11
- **Motivated by:** User request — noted that AccountSync infrastructure makes this easier
- **Status:** Discovery — requires Phase 0 before scoping
