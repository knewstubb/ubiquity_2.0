# UbiQuity Campaigns & Email (Mailout Folders) — Research Audit

## Purpose

This document maps the Campaigns section and Email (Mailout Folders) section of the current UbiQuity platform to inform the design of UbiQuity 2.0's campaign and email sending experience. The focus is on information architecture, workflow steps, component relationships, and interaction patterns — particularly the dual-organising systems (campaigns vs mailout folders) and the 7-step mailout wizard.

## Source

Audited via the staging environment: build 1.179.2.2557 (ASP.NET MVC + Knockout.js frontend)

---

## Architecture Overview

The legacy platform separates campaign management into two distinct navigation paths that operate on overlapping content:

| Section | URL Pattern | Purpose |
|---------|-------------|---------|
| **Campaigns** | `/components/{id}` | Multi-channel container grouping mailouts, forms, surveys, events, and SMS |
| **Email Dashboard** | `/email/dashboard/{id}` | Folder-based view of mailouts only, with lifecycle management |

This creates a fundamental IA tension: a mailout lives in both a campaign (logical grouping) and a mailout folder (operational grouping). Users must mentally track which navigation path to use for which task.

---

## Section 1: Campaigns Page (`/components/{id}`)

### Layout

Two-panel master-detail layout:

| Panel | Content |
|-------|---------|
| **Left (narrow, ~250px)** | Campaign list, sort control, system sections, inline creation |
| **Right (wide, remainder)** | Selected campaign detail: title, description, component list, actions |

### Left Panel — Campaign List

- **Sort control:** Dropdown by Name, with ascending/descending toggle arrow
- **Campaign items:** Folder icon + campaign name (clickable to select)
- **System sections (bottom):**
  - Shared Components — cross-campaign reusable components
  - Archive — deactivated campaigns
- **Creation:** "New Campaign" inline text input at bottom of list

### Right Panel — Campaign Detail

When a campaign is selected:

| Element | Behaviour |
|---------|-----------|
| **Title (H1)** | Inline-editable, click to rename |
| **Description** | Inline-editable text area below title |
| **Action toolbar** | Buttons/dropdowns for campaign-level operations |
| **Component list** | All components within this campaign, with status and stats |

### Campaign Component Types

The "New Component" dropdown (styled as a `dropdown-toggle` button) offers 7 component types:

| # | Type | Icon | Description |
|---|------|------|-------------|
| 1 | Mailout | `ubi-email` | One-time email send |
| 2 | Automated Mailout | `ubi-automated-email` | Trigger-based email |
| 3 | Form | `ubi-form` | Data collection form |
| 4 | Survey | `ubi-survey` | Multi-question survey |
| 5 | Event | `ubi-event` | Event registration/attendance |
| 6 | TXT Out | `ubi-comment` | One-time SMS send |
| 7 | Automated TXT Out | `ubi-automated-txt` | Trigger-based SMS |

### Campaign Action Toolbar

| Action | Type | Behaviour |
|--------|------|-----------|
| **New Component** | Dropdown button | Shows 7 component types; selecting one opens creation modal |
| **Add Existing** | Button | Opens combobox picker modal to add an already-created component |
| **Add Shared Component** | Button | Picks from shared component pool (cross-campaign reuse) |
| **Filters** | Dropdown | Links to campaign-level audience filter editors (one per channel type) |
| **Reports** | Dropdown | Links to campaign-scoped reports |

### Component List (within a campaign)

Each component row displays:

| Element | Detail |
|---------|--------|
| **Drag handle** | Reorder within campaign |
| **Title** | Linked to component dashboard |
| **Type label** | Uppercase badge: MAILOUT, AUTOMATED MAILOUT, SURVEY, TRIGGERED EMAIL |
| **Status** | IN DESIGN, ACTIVE, or sent date/time |
| **Stats** | For sent: "X Sent", "X Read" |
| **Actions** | Preview, Edit (content editor), Report, More menu (⋮) |

### Campaign-Level Filters — Key Concept

The "Filters" dropdown provides access to **campaign-level audience filters**. These are distinct from per-mailout filters:

| Filter Level | Scope | Purpose |
|--------------|-------|---------|
| **Campaign filter** | All mailouts within the campaign | Top-level audience gate — who is eligible |
| **Mailout filter** (wizard step 4) | Single mailout | Further narrows within the campaign audience |

Campaign filters are accessed at `/campaigns/CampaignFilter/BeginEdit/{filterId}` and provide separate filters for each channel type (Mailouts filter, Automated Mailouts filter).

### Campaign Modals

| Modal | Trigger | Content |
|-------|---------|---------|
| **Create Component** | "New Component" dropdown selection | Name input + pre-selected type |
| **Add Existing** | "Add Existing" button | Combobox search/picker for existing components |
| **Campaign Folder Setup** | System-triggered (name conflicts) | Rename input when campaign name conflicts with a mailout folder |
| **Delete Campaign** | More menu / campaign context | Destructive — requires typing "ACCEPT" to confirm |
| **Add Shared Components** | "Add Shared Component" button | List of available shared components |
| **Move Component** | Component ⋮ menu → Move | Campaign picker dropdown (current campaign disabled) |
| **Archive Campaign** | More menu / campaign context | Requires typing "ACCEPT", deactivates all components |

---

## Section 2: Email Dashboard (`/email/dashboard/{id}`)

### Layout

Two-panel layout with tabs and folder tree:

| Panel | Content |
|-------|---------|
| **Left (~250px)** | Folder tree with expand/collapse, "New" folder button |
| **Right (remainder)** | Mailout list for selected folder, with sort/search/filter |

### Tab Navigation

Three tabs above the main content area:

| Tab | Content |
|-----|---------|
| **Mailouts** | One-time email sends (the primary view) |
| **Automated Mailouts** | Trigger-based automated emails |
| **Email Templates** | Reusable template library |

### Left Panel — Folder Tree

- **Root node:** "All mailouts" (shows everything)
- **Folder items:** Named folders with expand/collapse arrows
- **Actions:** "New" button above tree to create a folder
- Folders are a flat organising tool — no sub-folders observed

### Right Panel — Mailout List

**Header:** Selected folder name as heading

**Sort/filter controls:**
- "Modified" sort button (other sort options available)
- Direction toggle (asc/desc)
- Search text field

**Mailout row structure:**

| Element | Detail |
|---------|--------|
| **Expand arrow (left)** | Reveals sub-details |
| **Thumbnail** | Email preview image |
| **Title** | Linked to mailout dashboard |
| **Type label** | "Marketing" or "Service" |
| **Folder name** | Clickable — navigates to folder view |
| **Send status** | "X sent at TIME, DATE" or "In Design" |
| **Completion badge** | Complete, Failed, or Cancelled |
| **Expand arrow (right)** | Also triggers sub-details |

### Mailout Classification

| Dimension | Options |
|-----------|---------|
| **Type** | Marketing, Service |
| **Status** | In Design, Complete, Failed, Cancelled |

The Marketing vs Service distinction affects opt-out behaviour: Service emails bypass marketing opt-out preferences.

---

## Section 3: Mailout Design Wizard (7 Steps)

When a mailout is "In Design", the mailout dashboard presents a linear wizard. Users can proceed sequentially via "Next" or jump between completed steps.

### Step Summary

| Step | Name | Purpose | Key Input |
|------|------|---------|-----------|
| 1 | **Mailout Details** | Identity and metadata | Name, description/notes, tags |
| 2 | **Content and Preview** | Email composition | From/to address, subject, pre-header, HTML/text template |
| 3 | **Track Links** | Link tracking config | Track all / selected / none |
| 4 | **Filter** | Audience targeting | Filter builder (same as the filter system audited separately) |
| 5 | **Dedupe** | Duplicate removal | Field(s) to deduplicate on |
| 6 | **Schedule** | Timing and rate | Send date/time, emails per hour |
| 7 | **Confirm** | Final review and send | Review summary + send button |

### Step 1: Mailout Details

| Field | Type | Notes |
|-------|------|-------|
| Name | Text input | Required — displayed in lists |
| Description/Notes | Textarea | Optional — internal reference |
| Tags | Tag input | Categorisation |

### Step 2: Content and Preview

| Field | Type | Notes |
|-------|------|-------|
| From address | Email input | Full format: "Display Name \<email@domain\>" |
| To address | Merge field selector | Typically `[Email]` field from database |
| Subject | Text input | Supports merge fields |
| Pre-header text | Text input | Preview text in inbox |
| HTML template | Template editor/loader | "Create or load the email template" |
| Text template | Plain text editor | Fallback for non-HTML clients |

**Sub-modals available:** Save Template, Load HTML Template, Load Text Template, Address Book

**Dependency:** Step 3 and Step 7 require content to exist. "You must have content before you can track links." / "You must have content before you can send a mailout."

### Step 3: Track Links

| Option | Behaviour |
|--------|-----------|
| Track all links | Every link in the email is tracked |
| Track selected links | Choose which links to track |
| Track no links | No click tracking |

### Step 4: Filter

Creates a per-mailout audience filter using the standard filter builder.

**Default behaviour:** "Without a filter this mailout will target all opted in, non-GNA members."

This is the second filter layer — the campaign filter (if set) applies first, then this mailout filter further narrows.

### Step 5: Dedupe

Selects one or more fields to identify and remove duplicates before sending.

**Purpose:** Prevents the same person receiving the mailout multiple times (e.g. if they appear in multiple segments or the filter matches them via multiple paths).

### Step 6: Schedule

| Field | Type | Notes |
|-------|------|-------|
| Start date/time | Date + time picker | When to begin sending |
| End date/time | Date + time picker | When to stop (optional) |
| Send rate | Number or "Maximum" | Emails per hour throttle |

### Step 7: Confirm

Final review screen showing all configured settings. The "Send" button is gated on:
- Content must exist (Step 2 completed)
- All required fields populated

### Wizard Navigation Model

- **Linear:** "Next" button progresses through steps sequentially
- **Non-linear (after first save):** Steps become clickable tabs, allowing jumping
- **Save:** Each step can be saved independently
- **Validation:** Steps have soft dependencies (content must exist before tracking/sending)

---

## Section 4: Sent Mailout Dashboard

Once a mailout transitions from "In Design" to sent (or sending), the dashboard transforms into a reporting/management view.

### Left Sidebar

| Element | Behaviour |
|---------|-----------|
| **Delete Mailout** | Destructive — requires typing "ACCEPT" |
| **Copy Mailout** | Creates a duplicate in "In Design" state |
| **Related Tasks** | Links: Email Templates, Mailouts, Automated Mailouts, Move to Mailout Folder |
| **Help** | Collapsible help section |

### Dashboard Tiles (Clickable Cards)

| Tile | Description | Destination |
|------|-------------|-------------|
| Mailout Details | "View and edit your mailout details" | Detail view |
| Edit Link Names | "Edit the link friendly names in this mailout" | Link name editor |
| Mailout Report | "View your reporting for this mailout" | Full report |
| Mailout Recipients | "View your recipients for this mailout" | Recipient list |
| Mailout Preview | "Preview the email template used in this mailout" | Template preview |

### Mailout Summary Widget

Real-time stats with refresh button:

| Metric | Clickable? | Destination |
|--------|------------|-------------|
| Send date | No | — |
| Send time | No | — |
| Status (Complete/Failed/Cancelled) | No | — |
| Total messages | No | — |
| Sent | Yes | Filtered recipient view |
| Delivered | Yes | `/campaigns/data/BeginDataQuery/{id}?request=Delivered` |
| Unread | Yes | Filtered recipient view |
| Read | Yes | `/campaigns/data/BeginDataQuery/{id}?request=Read` |
| Clicked link | Yes | `/campaigns/data/BeginDataQuery/{id}?request=ClickedLink` |
| Undelivered | Yes | Filtered recipient view |
| Hard bounce | Yes | Filtered recipient view |
| Soft bounce | Yes | Filtered recipient view |

### Mailout Overview

Donut/pie chart visualising read vs unread breakdown.

### In-Flight Controls (Modals)

| Modal | Trigger | Options |
|-------|---------|---------|
| **Pause Mailout** | During active send | "Resume when I click" / "Resume at specific time" |
| **Resume Mailout** | After pause | Confirmation dialog |
| **Cancel Mailout** | During active send | Requires reason text |

---

## Section 5: Mailout Details Page (Full Configuration View)

A read-only summary card showing all mailout configuration with an "Edit Details" button.

| Field | Display Format |
|-------|---------------|
| Name | Plain text |
| Description/Notes | Plain text |
| Tags | Tag chips |
| Status | Badge |
| Number of emails | Count |
| From address | Full format: "Name \<email@domain\>" |
| Subject | Plain text |
| Pre-Header Text | Plain text |
| Link Tracking | Setting label (e.g. "Track all links") |
| Filter | Natural language expression: "IF [Email] from Database equals 'x@y.com'" |
| Dedupe | Columns used |
| Start mailout | Date + time |
| End mailout | Date + time |
| Send Rate | "Maximum" or specific rate |
| Mailout History | Collapsible audit trail |

---

## Gap Analysis & Redesign Opportunities

### A. UX Pain Points in the Legacy System

| Pain Point | Impact | Severity |
|------------|--------|----------|
| **Dual navigation for the same content** — Campaigns and Email Dashboard show overlapping mailouts via different paths | Users lose context switching between views; unsure which to use | High |
| **7-step linear wizard is rigid** — Forces sequential completion even when only a few fields change between sends | Slows down repeat senders; encourages "just click next" without thinking | High |
| **Campaign-level vs mailout-level filters create confusion** — Two separate filter layers with no visual indication of how they compose | Users don't realise their campaign filter is limiting their mailout audience | High |
| **"Type ACCEPT" for destructive actions** — Typing a word is friction without clarity (what are the consequences?) | Annoying for experienced users, unclear for new ones | Medium |
| **No visual preview of audience before sending** — Filter results are only visible if you navigate away to the filter builder | Users can't quickly verify who will receive the email | Medium |
| **Component heterogeneity in campaigns** — Mixing emails, SMS, forms, surveys, and events in one list | Mental overhead; different component types have completely different workflows | Medium |
| **Folder ≠ Campaign** — A mailout exists in a folder AND a campaign, but these are unrelated | Double-categorisation creates maintenance burden | High |
| **No batch operations** — Can't select multiple mailouts for bulk actions (move, delete, archive) | Housekeeping is tedious at scale | Low |
| **Inline-editable title with no affordance** — H1 is editable on click but has no visual hint | Discoverability problem — users don't know they can rename inline | Low |
| **Shared Components concept is opaque** — No clear explanation of what "sharing" means or how it differs from "Add Existing" | Users avoid the feature or misuse it | Medium |

### B. Information Architecture Issues

| Issue | Current State | Problem |
|-------|---------------|---------|
| **Campaign is overloaded** | A campaign is simultaneously a folder, a filter container, a report scope, and a multi-channel project | Too many responsibilities for one concept |
| **Email lives in two hierarchies** | Campaign → Component AND Mailout Folder → Mailout | Users must maintain both; neither is authoritative |
| **Tab fragmentation** | Email Dashboard has Mailouts / Automated Mailouts / Templates as tabs | These are fundamentally different workflows forced into one view |
| **Filters are hidden behind a dropdown** | Campaign-level filters accessed via Filters dropdown → channel type → separate page | Critical configuration buried in navigation |
| **No explicit state machine** | Status transitions (In Design → Sending → Complete/Failed/Cancelled) have no visual timeline | Users can't see what state a mailout was in at a given time |
| **Reports scattered** | Campaign-level reports via dropdown, mailout-level via dashboard tiles, and a separate Reporting nav section | Three places to find the same data |
| **Archive is a destination, not a state** | Archiving moves to a "section" rather than toggling a status flag | Can't archive individual components easily; can't filter by archived state |

### C. What Works Well (Keep)

| Pattern | Why It Works |
|---------|-------------|
| **Master-detail layout for campaigns** | Efficient for browsing and managing — minimises full-page navigations |
| **Component type icons** | Quick visual identification of mailout vs form vs survey |
| **Status + stats in component list** | At-a-glance health check without drilling into each component |
| **Copy Mailout** | Essential workflow — most mailouts are iterations of previous ones |
| **In-flight controls (Pause/Resume/Cancel)** | Critical operational safety net during active sends |
| **Mailout summary widget with clickable stats** | Direct path from overview metric to detailed recipient breakdown |
| **Donut chart for read/unread** | Simple, effective visual for the most common question: "did people read it?" |
| **Filter as natural language expression** | "IF [Email] equals 'x@y.com'" is readable by non-technical users |
| **Dedupe step** | Practical data quality step that prevents embarrassing duplicate sends |
| **Send rate throttling** | Essential for deliverability — prevents getting flagged as spam |
| **Drag reorder of components** | Quick prioritisation within a campaign |

### D. Redesign Opportunities

#### D1. Collapse the Dual Hierarchy

**Problem:** Campaigns and Mailout Folders are parallel organising systems for the same content.

**Opportunity:** In 2.0, adopt a single organising principle:
- **Option A:** Campaigns as the primary container (folders become tags/labels for secondary grouping)
- **Option B:** Journeys replace campaigns entirely (mailouts are steps within a journey, not standalone items in a campaign)
- **Option C:** Flat list with smart filtering (no folders or campaigns — use tags, status filters, and search)

**Recommendation:** Option B aligns with the journey-centric vision. Standalone mailouts (one-time sends) could exist as "single-step journeys" or a separate "Quick Send" flow.

#### D2. Simplify the Mailout Wizard

**Problem:** 7 sequential steps for every mailout, even simple ones.

**Opportunity:** Progressive disclosure approach:

| Tier | Steps | When |
|------|-------|------|
| **Quick Send** | Content + Audience + Send | Simple one-time blast |
| **Standard** | Details + Content + Audience + Schedule | Planned campaigns |
| **Advanced** | All 7 steps (adds link tracking, dedupe, rate limiting) | High-volume or compliance-sensitive |

The wizard could become a single-page form with collapsible sections, revealing complexity only when needed. The "Confirm" step becomes a persistent sidebar summary.

#### D3. Unify the Filter Model

**Problem:** Campaign-level and mailout-level filters create a confusing two-tier system.

**Opportunity:**
- Remove campaign-level filters entirely — each mailout/journey step defines its own audience
- OR make the composition explicit: show "Campaign audience: X contacts" → "This mailout filter narrows to: Y contacts" with a visual funnel
- In the journey-centric model, audience is defined at the journey entry point, and subsequent steps can further filter (visual narrowing)

#### D4. Rethink "Campaign" as a Concept

**Problem:** A campaign in the legacy system is a loose container that holds unrelated component types.

**Opportunity:** Split into purposeful containers:

| Legacy Concept | 2.0 Concept | Contains |
|----------------|-------------|----------|
| Campaign (email + SMS) | **Journey** | Sequential/branching steps across channels |
| Campaign (forms + surveys) | **Collection** or fold into **Assets** | Forms and surveys are content, not campaigns |
| Campaign (events) | **Events** (separate module) | Event lifecycle management |
| Shared Components | **Template Library** | Reusable content blocks |

#### D5. Replace Component Heterogeneity with Channel Steps

**Problem:** A campaign mixes mailouts, forms, surveys, events, and SMS in a flat list.

**Opportunity:** In the journey builder, each "step" has a channel type (Email, SMS, Wait, Condition, Form) but they exist in a sequential/branching flow rather than a flat list. This gives the grouping a purpose (the journey logic) rather than being arbitrary.

#### D6. Contextual Reporting

**Problem:** Reports are scattered across three locations.

**Opportunity:** 
- Journey-level reporting lives ON the journey canvas (each step shows its metrics)
- A dedicated Reporting section provides cross-journey analytics and comparative views
- No separate "campaign report" — the journey IS the campaign

#### D7. Lifecycle Visibility

**Problem:** Status transitions are implicit — you only see the current state.

**Opportunity:** A visual timeline/audit trail showing: Created → Content Added → Scheduled → Sending (paused at X) → Resumed → Complete. This replaces the hidden "Mailout History" collapsible.

#### D8. Audience Preview

**Problem:** No way to see who will receive the email without leaving the wizard.

**Opportunity:** Real-time audience count + sample preview panel (show 5-10 example recipients with their merge fields populated). This is standard in modern ESPs (Mailchimp, Klaviyo, Customer.io).

#### D9. Smart Defaults for Repeat Senders

**Problem:** Every mailout starts from scratch even when 80% of settings are the same.

**Opportunity:**
- "Send again" duplicates everything and opens content editor directly
- Account-level defaults for from address, tracking preference, send rate
- Template-based creation that pre-fills steps 1-3

---

### E. Alignment with UbiQuity 2.0 Vision

| 2.0 Principle | Legacy Gap | Redesign Alignment |
|---------------|-----------|-------------------|
| **Journey-centric creation** | Campaigns are flat containers with no logic between components | Journeys replace campaigns — content is built as steps within a flow, authored in modal overlays without losing journey context |
| **Progressive disclosure** | 7-step wizard shows all complexity upfront regardless of need | Tiered creation (Quick Send / Standard / Advanced) with collapsible sections; advanced options hidden until needed |
| **Context preservation** | Every action navigates to a new page (filter editor, template editor, report) | Build content in overlay modals; filter builder as slide-out panel; reports as in-context drawers |
| **AAA Framework — Act** | "Act" is buried in a multi-step wizard accessible from nested navigation | Sending becomes a journey step — select audience (Analyse), compose content (Act), schedule (Act) — all in one visual flow |
| **Quiet interface** | Campaign page has 5 toolbar buttons, type badges, status labels, stat counts, drag handles | Surface only what's relevant to the current task; use the journey canvas as the primary organising visual |
| **Opinionated but flexible** | Every option is exposed equally (from address, tracking, dedupe, rate limiting) | Smart defaults handle 80% of cases; advanced users can override via disclosure panels |

### F. Questions for Product/Stakeholders

#### Campaign Model

1. **Do campaigns survive in 2.0, or are they fully replaced by journeys?** One-time sends (newsletters, announcements) don't naturally fit a "journey" model. Do we need a "Quick Send" path alongside journeys?

2. **What happens to existing campaigns during migration?** Are legacy campaigns converted to journeys, archived as read-only, or maintained in a compatibility mode?

3. **Should forms and surveys remain in the "campaign" concept or become standalone assets?** In the legacy system they're campaign components, but they're really content/collection tools.

#### Audience & Filtering

4. **Do we preserve the two-tier filter model (campaign + mailout) or collapse to one?** If journeys replace campaigns, the journey entry condition replaces the campaign filter — is that sufficient?

5. **Is the "Service" email type (bypasses opt-out) still needed?** This has compliance implications — how is it governed in 2.0?

6. **Should dedupe be automatic or user-configured?** In the legacy system it's a manual step. Most modern platforms dedupe automatically — is there a reason to keep it manual?

#### Sending & Operations

7. **Is send rate throttling still user-controlled or should it be system-managed?** Modern ESPs handle deliverability automatically. Is there a segment of users who need manual rate control?

8. **What in-flight controls are needed?** Pause/Resume/Cancel exist today — are they used frequently? Should we add "edit while sending" (for multi-day sends)?

9. **Who monitors active sends?** Is this a power-user/admin function, or do all users need send monitoring? This determines where the controls live.

#### Reporting

10. **Where does mailout reporting live in the 2.0 IA?** Options: on the journey canvas (contextual), in a dedicated reporting section (comparative), or both?

11. **What granularity is needed?** Legacy shows sent/delivered/read/clicked/bounced per mailout. Do we need per-link, per-segment, or per-variant breakdowns at the overview level?

#### Templates & Content

12. **Is the email template editor staying or being replaced?** The legacy system loads/saves templates — does 2.0 have a built-in WYSIWYG editor, or does it continue to reference external templates?

13. **How does the template library relate to the journey builder?** When authoring an email step in a journey, do users select a template, build from scratch, or both?

#### Migration & Continuity

14. **Do we need historical mailout data in 2.0?** Sent mailout stats, recipient lists, bounce data — does this migrate or remain in legacy?

15. **Is there a transition period where both systems run?** If so, do changes in one sync to the other?

---

## Appendix: Entity Relationship Summary

```
Campaign (container)
├── has many → Components (polymorphic: Mailout, Form, Survey, Event, TXT)
├── has one → Campaign Filter (per channel type)
├── can reference → Shared Components
└── lifecycle: Active → Archived

Mailout Folder (organiser)
├── has many → Mailouts
└── no filter, no logic — pure grouping

Mailout (sendable unit)
├── belongs to → Campaign (as a component)
├── belongs to → Mailout Folder
├── has one → Email Template (content)
├── has one → Mailout Filter (audience subset)
├── has one → Schedule (timing)
├── has one → Dedupe config
├── has one → Link Tracking config
└── lifecycle: In Design → Sending → Complete | Failed | Cancelled

Email Template (content)
├── belongs to → Template Library
├── used by → Mailouts (many)
└── has → HTML version + Text version
```

---

## Appendix: Status Lifecycle

```
┌──────────┐     ┌─────────┐     ┌──────────┐
│ In Design│────▶│ Sending │────▶│ Complete │
└──────────┘     └─────────┘     └──────────┘
                      │                 
                      ▼                 
                 ┌─────────┐           
                 │ Paused  │           
                 └─────────┘           
                      │                 
              ┌───────┴───────┐        
              ▼               ▼        
         ┌─────────┐    ┌──────────┐   
         │ Resumed │    │Cancelled │   
         │(Sending)│    └──────────┘   
         └─────────┘                   
              │                        
              ▼                        
         ┌──────────┐                  
         │ Complete │                  
         └──────────┘                  
              │                        
              ▼                        
         ┌──────────┐                  
         │ Failed   │ (delivery failure)
         └──────────┘                  
```

---

## Appendix: Legacy URL Patterns

| View | URL | Notes |
|------|-----|-------|
| Campaign list | `/components/{campaignId}` | Master-detail |
| Campaign filter editor | `/campaigns/CampaignFilter/BeginEdit/{filterId}` | Full-page navigation |
| Email dashboard | `/email/dashboard/{folderId}` | Separate navigation tree |
| Mailout wizard (In Design) | `/email/dashboard/{mailoutId}` | Wizard within dashboard |
| Sent mailout dashboard | `/email/dashboard/{mailoutId}` | Same URL, different state |
| Mailout details | `/email/details/{mailoutId}` | Read-only config view |
| Mailout recipients | `/campaigns/data/BeginDataQuery/{id}?request={type}` | Filtered data grid |
