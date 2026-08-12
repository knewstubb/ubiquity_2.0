# UbiQuity 2.0 Documentation

> **Purpose:** Central index for all prototype documentation.
> **Last updated:** 2026-08-11

---

## Quick Navigation

| Need to... | Go to |
|------------|-------|
| Understand the system architecture | [architecture/](./architecture/) |
| Look up design tokens or patterns | [design-system/](./design-system/) |
| Find UX specs for a feature | [ux/](./ux/) |
| Understand roadmap priorities | [roadmap/](./roadmap/) |
| Review past audits | [audits/](./audits/) |
| Find end-user help content | [user-docs/](./user-docs/) |

---

## Folder Structure

```
docs/
├── README.md                 ← You are here
│
├── architecture/             ← System & technical documentation
│   ├── system-summary.md     ← High-level prototype overview
│   ├── backend-overview.md   ← Plain-English backend explanation
│   ├── backend-architecture.md ← Technical backend reference
│   └── account-sync-overview.md ← Account hierarchy sync
│
├── design-system/            ← UI tokens, patterns & guidelines
│   ├── tokens/               ← Typography, colour, spacing, etc.
│   ├── patterns/             ← Tables, forms, empty states, etc.
│   ├── iconography.md
│   └── responsive.md
│
├── ux/                       ← Per-feature UX specifications
│   ├── _template.md          ← Template for new UX specs
│   ├── audiences/
│   ├── campaigns/
│   ├── connectors/
│   └── ...
│
├── roadmap/                  ← Strategic planning & prioritisation
│   ├── discovery-canvas-framework.md
│   ├── opportunity-sizing-guide.md
│   ├── pain-themes.md        ← UTTPMO feedback analysis
│   ├── items/                ← Individual roadmap items
│   └── plans/                ← Implementation plans
│
├── audits/                   ← Point-in-time audits & analyses
│   └── (feature audits, gap analyses, migration audits)
│
└── user-docs/                ← End-user help documentation
    ├── billing/
    └── connectors/
```

---

## What Goes Where

| Content Type | Location | Example |
|--------------|----------|---------|
| How the system works | `architecture/` | Backend service overview |
| Design tokens & visual specs | `design-system/tokens/` | Typography, colours |
| Reusable UI patterns | `design-system/patterns/` | Table layouts, form rhythm |
| Feature UX specifications | `ux/{feature}/` | Connector wizard states |
| Roadmap item analysis | `roadmap/items/` | Journey Builder discovery |
| Implementation plans | `roadmap/plans/` | Exporter rollout sequence |
| Pain points & prioritisation | `roadmap/` | UTTPMO themes |
| Feature audits | `audits/` | Filter builder gap analysis |
| End-user help | `user-docs/` | Billing guide |

---

## Relationship to Other Locations

| This Repo | External |
|-----------|----------|
| `docs/roadmap/` | Confluence [U.Lab](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12297240711/U.Lab) |
| `docs/ux/` | Figma [UDS](https://www.figma.com/design/X09yFfjMsaiph3v71kggQO/UDS) |
| `.kiro/specs/` | Feature specifications (requirements, design, tasks) |
| `.kiro/steering/` | Agent conventions & project rules |

---

## Contributing

- **New feature UX?** Copy `ux/_template.md` into the appropriate folder
- **New roadmap item?** Use the template in `roadmap/discovery-canvas-framework.md`
- **Audit or analysis?** Add to `audits/` with date prefix if time-sensitive
- **Design system change?** Update the relevant file in `design-system/`
