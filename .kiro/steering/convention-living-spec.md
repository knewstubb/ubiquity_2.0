---
inclusion: always
description: Defines the product-level living spec — a single summarised document that aggregates completed feature specs into a coherent product overview. Maintained by the Delivery Lead at the end of each feature.
---

# Living Spec Convention

## Purpose

The living spec (`specs/product-spec.md`) is the single-document view of what the product *is* — not what it will be, not what it was, but what has been built and shipped. It is a summarised, maintained aggregation of individual feature specs.

Individual feature specs (in `specs/<feature>/`) are the detailed, authoritative source. The living spec is the readable overview that lets someone new to the project understand the whole product in one sitting.

## Location

```
specs/
├── product-spec.md          ← the living spec
├── feature-a/
│   ├── requirements.md
│   ├── design.md
│   ├── tasks.md
│   ├── test-plan.md
│   ├── capability-audit.md
│   └── delivery-log.md
├── feature-b/
│   └── ...
```

## Structure

```markdown
# Product Spec: <Product Name>

> Last updated: <ISO date>
> Maintained by: Delivery Lead

## Product Overview
<2–3 paragraphs: what this product is, who it serves, what outcomes it drives.>

## Feature Index

| Feature | Status | Owner | Spec Folder | Added |
|---------|--------|-------|-------------|-------|
| <name> | shipped / in-progress / planned | <PM who scoped it> | `specs/<feature>/` | <date> |

---

## <Feature Name>

### Summary
<1–2 paragraphs distilled from requirements.md: the problem, the users, the outcome.>

### Key Decisions
<3–5 bullets: the most important design, architecture, and operations decisions — distilled from design.md.>

### Acceptance Criteria (Summary)
<The EARS criteria from requirements.md, condensed to the top-level stories only. Link to full spec for detail.>

### Known Limitations & Deferred Scope
<What was explicitly cut from this release, distilled from requirements.md out-of-scope and design trade-offs.>

### Refs
- Full spec: `specs/<feature>/requirements.md`
- Design: `specs/<feature>/design.md`
- Delivery log: `specs/<feature>/delivery-log.md`

---

## <Next Feature>
...
```

## Rules

- **Summarise, don't duplicate.** The living spec is a digest. If someone needs the full acceptance criteria, data model, or test plan, they follow the ref link to the feature spec.
- **Update on feature completion.** The Delivery Lead adds or updates the feature's section in the living spec as part of closing a feature (after the release gate passes). Not before — the living spec reflects what *is*, not what's in progress.
- **In-progress features get an index entry only.** A row in the Feature Index with status `in-progress` and a link to the spec folder. No summary section until shipped.
- **Reflect reality.** If a shipped feature's behavior changes (bug fix that alters AC, scope change, deprecation), the living spec section is updated to match. The feature spec folder is the audit trail; the living spec is the current truth.
- **Keep it scannable.** Each feature section should be readable in under 2 minutes. If it's longer, you're duplicating too much from the feature spec.
- **Product Overview evolves.** As features ship, the Product Overview paragraph may need updating to reflect the product's expanded scope. The Delivery Lead updates it; the PM reviews.

## Ownership

- **Maintained by:** Delivery Lead (as part of feature close-out).
- **Reviewed by:** Product Manager (for accuracy of problem/outcome framing).
- **Consumed by:** Everyone — especially new team members, the Talent Manager (for capability audits), and the user (for product-level visibility).

## Provenance

- **Authored:** 2026-04-22 by Talent Manager
- **Motivated by:** User request for a product-level living spec that aggregates feature specs.
