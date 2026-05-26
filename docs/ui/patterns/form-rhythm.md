# Form Rhythm Pattern

> **Last updated:** 2026-05-21
> **Applies to:** All modals, sheets, and panels with sectioned forms

## The Three-Tier System

Every form in UbiQuity uses three levels of vertical spacing:

```
┌─────────────────────────────────────┐
│  Section Heading (uppercase, muted) │  ← 20-24px above (inter-section)
│                                     │
│  Label                              │  ← 8px below (intra-field)
│  [Input field]                      │
│                                     │  ← 12px below (inter-field)
│  Label                              │
│  [Input field]                      │
│                                     │
│─────────────────────────────────────│  ← border separator
│                                     │  ← 20-24px (inter-section)
│  Section Heading                    │
│                                     │
│  Label                              │
│  [Input field]                      │
└─────────────────────────────────────┘
```

| Tier | Gap | Tailwind | Purpose |
|------|-----|----------|---------|
| Intra-field | 8px | `space-y-2` | Label → input (they're one unit) |
| Inter-field | 12px | `space-y-3` | Field → field within a section |
| Inter-section | 20–24px | `pt-5` / `pt-6` | Section → section (with visual break) |

## Section Anatomy

### General section (always first)
```tsx
<div className="space-y-4 pb-5 border-b border-border">
  {/* Name, description, identity fields */}
</div>
```

### Subsequent sections
```tsx
<div className="pt-5 space-y-4">
  <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
    Section Heading
  </h4>
  {/* Fields */}
</div>
```

### Terminal action row (e.g. "Test Connection")
```tsx
<div className="pt-4 border-t border-border">
  {/* Action button + status indicator */}
</div>
```

## Modal Container

```tsx
<div className="px-6 py-5">
  {/* Sections — NO uniform space-y on this container */}
</div>
```

The outer container has padding but no `space-y`. Each section manages its own internal spacing. This prevents the three-tier system from being overridden by a single gap value.

## Footer

```tsx
<DialogFooter className="gap-3">
  <Button variant="ghost">Cancel</Button>
  <Button>Create</Button>
</DialogFooter>
```

## Design Decisions

1. **No uniform `space-y` on form containers** — a single value can't express three tiers. Sections own their own rhythm.

2. **Headings belong to their content** — tight gap below (12px via `mb-3`), generous gap above (20–24px via `pt-5`). The heading is visually grouped with what follows, not what precedes.

3. **Borders as section breaks** — `border-b` between the general section and the first typed section. This makes the hierarchy scannable without relying on whitespace alone.

4. **Grey background boxes for credentials** — authentication/sensitive sections use `bg-muted rounded-lg p-4` to visually group related fields and signal "this is different."

5. **Consistent across all modals** — whether it's CreateConnectionModal, ImporterWizard, or AutomationSettings, the rhythm is identical. Users build spatial memory.
