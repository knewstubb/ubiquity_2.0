# Implementation Plan: Unified Controls Panel

## Overview

Extend the existing declarative controls system from 7 control types to 11, add section grouping, conditional visibility, array-typed state, a custom render slot, and migrate inline demo panels to the unified pipeline. All changes build incrementally on the existing `PropDefinition` → `useControlValues` → `ControlsPanel` → `DemoComponent` architecture.

## Tasks

- [x] 1. Extend type system and core interfaces
  - [x] 1.1 Extend PropDefinition and ControlType in componentRegistry.ts
    - Add `'prefix-input' | 'chip-array' | 'button-pair' | 'counter'` to the `ControlType` union
    - Add optional fields to `PropDefinition`: `section?: string`, `visibleWhen?: VisibleWhenCondition`, `prefix?: string`, `labels?: [string, string]`, `maxItems?: number`
    - Add `VisibleWhenCondition` interface with `controlName: string` and `values: (string | number | boolean)[]`
    - Widen `defaultValue` type to `string | number | boolean | string[]`
    - Add `ControlValue` type alias: `string | number | boolean | string[]`
    - Add optional `renderControls` function to `ComponentEntry` with signature `(values: Record<string, ControlValue>, setValue: (name: string, value: ControlValue) => void) => ReactNode`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 2.1, 3.1, 7.1_

- [x] 2. Update useControlValues hook for array state and visibility
  - [x] 2.1 Extend useControlValues to support ControlValue (including string[])
    - Widen the `UseControlValuesReturn` interface to use `Record<string, ControlValue>`
    - Update `buildDefaults` to handle `string[]` default values
    - Update `isDirty` computation to use deep equality (element-by-element) for array values
    - Handle empty/undefined propControls returning `{ values: {}, isDirty: false }`
    - _Requirements: 4.1, 4.4, 4.7, 4.8_

  - [x] 2.2 Add visibility filtering logic to useControlValues
    - Implement `isVisible(ctrl, values, propControls)` helper that evaluates `visibleWhen` conditions
    - Filter exposed `values` record to exclude hidden controls' values
    - Reset a control's value to `defaultValue` when it transitions from hidden → visible
    - Treat controls referencing non-existent `controlName` as permanently visible
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 4.2_

  - [x] 2.3 Write property tests for useControlValues (Properties 5–9)
    - **Property 5: Hidden-to-visible transition resets value to default**
    - **Property 6: Initialisation produces correct defaults record**
    - **Property 7: Reset is a round-trip to defaults**
    - **Property 8: isDirty correctly reflects value divergence**
    - **Property 9: Navigation re-initialises state from new definitions**
    - **Validates: Requirements 3.4, 4.1, 4.3, 4.4, 4.6, 4.7, 4.8**

- [x] 3. Build new control components
  - [x] 3.1 Create PrefixInputControl component
    - Create `src/components/component-library/controls/PrefixInputControl.tsx`
    - Render a text input with a non-editable prefix label inside the input (grey background zone on left, border-r separator)
    - Use `<Input>` from `@/components/ui/input` with custom prefix slot
    - Props: `value: string`, `onChange: (v: string) => void`, `label: string`, `prefix: string`
    - _Requirements: 1.2_

  - [x] 3.2 Create ChipArrayControl component
    - Create `src/components/component-library/controls/ChipArrayControl.tsx`
    - Render current values as dismissible chips (using existing Chip component or inline chip styling)
    - Include a text input + add button that appends entered text as a new chip
    - Disable add button when array length reaches `maxItems`
    - Props: `value: string[]`, `onChange: (v: string[]) => void`, `label: string`, `maxItems: number`
    - _Requirements: 1.3, 1.8_

  - [x] 3.3 Create ButtonPairControl component
    - Create `src/components/component-library/controls/ButtonPairControl.tsx`
    - Render two buttons with labels from `labels` tuple (first decrements, second increments)
    - Support numeric mode (respects min/max/step) and options mode (cycles through options array)
    - Disable corresponding button at min/max bounds
    - Props: `value: number | string`, `onChange`, `label`, `labels: [string, string]`, `min?`, `max?`, `step?`, `options?`
    - _Requirements: 1.4, 1.9_

  - [x] 3.4 Create CounterControl component
    - Create `src/components/component-library/controls/CounterControl.tsx`
    - Render −/value/+ row where buttons adjust value by configured step
    - Disable minus at min, plus at max
    - Props: `value: number`, `onChange: (v: number) => void`, `label: string`, `min: number`, `max: number`, `step: number`
    - _Requirements: 1.5, 1.7, 1.9_

  - [x] 3.5 Write property tests for bounded controls (Properties 1–2)
    - **Property 1: Bounded numeric controls never exceed configured range**
    - **Property 2: Chip-array never exceeds maxItems**
    - **Validates: Requirements 1.4, 1.5, 1.8, 1.9**

- [x] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Update ControlsPanel with section grouping, conditional visibility, and render slot
  - [x] 5.1 Implement section grouping in ControlsPanel
    - Implement `groupBySection(propControls)` algorithm: ungrouped first (declaration order), then sectioned groups in first-occurrence order
    - Render section headers using uppercase pattern: `text-xs font-semibold text-muted-foreground uppercase tracking-wide`
    - Apply `space-y-4` between sections, `space-y-2` within sections
    - Truncate section strings exceeding 40 characters
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 5.2 Add conditional visibility rendering to ControlsPanel
    - Evaluate `visibleWhen` for each control against current values
    - Hide controls (remove from layout) when condition not met
    - Show controls when referenced value matches
    - Treat controls with non-existent `controlName` reference as permanently visible
    - _Requirements: 3.2, 3.3, 3.6_

  - [x] 5.3 Add renderControls slot and dynamic width to ControlsPanel
    - Accept `renderControls` prop, render its output after declarative controls
    - Wrap custom slot in container with `space-y-4` spacing rhythm
    - Handle null/undefined return from renderControls (render nothing)
    - Implement dynamic width: `w-64` when text/prefix-input present, `w-56` otherwise
    - Wire new control types (prefix-input, chip-array, button-pair, counter) into the switch statement
    - _Requirements: 5.5, 5.6, 5.7, 7.2, 7.3, 7.4, 7.5_

  - [x] 5.4 Write property test for section grouping (Property 3)
    - **Property 3: Section grouping preserves order and merges correctly**
    - **Validates: Requirements 2.2, 2.4, 2.5**

  - [x] 5.5 Write property test for visibility evaluation (Property 4)
    - **Property 4: Visibility evaluation matches condition semantics**
    - **Validates: Requirements 3.2, 3.3, 3.5, 3.6**

- [x] 6. Update ComponentDemoView to pass renderControls
  - [x] 6.1 Wire renderControls through ComponentDemoView
    - Pass `entry.renderControls` to `ControlsPanel` when present
    - Ensure the panel receives the full values record and setValue function
    - Verify layout: preview frame `flex-1 min-w-0`, panel `shrink-0`, parent `flex gap-4 items-stretch`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 7.2, 7.5_

- [x] 7. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Migrate inline demos to declarative system
  - [x] 8.1 Migrate ChipDemo to declarative propControls
    - Add `propControls` to the Chip registry entry: variant (select), size (select), show-icon (toggle), selectable (toggle), disabled (toggle)
    - Refactor `ChipDemo.tsx` to accept props from the controls panel and retain only preview rendering logic (chip list, dismiss handling, selection state)
    - Remove inline panel layout markup and local useState for control values
    - _Requirements: 6.1, 6.6_

  - [x] 8.2 Migrate InputDemo to declarative propControls with conditional visibility
    - Add `propControls` to the Input registry entry: placeholder (text), size (select), prefix (text), suffix (text), leading-icon (toggle), trailing-icon (toggle), chips (toggle), disabled (toggle), read-only (toggle), validation-state (select), validation-message (text with `visibleWhen: { controlName: 'validation-state', values: ['error', 'success'] }`)
    - Refactor `InputDemo.tsx` to accept props from controls panel, retain only preview rendering
    - _Requirements: 6.2, 6.6_

  - [x] 8.3 Migrate StepperDemo to declarative propControls with renderControls
    - Add `propControls` to the Stepper registry entry: orientation (select), max-width (range), descriptions (toggle)
    - Add `renderControls` function for step-navigation (button-pair) and label editors (indexed text inputs per step)
    - Refactor `StepperDemo.tsx` to accept props, retain only preview rendering and step click handling
    - _Requirements: 6.3, 6.6, 6.7_

  - [x] 8.4 Migrate SegmentedControlDemo to declarative propControls with renderControls
    - Add `propControls` to the SegmentedControl registry entry: option-count (range), fit-to-text (toggle), max-width (range)
    - Add `renderControls` function for label editors (indexed text inputs, one per option up to 5)
    - Refactor `SegmentedControlDemo.tsx` to accept props, retain only preview rendering and option selection
    - _Requirements: 6.4, 6.6, 6.7_

  - [x] 8.5 Migrate NumberStepperDemo to declarative propControls with renderControls
    - Add `propControls` to the NumberStepper registry entry: size (select), disabled (toggle)
    - Add `renderControls` function for bounds (prefixed numeric inputs for min, max, step)
    - Refactor `NumberStepperDemo.tsx` to accept props, retain only preview rendering
    - _Requirements: 6.5, 6.6, 6.7_

- [x] 9. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The `renderControls` escape hatch is used for Stepper, SegmentedControl, and NumberStepper demos where indexed label editors cannot be expressed declaratively
- All new control components follow the existing pattern in `src/components/component-library/controls/` (use shadcn/ui primitives, Tailwind styling, `cn()` utility)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "3.1", "3.2", "3.3", "3.4"] },
    { "id": 2, "tasks": ["2.2", "3.5"] },
    { "id": 3, "tasks": ["2.3", "5.1"] },
    { "id": 4, "tasks": ["5.2", "5.3"] },
    { "id": 5, "tasks": ["5.4", "5.5", "6.1"] },
    { "id": 6, "tasks": ["8.1", "8.2"] },
    { "id": 7, "tasks": ["8.3", "8.4", "8.5"] }
  ]
}
```
