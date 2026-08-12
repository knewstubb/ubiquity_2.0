# Prototype Documentation

Documentation about **this prototype repository** — the UbiQuity 2.0 interactive design prototype. These docs describe the prototype's implementation, design decisions, and UX patterns.

## Contents

### `/audits`
Audits of the prototype implementation:
- `page-header-audit.md` — Inventory of page header requirements
- `token-migration-audit.md` — UDS to shadcn/Tailwind token mapping
- `campaign-hub-design-decisions.md` — Design decisions for campaign hub prototype

### `/ux`
UX documentation for prototype pages and flows — what works, what's missing, interaction patterns.

### `/design-system`
Design system tokens, patterns, and guidelines for the prototype.

### Other Files
- `account-sync-overview.md` — Plain-English explanation of AccountSync feature (prototype concept)
- `design-tokens.md` — Design token reference

## Key Principle

Documentation in this folder **is expected** to reference:
- Prototype code paths (`src/`, component names)
- Prototype specs (`.kiro/specs/`)
- This repo's design system and tokens

This documentation is useful for understanding the prototype but should **NOT** be used as a reference for production system capabilities.

## Relationship to Production

The prototype explores UX patterns and validates ideas before production implementation. Prototype capabilities may or may not reflect what exists (or will exist) in production UbiQuity.
