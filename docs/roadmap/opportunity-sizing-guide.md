# Opportunity Sizing Guide

> **Purpose:** Systematic approach to scoring problems and solutions for prioritisation.
> **Last updated:** 2026-08-11
> **Based on:** Discovery Canvas screenshots + U.Lab Idea Brief template

---

## Overview

Opportunity sizing answers: **"Which problems should we solve first?"**

This is a two-stage process:
1. **Opportunity Scoring** — Score the *problem* to determine total pain
2. **Solution Assessment** — Score the *solution* to determine if it's worth building

We score problems, not solutions. A high-pain problem with a bad solution is still a high-pain problem worth solving differently.

---

## Stage 1: Opportunity Scoring

### The Four Dimensions

| Dimension | Question | What We're Measuring |
|-----------|----------|---------------------|
| **Prevalence** | How many users face this problem? | Breadth of impact |
| **Severity** | How much does it hurt when they hit it? | Depth of impact |
| **Frequency** | How often do they encounter it? | Repetition of pain |
| **Addressability** | Are we the right people to solve this? | Strategic fit |

### Scoring Scale (0–3)

Each dimension uses the same scale:

| Score | Label | Meaning |
|-------|-------|---------|
| 0 | None | Doesn't apply / No impact |
| 1 | Low | Minor / Few affected / Rare |
| 2 | Medium | Moderate / Some affected / Occasional |
| 3 | High (Heaps) | Significant / Most affected / Frequent |

### Score Definitions by Dimension

#### Prevalence: How many users face this?

| Score | Definition | Examples |
|-------|------------|----------|
| 0 | No users | Problem doesn't exist in our user base |
| 1 | Niche users (< 10%) | Power users only, specific industry vertical |
| 2 | Some users (10–50%) | Users of a specific module, certain account types |
| 3 | Most/all users (> 50%) | Core workflow, affects everyone |

#### Severity: How much does it hurt?

| Score | Definition | Examples |
|-------|------------|----------|
| 0 | No pain | Non-issue |
| 1 | Annoyance | Minor friction, user continues without help |
| 2 | Significant pain | User needs workaround, may contact support |
| 3 | Blocking | User cannot complete task, abandons or escalates |

#### Frequency: How often do they hit it?

| Score | Definition | Examples |
|-------|------------|----------|
| 0 | Never | |
| 1 | Rarely | Quarterly, edge case scenarios |
| 2 | Occasionally | Weekly, common but not daily |
| 3 | Frequently | Daily, every time they use the feature |

#### Addressability: Are we the right people to solve this?

| Score | Definition | Examples |
|-------|------------|----------|
| 0 | Not addressable | Outside our control (third-party API, legal constraint) |
| 1 | Poorly positioned | We could solve it, but others do it better |
| 2 | Moderately positioned | We can solve it, aligns with some strengths |
| 3 | Well positioned | Core competency, strategic alignment, unique position |

### Calculating Scores

**Total Pain Score** = Prevalence × Severity × Frequency

This gives a range of 0–27.

**Final Score** = Total Pain × Addressability

This gives a range of 0–81.

### Score Interpretation

| Final Score | Interpretation |
|-------------|----------------|
| 0–10 | Low priority — monitor but don't invest |
| 11–30 | Medium priority — address opportunistically |
| 31–50 | High priority — schedule for solution |
| 51–81 | Critical priority — address urgently |

---

## Stage 2: Solution Assessment

Once we've identified high-pain problems, we assess proposed solutions.

### Solution Dimensions

| Dimension | Question |
|-----------|----------|
| **Initial Pain Score** | What's the opportunity score from Stage 1? |
| **Residual Pain** | How much pain remains *after* this solution? (0–27 scale) |
| **Value** | Initial Pain − Residual Pain = pain reduction |
| **Usability** | Will users be able to use this without support? |
| **Feasibility** | Can we actually build this? |
| **Viability** | Should we build this? (legal, compliance, cost, strategy) |
| **Effort** | How long will this take? |

### Value Calculation

```
Initial Pain Score (from opportunity sizing)
- Residual Pain (what's left after solution)
= Value (pain reduction delivered)
```

A solution that reduces a 27-pain problem to 5 delivers value of 22.
A solution that reduces a 27-pain problem to 20 delivers value of 7.

The same problem can have multiple solutions with different value delivery.

### Gates: Pass / Conditional / Fail

For Usability, Feasibility, and Viability, use a gate system:

| Gate | Meaning | Action |
|------|---------|--------|
| **Pass** | Meets criteria | Continue |
| **Conditional** | Passes with a noted condition | Document condition, continue |
| **Fail** | Does not meet criteria | Document reason, stop or redesign |

#### Usability Gate

- **Pass:** Users can self-serve with existing patterns
- **Conditional:** Requires onboarding, tooltip, or minor learning curve
- **Fail:** Would require support intervention for most users

#### Feasibility Gate

- **Pass:** We have the skills, tech, and dependencies to build this
- **Conditional:** Requires new capability, external dependency, or research spike
- **Fail:** Cannot be built with current constraints (time, tech, team)

#### Viability Gate

- **Pass:** Aligns with strategy, legal, compliance, and support capacity
- **Conditional:** Requires policy decision, legal review, or support planning
- **Fail:** Violates compliance, creates unsupportable burden, or conflicts with strategy

### Effort T-Shirt Sizing

| Size | Time Frame | Team Commitment |
|------|------------|-----------------|
| **Weeks** | 1–4 weeks | Single dev, contained scope |
| **Months** | 1–3 months | Small team, moderate scope |
| **Quarters** | 3–6 months | Full team, significant scope |

### Prioritisation Decision

Based on Value, Gates, and Effort, assign a decision:

| Decision | Criteria |
|----------|----------|
| **Build Now** | High value, all gates pass, effort justified |
| **Test First** | High value, but low evidence — run an experiment |
| **Blocked** | Value exists, but a gate failed — identify unblock trigger |
| **No: [Reason]** | Low value, or gates fail without clear unblock |

---

## Scoring Template

### Opportunity Scoring Table

```markdown
| Problem | Prevalence | Severity | Frequency | Total Pain | Addressability | Final Score |
|---------|------------|----------|-----------|------------|----------------|-------------|
| [Problem 1] | | | | | | |
| [Problem 2] | | | | | | |
```

### Solution Assessment Table

```markdown
| Solution | Initial Pain | Residual Pain | Value | Usability | Feasibility | Viability | Effort | Decision |
|----------|--------------|---------------|-------|-----------|-------------|-----------|--------|----------|
| [Solution 1] | | | | Pass/Cond/Fail | Pass/Cond/Fail | Pass/Cond/Fail | Weeks/Months/Quarters | |
| [Solution 2] | | | | | | | | |
```

---

## Worked Example: Time Slider Problem

### Stage 1: Opportunity Scoring

**Problem:** "The time selection for mailouts uses hour and minute sliders — it's frustrating and unintuitive"

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| Prevalence | 3 | Every user scheduling mailouts |
| Severity | 2 | Annoying but not blocking — they can eventually set the time |
| Frequency | 3 | Every mailout creation |
| **Total Pain** | **18** | 3 × 2 × 3 |
| Addressability | 3 | We own the UI, straightforward fix |
| **Final Score** | **54** | 18 × 3 |

**Interpretation:** Critical priority (54). This is high-frequency friction affecting all users, and we're well positioned to fix it.

### Stage 2: Solution Assessment

**Solution A:** Replace sliders with direct time input + quick presets

| Dimension | Score/Status | Rationale |
|-----------|--------------|-----------|
| Initial Pain | 18 | From Stage 1 |
| Residual Pain | 2 | Minor friction for unusual times |
| Value | 16 | 18 - 2 |
| Usability | Pass | Standard time picker pattern |
| Feasibility | Pass | UI-only change, no backend |
| Viability | Pass | No policy/compliance issues |
| Effort | Weeks | Single component replacement |
| **Decision** | **Build Now** | High value, all gates pass, low effort |

**Solution B:** Full calendar-based scheduling interface

| Dimension | Score/Status | Rationale |
|-----------|--------------|-----------|
| Initial Pain | 18 | From Stage 1 |
| Residual Pain | 1 | Minimal friction |
| Value | 17 | 18 - 1 |
| Usability | Conditional | Requires learning new interface |
| Feasibility | Pass | More complex but achievable |
| Viability | Pass | No issues |
| Effort | Months | Significant UI redesign |
| **Decision** | **Test First** | Higher value but higher effort — prototype first |

---

## Integration with U.Lab

The Idea Brief template in Confluence includes a simplified version:

```
Impact:  Small / Medium / Large
Effort:  Small / Medium / Large
```

Our detailed scoring here feeds into that summary:

| Our Score Range | U.Lab Impact |
|-----------------|--------------|
| Final Score 0–20 | Small |
| Final Score 21–50 | Medium |
| Final Score 51–81 | Large |

| Our Effort | U.Lab Effort |
|------------|--------------|
| Weeks | Small |
| Months | Medium |
| Quarters | Large |

---

## When to Use This

| Situation | Approach |
|-----------|----------|
| UTTPMO feedback arrives | Quick preliminary scoring in pain-themes.md |
| Idea proposed for U.Lab | Full opportunity scoring before Idea Brief |
| Multiple solutions proposed | Solution assessment to compare approaches |
| Quarterly prioritisation | Re-score all open items with fresh data |
| Prototype complete | Re-assess with new evidence |

---

## Provenance

- **Authored:** 2026-08-11
- **Framework source:** Based on Opportunity Scoring screenshot from Discovery Canvas and U.Lab Idea Brief prioritisation fields
- **Confluence ref:** [Idea Brief Template](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12297732115/Idea+Brief+Template)
