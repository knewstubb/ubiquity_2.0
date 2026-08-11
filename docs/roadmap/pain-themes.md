# Pain Themes — UTTPMO & Support Feedback

> **Purpose:** Clustered, prioritised feedback from internal teams and customers.
> **Last updated:** 2026-08-11
> **Source:** UTTPMO Teams channel + support ticket analysis

---

## Executive Summary

The biggest pattern across UTTPMO feedback is **not missing functionality** — it's **friction**.

> "The feature exists, but it's hard to find, hard to manage, hard to trust, or doesn't provide enough visibility."

This is **experience debt**, not feature gaps. Most complaints are variations of:
- The feature exists but is hard to use
- The feature exists but gives poor feedback
- The feature exists but doesn't scale to real workflows

---

## Pain Theme Index

| # | Theme | Frequency | Primary Problems |
|---|-------|-----------|------------------|
| 1 | [UX Friction & Poor Interaction Design](#1-ux-friction--poor-interaction-design) | Very High | Time sliders, distant controls, technical language |
| 2 | [Template Management & Auditability](#2-template-management--auditability) | High | No version history, no archive, no change tracking |
| 3 | [Reporting & Visibility](#3-reporting--visibility) | High | Can't see performance, no dashboards, limited exports |
| 4 | [Permissions & Administration](#4-permissions--administration) | High | Confusing permission model, poor error messages |
| 5 | [Scheduling & Mailout Workflows](#5-scheduling--mailout-workflows) | High | Time selection friction, future scheduling gaps |
| 6 | [Error Handling & Feedback](#6-error-handling--feedback) | Medium-High | Vague errors, no guidance on resolution |
| 7 | [Forms & Logic Capability Gaps](#7-forms--logic-capability-gaps) | Medium | Inconsistent logic across modules |
| 8 | [Security & Access Transparency](#8-security--access-transparency) | Medium | Visibility leaks, unclear access boundaries |

---

## 1. UX Friction & Poor Interaction Design

**Frequency:** Very High

### Problems (User Voice)

| Problem Statement | Evidence Source |
|-------------------|-----------------|
| "The time selection for mailouts uses hour and minute sliders — it's frustrating and unintuitive" | UTTPMO |
| "Expand/collapse controls are positioned far away from the content they affect" | UTTPMO |
| "The filter builder language feels more technical than human-friendly" | UTTPMO |
| "UI layouts and workflows create cognitive load" | UTTPMO |

### Underlying Theme

Common tasks are harder than necessary. Users fight the interface instead of completing their work.

### Potential Solutions (Discovery Canvas)

- Shift edit modal contents to drawers
- Replace time sliders with direct input + quick presets
- Rewrite filter builder in natural language
- Audit and fix control proximity across all modules

### Opportunity Sizing (Preliminary)

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| Prevalence | 3 | Every user hits this |
| Severity | 2 | Annoying but workaroundable |
| Frequency | 3 | Daily encounters |
| **Total Pain** | 18 | |
| Addressability | 3 | We own the UI |
| **Final Score** | 54 | |

---

## 2. Template Management & Auditability

**Frequency:** High

### Problems (User Voice)

| Problem Statement | Evidence Source |
|-------------------|-----------------|
| "No ability to organise or archive email templates — lists are cluttered" | UTTPMO |
| "No visibility into what changed when content is updated" | UTTPMO |
| "We want to know specifically what was added, removed, or modified" | UTTPMO |
| "Lack of audit trails on templates" | UTTPMO |
| "Template descriptions can be entered but aren't surfaced anywhere useful" | UTTPMO |
| "Triggered emails cannot be converted into email templates" | UTTPMO |

### Underlying Theme

Users want a "version history / wayback machine" for assets and better lifecycle management of templates.

### Potential Solutions (Discovery Canvas)

- Template version history with diff view
- Archive/folder system for templates
- Surface template descriptions in list views
- Audit log for template changes (who, when, what)
- Convert triggered emails to templates

### Opportunity Sizing (Preliminary)

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| Prevalence | 3 | All users with templates |
| Severity | 2 | Causes rework, not blocking |
| Frequency | 2 | Weekly encounters |
| **Total Pain** | 12 | |
| Addressability | 3 | We own templates |
| **Final Score** | 36 | |

---

## 3. Reporting & Visibility

**Frequency:** High

### Problems (User Voice)

| Problem Statement | Evidence Source |
|-------------------|-----------------|
| "I can't see how my campaigns are performing" | UTTPMO |
| "I don't know how to optimise my audiences" | UTTPMO |
| "Want counts and metrics on TXT programmes and recurring TXT campaigns" | UTTPMO |
| "Need a large, obvious 'download responses' capability" | UTTPMO |
| "Need to understand volume and outcomes without drilling into individual records" | UTTPMO |
| "Proper dashboarding is required to solve some reporting needs" | UTTPMO |
| "Want reporting across multiple mailout folders, not just individual folders" | UTTPMO |

### Underlying Theme

Users want richer operational reporting and self-service visibility. Current reports are "awful" (direct quote).

### Potential Solutions (Discovery Canvas)

- Dashboards with enhanced filtering
- AI Campaign performance chat interface
- Cross-folder/cross-campaign reporting
- Prominent download/export controls
- Natural language reporting queries
- Leverage new read-only data source for reporting

### Opportunity Sizing (Preliminary)

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| Prevalence | 3 | All users need reporting |
| Severity | 3 | Blocks decision-making |
| Frequency | 3 | Daily/weekly need |
| **Total Pain** | 27 | |
| Addressability | 2 | Reporting infra is complex |
| **Final Score** | 54 | |

### Note

> "One major issue is the fact that our reports are awful. Maybe this could be made easier using the new separate read-only data source that we have been building."

This suggests a near-term opportunity: use the new data architecture to bypass legacy reporting limitations.

---

## 4. Permissions & Administration

**Frequency:** High

### Problems (User Voice)

| Problem Statement | Evidence Source |
|-------------------|-----------------|
| "'Enable Transactional Sending' only available after creating a user — forces return edit" | UTTPMO |
| "Questions and uncertainty around how connector permissions fit into broader user permissions" | UTTPMO |
| "User limits and security controls on parent accounts not clearly represented during user creation" | UTTPMO |
| "Users without certain permissions encounter blunt or confusing error messages" | UTTPMO |
| "Permissions appear inconsistent — users can still view contact info in some email preview scenarios" | UTTPMO |

### Underlying Theme

Permission behaviour does not align with user expectations and lacks transparency.

### Potential Solutions (Discovery Canvas)

- Permissions management overhaul (U.Lab: Validating)
- Permission preview ("what will this user see?")
- Clearer error messages for permission denials
- Consolidate permission surfaces into single admin view
- Extension of User Profile Setup Permissions (U.Lab: Proposed)

### Opportunity Sizing (Preliminary)

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| Prevalence | 2 | Admins primarily |
| Severity | 2 | Causes confusion, security concern |
| Frequency | 2 | Per-user-setup encounters |
| **Total Pain** | 8 | |
| Addressability | 2 | Complex, cross-cutting |
| **Final Score** | 16 | |

---

## 5. Scheduling & Mailout Workflows

**Frequency:** High

### Problems (User Voice)

| Problem Statement | Evidence Source |
|-------------------|-----------------|
| "Time selection for mailouts uses hour and minute sliders" | UTTPMO |
| "Want to schedule automated mailouts on specific calendar dates well into the future" | UTTPMO |
| "Clients often struggle to follow required processes around mailout scheduling and deployment timing" | UTTPMO |
| "Want to see counts of emails within mailout folders and easier 'select all'" | UTTPMO |

### Underlying Theme

Mailout workflows are powerful but difficult to operate at scale.

### Potential Solutions (Discovery Canvas)

- Calendar-based future scheduling
- Replace time sliders with direct input
- Batch operations on mailout folders
- Scheduling guidance/guardrails for clients
- Journey Builder (long-term replacement for complex scheduling)

### Opportunity Sizing (Preliminary)

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| Prevalence | 3 | Core workflow for all users |
| Severity | 2 | Frustrating but functional |
| Frequency | 3 | Every mailout |
| **Total Pain** | 18 | |
| Addressability | 3 | We own scheduling UI |
| **Final Score** | 54 | |

---

## 6. Error Handling & Feedback

**Frequency:** Medium-High

### Problems (User Voice)

| Problem Statement | Evidence Source |
|-------------------|-----------------|
| "Error messages are vague and unhelpful" | UTTPMO |
| "Duplicate form names can be created without meaningful validation feedback" | UTTPMO |
| "Users are left guessing why actions fail and what to do next" | UTTPMO |

### Underlying Theme

The platform often reports that something went wrong without explaining why or how to fix it.

### Potential Solutions (Discovery Canvas)

- Error message audit and rewrite
- Actionable error messages with next steps
- Validation feedback before save (not after)
- Error codes for support escalation

### Opportunity Sizing (Preliminary)

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| Prevalence | 3 | All users hit errors |
| Severity | 2 | Frustrating, causes support calls |
| Frequency | 2 | Occasional |
| **Total Pain** | 12 | |
| Addressability | 2 | Scattered across codebase |
| **Final Score** | 24 | |

---

## 7. Forms & Logic Capability Gaps

**Frequency:** Medium

### Problems (User Voice)

| Problem Statement | Evidence Source |
|-------------------|-----------------|
| "Form and event modules lack logic functionality that exists elsewhere" | UTTPMO |
| "Teams rely on custom JavaScript workarounds for functionality they expect built-in" | UTTPMO |
| "Email-triggered workflows are considered an important differentiator — want more capability" | UTTPMO |

### Underlying Theme

Inconsistencies between modules create unnecessary complexity.

### Potential Solutions (Discovery Canvas)

- Unified logic engine across forms/events/surveys
- Built-in conditional logic (no JS required)
- Enhanced email-triggered workflow capabilities
- Journey Builder as the orchestration layer

### Opportunity Sizing (Preliminary)

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| Prevalence | 2 | Power users primarily |
| Severity | 2 | Workarounds exist |
| Frequency | 2 | Per-form/event creation |
| **Total Pain** | 8 | |
| Addressability | 2 | Deep platform work |
| **Final Score** | 16 | |

---

## 8. Security & Access Transparency

**Frequency:** Medium

### Problems (User Voice)

| Problem Statement | Evidence Source |
|-------------------|-----------------|
| "Visibility of contacts despite permission restrictions" | UTTPMO |
| "CAPTCHA and anti-spam tooling not yet updated" | UTTPMO |
| "Security and permission controls are not always intuitive" | UTTPMO |

### Underlying Theme

Security controls exist but their boundaries are unclear to users.

### Potential Solutions (Discovery Canvas)

- Audit permission leak scenarios
- Update CAPTCHA/anti-spam
- Security control documentation for admins
- Permission boundary visualisation

### Opportunity Sizing (Preliminary)

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| Prevalence | 2 | Security-conscious admins |
| Severity | 3 | Security/compliance risk |
| Frequency | 1 | Rare but serious |
| **Total Pain** | 6 | |
| Addressability | 2 | Platform-level work |
| **Final Score** | 12 | |

---

## Additional Problems from Canvas Screenshots

These items appeared on the Discovery Canvas but weren't in the UTTPMO summary:

| Problem | Outcome Served |
|---------|----------------|
| "I can't effectively manage multi-touch campaigns" | Increase campaigns sent |
| "I am double-handling audiences for social" | Increase campaigns sent |
| "Creating emails feels clunky" | Increase campaigns sent |
| "I want to send short-form text messages but SMS is too expensive" | Increase campaigns sent |
| "I want to ensure I am not over-contacting people" | Increase contactable contacts |
| "I can't automate my data retention policy" | Reduce dev reliance |

---

## Summary by Final Score

| Rank | Theme | Final Score |
|------|-------|-------------|
| 1 | UX Friction & Interaction Design | 54 |
| 1 | Reporting & Visibility | 54 |
| 1 | Scheduling & Mailout Workflows | 54 |
| 4 | Template Management & Auditability | 36 |
| 5 | Error Handling & Feedback | 24 |
| 6 | Permissions & Administration | 16 |
| 6 | Forms & Logic Capability Gaps | 16 |
| 8 | Security & Access Transparency | 12 |

---

## Provenance

- **Authored:** 2026-08-11
- **Source:** UTTPMO Teams channel feedback analysis provided by PO
- **Next update:** After next UTTPMO review or support ticket cluster analysis
