# Audience Management — Requirements (Lightweight)

## Overview
Contact database browser with profile views, activity timelines, and manual entry. Contacts are scoped to the active account. The contact profile is the central atom — everything (journeys, segments, transactions) links back to it.

## Scope
- Contact list with search, sort, and column configuration
- Contact profile page: details, custom attributes, activity timeline
- Activity timeline: journey events, email opens, form submissions, transactions
- Manual contact creation and inline editing
- Bulk operations: tag, delete, export selection
- "See all journeys this contact is in" with navigation links
- Contact database schema viewer (field definitions)

## Sample Data
- ~50 sample contacts with realistic NZ names, emails, membership tiers
- Activity history entries (email sent, form submitted, journey entered)
- Transactional records linked to contacts

## Dependencies
- Account Hierarchy (contacts scoped to account)

## Depends On This
- Segmentation, Journey Builder, Analytics (all reference contacts)

## Nav Location
- Audiences > Databases
