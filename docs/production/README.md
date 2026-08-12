# Production UbiQuity Documentation

Documentation about the **live production UbiQuity system** — audits of staging/production builds, architecture explanations of the backend, and research based on actual system behaviour.

## Contents

### `/audits`
Audits conducted against the staging or production UbiQuity system:
- `campaign-visibility-gap-analysis.md` — Analysis of legacy campaign/mailout structure
- `filter-builder-audit.md` — Research on filter builder conditions and architecture
- `filter-builder-gap-analysis.md` — Gap analysis for filter builder modernisation
- `connectors-staging-audit.md` — Audit of connectors staging build
- `campaigns-mailout-audit.md` — Audit of campaign/mailout functionality

### `/architecture`
Plain-English and technical explanations of how production UbiQuity works:
- `backend-overview.md` — How the backend works (plain English)
- `backend-architecture.md` — Technical backend architecture reference
- `system-summary.md` — System summary

## Key Principle

Documentation in this folder should reference:
- Staging/production URLs (`stagingengage.ubiquity.nz`, etc.)
- Production database tables and schemas
- Confluence documentation about the live system
- ADO work items

Documentation should **NOT** reference:
- Prototype code paths (`src/`, `.kiro/specs/`)
- Prototype component implementations
- This repo's design system or UX docs
