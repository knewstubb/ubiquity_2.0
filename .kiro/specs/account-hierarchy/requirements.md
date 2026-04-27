# Account Hierarchy & Permissions — Requirements (Lightweight)

## Overview
Multi-level account tree with cascading permissions. Master account manages child accounts (regional spas). Users are assigned permission groups that cascade down the tree with per-account overrides.

## Scope
- Account tree visualisation (parent → child → grandchild)
- Account switcher in nav (context selector)
- User management: add/remove users, assign to accounts
- Permission groups: predefined (Admin, Manager, Viewer) + custom
- Cascading access: parent access grants child access automatically
- Per-account overrides: deselect specific children
- Two views: user-centric (which accounts can this user access?) and account-centric (which users have access to this account?)

## Sample Data (Spa Chain)
- Master: Serenity Spa Group (National)
- Children: Auckland, Wellington, Christchurch, Queenstown
- Users: National Admin, Regional Managers, Marketing Coordinators

## Dependencies
- None (foundation spec)

## Depends On This
- Audience Management, Campaign Management, Analytics (all scoped to account context)

## Nav Location
- Settings > Users & Permissions
- Account switcher in primary nav bar

## Reference
- Confluence: https://sparknz.atlassian.net/wiki/spaces/UB/pages/12633669684/Permissions+Management
