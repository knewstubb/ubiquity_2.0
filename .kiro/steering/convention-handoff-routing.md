---
inclusion: always
description: The team's shared routing playbook. Defines the forward handoff chain, per-handoff fitness gates, and the issue-triage taxonomy used when a bug or concern is raised. Consumed by every agent; applied primarily by the Delivery Lead; maintained by the Talent Manager.
---

# Handoff & Routing Convention

This file is the team's shared routing rulebook. When an issue is raised or a handoff is imminent, this is the first reference. It is maintained by the Talent Manager as the team learns.

## Forward Handoff Chain

```
User → Product Manager → UI/UX Designer ┐
                                         ├→ (Developer + DevOps in parallel) → Tester → Release
                                         ┘
```

The Delivery Lead gates each handoff. Developer and DevOps operate in parallel after the Designer's handoff — the Developer owns application architecture and implementation; the DevOps agent owns operations, platform, and release mechanics. Both feed the Tester jointly.

## Per-Handoff Fitness Gates

A handoff is open only when the upstream deliverable satisfies its specific gate. The Delivery Lead verifies these before invoking the next role.

| From → To | Gate |
|---|---|
| User → PM | Context-sufficiency checklist answered (users, outcome, envelope, constraints). |
| PM → Designer | `requirements.md`: EARS acceptance criteria per story; success metrics; explicit in/out-of-scope; non-negotiable UX constraints flagged. |
| PM → Developer/DevOps (for architecture) | As above + NFRs named (availability, latency, data sensitivity, compliance envelope, cost ambition). |
| Designer → Developer | `design.md` UX section: every screen has all states (default/loading/empty/error/success/partial); every control has keyboard behavior; final copy (no placeholders); responsive behavior declared; accessibility asserted. |
| Developer (arch) → Developer (impl) | `design.md` Architecture section: components, data model, API surface, cross-cutting concerns, security review, rollout/rollback. `tasks.md` exists with refs to requirements & design. |
| DevOps → Pre-release | SLO dashboards live; alerts tested; rollback rehearsed in staging within 30 days; security scans clean or accepted with rationale; cost alerts wired. |
| Developer → Tester | Relevant `tasks.md` items complete with passing tests; feature reachable in staging; known-gap list declared. |
| Tester → Release | Every AC has a passing automated test; every design state exercised; a11y + perf checks pass; no open Sev1/Sev2; release quality bar satisfied jointly with DevOps. |

If a gate fails, the upstream role is re-invoked with the specific gap list. Do not pass a half-deliverable downstream.

## Issue Triage Taxonomy

When a bug, concern, or question is raised, classify by **root cause**, not symptom. Route to the **accountable** role; invoke others as supporting.

| Symptom / Issue Type | Primary Owner | Typical Supporting | Notes & Sequence |
|---|---|---|---|
| Requirement ambiguous or untestable | PM | — | Fix `requirements.md` first. Downstream resumes after. |
| Success metric / scope disagreement | PM | User | Escalate to user if product judgment needed. |
| Missing UI state (loading / empty / error / partial) | Designer | Developer | Designer specs → Developer implements → Tester re-verifies. |
| Generic or off-brand error / empty / 404 copy | Designer | Developer | Same sequence. *Classic loop-back: do not let Developer improvise copy.* |
| Flow or navigation gap (entry/exit/back behavior) | Designer | Developer | Same sequence. |
| Visual regression, layout broken at breakpoint | Designer | Developer | Designer confirms intent; Developer fixes implementation. |
| Inconsistent with design system | Designer | Developer | Designer decides: deviate with rationale, or conform. |
| Interaction timing / motion wrong | Designer | Developer | Designer owns the spec; Developer tunes. |
| Accessibility — missing from spec | Designer | Developer | Design gap: Designer specs → Developer implements. |
| Accessibility — spec'd but not implemented | Developer | Designer (review) | Implementation gap. |
| Keyboard / focus order incorrect | Developer | Designer (if spec ambiguous) | Usually impl; Designer only if the spec didn't say. |
| Screen-reader label missing or wrong | Developer | Designer (if copy absent in spec) | Usually impl; Designer if the label wasn't specified. |
| Color contrast fail | Designer | Developer | Designer decides replacement token; Developer applies. |
| Business-logic bug | Developer | — | |
| Input validation failure / edge-case handling | Developer | — | |
| API contract / schema mismatch | Developer | DevOps (if cross-service) | |
| Data inconsistency / migration issue | Developer | DevOps | Data changes often need both. |
| Race condition / concurrency bug | Developer | DevOps (if infra-mediated) | |
| Happy-path performance regression | Developer | DevOps (if env-dependent) | Profile first; route by finding. |
| Load / scale performance issue | DevOps | Developer | Often capacity + code; jointly owned. |
| Availability / reliability / outage behavior | DevOps | Developer | |
| Deployment / rollback / canary / flag issue | DevOps | Developer | |
| Cost surprise / runaway resource | DevOps | Developer (if workload-driven) | |
| Observability gap (missing log / metric / alert) | DevOps | Developer (if instrumentation change needed) | |
| Runbook gap | DevOps | — | |
| Security — input validation, XSS, injection, IDOR | Developer | DevOps (WAF / IAM context) | App-layer defect. |
| Security — auth flow / token / session | Developer | DevOps | Often straddles; start Developer, escalate if infra. |
| Security — secrets, IAM, network, supply chain | DevOps | Developer (for app secrets usage) | Platform-layer. |
| Security — policy / compliance gap | DevOps | PM (scope) | If compliance envelope unclear, PM. |
| Flaky automated test | Tester | Developer (if root cause is app race) | |
| Missing or wrong test coverage | Tester | — | |
| Test tooling / environment gap | Tester | DevOps | |
| Recurring bug class, handoff friction, team-level | Talent Manager | — | Route any clustering pattern here. |
| Unclear root cause | Delivery Lead | — | Diagnose, spike, or ask for more evidence before routing. |

## Routing Heuristics (Beyond the Table)

When the table doesn't match cleanly, apply these:

- **Ask "what artifact must change?"** If the fix is words (copy), the Designer decides. If it's pixels/states/flows, the Designer decides. If it's code, the Developer. If it's infrastructure / pipeline / IAM / observability config, the DevOps Engineer. If it's an acceptance criterion, the PM. If it's a test, the Tester.
- **Ask "could a disciplined version of role X have prevented this?"** That role is the owner. If multiple could have, the one *earliest* in the chain usually is.
- **Ask "does fixing the code leave the design underspecified?"** If yes, route to Designer first *then* Developer, even if the visible bug is in code. A silent code-only fix re-encodes the spec gap.
- **Ask "is this a one-off or a pattern?"** Pattern → Talent Manager gets a notice, regardless of where the fix goes.
- **Ask "does this change user-visible behavior described in requirements?"** If yes, PM must sign off on the behavior change — even if the fix is purely in code.

## Loop-back Patterns

Name the pattern explicitly in `delivery-log.md` so it can be learned from.

- **Backtrack-one.** Issue found at role N; role N−1 can fix alone; then forward to role N for re-verification. Most common pattern.
- **Backtrack-multi.** Issue found at role N; must pass through roles N−1, N−2 before returning. Typical for design-gap-discovered-in-test.
- **Branch.** Issue has two independent causes; route in parallel; merge back for joint re-verification.
- **Spec bug.** Issue is actually a requirements ambiguity. Go back to PM; when PM updates `requirements.md`, downstream work may need to be partially re-done — surface that cost, don't paper over it.
- **Cross-cutting escalation.** Issue reveals a systemic gap (accessibility blind spot, security omission, observability hole). Route the immediate fix to the accountable role *and* flag to the Talent Manager for a skill doc or persona edit.

## When to Involve the User

The Delivery Lead should **not** ask the user for routine triage decisions. The user decides:

- **Product judgment:** scope changes, prioritization, success metrics, MVP line, kill criteria.
- **Business constraints:** timeline, budget, compliance envelope, regional footprint.
- **Risk posture:** SLO targets, accepted residual risk, release-vs-defer calls.
- **User research calls:** any decision that genuinely requires user input data the team lacks.
- **Preference calls:** brand voice, tone, taste-level design choices when multiple good options exist.

The user does **not** decide:

- Which agent fixes a specific bug (Delivery Lead triages).
- Whether a deliverable meets the downstream gate (Delivery Lead verifies).
- Whether a handoff is ready (Delivery Lead verifies).
- How to instrument, test, or architect (the relevant specialist decides).

When the user is prompted, it is a **single structured ask**, not a drip of one-off questions.

## Conventions

- **Write in `delivery-log.md`** for every handoff, triage, loop-back, and systemic signal.
- **Accountability is singular.** One owner per issue; support roles named as supporting, not co-owners.
- **Rejections are specific.** A gate rejection lists the exact gaps, not a vibe.
- **Re-diagnose on rejection.** If an assigned role says "not mine," re-diagnose from evidence, not from the rejection. Do not ping-pong.
- **Systemic patterns go to the Talent Manager.** Three similar loop-backs are no longer a delivery problem; they are a team-capability problem.
- **Agent attribution.** When presenting output produced by or on behalf of a specific agent, prefix the response with the agent's name in brackets — e.g. `[Gene]`, `[Dieter]`, `[Margaret]`. When Kiro is responding directly (not channelling an agent), no prefix is used. This helps the user distinguish routine answers from role-specific deliverables.

## Provenance & Maintenance

- **Authored:** Delivery Lead + Talent Manager at team setup.
- **Maintained by:** Talent Manager (Mode B — feedback-driven learning).
- **Update trigger:** any recurring misroute, any gap in the table surfaced during triage, any systemic pattern flagged in a delivery log.
- **Change log:** tracked at the top of this file once changes begin (Talent Manager convention).

This file is the team's shared language for "who fixes what." Keep it current, keep it tight, and let it shrink when parts of it become obvious.
