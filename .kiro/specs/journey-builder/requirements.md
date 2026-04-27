# Requirements Document

## Introduction

A visual, canvas-based journey builder for the UbiQuity 2.0 interactive design prototype. The journey builder provides a React Flow-powered drag-and-drop interface where users compose automated customer journeys from trigger, action, wait, branch, and end nodes. An inspector panel slides out for node configuration, and content creation (email, form, survey) is triggered via modal overlays that preserve canvas context.

This is a prototype feature — there is no backend orchestration engine, no real execution, and no API calls. All state is local, all data is simulated using the existing NZ spa chain sample set, and the goal is to let stakeholders experience the full journey-building UX before development begins. The journey builder lives at Automations > Journeys in the navigation.

## Glossary

- **Journey_Canvas**: The React Flow-powered workspace where users visually compose journey workflows by placing and connecting nodes.
- **Journey_Node**: A discrete step in a journey, rendered as a draggable card on the Journey_Canvas. Each node has a type (trigger, action, wait, branch, end) and type-specific configuration.
- **Trigger_Node**: A Journey_Node that defines how contacts enter the journey (segment entry, event-based, manual, or scheduled).
- **Action_Node**: A Journey_Node that performs an operation on a contact (send email, send SMS, update contact field, webhook call).
- **Wait_Node**: A Journey_Node that pauses the contact's progression for a time delay, until an event occurs, or until a specific date.
- **Branch_Node**: A Journey_Node that splits the flow based on a condition (if/else filter, A/B percentage split, or multi-way split).
- **End_Node**: A Journey_Node that terminates the contact's journey (exit, or move to another journey).
- **Join_Node**: A Journey_Node that merges two or more branch paths back into a single flow.
- **Connector**: A directed edge (line) between two Journey_Nodes on the Journey_Canvas, representing the flow direction.
- **Inspector_Panel**: A slide-out side panel that displays configuration options for the currently selected Journey_Node.
- **Node_Palette**: A panel or menu from which users drag new Journey_Nodes onto the Journey_Canvas.
- **Minimap**: A small overview widget showing the entire journey layout, allowing quick navigation on large canvases.
- **Journey_Settings**: The metadata for a journey including name, description, entry criteria, re-entry rules, and status.
- **Journey_Status**: The lifecycle state of a journey: draft, active, paused, or archived.
- **Content_Modal**: A full-screen modal overlay opened from an Action_Node to create or edit content (email, form, or survey) without leaving the Journey_Canvas.
- **Validation_Indicator**: A visual marker (icon, border colour) on a Journey_Node or Connector indicating a configuration error or missing requirement.
- **Filter_Builder**: The existing shared component (from the segmentation-filters spec) used for defining branch conditions and entry criteria.
- **Campaign**: The parent container that groups related journeys, defined in the existing campaign model.
- **Sample_Journey**: A pre-built journey included in the prototype's seed data to demonstrate the builder's capabilities.

## Requirements

### Requirement 1: Journey List View

**User Story:** As a prototype user, I want to see all journeys in a list with status indicators and the ability to open one on the canvas, so that I can manage and navigate to journey workflows.

#### Acceptance Criteria

1. WHEN the user navigates to Automations > Journeys, THE JourneysPage SHALL display a list of journeys showing name, parent campaign name, status badge, journey type, and entry count.
2. WHEN the user clicks a journey row, THE JourneysPage SHALL navigate to the Journey_Canvas view for that journey, pre-loaded with its nodes and connectors.
3. THE JourneysPage SHALL display a "Create Journey" button that opens a dialog for entering journey name, selecting a parent campaign, and choosing a journey type.
4. WHEN the user submits the create journey dialog, THE JourneysPage SHALL add a new journey in draft status and navigate to its Journey_Canvas with a default Trigger_Node placed.
5. THE JourneysPage SHALL display Journey_Status as a colour-coded badge (draft: grey, active: teal, paused: amber, archived: zinc-400).

### Requirement 2: Canvas Workspace

**User Story:** As a prototype user, I want a visual canvas where I can see my journey as a flow of connected nodes, so that I can understand and build the journey structure at a glance.

#### Acceptance Criteria

1. THE Journey_Canvas SHALL render all Journey_Nodes and Connectors for the selected journey using the React Flow library.
2. THE Journey_Canvas SHALL support pan (click-drag on empty space) and zoom (scroll wheel or pinch) interactions.
3. THE Journey_Canvas SHALL display a Minimap widget in the bottom-right corner showing the full journey layout with a viewport indicator.
4. THE Journey_Canvas SHALL display a toolbar with zoom-in, zoom-out, and fit-to-view controls.
5. WHEN the journey contains no nodes, THE Journey_Canvas SHALL display an empty state with a prompt to add a trigger node.
6. THE Journey_Canvas SHALL render Connectors as directed edges with arrowheads indicating flow direction.

### Requirement 3: Node Palette and Drag-to-Add

**User Story:** As a prototype user, I want to drag node types from a palette onto the canvas, so that I can add steps to my journey intuitively.

#### Acceptance Criteria

1. THE Journey_Canvas SHALL display a Node_Palette panel listing available node types grouped by category: Triggers, Actions, Waits, Branches, and Ends.
2. WHEN the user drags a node type from the Node_Palette onto the Journey_Canvas, THE Journey_Canvas SHALL place a new Journey_Node at the drop position with default configuration.
3. THE Node_Palette SHALL display each node type with an icon and label identifying its function (e.g., envelope icon for "Send Email", clock icon for "Time Delay").
4. THE Journey_Canvas SHALL restrict placement to one Trigger_Node per journey; IF a Trigger_Node already exists, THEN THE Node_Palette SHALL disable the trigger category.

### Requirement 4: Node Connection and Auto-Layout

**User Story:** As a prototype user, I want to connect nodes by dragging from one node's output handle to another node's input handle, so that I can define the journey flow.

#### Acceptance Criteria

1. WHEN the user drags from a node's output handle to another node's input handle, THE Journey_Canvas SHALL create a Connector between the two nodes.
2. THE Journey_Canvas SHALL prevent connections that create cycles (a node connecting back to an ancestor in its own path).
3. WHEN the user drops a new node onto an existing Connector, THE Journey_Canvas SHALL split the Connector and insert the new node between the two previously connected nodes (auto-connect).
4. WHEN the user deletes a node that has both incoming and outgoing Connectors, THE Journey_Canvas SHALL reconnect the upstream node to the downstream node (auto-heal).
5. THE Journey_Canvas SHALL allow Branch_Nodes to have multiple output handles (one per branch path).
6. THE Journey_Canvas SHALL allow Join_Nodes to accept multiple incoming Connectors.

### Requirement 5: Node Selection and Inspector Panel

**User Story:** As a prototype user, I want to click a node and see its configuration in a side panel, so that I can view and edit node settings without cluttering the canvas.

#### Acceptance Criteria

1. WHEN the user clicks a Journey_Node on the canvas, THE Inspector_Panel SHALL slide in from the right side displaying the node's configuration form.
2. THE Inspector_Panel SHALL display the node type icon, label, and a type-specific configuration form.
3. WHEN the user clicks empty canvas space or presses Escape, THE Inspector_Panel SHALL close.
4. WHEN the user modifies a value in the Inspector_Panel, THE Journey_Canvas SHALL update the selected node's configuration in local state immediately.
5. THE Inspector_Panel SHALL display a delete button that removes the selected node from the canvas (triggering auto-heal if applicable).

### Requirement 6: Trigger Node Configuration

**User Story:** As a prototype user, I want to configure how contacts enter the journey, so that I can define the starting condition for the automation.

#### Acceptance Criteria

1. WHEN a Trigger_Node is selected, THE Inspector_Panel SHALL display a trigger type selector with options: Segment Entry, Event-Based, Manual, and Scheduled.
2. WHEN the user selects "Segment Entry", THE Inspector_Panel SHALL display a segment picker dropdown listing existing segments from the prototype's sample data.
3. WHEN the user selects "Event-Based", THE Inspector_Panel SHALL display an event type dropdown with simulated event options (e.g., "Form Submitted", "Purchase Made", "Page Visited").
4. WHEN the user selects "Scheduled", THE Inspector_Panel SHALL display a date picker and recurrence selector (once, daily, weekly, monthly).
5. WHEN the user selects "Manual", THE Inspector_Panel SHALL display a description field explaining that contacts are added manually.

### Requirement 7: Action Node Configuration

**User Story:** As a prototype user, I want to configure action nodes to define what happens at each step, so that I can build meaningful journey workflows.

#### Acceptance Criteria

1. WHEN a "Send Email" Action_Node is selected, THE Inspector_Panel SHALL display an email reference field and an "Edit Email" button.
2. WHEN the user clicks "Edit Email" on a Send Email Action_Node, THE Journey_Canvas SHALL open the email builder as a Content_Modal overlay while the canvas remains visible behind it.
3. WHEN a "Send SMS" Action_Node is selected, THE Inspector_Panel SHALL display a message text field and a sender name field.
4. WHEN an "Update Contact" Action_Node is selected, THE Inspector_Panel SHALL display a field picker (from the Field_Registry) and a value input for the update.
5. WHEN a "Webhook" Action_Node is selected, THE Inspector_Panel SHALL display a URL input field and a method selector (GET, POST).

### Requirement 8: Wait Node Configuration

**User Story:** As a prototype user, I want to configure wait nodes to control timing between journey steps, so that I can pace the customer experience.

#### Acceptance Criteria

1. WHEN a "Time Delay" Wait_Node is selected, THE Inspector_Panel SHALL display a numeric duration input and a unit selector (minutes, hours, days, weeks).
2. WHEN a "Wait for Event" Wait_Node is selected, THE Inspector_Panel SHALL display an event type dropdown and a timeout duration input.
3. WHEN a "Wait Until Date" Wait_Node is selected, THE Inspector_Panel SHALL display a date picker for the target date.
4. THE Journey_Canvas SHALL render Wait_Nodes with a visual label showing the configured wait duration or condition (e.g., "Wait 3 days", "Until event: Purchase Made").

### Requirement 9: Branch Node Configuration

**User Story:** As a prototype user, I want to configure branch nodes to split the journey based on conditions, so that I can create personalised paths for different contact segments.

#### Acceptance Criteria

1. WHEN an "If/Else" Branch_Node is selected, THE Inspector_Panel SHALL display the Filter_Builder component for defining the branch condition.
2. THE "If/Else" Branch_Node SHALL render two output handles on the canvas labelled "Yes" and "No".
3. WHEN an "A/B Split" Branch_Node is selected, THE Inspector_Panel SHALL display percentage inputs for each variant (defaulting to 50/50).
4. THE "A/B Split" Branch_Node SHALL render two output handles labelled "Variant A" and "Variant B" with their configured percentages.
5. WHEN a "Multi-way Split" Branch_Node is selected, THE Inspector_Panel SHALL display a list of conditions (each using the Filter_Builder) with an "Add Path" button and a default "Everyone Else" path.
6. THE "Multi-way Split" Branch_Node SHALL render one output handle per condition path plus one for "Everyone Else".

### Requirement 10: End and Join Nodes

**User Story:** As a prototype user, I want to terminate or merge journey paths, so that I can control where contacts exit or reconverge.

#### Acceptance Criteria

1. WHEN an "Exit Journey" End_Node is selected, THE Inspector_Panel SHALL display a label field and an optional reason dropdown (completed, unsubscribed, goal met).
2. WHEN a "Move to Journey" End_Node is selected, THE Inspector_Panel SHALL display a journey picker dropdown listing other journeys from the sample data.
3. THE Join_Node SHALL accept multiple incoming Connectors and produce a single outgoing Connector.
4. WHEN a Join_Node is selected, THE Inspector_Panel SHALL display a label indicating the number of incoming paths.

### Requirement 11: Content Modal Triggers

**User Story:** As a prototype user, I want action nodes to open content builders as modal overlays, so that I can create emails, forms, and surveys without losing my canvas context.

#### Acceptance Criteria

1. WHEN the user clicks "Edit Email" on a Send Email Action_Node, THE Journey_Canvas SHALL open a full-screen Content_Modal overlay for the email builder.
2. WHEN the user clicks "Add Form" on a relevant Action_Node, THE Journey_Canvas SHALL open a Content_Modal overlay for the form builder.
3. WHEN the user clicks "Add Survey" on a relevant Action_Node, THE Journey_Canvas SHALL open a Content_Modal overlay for the survey builder.
4. WHILE a Content_Modal is open, THE Journey_Canvas SHALL remain visible behind the modal overlay at reduced opacity.
5. WHEN the user closes a Content_Modal, THE Journey_Canvas SHALL restore full interactivity and update the Action_Node's content reference.

### Requirement 12: Journey Settings

**User Story:** As a prototype user, I want to configure journey-level settings like name, description, and entry rules, so that I can define the journey's metadata and behaviour.

#### Acceptance Criteria

1. THE Journey_Canvas SHALL display a settings button (gear icon) in the canvas toolbar.
2. WHEN the user clicks the settings button, THE Inspector_Panel SHALL display the Journey_Settings form with fields for name, description, and journey type.
3. THE Journey_Settings form SHALL include an entry criteria section with a segment picker and a re-entry rule selector (allow re-entry, block re-entry, re-enter after delay).
4. THE Journey_Settings form SHALL include a status selector allowing transitions between draft, active, paused, and archived.
5. WHEN the user changes the journey status, THE Journey_Canvas SHALL update the status badge displayed in the canvas header.

### Requirement 13: Canvas Validation

**User Story:** As a prototype user, I want the canvas to highlight configuration errors, so that I can identify and fix problems before activating a journey.

#### Acceptance Criteria

1. THE Journey_Canvas SHALL run client-side validation when the user clicks a "Validate" button in the toolbar.
2. WHEN validation finds a node with missing required configuration, THE Journey_Canvas SHALL display a Validation_Indicator (red border and warning icon) on that node.
3. WHEN validation finds a node with no outgoing Connector (except End_Nodes), THE Journey_Canvas SHALL display a Validation_Indicator on that node.
4. WHEN validation finds a disconnected node (no incoming or outgoing Connectors), THE Journey_Canvas SHALL display a Validation_Indicator on that node.
5. THE Journey_Canvas SHALL display a validation summary panel listing all errors with clickable links that select and pan to the offending node.
6. IF validation finds zero errors, THEN THE Journey_Canvas SHALL display a success indicator confirming the journey is valid.

### Requirement 14: Node Visual Design

**User Story:** As a prototype user, I want nodes to be visually distinct by type and clearly show their configured state, so that I can scan the canvas and understand the journey at a glance.

#### Acceptance Criteria

1. THE Journey_Canvas SHALL render each node type with a distinct colour accent: teal for triggers, blue for actions, amber for waits, purple for branches, zinc-400 for ends, and zinc-300 for joins.
2. THE Journey_Canvas SHALL render each node with an icon representing its specific sub-type (e.g., envelope for Send Email, clock for Time Delay, git-branch icon for If/Else).
3. THE Journey_Canvas SHALL display a summary label on each node showing its key configuration (e.g., "Send: Welcome Email", "Wait 3 days", "If: Gold Members").
4. WHEN a node has incomplete configuration, THE Journey_Canvas SHALL render it with a dashed border to indicate it needs attention.
5. THE Journey_Canvas SHALL use the prototype's design tokens (4px border radius, shadow-sm, Inter font) for all node rendering.

### Requirement 15: Sample Journey Data

**User Story:** As a prototype user, I want pre-built sample journeys loaded on the canvas, so that I can immediately explore the builder without starting from scratch.

#### Acceptance Criteria

1. THE prototype SHALL include a "Welcome Journey" Sample_Journey with nodes: Segment Entry trigger → Send Welcome Email → Wait 2 days → If/Else branch (opened email?) → Send Follow-up Email (yes path) → Wait 5 days → Send Offer Email → Exit Journey.
2. THE prototype SHALL include a "Re-engagement Journey" Sample_Journey with nodes: Segment Entry trigger (inactive 90+ days) → Send We Miss You Email → Wait 7 days → If/Else branch (clicked link?) → Send Discount Offer (yes path) → Exit Journey (no path).
3. THE prototype SHALL include a "Post-Purchase Follow-up" Sample_Journey with nodes: Event trigger (Purchase Made) → Wait 1 day → Send Thank You Email → Wait 14 days → Send Review Request → A/B Split → Send Upsell Email (A) / Send Survey (B) → Exit Journey.
4. THE Sample_Journeys SHALL use node positions and connector layouts that produce a readable top-to-bottom flow on the Journey_Canvas.
5. THE Sample_Journeys SHALL reference existing sample data (segments, campaigns) from the prototype's seed data.

### Requirement 16: Keyboard and Interaction Shortcuts

**User Story:** As a prototype user, I want keyboard shortcuts for common canvas actions, so that I can work efficiently when building journeys.

#### Acceptance Criteria

1. WHEN the user presses Delete or Backspace with a node selected, THE Journey_Canvas SHALL delete the selected node (with auto-heal).
2. WHEN the user presses Escape, THE Journey_Canvas SHALL deselect the current node and close the Inspector_Panel.
3. WHEN the user presses Ctrl+Z (or Cmd+Z on macOS), THE Journey_Canvas SHALL undo the last canvas action (node add, delete, move, or connect).
4. WHEN the user presses Ctrl+Shift+Z (or Cmd+Shift+Z on macOS), THE Journey_Canvas SHALL redo the last undone action.

### Requirement 17: Journey Data Model

**User Story:** As a prototype developer, I want well-defined TypeScript interfaces for journeys, nodes, and connectors, so that the canvas state can be managed and persisted in local state.

#### Acceptance Criteria

1. THE Journey data model SHALL extend the existing Journey interface with a `nodes` array of JourneyNode objects and an `edges` array of JourneyEdge objects.
2. THE JourneyNode type SHALL include: id (string), type (trigger | action | wait | branch | end | join), subType (string identifying the specific variant), position (x, y coordinates), label (string), and a configuration object specific to the node sub-type.
3. THE JourneyEdge type SHALL include: id (string), sourceNodeId (string), targetNodeId (string), sourceHandle (string for branch outputs), and an optional label (string).
4. THE Journey data model SHALL include a JourneySettings type with: name, description, journeyType, entryCriteria (segment reference), reEntryRule (allow | block | delay), and status.
5. THE node configuration types SHALL be defined as a discriminated union keyed by sub-type, covering all trigger, action, wait, branch, and end variants.
