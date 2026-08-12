# Competitor Email Report Features

> Researched: 2026-08-13
> Purpose: Identify best-in-class email campaign reporting features for UbiQuity 2.0 mailout reports

## Summary

This document captures email campaign reporting features from six major ESPs (Email Service Providers) to inform our mailout report design. Key themes:

1. **Benchmarking** — Most competitors show how campaigns perform vs industry/account averages
2. **Visual engagement** — Click maps, heatmaps, and link overlays are standard
3. **Time-based analysis** — Opens/clicks over time (hourly, 24-hour, multi-day)
4. **Geographic data** — Top locations by country/region
5. **Deliverability breakdown** — By domain/ISP to identify inbox placement issues
6. **Revenue attribution** — E-commerce integrations showing orders and revenue per campaign

---

## Klaviyo

**Source:** [Klaviyo Help Center — Campaign Performance](https://help.klaviyo.com/hc/en-us/articles/115002774932)

### Overview Tab
- **30-day performance snapshot** — Key metrics displayed with trend indicators
- **Benchmarking system** — Rates categorized as Poor / Fair / Good / Excellent based on industry standards
- **Recipient activity tabs:**
  - Received
  - Opened
  - Clicked
  - Bounced
  - Unsubscribed
  - Marked as spam

### Audience Tab
- Breakdown by **segment or list** the campaign was sent to
- Performance comparison across different audience groups

### Link Activity Tab
- **All links tracked** with click counts and unique clicks
- **UTM parameter visibility** — Shows full tracking URLs
- Click-through rates per link

### Conversions Tab
- Revenue attributed to campaign
- Orders placed
- Conversion rate
- Attribution window settings

### Deliverability Tab
- **Breakdown by email provider** (Gmail, Yahoo, Outlook, etc.)
- **Breakdown by domain**
- **Breakdown by country**
- Helps identify deliverability issues with specific ISPs

### Watch Live Tab
- Real-time activity feed as recipients engage
- Shows opens and clicks as they happen

### Key Takeaways for UbiQuity
- Benchmarking visualization (Poor/Fair/Good/Excellent) is highly user-friendly
- Deliverability by provider/domain is valuable for troubleshooting
- Separate tabs keep complex data organized

---

## Mailchimp

**Source:** [Mailchimp Help — Campaign Reports](https://mailchimp.com/help/about-email-campaign-reports/)

### Overview Section
- **Orders and revenue** (for connected stores)
- **Click performance** — Links ranked by clicks
- **Click map** — Visual overlay on email showing where clicks occurred
- **24-hour performance graph** — Opens and clicks over time

### Top Locations
- **Geolocation map** — Shows where recipients opened
- Country and city breakdown

### Social Performance
- Shares and engagement from social integrations
- Facebook, Twitter engagement tracking

### E-commerce Tab
- **Purchase breakdown** by product
- Revenue per product
- First-time vs repeat buyers
- Average order value

### Campaign Benchmarking
- Compare to **industry averages**
- Compare to **your own account history**

### Subscriber Activity
- Individual recipient engagement tracking
- Who opened, clicked, unsubscribed

### Key Takeaways for UbiQuity
- Click map overlay is highly visual and intuitive
- 24-hour performance graph shows engagement patterns
- E-commerce integration is deep (product-level attribution)

---

## Brevo (formerly Sendinblue)

**Source:** [Brevo Help — Email Campaign Statistics](https://help.brevo.com/hc/en-us/articles/208848449)

### Deliverability Breakdown
- **By email domain** — Performance for Gmail, Yahoo, Outlook, etc.
- Helps identify which providers have issues

### Opens Analysis
- **Opens by hour chart** — When recipients are engaging
- Total opens vs unique opens

### Click Analysis
- **Clicks heatmap** — Visual representation on email template
- Link-by-link breakdown
- Click-to-open rate (CTOR)

### Geographic Distribution
- **Map visualization** — Distribution by country
- Regional breakdown

### Conversions Tab
- Goal tracking (if configured)
- Conversion rate
- Value per conversion

### Revenue Tracking
- **First-time buyers** identified
- Total revenue attributed
- Revenue per recipient

### Unsubscribe Analysis
- **Reasons survey** — Why people unsubscribed
- Unsubscribe rate benchmarking

### A/B Test Details
- Winning variant performance
- Statistical significance
- Variant comparison charts

### Key Takeaways for UbiQuity
- Unsubscribe reasons survey is unique and valuable
- Opens by hour helps optimize send times
- Domain-level deliverability is standard

---

## ActiveCampaign

**Source:** [ActiveCampaign Help — Campaign Reports](https://help.activecampaign.com/hc/en-us/articles/220220807)

### All Campaigns Report
- **Aggregate view** across all campaigns
- Filter by date range, campaign type, tags
- Trend analysis over time

### Individual Campaign Performance
- Standard metrics (opens, clicks, bounces, unsubscribes)
- **Mail Privacy Protection (MPP) opens filter** — Separates Apple MPP opens from real opens
- Unique vs total engagement

### Comparison Features
- **Compare to account average** — How this campaign performed vs your history
- **Compare to campaign type** — Newsletter vs promotional, etc.

### E-commerce Integration
- Revenue attribution
- Orders per campaign
- Revenue per recipient

### Automation Reports
- For automated campaigns: entry/exit rates, wait times, goal completion

### Key Takeaways for UbiQuity
- MPP filter is increasingly important as Apple Mail usage grows
- Aggregate reporting across campaigns helps identify trends
- Campaign type comparison adds useful context

---

## Campaign Monitor

**Source:** [Campaign Monitor Knowledge Base](https://www.campaignmonitor.com/resources/knowledge-base/)

### Marketing Monitor
- **Industry benchmarks** — Compare to similar businesses
- Trend tracking over time
- Health score for email program

### Link Activity
- **Overlay view** — Clicks shown on email preview
- **Heatmap** — Color-coded click intensity
- Link-level statistics

### Opens & Clicks Over Time
- Timeline graph showing engagement decay
- Identifies when most engagement occurs
- Useful for optimizing send times

### Subscriber Activity
- Individual engagement tracking
- Engagement scoring per subscriber

### World Map
- Geographic distribution of opens
- Country-level breakdown

### Key Takeaways for UbiQuity
- Industry benchmarks create valuable context
- Overlay + heatmap views are complementary
- Engagement decay timeline is useful

---

## HubSpot

**Source:** [HubSpot Knowledge Base — Email Analytics](https://knowledge.hubspot.com/email/analyze-your-marketing-email-campaign-results)

### Performance Dashboard
- Opens, clicks, replies, bounces, unsubscribes
- Delivery rate and health metrics
- Spam report tracking

### Engagement Over Time
- 24-hour and 7-day performance graphs
- Peak engagement identification

### Contact-Level Tracking
- Individual recipient engagement
- Integrates with CRM contact records
- Activity timeline per contact

### Click Analysis
- Link-by-link breakdown
- Button vs text link performance

### Device and Client
- Email client breakdown (Gmail, Outlook, Apple Mail)
- Device type (desktop, mobile, tablet)

### Revenue Attribution
- For HubSpot CRM users: deal attribution
- Marketing attribution models

### Key Takeaways for UbiQuity
- CRM integration makes recipient-level insights powerful
- Device and client breakdown is standard
- Reply tracking is unique to HubSpot (for sales sequences)

---

## Feature Comparison Matrix

| Feature | Klaviyo | Mailchimp | Brevo | ActiveCampaign | Campaign Monitor | HubSpot |
|---------|---------|-----------|-------|----------------|------------------|---------|
| Open rate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Click rate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Click-to-open rate (CTOR) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Bounce breakdown | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Unsubscribe tracking | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Click map/heatmap** | — | ✓ | ✓ | — | ✓ | — |
| **Link overlay** | — | ✓ | ✓ | — | ✓ | — |
| Opens over time | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Deliverability by domain** | ✓ | — | ✓ | — | — | — |
| Geographic breakdown | — | ✓ | ✓ | — | ✓ | — |
| Device breakdown | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Industry benchmarks** | ✓ | ✓ | — | — | ✓ | — |
| Account average comparison | ✓ | ✓ | — | ✓ | — | — |
| Revenue attribution | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| A/B test reporting | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **MPP filter** | ✓ | ✓ | — | ✓ | — | ✓ |
| Real-time activity | ✓ | — | — | — | — | — |
| Unsubscribe reasons | — | — | ✓ | — | — | — |

---

## Recommendations for UbiQuity

### Must-Have Features
1. **Core metrics** — Open rate, click rate, CTOR, delivery rate, bounce rate, unsubscribe rate
2. **Opens/clicks over time** — Hourly or 24-hour graph
3. **Device breakdown** — Desktop, mobile, tablet
4. **Link performance table** — All links with click counts

### Should-Have Features
1. **Click map/heatmap** — Visual engagement on email preview
2. **Benchmarking** — Compare to account average or industry
3. **Deliverability by domain** — Gmail, Outlook, Yahoo breakdown
4. **Geographic breakdown** — Top countries/regions

### Nice-to-Have Features
1. **MPP filter** — Separate Apple Mail Privacy opens
2. **Revenue attribution** — If e-commerce integration exists
3. **Real-time activity feed** — Live engagement view
4. **Unsubscribe reasons** — Survey integration

### UX Patterns to Adopt
1. **Tab-based organization** (Klaviyo) — Keeps complex data manageable
2. **Poor/Fair/Good/Excellent badges** (Klaviyo) — Instant performance context
3. **24-hour performance graph** (Mailchimp) — Standard visualization
4. **Overlay + heatmap options** (Campaign Monitor) — Two views for link clicks

---

## Current UbiQuity Implementation

Our current `MailoutReportPage` includes:
- ✅ Stat cards (CTR, CTOR, open rate, delivery rate)
- ✅ Engagement breakdown bars
- ✅ Device breakdown pie chart
- ✅ Hourly activity chart
- ✅ Links performance table

### Gaps to Address
- ❌ Click map/heatmap visualization
- ❌ Benchmarking against account average
- ❌ Deliverability by domain breakdown
- ❌ Geographic distribution
- ❌ MPP opens filtering

---

## References

- [Klaviyo Campaign Performance](https://help.klaviyo.com/hc/en-us/articles/115002774932)
- [Mailchimp Email Campaign Reports](https://mailchimp.com/help/about-email-campaign-reports/)
- [Brevo Email Statistics](https://help.brevo.com/hc/en-us/articles/208848449)
- [ActiveCampaign Campaign Reports](https://help.activecampaign.com/hc/en-us/articles/220220807)
- [Campaign Monitor Knowledge Base](https://www.campaignmonitor.com/resources/knowledge-base/)
- [HubSpot Email Analytics](https://knowledge.hubspot.com/email/analyze-your-marketing-email-campaign-results)
