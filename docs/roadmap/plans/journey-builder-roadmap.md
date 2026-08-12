# Journey Builder: Prototype Development Roadmap

> **Last updated:** 2026-07-27  
> **Scope:** Interactive design prototype (not production)  
> **Purpose:** Document phased development aligned with production roadmap

---

## Executive Summary

The Journey Builder prototype mirrors the production phasing strategy: WS → MVP → MLP → V2 → V3. The prototype is ahead of production in some areas (visual polish, all node types) but serves as a UX testbed and stakeholder communication tool.

**Current state:** Phase 1 (WS) prototype is 100% complete. Ready to begin Phase 2 (MVP) prototyping.

---

## Phase Naming

| Phase | Full Name | Description |
|-------|-----------|-------------|
| WS | Walking Skeleton | Prove core UX patterns work |
| MVP | Minimum Viable Product | Production-ready basics |
| MLP | Minimum Lovable Product | Full feature set for stakeholder sign-off |
| V2 | Version 2 | Advanced features |
| V3 | Version 3 | Vision / future capabilities |

---

## Production Roadmap Alignment

The prototype phases align with the production roadmap from [Confluence: Feature Roadmap Outline](https://sparknz.atlassian.net/spaces/UB/pages/12671156493) and [Notion: Feature Roadmap](https://app.notion.com/p/a05c5db837cc4592b2637542b1df0549).

| Phase | Production Target | Prototype Purpose |
|-------|-------------------|-------------------|
| WS | Q1 2026 | Prove UX patterns, validate canvas interactions |
| MVP | Q2 2026 | Demo scheduling, filtering, conditional splits |
| MLP | Q4 2026 | Full feature demo for stakeholder sign-off |
| V2 | Future | Exploratory UX for advanced features |
| V3 | Future | Vision / concept demos only |

---

## Phase 1: WS (Complete)

> **Goal:** Prove the visual builder pattern works — drag-and-drop, auto-connect, auto-heal, linear flow

### Production Scope (from Confluence)

- Journey list: Create, view, open, delete
- Visual canvas: Drag-and-drop with auto-connect/auto-heal
- Steps: Start (fixed), Email, Delay, End — strictly linear
- Autosave: Changes saved immediately
- Manual trigger: Start journey and generate output

### Prototype Status: 100% Complete

| Feature | Status | Notes |
|---------|--------|-------|
| Journey list view | ✅ | `JourneysPage.tsx` with create dialog |
| Visual canvas | ✅ | React Flow with all interactions |
| Node palette | ✅ | Drag-to-add, category grouping |
| Auto-connect | ✅ | Drop on edge inserts node |
| Auto-heal | ✅ | Delete node reconnects flow |
| Start node (Trigger) | ✅ | 4 trigger types available |
| Email node (Action) | ✅ | Send email with content modal |
| Delay node (Wait) | ✅ | Time delay, wait for event, wait until date |
| End node | ✅ | Exit or move to journey |
| Autosave | ✅ | Context + localStorage persistence |
| Validation | ✅ | Real-time error indicators |
| Inspector panel | ✅ | Config forms for all node types |
| Keyboard shortcuts | ✅ | Delete, Escape, Undo/Redo |

### Beyond WS (prototype-only extras)

The prototype includes features beyond WS scope for demo purposes:

- **Branch nodes** (If/Else, A/B Split, Multi-way) — MVP scope
- **Join nodes** — MLP scope
- **All trigger types** (segment, event, manual, scheduled) — varies by phase
- **Sample journeys** with branching — for demo richness

---

## Phase 2: MVP Features (Next)

> **Goal:** Add scheduling, audience filtering, conditional splits, and state management

### Production Scope

| Feature | Description |
|---------|-------------|
| Delivery | Emails delivered to defined audience |
| Scheduling | RRule-style schedule configuration |
| Start filtering | Simple filter builder for audience eligibility |
| Conditional splits | Yes/No branching logic |
| Clone | Duplicate existing journeys |
| Audience volumes | Dynamic counts on nodes based on filters |
| State management | Draft → Active status transitions |
| Error reporting | User-facing validation messages |

### Prototype Tasks

| Task | Effort | Priority | Status |
|------|--------|----------|--------|
| Schedule configuration UI | M | P1 | Not started |
| Filter Builder in Trigger config | M | P1 | Partial (exists, needs wiring) |
| If/Else branch with FilterBuilder | S | P1 | ✅ Done |
| Journey status transitions | M | P2 | Not started |
| Clone journey action | S | P2 | Not started |
| Audience volume badges on nodes | M | P2 | Not started |
| Enhanced error messages | S | P2 | Partial |

### Implementation Notes

**Schedule configuration:**
- Add to `TriggerConfig.tsx` for scheduled triggers
- Use existing date picker + new recurrence selector
- Display schedule summary in Trigger node label

**Filter Builder integration:**
- `BranchConfig.tsx` already uses FilterBuilder for If/Else
- Wire FilterBuilder into `TriggerConfig.tsx` for segment-entry
- Entry criteria filter in `JourneySettingsForm.tsx`

**Status transitions:**
- Current: journeys have status but no transition UI
- Add status dropdown to journey settings
- Add visual indicator for draft vs active

---

## Phase 3: MLP Features

> **Goal:** Full-featured demo including email creation, SMS, multi-branch, A/B testing, and reporting

### Production Scope

| Feature | Description |
|---------|-------------|
| Email creation | Build/edit emails within Journey Builder |
| SMS integration | Mobile messaging nodes |
| Advanced filtering | OR logic, nested filter groups |
| Multi-branch splits | Multiple conditional paths |
| A/B testing | Split traffic, track winner |
| Live stats overlay | Volume per step on canvas |
| Advanced triggers | Event-based, time-based, behavioural |
| Campaign grouping | Journeys grouped by campaign |
| Undo/Redo | Canvas change history |
| Frequency capping | Business rules for send timing |

### Prototype Tasks

| Task | Effort | Priority | Status |
|------|--------|----------|--------|
| Email builder modal | L | P1 | Shell exists |
| Multi-way branch config | M | P1 | ✅ Done |
| A/B split percentages | S | P1 | ✅ Done |
| Live stats badges (simulated) | M | P2 | Not started |
| Campaign grouping UI | M | P2 | ✅ Done (journeys belong to campaigns) |
| Undo/Redo | S | P1 | ✅ Done |
| SMS node config | S | P2 | ✅ Done |
| Frequency capping UI | M | P3 | Not started |

### Implementation Notes

**Email builder modal:**
- `ContentModal.tsx` exists as shell
- Options: (a) simple template picker, (b) basic WYSIWYG, (c) just a textarea
- Recommendation: template picker for prototype, defer full builder

**Stats overlay:**
- Simulated counts only (no real execution)
- Add `volumeCount` to node data, display as badge
- Use sample data realistic for NZ spa chain scenario

---

## Phase 4: V2 Features

> **Goal:** Exploratory UX for content creation, organisation, RBAC, and multi-channel

### Production Scope

| Feature | Description |
|---------|-------------|
| Form/Survey creation | Build forms and surveys in modals |
| Organisation | Folders and tags for journey management |
| RBAC | Permission controls |
| Audit log | Change history |
| Smart segments | ML-powered entry criteria |
| Contact overlay | "Who's here now?" on any step |
| Pre-built templates | Welcome, Re-engagement, Win-back |
| Multi-channel | Push, WhatsApp, RCS, Social nodes |
| Journey sign-off | Approval workflow |

### Prototype Tasks

| Task | Effort | Priority | Notes |
|------|--------|----------|-------|
| Form builder modal | L | P3 | Defer unless requested |
| Survey builder modal | L | P3 | Defer unless requested |
| Template gallery | M | P2 | Sample journeys serve this purpose |
| Contact profile overlay | M | P3 | Visual concept only |

---

## Phase 5: V3 Features

> **Goal:** Vision demos for future capabilities (not for near-term prototype work)

### Production Scope

- Advanced reporting with Sankey visualisation
- Goal tracking
- Simulation mode
- LLM-powered journey creation
- Real-time collaboration
- Send time optimisation
- Channel fallback logic
- Real-time triggers

### Prototype Approach

These are out of scope for the current prototype. If needed for stakeholder demos:

- **Sankey visualisation:** Static mockup image
- **LLM journey creation:** Could demo with Kiro integration
- **Simulation mode:** Highlight path with animations (visual only)

---

## Technical Context

### Production Architecture (from Confluence)

| Component | Technology |
|-----------|------------|
| API | .NET 10 gRPC on Fargate ARM64 |
| Orchestration | Temporal for durable workflows |
| Database | Aurora PostgreSQL |
| Front-end | Next.js 16 + React 19 |
| Canvas | @xyflow/react |
| State | Jotai |

### Prototype Architecture

| Component | Technology |
|-----------|------------|
| Framework | React 19 + Vite + TypeScript |
| Canvas | @xyflow/react (React Flow v12) |
| State | React Context + localStorage |
| Persistence | Supabase (optional) |
| Styling | Tailwind CSS |

### Key Differences

| Aspect | Prototype | Production |
|--------|-----------|------------|
| Execution | None (visual only) | Temporal workflows |
| Persistence | Context + localStorage | Aurora PostgreSQL |
| Email sending | None | Legacy adapter → gRPC |
| Real-time | None | Temporal signals |

---

## Current Implementation Status

### Files Overview

```
src/
├── components/journey/
│   ├── JourneyCanvas.tsx        # React Flow canvas
│   ├── NodePalette.tsx          # Drag-and-drop palette
│   ├── InspectorPanel.tsx       # Side panel for config
│   ├── CanvasToolbar.tsx        # Zoom, validate, settings
│   ├── ValidationSummary.tsx    # Error list panel
│   ├── ContentModal.tsx         # Modal for content creation
│   ├── nodes/                   # Node visual components
│   │   ├── TriggerNode.tsx
│   │   ├── ActionNode.tsx
│   │   ├── WaitNode.tsx
│   │   ├── BranchNode.tsx
│   │   ├── EndNode.tsx
│   │   └── JoinNode.tsx
│   └── config/                  # Inspector config panels
│       ├── TriggerConfig.tsx
│       ├── ActionConfig.tsx
│       ├── WaitConfig.tsx
│       ├── BranchConfig.tsx
│       ├── EndConfig.tsx
│       ├── JoinConfig.tsx
│       └── JourneySettingsForm.tsx
├── pages/
│   ├── JourneysPage.tsx         # List view
│   └── JourneyCanvasPage.tsx    # Canvas page wrapper
├── models/
│   └── journey.ts               # TypeScript interfaces
├── contexts/
│   ├── JourneysContext.tsx      # State management
│   └── JourneyPhaseContext.tsx  # Phase feature flags
├── data/
│   └── journeySeeds.ts          # Sample journeys (3)
└── utils/
    ├── journeyGraph.ts          # Auto-connect, auto-heal
    └── journeyValidation.ts     # Validation rules
```

### Sample Journeys

| Journey | Nodes | Purpose |
|---------|-------|---------|
| Auckland Welcome Journey | 8 | Demos linear + branch flow |
| Auckland Re-engagement | 6 | Demos segment + if/else |
| Post-Purchase Follow-up | 9 | Demos event trigger + A/B split |

---

## References

### Confluence

- [Journey Builder Overview](https://sparknz.atlassian.net/spaces/UB/pages/11623923724)
- [Walking Skeleton Scope](https://sparknz.atlassian.net/spaces/UB/pages/12510200112)
- [Feature Roadmap Outline](https://sparknz.atlassian.net/spaces/UB/pages/12671156493)

### Notion

- [Journey Builder Features](https://app.notion.com/p/2f5287ec43998021bab1e467ea915805)
- [Feature Roadmap](https://app.notion.com/p/a05c5db837cc4592b2637542b1df0549)

### Prototype Spec

- [Requirements](.kiro/specs/journey-builder/requirements.md)
- [Design](.kiro/specs/journey-builder/design.md)

### Figma

- [Journey Builder UI](https://www.figma.com/design/ISrUc9Dts5nwKeknkmKSwm/UbQ-Journey-Builder)
