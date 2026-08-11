# Requirements Document

> **Phase:** MVP
> **Builds on:** `journey-builder/` (WS)
> **Next Phase:** `journey-builder-mlp/` (MLP)

## Introduction

MVP extends WS with production-ready trigger types, journey lifecycle management, and basic reporting. This phase transforms the proof-of-concept into a usable marketing automation tool.

**Assumes:** All WS features are complete and working (linear flows with Start, Email, Delay, End nodes).

## Scope Summary

### In Scope (MVP)

| Category | Features |
|----------|----------|
| **Triggers** | Segment entry, Event-based (form submitted, purchase made, page visited), Scheduled (one-time, recurring) |
| **Actions** | SMS node, Email builder integration (edit from journey) |
| **Lifecycle** | Draft/Active/Paused/Archived status, Status transitions with validation |
| **Exits** | Multiple end nodes, Exit reasons (completed, unsubscribed, goal met), Move to journey |
| **Reporting** | Journey entry/completion counts, Node-level metrics (entered, exited, waiting) |
| **Management** | Journey duplication, Journey search/filter |

### Out of Scope (deferred to MLP)

- Branch nodes (If/Else conditional logic)
- A/B split testing
- Join nodes (merge paths)
- Wait for event nodes
- Update contact action nodes
- Journey versioning

## Requirements

_To be defined when MVP design begins._

<!-- Template for requirements:

### Requirement N: [Title]

**User Story:** As a prototype user, I want [capability], so that [benefit].

#### Acceptance Criteria

1. WHEN [trigger], THE [component] SHALL [behaviour].

-->
