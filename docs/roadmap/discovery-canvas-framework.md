# Discovery Canvas Framework

> **Purpose:** Structure how we think about problems before jumping to solutions.
> **Last updated:** 2026-08-11

---

## Overview

The Discovery Canvas is a visual thinking tool that forces us to work from outcomes backwards to experiments. It prevents the common failure mode of starting with a solution ("let's build X") and retrofitting a problem to justify it.

The canvas has four layers, read bottom-to-top:

```
┌─────────────────────────────────────────────────────────────────────┐
│  EXPERIMENTS                                                        │
│  What can we build/test quickly to validate the solution?           │
│  ┌─────────┐                                                        │
│  │ Export  │                                                        │
│  │audiences│                                                        │
│  │for Meta │                                                        │
│  └────┬────┘                                                        │
├───────┼─────────────────────────────────────────────────────────────┤
│  SOLUTION SPACE                                                     │
│  What could we build to address this problem?                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ Canvas  │ │Group by │ │Meta/    │ │ Drawer  │ │WhatsApp │       │
│  │ Journey │ │Campaign │ │Google   │ │  edit   │ │ channel │       │
│  │ Builder │ │         │ │audiences│ │  modal  │ │         │       │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘       │
├───────┼──────────┼──────────┼──────────┼──────────┼─────────────────┤
│  PROBLEM SPACE                                                      │
│  What pain are users experiencing? (their words, not ours)          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ Can't manage│ │Double-      │ │ Creating    │ │ SMS too     │   │
│  │ multi-touch │ │handling     │ │ emails      │ │ expensive   │   │
│  │ campaigns   │ │audiences    │ │ feels clunky│ │             │   │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘   │
├─────────┴────────────────┴────────────────┴────────────────┴────────┤
│  THE OUTCOME                                                        │
│  What business/user outcome are we trying to achieve?               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Increase the total number of campaigns sent across customers │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## The Four Layers

### 1. The Outcome (Bottom)

**What business or user outcome are we trying to achieve?**

This is the anchor. Everything above must trace back to this. If a solution doesn't serve the outcome, it doesn't belong on the canvas.

Good outcomes are:
- Measurable (even if the metric is hard to collect)
- Customer-centric or business-critical
- Specific enough to evaluate solutions against

**Examples:**
- "Increase the total number of campaigns sent across our customer base"
- "Increase campaign performance for campaigns run by customers"
- "Increase the number of contactable contacts across UbiQuity users"
- "Reduce the reliance of dev team for support/customer requests"
- "Grow consideration with potential customers"

### 2. Problem Space (Second Layer)

**What pain are users experiencing? Express it in their words.**

This is where UTTPMO feedback, support tickets, and user interviews live. Each problem should be:
- Written as a user statement ("I can't...", "I don't know how to...", "I'm always...")
- Traceable to real evidence (quotes, ticket clusters, usage data)
- Connected to the outcome below it

One problem can serve multiple outcomes. One outcome can have multiple problems.

**Examples:**
- "I can't effectively manage multi-touch campaigns"
- "I'm double-handling audiences for social"
- "Creating emails feels clunky"
- "I don't know how to optimise my audiences"
- "I can't see how my campaigns are performing"
- "I can't automate my data retention policy"

### 3. Solution Space (Third Layer)

**What could we build to address this problem?**

Solutions are ideas, not commitments. Multiple solutions can address the same problem. The canvas helps us see:
- Which problems have many potential solutions (flexibility)
- Which problems have only one obvious solution (risk)
- Which solutions address multiple problems (leverage)

**Examples:**
- "Canvas-based Journey Builder"
- "Ability to group and view objects by Campaign"
- "Ability to generate and update Meta/Google audiences from UbiQuity"
- "Shift edit modal contents to a drawer"
- "WhatsApp as a channel"
- "AI Campaign performance chat interface"
- "Preference Centres out-of-the-box"
- "Configurable data deletion / soft delete"

### 4. Experiments (Top Layer)

**What can we build/test quickly to validate the solution?**

Not everything needs a full build. Experiments are cheap ways to learn:
- Prototype in this repo
- Figma clickthrough
- Fake door test
- Manual process with a few customers
- Competitor analysis
- Customer interviews about a mockup

The goal is to kill bad ideas fast and build confidence in good ones before committing engineering effort.

**Examples:**
- "Export audiences in the format needed for Meta (no direct integration)" — tests whether the Meta sync value prop is real before building OAuth integration
- Prototype the journey builder canvas in this repo
- Survey customers about WhatsApp preference vs SMS cost

---

## How to Use the Canvas

### Starting a New Item

1. **Start with the outcome.** If you can't articulate the outcome, you're not ready to build.
2. **Map the problems.** Pull from pain-themes.md, UTTPMO, support tickets.
3. **Generate solutions.** Don't evaluate yet — just brainstorm what could work.
4. **Identify experiments.** What's the cheapest way to learn if each solution is worth building?
5. **Draw the connections.** Which solutions address which problems? Which problems serve which outcomes?

### Using the Canvas for Prioritisation

The canvas reveals:
- **Orphan solutions:** Ideas that don't connect to a real problem (kill them)
- **Orphan problems:** Pain with no proposed solution (opportunity for ideation)
- **High-leverage solutions:** One solution that addresses multiple problems (prioritise)
- **High-risk bets:** One solution with one path to one problem (validate hard before building)

---

## Opportunity Sizing (Complementary Tool)

Once problems are mapped on the canvas, we score them using the Opportunity Sizing grid:

| Dimension | Question | Scale |
|-----------|----------|-------|
| **Prevalence** | How many users face this? | 0–3 |
| **Severity** | How much does it hurt when they hit it? | 0–3 |
| **Frequency** | How often do they hit it? | 0–3 |
| **Addressability** | Are we the right people to solve this? | 0–3 |

**Total Pain Score** = Prevalence × Severity × Frequency

**Final Score** = Total Pain × Addressability

See [opportunity-sizing-guide.md](./opportunity-sizing-guide.md) for the full methodology.

---

## Solution Assessment (After Opportunity Sizing)

Once we've sized the problems, we assess proposed solutions:

| Dimension | Question |
|-----------|----------|
| **Initial Pain Score** | From opportunity sizing |
| **Residual Pain** | How much pain remains after this solution? |
| **Value (Reduction)** | Initial - Residual = value delivered |
| **Usability** | Will users be able to use this without support? |
| **Feasibility** | Can we build this at all? |
| **Viability** | Legal, compliance, support cost, strategic fit |
| **Effort** | T-shirt size: Weeks / Months / Quarters |

**Gates:**
- **Pass** — Meets all criteria
- **Conditional** — Passes with a noted condition
- **Fail** — Fails with a noted reason

**Prioritisation Decision:**
- **Build Now** — High benefit, passes gates
- **Test First** — High benefit but low evidence
- **Blocked** — Trigger for unblock identified
- **No: Reason** — Explicit rejection with rationale

---

## Integration with U.Lab

The Discovery Canvas work here feeds directly into Confluence U.Lab:

| Local (this repo) | Confluence (U.Lab) |
|-------------------|-------------------|
| Canvas analysis in `docs/roadmap/items/` | Idea Brief in U.Lab |
| Problem evidence in `pain-themes.md` | "Evidence" section of Idea Brief |
| Solution proposals | "Solution" section of Idea Brief |
| Opportunity sizing scores | "Prioritisation" section of Idea Brief |
| Prototype code in `src/` | Link from "Solution" section |

When an item is ready for U.Lab:
1. Create the Idea Brief from template
2. Copy the structured analysis into the brief
3. Link back to this repo for prototype and detailed research
4. Move through Proposed → Validating → Build → Bury

---

## Canvas Templates

### Markdown Template for Items

```markdown
# [Item Name]

## Outcome
> What business/user outcome does this serve?

## Problems Addressed
| Problem | Evidence | Source |
|---------|----------|--------|
| | | UTTPMO / Support / Usage data |

## Proposed Solutions
| Solution | Addresses Problems | Experiment |
|----------|-------------------|------------|
| | | |

## Opportunity Sizing
| Problem | Prevalence | Severity | Frequency | Total Pain | Addressability | Final Score |
|---------|------------|----------|-----------|------------|----------------|-------------|
| | | | | | | |

## Solution Assessment
| Solution | Initial Pain | Residual Pain | Value | Usability | Feasibility | Viability | Effort | Decision |
|----------|--------------|---------------|-------|-----------|-------------|-----------|--------|----------|
| | | | | | | | | |

## Next Steps
- [ ] 

## Refs
- U.Lab: [link]
- Prototype: [path]
- Confluence: [link]
```

---

## Provenance

- **Authored:** 2026-08-11
- **Framework source:** Discovery Canvas methodology adapted from Opportunity Solution Trees (Teresa Torres) and JTBD frameworks
- **Confluence ref:** [U.Lab](https://sparknz.atlassian.net/wiki/spaces/UB/pages/12297240711/U.Lab)
