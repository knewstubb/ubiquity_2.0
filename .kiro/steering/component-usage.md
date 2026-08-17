---
inclusion: always
---

# Component Library Usage Rules

## Source of Truth

The component library follows **Atomic Design** methodology with three tiers:

| Tier | Location | Purpose | Examples |
|------|----------|---------|----------|
| **Atoms** | `src/components/atoms/` | Indivisible UI primitives | Button, Input, Label, Badge, Checkbox |
| **Molecules** | `src/components/molecules/` | Combinations of atoms, generic | Chip, Combobox, DateRangePicker, SelectorCard |
| **Organisms** | `src/components/organisms/` | Domain-aware, business patterns | DataTable, FilterBuilder, Stepper, MetricCard |

When a component is used anywhere in the app, it MUST look and function identically to how it appears in the library demo.

## Classification Rules

- **Atoms** — Cannot be broken down further. Wraps a single HTML element or Radix primitive with styling.
- **Molecules** — Combines multiple atoms into a reusable, generic pattern. No domain knowledge.
- **Organisms** — Aware of business domain. May contain molecules/atoms. Implements feature-specific patterns.

## Rules

### 1. No className overrides that conflict with base styles

When using a library component, do NOT override its built-in styling with className props that change:
- Font size (the component defines its own text size)
- Padding/spacing (the component defines its own internal spacing)
- Border radius (the component defines its own radius)
- Colours (use the component's variant system, not raw colour classes)

**Allowed:** Adding layout classes that don't conflict (e.g. `className="mt-4"` for external spacing).

**Not allowed:** `className="text-sm px-2 rounded-lg"` when the component already defines these.

### 2. Use variants, not className hacks

If a component needs to look different in a specific context, add a variant to the component itself — don't override with className. This ensures the library demo shows all possible states.

### 3. Active/selected states belong in the component

If a component needs an "active" state (like nav items), add it as a prop or variant to the component, not as a conditional className override at the usage site.

### 4. The demo IS the spec

If the component demo doesn't show a particular state or configuration, that state doesn't exist. Add it to the component and demo first, then use it in the app.

### 5. Import from the correct tier

```tsx
// Atoms
import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'

// Molecules
import { Chip } from '@/components/molecules/chip'
import { SelectorCard } from '@/components/molecules/selector-card'

// Organisms
import { DataTable } from '@/components/organisms/data-table'
import { ModalFilterBuilder } from '@/components/organisms/filter-builder'
```

## Highlighter Debug Tool

Enable component highlighting by adding `data-highlighter="on"` to the `<html>` element:

| Tier | Outline Colour |
|------|----------------|
| Atoms | Teal (primary) |
| Molecules | Blue (#3B82F6) |
| Organisms | Purple (#8B5CF6) |

Hover reveals component name tooltip. Nested components show on hover.

## Enforcement

When reviewing code that uses library components:
1. Check if any className prop overrides the component's base styles
2. If it does, the fix is to update the component (add a variant/prop) not to override at the usage site
3. The component library demo must always reflect the full range of how the component is used in the app
4. Verify imports use the correct tier path (`atoms/`, `molecules/`, `organisms/`)
