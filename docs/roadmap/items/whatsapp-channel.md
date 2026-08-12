# WhatsApp Channel

> **Status:** Discovery (significant information gaps)
> **Last updated:** 2026-08-11 (Confluence gaps resolved)
> **Validation needed:** Customer demand, cost model, technical feasibility

---

## Outcome

> Offer a lower-cost, higher-engagement messaging alternative to SMS.

WhatsApp could provide a richer messaging experience than SMS at potentially lower cost, with higher open rates and interactive features (buttons, media, templates).

**Hypothesis:** Customers would prefer WhatsApp over SMS if cost and capability were comparable.

**Validation status:** Not validated. This item exists to capture what we know and don't know.

---

## Information Gaps

This item has significant gaps that must be filled before scoping work.

### Customer Demand (Unknown)

| Question | Status | How to Validate |
|----------|--------|-----------------|
| Do our customers want WhatsApp as a channel? | ❓ Unknown | Customer survey |
| What % of their contacts have WhatsApp? | ❓ Unknown | Customer survey |
| Would they use WhatsApp instead of SMS, or in addition? | ❓ Unknown | Customer interviews |
| What's the pain with current SMS? Cost? Deliverability? Engagement? | ❓ Unknown | Discovery interviews |
| Is WhatsApp preference regional (NZ vs AU vs other markets)? | ❓ Unknown | Market research |

**Suggested experiment:** "Survey customers about WhatsApp preference vs SMS cost" (from Discovery Canvas)

### Cost Model (Unknown)

| Question | Status | How to Validate |
|----------|--------|-----------------|
| WhatsApp Business API pricing in NZ/AU? | ❓ Unknown | Meta pricing docs |
| How does WhatsApp cost compare to SMS per message? | ❓ Unknown | Cost analysis |
| What's the pricing model? Per-conversation? Per-message? | ❓ Unknown | Meta docs |
| Are there volume discounts? | ❓ Unknown | BSP quotes |
| What would our margin be vs SMS? | ❓ Unknown | Business case |

### Technical Requirements (Partially Known)

| Question | Status | What We Know |
|----------|--------|--------------|
| WhatsApp Business API requirements? | ⚠️ Partial | Requires Meta Business verification |
| Template approval process? | ⚠️ Partial | Templates must be pre-approved by Meta |
| 24-hour messaging window? | ⚠️ Partial | Can only send to users who messaged in last 24h, unless using templates |
| BSP (Business Solution Provider) needed? | ⚠️ Partial | **LivePerson already has WhatsApp integration** — see Confluence 11502813239. Spark uses LivePerson for WhatsApp channels. Could explore partnership/integration path. |
| Integration with existing u3_txt infrastructure? | ❓ Unknown | May need new service |
| Opt-in requirements? | ❓ Unknown | WhatsApp has specific consent rules |
| Existing Spark WhatsApp infrastructure? | ✅ Known | Spark has multiple WhatsApp channels via LivePerson (Confluence 11502813239), including channels set up using WhatsApp Business Setup Guide. Genesys Cloud also has WhatsApp config (Confluence 10919314157). |

### Competitor Landscape (Unknown)

| Question | Status | How to Validate |
|----------|--------|-----------------|
| Does Mailchimp have WhatsApp? | ❓ Unknown | Competitor research |
| Does HubSpot have WhatsApp? | ❓ Unknown | Competitor research |
| Does Klaviyo have WhatsApp? | ❓ Unknown | Competitor research |
| What features do they offer? | ❓ Unknown | Competitor research |
| How do they position WhatsApp vs SMS? | ❓ Unknown | Competitor research |

---

## What We Do Know

### From Discovery Canvas

- WhatsApp as a channel was listed as a potential solution
- Suggested validation: "Survey customers about WhatsApp preference vs SMS cost"
- Appears in ideas list but no evidence of customer pull

### From Architecture Roadmap

- WhatsApp is mentioned in Journey Builder Phase 5 (Advanced Orchestration)
- Content nodes would need RemotingBridge expansion
- Listed alongside Push and RCS as future channels

### From SMS Spec

- WhatsApp templates noted as "future" placeholder
- RCS also mentioned as future channel

### WhatsApp Business API Basics (Public Knowledge)

| Aspect | What We Know |
|--------|--------------|
| **Template messages** | Pre-approved message formats for outbound marketing |
| **Session messages** | Free-form messages within 24h of user message |
| **24-hour window** | Marketing requires templates; conversational is time-limited |
| **Media support** | Images, documents, buttons, quick replies |
| **Verification** | Business must be verified by Meta |
| **Opt-in** | Users must explicitly opt-in to receive WhatsApp from business |

---

## Potential Phasing (Speculative)

If we were to build this, a phased approach might look like:

### Phase 0: Discovery & Validation

**Goal:** Validate demand and build the business case.

| Activity | Output |
|----------|--------|
| Customer survey | Demand validation |
| Cost analysis | WhatsApp vs SMS comparison |
| Competitor audit | Feature parity requirements |
| Technical spike | Integration approach |
| Compliance review | Consent and opt-in requirements |

**Gate:** Proceed only if demand and business case are validated.

### Phase 1: Template Messages (MVP)

**Goal:** Send pre-approved marketing templates via WhatsApp.

| Capability | Notes |
|------------|-------|
| WhatsApp Business API integration | Direct or via BSP |
| Template management | Create, submit for approval, track status |
| Recipient selection | From segments/filters |
| Send execution | Queue and deliver |
| Delivery reporting | Sent, delivered, read |

**Scope boundaries:**
- Templates only (no conversational)
- Marketing messages only
- No inbound handling

### Phase 2: Journey Integration

**Goal:** WhatsApp as a node type in Journey Builder.

| Capability | Notes |
|------------|-------|
| WhatsApp action node | Select template, personalise |
| Delivery events | Track delivery/read for branching |
| Wait for response | Optional: pause journey until reply |

**Dependencies:** Journey Builder Phase 2+, Phase 1 of this item

### Phase 3: Conversational (Future)

**Goal:** Two-way WhatsApp conversations.

| Capability | Notes |
|------------|-------|
| Inbound message handling | Receive and route messages |
| Conversation UI | Inbox for agents |
| Bot integration | Auto-response within 24h window |
| Handoff to human | Escalation workflow |

**This is a different product** — conversational messaging is a separate domain from marketing automation.

---

## Risks & Concerns

| Risk | Impact | Mitigation |
|------|--------|------------|
| No validated demand | Wasted investment | Phase 0 validation before any build |
| Cost model doesn't work | Unattractive to customers | Business case analysis in Phase 0 |
| Meta approval process is slow | Time to value | Start verification early |
| Template restrictions limit value | Feature too constrained | Understand restrictions in Phase 0 |
| Opt-in requirements reduce reach | Small addressable audience | Survey customers on WhatsApp opt-in rates |
| Competes with existing SMS revenue | Cannibalisation | Position as complement, not replacement |

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Meta Business verification | ⚠️ Partial | Spark has WhatsApp via LivePerson — may have verification already |
| BSP selection (if needed) | ⚠️ Partial | **LivePerson already in use** (Confluence 11502813239) — could be integration path |
| Journey Builder | In progress | WhatsApp node requires JB Phase 2+ |
| RemotingBridge | Exists | May need expansion for new channel |
| Consent model | Planned | WhatsApp has specific opt-in requirements |

---

## Open Questions

| # | Question | Impact | Owner |
|---|----------|--------|-------|
| 1 | Do customers actually want WhatsApp? | Go/no-go decision | PM |
| 2 | What's the cost per message in NZ/AU? | Business case | Finance |
| 3 | Do we need a BSP or can we use direct API? | Architecture | Dev |
| 4 | What's the template approval turnaround? | Time to value | Dev |
| 5 | How does WhatsApp consent interact with our consent model? | Compliance | Legal |
| 6 | Do competitors have WhatsApp? What do they offer? | Feature parity | PM |
| 7 | Would this cannibalise SMS revenue? | Commercial impact | Sales |
| 8 | Is this a NZ/AU thing or global? | Market scope | PM |
| 9 | Do we have Meta Business verification already? | Pre-req | DevOps |
| 10 | What's the regional WhatsApp penetration? | Addressable market | PM |

---

## Recommendation

**Do not scope or build until Phase 0 (Discovery) is complete.**

This item exists to capture what we know and flag the gaps. Before any engineering work:

1. Survey customers on WhatsApp preference
2. Build the cost model (WhatsApp vs SMS)
3. Audit competitors
4. Validate technical approach
5. Confirm compliance requirements

If Phase 0 validates demand and business case, then scope Phase 1.

---

## Refs

- **Discovery Canvas:** `docs/roadmap/discovery-canvas-framework.md` — WhatsApp listed as potential solution
- **Architecture:** `docs/roadmap/architecture-informed-roadmap.md` — mentioned in JB content nodes
- **Journey Builder:** `docs/roadmap/items/journey-builder.md` — Phase 5 multi-channel
- **SMS Spec:** `.kiro/specs/sms-messaging/requirements.md` — future channels placeholder
- **Meta docs:** [WhatsApp Business Platform](https://business.whatsapp.com/) (external)
- **Confluence:** "LivePerson - WhatsApp" (11502813239) — existing Spark WhatsApp channels via LivePerson
- **Confluence:** "Genesys Cloud - CCaaS Org - Channels - WhatsApp" (10919314157) — Genesys WhatsApp config

---

## Provenance

- **Authored:** 2026-08-11
- **Motivated by:** Appears in Discovery Canvas and multiple roadmap docs, but has significant information gaps
- **Status:** Discovery item — not ready for scoping

