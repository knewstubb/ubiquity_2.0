# Social Audience Export (Ad Audiences)

> **Status:** Planning
> **Pain Point:** "I am double-handling audiences for social"
> **Also known as:** AdSync, Ad Audiences, Social Export
> **Last updated:** 2026-08-11 (Confluence gaps resolved)

---

## Outcome

> Reduce time and friction to sync UbiQuity audiences to ad platforms.

Users currently export audiences manually, reformat them, hash emails, and upload to Meta/Google — a tedious, error-prone process. This feature eliminates double-handling and keeps ad audiences in sync with UbiQuity segments.

---

## Problems Addressed

| Problem | Evidence | Impact |
|---------|----------|--------|
| "Double-handling audiences for social" | UTTPMO, Discovery Canvas | Manual export → reformat → hash → upload |
| Format requirements are platform-specific | User complaints | Meta requires SHA-256 hashed emails, Google has different fields |
| Audiences go stale | Implicit | Manual process means infrequent updates |
| No visibility into what was synced | Implicit | Can't audit which contacts are in ad audiences |

---

## Information Gaps

> **Status key:** ❓ Unknown | ⚠️ Partial | ✅ Known
>
> Social Audience Export is in **Planning** status — Phase 1 (Smart CSV Export) is well-scoped; later phases have gaps.

### Technical Architecture (Phase 1)

| Question | Status | What We Know |
|----------|--------|--------------|
| Should Phase 1 use Connectors Exporter or standalone? | ❓ Unknown | Architecture decision; noted in Open Questions |
| Platform format specifications stable? | ⚠️ Partial | Meta/Google well-documented; TikTok/LinkedIn need verification |
| Hashing implementation location? | ✅ Known | Compute at export time, not stored |

### Technical Architecture (Phase 2+)

| Question | Status | What We Know |
|----------|--------|--------------|
| Do we have Meta Business verification? | ⚠️ Partial | Meta requires "system user token or business manager scope" for Custom Audiences. See Confluence "Ad Audiences Deep Research" (12160925705). Verification status needs confirmation. |
| OAuth infrastructure exists? | ✅ Known | **Existing Facebook OAuth integration pattern documented** in Confluence (200966287). Can extend for other platforms. |
| Rate limits per platform? | ⚠️ Partial | Documented in platform docs; need to model |

### Customer Requirements

| Question | Status | What We Know |
|----------|--------|--------------|
| Expected segment size for ad uploads? | ❓ Unknown | Performance consideration; noted in Open Questions |
| Which platform should be first for Phase 2? | ❓ Unknown | Resource allocation decision; noted in Open Questions |
| Do customers want scheduled exports (Phase 1)? | ✅ Known | No — manual sufficient for MVP |

### Compliance

| Question | Status | What We Know |
|----------|--------|--------------|
| Do we need consent enforcement before Phase 1? | ❓ Unknown | Compliance question; noted in Open Questions |
| Platform-specific consent requirements? | ⚠️ Partial | Meta requires explicit consent for EU; others vary |

---

## Competitor Landscape

| Capability | Mailchimp | HubSpot | Klaviyo | UbiQuity (Current) | UbiQuity (Target) |
|------------|-----------|---------|---------|-------------------|-------------------|
| Meta Custom Audiences | ✅ Native | ✅ Native | ✅ Native | ❌ Manual | Phase 2 |
| Google Customer Match | ✅ Native | ✅ Native | ✅ Native | ❌ Manual | Phase 2 |
| Auto-sync segments | ✅ | ✅ | ✅ | ❌ | Phase 3 |
| Pre-formatted CSV export | ⚠️ | ⚠️ | ⚠️ | ❌ | Phase 1 |
| SHA-256 hashing | ✅ Auto | ✅ Auto | ✅ Auto | ❌ Manual | Phase 1 |
| Consent enforcement | ✅ | ✅ | ✅ | ❌ | Phase 2+ |

**Key insight:** Competitors offer native API integrations. Building that is significant work. But a **pre-formatted, pre-hashed CSV export** would eliminate 80% of the pain for 20% of the effort.

---

## Phased Approach

### Phase 1: Smart CSV Export (MVP)

**Goal:** Eliminate manual formatting and hashing. User downloads a ready-to-upload file.

**Effort:** Low (1–2 sprints)

**Dependencies:** Saved segments (existing), Connectors Exporter (NEXT)

#### How It Works

1. User navigates to a saved segment
2. Clicks "Export for Ads" button
3. Selects platform (Meta, Google, TikTok, LinkedIn)
4. Downloads CSV pre-formatted for that platform

#### Platform-Specific Formats

**Meta Custom Audiences:**
- Required: SHA-256 hashed email (lowercase, trimmed)
- Optional: SHA-256 hashed phone, first name, last name, country
- File format: CSV with specific column headers

```csv
email,phone,fn,ln,country
a1b2c3d4...hash...,e5f6g7h8...hash...,john,smith,nz
```

**Google Customer Match:**
- Required: SHA-256 hashed email OR phone OR user ID
- Optional: first name, last name, country, zip
- File format: CSV with Google's schema

```csv
Email,Phone,First Name,Last Name,Country,Zip
a1b2c3d4...hash...,+6421...,John,Smith,NZ,1010
```

**TikTok Audiences:**
- Required: SHA-256 hashed email or phone
- File format: Single column, no headers

```
a1b2c3d4...hash...
e5f6g7h8...hash...
```

**LinkedIn Matched Audiences:**
- Required: Email (LinkedIn hashes on their side) OR company name
- File format: CSV with single column

```csv
email
john@example.com
jane@example.com
```

#### Technical Approach

1. **New export type in Connectors Exporter** — "Ad Platform Export"
2. **Platform selector** — Dropdown to choose Meta, Google, TikTok, LinkedIn
3. **Automatic hashing** — SHA-256 hash emails/phones before export (not stored, computed at export time)
4. **Field mapping** — Map UbiQuity fields to platform-required fields
5. **Format validation** — Ensure file meets platform requirements

#### UI Sketch

```
┌─────────────────────────────────────────────────────────────┐
│  Export Segment: VIP Gold Members                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Export for:                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ● Meta Custom Audiences                             │   │
│  │ ○ Google Customer Match                             │   │
│  │ ○ TikTok Audiences                                  │   │
│  │ ○ LinkedIn Matched Audiences                        │   │
│  │ ○ Standard CSV (unhashed)                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ℹ️ Emails will be hashed (SHA-256) before export.         │
│     No personal data leaves UbiQuity in plain text.        │
│                                                             │
│  Audience size: 12,847 contacts                            │
│                                                             │
│  [ Cancel ]                          [ Download CSV ]       │
└─────────────────────────────────────────────────────────────┘
```

#### What This Buys Us

- **80% pain reduction** — No manual reformatting, no manual hashing
- **Minutes vs hours** — Export is instant, upload to platform is unchanged
- **Privacy-safe** — Hashing happens before download; PII never exposed
- **Foundation for Phase 2** — Same field mapping, same hashing logic

---

### Phase 2: Native API Integration

**Goal:** One-click sync directly to ad platforms via OAuth.

**Effort:** Medium-High (3–4 sprints per platform)

**Dependencies:** Phase 1 (field mapping), OAuth infrastructure, consent model

#### How It Works

1. User connects their Meta/Google account (OAuth)
2. Creates an "Ad Audience Sync" that links a segment to a platform audience
3. UbiQuity pushes hashed data directly via API
4. Option for scheduled sync (daily, weekly)

#### Per-Platform Work

| Platform | API | OAuth Complexity | Notes |
|----------|-----|------------------|-------|
| **Meta** | Marketing API v18+ | Medium | Requires Business verification |
| **Google** | Customer Match API | High | Requires Google Ads API access |
| **TikTok** | Business API | Medium | Requires TikTok Business account |
| **LinkedIn** | Marketing API | Medium | Requires LinkedIn Campaign Manager |

#### Technical Components

- **OAuth flow** — Store tokens securely, handle refresh
- **Connection management** — UI to connect/disconnect accounts
- **Sync configuration** — Link segment → platform audience
- **API client per platform** — Each platform has different API patterns
- **Error handling** — Rate limits, validation errors, partial failures
- **Sync history** — What was synced, when, status

#### Why This Is Phase 2

- OAuth infrastructure is significant work
- Each platform is a separate integration
- Business verification requirements (Meta, etc.)
- Phase 1 validates demand before building full integration

---

### Phase 3: Automated Sync

**Goal:** Keep ad audiences automatically in sync with UbiQuity segments.

**Effort:** Medium (2–3 sprints)

**Dependencies:** Phase 2 (API integration), scheduled jobs infrastructure

#### Capabilities

| Capability | Description |
|------------|-------------|
| Scheduled sync | Daily/weekly push to keep audiences current |
| Change detection | Only sync delta (new/removed contacts) |
| Bi-directional (future) | Import ad platform insights back |
| Multi-audience management | Single segment → multiple platforms |

---

### Phase 4: Consent Enforcement

**Goal:** Ensure only consented contacts are synced to ad platforms.

**Effort:** Low (1 sprint)

**Dependencies:** Consent data model (see architecture roadmap)

#### Requirements

- Only sync contacts with ad consent flag
- Respect platform-specific consent requirements (Meta requires explicit consent for EU users)
- Audit trail of what was synced with what consent

---

## Why Phase 1 First

| Consideration | Phase 1 (CSV) | Phase 2 (API) |
|---------------|---------------|---------------|
| **Effort** | 1–2 sprints | 3–4 sprints per platform |
| **Time to value** | Weeks | Months |
| **Risk** | Low | Medium (API changes, rate limits) |
| **Maintenance** | None | Ongoing (API versioning, token refresh) |
| **Validates demand** | Yes | — |
| **Privacy** | Hashing handled | Same |

**Phase 1 is the 80/20 solution.** It eliminates the most painful steps (formatting, hashing) while deferring the complexity of OAuth and API integrations. If Phase 1 adoption is low, we've learned that cheaply.

---

## Technical Architecture

### Phase 1 Components

```
┌─────────────────────────────────────────────────────────────┐
│                  Segment Detail Page                         │
│  [ Export for Ads ▾ ]                                       │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                 Ad Export Dialog                             │
│  Platform selector + Preview + Download                     │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│              Connectors Exporter Service                     │
│  New export type: "ad_platform"                             │
│  - Fetch segment contacts                                   │
│  - Apply platform-specific field mapping                    │
│  - SHA-256 hash PII fields                                  │
│  - Generate CSV in platform format                          │
└─────────────────────────────────────────────────────────────┘
```

### Hashing Implementation

```python
import hashlib

def hash_for_ads(value: str, platform: str) -> str:
    """Hash a value for ad platform upload."""
    if not value:
        return ""
    
    # Normalise: lowercase, trim whitespace
    normalised = value.lower().strip()
    
    # SHA-256 hash
    return hashlib.sha256(normalised.encode('utf-8')).hexdigest()
```

**Important:** Hashing happens at export time, not stored. Original data remains in UbiQuity; only hashed data is exported.

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Low adoption of Phase 1 | Wasted effort | Ship quickly, measure usage before Phase 2 |
| Platform format changes | Broken exports | Version format specs; monitor platform docs |
| Users expect API sync | Disappointment | Clear messaging that CSV is interim solution |
| Consent gaps | Compliance risk | Phase 4 addresses; Phase 1 warns about consent responsibility |

---

## Success Metrics

| Phase | Metric | Target |
|-------|--------|--------|
| Phase 1 | Ad exports per month | 50+ within 3 months |
| Phase 1 | Time to export vs manual | 90% reduction |
| Phase 2 | Connected ad accounts | 20+ accounts within 6 months |
| Phase 3 | Active automated syncs | 50% of Phase 2 users |

---

## Open Questions

| # | Question | Impact | Owner |
|---|----------|--------|-------|
| 1 | Do we need consent enforcement before Phase 1? | Compliance | Legal/PM |
| 2 | Which platform should be first for Phase 2? | Resource allocation | PM |
| 3 | Meta Business verification status? | ⚠️ Partial info — requires "system user token or business manager scope" per Confluence 12160925705. Need to confirm our current verification status. | DevOps |
| 4 | What's the expected segment size for ad uploads? | Performance | Data |
| 5 | Should Phase 1 use Connectors Exporter or standalone? | Architecture | Dev |

---

## Deliberate Scope Boundaries

We will NOT build (in Phase 1):

| Feature | Reason |
|---------|--------|
| **API sync** | Deferred to Phase 2 after validating demand |
| **Scheduled exports** | Manual export sufficient for MVP |
| **Lookalike audiences** | Platform-side feature, not our concern |
| **Ad campaign creation** | Out of scope; we sync audiences, not manage ads |
| **Bidding/budget integration** | Out of scope |

---

## Refs

- **Pain themes:** `docs/roadmap/pain-themes.md` — "Double-handling audiences for social"
- **Architecture:** `docs/roadmap/architecture-informed-roadmap.md` (Section 2.9 Ad Audiences)
- **Related:** Consent Management (architecture roadmap Section 2.13)
- **Related:** Connectors Exporter (NEXT in pipeline)
- **Platform docs:**
  - [Meta Custom Audiences](https://developers.facebook.com/docs/marketing-api/audiences/guides/custom-audiences/)
  - [Google Customer Match](https://developers.google.com/google-ads/api/docs/remarketing/audience-segments/customer-match)
  - [TikTok Audiences API](https://business-api.tiktok.com/portal/docs?id=1739940504185857)
  - [LinkedIn Matched Audiences](https://learn.microsoft.com/en-us/linkedin/marketing/matched-audiences)

---

## Provenance

- **Authored:** 2026-08-11
- **Motivated by:** User pain ("double-handling audiences for social"), competitor gap
- **Key insight:** CSV export with pre-hashing is 80/20 solution — validates demand before building full API integration

