---
inclusion: always
description: Defines the product-level technical debt register — a single document that tracks known debt across the codebase, infrastructure, and process. Any agent can log debt; the Delivery Lead owns the register; the PM prioritises paydown.
---

# Technical Debt Register Convention

## Purpose

The tech debt register (`specs/tech-debt-register.md`) is the single place where the team records, classifies, and tracks known technical debt across the entire product. It prevents debt from hiding in TODO comments, stale tickets, or someone's memory.

Debt that is not written down is debt that compounds silently.

## Location

```
specs/
├── product-spec.md
├── tech-debt-register.md    ← the register
├── feature-a/
│   └── ...
```

## What counts as tech debt

Anything the team knowingly ships or discovers that will cost more to fix later than it would to fix now, but that the team has chosen to defer. Categories:

| Category | Examples |
|----------|---------|
| Code | Premature abstraction, duplicated logic, missing validation, hardcoded values, untyped boundaries, dead code |
| Architecture | Tight coupling, missing service boundary, synchronous call that should be async, schema that doesn't scale |
| Infrastructure | Manual resource, missing IaC, snowflake config, unrotated secrets, missing DR rehearsal |
| Observability | Missing alerts, noisy alerts, ungrafted dashboards, missing traces on critical paths |
| Testing | Missing coverage on critical path, flaky tests, no contract tests, no load test baseline |
| Security | Known CVE deferred, overly broad IAM role, missing input validation on low-risk endpoint |
| Documentation | Stale runbook, missing API docs, design.md drift from implementation |
| Process | Recurring manual step that should be automated, handoff gap that keeps causing loop-backs |

## Structure

```markdown
# Technical Debt Register

> Last updated: <ISO date>
> Owned by: Delivery Lead
> Prioritised by: Product Manager

## Summary

- **Total items:** <n>
- **Critical:** <n> | **High:** <n> | **Medium:** <n> | **Low:** <n>
- **Oldest unresolved:** <date> — <title>

---

## <ID>: <Short title>
- **Category:** <code | architecture | infrastructure | observability | testing | security | documentation | process>
- **Severity:** <critical | high | medium | low>
- **Logged:** <ISO date> by <role>
- **Feature origin:** <feature name or "cross-cutting"> — `specs/<feature>/`
- **Description:** <1–3 sentences: what the debt is, why it exists, what it costs to leave it.>
- **Impact if unresolved:** <what gets worse over time — performance, security, velocity, correctness, cost>
- **Proposed fix:** <brief — what would resolve it, estimated effort>
- **Blocked by:** <dependency, if any>
- **Status:** open | in-progress | resolved | accepted-risk
- **Resolved:** <ISO date, if resolved> — <how>

---
```

## Rules

- **Anyone can log debt.** The Developer, DevOps Engineer, Tester, Designer, or Talent Manager can add an entry when they encounter or create debt. The Delivery Lead ensures it gets into the register.
- **Log at the moment of creation.** When a feature ships with a known shortcut, deferred scope item, or accepted risk, the entry goes in *at ship time*, not "when we get around to it."
- **Severity is about compounding cost, not current pain.** A medium-pain item that gets worse every sprint is higher severity than a high-pain item that stays constant.
- **The PM prioritises paydown.** Debt items compete with feature work for team attention. The PM decides when to schedule paydown based on severity, compounding rate, and opportunity cost. The Delivery Lead surfaces the register to the PM periodically.
- **Resolved items stay in the register.** Mark them `resolved` with a date and method. They're the team's evidence that debt gets paid, and the Talent Manager's signal for what kinds of debt recur.
- **Accepted risk is a valid status.** Some debt is cheaper to carry than to fix. Mark it `accepted-risk` with a rationale and a review date. Revisit on that date.
- **IDs are sequential.** `TD-001`, `TD-002`, etc. Simple, greppable, referenceable from delivery logs and commit messages.

## Sources of debt entries

| Trigger | Who logs | How |
|---------|----------|-----|
| Feature ships with known shortcut | Developer or DevOps | Entry at feature close-out, Delivery Lead ensures it's captured |
| Deferred out-of-scope item from requirements | PM | Delivery Lead transfers from requirements.md out-of-scope to register if it implies debt |
| Post-mortem action item | DevOps | Action item becomes a register entry if it's not immediately fixed |
| Tester finds a gap that's deferred | Tester | Logs the entry; Delivery Lead confirms severity |
| Talent Manager audit finds stale docs or process gap | Talent Manager | Logs the entry |
| Code review surfaces existing debt | Developer | Logs the entry |
| Periodic review surfaces compounding item | Delivery Lead | Promotes from "noticed" to formal entry |

## Periodic review

The Delivery Lead surfaces the register to the PM quarterly (or after every 3 features, whichever comes first) with a short summary:

- New items since last review
- Items whose severity has increased
- Items past their accepted-risk review date
- Recommended paydown candidates for the next cycle

## Ownership

- **Register maintained by:** Delivery Lead
- **Entries logged by:** Any agent
- **Paydown prioritised by:** Product Manager
- **Consumed by:** Everyone — especially the Developer (before architecture decisions), DevOps (before platform changes), and Talent Manager (for capability audits)

## Provenance

- **Authored:** 2026-04-22 by Talent Manager
- **Motivated by:** User request for a product-wide technical debt register.
