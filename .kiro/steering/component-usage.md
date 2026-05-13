---
inclusion: always
---

# Component Library Usage Rules

## Source of Truth

The component library (`src/components/ui/` and `src/components/composed/`) is the single source of truth for component styling and behaviour. When a component is used anywhere in the app, it MUST look and function identically to how it appears in the library demo.

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

## Enforcement

When reviewing code that uses library components:
1. Check if any className prop overrides the component's base styles
2. If it does, the fix is to update the component (add a variant/prop) not to override at the usage site
3. The component library demo must always reflect the full range of how the component is used in the app
