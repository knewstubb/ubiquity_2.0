# Requirements Document

## Introduction

The component library currently has two parallel approaches for rendering interactive controls alongside component demos: a declarative registry-based system (`propControls` on `ComponentEntry`) and imperative inline panels where each demo builds its own controls in JSX. This feature unifies both into a single declarative system that handles simple prop toggling (variant, size, disabled) as well as complex state (arrays, grouped prefix-label inputs, conditional controls, chip lists, button pairs). The unified system eliminates the need for demos to build their own panel layout while following the controller-panel-pattern steering doc.

## Glossary

- **Controls_Panel**: The sidebar panel rendered alongside a component preview that contains interactive controls for manipulating the demo component's state.
- **Control_Definition**: A declarative object describing a single control — its type, label, default value, and any type-specific configuration (options, bounds, visibility conditions).
- **Control_Type**: The kind of UI control rendered in the panel (text, select, toggle, colour, number, range, radio, prefix-input, chip-array, button-pair, counter).
- **Component_Registry**: The central array in `src/data/componentRegistry.ts` that defines all component entries and their associated control definitions.
- **Demo_Component**: The React component rendered in the preview frame that receives prop values from the controls panel.
- **Control_Section**: A named group of related controls within the panel, rendered under a shared section header.
- **Conditional_Control**: A control whose visibility depends on the current value of another control in the same panel.
- **Prefix_Input**: A text input with a grey background prefix label inside the input field, used for grouped fields like Prefix/Suffix.
- **Chip_Array_Control**: A control that manages an ordered list of string values, rendered as dismissible chips with an add mechanism.
- **Button_Pair_Control**: A pair of action buttons (e.g. Back/Next) that modify a numeric or enum value in the panel state.
- **Counter_Control**: A compact −/value/+ control for small integer values with tight bounds.
- **useControlValues_Hook**: The custom React hook that manages control state, initialisation, reset, and dirty tracking.

## Requirements

### Requirement 1: Extended Control Type System

**User Story:** As a component library maintainer, I want a comprehensive set of declarative control types, so that I can describe any demo panel without writing custom JSX.

#### Acceptance Criteria

1. THE Control_Definition SHALL support the following control types: text, select, toggle, colour, number, range, radio, prefix-input, chip-array, button-pair, counter.
2. WHEN a Control_Definition has controlType "prefix-input", THE Controls_Panel SHALL render a text input with a non-editable prefix label (sourced from a required `prefix` string property on the Prop_Definition) displayed inside the input field with a visually distinct background and a border separating it from the editable area.
3. WHEN a Control_Definition has controlType "chip-array", THE Controls_Panel SHALL render the current values as dismissible chips and a text input field with an add button that appends the entered text as a new chip when activated.
4. WHEN a Control_Definition has controlType "button-pair", THE Controls_Panel SHALL render two buttons with labels sourced from a required `labels` tuple property on the Prop_Definition, where the first button decrements and the second button increments a numeric value (respecting min and max bounds) or cycles backward and forward through a provided options array.
5. WHEN a Control_Definition has controlType "counter", THE Controls_Panel SHALL render a −/value/+ row where the minus and plus buttons adjust the value by the configured step, and the buttons are disabled when the value reaches the configured min or max respectively.
6. THE Control_Definition for "select" and "radio" types SHALL require an options array with at least one entry containing non-empty label and value strings.
7. THE Control_Definition for "range", "number", and "counter" types SHALL require min, max, and step numeric configuration.
8. WHEN a Control_Definition has controlType "chip-array", THE Prop_Definition SHALL store its defaultValue as an array of strings, and the Controls_Panel SHALL limit the total number of chips to a configured maximum count specified via a required `maxItems` numeric property on the Prop_Definition.
9. IF a "button-pair" or "counter" control value has reached its configured min or max bound, THEN THE Controls_Panel SHALL disable the corresponding decrement or increment button to prevent out-of-range values.

### Requirement 2: Section Grouping

**User Story:** As a component library maintainer, I want to group related controls under section headers, so that complex panels remain scannable and organised.

#### Acceptance Criteria

1. THE Control_Definition SHALL accept an optional `section` property (string, maximum 40 characters) that assigns the control to a named group.
2. WHEN multiple Control_Definitions share the same section value (case-sensitive match), THE Controls_Panel SHALL render them together under a single section header, preserving their relative declaration order within the group.
3. THE Controls_Panel SHALL render section headers using the uppercase pattern defined in the controller-panel-pattern steering doc (text-xs font-semibold text-muted-foreground uppercase tracking-wide).
4. WHEN a Control_Definition has no section property, THE Controls_Panel SHALL render the control in an ungrouped area above all sectioned groups, preserving declaration order among ungrouped controls.
5. THE Controls_Panel SHALL determine section order by the position of each section's first occurrence in the Control_Definition array, and SHALL merge all controls sharing the same section value into that single group regardless of their position in the array.
6. THE Controls_Panel SHALL separate adjacent sections using the inter-section spacing defined in the controller-panel-pattern steering doc (space-y-4).

### Requirement 3: Conditional Visibility

**User Story:** As a component library maintainer, I want controls to show or hide based on the value of another control, so that the panel only displays relevant options.

#### Acceptance Criteria

1. THE Control_Definition SHALL accept an optional visibleWhen property containing an object with a `controlName` string referencing another control's name and a `values` array of one or more acceptable values (string, number, or boolean) that make this control visible.
2. WHEN a Control_Definition has a visibleWhen condition, THE Controls_Panel SHALL hide the control (removing it from the rendered panel layout) when the referenced control's current value is not included in the visibleWhen `values` array.
3. WHEN the referenced control's value changes to a value included in the visibleWhen `values` array, THE Controls_Panel SHALL show the previously hidden control without page reload.
4. WHEN a hidden control becomes visible, THE useControlValues_Hook SHALL set the control's value to its defaultValue, regardless of any value it held before being hidden.
5. WHEN a visible control becomes hidden, THE useControlValues_Hook SHALL exclude that control's value from the props passed to the Demo_Component.
6. IF a visibleWhen property references a controlName that does not exist in the current component's Control_Definition array, THEN THE Controls_Panel SHALL treat the control as permanently visible.

### Requirement 4: State Management

**User Story:** As a component library user, I want control values to initialise from defaults, reset cleanly, and track dirty state, so that I can experiment freely and return to baseline.

#### Acceptance Criteria

1. THE useControlValues_Hook SHALL initialise all control values from their Control_Definition defaultValue properties, producing a values record with one entry per Control_Definition keyed by its name.
2. WHEN the user modifies any control value, THE useControlValues_Hook SHALL update the corresponding value in state and pass the complete updated values record to the Demo_Component on the next render.
3. WHEN the user activates the reset action, THE useControlValues_Hook SHALL restore all values to their Control_Definition defaults such that isDirty becomes false.
4. THE useControlValues_Hook SHALL expose an isDirty flag that is true when at least one value differs from its default, using strict equality for primitive values and deep equality (element-by-element comparison) for array-typed values.
5. WHILE isDirty is true, THE Controls_Panel SHALL display a Reset button in the panel header; WHILE isDirty is false, THE Controls_Panel SHALL hide the Reset button.
6. WHEN the user navigates to a different component demo (the propControls reference changes), THE useControlValues_Hook SHALL re-initialise state from the new component's Control_Definitions and set isDirty to false.
7. IF the propControls array is empty or undefined, THEN THE useControlValues_Hook SHALL return an empty values record and isDirty as false.
8. THE useControlValues_Hook SHALL support array-typed default values for chip-array controls by storing, updating, and comparing array values using deep equality.

### Requirement 5: Unified Rendering Pipeline

**User Story:** As a component library maintainer, I want a single rendering path for all demos, so that I can remove inline panel code from individual demo files.

#### Acceptance Criteria

1. WHEN a Component_Registry entry has a propControls array, THE ComponentDemoView SHALL render the Controls_Panel to the right of the preview frame in a horizontal flex container with a 16px gap (flex gap-4 items-stretch), where the preview frame occupies remaining space (flex-1 min-w-0) and the Controls_Panel is fixed-width (shrink-0).
2. THE Controls_Panel SHALL initialise each control to the defaultValue specified in the corresponding PropDefinition and pass all current control values as props to the Demo_Component on every render.
3. WHEN a user changes a control value in the Controls_Panel, THE Controls_Panel SHALL update the corresponding prop passed to the Demo_Component within the same render cycle so the preview reflects the new value immediately.
4. WHEN a Component_Registry entry has no propControls array, THE ComponentDemoView SHALL render the Demo_Component without a Controls_Panel.
5. THE Controls_Panel SHALL render each control using the matching component from src/components/ui/ based on controlType: toggle maps to Switch, select maps to Select, text maps to Input, range maps to Slider, radio maps to RadioGroup, colour maps to a colour input, and number maps to Input with type number.
6. IF the propControls array contains at least one entry with controlType "text", THEN THE Controls_Panel SHALL use a width of w-64 (256px); otherwise THE Controls_Panel SHALL use a width of w-56 (224px).
7. THE Controls_Panel SHALL apply the container styling bg-secondary rounded-lg p-4 and render all controls in a single-column vertical stack with space-y-4 between sections.

### Requirement 6: Migration of Inline Demos

**User Story:** As a component library maintainer, I want to migrate existing inline panel demos to the declarative system, so that all demos use a consistent approach.

#### Acceptance Criteria

1. WHEN the Chip demo is migrated, THE Component_Registry entry SHALL declare propControls with control definitions for variant (select with options: default, outline, mint, red), size (select with options: sm, default), show-icon (toggle), selectable (toggle), and disabled (toggle).
2. WHEN the Input demo is migrated, THE Component_Registry entry SHALL declare propControls with control definitions for placeholder (text), size (select with options: sm, default, lg), prefix (text), suffix (text), leading-icon (toggle), trailing-icon (toggle), chips (toggle), disabled (toggle), read-only (toggle), validation-state (select with options: none, error, success), and validation-message (text), where validation-message is only visible when validation-state is not "none".
3. WHEN the Stepper demo is migrated, THE Component_Registry entry SHALL declare propControls with control definitions for orientation (select with options: horizontal, vertical), max-width (range, min 10, max 100, step 5), and descriptions (toggle), plus custom panel controls for step-navigation (button-pair rendering Back/Next) and label editors (indexed text inputs per step).
4. WHEN the SegmentedControl demo is migrated, THE Component_Registry entry SHALL declare propControls with control definitions for option-count (range, min 2, max 5, step 1), fit-to-text (toggle), and max-width (range, min 30, max 100, step 5), plus custom panel controls for label editors (indexed text inputs, one per option up to 5).
5. WHEN the NumberStepper demo is migrated, THE Component_Registry entry SHALL declare propControls with control definitions for size (select with options: default, sm) and disabled (toggle), plus custom panel controls for bounds (prefixed numeric inputs for min, max, and step).
6. AFTER migration, THE migrated Demo_Component files SHALL contain only preview rendering logic and preview interaction state (such as chip dismissal, step click handling, or option selection) — no inline panel layout markup and no local useState for control values that are declared in propControls.
7. IF a migrated demo requires a control pattern not supported by the existing ControlType union, THEN THE Demo_Component file SHALL implement that control via the renderControls escape hatch until the ControlType system is extended to support it.

### Requirement 7: Custom Render Slots

**User Story:** As a component library maintainer, I want an escape hatch for truly unique controls that cannot be expressed declaratively, so that the system remains extensible without blocking edge cases.

#### Acceptance Criteria

1. THE Component_Registry entry SHALL accept an optional renderControls function with the signature `(values: Record<string, string | number | boolean | string[]>, setValue: (name: string, value: string | number | boolean | string[]) => void) => ReactNode`.
2. WHEN a Component_Registry entry provides a renderControls function, THE Controls_Panel SHALL render the function's returned ReactNode within the standard panel container, positioned after any declarative controls defined in propControls.
3. THE Controls_Panel SHALL wrap the renderControls output in a container that applies the panel's spacing rhythm (space-y-4 between sections) so that custom content aligns with declarative controls without the function needing to replicate panel layout styles.
4. IF the renderControls function returns null or undefined, THEN THE Controls_Panel SHALL render nothing for the custom slot and display only the declarative controls.
5. WHEN a Component_Registry entry provides both a propControls array and a renderControls function, THE Controls_Panel SHALL render the declarative controls first followed by the custom render slot output.

### Requirement 8: Used-In Links

**User Story:** As a component library user, I want to see where a component is used in the prototype, so that I can navigate to real usage examples.

#### Acceptance Criteria

1. WHEN a Component_Registry entry has a usedIn array containing one or more UsedInLink entries, THE Controls_Panel SHALL render a "Used in" section at the bottom of the panel displaying one navigation link per entry, where each link shows the entry's label text and navigates to the entry's route on click.
2. THE "Used in" section SHALL be visually separated from controls using a top border (mt-3 pt-3 border-t border-border).
3. IF a Component_Registry entry has no usedIn property or has an empty usedIn array, THEN THE Controls_Panel SHALL omit the "Used in" section entirely.
4. WHEN a user clicks a "Used in" navigation link, THE Controls_Panel SHALL navigate to the corresponding route using client-side routing without a full page reload.
