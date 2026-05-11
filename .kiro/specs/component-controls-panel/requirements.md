# Requirements Document

## Introduction

The Controls Panel adds interactive prop editing to the existing Component Library page at `/admin/components`. Currently, each component demo renders in a fixed state with no way to experiment with different prop combinations. This feature introduces a per-component controls panel that reads prop definitions from the component registry and generates appropriate input controls (text fields, dropdowns, toggles, colour pickers, etc.), enabling the PO and UX designer to tweak component props and see the result live — without leaving the prototype or needing Storybook.

The Controls Panel works alongside the existing Token Manager (which handles system-wide design token changes) so that users can experiment with both individual component props AND global token values simultaneously.

## Glossary

- **Controls_Panel**: A UI panel displayed alongside a component demo that provides interactive form controls for editing the component's props in real time.
- **Component_Registry**: The existing data file (`src/data/componentRegistry.ts`) that defines all components available in the Component Library, extended with prop control definitions.
- **Prop_Definition**: A declarative schema entry in the Component Registry that describes a single component prop — its name, control type, default value, and available options.
- **Control_Type**: The kind of interactive input rendered for a prop (e.g., text, select, toggle, colour, number, range).
- **Live_Preview**: The rendered component instance that updates immediately when prop values change in the Controls Panel.
- **Token_Manager**: The existing system for editing design tokens (colours, spacing, radius, typography) that apply globally across all components.
- **Context_Link**: A navigational link from a component demo to a real page in the prototype where that component is used in context.
- **Component_Library_Page**: The existing page at `/admin/components` with sidebar navigation, category-based organisation, and individual component demos.

## Requirements

### Requirement 1: Prop Definition Schema

**User Story:** As a prototype maintainer, I want to define prop controls declaratively in the component registry, so that each component's interactive controls are data-driven and easy to maintain.

#### Acceptance Criteria

1. THE Component_Registry SHALL support an optional `propControls` array on each ComponentEntry that defines the available interactive controls for that component.
2. WHEN a Prop_Definition is declared, THE Component_Registry SHALL require a `name` (string), `label` (string), `controlType` (Control_Type), and `defaultValue` for each entry.
3. THE Component_Registry SHALL support the following Control_Type values: `text`, `select`, `toggle`, `colour`, `number`, `range`, and `radio`.
4. WHEN a Control_Type of `select` or `radio` is declared, THE Prop_Definition SHALL include an `options` array of `{ label: string, value: string }` entries.
5. WHEN a Control_Type of `range` or `number` is declared, THE Prop_Definition SHALL support optional `min`, `max`, and `step` numeric constraints.

### Requirement 2: Controls Panel Rendering

**User Story:** As a designer, I want a Controls Panel to appear alongside each component demo, so that I can see and interact with all available prop controls for that component.

#### Acceptance Criteria

1. WHEN a component with `propControls` defined is viewed in the Component Library, THE Controls_Panel SHALL render below or beside the Live_Preview area.
2. THE Controls_Panel SHALL render one interactive control for each Prop_Definition in the component's `propControls` array.
3. WHEN a Control_Type is `text`, THE Controls_Panel SHALL render a text input field.
4. WHEN a Control_Type is `select`, THE Controls_Panel SHALL render a dropdown select with the defined options.
5. WHEN a Control_Type is `toggle`, THE Controls_Panel SHALL render a switch/toggle control.
6. WHEN a Control_Type is `colour`, THE Controls_Panel SHALL render a colour picker input.
7. WHEN a Control_Type is `number`, THE Controls_Panel SHALL render a numeric input respecting min, max, and step constraints.
8. WHEN a Control_Type is `range`, THE Controls_Panel SHALL render a slider input respecting min, max, and step constraints.
9. WHEN a Control_Type is `radio`, THE Controls_Panel SHALL render a radio button group with the defined options.
10. WHEN a component has no `propControls` defined, THE Component_Library_Page SHALL render the demo without a Controls Panel (preserving current behaviour).

### Requirement 3: Live Preview Updates

**User Story:** As a designer, I want the component to re-render immediately when I change a control value, so that I can see the effect of prop changes without any manual refresh.

#### Acceptance Criteria

1. WHEN a control value changes in the Controls_Panel, THE Live_Preview SHALL re-render the component with the updated prop value within the same animation frame.
2. THE Live_Preview SHALL pass all current control values as props to the rendered component instance.
3. WHEN the Controls_Panel first renders, THE Live_Preview SHALL use the `defaultValue` from each Prop_Definition as the initial prop values.
4. THE Controls_Panel SHALL display the current value of each control alongside its label.

### Requirement 4: Reset Controls

**User Story:** As a designer, I want to reset all controls back to their defaults, so that I can quickly return to the component's baseline state after experimenting.

#### Acceptance Criteria

1. THE Controls_Panel SHALL display a "Reset" button when any control value differs from its default.
2. WHEN the "Reset" button is activated, THE Controls_Panel SHALL restore all control values to their `defaultValue` from the Prop_Definitions.
3. WHEN all controls are at their default values, THE Controls_Panel SHALL hide or disable the "Reset" button.

### Requirement 5: Token Manager Integration

**User Story:** As a designer, I want token changes and prop changes to work together, so that I can see how a component looks with different props under different design token configurations.

#### Acceptance Criteria

1. WHILE the Token_Manager has active token overrides, THE Live_Preview SHALL render the component with both the token overrides and the current Controls_Panel prop values applied simultaneously.
2. WHEN a design token is changed via the Token_Manager, THE Live_Preview SHALL reflect the token change immediately without resetting the Controls_Panel prop values.
3. WHEN a prop value is changed via the Controls_Panel, THE Live_Preview SHALL reflect the prop change immediately without resetting any active Token_Manager overrides.

### Requirement 6: View in Context Links

**User Story:** As a designer, I want to navigate from a component demo to real pages where that component is used, so that I can see how prop and token changes look in a realistic layout.

#### Acceptance Criteria

1. THE Component_Registry SHALL support an optional `usedIn` array on each ComponentEntry that lists pages where the component appears in the prototype.
2. WHEN a component has `usedIn` entries defined, THE Controls_Panel SHALL display a "View in context" section with navigational links to each listed page.
3. WHEN a Context_Link is activated, THE Component_Library_Page SHALL navigate the user to the specified page route.
4. WHEN a component has no `usedIn` entries defined, THE Controls_Panel SHALL omit the "View in context" section.

### Requirement 7: Panel Layout and Responsiveness

**User Story:** As a designer, I want the Controls Panel to be well-organised and not obscure the component preview, so that I can see both the controls and the rendered result at the same time.

#### Acceptance Criteria

1. THE Controls_Panel SHALL be visually separated from the Live_Preview area using a border or distinct background.
2. THE Controls_Panel SHALL group controls with clear labels matching the Prop_Definition `label` values.
3. THE Controls_Panel SHALL be scrollable independently when its content exceeds the available viewport height.
4. THE Component_Library_Page SHALL maintain the existing sidebar navigation and category structure without modification.
