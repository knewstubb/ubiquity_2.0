# Requirements Document

> **Phase:** WS (Walking Skeleton)
> **Next Phase:** `journey-builder-mvp/` (MVP)

## Introduction

A visual, canvas-based journey builder for the UbiQuity 2.0 interactive design prototype. The Walking Skeleton is a fully functional, end-to-end journey builder that proves technical feasibility by implementing **one specific flow** extremely well: a linear sequence of Start → Email → Delay → Email → End.

This phase validates:
1. **Data Model:** Prove the relational schema can handle journey state without locking or corruption.
2. **Canvas UI:** Prove React Flow can handle drag-and-drop operations without performance lag.
3. **Linear Orchestration:** Prove a contact can move step-by-step through a journey.

This is a prototype feature — there is no backend orchestration engine, no real execution, and no API calls. All state is local, all data is simulated using the existing NZ spa chain sample set. The journey builder lives at Automations > Journeys in the navigation.

## Glossary

- **Journey_Canvas**: The React Flow-powered workspace where users visually compose journey workflows by placing and connecting nodes.
- **Journey_Node**: A discrete step in a journey, rendered as a draggable card on the Journey_Canvas. Walking Skeleton supports four types: start, email, delay, end.
- **Start_Node**: The fixed entry point for all contacts. In Walking Skeleton, this is a manual trigger that targets all contacts in the database.
- **Email_Node**: An action node that sends an email. Users select from existing journey email templates.
- **Delay_Node**: A wait node that pauses progression for a configurable duration (in seconds for testing, or days for realistic scenarios).
- **End_Node**: The terminal node that marks journey completion.
- **Connector**: A directed edge (line) between two Journey_Nodes on the Journey_Canvas, representing the flow direction. Each Connector displays a (+) button at its midpoint for inserting new nodes.
- **Insert_Button**: The (+) button displayed on each Connector that opens a popover menu for adding new nodes at that position.
- **Inspector_Panel**: A slide-out side panel that displays configuration options for the currently selected Journey_Node.
- **Minimap**: A small overview widget showing the entire journey layout, allowing quick navigation.
- **Campaign**: The parent container that groups related journeys, defined in the existing campaign model.
- **Sample_Journey**: A pre-built journey included in the prototype's seed data to demonstrate the builder's capabilities.

## Requirements

### Requirement 1: Journey List View

**User Story:** As a prototype user, I want to see all journeys in a list with the ability to open one on the canvas, so that I can manage and navigate to journey workflows.

#### Acceptance Criteria

1. WHEN the user navigates to Automations > Journeys, THE JourneysPage SHALL display a list of journeys showing name, parent campaign name, and entry count, sorted newest first.
2. WHEN the user clicks a journey row, THE JourneysPage SHALL navigate to the Journey_Canvas view for that journey, pre-loaded with its nodes and connectors.
3. THE JourneysPage SHALL display a "New Journey" button that opens a dialog for entering journey name and selecting a parent campaign.
4. WHEN the user submits the create journey dialog, THE JourneysPage SHALL add a new journey and navigate to its Journey_Canvas with a default Start_Node placed.
5. THE JourneysPage SHALL display an empty state when no journeys exist, with a prompt to create the first journey.
6. THE JourneysPage SHALL allow deleting a journey via a context menu or delete action.

> **Note:** WS has no draft/active status — all journeys are considered "live".

### Requirement 2: Canvas Workspace

**User Story:** As a prototype user, I want a visual canvas where I can see my journey as a flow of connected nodes, so that I can understand and build the journey structure at a glance.

#### Acceptance Criteria

1. THE Journey_Canvas SHALL render all Journey_Nodes and Connectors for the selected journey using the React Flow library.
2. THE Journey_Canvas SHALL support pan (click-drag on empty space) and zoom (scroll wheel or pinch) interactions.
3. THE Journey_Canvas SHALL display a Minimap widget in the bottom-right corner showing the full journey layout with a viewport indicator.
4. THE Journey_Canvas SHALL display a toolbar with zoom-in, zoom-out, and fit-to-view controls.
5. WHEN the journey contains only a Start_Node, THE Journey_Canvas SHALL position it at the top-centre of the visible area.
6. THE Journey_Canvas SHALL render Connectors as directed edges with arrowheads indicating flow direction.

### Requirement 3: Node Insertion via (+) Button

**User Story:** As a prototype user, I want to click a (+) button on a connector to add a new node at that point, so that I can insert steps into my journey intuitively.

#### Acceptance Criteria

1. THE Journey_Canvas SHALL display a (+) button at the midpoint of every Connector between nodes.
2. WHEN the user clicks a (+) button, THE Journey_Canvas SHALL display a popover menu listing available node types: Email, Delay, End.
3. WHEN the user selects a node type from the popover, THE Journey_Canvas SHALL insert a new Journey_Node at that position, splitting the Connector into two (auto-connect).
4. THE popover menu SHALL display each node type with an icon and label: Envelope icon for Email, Clock icon for Delay, Flag icon for End.
5. THE popover menu SHALL close when the user clicks outside it or presses Escape.
6. THE (+) button SHALL NOT appear on Connectors leading to the End_Node if an End_Node already exists.

> **Note:** Start is not available in the popover — every journey begins with exactly one fixed Start_Node.

### Requirement 4: Node Connection (Linear Flow)

**User Story:** As a prototype user, I want nodes to be automatically connected when I add them, so that I can build the journey flow without manual wiring.

#### Acceptance Criteria

1. WHEN a new journey is created, THE Journey_Canvas SHALL display a Start_Node connected to an End_Node via a single Connector.
2. WHEN the user inserts a node via the (+) button, THE Journey_Canvas SHALL split the Connector and insert the new node between the two previously connected nodes (auto-connect).
3. THE Journey_Canvas SHALL enforce linear flow: each node (except End_Node) SHALL have exactly one outgoing Connector.
4. THE Journey_Canvas SHALL enforce linear flow: each node (except Start_Node) SHALL have exactly one incoming Connector.
5. WHEN the user deletes a node that has both incoming and outgoing Connectors, THE Journey_Canvas SHALL reconnect the upstream node to the downstream node (auto-heal).
6. THE Journey_Canvas SHALL prevent connections that create cycles.

> **Note:** Manual handle-to-handle connection is not required for WS — all connections are created automatically via the (+) button insertion or auto-heal.

### Requirement 5: Node Selection and Inspector Panel

**User Story:** As a prototype user, I want to click a node and see its configuration in a side panel, so that I can view and edit node settings without cluttering the canvas.

#### Acceptance Criteria

1. WHEN the user clicks a Journey_Node on the canvas, THE Inspector_Panel SHALL slide in from the right side displaying the node's configuration form.
2. THE Inspector_Panel SHALL display the node type icon, label, and a type-specific configuration form.
3. WHEN the user clicks empty canvas space or presses Escape, THE Inspector_Panel SHALL close.
4. WHEN the user modifies a value in the Inspector_Panel, THE Journey_Canvas SHALL update the selected node's configuration in local state immediately.
5. THE Inspector_Panel SHALL display a delete button that removes the selected node from the canvas (triggering auto-heal if applicable).
6. THE Inspector_Panel SHALL NOT allow deletion of the Start_Node.

### Requirement 6: Start Node Configuration

**User Story:** As a prototype user, I want to see the start node configuration, so that I understand how contacts enter the journey.

#### Acceptance Criteria

1. WHEN a Start_Node is selected, THE Inspector_Panel SHALL display a read-only description: "Manual trigger — sends to all contacts in the database."
2. THE Start_Node SHALL be fixed at the top of the journey; it cannot be repositioned below other nodes.
3. THE Start_Node SHALL always be the first node in the journey flow.

> **Note:** WS has only manual trigger. Segment entry, event-based, and scheduled triggers are deferred to MVP.

### Requirement 7: Email Node Configuration

**User Story:** As a prototype user, I want to configure email nodes to select which email template to send, so that I can build meaningful journey workflows.

#### Acceptance Criteria

1. WHEN an Email_Node is selected, THE Inspector_Panel SHALL display a dropdown to select from existing email templates.
2. THE Inspector_Panel SHALL display the selected email's subject line and preview thumbnail (if available).
3. WHEN no email is selected, THE Email_Node SHALL display a "Select email…" placeholder.
4. THE Journey_Canvas SHALL render the Email_Node with a summary label showing the selected email name (e.g., "Send: Welcome Email").

> **Note:** WS does not include email editing. Users pick from existing templates only. Email builder integration is deferred to MVP.

### Requirement 8: Delay Node Configuration

**User Story:** As a prototype user, I want to configure delay nodes to control timing between journey steps, so that I can pace the customer experience.

#### Acceptance Criteria

1. WHEN a Delay_Node is selected, THE Inspector_Panel SHALL display a numeric duration input and a unit selector (seconds, minutes, hours, days).
2. THE default delay duration SHALL be 1 day.
3. THE Journey_Canvas SHALL render the Delay_Node with a visual label showing the configured duration (e.g., "Wait 3 days", "Wait 30 seconds").
4. THE Inspector_Panel SHALL validate that duration is a positive integer.

> **Note:** Seconds are included for testing purposes. Production journeys will typically use hours/days.

### Requirement 9: End Node Configuration

**User Story:** As a prototype user, I want to place an end node to mark where the journey terminates.

#### Acceptance Criteria

1. WHEN an End_Node is selected, THE Inspector_Panel SHALL display a read-only description: "Journey complete — contact exits the journey."
2. THE End_Node SHALL have no outgoing Connector handle.
3. THE End_Node SHALL always be the last node in the journey flow.

> **Note:** WS has a single exit point. Multiple end nodes, exit reasons, and "move to journey" are deferred to MVP.

### Requirement 10: Canvas Validation

**User Story:** As a prototype user, I want the canvas to highlight configuration errors, so that I can identify and fix problems before the journey runs.

#### Acceptance Criteria

1. THE Journey_Canvas SHALL run client-side validation continuously as the user builds.
2. WHEN validation finds a node with missing required configuration (e.g., Email_Node with no email selected), THE Journey_Canvas SHALL display a warning indicator (amber border) on that node.
3. WHEN validation finds a disconnected node (no path from Start to End), THE Journey_Canvas SHALL display a warning indicator on that node.
4. THE Journey_Canvas SHALL display a validation summary in the toolbar showing the count of warnings.
5. IF validation finds zero warnings, THEN THE Journey_Canvas SHALL display a green checkmark indicating the journey is valid.

### Requirement 11: Node Visual Design

**User Story:** As a prototype user, I want nodes to be visually distinct by type and clearly show their configured state, so that I can scan the canvas and understand the journey at a glance.

#### Acceptance Criteria

1. THE Journey_Canvas SHALL render each node type with a distinct colour accent: teal for Start, blue for Email, amber for Delay, zinc-400 for End.
2. THE Journey_Canvas SHALL render each node with an icon representing its type: Play for Start, Envelope for Email, Clock for Delay, Flag for End.
3. THE Journey_Canvas SHALL display a summary label on each node showing its key configuration.
4. WHEN a node has incomplete configuration, THE Journey_Canvas SHALL render it with a dashed border to indicate it needs attention.
5. THE Journey_Canvas SHALL use the prototype's design tokens (4px border radius, shadow-sm, Inter font) for all node rendering.

### Requirement 12: Sample Journey Data

**User Story:** As a prototype user, I want a pre-built sample journey loaded on the canvas, so that I can immediately explore the builder without starting from scratch.

#### Acceptance Criteria

1. THE prototype SHALL include a "Welcome Journey" Sample_Journey demonstrating the WS pattern: Start → Email (Welcome) → Delay (2 days) → Email (Follow-up) → End.
2. THE Sample_Journey SHALL use node positions that produce a readable top-to-bottom flow on the Journey_Canvas.
3. THE Sample_Journey SHALL reference existing email templates from the prototype's seed data.

> **Note:** Additional sample journeys with branching logic are deferred to MVP.

### Requirement 13: Keyboard and Interaction Shortcuts

**User Story:** As a prototype user, I want keyboard shortcuts for common canvas actions, so that I can work efficiently when building journeys.

#### Acceptance Criteria

1. WHEN the user presses Delete or Backspace with a node selected, THE Journey_Canvas SHALL delete the selected node (with auto-heal), unless it is the Start_Node.
2. WHEN the user presses Escape, THE Journey_Canvas SHALL deselect the current node and close the Inspector_Panel.
3. WHEN the user presses Ctrl+Z (or Cmd+Z on macOS), THE Journey_Canvas SHALL undo the last canvas action (node add, delete, move, or connect).
4. WHEN the user presses Ctrl+Shift+Z (or Cmd+Shift+Z on macOS), THE Journey_Canvas SHALL redo the last undone action.

### Requirement 14: Auto-Save

**User Story:** As a prototype user, I want my journey changes to be saved automatically, so that I don't lose work.

#### Acceptance Criteria

1. THE Journey_Canvas SHALL save the journey to local state on every change (node add, delete, move, connect, or configuration update).
2. THE Journey_Canvas SHALL display a "Saved" indicator in the toolbar when changes are persisted.
3. WHEN the user navigates away and returns, THE Journey_Canvas SHALL restore the journey to its last saved state.

### Requirement 15: Journey Data Model (WS)

**User Story:** As a prototype developer, I want well-defined TypeScript interfaces for the WS journey structure, so that the canvas state can be managed consistently.

#### Acceptance Criteria

1. THE Journey data model SHALL include a `nodes` array of JourneyNode objects and an `edges` array of JourneyEdge objects.
2. THE JourneyNode type SHALL include: id (string), type (start | email | delay | end), position (x, y coordinates), label (string), and a configuration object specific to the node type.
3. THE JourneyEdge type SHALL include: id (string), source (string node id), target (string node id).
4. THE Email node configuration SHALL include: emailId (string reference to template), emailName (string for display).
5. THE Delay node configuration SHALL include: duration (number), unit (seconds | minutes | hours | days).

---

## Deferred to Future Phases

The following features are explicitly out of scope for WS and will be addressed in subsequent phases:

### MVP (see `journey-builder-mvp/`)
- Segment entry triggers (target specific segments instead of all contacts)
- Event-based triggers (form submitted, purchase made, etc.)
- Scheduled triggers (run at specific times)
- Draft/Active/Paused journey status
- Email builder integration (edit emails from within the journey)
- SMS action nodes
- Multiple end nodes with exit reasons
- Basic reporting (journey entry/completion counts)

### MLP (see `journey-builder-mlp/`)
- Branch nodes (If/Else conditional logic)
- A/B split testing
- Join nodes (merge paths)
- Wait for event nodes
- Update contact action nodes
- Journey versioning

### V2
- Multi-way splits
- Webhook action nodes
- Advanced reporting and analytics
- Journey templates

### V3
- AI-powered journey suggestions
- Predictive send-time optimisation
- Cross-journey orchestration
