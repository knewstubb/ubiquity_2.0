# Design Document: Unified Controls Panel

## Overview

This design extends the existing component library controls system from 7 control types to 11, adds section grouping, conditional visibility, and a custom render slot — all while preserving the current declarative pipeline that already works for Button, Switch, and Badge demos.

The key insight is that the existing architecture (`PropDefinition` → `useControlValues` → `ControlsPanel` → `DemoComponent`) is sound. We're widening the type system and adding two orthogonal features (sections, visibility conditions) without changing the fundamental data flow.

### Design Decisions

1. **Extend, don't replace** — The existing `PropDefinition` interface gains optional fields; no breaking changes to current entries.
2. **Array values in state** — `useControlValues` currently stores `Record<string, string | number | boolean>`. We widen the value union to include `string[]` for chip-array controls.
3. **Visibility is a render concern** — Hidden controls are excluded from the props passed to the demo, but their definitions remain in the array. The hook handles exclusion; the panel handles show/hide.
4. **renderControls as escape hatch** — Complex demos (Stepper label editors, SegmentedControl indexed inputs) use a function slot rather than forcing every pattern into the type system.

## Architecture

```mermaid
flowchart TD
    subgraph Registry ["componentRegistry.ts"]
        CE[ComponentEntry]
        PD[PropDefinition[]]
        RC[renderControls?]
    end

    subgraph Hook ["useControlValues"]
        INIT[Initialise from defaults]
        VIS[Evaluate visibleWhen]
        STATE[values record]
        DIRTY[isDirty computation]
    end

    subgraph Panel ["ControlsPanel"]
        SEC[Section grouping]
        COND[Conditional rendering]
        CTRL[Control components]
        SLOT[renderControls slot]
        USED[Used-in links]
    end

    subgraph Demo ["DemoComponent"]
        PREVIEW[Preview render]
    end

    CE --> PD
    CE --> RC
    PD --> INIT
    INIT --> STATE
    STATE --> VIS
    VIS -->|visible values only| PREVIEW
    STATE --> DIRTY
    PD --> SEC
    SEC --> COND
    COND --> CTRL
    RC --> SLOT
    CE -->|usedIn| USED
```

### Data Flow

1. `ComponentEntry.propControls` defines the control schema
2. `useControlValues` initialises state from defaults, tracks dirty, handles reset
3. `ControlsPanel` groups controls by section, evaluates `visibleWhen`, renders controls
4. Visible control values are passed as props to `DemoComponent`
5. `renderControls` (if provided) receives the full values record and setValue function

## Components and Interfaces

### Extended PropDefinition

```typescript
export type ControlType =
  | 'text' | 'select' | 'toggle' | 'colour'
  | 'number' | 'range' | 'radio'
  | 'prefix-input' | 'chip-array' | 'button-pair' | 'counter'

export interface VisibleWhenCondition {
  controlName: string
  values: (string | number | boolean)[]
}

export interface PropDefinition {
  name: string
  label: string
  controlType: ControlType
  defaultValue: string | number | boolean | string[]
  options?: PropOption[]
  min?: number
  max?: number
  step?: number
  // New fields
  section?: string          // max 40 chars, groups controls under a header
  visibleWhen?: VisibleWhenCondition
  prefix?: string           // required for 'prefix-input' type
  labels?: [string, string] // required for 'button-pair' type
  maxItems?: number         // required for 'chip-array' type
}
```

### Extended ComponentEntry

```typescript
export type ControlValue = string | number | boolean | string[]

export interface ComponentEntry {
  name: string
  slug: string
  category: ComponentCategory
  description: string
  component: LazyExoticComponent<ComponentType>
  propControls?: PropDefinition[]
  usedIn?: UsedInLink[]
  renderControls?: (
    values: Record<string, ControlValue>,
    setValue: (name: string, value: ControlValue) => void
  ) => ReactNode
}
```

### Extended useControlValues Hook

```typescript
export type ControlValue = string | number | boolean | string[]

export interface UseControlValuesReturn {
  values: Record<string, ControlValue>
  setValue: (name: string, value: ControlValue) => void
  resetAll: () => void
  isDirty: boolean
}
```

**Behaviour changes:**
- `buildDefaults` handles `string[]` default values
- `isDirty` uses deep equality (element-by-element) for array values
- When `visibleWhen` condition is not met, the control's value is excluded from the returned `values` record
- When a hidden control becomes visible again, its value resets to `defaultValue`

### New Control Components

| Component | File | Props |
|---|---|---|
| `PrefixInputControl` | `controls/PrefixInputControl.tsx` | `value: string`, `onChange`, `label`, `prefix: string` |
| `ChipArrayControl` | `controls/ChipArrayControl.tsx` | `value: string[]`, `onChange`, `label`, `maxItems: number` |
| `ButtonPairControl` | `controls/ButtonPairControl.tsx` | `value: number \| string`, `onChange`, `label`, `labels: [string, string]`, `min?`, `max?`, `step?`, `options?` |
| `CounterControl` | `controls/CounterControl.tsx` | `value: number`, `onChange`, `label`, `min`, `max`, `step` |

### ControlsPanel Changes

The panel gains three responsibilities:

1. **Section grouping** — Groups controls by `section` value, renders section headers, preserves order
2. **Conditional visibility** — Evaluates `visibleWhen` against current values, hides/shows controls
3. **Custom slot** — Renders `renderControls` output after declarative controls

```typescript
interface ControlsPanelProps {
  propControls: PropDefinition[]
  values: Record<string, ControlValue>
  onChange: (name: string, value: ControlValue) => void
  onReset: () => void
  isDirty: boolean
  usedIn?: UsedInLink[]
  renderControls?: (
    values: Record<string, ControlValue>,
    setValue: (name: string, value: ControlValue) => void
  ) => ReactNode
}
```

## Data Models

### Section Grouping Algorithm

```
Input: PropDefinition[]
Output: Array<{ section: string | null, controls: PropDefinition[] }>

1. Collect ungrouped controls (no section) → first group with section = null
2. For each control with a section:
   a. If section already seen → append to existing group
   b. If section is new → create new group, order = first occurrence position
3. Return [ungrouped, ...sectioned groups in first-occurrence order]
```

### Visibility Evaluation

```
Input: PropDefinition, values: Record<string, ControlValue>
Output: boolean (visible or not)

1. If no visibleWhen → visible
2. If visibleWhen.controlName not in propControls array → visible (treat as permanently visible)
3. Get current value of referenced control from values record
4. Return visibleWhen.values.includes(currentValue)
```

### Value Exclusion for Hidden Controls

The hook maintains the full internal state but exposes a filtered `values` record:

```
exposedValues = Object.fromEntries(
  propControls
    .filter(ctrl => isVisible(ctrl, internalValues))
    .map(ctrl => [ctrl.name, internalValues[ctrl.name]])
)
```

When a control transitions from hidden → visible, its internal value resets to `defaultValue`.

### Width Determination

```
hasTextInput = propControls.some(p =>
  p.controlType === 'text' || p.controlType === 'prefix-input'
)
panelWidth = hasTextInput ? 'w-64' : 'w-56'
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Bounded numeric controls never exceed configured range

*For any* button-pair or counter control with configured min, max, and step values, and *for any* sequence of increment/decrement operations starting from any value within [min, max], the resulting value SHALL always remain within [min, max] inclusive.

**Validates: Requirements 1.4, 1.5, 1.9**

### Property 2: Chip-array never exceeds maxItems

*For any* chip-array control with a configured maxItems limit, and *for any* sequence of add operations, the resulting array length SHALL never exceed maxItems.

**Validates: Requirements 1.8**

### Property 3: Section grouping preserves order and merges correctly

*For any* array of PropDefinitions with arbitrary section assignments, the grouping algorithm SHALL produce groups where: (a) ungrouped controls appear first in declaration order, (b) sectioned groups appear in first-occurrence order, (c) all controls within a group share the same section value, and (d) relative declaration order is preserved within each group.

**Validates: Requirements 2.2, 2.4, 2.5**

### Property 4: Visibility evaluation matches condition semantics

*For any* PropDefinition with a visibleWhen condition, and *for any* current values record: the control is visible if and only if the referenced control's current value is included in the visibleWhen.values array, OR the referenced controlName does not exist in the PropDefinition array (permanently visible).

**Validates: Requirements 3.2, 3.3, 3.5, 3.6**

### Property 5: Hidden-to-visible transition resets value to default

*For any* control with a visibleWhen condition that transitions from hidden to visible (the referenced control's value changes to match), the control's value SHALL equal its configured defaultValue immediately after becoming visible.

**Validates: Requirements 3.4**

### Property 6: Initialisation produces correct defaults record

*For any* array of PropDefinitions, the initial values record produced by useControlValues SHALL contain exactly one entry per PropDefinition, keyed by name, with value equal to defaultValue (using value equality for primitives and element-by-element equality for arrays).

**Validates: Requirements 4.1, 4.7, 4.8**

### Property 7: Reset is a round-trip to defaults

*For any* array of PropDefinitions and *for any* sequence of setValue operations, calling resetAll SHALL produce a values record identical to the initial defaults, and isDirty SHALL be false.

**Validates: Requirements 4.3**

### Property 8: isDirty correctly reflects value divergence

*For any* array of PropDefinitions and *for any* values record, isDirty SHALL be true if and only if at least one value differs from its corresponding defaultValue, using strict equality for primitives and element-by-element comparison for string arrays.

**Validates: Requirements 4.4, 4.8**

### Property 9: Navigation re-initialises state from new definitions

*For any* two distinct PropDefinition arrays, when the hook transitions from the first to the second (propControls reference changes), the resulting values record SHALL equal the defaults derived from the second array, and isDirty SHALL be false.

**Validates: Requirements 4.6**

## Error Handling

### Invalid PropDefinition Configuration

| Scenario | Behaviour |
|---|---|
| `select`/`radio` with empty or missing `options` | Console warning in development; control renders as disabled with "No options" placeholder |
| `range`/`number`/`counter` with missing `min`/`max`/`step` | Falls back to `min=0, max=100, step=1` with console warning |
| `prefix-input` with missing `prefix` | Renders as standard text input (no prefix zone) with console warning |
| `chip-array` with missing `maxItems` | Defaults to `maxItems=10` with console warning |
| `button-pair` with missing `labels` | Renders as `["−", "+"]` with console warning |
| `visibleWhen` references non-existent control | Control treated as permanently visible (per Requirement 3.6) |
| `section` string exceeds 40 characters | Truncated to 40 characters |
| `renderControls` throws during render | Error boundary catches; panel renders declarative controls only |

### State Edge Cases

| Scenario | Behaviour |
|---|---|
| `propControls` is `undefined` or empty array | Hook returns `{ values: {}, isDirty: false }`; panel not rendered |
| `chip-array` add when at `maxItems` | Add button disabled; no state change |
| `counter`/`button-pair` at bounds | Corresponding button disabled; no state change |
| Multiple controls reference same `visibleWhen.controlName` | Each evaluated independently |
| Circular `visibleWhen` references | Not supported; both controls treated as visible (no cycle detection needed since visibility is evaluated against current values, not other visibility states) |

## Testing Strategy

### Property-Based Tests (fast-check)

The project already uses `fast-check` for property-based testing (visible in existing `src/__tests__/*.property.test.ts` files). Each correctness property maps to a single property-based test with minimum 100 iterations.

**Library:** `fast-check` (already installed)
**Runner:** Vitest (already configured)
**Location:** `src/__tests__/unified-controls-panel.property.test.ts`

| Property | Test Focus | Generator Strategy |
|---|---|---|
| 1: Bounds enforcement | `buttonPairStep` / `counterStep` functions | Random min/max/step within reasonable ranges, random starting value within bounds, random sequence of inc/dec operations |
| 2: Chip maxItems | `addChip` function | Random string arrays (0–20 items), random maxItems (1–10), random add sequences |
| 3: Section grouping | `groupBySection` function | Random PropDefinition arrays (1–20 items) with random section assignments (some null, some shared) |
| 4: Visibility evaluation | `isVisible` function | Random PropDefinitions with visibleWhen conditions, random values records, some with non-existent controlNames |
| 5: Hidden→visible reset | `useControlValues` hook | Random PropDefinitions with visibleWhen, simulate value changes that toggle visibility |
| 6: Initialisation | `buildDefaults` function | Random PropDefinition arrays with mixed types including string[] defaults |
| 7: Reset round-trip | `useControlValues` hook | Random PropDefinitions, random setValue sequences, then resetAll |
| 8: isDirty | `computeIsDirty` function | Random defaults record, random current values (some matching, some not, including array comparisons) |
| 9: Navigation | `useControlValues` hook | Two random PropDefinition arrays, simulate transition |

**Tag format:** Each test tagged with `// Feature: unified-controls-panel, Property {N}: {title}`

### Unit Tests (example-based)

**Location:** `src/__tests__/unified-controls-panel.test.tsx`

| Area | Tests |
|---|---|
| Control rendering | Each of the 11 control types renders correctly with valid props |
| PrefixInputControl | Prefix text displayed, input editable, value updates on change |
| ChipArrayControl | Chips render, dismiss removes chip, add appends chip, add disabled at maxItems |
| ButtonPairControl | Labels displayed, increment/decrement work, disabled at bounds |
| CounterControl | −/value/+ layout, step applied, disabled at bounds |
| Section headers | Correct CSS classes applied, uppercase text |
| Panel width | w-64 when text/prefix-input present, w-56 otherwise |
| renderControls slot | Renders after declarative controls, null returns nothing |
| Used-in links | Links render with correct labels, navigate on click |
| Conditional visibility | Control hidden/shown based on referenced value |

### Integration Tests

| Area | Tests |
|---|---|
| Full pipeline | ComponentDemoView renders preview + panel, value changes propagate to demo |
| Navigation | Switching components re-initialises controls |
| Reset button | Visible when dirty, hidden when clean, restores defaults on click |
| Client-side routing | Used-in links navigate without page reload |

