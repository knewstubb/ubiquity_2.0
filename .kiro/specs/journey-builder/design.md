# Design Document: Journey Builder (WS)

> **Phase:** WS (Walking Skeleton)
> **Next Phase:** `journey-builder-mvp/design.md`

## Overview

The journey builder adds a visual, canvas-based workflow editor to the UbiQuity 2.0 prototype. Users compose linear customer journeys by dragging nodes from a palette onto a React Flow canvas, connecting them into a directed flow, and configuring each node via a slide-out inspector panel.

This is a prototype — no backend, no execution engine, no API calls. All state lives in a React context backed by localStorage. The goal is to let stakeholders experience the journey-building UX with realistic sample data from the NZ spa chain dataset.

**WS Scope:** Start, Email, Delay, End nodes only. Strictly linear flow (no branching). Manual trigger (all contacts).

The feature touches three areas:
1. **Data layer** — new TypeScript interfaces extending the existing `Journey` model, a `JourneysContext` for CRUD, and seed data in `journeySeeds.ts`
2. **Canvas layer** — a React Flow wrapper (`JourneyCanvas`) with custom node components, a node palette, minimap, toolbar, and keyboard shortcuts
3. **Configuration layer** — an `InspectorPanel` that renders type-specific forms for the four node types

React Flow (`@xyflow/react`) must be added as a dependency.

## Architecture

### Page Routing

The existing route `/automations/journeys` renders `JourneysPage` (list view). A new route `/automations/journeys/:journeyId` renders the canvas view for a specific journey.

```
/automations/journeys          → JourneysPage (list)
/automations/journeys/:journeyId → JourneyCanvasPage (canvas)
```

### Component Tree (WS)

```
App
└── JourneysProvider
    ├── JourneysPage (list view)
    └── JourneyCanvasPage
        ├── JourneyCanvas (React Flow wrapper)
        │   ├── StartNode (custom node)
        │   ├── EmailNode (custom node)
        │   ├── DelayNode (custom node)
        │   └── EndNode (custom node)
        ├── NodePalette
        ├── InspectorPanel
        │   ├── StartConfig
        │   ├── EmailConfig
        │   ├── DelayConfig
        │   └── EndConfig
        └── CanvasToolbar
```

### State Management

- **JourneysContext** owns the journey list and persists to localStorage. Follows the same pattern as `ConnectorsContext` — `useState` + `useEffect` for persistence, `useCallback` for mutations.
- **Canvas state** is managed by React Flow's `useNodesState` and `useEdgesState` hooks. These are local to `JourneyCanvas` and synced back to `JourneysContext` on changes.
- **Inspector state** reads from the selected node's config and writes back through `JourneysContext.updateNode()`.

## Components and Interfaces

### New Pages

| Component | File | Purpose |
|---|---|---|
| `JourneyCanvasPage` | `src/pages/JourneyCanvasPage.tsx` | Route wrapper that loads a journey by ID from context and renders the canvas layout (palette + canvas + inspector). |

### New Components — Canvas

| Component | File | Purpose |
|---|---|---|
| `JourneyCanvas` | `src/components/journey/JourneyCanvas.tsx` | React Flow `<ReactFlow>` wrapper. Manages `useNodesState`, `useEdgesState`, handles drop events, keyboard shortcuts, and syncs state to context. |
| `NodePalette` | `src/components/journey/NodePalette.tsx` | Sidebar listing four node types: Start, Email, Delay, End. Disables Start/End when one exists. |
| `InspectorPanel` | `src/components/journey/InspectorPanel.tsx` | Slide-out right panel. Renders the correct config form based on selected node type. |
| `CanvasToolbar` | `src/components/journey/CanvasToolbar.tsx` | Top bar with zoom controls, fit-to-view, validate button, and journey name display. |

### New Components — Custom Nodes (WS)

| Component | File | Purpose |
|---|---|---|
| `StartNodeComponent` | `src/components/journey/nodes/StartNode.tsx` | Custom React Flow node for start/trigger. Teal accent, shows "Manual Start" label. Single output handle. |
| `EmailNodeComponent` | `src/components/journey/nodes/EmailNode.tsx` | Custom React Flow node for email actions. Blue accent, shows selected email name. Input + output handles. |
| `DelayNodeComponent` | `src/components/journey/nodes/DelayNode.tsx` | Custom React Flow node for waits. Amber accent, shows duration label. Input + output handles. |
| `EndNodeComponent` | `src/components/journey/nodes/EndNode.tsx` | Custom React Flow node for journey end. Zinc-400 accent. Input handle only. |

### New Components — Inspector Config Forms (WS)

| Component | File | Purpose |
|---|---|---|
| `StartConfig` | `src/components/journey/config/StartConfig.tsx` | Read-only description: "Manual trigger — sends to all contacts." |
| `EmailConfig` | `src/components/journey/config/EmailConfig.tsx` | Email template picker dropdown. Shows selected email preview. |
| `DelayConfig` | `src/components/journey/config/DelayConfig.tsx` | Duration input (number) + unit selector (seconds, minutes, hours, days). |
| `EndConfig` | `src/components/journey/config/EndConfig.tsx` | Read-only description: "Journey complete." |

### Modified Components

| Component | File | Change |
|---|---|---|
| `JourneysPage` | `src/pages/JourneysPage.tsx` | Add "New Journey" button, create dialog, row click navigation. Wire to `JourneysContext`. |
| `App` | `src/App.tsx` | Add route for `/automations/journeys/:journeyId`. |

### New Context

| Context | File | Purpose |
|---|---|---|
| `JourneysContext` | `src/contexts/JourneysContext.tsx` | Journey CRUD: `journeys`, `addJourney`, `updateJourney`, `deleteJourney`, `updateNode`, `addNode`, `removeNode`, `addEdge`, `removeEdge`. Persists to localStorage. |

### New Utilities

| Utility | File | Purpose |
|---|---|---|
| `validateJourney` | `src/utils/journeyValidation.ts` | Pure function. Takes a journey, returns `ValidationError[]`. Checks: required config completeness, connectivity, single start, single end. |
| `autoConnect` | `src/utils/journeyGraph.ts` | Pure function. Given a new node dropped on an existing edge, returns the updated edges array (split edge, insert node). |
| `autoHeal` | `src/utils/journeyGraph.ts` | Pure function. Given a node being removed, returns the updated edges array (reconnect upstream to downstream). |

### New Seed Data

| File | Purpose |
|---|---|
| `src/data/journeySeeds.ts` | Sample "Welcome Journey" with Start → Email → Delay → Email → End pattern. |

## Data Models (WS)

### Node Types

WS supports exactly four node types:

```typescript
export type NodeType = 'start' | 'email' | 'delay' | 'end';
```

### Node Configuration Types

```typescript
// src/models/journey.ts

export interface StartConfig {
  type: 'start';
  // Manual trigger — no configuration needed
}

export interface EmailConfig {
  type: 'email';
  emailId: string;      // Reference to email template
  emailName: string;    // Display name
}

export interface DelayConfig {
  type: 'delay';
  duration: number;
  unit: 'seconds' | 'minutes' | 'hours' | 'days';
}

export interface EndConfig {
  type: 'end';
  // No configuration needed
}

export type NodeConfig = StartConfig | EmailConfig | DelayConfig | EndConfig;
```

### Journey Node

```typescript
export interface JourneyNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  label: string;
  config: NodeConfig;
}
```

### Journey Edge

```typescript
export interface JourneyEdge {
  id: string;
  source: string;  // Source node ID
  target: string;  // Target node ID
}
```

### Journey Definition

```typescript
export interface JourneyDefinition extends Journey {
  nodes: JourneyNode[];
  edges: JourneyEdge[];
}
```

### Linear Flow Constraints

WS enforces strictly linear flow:
- Exactly one Start node (no incoming edges, one outgoing edge)
- Exactly one End node (one incoming edge, no outgoing edges)
- All other nodes have exactly one incoming and one outgoing edge
- No branching, no joins, no cycles

### Auto-Connect Algorithm

When a node is dropped onto an existing edge:
1. Find the edge being dropped on (by proximity to drop position)
2. Remove the original edge (A → B)
3. Create two new edges: A → NewNode, NewNode → B
4. Position the new node at the midpoint of the removed edge

### Auto-Heal Algorithm

When a node with both incoming and outgoing edges is deleted:
1. Get the incoming edge's source node
2. Get the outgoing edge's target node
3. Remove both edges
4. Create new edge: source → target

### Validation Rules (WS)

| Rule | Severity | Message |
|---|---|---|
| No start node | error | "Journey must have a start node" |
| Multiple start nodes | error | "Journey can only have one start node" |
| No end node | error | "Journey must have an end node" |
| Multiple end nodes | error | "Journey can only have one end node" |
| Email node with no email selected | warning | "{nodeLabel}: No email selected" |
| Delay node with invalid duration | warning | "{nodeLabel}: Invalid delay duration" |
| Disconnected node | error | "{nodeLabel}: Node is disconnected from flow" |
| No path from start to end | error | "Journey has no complete path" |

### Sample Journey Seed Data

```typescript
const welcomeJourney: JourneyDefinition = {
  id: 'jrn-welcome',
  name: 'Welcome Journey',
  campaignId: 'cmp-welcome-series',
  accountId: 'acc-master',
  status: 'active',
  nodeCount: 5,
  entryCount: 0,
  type: 'welcome',

  nodes: [
    {
      id: 'w-n1',
      type: 'start',
      position: { x: 300, y: 50 },
      label: 'Manual Start',
      config: { type: 'start' },
    },
    {
      id: 'w-n2',
      type: 'email',
      position: { x: 300, y: 200 },
      label: 'Welcome Email',
      config: { type: 'email', emailId: 'email-welcome', emailName: 'Welcome Email' },
    },
    {
      id: 'w-n3',
      type: 'delay',
      position: { x: 300, y: 350 },
      label: 'Wait 2 days',
      config: { type: 'delay', duration: 2, unit: 'days' },
    },
    {
      id: 'w-n4',
      type: 'email',
      position: { x: 300, y: 500 },
      label: 'Follow-up Email',
      config: { type: 'email', emailId: 'email-followup', emailName: 'Follow-up Email' },
    },
    {
      id: 'w-n5',
      type: 'end',
      position: { x: 300, y: 650 },
      label: 'End',
      config: { type: 'end' },
    },
  ],

  edges: [
    { id: 'w-e1', source: 'w-n1', target: 'w-n2' },
    { id: 'w-e2', source: 'w-n2', target: 'w-n3' },
    { id: 'w-e3', source: 'w-n3', target: 'w-n4' },
    { id: 'w-e4', source: 'w-n4', target: 'w-n5' },
  ],
};
```

## File Organisation

```
src/
├── models/
│   └── journey.ts                    # WS type definitions
├── contexts/
│   ├── JourneysContext.tsx           # Journey CRUD + localStorage
│   └── JourneyPhaseContext.tsx       # Phase feature flags
├── components/
│   └── journey/
│       ├── JourneyCanvas.tsx         # React Flow wrapper
│       ├── NodePalette.tsx           # Draggable node list (4 types)
│       ├── InspectorPanel.tsx        # Slide-out config panel
│       ├── CanvasToolbar.tsx         # Zoom, validate
│       ├── nodes/
│       │   ├── StartNode.tsx
│       │   ├── EmailNode.tsx
│       │   ├── DelayNode.tsx
│       │   └── EndNode.tsx
│       └── config/
│           ├── StartConfig.tsx
│           ├── EmailConfig.tsx
│           ├── DelayConfig.tsx
│           └── EndConfig.tsx
├── pages/
│   ├── JourneysPage.tsx
│   └── JourneyCanvasPage.tsx
├── utils/
│   ├── journeyValidation.ts
│   └── journeyGraph.ts
└── data/
    └── journeySeeds.ts
```

## Error Handling

| Scenario | Handling |
|---|---|
| Journey ID not found in URL | `JourneyCanvasPage` shows "Journey not found" message with link back to list. |
| Attempt to add second Start node | Palette disables Start option when one exists. |
| Attempt to add second End node | Palette disables End option when one exists. |
| Delete Start node | Allowed — palette re-enables Start option. |
| Delete node in middle of chain | Auto-heal reconnects upstream to downstream. |
| Invalid journey loaded from localStorage | `JourneysContext` catches parse errors and returns empty array. |
| Undo/redo stack empty | Operations are no-ops when stack is empty. |

## Deferred to Future Phases

The following will be addressed in subsequent design documents:

### MVP (`journey-builder-mvp/design.md`)
- Multiple trigger types (segment entry, event-based, scheduled)
- Journey status state machine (draft/active/paused/archived)
- SMS node configuration
- Email builder modal integration
- Multiple end nodes with exit reasons

### MLP (`journey-builder-mlp/design.md`)
- Branch node architecture (If/Else, A/B split)
- Join node merge logic
- Wait for event implementation
- Canvas changes for multi-path flows

## Testing Strategy

### Unit Tests

- **JourneysPage**: renders journey list, New Journey button opens dialog
- **JourneyCanvas**: renders nodes and edges from sample journey
- **NodePalette**: shows 4 node types, disables Start/End when one exists
- **InspectorPanel**: opens on node click, closes on Escape
- **StartConfig**: shows read-only manual trigger description
- **EmailConfig**: shows email picker dropdown
- **DelayConfig**: shows duration input and unit selector
- **EndConfig**: shows read-only completion description
- **Validation**: detects missing start, missing end, disconnected nodes
- **Auto-connect**: inserts node into existing edge correctly
- **Auto-heal**: reconnects upstream to downstream on delete

### Integration Tests

- Full flow: create journey → add nodes → connect → configure → validate
- Sample journey load: verify Welcome Journey renders correctly
- Undo/redo: add node → undo → verify removed → redo → verify restored
