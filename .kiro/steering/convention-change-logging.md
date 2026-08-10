---
inclusion: always
description: Mandatory rules for commit messages, change logging, and audit trails. Applies to both prototype and production builds. Every agent MUST follow these conventions — no exceptions.
---

# Change Logging Convention

**This is not optional.** Every code change must be traceable to its intent. Forgetting to log changes creates invisible debt — the next person (including future-you) has to reverse-engineer decisions from code alone.

This convention applies equally to **prototype builds** and **production builds**. The agents working here operate across both contexts.

---

## The Rule

> **No commit without context. No context without a commit.**

If you changed code, commit it with a message that explains *what* and *why*.
If you made a decision, record it where someone can find it.

---

## Commit Message Format

Every commit message follows this structure:

```
<type>(<scope>): <subject>

<body — the WHY>

Refs: <spec-folder or ticket>
```

### Required Elements

| Element | Rule |
|---------|------|
| **Type** | One of: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`, `perf` |
| **Scope** | Feature area or component name (e.g., `journey`, `account-sync`, `FilterBuilder`) |
| **Subject** | Imperative mood, max 70 chars, no period. Says *what* changed. |
| **Body** | 1–3 sentences explaining *why* this change was made. Not optional. |
| **Refs** | Link to spec folder (`specs/journey-builder/`) or ticket ID. Required for `feat` and `fix`. |

### Examples

**Good:**
```
feat(journey): add data source selector to branch conditions

Branch conditions now allow users to select which data source
(contact fields, event properties, or journey context) to filter on.
This addresses the UX gap where users couldn't distinguish field origins.

Refs: specs/journey-builder/
```

**Bad:**
```
fix stuff
```

```
feat(journey): add branch conditions
```
(Missing the *why* and the spec reference)

---

## Atomic Commits

One logical change per commit. If you're tempted to write "and" in the subject line, split it.

| Scenario | Commits |
|----------|---------|
| Add a feature + fix a bug you noticed | 2 commits |
| Refactor code + add a feature that uses the refactor | 2 commits (refactor first) |
| Update steering + update code to match | 2 commits |
| Fix typo in same file as your feature | 1 commit (trivial, same scope) |

**Exception:** Prototype scaffolding commits may bundle related files if they're genuinely indivisible (e.g., a new page + its route + its data file). Still requires a full commit message.

---

## When to Commit

Commit at these checkpoints — don't batch work into end-of-day mega-commits:

1. **Task completion** — When a `tasks.md` item moves to done
2. **Logical unit complete** — A component works, a flow is wired up, a bug is fixed
3. **Before context switch** — Switching features? Commit first.
4. **Before asking for review** — Never share uncommitted work

---

## Delivery Log Updates

For feature work, the `delivery-log.md` in the spec folder is the narrative record. Update it:

- When a task is completed
- When a decision is made that isn't obvious from the code
- When scope changes mid-flight
- When a loop-back or issue occurs

The delivery log answers: "What happened during this feature's development?"

---

## Agent Responsibilities

| Agent | Change Logging Duty |
|-------|---------------------|
| **Margaret (Developer)** | Commits code changes with full messages. Updates `delivery-log.md` for implementation decisions. |
| **Charity (DevOps)** | Commits infra/config changes. Documents operational decisions in delivery log. |
| **Dieter (Designer)** | Updates `design.md` when design decisions change. Flags when implementation diverges from spec. |
| **James (Tester)** | Logs test findings in delivery log. Commits test files with context. |
| **Gene (Delivery Lead)** | Verifies commits have proper messages before considering a task complete. Enforces this convention. |

---

## Enforcement

### Gate Check

The Delivery Lead (Gene) will not mark a task as complete unless:

1. All changes are committed
2. Commit messages include the *why*
3. Spec folder is referenced for `feat` and `fix` commits
4. `delivery-log.md` is updated for significant decisions

### Pre-Commit Reminder

Before making a commit, ask:

1. Could someone understand *why* this change exists from the message alone?
2. Is the spec folder or ticket referenced?
3. Is this atomic, or should it be split?

If any answer is "no," fix it before committing.

---

## Quick Reference Card

```
# Template
<type>(<scope>): <what changed — imperative, 70 chars max>

<why it changed — 1-3 sentences>

Refs: specs/<feature>/ or #<ticket>

# Types
feat     — new feature
fix      — bug fix
refactor — code restructure, no behavior change
style    — formatting, whitespace, naming
docs     — documentation only
test     — adding or fixing tests
chore    — build, tooling, dependencies
perf     — performance improvement

# Scopes (examples)
journey, account-sync, FilterBuilder, nav, auth, seed, billing
```

---

## Provenance

- **Authored:** 2026-08-11 by Delivery Lead (Gene)
- **Motivated by:** Audit trail gaps identified in commit history review. Changes were traceable to specs but not from commits to specs.
- **Applies to:** All agents, all repositories (prototype and production)
