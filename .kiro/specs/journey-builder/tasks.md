# Implementation Plan: Journey Builder

## Overview

Build a visual, canvas-based journey builder using React Flow (`@xyflow/react`). The implementation proceeds bottom-up: data models → context + seed data → graph utilities + validation → custom node components → canvas wrapper → palette + inspector + config forms → toolbar + validation summary → content modal → page routing → keyboard shortcuts. All state is local (React context + localStorage), no backend.

## Tasks

- [x] 1. Install dependency and create data models
  - [x] 1.1 Install @xyflow/react
    - Run `npm install @xyflow/react` to add React Flow as a project dependency
    - _Requirements: 2.1_

  - [x] 1.2 Create journey data model types
    - Create `src/models/journey.ts` with all TypeScript interfaces and type definitions from the design document
    - Define `NodeType`, all sub-type unions (`TriggerSubType`, `ActionSubType`, `WaitSubType`, `BranchSubType`, `EndSubType`)
    - Define all node configuration interfaces as a discriminated union keyed by `subType` (`TriggerConfig`, `ActionConfig`, `WaitConfig`, `BranchConfig`, `EndConfig`, `JoinConfig`, `NodeConfig`)
    - Define `JourneyNode`, `JourneyEdge`, `JourneySettings`, `ReEntryRule`
    - Define `JourneyDefinition` extending the existing `Journey` interface from `./campaign`
    - Import `FilterGroup` from `./segment` for branch condition types
    - Create a `createDefaultConfig(subType: string): NodeConfig` factory function that returns a valid default config for any sub-type
    - Create a `getNodeSummaryLabel(node: JourneyNode): string` utility that returns a human-readable summary from node config
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

  - [ ]* 1.3 Write property test for default config factory correctness
    - **Property 1: Default config factory correctness**
    - **Validates: Requirements 3.2, 17.5**

  - [ ]* 1.4 Write property test for node summary label reflects configuration
    - **Property 5: Node summary label reflects configuration**
    - **Validates: Requirements 8.4, 14.3**

- [x] 2. Create JourneysContext and seed data
  - [x] 2.1 Create journey seed data
    - Create `src/data/journeySeeds.ts` with three sample `JourneyDefinition` objects: Welcome Journey, Re-engagement Journey, Post-Purchase Follow-up
    - Each journey must have full `nodes[]`, `edges[]`, and `settings` matching the design document specifications
    - Position nodes top-to-bottom at ~150px vertical spacing for readable layout
    - Reference existing campaign IDs (`cmp-welcome-series`, `cmp-win-back`, `cmp-summer-glow`) and segment IDs from `src/data/segments.ts`
    - Export a `journeyDefinitions` array containing all three sample journeys
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

  - [ ]* 2.2 Write property test for sample journey top-to-bottom layout
    - **Property 10: Sample journey top-to-bottom layout**
    - **Validates: Requirements 15.4**

  - [ ]* 2.3 Write property test for sample journey references valid seed data
    - **Property 11: Sample journey references valid seed data**
    - **Validates: Requirements 15.5**

  - [x] 2.4 Create JourneysContext with localStorage persistence
    - Create `src/contexts/JourneysContext.tsx` following the same pattern as `ConnectorsContext`
    - Provide: `journeys`, `addJourney`, `updateJourney`, `deleteJourney`, `updateNode`, `addNode`, `removeNode`, `addEdge`, `removeEdge`
    - Initialise from localStorage, falling back to seed data from `journeySeeds.ts`
    - Persist to localStorage on every state change via `useEffect`
    - Handle corrupted localStorage gracefully (catch parse errors, return seed data)
    - _Requirements: 17.1, 1.4, 12.4_

- [x] 3. Checkpoint — Models and context compile
  - Ensure all tests pass, ask the user if questions arise. Run `npx tsc --noEmit` and `npx vitest --run` to verify no type errors from the new models and context.

- [x] 4. Create graph utilities and validation engine
  - [x] 4.1 Create graph utility functions
    - Create `src/utils/journeyGraph.ts` with three pure functions: `autoConnect`, `autoHeal`, `detectCycle`
    - `detectCycle`: DFS from proposed target node — returns `true` if it reaches the proposed source node
    - `autoConnect`: splits an existing edge and inserts a new node between the two previously connected nodes
    - `autoHeal`: when removing a non-branch node with one incoming and one outgoing edge, reconnects upstream to downstream; for branch nodes with multiple outputs, just removes all edges referencing the deleted node
    - All functions take immutable inputs and return new arrays (no mutation)
    - _Requirements: 4.2, 4.3, 4.4_

  - [ ]* 4.2 Write property test for cycle detection
    - **Property 2: Cycle detection**
    - **Validates: Requirements 4.2**

  - [ ]* 4.3 Write property test for auto-connect preserves reachability
    - **Property 3: Auto-connect preserves reachability**
    - **Validates: Requirements 4.3**

  - [ ]* 4.4 Write property test for auto-heal reconnects upstream to downstream
    - **Property 4: Auto-heal reconnects upstream to downstream**
    - **Validates: Requirements 4.4**

  - [x] 4.5 Create journey validation engine
    - Create `src/utils/journeyValidation.ts` with `validateJourney(journey: JourneyDefinition): ValidationError[]`
    - Define `ValidationError` interface: `{ nodeId?: string; message: string; severity: 'error' | 'warning' }`
    - Implement all validation rules from the design: no trigger, multiple triggers, missing required config (per sub-type completeness rules), non-end node with no outgoing edge, disconnected node, end node with outgoing edge (warning)
    - Config completeness checks per sub-type as specified in the design document
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

  - [ ]* 4.6 Write property test for validation detects incomplete configuration
    - **Property 7: Validation detects incomplete configuration**
    - **Validates: Requirements 13.2**

  - [ ]* 4.7 Write property test for validation detects missing outgoing edges
    - **Property 8: Validation detects missing outgoing edges**
    - **Validates: Requirements 13.3**

  - [ ]* 4.8 Write property test for validation detects disconnected nodes
    - **Property 9: Validation detects disconnected nodes**
    - **Validates: Requirements 13.4**

- [x] 5. Checkpoint — Utilities and validation compile
  - Ensure all tests pass, ask the user if questions arise. Run `npx tsc --noEmit` and `npx vitest --run` to verify graph utilities and validation engine work correctly.

- [x] 6. Create custom node components
  - [x] 6.1 Create shared node styles
    - Create `src/components/journey/nodes/nodeStyles.module.css` with shared styles for all custom nodes
    - Define colour accents per node type: teal for triggers, blue for actions, amber for waits, purple for branches, zinc-400 for ends, zinc-300 for joins
    - Style nodes with 4px border radius, shadow-sm, Inter font, icon + label layout
    - Add dashed border variant for incomplete configuration
    - Add red border + warning icon variant for validation errors
    - _Requirements: 14.1, 14.2, 14.4, 14.5_

  - [x] 6.2 Create TriggerNode component
    - Create `src/components/journey/nodes/TriggerNode.tsx` as a custom React Flow node component
    - Teal accent, shows trigger sub-type icon and summary label from `getNodeSummaryLabel`
    - Single output handle (bottom), no input handle
    - Use `Handle` from `@xyflow/react` for connection points
    - _Requirements: 14.1, 14.2, 14.3_

  - [x] 6.3 Create ActionNode component
    - Create `src/components/journey/nodes/ActionNode.tsx` — blue accent, sub-type icon (envelope for email, chat for SMS, etc.), summary label
    - Input handle (top) + output handle (bottom)
    - _Requirements: 14.1, 14.2, 14.3_

  - [x] 6.4 Create WaitNode component
    - Create `src/components/journey/nodes/WaitNode.tsx` — amber accent, clock icon, shows configured wait duration/condition label
    - Input handle (top) + output handle (bottom)
    - _Requirements: 8.4, 14.1, 14.2, 14.3_

  - [x] 6.5 Create BranchNode component
    - Create `src/components/journey/nodes/BranchNode.tsx` — purple accent, git-branch icon
    - Input handle (top), multiple output handles (bottom) — one per branch path
    - If/Else: two outputs labelled "Yes" / "No"
    - A/B Split: two outputs labelled "Variant A" / "Variant B" with percentages
    - Multi-way: one output per condition + "Everyone Else"
    - _Requirements: 9.2, 9.4, 9.6, 14.1, 14.2_

  - [ ]* 6.6 Write property test for multi-way branch output handle count
    - **Property 6: Multi-way branch output handle count**
    - **Validates: Requirements 9.6**

  - [x] 6.7 Create EndNode and JoinNode components
    - Create `src/components/journey/nodes/EndNode.tsx` — zinc-400 accent, input handle only (no output)
    - Create `src/components/journey/nodes/JoinNode.tsx` — zinc-300 accent, multiple input handles, single output handle
    - _Requirements: 10.3, 14.1_

- [x] 7. Create JourneyCanvas wrapper with React Flow
  - [x] 7.1 Create JourneyCanvas component and styles
    - Create `src/components/journey/JourneyCanvas.tsx` and `JourneyCanvas.module.css`
    - Wrap `<ReactFlow>` with `useNodesState` and `useEdgesState` hooks
    - Register all custom node types (trigger, action, wait, branch, end, join)
    - Implement `onConnect` handler with `detectCycle` check via `isValidConnection` callback
    - Implement `onDrop` handler for drag-from-palette with `autoConnect` when dropped on an edge
    - Implement `onNodesDelete` handler with `autoHeal` logic
    - Sync canvas state changes back to `JourneysContext` via `updateJourney`
    - Add `<MiniMap>` widget in bottom-right corner
    - Render directed edges with arrowheads using React Flow's `markerEnd` config
    - Show empty state with prompt when journey has no nodes
    - Enable `snapToGrid`, pan (click-drag), and zoom (scroll wheel)
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 8. Checkpoint — Canvas renders with nodes
  - Ensure all tests pass, ask the user if questions arise. At this point the canvas should render sample journey nodes and edges with the minimap visible.

- [x] 9. Create NodePalette for drag-to-add
  - [x] 9.1 Create NodePalette component
    - Create `src/components/journey/NodePalette.tsx` and `NodePalette.module.css`
    - List available node types grouped by category: Triggers, Actions, Waits, Branches, Ends
    - Each item shows an icon and label (e.g., envelope for "Send Email", clock for "Time Delay")
    - Items are draggable — set `onDragStart` with node type data in the drag event's `dataTransfer`
    - Disable the trigger category when a trigger node already exists on the canvas
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 10. Create InspectorPanel and config forms
  - [x] 10.1 Create InspectorPanel shell
    - Create `src/components/journey/InspectorPanel.tsx` and `InspectorPanel.module.css`
    - Slide-in panel from the right side, triggered by `selectedNodeId` prop
    - Display node type icon, label, and render the correct config form based on `node.type` and `node.subType`
    - Include a delete button that removes the selected node (triggering auto-heal)
    - Support a "settings" mode that renders `JourneySettingsForm` instead of a node config
    - _Requirements: 5.1, 5.2, 5.5_

  - [x] 10.2 Create TriggerConfig form
    - Create `src/components/journey/config/TriggerConfig.tsx`
    - Trigger type selector with options: Segment Entry, Event-Based, Manual, Scheduled
    - Segment Entry: segment picker dropdown listing segments from seed data
    - Event-Based: event type dropdown (Form Submitted, Purchase Made, Page Visited)
    - Scheduled: date input + recurrence selector (once, daily, weekly, monthly)
    - Manual: description text field
    - Wire `onChange` to update node config via `JourneysContext.updateNode`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 10.3 Create ActionConfig form
    - Create `src/components/journey/config/ActionConfig.tsx`
    - Send Email: email reference field + "Edit Email" button (opens ContentModal)
    - Send SMS: message text field + sender name field
    - Update Contact: field picker (from fieldRegistry) + value input
    - Webhook: URL input + method selector (GET, POST)
    - _Requirements: 7.1, 7.3, 7.4, 7.5_

  - [x] 10.4 Create WaitConfig form
    - Create `src/components/journey/config/WaitConfig.tsx`
    - Time Delay: numeric duration input + unit selector (minutes, hours, days, weeks)
    - Wait for Event: event type dropdown + timeout duration input
    - Wait Until Date: date picker for target date
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 10.5 Create BranchConfig form
    - Create `src/components/journey/config/BranchConfig.tsx`
    - If/Else: render the existing `FilterBuilder` component for defining the branch condition
    - A/B Split: percentage inputs for each variant (default 50/50)
    - Multi-way: list of conditions (each using FilterBuilder) + "Add Path" button + default "Everyone Else" path
    - _Requirements: 9.1, 9.3, 9.5_

  - [x] 10.6 Create EndConfig form
    - Create `src/components/journey/config/EndConfig.tsx`
    - Exit Journey: label field + optional reason dropdown (completed, unsubscribed, goal met)
    - Move to Journey: journey picker dropdown listing other journeys
    - _Requirements: 10.1, 10.2_

  - [x] 10.7 Create JourneySettingsForm
    - Create `src/components/journey/config/JourneySettingsForm.tsx` and `src/components/journey/config/configStyles.module.css`
    - Fields: name, description, journey type selector
    - Entry criteria: segment picker + re-entry rule selector (allow, block, delay)
    - Status selector with transitions between draft, active, paused, archived
    - Wire status changes to update the canvas header badge
    - _Requirements: 12.2, 12.3, 12.4, 12.5_

- [x] 11. Checkpoint — Inspector and config forms work
  - Ensure all tests pass, ask the user if questions arise. Clicking a node should open the inspector with the correct config form, and changes should persist.

- [x] 12. Create CanvasToolbar and ValidationSummary
  - [x] 12.1 Create CanvasToolbar component
    - Create `src/components/journey/CanvasToolbar.tsx` and `CanvasToolbar.module.css`
    - Zoom-in, zoom-out, fit-to-view buttons (wire to React Flow's `useReactFlow` zoom methods)
    - Validate button that calls `validateJourney` and passes errors to `ValidationSummary`
    - Settings gear button that switches InspectorPanel to settings mode
    - Display journey name and colour-coded status badge (draft: grey, active: teal, paused: amber, archived: zinc-400)
    - _Requirements: 2.4, 12.1, 13.1, 1.5_

  - [x] 12.2 Create ValidationSummary panel
    - Create `src/components/journey/ValidationSummary.tsx` and `ValidationSummary.module.css`
    - Dropdown panel listing all `ValidationError[]` from the last validation run
    - Each error is clickable — clicking pans to and selects the offending node using React Flow's `fitView` / `setCenter`
    - Show success indicator when validation finds zero errors
    - _Requirements: 13.5, 13.6_

- [x] 13. Create ContentModal overlay
  - [x] 13.1 Create ContentModal component
    - Create `src/components/journey/ContentModal.tsx` and `ContentModal.module.css`
    - Full-screen overlay for email/form/survey editing
    - Canvas remains visible behind the modal at reduced opacity
    - Accepts a `contentType` prop ('email' | 'form' | 'survey') and renders a placeholder builder UI
    - On close, updates the action node's content reference in context
    - Wire "Edit Email" button in ActionConfig to open this modal
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 7.2_

- [x] 14. Create JourneyCanvasPage and update routing
  - [x] 14.1 Create JourneyCanvasPage
    - Create `src/pages/JourneyCanvasPage.tsx`
    - Route wrapper that reads `journeyId` from URL params
    - Loads the journey from `JourneysContext` by ID
    - Renders the canvas layout: `NodePalette` (left) + `JourneyCanvas` (center) + `InspectorPanel` (right, conditional)
    - Renders `CanvasToolbar` at the top and `ValidationSummary` as a dropdown from the toolbar
    - Shows "Journey not found" message with link back to list if ID is invalid
    - _Requirements: 1.2, 2.1, 2.5_

  - [x] 14.2 Update JourneysPage with create dialog and row navigation
    - Modify `src/pages/JourneysPage.tsx` to wire to `JourneysContext` instead of static `journeys` import
    - Add "Create Journey" button that opens a dialog for entering journey name, selecting parent campaign, and choosing journey type
    - On submit, create a new draft journey with a default trigger node and navigate to its canvas
    - Add row click handler to navigate to `/automations/journeys/:journeyId`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 14.3 Update App.tsx with new route and provider
    - Add route `/automations/journeys/:journeyId` pointing to `JourneyCanvasPage`
    - Wrap the route tree with `JourneysProvider` from `JourneysContext`
    - _Requirements: 1.2_

- [x] 15. Wire keyboard shortcuts and undo/redo
  - [x] 15.1 Implement keyboard shortcuts
    - In `JourneyCanvas`, add `useEffect` keyboard event listeners:
    - Delete/Backspace with node selected: delete node with auto-heal
    - Escape: deselect current node and close InspectorPanel
    - Ctrl+Z / Cmd+Z: undo last canvas action (maintain an undo stack of node/edge snapshots)
    - Ctrl+Shift+Z / Cmd+Shift+Z: redo last undone action
    - Undo/redo are no-ops when their respective stacks are empty
    - _Requirements: 16.1, 16.2, 16.3, 16.4_

- [x] 16. Final checkpoint — Full integration
  - Ensure all tests pass, ask the user if questions arise. Run `npx tsc --noEmit` and `npx vitest --run`. Verify: journey list loads with sample data, create journey works, canvas renders nodes/edges, palette drag-to-add works, inspector opens on node click, validation runs, keyboard shortcuts respond.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- React Flow (`@xyflow/react`) must be installed before any canvas work begins
- The existing `FilterBuilder` component is reused for branch conditions — no new filter UI needed
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation after major milestones
- Property tests validate universal correctness properties from the design document using `fast-check` (already in devDependencies)
- All state is local — `JourneysContext` + localStorage, following the same pattern as `ConnectorsContext`
