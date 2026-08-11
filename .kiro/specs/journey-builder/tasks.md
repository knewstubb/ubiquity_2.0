# Implementation Plan: Journey Builder (WS)

> **Phase:** WS (Walking Skeleton)
> **Next Phase:** `journey-builder-mvp/tasks.md`

## Overview

Build a visual, canvas-based journey builder using React Flow (`@xyflow/react`). WS implements the minimal viable flow: Start → Email → Delay → End nodes in a strictly linear sequence. All state is local (React context + localStorage), no backend.

The implementation proceeds bottom-up: data models → context + seed data → graph utilities + validation → custom node components (4 types only) → canvas wrapper → palette + inspector + config forms → toolbar → page routing → keyboard shortcuts.

## Tasks

- [x] 1. Install dependency and create data models
  - [x] 1.1 Install @xyflow/react
    - Run `npm install @xyflow/react` to add React Flow as a project dependency
    - _Requirements: 2.1_

  - [x] 1.2 Create journey data model types (WS)
    - Create `src/models/journey.ts` with TypeScript interfaces
    - Define `NodeType = 'start' | 'email' | 'delay' | 'end'`
    - Define node configuration interfaces: `StartConfig`, `EmailConfig`, `DelayConfig`, `EndConfig`
    - Define `NodeConfig` as union of the four config types
    - Define `JourneyNode`, `JourneyEdge`, `JourneyDefinition`
    - Create `createDefaultConfig(type: NodeType): NodeConfig` factory
    - Create `getNodeSummaryLabel(node: JourneyNode): string` utility
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 2. Create JourneysContext and seed data
  - [x] 2.1 Create journey seed data (WS)
    - Create `src/data/journeySeeds.ts` with one sample journey: Welcome Journey
    - Pattern: Start → Email (Welcome) → Delay (2 days) → Email (Follow-up) → End
    - Position nodes top-to-bottom at ~150px vertical spacing
    - Reference existing campaign ID and email templates
    - _Requirements: 12.1, 12.2, 12.3_

  - [x] 2.2 Create JourneysContext with localStorage persistence
    - Create `src/contexts/JourneysContext.tsx` following the same pattern as `ConnectorsContext`
    - Provide: `journeys`, `addJourney`, `updateJourney`, `deleteJourney`, `updateNode`, `addNode`, `removeNode`, `addEdge`, `removeEdge`
    - Initialise from localStorage, falling back to seed data
    - Persist to localStorage on every state change
    - _Requirements: 14.1, 14.2, 14.3, 1.4_

- [x] 3. Checkpoint — Models and context compile
  - Run `npx tsc --noEmit` and `npx vitest --run` to verify no type errors.

- [x] 4. Create graph utilities and validation engine
  - [x] 4.1 Create graph utility functions
    - Create `src/utils/journeyGraph.ts` with: `autoConnect`, `autoHeal`
    - `autoConnect`: splits an existing edge and inserts a new node
    - `autoHeal`: when removing a node, reconnects upstream to downstream
    - All functions return new arrays (no mutation)
    - _Requirements: 4.4, 4.5_

  - [x] 4.2 Create journey validation engine (WS)
    - Create `src/utils/journeyValidation.ts` with `validateJourney(journey: JourneyDefinition): ValidationError[]`
    - Validation rules: no start node, multiple start nodes, no end node, multiple end nodes
    - Email node with no email selected (warning), delay with invalid duration (warning)
    - Disconnected node, no complete path from start to end
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 5. Checkpoint — Utilities and validation compile
  - Run `npx tsc --noEmit` and `npx vitest --run` to verify graph utilities work.

- [x] 6. Create custom node components (4 types only)
  - [x] 6.1 Create shared node styles
    - Create `src/components/journey/nodes/` directory with shared styles
    - Define colour accents: teal for Start, blue for Email, amber for Delay, zinc-400 for End
    - Style nodes with 4px border radius, shadow-sm, Inter font
    - Add dashed border variant for incomplete configuration
    - _Requirements: 11.1, 11.2, 11.4, 11.5_

  - [x] 6.2 Create StartNode component
    - Create `src/components/journey/nodes/StartNode.tsx`
    - Teal accent, Play icon, "Manual Start" label
    - Single output handle (bottom), no input handle
    - _Requirements: 11.1, 11.2, 11.3_

  - [x] 6.3 Create EmailNode component
    - Create `src/components/journey/nodes/EmailNode.tsx`
    - Blue accent, Envelope icon, shows selected email name
    - Input handle (top) + output handle (bottom)
    - _Requirements: 11.1, 11.2, 11.3_

  - [x] 6.4 Create DelayNode component
    - Create `src/components/journey/nodes/DelayNode.tsx`
    - Amber accent, Clock icon, shows duration label (e.g., "Wait 2 days")
    - Input handle (top) + output handle (bottom)
    - _Requirements: 8.3, 11.1, 11.2, 11.3_

  - [x] 6.5 Create EndNode component
    - Create `src/components/journey/nodes/EndNode.tsx`
    - Zinc-400 accent, Flag icon
    - Input handle (top) only, no output handle
    - _Requirements: 11.1, 11.2_

- [x] 7. Create JourneyCanvas wrapper with React Flow
  - [x] 7.1 Create JourneyCanvas component
    - Create `src/components/journey/JourneyCanvas.tsx`
    - Wrap `<ReactFlow>` with `useNodesState` and `useEdgesState`
    - Register four custom node types: start, email, delay, end
    - Implement `onDrop` handler with `autoConnect` when dropped on an edge
    - Implement `onNodesDelete` handler with `autoHeal` logic
    - Sync state changes to `JourneysContext`
    - Add `<MiniMap>` widget, enable pan and zoom
    - Render directed edges with arrowheads
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 4.1, 4.4, 4.5_

- [x] 8. Checkpoint — Canvas renders with nodes
  - Canvas should render sample Welcome Journey nodes and edges with minimap visible.

- [x] 9. Create NodePalette for drag-to-add
  - [x] 9.1 Create NodePalette component
    - Create `src/components/journey/NodePalette.tsx`
    - List four node types: Start, Email, Delay, End
    - Each item shows icon and label
    - Items are draggable with node type in dataTransfer
    - Disable Start when one exists, disable End when one exists
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 10. Create InspectorPanel and config forms (4 types)
  - [x] 10.1 Create InspectorPanel shell
    - Create `src/components/journey/InspectorPanel.tsx`
    - Slide-in panel from right, triggered by `selectedNodeId`
    - Display node type icon, label, and correct config form
    - Include delete button (disabled for Start node)
    - _Requirements: 5.1, 5.2, 5.5, 5.6_

  - [x] 10.2 Create StartConfig form
    - Create `src/components/journey/config/StartConfig.tsx`
    - Read-only description: "Manual trigger — sends to all contacts in the database."
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 10.3 Create EmailConfig form
    - Create `src/components/journey/config/EmailConfig.tsx`
    - Email template picker dropdown
    - Show selected email subject/preview
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 10.4 Create DelayConfig form
    - Create `src/components/journey/config/DelayConfig.tsx`
    - Duration input (number) + unit selector (seconds, minutes, hours, days)
    - Default: 1 day
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 10.5 Create EndConfig form
    - Create `src/components/journey/config/EndConfig.tsx`
    - Read-only description: "Journey complete — contact exits the journey."
    - _Requirements: 9.1, 9.2, 9.3_

- [x] 11. Checkpoint — Inspector and config forms work
  - Clicking a node should open inspector with correct form, changes persist.

- [x] 12. Create CanvasToolbar
  - [x] 12.1 Create CanvasToolbar component
    - Create `src/components/journey/CanvasToolbar.tsx`
    - Zoom-in, zoom-out, fit-to-view buttons
    - Validate button that runs `validateJourney`
    - Display journey name
    - Show validation status (green checkmark or warning count)
    - _Requirements: 2.4, 10.1, 10.4, 10.5_

- [x] 13. Create JourneyCanvasPage and update routing
  - [x] 13.1 Create JourneyCanvasPage
    - Create `src/pages/JourneyCanvasPage.tsx`
    - Read `journeyId` from URL params
    - Load journey from `JourneysContext`
    - Render: NodePalette (left) + JourneyCanvas (center) + InspectorPanel (right)
    - Show "Journey not found" if ID invalid
    - _Requirements: 1.2, 2.1, 2.5_

  - [x] 13.2 Update JourneysPage with create dialog
    - Add "New Journey" button opening create dialog
    - Dialog: journey name, parent campaign picker
    - On submit: create journey with default Start node, navigate to canvas
    - Row click navigates to canvas
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 13.3 Update App.tsx with route
    - Add route `/automations/journeys/:journeyId` → JourneyCanvasPage
    - _Requirements: 1.2_

- [x] 14. Wire keyboard shortcuts and undo/redo
  - [x] 14.1 Implement keyboard shortcuts
    - Delete/Backspace: delete selected node (except Start), auto-heal
    - Escape: deselect node, close InspectorPanel
    - Ctrl+Z / Cmd+Z: undo
    - Ctrl+Shift+Z / Cmd+Shift+Z: redo
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [x] 15. Wire auto-save
  - [x] 15.1 Implement auto-save
    - Save journey to context on every change
    - Show "Saved" indicator in toolbar
    - _Requirements: 14.1, 14.2, 14.3_

- [x] 16. Final checkpoint — Full integration
  - Run `npx tsc --noEmit` and `npx vitest --run`
  - Verify: journey list loads, create journey works, canvas renders, palette works, inspector works, validation runs, keyboard shortcuts respond

## Deferred Tasks (Future Phases)

The following tasks are deferred to future phase task lists:

### MVP (`journey-builder-mvp/tasks.md`)
- Multiple trigger types (TriggerConfig with segment/event/scheduled options)
- SMS node component and config
- Journey status state machine (draft/active/paused/archived)
- Email builder modal integration
- Exit reasons and multiple end nodes
- Basic reporting metrics

### MLP (`journey-builder-mlp/tasks.md`)
- Branch node component (If/Else, A/B split)
- Join node component
- BranchConfig with FilterBuilder integration
- Multi-path edge handling in canvas
- Wait for event node
- Journey versioning

## Notes

- WS has exactly 4 node types: Start, Email, Delay, End
- Flow is strictly linear — no branching, no joins
- Manual trigger only — no segment entry, event-based, or scheduled triggers
- All journeys are "live" — no draft/active status in this phase
- Each task references specific WS requirements for traceability
