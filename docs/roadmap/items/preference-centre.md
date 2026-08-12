# Preference Centre

> **Status:** Discovery
> **Last updated:** 2026-08-11
> **Priority:** Medium-term (per Architecture Roadmap)
> **Pre-requisite infrastructure:** Multi-account sync infrastructure (scope TBD), Consent Tracking (planned)

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

**Information gap:** The production multi-account sync infrastructure for preferences is not yet documented. Key questions:

| Question | Status |
|----------|--------|
| How do contact changes propagate across accounts today? | ❓ Unknown — needs production audit |
| Is there CDC infrastructure for near-real-time sync? | ❓ Unknown — needs production audit |
| What loop prevention exists for bi-directional changes? | ❓ Unknown — needs production audit |
| How are contacts linked across accounts? | ❓ Unknown — needs production audit |

**Without multi-account sync**, we'd need to build a separate preference sync mechanism. This is a significant architecture decision that needs production system audit.

### What Multi-Account Sync Doesn't Solve (Regardless)

| Still Needed | Notes |
|--------------|-------|
| Hosted preference page (UI) | New Forms-adjacent work |
| Preference data model (topics, purposes) | Schema extension |
| Unsubscribe link generation | email/SMS integration |
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

**Effort:** Unknown — depends on what sync infrastructure exists in production

**Depends on:** Phase 1 (data model), production multi-account sync infrastructure (unknown status)

| Capability | Notes |
|------------|-------|
| Preference columns in sync rules | Requires column mapping capability |
| Cascade to branches | Requires multi-account sync flow |
| Audit trail | Requires change source tracking |

**Information gap:** This phase's effort estimate depends entirely on what multi-account sync infrastructure exists in production. Could be Low (configuration) or Medium-High (new build).

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
| Multi-account sync infrastructure | Unknown | Need production audit |
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

**Multi-account sync is a critical dependency** — it could either solve the hardest part (multi-account propagation) through configuration, or require significant engineering.

Significant gaps to fill before scoping:
1. **Production audit** — what multi-account sync infrastructure exists today?
2. Customer requirements (what preferences do they actually need?)
3. Compliance requirements (what's legally required?)
4. Competitor baseline (what's the expected feature set?)

**Recommended sequence:**
1. Audit production multi-account sync capabilities
2. Run Phase 0 Discovery (1–2 sprints)
3. Build Phases 1–3 as a unit (consent model + page + unsubscribe)
4. Phase 4 effort depends on sync infrastructure audit results
5. Phase 5 follows naturally once data model exists

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
