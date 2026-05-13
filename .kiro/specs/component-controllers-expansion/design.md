# Design Document: Component Controllers Expansion

## Overview

This feature adds declarative `propControls` definitions to 12 component library entries that currently lack them, and migrates 2 components (Slider, CardSelector) from hand-built inline controller panels to the declarative system. The goal is full coverage of the controller panel system across the component library, ensuring every component demo can be interactively configured via the standardised `ControlsPanel`.

The declarative system works as follows:
1. Each component entry in `componentRegistry` defines a `propControls` array of `PropDefinition` objects
2. `ComponentDemoView` calls `useControlValues(entry.propControls)` to initialise state from defaults
3. The `ControlsPanel` renders the appropriate control widgets based on `controlType`
4. The current values are spread as props onto the demo component: `<DemoComponent {...values} />`
5. The demo component accepts these props and renders the component preview accordingly

After this work, all 12 components will follow this pattern, eliminating inline controllers and providing a consistent UX across the library.

## Architecture

The architecture is additive — no new systems are introduced. The work extends the existing declarative controller pattern to uncovered components.

```mermaid
graph TD
    A[componentRegistry.tsx] -->|propControls array| B[useControlValues hook]
    B -->|values, setValue, resetAll| C[ControlsPanel]
    B -->|{...values}| D[DemoComponent]
    C -->|onChange callbacks| B
    D -->|renders| E[Live Preview]
    
    subgraph "Existing Infrastructure (unchanged)"
        A
        B
        C
    end
    
    subgraph "Modified (12 components)"
        D
    end
```

### Work Categories

| Category | Components | Effort |
|---|---|---|
| New propControls + demo refactor | Calendar, Checkbox, InputOTP, Label, RadioGroup, Textarea, Toggle, ToggleGroup, Form, SplitButton | Add `propControls` to registry, add props interface to demo |
| Migration from inline → declarative | Slider, CardSelector | Replace inline panel with `propControls`, refactor demo to accept props |

### Migration Strategy (Slider, CardSelector)

For the two migration targets:
1. Define equivalent `propControls` in the registry that replicate the inline panel's controls
2. Remove the inline controller JSX from the demo component
3. Add a props interface matching the control names
4. Render only the preview, driven by the incoming props
5. For complex interactions (CardSelector's per-card label/icon editing), use `renderControls` for the custom slot while keeping standard controls declarative

## Components and Interfaces

### PropDefinition (existing, unchanged)

```typescript
interface PropDefinition {
  name: string              // Prop key passed to demo component
  label: string             // Display label in controller panel
  controlType: ControlType  // Widget type (toggle, select, counter, etc.)
  defaultValue: ControlValue
  options?: PropOption[]    // For select/radio controls
  min?: number              // For counter/range/number
  max?: number
  step?: number
  section?: string          // Groups controls under a heading
  visibleWhen?: VisibleWhenCondition  // Conditional visibility
  prefix?: string           // For prefix-input control
  labels?: [string, string] // For button-pair control
  maxItems?: number         // For chip-array control
}
```

### Demo Component Props Pattern

Each demo component will accept an optional props interface:

```typescript
interface ComponentDemoProps {
  propName?: PropType  // Each prop matches a propControls[].name
}

export default function ComponentDemo({ propName, ...rest }: ComponentDemoProps) {
  const hasControls = propName !== undefined
  
  if (hasControls) {
    // Render single interactive preview driven by control values
    return <Component prop={propName} />
  }
  
  // Render full showcase (variants, sizes, states)
  return <div>...</div>
}
```

### New PropControls Definitions (Summary)

| Component | Controls | Sections |
|---|---|---|
| Calendar | mode (select), captionLayout (select), months (counter) | — |
| Checkbox | label (text), checked (toggle), disabled (toggle), indeterminate (toggle) | — |
| InputOTP | length (counter), showSeparator (toggle), disabled (toggle) | — |
| Label | text (text), required (toggle), disabled (toggle) | — |
| RadioGroup | optionCount (counter), orientation (select), disabled (toggle) | — |
| Slider | rangeMode (toggle), disabled (toggle), showTooltip (toggle), valuePosition (select), showSteps (toggle), stepCount (counter, visibleWhen), min (number), max (number) | General, Display, Range |
| Textarea | placeholder (text), rows (counter), disabled (toggle), readOnly (toggle) | — |
| Toggle | variant (select), size (select), pressed (toggle), disabled (toggle) | — |
| ToggleGroup | type (select), variant (select), itemCount (counter) | — |
| Form | fieldCount (counter), showDescriptions (toggle), validation (select) | — |
| CardSelector | cardCount (counter), rows (counter), maxWidth (range), disabled (toggle) | — |
| SplitButton | label (text), variant (select), size (select), optionCount (counter), disabled (toggle) | — |

## Data Models

### Control Type Selection (TFC Decision Rules)

The following rules from the steering document govern control type selection:

| Property Type | Control Type | Rationale |
|---|---|---|
| Binary on/off | `toggle` | Switch widget for boolean states |
| 3+ mutually exclusive options | `select` | Dropdown selector |
| Exactly 2 mutually exclusive options | `select` | Dropdown (segmented control not available in ControlsPanel) |
| Small integer with tight bounds | `counter` | −/n/+ stepper widget |
| Percentage or relative numeric | `range` | Slider with value display |
| Editable string | `text` | Text input |
| Integer with wider bounds | `number` | Number input with min/max |

### Section Grouping Rules

- Components with ≤3 controls: no sections needed
- Components with 4+ controls: group into logical sections
- Slider (8 controls): "General", "Display", "Range" sections
- Controls with `visibleWhen` conditions don't count toward the threshold

### Conditional Visibility

Used when a control is only relevant given another control's value:

```typescript
// Slider: stepCount only visible when showSteps is true
{ name: 'step-count', visibleWhen: { controlName: 'show-steps', values: [true] } }
```

### CardSelector Migration — renderControls Slot

CardSelector's per-card label/icon editing is too dynamic for pure declarative controls. The approach:
- Standard controls (cardCount, rows, maxWidth, disabled) → `propControls` array
- Per-card label/icon editors → `renderControls` function (custom slot)

This matches the existing pattern used by Stepper and SegmentedControl.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: PropControl Schema Conformance

*For any* component registry entry with propControls, every PropDefinition SHALL conform to the TFC decision rules: boolean defaultValues use controlType "toggle", controls with options arrays of length ≥ 3 use controlType "select", controls with controlType "counter" have min and max defined with max − min ≤ 10, and controls with controlType "range" have min and max defined.

**Validates: Requirements 1.4, 2.4, 3.4, 4.4, 5.4, 7.4, 8.4, 9.4, 10.4, 12.4, 14.1, 14.2, 14.3, 14.4, 14.5**

### Property 2: Demo Renders with Default Props

*For any* component registry entry that defines propControls, rendering the demo component with the default values (derived from each PropDefinition's defaultValue) SHALL not throw an error and SHALL produce a non-empty render output.

**Validates: Requirements 6.3, 11.3, 13.1, 13.2**

### Property 3: Counter-Driven Item Count

*For any* component with a counter control that semantically drives a rendered item count (option-count, field-count, card-count, item-count), rendering the demo with a randomly generated valid count within the counter's min/max bounds SHALL produce exactly that many corresponding DOM elements.

**Validates: Requirements 5.2, 9.3, 10.2, 11.4, 12.3**

### Property 4: Text Control Passthrough

*For any* component with a text-type control that drives visible text content (label, placeholder, primary label), rendering the demo with a randomly generated non-empty string SHALL produce output containing that exact string.

**Validates: Requirements 4.2, 7.2**

### Property 5: Conditional Visibility

*For any* PropDefinition with a `visibleWhen` condition, the `isVisible` function SHALL return false when the referenced control's value is NOT in the acceptable values list, and SHALL return true when it IS in the list.

**Validates: Requirements 6.5, 14.7**

### Property 6: Section Grouping Threshold

*For any* component registry entry with 4 or more propControls (excluding those with visibleWhen conditions), at least one PropDefinition SHALL have a non-empty `section` property defined.

**Validates: Requirements 14.6**

## Error Handling

This feature is purely additive UI configuration. Error scenarios are minimal:

| Scenario | Handling |
|---|---|
| Demo component receives undefined prop | Use default value via `??` or optional chaining — demo renders showcase mode |
| Counter value outside min/max | `useControlValues` doesn't enforce bounds; counter widget prevents out-of-range input |
| Invalid select option value | Select widget constrains to defined options; demo uses fallback |
| visibleWhen references non-existent control | `isVisible()` returns true (permanently visible) — existing behaviour |
| Missing propControls on registry entry | `ComponentDemoView` renders demo without controller panel — existing behaviour |

No new error boundaries or error states are needed. The existing `useControlValues` hook handles all state management edge cases (re-initialisation on navigation, hidden→visible resets).

## Testing Strategy

### Unit Tests (Example-Based)

- Verify each of the 12 components has propControls defined in the registry with expected control names
- Verify Slider and CardSelector demos no longer render inline controller panels
- Verify specific control interactions (range mode → dual thumbs, validation="error" → error messages)
- Verify `renderControls` slot renders for CardSelector's per-card editors

### Property Tests (fast-check)

Library: **fast-check** (already available in the project via Vitest)

Configuration: Minimum 100 iterations per property test.

| Property | Test File | Approach |
|---|---|---|
| P1: Schema Conformance | `prop-definition-schema.property.test.ts` (extend existing) | Generate/iterate all registry entries, validate TFC rules |
| P2: Demo Renders | `component-props-passed.property.test.tsx` (extend existing) | For each entry with propControls, render with defaults, assert no throw |
| P3: Counter Item Count | New: `counter-item-count.property.test.tsx` | Generate random counts within bounds, render, count DOM elements |
| P4: Text Passthrough | New: `text-control-passthrough.property.test.tsx` | Generate random strings via `fc.string()`, render, assert text present |
| P5: Conditional Visibility | `unified-controls-panel.property.test.ts` (extend existing) | Generate random values, test isVisible against visibleWhen conditions |
| P6: Section Grouping | `prop-definition-schema.property.test.ts` (extend existing) | Filter entries with 4+ controls, assert section presence |

### Existing Tests to Extend

The project already has property tests that validate the controller system:
- `prop-definition-schema.property.test.ts` — validates PropDefinition structure
- `component-props-passed.property.test.tsx` — validates props are passed to demos
- `controls-panel-count.property.test.tsx` — validates control count rendering
- `unified-controls-panel.property.test.ts` — validates panel behaviour

These should be extended to cover the 12 new entries rather than creating entirely new test files where possible.

### Tag Format

Each property test must include a comment referencing the design property:

```typescript
// Feature: component-controllers-expansion, Property 1: PropControl Schema Conformance
```

