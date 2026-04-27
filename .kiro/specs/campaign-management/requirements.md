# Campaign Management — Requirements (Lightweight)

## Overview
Campaign containers that group related journeys around a business objective. Campaigns are the strategic layer; journeys are the tactical layer. Tag-based discovery enables cross-campaign findability.

## Scope
- Campaign list: grouped view with journey counts, status, date range
- Campaign creation: name, goal, time scope, team ownership
- Campaign detail: list of associated journeys, aggregate metrics
- Journey list within campaign: status, last run, entry count
- Tag system: channel (#email, #sms), audience (#new-customer), type (#onboarding)
- Search and filter: by campaign, tags, status, channel, last modified
- Campaign templates (future consideration)

## Sample Data
- 3-4 campaigns: "Q1 Wellness Push", "New Member Onboarding", "Re-engagement", "Holiday Special"
- 2-3 journeys per campaign

## Dependencies
- Account Hierarchy (campaigns scoped to account)
- Segmentation (campaigns target segments)

## Depends On This
- Journey Builder (journeys live inside campaigns)
- Analytics (campaign-level reporting)

## Nav Location
- Automations > Campaigns
