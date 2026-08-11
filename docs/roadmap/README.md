# UbiQuity Roadmap Planning

> **Purpose:** Central location for roadmap planning, prioritisation research, and discovery documentation.
> **Last updated:** 2026-08-11
> **Maintained by:** Product Owner

---

## What This Is

This folder contains research, analysis, and documentation to support roadmap prioritisation for UbiQuity 2.0. It is the local working copy that complements the Confluence U.Lab process.

**This is not a backlog.** It's a research and decision-support layer.

## Folder Structure

```
docs/roadmap/
├── README.md                        ← You are here
├── discovery-canvas-framework.md    ← How we structure discovery
├── opportunity-sizing-guide.md      ← How we score and prioritise problems
├── pain-themes.md                   ← Clustered feedback from UTTPMO and support
├── items/                           ← Individual roadmap item research
│   ├── journey-builder.md
│   ├── reporting-overhaul.md
│   └── ...
└── research/                        ← Deep-dive research documents
    └── ...
```

## How This Relates to U.Lab

The Confluence U.Lab process is the source of truth for idea status:
- **Proposed** → Ideas captured, awaiting validation
- **Validating** → Active prototyping/research
- **Build** → Committed to development
- **Bury** → Killed with rationale

This local folder supports that process by:
1. Providing structured research that feeds into U.Lab idea briefs
2. Capturing pain themes from multiple sources (UTTPMO, support, sales)
3. Documenting the Discovery Canvas analysis before it goes to Confluence
4. Keeping prototype-specific context close to the code

## Key Documents

| Document | Purpose |
|----------|---------|
| [Discovery Canvas Framework](./discovery-canvas-framework.md) | How we structure outcome → problem → solution → experiment thinking |
| [Opportunity Sizing Guide](./opportunity-sizing-guide.md) | Scoring methodology for prioritisation |
| [Pain Themes](./pain-themes.md) | Clustered feedback from UTTPMO and other sources |

## Roadmap Items

Individual items in `items/` follow a consistent structure:
- Problem statement (from Discovery Canvas)
- Evidence (UTTPMO feedback, support tickets, usage data)
- Proposed solutions
- Opportunity sizing scores
- Prototype status (if applicable)

## Confluence References

- [U.Lab Home](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12297240711/U.Lab)
- [Idea Brief Template](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12297732115/Idea+Brief+Template)
- [Journey Builder Roadmap](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12671156493/Journey+Builder+Feature+Roadmap+Outline)

## Provenance

- **Created:** 2026-08-11
- **Motivated by:** Need for structured roadmap planning that integrates with U.Lab process and captures UTTPMO feedback systematically
