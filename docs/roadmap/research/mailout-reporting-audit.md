# Mailout Reporting Capabilities Audit

> **Date:** 2026-08-12  
> **Purpose:** Document all data fields available in current mailout reporting views to inform reporting-infrastructure roadmap item  
> **Environment:** Staging (stagingengage.ubiquity.nz)

## Summary

UbiQuity currently has two parallel mailout reporting interfaces:

1. **Default Mailout Report** — Legacy view (`/campaigns/reports/mailout/{mailoutId}`)
2. **New Mailout Report Dashboard** — Modern view (`/email/mailout/reports/{mailoutId}`)

Both views are accessible from the same mailout, with a link to navigate between them. The new dashboard provides enhanced visualizations and a cleaner UX, but some data fields present in the default report are not surfaced in the new dashboard.

---

## Default Mailout Report

**URL Pattern:** `/campaigns/reports/mailout/{mailoutId}`

### Header Actions
| Action | Description |
|--------|-------------|
| View Email | Preview the email template |
| View Printable | Print-friendly report version |
| Share Report | Generate shareable link |
| Select Filters | Apply data filters |
| Send Report by Email | Email report to recipients |
| Refresh | Reload report data |

### Details Section
| Field | Type | Notes |
|-------|------|-------|
| Mailout Name | Text | — |
| Send Date | DateTime | Format: "Mon 22 Jun 2026 4:26 pm" |
| Subject | Text | Single subject for standard mailouts |
| Subject A | Text | A/B testing mailouts only |
| Subject B | Text | A/B testing mailouts only |
| Pre-Header Text | Text | May be empty |
| Add Note | Action | Per-section annotation capability |

### Overview Section
| Metric | Value Type | Context |
|--------|------------|---------|
| Total messages | Count (link) | Links to recipient list |
| Read | Count + % | "% of successful deliveries" |
| Unread | Count + % | "% of successful deliveries" |
| Bounced | Count + % | "% of total messages" |
| Delivered | Count + % | "% of total messages" |
| Undelivered | Count + % | "% of total messages" |
| Opted out | Count + % | "% of delivered messages" |
| Clicked at least one link | Count + % | "% of read messages" |
| Marked as spam | Count + % | "% of delivered messages" |
| Read more than once | Count + % | "% of read messages" |
| Add Note | Action | Per-section annotation |

### A/B Testing Section (A/B mailouts only)
| Metric | Value Type | Notes |
|--------|------------|-------|
| Read Rate (Version A) | % | Per-version comparison |
| Read Rate (Version B) | % | Per-version comparison |
| Click Through Rate (Version A) | % | Per-version comparison |
| Click Through Rate (Version B) | % | Per-version comparison |
| Winning version indicator | Badge | Shows which version performed better |
| Number of Emails Read | Time-series chart | Shows read activity over time by version |

### Activity Chart
| Element | Description |
|---------|-------------|
| Chart title | "Activity for first day" |
| Series 1 | Emails read (over time) |
| Series 2 | Links clicked (over time) |
| X-axis | Hourly intervals (24h from send) |
| Y-axis | Count |

### Links Clicked Summary
| Metric | Value Type | Context |
|--------|------------|---------|
| Clicked at least one link | Count + % | "% of successful deliveries", "% of emails read" |
| Didn't click | Count + % | "% of emails read" |
| Total links clicked | Count | "by N person(s)" |
| Unique links clicked | Count + % | "% of emails read" |
| Clicks per person | Decimal | Average |
| Add Note | Action | Per-section annotation |

### Links Table
| Column | Type | Notes |
|--------|------|-------|
| Link name | Text (link) | Friendly name or URL, clickable to destination |
| Unique | Count (link) | Clickable to recipient list |
| Total | Count | Total click count |

### Email Clients Section
| Element | Description |
|---------|-------------|
| Device breakdown | Pie chart |
| Segments | Desktop %, Mobile % |
| Add Note | Action | Per-section annotation |

---

## New Mailout Report Dashboard

**URL Pattern:** `/email/mailout/reports/{mailoutId}`

### Header
| Element | Description |
|---------|-------------|
| Mailout name | Title text |
| Send date/time | Format: "Monday, 22 June 2026 at 16:26" |
| Last updated | Relative timestamp ("just now", etc.) |
| Select filter | Dropdown |
| Share report | Button |

### Tabs
- **Overview** — Main metrics and engagement data
- **Links reporting** — Detailed link performance

### Top Metrics (Always Visible)
| Metric | Value Type | Position |
|--------|------------|----------|
| Click-through rate | % | Prominent, left |
| Click-to-open rate | % | Prominent, right |

### Stats Row (Always Visible)
| Metric | Type | Notes |
|--------|------|-------|
| Total messages sent | Count (link) | Links to recipient list |
| Delivered | Count (link) | Links to filtered recipient list |
| Opened | Count (link) | Links to filtered recipient list |
| Total links clicked | Count (link) | Links to filtered recipient list |
| Total unique clicks | Count (link) | Links to filtered recipient list |
| Opted out | Count (link) | Links to filtered recipient list |
| Bounced | Count (link) | Links to filtered recipient list |
| Read more than once | Count (link) | Links to filtered recipient list |

### Overview Tab

#### Funnel Visualization
| Element | Description |
|---------|-------------|
| Total messages sent | Starting count |
| Delivered % | Funnel metric with visual |
| Visual indicator | Funnel graphic |

#### Engagement Metrics (with progress bars)
| Metric | Value Type | Description |
|--------|------------|-------------|
| Delivered | % | "of the recipients received the email" |
| Opened | % | "of the recipients opened the email" |
| Links clicked | % | "of the recipients clicked at least one link" |
| Marked as spam | % | "of the recipients marked the email as spam" |
| Opted out | % | "of the recipients that read the email opted out" |
| Hard bounced | % | "of the messages were hard bounced" |

#### Reads by Device
| Element | Description |
|---------|-------------|
| Pie chart | Desktop vs Mobile breakdown |
| Legend | Desktop, Mobile with percentages |

#### A/B Testing Section (A/B mailouts only)
| Metric | Value Type | Notes |
|--------|------------|-------|
| Subject A | Text display | Shows subject line |
| Subject B | Text display | Shows subject line |
| Read rate comparison | Visual bars | Side-by-side comparison |
| Click-through rate comparison | Visual bars | Side-by-side comparison |
| Winning version indicator | Badge | Shows which version won |

#### Mailout Activity Chart
| Element | Description |
|---------|-------------|
| Chart title | "Mailout activity" (expandable) |
| Series 1 | Links clicked |
| Series 2 | Read |
| X-axis | Hourly intervals |
| Y-axis | Count (0-10 scale shown) |
| Legend | "Links clicked", "Read" |

### Links Reporting Tab

#### Total Link Clicks Summary
| Element | Description |
|---------|-------------|
| Total link clicks | Count |
| Pie chart | "% of emails read" |

#### Clicks by Device
| Element | Description |
|---------|-------------|
| Pie chart | Desktop vs Mobile breakdown |
| Legend | Desktop, Mobile with percentages |

#### Links Table
| Column | Type | Notes |
|--------|------|-------|
| Link name | Text (link) | Sortable, clickable to destination |
| Unique clicks | Count | Sortable |

**Note:** No "Total" clicks column (unlike default report)

#### Link Map
| Element | Description |
|---------|-------------|
| Email preview | Visual rendering of email |
| Click overlay | Heatmap/highlight of clicked areas |
| Navigation | Previous/Next buttons for multi-page emails |

---

## Comparison: Default Report vs New Dashboard

### Data Parity

| Data Field | Default Report | New Dashboard | Notes |
|------------|----------------|---------------|-------|
| **Core Metrics** | | | |
| Total messages | ✅ | ✅ | Parity |
| Delivered (count + %) | ✅ | ✅ | Parity |
| Read/Opened (count + %) | ✅ | ✅ | Parity |
| Unread | ✅ | ❌ | Not shown in new dashboard |
| Bounced | ✅ | ✅ | Parity |
| Undelivered | ✅ | ❌ | Not explicitly shown |
| Opted out | ✅ | ✅ | Parity |
| Clicked at least one link | ✅ | ✅ | Parity |
| Marked as spam | ✅ | ✅ | Parity |
| Read more than once | ✅ | ✅ | Parity |
| **Calculated Rates** | | | |
| Click-through rate | ❌ | ✅ | New dashboard adds this |
| Click-to-open rate | ❌ | ✅ | New dashboard adds this |
| **Links Data** | | | |
| Total links clicked | ✅ | ✅ | Parity |
| Unique links clicked | ✅ | ✅ | Parity |
| Clicks per person | ✅ | ❌ | Not shown in new dashboard |
| Didn't click count | ✅ | ❌ | Not shown in new dashboard |
| Link total clicks (per link) | ✅ | ❌ | New dashboard only shows unique |
| **Visualizations** | | | |
| Activity time-series | ✅ | ✅ | Parity (different styling) |
| Device breakdown pie | ✅ | ✅ | Parity |
| Funnel visualization | ❌ | ✅ | New dashboard adds this |
| Link map (visual heatmap) | ❌ | ✅ | New dashboard adds this |
| **A/B Testing** | | | |
| Subject line display | ✅ | ✅ | Parity |
| Read rate per version | ✅ | ✅ | Parity |
| CTR per version | ✅ | ✅ | Parity |
| Winning indicator | ✅ | ✅ | Parity |
| **Features** | | | |
| Add Note (per section) | ✅ | ❌ | Not available in new dashboard |
| View Email | ✅ | ❌ | No direct link in new dashboard |
| Printable version | ✅ | ❌ | Not available in new dashboard |
| Share Report | ✅ | ✅ | Parity |
| Select Filters | ✅ | ✅ | Parity |
| Send Report by Email | ✅ | ❌ | Not available in new dashboard |
| Refresh | ✅ | Auto | Auto-refreshes in new dashboard |

### Fields Missing from New Dashboard
1. **Unread count** — Inverse of "Opened", easily derivable
2. **Undelivered count** — Inverse of "Delivered", partially covered by "Bounced"
3. **Clicks per person** — Average engagement depth metric
4. **Didn't click count** — Useful for targeting non-engagers
5. **Total clicks per link** — Only unique clicks shown in new links table
6. **Add Note** — Annotation capability for report commentary
7. **View Email** — Quick preview link
8. **View Printable** — Export/print functionality
9. **Send Report by Email** — Distribution capability

### New Dashboard Advantages
1. **Click-through rate & Click-to-open rate** — Key marketing metrics prominently displayed
2. **Funnel visualization** — Clearer conversion flow understanding
3. **Link map** — Visual heatmap of email click locations
4. **Cleaner UX** — Modern design, tabbed interface
5. **Live timestamps** — "Last updated" indicator for data freshness
6. **Auto-refresh** — No manual refresh needed

---

## Mailout Dashboard (Summary View)

**URL Pattern:** `/campaigns/Mailout/Dashboard/{mailoutId}`

This is the mailout overview page, not a report. It provides quick access to:

### Summary Widget
| Field | Notes |
|-------|-------|
| Send date | — |
| Send time | — |
| Status | Complete, Pending, etc. |
| Total messages | Count |
| Sent | Count |
| Delivered | Count (link) |
| Unread | Count |
| Read | Count (link) |
| Clicked link | Count (link) |
| Undelivered | Count |
| Hard bounce | Count |
| Soft bounce | Count |
| Refresh | Manual refresh button |

### Actions
- Mailout Report link → Default report
- Mailout Recipients link → Recipient list
- Mailout Preview → Email template preview
- Edit Link Names → Link friendly name management
- Mailout Details → Edit mailout settings

---

## Implications for Reporting Infrastructure

### Current Pain Points
1. **Two parallel systems** — Cognitive load, feature drift potential
2. **No cross-account reporting** — Custom reports require expensive manual stitching
3. **Missing "per link total clicks"** in new dashboard — Loss of repeat-click insight
4. **No annotation capability** in new dashboard — Commentary/context not portable

### Opportunities
1. **Unified data model** — Ensure both views pull from same source with consistent calculations
2. **Cross-account aggregation** — Top user request; requires data warehouse approach
3. **Export standardization** — Consistent export format across both views
4. **Feature convergence** — Port missing features to new dashboard (notes, printable, etc.)

### Data Freshness
Per DataFlow spec (Confluence 13001654502), target data freshness is <1 minute for near real-time reporting.

---

## Competitive Analysis

This section compares UbiQuity's email reporting capabilities against leading competitors to identify gaps and opportunities for the reporting infrastructure roadmap.

### Competitors Evaluated

| Competitor | Market Position | Target Segment |
|------------|-----------------|----------------|
| **Braze** | Enterprise CDP/MAP | Large enterprise, high-volume senders |
| **Klaviyo** | E-commerce focused | SME to mid-market, revenue-focused |
| **Mailchimp** | Broad market leader | SME, ease-of-use focused |
| **HubSpot** | All-in-one platform | SME to enterprise, CRM-integrated |

### Feature Comparison Matrix

#### Core Metrics

| Feature | UbiQuity | Braze | Klaviyo | Mailchimp | HubSpot |
|---------|----------|-------|---------|-----------|---------|
| Sent/Delivered/Bounced | ✅ | ✅ | ✅ | ✅ | ✅ |
| Opens/Reads | ✅ | ✅ | ✅ | ✅ | ✅ |
| Click-through rate | ✅ | ✅ | ✅ | ✅ | ✅ |
| Click-to-open rate | ✅ | ✅ | ✅ | ✅ | ✅ |
| Unsubscribes | ✅ | ✅ | ✅ | ✅ | ✅ |
| Spam complaints | ✅ | ✅ | ✅ | ✅ | ✅ |
| Hard/Soft bounce split | ✅ | ✅ | ✅ | ✅ | ✅ |
| Deferrals tracking | ❌ | ✅ | ❌ | ❌ | ❌ |

#### Advanced Open Tracking

| Feature | UbiQuity | Braze | Klaviyo | Mailchimp | HubSpot |
|---------|----------|-------|---------|-----------|---------|
| Machine Opens detection (Apple MPP) | ❌ | ✅ | ✅ | ✅ | ✅ |
| Machine vs Other Opens split | ❌ | ✅ | ✅ | ✅ | ❌ |
| Estimated Real Open Rate | ❌ | ✅ | ❌ | ❌ | ❌ |
| Open location tracking | ❌ | ❌ | ✅ | ✅ | ❌ |

**Gap Analysis:** Apple Mail Privacy Protection (MPP) launched in 2021, making open rates unreliable. Braze provides the most sophisticated handling with "Estimated Real Open Rate" using a proprietary model. UbiQuity lacks any MPP-related metrics, which may cause customers to distrust open rate data.

#### Link & Click Analytics

| Feature | UbiQuity | Braze | Klaviyo | Mailchimp | HubSpot |
|---------|----------|-------|---------|-----------|---------|
| Unique clicks per link | ✅ | ✅ | ✅ | ✅ | ✅ |
| Total clicks per link | ✅* | ✅ | ✅ | ✅ | ✅ |
| Click heatmap on email | ✅ | ✅ | ❌ | ✅ | ✅ |
| UTM parameter tracking | ❌ | ✅ | ✅ | ✅ | ✅ |
| Click-by-device breakdown | ✅ | ✅ | ✅ | ✅ | ✅ |
| Click location (geography) | ❌ | ❌ | ✅ | ✅ | ❌ |

*Only in default report, missing from new dashboard

**Gap Analysis:** UbiQuity has solid link tracking fundamentals but lacks UTM parameter tracking, which is essential for attributing traffic in Google Analytics. The click heatmap ("Link map") in the new dashboard is competitive.

#### Conversion & Revenue Attribution

| Feature | UbiQuity | Braze | Klaviyo | Mailchimp | HubSpot |
|---------|----------|-------|---------|-----------|---------|
| Revenue per recipient | ❌ | ✅ | ✅ | ✅ | ✅ |
| Revenue per email | ❌ | ✅ | ✅ | ✅ | ✅ |
| Conversion tracking | ❌ | ✅ | ✅ | ✅ | ✅ |
| Conversion by product/SKU | ❌ | ❌ | ✅ | ❌ | ❌ |
| Purchase attribution window | ❌ | ✅ | ✅ | ✅ | ✅ |
| Multi-touch attribution | ❌ | ✅ | ❌ | ❌ | ✅ |

**Gap Analysis:** This is UbiQuity's largest gap. All major competitors connect email engagement to revenue outcomes. Without this, users cannot demonstrate email marketing ROI, which is critical for budget justification and optimization decisions.

#### Deliverability Insights

| Feature | UbiQuity | Braze | Klaviyo | Mailchimp | HubSpot |
|---------|----------|-------|---------|-----------|---------|
| Bounce breakdown | ✅ | ✅ | ✅ | ✅ | ✅ |
| Deliverability by domain | ❌ | ✅ | ✅ | ✅ | ❌ |
| Deliverability by inbox provider | ❌ | ✅ | ✅ | ✅ | ❌ |
| IP reputation monitoring | ❌ | ✅ | ❌ | ✅ | ❌ |
| Delivery error categories | ❌ | ✅ | ✅ | ✅ | ❌ |
| Deliverability Center/Dashboard | ❌ | ✅ | ✅ | ✅ | ❌ |
| Inbox placement testing | ❌ | ✅ | ❌ | ✅ | ❌ |

**Gap Analysis:** Deliverability diagnostics are essential for high-volume senders. Braze's "Deliverability Center" provides IP reputation, delivery errors by domain, and inbox provider breakdown. Klaviyo offers similar per-provider insights. UbiQuity shows only aggregate bounce data.

#### Benchmarking & Context

| Feature | UbiQuity | Braze | Klaviyo | Mailchimp | HubSpot |
|---------|----------|-------|---------|-----------|---------|
| Industry benchmarks | ❌ | ❌ | ✅ | ✅ | ✅ |
| Peer comparison | ❌ | ❌ | ✅ | ✅ | ❌ |
| Performance ratings (Good/Fair/Poor) | ❌ | ❌ | ✅ | ✅ | ✅ |
| Historical trend comparison | ❌ | ✅ | ✅ | ✅ | ✅ |
| Campaign-to-campaign comparison | ❌ | ✅ | ✅ | ✅ | ✅ |

**Gap Analysis:** Klaviyo stands out with explicit Poor/Fair/Good/Excellent ratings based on industry and peer benchmarks. This helps users understand whether 25% open rate is good or bad for their industry. UbiQuity provides no context for interpreting metrics.

#### Audience & Segment Analysis

| Feature | UbiQuity | Braze | Klaviyo | Mailchimp | HubSpot |
|---------|----------|-------|---------|-----------|---------|
| Performance by segment | ❌ | ✅ | ✅ | ✅ | ✅ |
| Performance by list | ❌ | ✅ | ✅ | ✅ | ✅ |
| Demographic breakdown | ❌ | ❌ | ✅ | ❌ | ❌ |
| Subscriber engagement scoring | ❌ | ✅ | ✅ | ✅ | ✅ |
| Engagement over time (cohort) | ❌ | ✅ | ❌ | ❌ | ❌ |

**Gap Analysis:** Understanding which segments perform best is critical for optimization. All competitors offer segment-level reporting. Klaviyo adds demographic breakdowns (location, email domain) which help identify geographic patterns.

#### A/B Testing & Optimization

| Feature | UbiQuity | Braze | Klaviyo | Mailchimp | HubSpot |
|---------|----------|-------|---------|-----------|---------|
| Subject line A/B testing | ✅ | ✅ | ✅ | ✅ | ✅ |
| Content A/B testing | ❌ | ✅ | ✅ | ✅ | ✅ |
| Send time A/B testing | ❌ | ✅ | ✅ | ✅ | ✅ |
| Multivariate testing | ❌ | ✅ | ✅ | ✅ | ❌ |
| Statistical significance indicator | ❌ | ✅ | ✅ | ✅ | ✅ |
| Auto-winner selection | ❌ | ✅ | ✅ | ✅ | ✅ |

**Gap Analysis:** UbiQuity's A/B testing is limited to subject lines. Competitors offer content, send time, and multivariate testing with statistical significance indicators. Auto-winner selection is standard elsewhere but absent in UbiQuity.

#### Cross-Campaign & Aggregate Reporting

| Feature | UbiQuity | Braze | Klaviyo | Mailchimp | HubSpot |
|---------|----------|-------|---------|-----------|---------|
| Cross-campaign comparison | ❌ | ✅ | ✅ | ✅ | ✅ |
| Channel performance dashboard | ❌ | ✅ | ✅ | ✅ | ✅ |
| Cross-channel reporting (email + SMS) | ❌ | ✅ | ✅ | ✅ | ✅ |
| Custom report builder | ❌ | ✅ | ✅ | ✅ | ✅ |
| Scheduled report delivery | ✅* | ✅ | ✅ | ✅ | ✅ |
| Report export (CSV/PDF) | Partial | ✅ | ✅ | ✅ | ✅ |

*Only in default report via "Send Report by Email"

**Gap Analysis:** Cross-campaign reporting is the #1 user request noted in the document. All competitors provide this natively. UbiQuity forces manual data stitching for any cross-campaign analysis.

#### Real-Time & Advanced Analytics

| Feature | UbiQuity | Braze | Klaviyo | Mailchimp | HubSpot |
|---------|----------|-------|---------|-----------|---------|
| Real-time activity feed | ❌ | ✅ | ✅ | ✅ | ✅ |
| Live activity map (geographic) | ❌ | ❌ | ✅ | ❌ | ❌ |
| Funnel/conversion reports | ❌ | ✅ | ❌ | ❌ | ✅ |
| Retention reports | ❌ | ✅ | ❌ | ❌ | ❌ |
| Predictive analytics (churn, LTV) | ❌ | ✅ | ✅ | ✅ | ✅ |
| Smart send time optimization | ❌ | ✅ | ✅ | ✅ | ✅ |

**Gap Analysis:** Klaviyo's "Watch Live" tab shows real-time opens and clicks on a world map — highly visual and engaging for marketers. Braze offers the most sophisticated analytics with funnel reports, retention analysis, and correlation studies.

#### Data Infrastructure & Export

| Feature | UbiQuity | Braze | Klaviyo | Mailchimp | HubSpot |
|---------|----------|-------|---------|-----------|---------|
| Data warehouse integration | ❌ | ✅ | ✅ | ❌ | ✅ |
| Snowflake native connector | ❌ | ✅ | ❌ | ❌ | ❌ |
| API access to report data | ? | ✅ | ✅ | ✅ | ✅ |
| Webhook for events | ? | ✅ | ✅ | ✅ | ✅ |
| Raw event export | ❌ | ✅ | ✅ | ✅ | ✅ |

**Gap Analysis:** Braze's Snowflake Data Sharing provides enterprise-grade data access. For customers with sophisticated BI needs, raw data export is essential.

---

### Competitive Positioning Summary

#### Where UbiQuity Leads

1. **Click heatmap ("Link map")** — Visual link performance is competitive with top players
2. **Clean, modern UX** — New dashboard design is on par with competitors
3. **A/B testing core** — Subject line testing is solid, though limited in scope

#### Critical Gaps (High Impact, Common Across Competitors)

| Gap | Impact | Competitors with Feature |
|-----|--------|--------------------------|
| **Revenue/conversion attribution** | Cannot demonstrate email ROI | All 4 |
| **Cross-campaign reporting** | No aggregate performance view | All 4 |
| **Apple MPP handling** | Open rates appear inflated | Braze, Klaviyo, Mailchimp |
| **Industry benchmarks** | Users can't contextualize performance | Klaviyo, Mailchimp, HubSpot |
| **Segment-level reporting** | Can't identify best-performing audiences | All 4 |
| **Custom report builder** | No flexibility for specific needs | All 4 |

#### Medium Gaps (Differentiators for Some Competitors)

| Gap | Competitors with Feature |
|-----|--------------------------|
| Deliverability dashboard | Braze, Klaviyo, Mailchimp |
| UTM parameter tracking | All 4 |
| Statistical significance for A/B | All 4 |
| Content/send time A/B testing | All 4 |
| Real-time activity feed | All 4 |
| Predictive analytics | Braze, Klaviyo, Mailchimp |

#### Lower Priority Gaps (Nice-to-Have)

| Gap | Notes |
|-----|-------|
| Live activity map | Klaviyo-specific feature, visually impressive |
| Snowflake integration | Enterprise-only need |
| Funnel/retention reports | Braze-specific, advanced use case |
| Multivariate testing | Power-user feature |

---

### Roadmap Recommendations

Based on competitive analysis, prioritized recommendations for reporting infrastructure:

#### Phase 1: Table Stakes (Must-Have for Competitive Parity)

1. **Cross-campaign reporting dashboard**
   - Aggregate metrics across mailouts
   - Date range filtering
   - Campaign type filtering
   - Export capability
   - *Rationale:* #1 user request, all competitors have this

2. **Segment-level performance breakdown**
   - Show metrics by target segment/list
   - Enable segment comparison
   - *Rationale:* Essential for optimization, all competitors have this

3. **Apple MPP handling**
   - Detect and flag machine opens
   - Show "Other Opens" metric separately
   - Add explanatory tooltips
   - *Rationale:* Current open rates may be misleading; trust issue

4. **Feature convergence in new dashboard**
   - Add "Total clicks" column to links table
   - Add annotation/notes capability
   - Add printable/export functionality
   - *Rationale:* Users switching between views is friction

#### Phase 2: Differentiation (Elevate Above Competitors)

5. **Revenue attribution**
   - Connect email engagement to transactions
   - Show revenue per email, revenue per recipient
   - Configurable attribution window
   - *Rationale:* Largest capability gap; proves email ROI

6. **Industry benchmarks**
   - Partner with benchmark provider or build internal
   - Show Good/Fair/Poor ratings
   - Compare to industry and peer averages
   - *Rationale:* Klaviyo's standout feature; helps users interpret data

7. **Deliverability insights**
   - Breakdown by inbox provider (Gmail, Outlook, etc.)
   - Delivery error categorization
   - *Rationale:* High-volume senders need this for troubleshooting

8. **Custom report builder**
   - Drag-and-drop metric selection
   - Saved report templates
   - Scheduled delivery
   - *Rationale:* All competitors offer this flexibility

#### Phase 3: Advanced (Power User / Enterprise Features)

9. **Predictive engagement scoring**
   - Flag contacts likely to churn
   - Identify optimal send times per contact
   - *Rationale:* AI-driven features are table stakes at enterprise level

10. **Data warehouse export**
    - Snowflake/BigQuery/Redshift integration
    - Raw event export for BI tools
    - *Rationale:* Enterprise requirement for custom analytics

11. **Advanced A/B testing**
    - Content and send time testing
    - Multivariate support
    - Statistical significance indicators
    - Auto-winner selection
    - *Rationale:* Current offering is basic vs. competitors

---

### Competitive Intelligence Sources

| Competitor | Documentation Reviewed |
|------------|------------------------|
| Braze | [Email Reporting](https://www.braze.com/docs/user_guide/channels/email/reporting), Deliverability Center, Report Builder |
| Klaviyo | [Campaign Analytics](https://help.klaviyo.com/hc/en-us/articles/115005258568), Deliverability Tab, Benchmarking |
| Mailchimp | Reports feature documentation, AI analytics announcements |
| HubSpot | Email analytics documentation, Marketing Hub features |

---

## Appendix: URL Patterns

| View | Pattern | Example |
|------|---------|---------|
| Default Report | `/campaigns/reports/mailout/{mailoutId}` | `/campaigns/reports/mailout/u7h4dLdct06R4wje0HsEdQ` |
| New Dashboard | `/email/mailout/reports/{dashboardId}` | `/email/mailout/reports/rgx7jy5rclwny4h313hf0zs4gn04k_...` |
| Mailout Dashboard | `/campaigns/Mailout/Dashboard/{mailoutId}` | `/campaigns/Mailout/Dashboard/8dcILt4H2UCrzgje-SNxkg` |
| Recipients | `/email/viewrecipients?mailoutId={id}&request={filter}` | Various filter options |

---

## Audit Completion

- [x] Default mailout report (standard) captured
- [x] Default mailout report (A/B testing) captured
- [x] New dashboard Overview tab captured
- [x] New dashboard Links reporting tab captured
- [x] Mailout Dashboard summary captured
- [x] Comparison analysis completed
- [x] Roadmap implications documented
- [x] Competitive analysis (Braze, Klaviyo, Mailchimp, HubSpot) completed
- [x] Feature gap matrix documented
- [x] Prioritized roadmap recommendations added
