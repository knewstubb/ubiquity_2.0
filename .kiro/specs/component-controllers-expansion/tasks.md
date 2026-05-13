# Implementation Plan: Component Controllers Expansion

## Overview

Add declarative `propControls` definitions to 12 component library entries and migrate 2 components (Slider, CardSelector) from inline controller panels to the declarative system. Each task adds the `propControls` array to the registry entry and refactors the corresponding demo component to accept props from the controller panel, following the established pattern (e.g. ButtonDemo).

## Tasks

- [x] 1. Add propControls for simple input components (no sections needed)
  - [x] 1.1 Add Checkbox propControls and refactor CheckboxDemo
    - Add `propControls` array to the Checkbox registry entry: label (text), checked (toggle), disabled (toggle), indeterminate (toggle)
    - Refactor `CheckboxDemo.tsx` to accept props interface `{ label?, checked?, disabled?, indeterminate? }`
    - When props are present, render single interactive checkbox driven by control values
    - When props are absent, render full showcase (existing behaviour)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 13.1, 13.2_

  - [x] 1.2 Add Label propControls and refactor LabelDemo
    - Add `propControls` array to the Label registry entry: text (text), required (toggle), disabled (toggle)
    - Refactor `LabelDemo.tsx` to accept props interface `{ text?, required?, disabled? }`
    - When props are present, render single interactive label driven by control values
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 13.1, 13.2_

  - [x] 1.3 Add InputOTP propControls and refactor InputOTPDemo
    - Add `propControls` array to the InputOTP registry entry: length (counter, min:4, max:8), showSeparator (toggle), disabled (toggle)
    - Refactor `InputOTPDemo.tsx` to accept props interface `{ length?, 'show-separator'?, disabled? }`
    - When props are present, render OTP input with the specified number of slots
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 13.1, 13.2_

  - [x] 1.4 Add Textarea propControls and refactor TextareaDemo
    - Add `propControls` array to the Textarea registry entry: placeholder (text), rows (counter, min:2, max:10), disabled (toggle), readOnly (toggle)
    - Refactor `TextareaDemo.tsx` to accept props interface `{ placeholder?, rows?, disabled?, 'read-only'? }`
    - When props are present, render single textarea driven by control values
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 13.1, 13.2_

  - [x] 1.5 Add Toggle propControls and refactor ToggleDemo
    - Add `propControls` array to the Toggle registry entry: variant (select: default/outline), size (select: default/sm/lg), pressed (toggle), disabled (toggle)
    - Refactor `ToggleDemo.tsx` to accept props interface `{ variant?, size?, pressed?, disabled? }`
    - When props are present, render single toggle button driven by control values
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 13.1, 13.2_

- [x] 2. Add propControls for components with counter-driven item counts
  - [x] 2.1 Add RadioGroup propControls and refactor RadioGroupDemo
    - Add `propControls` array to the RadioGroup registry entry: optionCount (counter, min:2, max:5), orientation (select: vertical/horizontal), disabled (toggle)
    - Refactor `RadioGroupDemo.tsx` to accept props interface `{ 'option-count'?, orientation?, disabled? }`
    - When props are present, render radio group with the specified number of options in the selected orientation
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 13.1, 13.2_

  - [x] 2.2 Add ToggleGroup propControls and refactor ToggleGroupDemo
    - Add `propControls` array to the ToggleGroup registry entry: type (select: single/multiple), variant (select: default/outline), itemCount (counter, min:2, max:6)
    - Refactor `ToggleGroupDemo.tsx` to accept props interface `{ type?, variant?, 'item-count'? }`
    - When props are present, render toggle group with the specified number of items and selection mode
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 13.1, 13.2_

  - [x] 2.3 Add Form propControls and refactor FormDemo
    - Add `propControls` array to the Form registry entry: fieldCount (counter, min:1, max:5), showDescriptions (toggle), validation (select: none/error/success)
    - Refactor `FormDemo.tsx` to accept props interface `{ 'field-count'?, 'show-descriptions'?, validation? }`
    - When props are present, render form with the specified number of fields and validation state
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 13.1, 13.2_

  - [x] 2.4 Add SplitButton propControls and refactor SplitButtonDemo
    - Add `propControls` array to the SplitButton registry entry: label (text), variant (select: default/outline), size (select: default/sm), optionCount (counter, min:1, max:4), disabled (toggle)
    - Refactor `SplitButtonDemo.tsx` to accept props interface `{ label?, variant?, size?, 'option-count'?, disabled? }`
    - When props are present, render split button with the specified options and styling
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 13.1, 13.2_

- [x] 3. Add propControls for Calendar (select controls with sections)
  - [x] 3.1 Add Calendar propControls and refactor CalendarDemo
    - Add `propControls` array to the Calendar registry entry: mode (select: single/range), captionLayout (select: label/dropdown), months (counter, min:1, max:3)
    - Refactor `CalendarDemo.tsx` to accept props interface `{ mode?, 'caption-layout'?, months? }`
    - When mode is "range", render a range-selection calendar
    - When months > 1, render multiple month grids side by side
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 13.1, 13.2_

- [x] 4. Checkpoint — Verify simple components
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Migrate Slider from inline controller to declarative propControls
  - [x] 5.1 Add Slider propControls to registry with sections and conditional visibility
    - Add `propControls` array to the Slider registry entry with sections:
      - General: rangeMode (toggle), disabled (toggle)
      - Display: showTooltip (toggle), valuePosition (select: right/above/below/hidden), showSteps (toggle), stepCount (counter, min:2, max:50, visibleWhen: showSteps=true)
      - Range: min (number), max (number)
    - _Requirements: 6.1, 6.2, 6.5, 14.6, 14.7_

  - [x] 5.2 Refactor SliderDemo to accept props from declarative system
    - Remove all inline controller panel JSX from `SliderDemo.tsx`
    - Remove local state for controls (keep only internal slider value state)
    - Add props interface: `{ 'range-mode'?, disabled?, 'show-tooltip'?, 'value-position'?, 'show-steps'?, 'step-count'?, min?, max? }`
    - Render only the slider preview, driven by incoming props
    - When props are absent, render full showcase (existing behaviour without inline panel)
    - _Requirements: 6.2, 6.3, 6.4, 13.3, 13.4_

- [x] 6. Migrate CardSelector from inline controller to declarative propControls with renderControls slot
  - [x] 6.1 Add CardSelector propControls and renderControls to registry
    - Add `propControls` array to the CardSelector registry entry: cardCount (counter, min:2, max:6), rows (counter, min:1, max:3), maxWidth (range, min:30, max:100, step:5), disabled (toggle)
    - Add `renderControls` function for per-card label/icon editing (matching existing Stepper/SegmentedControl pattern)
    - _Requirements: 11.1, 11.2_

  - [x] 6.2 Refactor CardSelectorDemo to accept props from declarative system
    - Remove all inline controller panel JSX from `CardSelectorDemo.tsx`
    - Remove local state for controls (keep only selection state)
    - Add props interface: `{ 'card-count'?, rows?, 'max-width'?, disabled? }` plus dynamic label/icon props from renderControls
    - Render only the card grid preview, driven by incoming props
    - When props are absent, render full showcase (existing behaviour without inline panel)
    - _Requirements: 11.3, 11.4, 13.3, 13.4_

- [x] 7. Checkpoint — Verify migrations
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Extend existing property tests for new components
  - [x] 8.1 Extend prop-definition-schema property test (Property 1: Schema Conformance)
    - **Property 1: PropControl Schema Conformance**
    - Extend `src/__tests__/prop-definition-schema.property.test.ts` to cover all 12 new entries
    - Verify TFC decision rules: boolean defaults → toggle, options ≥ 3 → select, counter has min/max with max−min ≤ 10, range has min/max
    - **Validates: Requirements 1.4, 2.4, 3.4, 4.4, 5.4, 7.4, 8.4, 9.4, 10.4, 12.4, 14.1–14.5**

  - [x] 8.2 Extend component-props-passed property test (Property 2: Demo Renders)
    - **Property 2: Demo Renders with Default Props**
    - Extend `src/__tests__/component-props-passed.property.test.tsx` to cover all 12 new entries
    - Verify rendering with default values does not throw and produces non-empty output
    - **Validates: Requirements 6.3, 11.3, 13.1, 13.2**

  - [x] 8.3 Extend unified-controls-panel property test (Property 5: Conditional Visibility)
    - **Property 5: Conditional Visibility**
    - Extend `src/__tests__/unified-controls-panel.property.test.ts` to cover Slider's `visibleWhen` conditions
    - Verify `isVisible` returns correct boolean based on referenced control values
    - **Validates: Requirements 6.5, 14.7**

  - [x] 8.4 Extend prop-definition-schema property test (Property 6: Section Grouping)
    - **Property 6: Section Grouping Threshold**
    - Extend `src/__tests__/prop-definition-schema.property.test.ts` to verify Slider entry (8 controls) has section groupings
    - Filter entries with 4+ controls (excluding visibleWhen), assert at least one has a section defined
    - **Validates: Requirements 14.6**

- [x] 9. Add new property tests for counter and text passthrough
  - [x] 9.1 Write property test for counter-driven item count (Property 3)
    - **Property 3: Counter-Driven Item Count**
    - Create `src/__tests__/counter-item-count.property.test.tsx`
    - For components with counter controls driving item count (RadioGroup, ToggleGroup, Form, CardSelector, SplitButton), generate random valid counts and verify DOM element count matches
    - **Validates: Requirements 5.2, 9.3, 10.2, 11.4, 12.3**

  - [x] 9.2 Write property test for text control passthrough (Property 4)
    - **Property 4: Text Control Passthrough**
    - Create `src/__tests__/text-control-passthrough.property.test.tsx`
    - For components with text controls driving visible content (Label text, Textarea placeholder), generate random non-empty strings and verify output contains the string
    - **Validates: Requirements 4.2, 7.2**

- [x] 10. Final checkpoint — Full verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- The demo component pattern follows ButtonDemo: props present → interactive single preview, props absent → full showcase
- Slider migration is the most complex (8 controls, 3 sections, conditional visibility)
- CardSelector uses the hybrid approach (propControls + renderControls) matching Stepper/SegmentedControl

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4", "1.5"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3", "2.4", "3.1"] },
    { "id": 2, "tasks": ["5.1", "6.1"] },
    { "id": 3, "tasks": ["5.2", "6.2"] },
    { "id": 4, "tasks": ["8.1", "8.3", "8.4"] },
    { "id": 5, "tasks": ["8.2", "9.1", "9.2"] }
  ]
}
```
