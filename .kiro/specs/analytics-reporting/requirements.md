# Analytics & Reporting — Requirements (Lightweight)

## Overview
Multi-level reporting across the AAA framework. Journey performance, campaign attribution, customer intelligence, and workspace dashboards. Fluid navigation from reports → customer lists → individual profiles.

## Scope

### Dashboards
- Workspace overview: total contacts, active journeys, sends this period
- Channel mix: email vs SMS performance
- Key metrics cards with trend indicators

### Journey Reports
- Step-by-step funnel visualisation (overlay on journey canvas)
- Customer counts at each node
- Drop-off rates between steps
- Bottleneck identification: "50 customers stuck at Wait for Email Open"
- Click-through from stuck customers → customer list → individual profile

### Campaign Reports
- Cross-journey attribution: did the campaign hit its goal?
- Aggregate metrics across all journeys in a campaign

### Customer Intelligence
- Individual profile activity timeline (shared with Audience Management)
- Segment membership and engagement scores
- "All journeys this contact is in" with status

### Report Filters
- Uses shared filter builder component
- Date range, segment, channel, campaign filters

## Sample Data
- Pre-populated dashboard with realistic metrics
- Journey report with sample funnel data
- 2-3 stuck customers to demonstrate drill-down flow

## Dependencies
- Journey Builder (journey reports reference journey structure)
- Campaign Management (campaign-level reporting)
- Audience Management (customer drill-down)
- Segmentation (filter builder for report filters)

## Depends On This
- Nothing (leaf node in dependency graph)

## Nav Location
- Analytics > Dashboards, Reports, Activity
