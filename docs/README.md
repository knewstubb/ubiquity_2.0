# UbiQuity Documentation

> **Purpose:** Central index for all documentation — clearly separated between production system docs and prototype docs.
> **Last updated:** 2026-08-12

---

## Quick Navigation

| Need to... | Go to |
|------------|-------|
| Understand the **production** backend | [production/architecture/](./production/architecture/) |
| Review audits of **production/staging** | [production/audits/](./production/audits/) |
| Understand **prototype** UX patterns | [prototype/ux/](./prototype/ux/) |
| Look up **prototype** design tokens | [prototype/design-system/](./prototype/design-system/) |
| Understand roadmap priorities | [roadmap/](./roadmap/) |
| Find end-user help content | [user-docs/](./user-docs/) |

---

## Folder Structure

```
docs/
├── README.md                 ← You are here
│
├── production/               ← About the LIVE PRODUCTION SYSTEM
│   ├── README.md             ← What's in this folder
│   ├── architecture/         ← How production UbiQuity works
│   │   ├── backend-overview.md
│   │   ├── backend-architecture.md
│   │   └── system-summary.md
│   └── audits/               ← Audits of staging/production builds
│       ├── campaign-visibility-gap-analysis.md
│       ├── filter-builder-audit.md
│       ├── filter-builder-gap-analysis.md
│       ├── connectors-staging-audit.md
│       └── campaigns-mailout-audit.md
│
├── prototype/                ← About THIS PROTOTYPE REPO
│   ├── README.md             ← What's in this folder
│   ├── account-sync-overview.md  ← Prototype concept doc
│   ├── design-tokens.md      ← Prototype token reference
│   ├── audits/               ← Audits of prototype implementation
│   │   ├── page-header-audit.md
│   │   ├── token-migration-audit.md
│   │   └── campaign-hub-design-decisions.md
│   ├── ux/                   ← Per-feature UX specifications
│   │   ├── _template.md
│   │   ├── audiences/
│   │   ├── campaigns/
│   │   ├── connectors/
│   │   └── ...
│   └── design-system/        ← UI tokens, patterns & guidelines
│       ├── tokens/
│       ├── patterns/
│       └── ...
│
├── roadmap/                  ← Strategic planning & prioritisation
│   ├── discovery-canvas-framework.md
│   ├── opportunity-sizing-guide.md
│   ├── pain-themes.md
│   ├── items/                ← Individual roadmap items
│   └── plans/                ← Implementation plans
│
└── user-docs/                ← End-user help documentation
    ├── billing/
    └── connectors/
```

---

## Production vs Prototype: How to Tell the Difference

| If the doc references... | It belongs in... |
|--------------------------|------------------|
| `stagingengage.ubiquity.nz`, production URLs | `production/` |
| Production database tables, schemas | `production/` |
| Confluence docs about the live system | `production/` |
| `src/`, component paths in this repo | `prototype/` |
| `.kiro/specs/`, prototype specs | `prototype/` |
| This repo's design tokens or UX patterns | `prototype/` |
| ADO tickets, roadmap planning | `roadmap/` |

---

## What Goes Where

| Content Type | Location | Example |
|--------------|----------|---------|
| How production backend works | `production/architecture/` | Backend service overview |
| Staging/production audits | `production/audits/` | Filter builder gap analysis |
| Prototype UX specifications | `prototype/ux/{feature}/` | Connector wizard states |
| Prototype design tokens | `prototype/design-system/tokens/` | Typography, colours |
| Prototype UI patterns | `prototype/design-system/patterns/` | Table layouts, form rhythm |
| Prototype audits | `prototype/audits/` | Page header inventory |
| Roadmap item analysis | `roadmap/items/` | Journey Builder discovery |
| Implementation plans | `roadmap/plans/` | Exporter rollout sequence |
| End-user help | `user-docs/` | Billing guide |

---

## Relationship to Other Locations

| This Repo | External |
|-----------|----------|
| `docs/roadmap/` | Confluence [U.Lab](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12297240711/U.Lab) |
| `docs/prototype/ux/` | Figma [UDS](https://www.figma.com/design/X09yFfjMsaiph3v71kggQO/UDS) |
| `.kiro/specs/` | Feature specifications (requirements, design, tasks) |
| `.kiro/steering/` | Agent conventions & project rules |

---

## Contributing

- **New production audit?** Add to `production/audits/` — reference staging URLs, not prototype code
- **New prototype UX spec?** Copy `prototype/ux/_template.md` into the appropriate folder
- **New roadmap item?** Use the template in `roadmap/discovery-canvas-framework.md`
- **Prototype design change?** Update the relevant file in `prototype/design-system/`
