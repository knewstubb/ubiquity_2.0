# Requirements Document

> **Phase:** MLP
> **Builds on:** `journey-builder-mvp/` (MVP)
> **Next Phase:** `journey-builder-v2/` (V2)

## Introduction

MLP introduces branching logic, enabling personalised customer journeys based on conditions and A/B testing. This phase transforms linear automation into a full decision-tree workflow builder.

**Assumes:** All MVP features are complete (multiple triggers, lifecycle management, SMS, reporting).

## Scope Summary

### In Scope (MLP)

| Category | Features |
|----------|----------|
| **Branching** | If/Else conditional branch (using Filter Builder), A/B percentage split |
| **Flow Control** | Join node (merge paths), Wait for event node |
| **Actions** | Update contact field node |
| **Versioning** | Journey versions, Edit live vs create draft |
| **Canvas** | Multiple output handles per node, Path labels |

### Out of Scope (deferred to V2)

- Multi-way splits (3+ paths)
- Webhook action nodes
- Advanced reporting and analytics
- Journey templates

## Requirements

_To be defined when MLP design begins._
