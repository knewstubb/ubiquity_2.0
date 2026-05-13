# Requirements Document

## Introduction

This feature adds declarative `propControls` definitions to all component library entries that currently lack them. The component library uses a controller panel system where each component's configurable properties are exposed as interactive controls (toggles, selects, sliders, counters, text inputs) in a side panel. This allows designers and developers to manipulate component props in real time without editing code.

Currently 12 components are missing propControls: Calendar, Checkbox, InputOTP, Label, RadioGroup, Slider, Textarea, Toggle, ToggleGroup, Form, CardSelector, and SplitButton. Some of these (Slider, CardSelector) have hand-built inline controller panels that need migrating to the declarative system.

## Glossary

- **Component_Registry**: The central data file (`src/data/componentRegistry.tsx`) that defines all component library entries including their `propControls` arrays.
- **PropControls**: A declarative array of `PropDefinition` objects that describe the interactive controls rendered in the controller panel for a component demo.
- **Controller_Panel**: The side panel rendered by `ControlsPanel.tsx` that displays interactive controls for manipulating a component's props.
- **Demo_Component**: A React component in `src/pages/component-demos/` that renders the live preview of a library component, accepting prop values from the controller panel.
- **Control_Type**: One of the supported control widget types: text, textarea, select, toggle, colour, number, range, prefix-input, chip-array, button-pair, counter.
- **Declarative_Controls**: PropControls defined as data in the registry, as opposed to inline JSX rendered via `renderControls`.
- **Inline_Controller**: A hand-built controller panel rendered directly inside a demo component using local state and raw JSX, bypassing the declarative system.

## Requirements

### Requirement 1: Calendar PropControls

**User Story:** As a designer, I want to configure the Calendar component's mode, caption layout, and month count via the controller panel, so that I can preview different calendar configurations without editing code.

#### Acceptance Criteria

1. WHEN the Calendar demo is viewed, THE Controller_Panel SHALL display controls for mode (single/range), caption layout (label/dropdown), and number of months (1–3).
2. WHEN the mode control is set to "range", THE Demo_Component SHALL render a range-selection calendar.
3. WHEN the number of months is changed, THE Demo_Component SHALL render the corresponding number of month grids.
4. THE Component_Registry SHALL define propControls for the Calendar entry with appropriate control types following TFC decision rules.

### Requirement 2: Checkbox PropControls

**User Story:** As a designer, I want to configure the Checkbox component's label text, checked state, disabled state, and indeterminate state via the controller panel, so that I can preview all checkbox variations.

#### Acceptance Criteria

1. WHEN the Checkbox demo is viewed, THE Controller_Panel SHALL display controls for label text, checked state, disabled state, and indeterminate state.
2. WHEN the checked toggle is changed, THE Demo_Component SHALL reflect the checked/unchecked state.
3. WHEN the disabled toggle is enabled, THE Demo_Component SHALL render the checkbox in a disabled state.
4. THE Component_Registry SHALL define propControls for the Checkbox entry using text control for label and toggle controls for boolean states.

### Requirement 3: InputOTP PropControls

**User Story:** As a designer, I want to configure the InputOTP component's length, separator visibility, and disabled state via the controller panel, so that I can preview different OTP input configurations.

#### Acceptance Criteria

1. WHEN the InputOTP demo is viewed, THE Controller_Panel SHALL display controls for code length (4–8), show separator toggle, and disabled state.
2. WHEN the code length is changed, THE Demo_Component SHALL render the corresponding number of input slots.
3. WHEN the separator toggle is disabled, THE Demo_Component SHALL render slots without a separator between groups.
4. THE Component_Registry SHALL define propControls for the InputOTP entry using counter for length and toggles for boolean states.

### Requirement 4: Label PropControls

**User Story:** As a designer, I want to configure the Label component's text, required indicator, and disabled appearance via the controller panel, so that I can preview label variations.

#### Acceptance Criteria

1. WHEN the Label demo is viewed, THE Controller_Panel SHALL display controls for label text, show required indicator toggle, and disabled state.
2. WHEN the label text is changed, THE Demo_Component SHALL update the displayed label text.
3. WHEN the required indicator toggle is enabled, THE Demo_Component SHALL display a required asterisk or indicator.
4. THE Component_Registry SHALL define propControls for the Label entry using text control for label and toggles for boolean states.

### Requirement 5: RadioGroup PropControls

**User Story:** As a designer, I want to configure the RadioGroup component's option count, orientation, and disabled state via the controller panel, so that I can preview different radio group configurations.

#### Acceptance Criteria

1. WHEN the RadioGroup demo is viewed, THE Controller_Panel SHALL display controls for option count (2–5), orientation (vertical/horizontal), and disabled state.
2. WHEN the option count is changed, THE Demo_Component SHALL render the corresponding number of radio options.
3. WHEN the orientation is changed, THE Demo_Component SHALL lay out radio items in the selected direction.
4. THE Component_Registry SHALL define propControls for the RadioGroup entry using counter for option count, select for orientation, and toggle for disabled.

### Requirement 6: Slider PropControls (Migration)

**User Story:** As a designer, I want the Slider component to use the declarative propControls system instead of its inline controller, so that the controller panel is consistent with all other components.

#### Acceptance Criteria

1. WHEN the Slider demo is viewed, THE Controller_Panel SHALL display controls for range mode, disabled state, show tooltip, value position, show steps, step count, min value, and max value.
2. THE Component_Registry SHALL define propControls for the Slider entry replacing the current inline controller panel.
3. THE Demo_Component SHALL accept prop values from the declarative controller panel and render the slider accordingly.
4. WHEN the range mode toggle is enabled, THE Demo_Component SHALL render a dual-thumb range slider.
5. WHEN show steps is enabled, THE Controller_Panel SHALL reveal the step count control using conditional visibility.

### Requirement 7: Textarea PropControls

**User Story:** As a designer, I want to configure the Textarea component's placeholder, rows, disabled state, and read-only state via the controller panel, so that I can preview different textarea configurations.

#### Acceptance Criteria

1. WHEN the Textarea demo is viewed, THE Controller_Panel SHALL display controls for placeholder text, row count, disabled state, and read-only state.
2. WHEN the placeholder text is changed, THE Demo_Component SHALL update the textarea placeholder.
3. WHEN the row count is changed, THE Demo_Component SHALL adjust the textarea height.
4. THE Component_Registry SHALL define propControls for the Textarea entry using text for placeholder, counter for rows, and toggles for boolean states.

### Requirement 8: Toggle PropControls

**User Story:** As a designer, I want to configure the Toggle component's variant, size, pressed state, and disabled state via the controller panel, so that I can preview all toggle button variations.

#### Acceptance Criteria

1. WHEN the Toggle demo is viewed, THE Controller_Panel SHALL display controls for variant (default/outline), size (default/sm/lg), pressed state, and disabled state.
2. WHEN the variant is changed, THE Demo_Component SHALL render the toggle with the selected variant styling.
3. WHEN the pressed toggle is enabled, THE Demo_Component SHALL render the toggle in its active/pressed state.
4. THE Component_Registry SHALL define propControls for the Toggle entry using select for variant and size, and toggles for boolean states.

### Requirement 9: ToggleGroup PropControls

**User Story:** As a designer, I want to configure the ToggleGroup component's type (single/multiple), variant, and item count via the controller panel, so that I can preview different toggle group configurations.

#### Acceptance Criteria

1. WHEN the ToggleGroup demo is viewed, THE Controller_Panel SHALL display controls for type (single/multiple), variant (default/outline), and item count (2–6).
2. WHEN the type is changed between single and multiple, THE Demo_Component SHALL switch between single-select and multi-select behaviour.
3. WHEN the item count is changed, THE Demo_Component SHALL render the corresponding number of toggle items.
4. THE Component_Registry SHALL define propControls for the ToggleGroup entry using select for type and variant, and counter for item count.

### Requirement 10: Form PropControls

**User Story:** As a designer, I want to configure the Form component's field count, show descriptions toggle, and validation state via the controller panel, so that I can preview different form configurations.

#### Acceptance Criteria

1. WHEN the Form demo is viewed, THE Controller_Panel SHALL display controls for field count (1–5), show descriptions toggle, and validation state (none/error/success).
2. WHEN the field count is changed, THE Demo_Component SHALL render the corresponding number of form fields.
3. WHEN the validation state is set to error, THE Demo_Component SHALL display validation error messages on fields.
4. THE Component_Registry SHALL define propControls for the Form entry using counter for field count, toggle for descriptions, and select for validation state.

### Requirement 11: CardSelector PropControls (Migration)

**User Story:** As a designer, I want the CardSelector component to use the declarative propControls system instead of its inline controller, so that the controller panel is consistent with all other components.

#### Acceptance Criteria

1. WHEN the CardSelector demo is viewed, THE Controller_Panel SHALL display controls for card count (2–6), rows (1–3), max width, and disabled state.
2. THE Component_Registry SHALL define propControls for the CardSelector entry replacing the current inline controller panel.
3. THE Demo_Component SHALL accept prop values from the declarative controller panel and render the card grid accordingly.
4. WHEN the card count is changed, THE Demo_Component SHALL render the corresponding number of selectable cards.

### Requirement 12: SplitButton PropControls

**User Story:** As a designer, I want to configure the SplitButton component's label, variant, size, and disabled state via the controller panel, so that I can preview all split button variations.

#### Acceptance Criteria

1. WHEN the SplitButton demo is viewed, THE Controller_Panel SHALL display controls for primary label text, variant (default/outline), size (default/sm), option count (1–4), and disabled state.
2. WHEN the variant is changed, THE Demo_Component SHALL render the split button with the selected variant styling.
3. WHEN the option count is changed, THE Demo_Component SHALL render the corresponding number of dropdown menu items.
4. THE Component_Registry SHALL define propControls for the SplitButton entry using text for label, selects for variant and size, counter for options, and toggle for disabled.

### Requirement 13: Demo Component Refactoring

**User Story:** As a developer, I want all demo components to accept props from the declarative controller system, so that the propControls values drive the component preview.

#### Acceptance Criteria

1. WHEN a demo component has propControls defined in the registry, THE Demo_Component SHALL accept a `props` parameter (or equivalent mechanism) containing the current control values.
2. THE Demo_Component SHALL use the control values to configure the rendered component preview.
3. IF a demo component previously used an inline controller panel, THEN THE Demo_Component SHALL be refactored to remove the inline panel and accept values from the declarative system.
4. THE Demo_Component SHALL render only the component preview without any embedded controller UI.

### Requirement 14: Consistency with Existing Patterns

**User Story:** As a developer, I want all new propControls to follow the established patterns and TFC decision rules, so that the controller panels are consistent across the entire library.

#### Acceptance Criteria

1. THE Component_Registry SHALL use toggle controls for all binary on/off properties.
2. THE Component_Registry SHALL use select controls for properties with 3 or more mutually exclusive options.
3. THE Component_Registry SHALL use counter controls for small integer properties with tight bounds.
4. THE Component_Registry SHALL use range controls for percentage or relative numeric values.
5. THE Component_Registry SHALL use text controls for editable string properties.
6. THE Component_Registry SHALL define appropriate `section` groupings when a component has 4 or more controls.
7. THE Component_Registry SHALL define `visibleWhen` conditions for controls that are only relevant when a parent control has a specific value.
