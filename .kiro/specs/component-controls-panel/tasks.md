# Implementation Plan: Component Controls Panel

## Overview

This plan implements the Controls Panel feature for the Component Library page. It extends the component registry with prop definitions, creates a custom hook for managing control state, builds the ControlsPanel component with 7 control sub-components, and wires everything into the existing ComponentDemoView. Tasks are sequenced so each step builds on the previous — no orphaned code.

## Tasks

- [x] 1. Extend ComponentEntry interface and define types
  - [x] 1.1 Add ControlType, PropOption, PropDefinition, UsedInLink types and extend ComponentEntry in `src/data/componentRegistry.ts`
    - Add `ControlType` union type with all 7 values
    - Add `PropOption` interface with `label` and `value` strings
    - Add `PropDefinition` interface with `name`, `label`, `controlType`, `defaultValue`, and optional `options`, `min`, `max`, `step`
    - Add `UsedInLink` interface with `label` and `route`
    - Add optional `propControls?: PropDefinition[]` and `usedIn?: UsedInLink[]` to `ComponentEntry`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.1_

- [x] 2. Create useControlValues hook
  - [x] 2.1 Implement `useControlValues` hook at `src/lib/useControlValues.ts`
    - Accept `PropDefinition[]` parameter
    - Initialise state from `defaultValue` entries
    - Expose `values` record, `setValue` function, `resetAll` function, and `isDirty` boolean
    - Re-initialise when `propControls` reference changes (component navigation)
    - Return empty values record when given empty array
    - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3_

  - [x] 2.2 Write property test: Initial state matches defaults (Property 5)
    - **Property 5: Initial state matches defaults**
    - Generate arbitrary arrays of PropDefinitions with fast-check
    - Assert that hook initialises `values` mapping each `name` to its `defaultValue`
    - **Validates: Requirements 3.3**

  - [x] 2.3 Write property test: Reset restores all values to defaults (Property 6)
    - **Property 6: Reset restores all values to defaults**
    - Generate arbitrary PropDefinitions and modified state
    - Assert that `resetAll` produces state where every value equals its `defaultValue`
    - **Validates: Requirements 4.2**

  - [x] 2.4 Write property test: isDirty tracks state divergence (Property 7)
    - **Property 7: Reset visibility tracks state divergence from defaults**
    - Generate arbitrary PropDefinitions and value combinations
    - Assert `isDirty` is `true` iff at least one value differs from its default
    - **Validates: Requirements 4.1, 4.3**

- [x] 3. Checkpoint - Ensure hook tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Create control sub-components
  - [x] 4.1 Create `TextControl` component at `src/components/component-library/controls/TextControl.tsx`
    - Render a text `<Input>` from shadcn/ui with label and current value display
    - Accept `value`, `onChange`, `label` props
    - _Requirements: 2.3_

  - [x] 4.2 Create `SelectControl` component at `src/components/component-library/controls/SelectControl.tsx`
    - Render a `<Select>` from shadcn/ui with options from PropDefinition
    - Accept `value`, `onChange`, `label`, `options` props
    - _Requirements: 2.4_

  - [x] 4.3 Create `ToggleControl` component at `src/components/component-library/controls/ToggleControl.tsx`
    - Render a `<Switch>` from shadcn/ui with label
    - Accept `value` (boolean), `onChange`, `label` props
    - _Requirements: 2.5_

  - [x] 4.4 Create `ColourControl` component at `src/components/component-library/controls/ColourControl.tsx`
    - Render a native `<input type="color">` with label and hex value display
    - Accept `value`, `onChange`, `label` props
    - _Requirements: 2.6_

  - [x] 4.5 Create `NumberControl` component at `src/components/component-library/controls/NumberControl.tsx`
    - Render an `<Input type="number">` with min, max, step constraints
    - Accept `value`, `onChange`, `label`, `min`, `max`, `step` props
    - _Requirements: 2.7_

  - [x] 4.6 Create `RangeControl` component at `src/components/component-library/controls/RangeControl.tsx`
    - Render a `<Slider>` from shadcn/ui with min, max, step constraints and value display
    - Accept `value`, `onChange`, `label`, `min`, `max`, `step` props
    - _Requirements: 2.8_

  - [x] 4.7 Create `RadioControl` component at `src/components/component-library/controls/RadioControl.tsx`
    - Render a `<RadioGroup>` from shadcn/ui with options from PropDefinition
    - Accept `value`, `onChange`, `label`, `options` props
    - _Requirements: 2.9_

  - [x] 4.8 Write unit tests for each control sub-component
    - Test that each control type renders the correct input element
    - Test that value changes call onChange with correct value
    - Test that labels render correctly
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

- [x] 5. Create ControlsPanel component
  - [x] 5.1 Implement `ControlsPanel` at `src/components/component-library/ControlsPanel.tsx`
    - Accept `propControls`, `values`, `onChange`, `onReset`, `isDirty`, `usedIn` props
    - Render one control sub-component per PropDefinition, delegating by `controlType`
    - Render "Reset" button visible only when `isDirty` is true
    - Render "View in context" section with navigation links when `usedIn` is provided
    - Visually separate from preview with border/background, independently scrollable
    - Use `cn()` for conditional styling, Tailwind utilities for layout
    - _Requirements: 2.1, 2.2, 2.10, 3.4, 4.1, 4.2, 4.3, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3_

  - [x] 5.2 Write property test: Control count matches definitions (Property 3)
    - **Property 3: Control count matches definitions**
    - Generate arbitrary arrays of PropDefinitions
    - Render ControlsPanel and assert number of interactive controls equals array length
    - **Validates: Requirements 2.2**

  - [x] 5.3 Write property test: PropDefinition schema completeness (Property 1)
    - **Property 1: PropDefinition schema completeness**
    - Generate arbitrary PropDefinition objects
    - Assert each has non-empty `name`, non-empty `label`, valid `controlType`, and defined `defaultValue`
    - **Validates: Requirements 1.2**

  - [x] 5.4 Write property test: Select and radio controls require options (Property 2)
    - **Property 2: Select and radio controls require options**
    - Generate PropDefinitions with `controlType` of `select` or `radio`
    - Assert `options` array is present with at least one entry where both label and value are non-empty
    - **Validates: Requirements 1.4**

- [x] 6. Checkpoint - Ensure panel and control tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Wire into ComponentDemoView
  - [x] 7.1 Update `ComponentDemoView` in `src/pages/ComponentLibraryPage.tsx` to use controls
    - Import `useControlValues` hook and `ControlsPanel` component
    - Check if matched entry has `propControls`
    - If yes: initialise hook, spread `values` as props to DemoComponent, render ControlsPanel below preview
    - If no: render demo as-is (preserve current behaviour)
    - Maintain existing sidebar navigation and category structure unchanged
    - _Requirements: 2.1, 2.10, 3.1, 3.2, 3.3, 5.1, 5.2, 5.3, 7.4_

  - [x] 7.2 Write property test: All current prop values passed to component (Property 4)
    - **Property 4: All current prop values are passed to the rendered component**
    - Generate arbitrary PropDefinitions and value combinations
    - Assert the rendered component instance receives all values keyed by PropDefinition `name`
    - **Validates: Requirements 3.1, 3.2**

  - [x] 7.3 Write unit tests for ComponentDemoView integration
    - Test component without `propControls` renders no panel
    - Test component with `propControls` renders ControlsPanel
    - Test "View in context" links render when `usedIn` is provided
    - Test "View in context" section omitted when `usedIn` is absent
    - _Requirements: 2.10, 6.2, 6.4_

- [x] 8. Add example propControls to existing registry entries
  - [x] 8.1 Add `propControls` and `usedIn` definitions to 2–3 existing component entries in `src/data/componentRegistry.ts`
    - Choose components that have meaningful props to demonstrate (e.g. Button, Toggle, or similar)
    - Include a variety of control types across the examples
    - Add at least one `usedIn` entry pointing to a real page route
    - _Requirements: 1.1, 6.1, 6.2_

- [x] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The Token Manager integration (Requirement 5) is implicit — tokens inject CSS variables on `:root` and the Live Preview inherits them through normal CSS cascade. No explicit wiring code is needed.
- All components use Tailwind utilities with `cn()` for styling — no CSS Modules

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "4.1", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "4.8"] },
    { "id": 3, "tasks": ["5.1"] },
    { "id": 4, "tasks": ["5.2", "5.3", "5.4"] },
    { "id": 5, "tasks": ["7.1"] },
    { "id": 6, "tasks": ["7.2", "7.3", "8.1"] }
  ]
}
```
