---
inclusion: manual
---

# Controller Panel Pattern

Use this pattern when building interactive controllers for component demos in the component library.

## Container

```
bg-secondary rounded-lg p-4
```

- No border (fill contrast is sufficient)
- Width: `w-56` (224px) for narrow panels, `w-64` (256px) when text inputs are needed
- Position: right side of the preview frame, `shrink-0 ml-auto`
- Use `items-stretch` on the parent flex so panel and preview match height

## Typography Hierarchy — Two Levels

Controller panels use TWO distinct text sizes to create visual hierarchy:

### Level 1 — Section Headers (14px)

```
text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1.5
```

- Used for: group headings that label a section of controls (e.g. "GENERAL", "LAYOUT", "CONTENT")
- Size: `text-sm` = 14px, weight: `font-bold` (700)
- Rendered as `<h4>` in ControlsPanel
- Gap after header: `mb-1.5` (6px)
- Dynamic values allowed: "MAX WIDTH — 100%", "STEP 2 OF 4"
- Format: `{LABEL} — {value}` (em dash, not hyphen)
- Horizontal dividers (`border-t border-border pt-3 mt-3`) between visually distinct sections

### Level 2 — Field Labels (10px)

```
text-[10px] font-semibold text-muted-foreground uppercase tracking-wider
```

- Used for: individual control labels within a section (e.g. "MODE", "SHOW USED IN", "SECTION SPACING")
- Size: `text-[10px]` = 10px — the smaller label for each control
- Rendered as `<Label>` inside each control component
- These sit INSIDE the control components (TextControl, SelectControl, ToggleControl, etc.)

### Why Two Sizes Matter

The 4px difference (14px vs 10px) creates a clear parent-child relationship:
- Section headers are scannable group titles — you read them to find the right section
- Field labels are subordinate — they describe individual controls within that section
- Without this distinction, the panel becomes a flat list with no visual grouping

### "General" Header Rule

- "General" is used as a fallback label for the first ungrouped section ONLY when other named sections exist
- Never show "General" more than once
- If ALL controls are ungrouped (no sections defined at all), don't show any section header — the controls render without a heading

## Spacing Rhythm

| Gap | Value | Where |
|---|---|---|
| Panel padding | `p-4` (16px) | Container |
| Between sections | `space-y-4` (16px) | Parent wrapper |
| Header → first control | `mb-1.5` (6px) | Section header |
| Between toggle/counter rows | `space-y-2` (8px) | Within section |
| Between inputs/selects | `space-y-1.5` (6px) | Within section |
| Section divider | `pt-3 mt-3 border-t border-border` | Between sections |
| Special footer section | `mt-3 pt-3 border-t border-border` | Bottom |

## Control Types

| Control | Use When | Layout |
|---|---|---|
| Switch | Binary on/off | Label left, Switch right, `flex items-center justify-between` |
| Select (dropdown) | 3+ mutually exclusive options | Full-width below header, `h-8 text-sm` |
| Segmented control | Exactly 2 mutually exclusive options | Full-width, use SegmentedControl component |
| Text input | Editable strings | Full-width, `h-8 text-sm` — use `<Input>` component |
| Range slider | Relative numeric value (%, opacity) | Full-width, show value in header |
| Counter (−/n/+) | Small integer with tight bounds (1–5) | Label left, buttons right |
| Counter (green/active) | Value that both enables AND increases (e.g. "0 = off, 1+ = on") | Same as counter but value text turns `text-primary` when value > 0 |
| Button pair | Demo navigation (Back/Next) | Full-width row, `flex gap-2` |
| Colour picker | Colour value | Select dropdown with token colour options and colour swatch |

### Control Type Rules

- **Never use radio buttons in controller panels.** Use a dropdown selector for 3+ options, or a segmented control for exactly 2 options. Note: `RadioControl` exists as a valid library component for use in forms/features — it's just not used in controller panels.
- **Counter (active variant):** Use `variant="active"` on `CounterControl` when the value both turns something on AND controls its magnitude (e.g. 0 = disabled, 1+ = active count). The `text-primary` highlight on the value signals "this is active."
- **Counter (default):** Use when the value is purely numeric and doesn't represent an on/off state.

## Component Reuse Rule — CRITICAL

Before adding any UI element to a controller panel (or anywhere in the prototype), **always check if a component already exists** in `src/components/ui/` or `src/components/composed/`.

- Use `<Input>` from `@/components/ui/input` — never raw `<input>`
- Use `<Select>` from `@/components/ui/select` — never raw `<select>`
- Use `<Switch>` from `@/components/ui/switch` — never raw checkboxes for toggles
- Use `<Button>` from `@/components/ui/button` — never raw `<button>` with manual styling
- Use `<Label>` from `@/components/ui/label` — never raw `<label>`

This ensures consistent styling, hover states, focus rings, and dark mode behaviour across the entire system. If a component doesn't exist for the use case, build one — don't inline raw HTML.

## Label Strategy — Prefix-First

Controller panels are narrow (224–256px). To save vertical space, **prefer a prefix inside the input over a standalone label above it**.

### Prefix inputs have NO field label

When using `prefix-input`, the prefix IS the label. Do not render a standalone field label above it — the prefix provides all the context needed. This eliminates one line of vertical space per field.

### When to use prefix vs standalone label

1. **Prefix (default for subordinate fields):** If the text input is contextually subordinate to a toggle or control above it (e.g. the toggle says "Show X" and the text field is "X Label"), use `prefix-input` with a short prefix like "Label". The toggle already provides context — a standalone label is redundant.
2. **Switch-revealed fields need NO label at all:** If a text field is only visible because a switch is on (has `visibleWhen`), the switch itself provides all the context. Render the text input with no label — just a placeholder. The switch says "Show Primary" → the revealed text field is obviously the primary button's label.
3. **Standalone label:** If the field is the only control in its context, or needs its own identity because no parent control gives it context, use a standalone Level 2 label above it.
4. **Prefix text must be SHORT** (1–2 words max): "Label", "Text", "URL", "Min", "Max", "Prefix", "Suffix"
5. **Select controls in a named section**: Use `inline` mode — the label shows as a prefix inside the trigger (e.g. "Width: Default", "Align: Center"). The section header already provides context, so a standalone label above the select is redundant.

### Example — Popover Buttons section

```
Toggle: "Show Primary"
  └── PrefixInput: [Label |___Apply___]    ← prefix "Label", no standalone header

Toggle: "Show Secondary"
  └── PrefixInput: [Label |___Cancel__]    ← same pattern
```

NOT:
```
Toggle: "Show Primary"
  LABEL: "PRIMARY LABEL"              ← redundant standalone header
  TextInput: [___Apply___]
```

### Full rules

- **Text inputs subordinate to a toggle**: Use `prefix-input` with a short prefix — no standalone label needed
- **Grouped text inputs** (multiple related fields like Prefix/Suffix): Use `prefix-input` instead of a separate label above each field
  - Prefix treatment: grey background zone on the left of the input (`bg-muted px-2 border-r border-input self-stretch flex items-center text-xs text-muted-foreground`)
  - Example: `[Prefix |___________]` instead of a label "PREFIX" above the input
- **Standalone text inputs** (no parent toggle giving context): Use the Level 2 label pattern — `text-[10px] font-semibold text-muted-foreground uppercase tracking-wider`
- **Text inputs**: Do NOT show the current value as a tip on the right side. The input itself shows the value.
- **Toggle rows**: Label is inline with the switch — no separate header needed per toggle
- **Select controls**: Always use a section header above (they need the context)

## Layout Rules

- **Always single column** for sidebar panels (≤280px wide)
- Never use grid-cols-2 in a narrow sidebar — it compresses controls
- Two-column only acceptable for full-width strips below the preview (toggle rows only)

## Special Sections

### "Used in" links
- Position: bottom of panel
- Treatment: `mt-3 pt-3 border-t border-border`
- Label: `text-[10px] font-semibold text-muted-foreground uppercase tracking-wider`
- Links: `text-xs text-primary hover:underline`

### Reset button
- Position: **bottom of panel**, always visible
- Treatment: secondary variant, full-width, `h-8 text-xs`
- Always rendered — disabled when state matches defaults, enabled when dirty
- No "Controls" header at the top of the panel

## Preview Frame

The component preview sits to the left of the controller:

```
flex gap-4 items-stretch
├── Preview frame: flex-1 min-w-0 border border-border rounded-lg
│   └── Component centred: flex items-center justify-center p-8
└── Controller: w-56/w-64 shrink-0 ml-auto bg-secondary rounded-lg p-4
```

- Preview frame uses `items-center justify-center` to centre the component
- Use `p-0 overflow-hidden` on the frame when the component is full-width (e.g. page header)
- Both frame and controller stretch to match the taller element (`items-stretch` on parent)
